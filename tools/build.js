#!/usr/bin/env node
/* ============================================================
   빌드: src/ → index.html (단일 파일)
   - 검색 키워드 · 체크포인트 · 기록부 정답 · 비밀번호를 해시로 바꾼다
   - 보호 글 본문은 비밀번호로 암호화한다
   - 데이터 사이의 참조(카드·연표·메일·장면·링크)를 검사한다
   - 출력물에 가나·한자가 한 글자라도 있으면 실패한다
   사용: node tools/build.js [--stats]
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');

// 엔진과 같은 정규화·해시 코드를 그대로 쓴다
const hashSrc = read('hash.js');
const ctx = { TextEncoder, TextDecoder, atob, btoa };
vm.createContext(ctx);
vm.runInContext(hashSrc + '\nthis.H=H;this.HR=HR;this.encStr=encStr;this.decStr=decStr;this.norm=norm;', ctx);
const { H, HR, encStr, decStr, norm } = ctx;

const common = require(path.join(SRC, 'data/common.js'));
const scenes = require(path.join(SRC, 'data/scenes.js'));
const chapters = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'].map(n => require(path.join(SRC, 'data', n + '.js')));

const errors = [];
const warn = [];
const err = m => errors.push(m);

/* ---------- 색인 (검사용) ---------- */
const pageIds = new Set(), tlIds = new Set(), mailIds = new Set(), threadIds = new Set(), accIds = new Set();
const peopleIds = new Set(common.people.map(p => p.id));
const APPS = ['search', 'mail', 'record', 'timeline', 'checkpoint', 'memo', 'hint', 'nana', 'video', 'sns', 'phone', 'final'];
chapters.forEach(ch => {
  (ch.searchPages || []).forEach(p => { if (pageIds.has(p.id)) err('중복 페이지 id: ' + p.id); pageIds.add(p.id); });
  (ch.timeline || []).forEach(t => { if (tlIds.has(t.id)) err('중복 연표 id: ' + t.id); tlIds.add(t.id); });
  (ch.mails || []).forEach(m => { if (mailIds.has(m.id)) err('중복 메일 id: ' + m.id); mailIds.add(m.id); });
  (ch.threads || []).forEach(t => threadIds.add(t.id));
  (ch.accounts || []).forEach(a => accIds.add(a.era + ':' + a.id.toLowerCase()));
});
(common.extraMails || []).forEach(m => mailIds.add(m.id));

function checkFx(f, where) {
  if (!f) return;
  (f.cards || []).forEach(c => peopleIds.has(c) || err(where + ': 없는 인물 카드 ' + c));
  (f.timeline || []).forEach(t => tlIds.has(t) || err(where + ': 없는 연표 ' + t));
  (f.mails || []).forEach(m => mailIds.has(m) || err(where + ': 없는 메일 ' + m));
  (f.apps || []).forEach(a => APPS.includes(a) || err(where + ': 없는 앱 ' + a));
}
function checkMarkup(s, where) {
  if (!s) return;
  s.replace(/\[\[photo:([\w\-]+)\|/g, (_, id) => { if (!scenes[id]) err(where + ': 없는 장면 ' + id); });
  s.replace(/\[\[page:([\w\-]+)\|/g, (_, id) => { if (!pageIds.has(id)) err(where + ': 없는 페이지 링크 ' + id); });
  s.replace(/\[\[thread:([\w\-]+)\|/g, (_, id) => { if (!threadIds.has(id)) err(where + ': 없는 스레드 ' + id); });
  s.replace(/\[\[sns:(\d{4}):(\w+)\|/g, (_, e, id) => { if (!accIds.has(e + ':' + id.toLowerCase())) err(where + ': 없는 계정 ' + e + ':' + id); });
}

/* ---------- 변환 ---------- */
const keyOwner = {}; // 같은 해시가 서로 다른 탭(웹/아카이브)에 겹치는지 확인
chapters.forEach((ch, ci) => {
  checkFx(ch.start, ch.id + '.start');
  (ch.unlocks || []).forEach(a => APPS.includes(a) || err(ch.id + ': 없는 앱 ' + a));
  if (ch.gate) { ch.gate.tripKey = H(ch.gate.key); delete ch.gate.key; }
  (ch.searchPages || []).forEach(p => {
    const where = ch.id + '/' + p.id;
    p.keys = Array.from(new Set((p.k || []).map(H)));
    p.keys.forEach(k => { (keyOwner[k] = keyOwner[k] || []).push(p.id); });
    delete p.k;
    checkFx(p.fx, where); checkMarkup(p.body, where);
    if (p.lock) {
      checkFx(p.lock.fx, where + '.lock'); checkMarkup(p.lock.body, where + '.lock');
      const enc = encStr(p.lock.body, p.lock.pw);
      if (decStr(enc, p.lock.pw) !== p.lock.body) err(where + ': 암호화 왕복 실패');
      p.lock = { pw: H(p.lock.pw), hint: p.lock.hint, fx: p.lock.fx, enc };
    }
  });
  (ch.threads || []).forEach(t => { checkFx(t.fx, ch.id + '/' + t.id); if (t.guilt) checkFx(t.guilt.fx, ch.id + '/' + t.id + '.guilt'); });
  (ch.accounts || []).forEach(a => checkFx(a.fx, ch.id + '/@' + a.id));
  (ch.posts || []).forEach(p => {
    if (!accIds.has(p.era + ':' + p.by.toLowerCase())) err(ch.id + ': 게시물 작성자 없음 ' + p.by);
    if (p.scene && !scenes[p.scene]) err(ch.id + ': 게시물 장면 없음 ' + p.scene);
    checkFx(p.fx, ch.id + '/post ' + p.by + ' ' + p.d);
  });
  (ch.mails || []).forEach(m => { checkFx(m.fx, ch.id + '/' + m.id); (m.attach || []).forEach(a => { if (a.type === 'photo' && !scenes[a.scene]) err(m.id + ': 첨부 장면 없음'); }); });
  (ch.videos || []).forEach(v => {
    v.segments.forEach(s => scenes[s.scene] || err(v.id + ': 장면 없음 ' + s.scene));
    (v.events || []).forEach(e => checkFx(e.fx, v.id + '/' + e.id));
    Object.keys(v.users).forEach(u => checkFx(v.users[u].fx, v.id + '/user ' + u));
    checkMarkup(v.info, v.id);
  });
  (ch.timeline || []).forEach(t => { if (!/^\d{4}(-\d\d(-\d\d( \d\d:\d\d)?)?)?$/.test(t.t)) err('연표 시각 형식: ' + t.id + ' ' + t.t); });
  if (ch.checkpoint) {
    checkFx(ch.checkpoint.onSolve, ch.id + '.checkpoint');
    ch.checkpoint.sentences.forEach(sn => sn.parts.forEach(pt => {
      if (typeof pt === 'string') return;
      const list = [].concat(pt.a);
      if (pt.type === 'choice') list.forEach(a => pt.opts.includes(a) || err(ch.id + ': 선택지에 없는 정답 ' + a));
      pt.ans = Array.from(new Set(list.map(H)));
      delete pt.a;
    }));
  }
  (ch.suggest || []).forEach(s => pageIds.has(s.page) || err(ch.id + ': 제안 페이지 없음 ' + s.page));
});
Object.keys(keyOwner).forEach(k => {
  const ids = keyOwner[k];
  const all = []; chapters.forEach(ch => (ch.searchPages || []).forEach(p => { if (ids.includes(p.id)) all.push(p); }));
  const kinds = new Set(all.map(p => !!p.archive));
  if (kinds.size > 1) warn.push('웹과 아카이브에 같은 키워드: ' + ids.join(', '));
});

const opt = common.options;
common.people.forEach(p => {
  const s = opt.status.indexOf(p.ans.s), w = opt.where.indexOf(p.ans.w), r = opt.role.indexOf(p.ans.r);
  if (s < 0 || w < 0 || r < 0) err('인물 정답이 선택지에 없음: ' + p.id);
  p.answers = Array.from(new Set(p.ans.names.map(n => HR(n, s, w, r))));
  delete p.ans;
});
common.phone.lock = H(common.phone.lockCode); delete common.phone.lockCode;
checkFx(common.phone.fx, 'phone');
(common.extraMails || []).forEach(m => checkFx(m.fx, m.id));
Object.keys(common.endings).forEach(k => checkFx(common.endings[k].after, 'ending ' + k));
if (!threadIds.has(common.endings.correction.thread)) err('진엔딩 스레드 없음');

// 힌트 3단계에는 정답이 들어 있으므로 소스에서 바로 읽히지 않게 감춘다
const HK = 'kengai-hint';
chapters.forEach(ch => (ch.hints || []).forEach(hh => { hh.h = hh.h.map(t => encStr(t, HK)); }));
common.people.forEach(pp => { pp.hint = pp.hint.map(t => encStr(t, HK)); });
const GAME_DATA = Object.assign({}, common, { scenes, chapters });

/* ---------- 조립 ---------- */
let engine = read('engine.js').replace('/*__HASH__*/', hashSrc);
const dataJs = '/* ============================================================\n   ③ GAME_DATA — 시나리오 데이터 (엔진과 분리)\n   정답·검색어·비밀번호는 정규화 후 해시값만 들어 있다.\n   ============================================================ */\nconst GAME_DATA = ' +
  JSON.stringify(GAME_DATA, null, 1).replace(/<\//g, '<\\/') + ';';
const html = read('template.html')
  .replace('/*__STYLE__*/', () => read('style.css'))
  .replace('/*__ENGINE__*/', () => engine)
  .replace('/*__DATA__*/', () => dataJs);

/* ---------- 일본어 문자 검사 ---------- */
const JP = /[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\uFF66-\uFF9F\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3001\u3002\u3005\u3006\u3012\u301C\u303B]/g;
const jpHits = [];
html.split('\n').forEach((line, i) => { const m = line.match(JP); if (m) jpHits.push((i + 1) + ': ' + m.join('') + ' … ' + line.trim().slice(0, 80)); });
if (jpHits.length) err('일본어 문자(가나·한자) 발견:\n  ' + jpHits.join('\n  '));

/* ---------- 정답 평문 노출 검사 ---------- */
['H210818', '0721', 'Xa9fQ2', '히나타쇼고', '기타무라하루카'].forEach(s => {
  // 정답 문자열이 본문 텍스트로 나오는 것은 괜찮지만, 정답 필드로 남아 있으면 안 된다
});
if (/"(a|k|ans)":\s*\[\s*"[^"]*[가-힣]/.test(dataJs) && /"a":/.test(dataJs)) err('평문 정답 필드(a)가 남아 있음');
if (/"lockCode"|"key":\s*"H2/.test(dataJs)) err('평문 비밀번호 필드가 남아 있음');

if (errors.length) { console.error('빌드 실패:\n- ' + errors.join('\n- ')); process.exit(1); }
warn.forEach(w => console.warn('경고: ' + w));
fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log('index.html 생성 — ' + (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB');

/* ---------- 통계 ---------- */
if (process.argv.includes('--stats')) {
  const raw = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'].map(n => { delete require.cache[require.resolve(path.join(SRC, 'data', n + '.js'))]; return require(path.join(SRC, 'data', n + '.js')); });
  const rows = [];
  raw.forEach(ch => {
    const pages = ch.searchPages || [];
    const kw = new Set(); pages.forEach(p => (p.k || []).forEach(k => kw.add(norm(k) + (p.archive ? '@a' : ''))));
    const webKw = new Set(); pages.filter(p => !p.archive).forEach(p => (p.k || []).forEach(k => webKw.add(norm(k))));
    const decoy = pages.filter(p => /_d_|_d\d|decoy/.test(p.id)).length;
    let res = 0; (ch.threads || []).forEach(t => { res += (t.res || '').split('\n').filter(l => l.includes('|')).length; });
    let posts = 0; (ch.posts || []).forEach(p => { posts += 1 + (p.rp || []).length; });
    let dm = 0; (ch.videos || []).forEach(v => { dm += (v.comments || '').split('\n').filter(l => l.includes('|')).length; });
    const pm = (ch.mails || []).filter(m => m.box).length;
    rows.push({ 장: ch.num, 검색어_웹: webKw.size, 검색어_전체: kw.size, 페이지: pages.length, 미끼: decoy, 아카이브: pages.filter(p => p.archive).length,
      숨김: pages.filter(p => p.hidden).length, 레스: res, SNS: posts, 탄막: dm, 폰메일: pm, 연표: (ch.timeline || []).length });
  });
  console.table(rows);
}
