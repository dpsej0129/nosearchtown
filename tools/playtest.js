#!/usr/bin/env node
/* ============================================================
   자동 플레이 테스트 — 처음부터 진엔딩까지 실제 UI로 진행한다.
   사용: node tools/playtest.js [스크린숏 폴더]
   (Playwright 필요. 스포일러가 들어 있으니 플레이 전에는 읽지 말 것)
   ============================================================ */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, '..', '.playtest');
fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.join(__dirname, '..', 'index.html');

let p, errs = [], step = 0;
const log = (...a) => console.log('·', ...a);
function assert(c, m) { if (!c) throw new Error('검증 실패: ' + m); }
const shot = n => p.screenshot({ path: path.join(OUT, String(++step).padStart(2, '0') + '_' + n + '.png') });
const st = () => p.evaluate(() => Engine._state());

async function dismiss() {
  for (let i = 0; i < 12; i++) {
    const on = await p.$('#overlay.on');
    if (!on) { await p.waitForTimeout(250); if (!(await p.$('#overlay.on'))) return; continue; }
    await p.click('#overlay .ov-btn'); await p.waitForTimeout(450);
  }
}
async function focus(id) { await p.evaluate(id => { const w = document.querySelector('.win[data-id=' + id + ']'); if (w) { w.classList.remove('min'); w.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); } }, id); }
// 창을 누르기 전에 그 창을 맨 앞으로 가져온다 (사람이 창을 눌러 앞으로 가져오는 것과 같다)
async function click(sel) { const m = sel.match(/\.win\[data-id=(\w+)\]/); if (m) await focus(m[1]); await p.click(sel); }
async function icon(name) {
  const sel = '.icon:has-text("' + name + '")';
  try { await p.click(sel, { timeout: 1500 }); } catch (e) { await p.click('#tb-start'); await p.click(sel); } // 가려져 있으면 「모두 최소화」 후 누른다
  await p.waitForTimeout(250);
}
async function search(q, arch) {
  if (!(await p.$('.win[data-id=search]'))) await icon('메아리 검색'); else await focus('search');
  await click('.win[data-id=search] .srch-tabs button[data-tab=' + (arch ? 'arch' : 'web') + ']');
  await focus('search'); await p.fill('.win[data-id=search] .srch-form .inp', q);
  await p.press('.win[data-id=search] .srch-form .inp', 'Enter');
  await p.waitForTimeout(150);
  return (await p.$$('.win[data-id=search] .r-title')).length;
}
async function searchOpenAll(q, arch, min) {
  const n = await search(q, arch);
  assert(n >= (min || 1), '「' + q + '」 결과 ' + n + '건');
  for (let i = 0; i < n; i++) {
    await click('.win[data-id=search] .r-title >> nth=' + i);
    await p.waitForTimeout(120);
    await click('.win[data-id=search] .page-nav .btn');
    await p.waitForTimeout(80);
  }
  return n;
}
async function cp(sentences) {
  await icon('추리 체크포인트'); await focus('checkpoint');
  for (const vals of sentences) {
    const sent = p.locator('.cp-sent:not(.done)').first();
    const inputs = sent.locator('input.inp, select.inp');
    const k = await inputs.count();
    assert(k === vals.length, '빈칸 수 ' + k + ' ≠ ' + vals.length);
    for (let i = 0; i < k; i++) {
      const el = inputs.nth(i);
      if ((await el.evaluate(e => e.tagName)) === 'SELECT') await el.selectOption({ label: vals[i] }); else await el.fill(vals[i]);
    }
    await sent.locator('button.btn.pri').click();
    await p.waitForTimeout(300);
  }
}
async function wrongCp(vals) {
  await icon('추리 체크포인트');
  const sent = p.locator('.cp-sent:not(.done)').first();
  const inputs = sent.locator('input.inp, select.inp');
  for (let i = 0; i < vals.length; i++) {
    const el = inputs.nth(i);
    if ((await el.evaluate(e => e.tagName)) === 'SELECT') await el.selectOption({ label: vals[i] }); else await el.fill(vals[i]);
  }
  await sent.locator('button.btn.pri').click(); await p.waitForTimeout(200);
  return (await sent.locator('.cp-fb').textContent()).trim();
}

(async () => {
  const browser = await chromium.launch();
  p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  p.on('dialog', d => d.accept());
  await p.goto(URL);
  await shot('title');
  await p.click('#t-new'); await p.waitForTimeout(500); await shot('titlecard_c0'); await dismiss();

  /* ---------------- 서장 ---------------- */
  log('서장');
  await icon('메일'); await p.click('.attach'); await p.waitForTimeout(300);
  await click('.win[data-id=photo] .pv-tools button:has-text("확대")'); await click('.win[data-id=photo] .pv-tools button:has-text("확대")');
  await shot('photo_zoom'); await click('.win[data-id=photo] .wbtn.close');
  // 한 단어 규칙, 0건
  await search('유메 링'); assert(await p.$('text=한 단어만 입력하세요'), '띄어쓰기 안내');
  assert(await search('도리이마코토') === 0, '도리이마코토는 0건이어야 함'); await shot('zero');
  for (const q of ['유메링', '히나고마을', '유메링실종사건', '특정반', '연호', '도리이민박', '나나채널', '밀밀동화', '권외', '오봉']) await searchOpenAll(q);
  await searchOpenAll('torii-minshuku.jp', true);
  let s = await st(); assert(s.cards.torii, '도리이 카드');
  const fb = await wrongCp(['2009년 8월 15일', '도쿄']); assert(/2칸 중 1칸/.test(fb), '오답 피드백: ' + fb);
  await p.waitForTimeout(2700);
  await cp([['2009.8.15', '히나고 마을']]);
  await p.waitForTimeout(3500);
  s = await st(); assert(s.apps.nana, '나나채널 해금');
  await icon('나나채널'); await p.fill('.nana-login .inp', 'H210818'); await p.click('.nana-login .btn.pri');
  await p.waitForTimeout(1800); await shot('titlecard_c1'); await dismiss();
  s = await st(); assert(s.chapter === 1, '1장 시작');

  /* ---------------- 1장 ---------------- */
  log('1장');
  const threads = ['【밀밀】유메링 실황', 'Part1', 'Part2', 'Part3', 'Part5', '히나고 마을에서'];
  for (const t of threads) {
    await click('.win[data-id=nana] .nana-head a, .win[data-id=nana] .nh-nav').catch(() => {});
    await p.evaluate(() => {}); await p.waitForTimeout(100);
    const back = await p.$('.win[data-id=nana] .nana-head a'); if (back) { await back.click(); await p.waitForTimeout(150); }
    await click('.win[data-id=nana] .nana-tl a:has-text("' + t + '")'); await p.waitForTimeout(250);
  }
  // ID 팝업
  await click('.win[data-id=nana] .nana-head a'); await click('.win[data-id=nana] .nana-tl a:has-text("Part3")'); await p.waitForTimeout(200);
  await click('.win[data-id=nana] .idl[data-id="Xa9fQ2"] >> nth=0'); await p.waitForTimeout(200); await shot('nana_id_popup');
  await p.mouse.click(5, 5);
  // Part4 죄책감 연출
  await click('.win[data-id=nana] .nana-head a'); await click('.win[data-id=nana] .nana-tl a:has-text("Part4")');
  await p.waitForTimeout(2600); await shot('guilt'); await dismiss();
  s = await st(); assert(s.cards.k3ngai && s.cards.hinata && s.cards.haruka, '1장 카드');
  for (const q of ['도시전설하루카', 'k3ngai', 'ID', '트립', '트립도감', '오컬트게시판', '리뷰테러', 'id창고', '히나']) await searchOpenAll(q);
  await search('하루카'); await click('.win[data-id=search] .r-title:has-text("블로그 홈")');
  for (const t of ['늦은 정정 2', '이 블로그에 대해']) { await click('.win[data-id=search] .ilink:has-text("' + t + '")'); await p.waitForTimeout(100); await click('.win[data-id=search] .page-nav .btn'); }
  await searchOpenAll('Xa9fQ2', true);
  for (const u of ['sokuho-matome.com/archives/4419', 'http://haruka-toshiden.petit-blog.jp/entry/20090823', 'trip-list.net/hina']) await searchOpenAll(u, true);
  s = await st(); assert(Object.keys(s.hidden).length === 3, '1장 숨김 3개: ' + Object.keys(s.hidden).length);
  await cp([['xa9fq2', '오컬트 게시판', '여론을 유도']]);
  await p.waitForTimeout(3500); await dismiss();
  s = await st(); assert(s.chapter === 2, '2장 시작');

  /* ---------------- 2장 ---------------- */
  log('2장');
  await icon('밀밀동화'); await p.waitForTimeout(300);
  await focus('video'); await p.fill('.win[data-id=video] .mm-ctrl .inp', '28:02'); await click('.win[data-id=video] .mm-ctrl button:has-text("이동")'); await p.waitForTimeout(300);
  await focus('video'); await p.fill('.win[data-id=video] .mm-ctrl .inp', '32:15'); await click('.win[data-id=video] .mm-ctrl button:has-text("이동")'); await p.waitForTimeout(400);
  await shot('video_3215');
  await click('.win[data-id=video] .cu[data-u="village"] >> nth=0'); await p.waitForTimeout(200);
  await click('.win[data-id=video] .mm-ctrl button:has-text("재생")'); await click('.win[data-id=video] .mm-ctrl button:has-text("×16")');
  await p.waitForTimeout(1500); await shot('video_play'); await click('.win[data-id=video] .mm-ctrl button:has-text("일시정지")');
  await focus('video'); await p.fill('.win[data-id=video] .mm-ctrl .inp', '40:03'); await click('.win[data-id=video] .mm-ctrl button:has-text("이동")');
  await click('.win[data-id=video] .cu[data-u="774"] >> nth=0'); await p.waitForTimeout(200);
  s = await st(); assert(s.cards.villager, '마을 사람 카드');
  for (const q of ['유선방송', 'ISDN', '공민관', '폐허', '오카베', '815', '마을사람', '8888', '유메링블로그', 'co20721']) await searchOpenAll(q);
  await searchOpenAll('yumering.petit-blog.jp', true); await click('.win[data-id=search] .r-title >> nth=0');
  for (const t of ['오봉엔 삼촌네 마을', '폴더폰 빨리 치기', '오봉 특집 예고']) { await click('.win[data-id=search] .ilink:has-text("' + t + '")'); await p.waitForTimeout(100); await click('.win[data-id=search] .page-nav .btn'); }
  // 보호 글
  await search('도시전설하루카'); await click('.win[data-id=search] .r-title >> nth=0');
  await click('.win[data-id=search] .ilink:has-text("히나고, 그 사물함")');
  await p.fill('.lockbox .inp', '8 1 5'); await p.click('.lockbox .btn.pri'); await p.waitForTimeout(300); await shot('locked_open');
  assert(await p.$('.note-paper'), '쪽지 열림');
  for (const u of ['community.mmdouga.jp/co20721', 'mmdouga.jp/mylist/774', 'yumering.petit-blog.jp/entry/20090816']) await searchOpenAll(u, true);
  s = await st(); assert(Object.keys(s.hidden).length === 6, '숨김 6개');
  await cp([['유메 본인', '공민관 ISDN 회선']]);
  await p.waitForTimeout(3500); await dismiss();
  s = await st(); assert(s.chapter === 3, '3장 시작');

  /* ---------------- 3장 ---------------- */
  log('3장');
  await icon('중얼중얼');
  await focus('sns'); await p.fill('.win[data-id=sns] .sns-form .inp', '#유메링_오봉특집'); await p.press('.win[data-id=sns] .sns-form .inp', 'Enter'); await p.waitForTimeout(200);
  await shot('sns_tag');
  await click('.win[data-id=sns] .post .ph b[data-acc="hnt_shogo"] >> nth=0'); await p.waitForTimeout(200);
  await click('.win[data-id=sns] figure.photo >> nth=0'); await p.waitForTimeout(300);
  for (let i = 0; i < 4; i++) await click('.win[data-id=photo] .pv-tools button:has-text("확대")');
  await shot('netcafe_zoom'); await click('.win[data-id=photo] .wbtn.close');
  for (const a of ['@yumering_0721', '@torii_minshuku', 'saki_enikki', '@ekimae_udon']) {
    await focus('sns'); await p.fill('.win[data-id=sns] .sns-form .inp', a); await p.press('.win[data-id=sns] .sns-form .inp', 'Enter'); await p.waitForTimeout(200);
  }
  await click('.win[data-id=sns] .sns-sub button:has-text("팔로워")'); await p.waitForTimeout(150); await shot('sns_followers');
  for (const q of ['히다사과사이다', '5061412', '마을소식지', '시간표', '목격담', '다카야마역', '도리이사키', '인터넷카페', '오봉축제', '전봇대', '외삼촌']) await searchOpenAll(q);
  await search('마을소식지'); await click('.win[data-id=search] .r-title >> nth=0');
  for (const t of ['보기']) { await click('.win[data-id=search] .ilink:has-text("' + t + '") >> nth=0'); await p.waitForTimeout(100); await click('.win[data-id=search] .page-nav .btn'); }
  await search('도리이사키'); await click('.win[data-id=search] .r-title >> nth=0');
  for (const t of ['아버지가 떠났다', '그해 여름의 일', '모르는 이름의 꽃']) { await click('.win[data-id=search] .ilink:has-text("' + t + '")'); await p.waitForTimeout(100); await click('.win[data-id=search] .page-nav .btn'); }
  await searchOpenAll('cafe-changa.jp', true);
  for (const u of ['mumble.jp/saki_enikki/status/20090816', 'takayama-lib.jp/hinago/128-2', 'cafe-changa.jp/guestbook']) await searchOpenAll(u, true);
  s = await st(); assert(Object.keys(s.hidden).length === 9, '숨김 9개');
  await cp([['외삼촌', '위장 실종', '스토커를 피하려고']]);
  await p.waitForTimeout(3500); await dismiss();
  s = await st(); assert(s.chapter === 4 && s.flags.sns2026, '4장 시작');

  /* ---------------- 4장 ---------------- */
  log('4장');
  await icon('폴더폰 메일함');
  for (const k of ['0', '7', '2', '1', 'OK']) await click('.win[data-id=phone] .phone button:text-is("' + k + '"), .win[data-id=phone] .ph-keys button:has-text("' + k + '") >> nth=0').catch(async () => {});
  s = await st();
  if (!s.flags.phone_open) { // 숫자 키는 글자 표시가 붙어 있어서 직접 누른다
    await focus('phone'); for (const k of ['0', '7', '2', '1']) await p.locator('.win[data-id=phone] .ph-keys button').filter({ hasText: new RegExp('^' + k) }).first().click();
    await click('.win[data-id=phone] .ph-nav button:has-text("OK")');
  }
  s = await st(); assert(s.flags.phone_open, '폴더폰 잠금 해제');
  await click('.win[data-id=phone] .ph-nav button:has-text("OK")'); await p.waitForTimeout(100);
  await click('.win[data-id=phone] .li >> nth=0'); await p.waitForTimeout(100); await shot('phone_view');
  await click('.win[data-id=phone] .ph-nav button:has-text("뒤로")'); await click('.win[data-id=phone] .ph-nav button:has-text("뒤로")');
  // 문자 입력 연습: 44 444 66 2 → HINA
  await click('.win[data-id=phone] .li:has-text("문자 입력 연습")');
  const tap = async (k, n) => { await focus('phone'); for (let i = 0; i < n; i++) await p.locator('.win[data-id=phone] .ph-keys button').filter({ hasText: new RegExp('^' + k) }).first().click(); await p.waitForTimeout(1100); };
  await tap('4', 2); await tap('4', 3); await tap('6', 2); await tap('2', 1);
  await focus('phone'); const txt = await p.locator('.win[data-id=phone] .ph-main').textContent();
  assert(/HINA/.test(txt), '멀티탭 연습 HINA: ' + txt); await shot('phone_practice');
  await click('.win[data-id=sns] .sns-era button:has-text("2026")'); await p.waitForTimeout(150);
  for (const a of ['@bakuro_hinata', '@saki_torii', '@yuki_nonomura', '@haruka_kitamura', '@tatsuo_garden']) { await focus('sns'); await p.fill('.win[data-id=sns] .sns-form .inp', a); await p.press('.win[data-id=sns] .sns-form .inp', 'Enter'); await p.waitForTimeout(150); }
  await shot('sns2026');
  for (const q of ['폭로왕히나타', '히나타쇼고', 'hnt_shogo', '멀티탭', '스토커', '소재비공개']) await searchOpenAll(q);
  await search('도시전설하루카'); await click('.win[data-id=search] .r-title >> nth=0'); await click('.win[data-id=search] .ilink:has-text("17년째 여름")');
  for (const u of ['7ch.net/msg/0818hina', 'mumble.jp/bakuro_hinata/status/20261101', 'mmdouga.jp/user/774']) await searchOpenAll(u, true);
  s = await st(); assert(Object.keys(s.hidden).length === 12, '숨김 12개');
  await cp([['◆Hina', '폭로왕 히나타'], ['도리이 사키']]);
  await p.waitForTimeout(3500); await dismiss();
  s = await st(); assert(s.chapter === 5, '종장 시작');

  /* ---------------- 종장: 기록부 ---------------- */
  log('종장');
  const D = await p.evaluate(() => ({ status: GAME_DATA.options.status, where: GAME_DATA.options.where, role: GAME_DATA.options.role }));
  const A = {
    '유메링': ['아시다 유메', 3, 2, 3], '도리이 민박 주인': ['도리이 마코토', 1, 5, 0], '민박집 딸': ['도리이 사키', 0, 9, 10],
    '◆Hina': ['히나타 쇼고', 0, 8, 5], '◆K3nGai (나)': ['K3nGai', 0, 3, 9], '도시전설 하루카': ['기타무라 하루카', 0, 6, 2],
    '오카베 순경': ['오카베 다쓰오', 0, 1, 7], '마을 사람': ['노노무라 유키', 3, 2, 6]
  };
  await icon('미정리 기록부');
  // 일부러 한 칸 틀린 3명 → 확정되지 않아야 함
  async function fill(handle, v) {
    await focus('record');
    const card = p.locator('.win[data-id=record] .card').filter({ has: p.locator('.c-handle', { hasText: new RegExp('^' + handle.replace(/[()◆]/g, '.') + '$') }) });
    await card.locator('input.inp').fill(v[0]);
    const sels = card.locator('select');
    await sels.nth(0).selectOption({ label: D.status[v[1]] }); await sels.nth(1).selectOption({ label: D.where[v[2]] }); await sels.nth(2).selectOption({ label: D.role[v[3]] });
  }
  async function check() { await focus('record'); await p.evaluate(() => { Engine._state().lastCheck = 0; }); await click('.win[data-id=record] .rec-prog .btn'); await p.waitForTimeout(250); }
  const keys = Object.keys(A);
  await fill(keys[0], A[keys[0]]); await fill(keys[1], A[keys[1]]); await fill(keys[2], ['도리이 사키', 0, 3, 10]);
  await check(); s = await st(); assert(Object.keys(s.conf).length === 0, '틀린 칸이 있으면 확정 안 됨');
  for (const k of keys) await fill(k, A[k]);
  await check(); await check(); await check();
  s = await st(); assert(Object.keys(s.conf).length === 8, '8명 정리됨: ' + Object.keys(s.conf).length);
  await shot('record_done');
  const snap = await p.evaluate(() => localStorage.getItem('kengai_save_v1'));
  fs.writeFileSync(path.join(OUT, 'save_before_final.json'), snap);

  /* ---------------- 진엔딩 ---------------- */
  await click('.win[data-id=record] .rec-final .btn'); await p.waitForTimeout(300); await shot('final_choice');
  await click('.win[data-id=final] .opt:has-text("정정한다")'); await p.waitForTimeout(500);
  await dismiss(); await p.waitForTimeout(3200); await shot('true_thread');
  assert(await p.$('.res.newres'), '17년 만의 레스');
  assert(await search('도리이마코토') === 1, '검색 결과 1건'); await shot('one_result');
  await click('.win[data-id=search] .r-title >> nth=0'); await p.waitForTimeout(200);
  await click('.win[data-id=search] button:has-text("기록을 닫는다")'); await p.waitForTimeout(400);
  await shot('ending_true');
  const endText = await p.locator('#ending').textContent();
  assert(/정정/.test(endText) && /8\/8/.test(endText) && /★ 12\/12/.test(endText), '엔딩 화면 통계');
  log('진엔딩 통계:', endText.replace(/\s+/g, ' ').slice(0, 200));

  /* ---------------- 다른 엔딩 두 개 ---------------- */
  for (const [label, name] of [['특정한다', '불씨'], ['덮는다', '침묵']]) {
    await p.evaluate(s => localStorage.setItem('kengai_save_v1', s), snap);
    await p.reload(); await p.click('#t-continue'); await p.waitForTimeout(400); await dismiss();
    await p.evaluate(() => Engine.open('final')); await p.waitForTimeout(200);
    await click('.win[data-id=final] .opt:has-text("' + label + '")'); await p.waitForTimeout(400);
    await dismiss(); await p.waitForTimeout(600);
    const t = await p.locator('#ending').textContent();
    assert(t.includes(name), name + ' 엔딩'); await shot('ending_' + name);
  }

  /* ---------------- 모바일 ---------------- */
  const m = await browser.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1 });
  m.on('pageerror', e => errs.push('mobile pageerror: ' + e.message));
  await m.goto(URL); await m.evaluate(s => localStorage.setItem('kengai_save_v1', s), snap); await m.reload();
  await m.click('#t-continue'); await m.waitForTimeout(400);
  await m.screenshot({ path: path.join(OUT, 'mobile_desktop.png') });
  await m.click('.icon:has-text("메아리 검색")'); await m.fill('.srch-form .inp', '유메링'); await m.press('.srch-form .inp', 'Enter'); await m.waitForTimeout(200);
  await m.screenshot({ path: path.join(OUT, 'mobile_search.png') });
  const over = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert(!over, '모바일 가로 넘침');

  await browser.close();
  if (errs.length) { console.error('브라우저 오류:\n' + errs.join('\n')); process.exit(1); }
  console.log('✔ 처음부터 진엔딩까지 막힘 없음 · 엔딩 3종 확인 · 숨김 단서 12/12 · 기록부 8/8 · 오류 0');
})().catch(async e => { console.error('✖', e.message); try { await shot('FAIL'); } catch (x) {} if (errs.length) console.error(errs.join('\n')); process.exit(1); });
