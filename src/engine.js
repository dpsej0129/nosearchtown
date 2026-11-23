/* ============================================================
   권외 — 검색되지 않는 마을 : 엔진
   시나리오는 GAME_DATA에만 있고, 엔진은 데이터를 해석해 화면을 만든다.
   ============================================================ */
(function(){
'use strict';
/*__HASH__*/
/*__ICONS__*/

var E = window.Engine = {};
var D = null;           // GAME_DATA
var S = null;           // 진행 상태(저장 대상)
var SAVE_KEY = 'kengai_save_v1';
var memStore = null;    // localStorage를 못 쓸 때의 메모리 저장소
var running = false;
var IDX = { pages:{}, pageList:[], threads:{}, threadList:[], boards:[], accounts:{}, accList:[], posts:[], videos:{}, mails:{},
            tl:{}, people:{}, peopleList:[], chapters:[], hiddenTotal:0, total:0 };

/* ---------------- 유틸 ---------------- */
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function h(tag, attrs){
  var e = document.createElement(tag);
  if (attrs) for (var k in attrs) {
    var v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'text') e.textContent = v;
    else if (k.slice(0,2) === 'on') e.addEventListener(k.slice(2), v);
    else if (k === 'style') e.style.cssText = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
  return e;
}
function add(e, c){
  if (c == null || c === false) return;
  if (Array.isArray(c)) { c.forEach(function(x){ add(e, x); }); return; }
  e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
}
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]; }); }
var DOW = ['일','월','화','수','목','금','토'];
function dowOf(ymd){ var p = ymd.split(/[\/\-.]/).map(Number); return DOW[new Date(p[0], p[1]-1, p[2]).getDay()]; }
function pad2(n){ return (n < 10 ? '0' : '') + n; }
function fmtSec(s){ s = Math.max(0, Math.floor(s)); return pad2(Math.floor(s/60)) + ':' + pad2(s % 60); }
function parseSec(str){ var m = String(str).trim().match(/^(\d{1,2}):(\d{1,2})(?:\.(\d))?$/); if (!m) return null; return (+m[1])*60 + (+m[2]) + (m[3] ? (+m[3])/10 : 0); }
function fmtDur(ms){ var m = Math.floor(ms/60000), hh = Math.floor(m/60); return (hh ? hh + '시간 ' : '') + (m % 60) + '분'; }
function gameNow(){ var d = new Date(); return { ymd:'2026.11.22', dow:'일', hm: pad2(d.getHours()) + ':' + pad2(d.getMinutes()) }; }
function isMobile(){ return window.innerWidth <= 760; }

/* ---------------- 저장 ---------------- */
function newState(){
  return { v:1, playMs:0, chapter:0, cp:{}, cpVals:{}, apps:{}, newApps:{}, flags:{}, seen:{}, seenOrder:[], hidden:{},
    cards:{}, rec:{}, conf:{}, recTries:0, tl:{}, tlMemo:{}, memo:'', mails:[], mailRead:{}, hints:0, hintOpen:{},
    fail:{}, ending:null, endDone:false, sound:true, unlocked:{}, unlockKey:{}, vidFx:{}, guiltSeen:{}, lastCheck:0 };
}
var saveT = null;
function save(){ clearTimeout(saveT); saveT = setTimeout(saveNow, 300); }
function saveNow(){
  if (!S) return;
  var str = JSON.stringify(S);
  try { localStorage.setItem(SAVE_KEY, str); } catch (e) { memStore = str; }
}
function loadSave(){
  try { var s = localStorage.getItem(SAVE_KEY); if (s) return JSON.parse(s); } catch (e) {}
  if (memStore) { try { return JSON.parse(memStore); } catch (e) {} }
  return null;
}
function wipeSave(){ try { localStorage.removeItem(SAVE_KEY); } catch (e) {} memStore = null; }

/* ---------------- 소리 (WebAudio 합성) ---------------- */
var AC = null;
function ac(){
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) {} }
  return AC;
}
function tone(f, st, du, type, vol){
  var c = ac(); if (!c) return;
  var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + st;
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol || .1, t + .012);
  g.gain.exponentialRampToValueAtTime(.0001, t + du);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + du + .05);
}
function sfx(n){
  if (!S || !S.sound) return;
  try {
    if (n === 'mail') { tone(1318,0,.18,'sine',.09); tone(1760,.13,.35,'sine',.09); }
    else if (n === 'unlock') { [523,659,784,1046].forEach(function(f,i){ tone(f,i*.08,.3,'triangle',.08); }); }
    else if (n === 'bad') { tone(196,0,.16,'square',.04); tone(147,.13,.24,'square',.04); }
    else if (n === 'good') { tone(880,0,.14,'sine',.09); tone(1320,.11,.3,'sine',.09); }
    else if (n === 'star') { [1568,2093,2637,3136].forEach(function(f,i){ tone(f,i*.06,.35,'sine',.06); }); }
    else if (n === 'card') { tone(660,0,.12,'triangle',.08); tone(990,.09,.22,'triangle',.08); }
    else if (n === 'key') { tone(1100,0,.04,'square',.025); }
    else if (n === 'notify') { tone(988,0,.16,'sine',.07); }
    else if (n === 'search') { tone(1400,0,.03,'sine',.03); }
    else if (n === 'drone') { tone(110,0,2.4,'sawtooth',.03); tone(82,0,2.6,'sine',.05); }
    else if (n === 'end') { [392,494,587,784,988].forEach(function(f,i){ tone(f,i*.18,.9,'sine',.06); }); }
  } catch (e) {}
}

/* ---------------- 토스트 ---------------- */
var toastQ = [], overlayOpen = false;
function toast(title, body, kind){
  if (overlayOpen) { toastQ.push([title, body, kind]); return; }
  var t = h('div', { class:'toast ' + (kind || '') }, h('b', null, title), body ? h('div', null, body) : null);
  var box = $('#toasts');
  while (box.childElementCount >= 4) box.firstChild.remove();
  box.appendChild(t);
  setTimeout(function(){ t.style.transition = 'opacity .4s'; t.style.opacity = '0'; setTimeout(function(){ t.remove(); }, 450); }, 4300);
}
function flushToasts(){ var q = toastQ; toastQ = []; q.forEach(function(a, i){ setTimeout(function(){ toast(a[0], a[1], a[2]); }, i * 350); }); }

/* ---------------- 데이터 색인 ---------------- */
function parseRes(src){
  var out = [], date = '2009/08/15';
  String(src || '').split('\n').forEach(function(line){
    line = line.trim(); if (!line) return;
    if (line.charAt(0) === '@') { date = line.slice(1).trim(); return; }
    var bar = line.indexOf('|'); if (bar < 0) return;
    var head = line.slice(0, bar).trim(), body = line.slice(bar + 1).trim();
    var m = head.match(/^(\d\d:\d\d:\d\d)\s+(\S+)(.*)$/); if (!m) return;
    var rest = m[3], trip = '', name = '', flags = [];
    rest = rest.replace(/◆(\S+)/, function(_, t){ trip = t; return ''; });
    rest = rest.replace(/\[([^\]]+)\]/, function(_, n){ name = n; return ''; });
    rest.replace(/#(\w+)/g, function(_, f){ flags.push(f); return ''; });
    out.push({ no: out.length + 1, date: date, time: m[1], id: m[2], trip: trip, name: name, del: m[2] === 'DEL', flags: flags, body: body });
  });
  return out;
}
function prepVideo(v){
  var list = [], rnd = mulberry32(815);
  String(v.comments || '').split('\n').forEach(function(line){
    line = line.trim(); if (!line) return;
    var bar = line.indexOf('|'); if (bar < 0) return;
    var head = line.slice(0, bar).trim().split(/\s+/), text = line.slice(bar + 1).trim();
    var t = parseSec(head[0]); if (t == null) return;
    var u = head[1] || '-', color = '';
    var cm = text.match(/^\{(\w+)\}\s*/); if (cm) { color = cm[1]; text = text.slice(cm[0].length); }
    var del = false; if (text === '[삭제]') del = true;
    list.push({ t: t, u: u === '-' ? ('#' + (100000 + Math.floor(rnd() * 899999))) : u, text: text, color: color, del: del });
  });
  (v.filler || []).forEach(function(f){
    var a = parseSec(f.from), b = parseSec(f.to);
    for (var s = a; s < b; s++) {
      if (rnd() < f.dens) {
        list.push({ t: s + rnd(), u: '#' + (100000 + Math.floor(rnd() * 899999)), text: f.pool[Math.floor(rnd() * f.pool.length)], color: rnd() < .06 ? ['red','green','yellow'][Math.floor(rnd()*3)] : '', filler: true });
      }
    }
  });
  list.sort(function(x, y){ return x.t - y.t; });
  v._c = list;
  v._dur = parseSec(v.duration);
  (v.segments || []).forEach(function(sg){ sg._a = parseSec(sg.from); sg._b = parseSec(sg.to); });
  (v.events || []).forEach(function(ev){ ev._t = parseSec(ev.at); });
}
function index(){
  D.chapters.forEach(function(ch, ci){
    ch._i = ci; IDX.chapters.push(ch);
    (ch.searchPages || []).forEach(function(p){ p._ch = ci; IDX.pages[p.id] = p; IDX.pageList.push(p); if (p.hidden) IDX.hiddenTotal++; });
    (ch.threads || []).forEach(function(t){ t._ch = ci; t._res = parseRes(t.res); t._end = parseRes(t.endRes); IDX.threads[t.id] = t; IDX.threadList.push(t); });
    (ch.boards || []).forEach(function(b){ IDX.boards.push(b); });
    (ch.accounts || []).forEach(function(a){ IDX.accounts[a.era + ':' + a.id.toLowerCase()] = a; IDX.accList.push(a); });
    (ch.posts || []).forEach(function(p){ IDX.posts.push(p); });
    (ch.videos || []).forEach(function(v){ IDX.videos[v.id] = v; prepVideo(v); });
    (ch.mails || []).forEach(function(m){ IDX.mails[m.id] = m; });
    (ch.timeline || []).forEach(function(t){ IDX.tl[t.id] = t; });
  });
  (D.extraMails || []).forEach(function(m){ IDX.mails[m.id] = m; });
  (D.extraTimeline || []).forEach(function(t){ IDX.tl[t.id] = t; });
  D.people.forEach(function(p){ IDX.people[p.id] = p; IDX.peopleList.push(p); });
  IDX.total = IDX.pageList.length + IDX.threadList.length + IDX.accList.length + Object.keys(IDX.videos).length;
}

/* ---------------- 발견 · 효과 ---------------- */
function discover(kind, id, title){
  var key = kind + ':' + id;
  if (S.seen[key]) return false;
  S.seen[key] = Date.now();
  S.seenOrder.push({ k: kind, id: id, title: title });
  if (kind === 'page' && IDX.pages[id] && IDX.pages[id].hidden && !S.hidden[id]) {
    S.hidden[id] = true;
    var n = Object.keys(S.hidden).length;
    toast('숨은 기록을 찾았습니다', title + ' · ' + n + '/' + IDX.hiddenTotal, 'star');
    sfx('star');
  }
  updateFound(); save();
  return true;
}
function fx(f){
  if (!f) return;
  (f.apps || []).forEach(unlockApp);
  (f.cards || []).forEach(addCard);
  var tlAdded = 0;
  (f.timeline || []).forEach(function(id){ if (addTl(id)) tlAdded++; });
  if (tlAdded) toast('사건 연표', '사건 ' + tlAdded + '개가 연표에 추가되었습니다');
  (f.flags || []).forEach(function(k){ S.flags[k] = true; });
  (f.mails || []).forEach(function(id, i){ setTimeout(function(){ deliverMail(id); }, 900 + i * 1500); });
  if (f.toast) toast(f.toast[0], f.toast[1], f.toast[2]);
  save(); renderIcons();
}
function addCard(id){
  if (S.cards[id] || !IDX.people[id]) return;
  S.cards[id] = true;
  if (!S.rec[id]) S.rec[id] = { n:'', s:-1, w:-1, r:-1 };
  var p = IDX.people[id];
  toast('미정리 기록부', '「' + p.handle + '」 카드가 추가되었습니다', 'good');
  sfx('card');
  refreshWin('record');
}
function addTl(id){
  if (S.tl[id] || !IDX.tl[id]) return false;
  S.tl[id] = true; refreshWin('timeline'); return true;
}
function unlockApp(id, quiet){
  if (S.apps[id]) return;
  S.apps[id] = true; if (!quiet) S.newApps[id] = true;
  if (!quiet && APPS[id] && !APPS[id].quiet) { toast('새 앱', '「' + APPS[id].name + '」을(를) 열 수 있습니다', 'good'); sfx('unlock'); }
  renderIcons();
}
function deliverMail(id){
  if (!IDX.mails[id]) return;
  for (var i = 0; i < S.mails.length; i++) if (S.mails[i].id === id) return;
  var now = gameNow();
  S.mails.push({ id: id, at: now.ymd + ' ' + now.hm });
  var m = IDX.mails[id];
  toast('새 메일', (m.fromName || '') + ' — ' + m.subject);
  sfx('mail'); save(); renderIcons(); refreshWin('mail');
}

/* ---------------- 창 관리 ---------------- */
var WM = { wins:{}, z:20, n:0 };
function openWin(id, title, w, hh){
  var W = WM.wins[id];
  if (W) { W.el.classList.remove('min'); focusWin(id); if (title) setTitle(id, title); return W; }
  var el = h('div', { class:'win', 'data-id': id });
  var tt = h('div', { class:'wtitle', text: title });
  var bar = h('div', { class:'wbar' }, tt,
    h('button', { class:'wbtn', title:'최소화', 'aria-label':'최소화', html: ico('minus'), onclick:function(e){ e.stopPropagation(); minWin(id); } }),
    h('button', { class:'wbtn max', title:'최대화', 'aria-label':'최대화', html: ico('square'), onclick:function(e){ e.stopPropagation(); maxWin(id); } }),
    h('button', { class:'wbtn close', title:'닫기', 'aria-label':'닫기', html: ico('x'), onclick:function(e){ e.stopPropagation(); closeWin(id); } }));
  var body = h('div', { class:'wbody' });
  var rz = h('div', { class:'wresize' });
  el.appendChild(bar); el.appendChild(body); el.appendChild(rz);
  var dk = $('#desktop'), dw = dk.clientWidth, dh = dk.clientHeight;
  var ww = Math.min(w || 720, dw - 16), wh = Math.min(hh || 520, dh - 16);
  var k = WM.n++ % 7;
  var minL = isMobile() ? 0 : (($('#icons') && $('#icons').offsetWidth) || 90) + 14;
  el.style.width = ww + 'px'; el.style.height = wh + 'px';
  el.style.left = Math.max(8, Math.min(dw - ww - 8, minL + k * 30)) + 'px';
  el.style.top = Math.max(6, Math.min(dh - wh - 6, 14 + k * 26)) + 'px';
  dk.appendChild(el);
  W = { id: id, el: el, body: body, titleEl: tt, title: title, st: null };
  WM.wins[id] = W;
  el.addEventListener('pointerdown', function(){ focusWin(id); });
  dragify(bar, el); resizify(rz, el);
  focusWin(id); renderTaskbar();
  return W;
}
function setTitle(id, t){ var W = WM.wins[id]; if (!W) return; W.title = t; W.titleEl.textContent = t; renderTaskbar(); }
function focusWin(id){
  var W = WM.wins[id]; if (!W) return;
  for (var k in WM.wins) WM.wins[k].el.classList.remove('focus');
  W.el.classList.add('focus'); W.el.style.zIndex = ++WM.z; WM.top = id; renderTaskbar();
}
function minWin(id){ var W = WM.wins[id]; if (!W) return; W.el.classList.add('min'); if (W.onmin) W.onmin(); WM.top = null; renderTaskbar(); }
function maxWin(id){
  var W = WM.wins[id]; if (!W) return; var el = W.el;
  if (W.prev) { el.style.cssText = W.prev; W.prev = null; }
  else { W.prev = el.style.cssText; el.style.left = '0px'; el.style.top = '0px'; el.style.width = '100%'; el.style.height = '100%'; el.style.zIndex = ++WM.z; }
  if (W.onresize) W.onresize();
}
function closeWin(id){ var W = WM.wins[id]; if (!W) return; if (W.onclose) W.onclose(); W.el.remove(); delete WM.wins[id]; renderTaskbar(); }
function refreshWin(id){ var W = WM.wins[id]; if (W && W.refresh) W.refresh(); }
function dragify(handle, el){
  var sx, sy, ox, oy, on = false;
  handle.addEventListener('pointerdown', function(e){
    if (isMobile() || e.target.closest('.wbtn')) return;
    on = true; sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop;
    try { handle.setPointerCapture(e.pointerId); } catch (x) {}
  });
  handle.addEventListener('pointermove', function(e){
    if (!on) return;
    var dk = $('#desktop');
    var nx = Math.max(-el.offsetWidth + 80, Math.min(dk.clientWidth - 80, ox + e.clientX - sx));
    var ny = Math.max(0, Math.min(dk.clientHeight - 36, oy + e.clientY - sy));
    el.style.left = nx + 'px'; el.style.top = ny + 'px';
  });
  handle.addEventListener('pointerup', function(){ on = false; });
  handle.addEventListener('dblclick', function(){ var id = el.getAttribute('data-id'); maxWin(id); });
}
function resizify(rz, el){
  var sx, sy, ow, oh, on = false;
  rz.addEventListener('pointerdown', function(e){ on = true; sx = e.clientX; sy = e.clientY; ow = el.offsetWidth; oh = el.offsetHeight; try { rz.setPointerCapture(e.pointerId); } catch (x) {} e.stopPropagation(); });
  rz.addEventListener('pointermove', function(e){ if (!on) return; el.style.width = Math.max(300, ow + e.clientX - sx) + 'px'; el.style.height = Math.max(200, oh + e.clientY - sy) + 'px'; });
  rz.addEventListener('pointerup', function(){ on = false; var W = WM.wins[el.getAttribute('data-id')]; if (W && W.onresize) W.onresize(); });
}
function renderTaskbar(){
  var box = $('#tb-wins'); box.innerHTML = '';
  Object.keys(WM.wins).forEach(function(id){
    var W = WM.wins[id], min = W.el.classList.contains('min');
    box.appendChild(h('button', { class:'tb-btn' + (WM.top === id && !min ? ' active' : '') + (min ? ' min' : ''), title: W.title, onclick:function(){
      if (min) { W.el.classList.remove('min'); focusWin(id); }
      else if (WM.top === id) minWin(id); else focusWin(id);
    } }, W.title));
  });
}

/* ---------------- 앱 목록 ---------------- */
var APPS = {
  search:     { name:'메아리 검색',     ic:'search', open: function(a){ openSearch(a); } },
  mail:       { name:'메일',            ic:'mail', open: function(a){ openMail(a); } },
  record:     { name:'미정리 기록부',   ic:'clipboard-list', open: function(){ openRecord(); } },
  timeline:   { name:'사건 연표',       ic:'history', open: function(){ openTimeline(); } },
  checkpoint: { name:'추리 체크포인트', ic:'list-checks', open: function(){ openCheckpoint(); } },
  memo:       { name:'메모장',          ic:'notebook-pen', open: function(){ openMemo(); } },
  hint:       { name:'단계별 힌트',     ic:'lightbulb', open: function(){ openHint(); } },
  nana:       { name:'나나채널',        ic:'messages-square', open: function(a){ openNana(a); } },
  video:      { name:'밀밀동화',        ic:'monitor-play', open: function(a){ openVideo(a); } },
  sns:        { name:'중얼중얼',        ic:'at-sign', open: function(a){ openSNS(a); } },
  phone:      { name:'폴더폰 메일함',   ic:'smartphone', open: function(){ openPhone(); } },
  final:      { name:'최종 선택',       ic:'flag', open: function(){ openFinal(); } },
  found:      { name:'발견 기록',       ic:'files', open: function(){ openFound(); }, quiet:true, noIcon:true }
};
var ICON_ORDER = ['search','mail','record','timeline','checkpoint','memo','hint','nana','video','sns','phone','final'];
E.open = function(id, arg){
  if (!S.apps[id] && !(APPS[id] && APPS[id].noIcon)) { toast('아직 열 수 없습니다', '이 앱은 아직 잠겨 있습니다', 'bad'); return; }
  if (S.newApps[id]) { delete S.newApps[id]; renderIcons(); save(); }
  APPS[id].open(arg);
};
function renderIcons(){
  var box = $('#icons'); if (!box) return; box.innerHTML = '';
  ICON_ORDER.forEach(function(id){
    if (!S.apps[id]) return;
    var a = APPS[id], cnt = null, mark = !!S.newApps[id];
    if (id === 'mail') { var u = S.mails.filter(function(m){ return !S.mailRead[m.id]; }).length; if (u) { cnt = h('span', { class:'cnt' }, String(u)); mark = true; } }
    box.appendChild(h('button', { class:'icon', 'aria-label': a.name, onclick:function(){ E.open(id); } },
      h('span', { class:'ic', html: ico(a.ic) }), h('span', { class:'lb' }, a.name, cnt), mark ? h('span', { class:'dot' }) : null));
  });
}
function updateFound(){
  var n = 0; for (var k in S.seen) n++;
  var hs = Object.keys(S.hidden).length;
  $('#tb-found').textContent = '발견 ' + n + '/' + IDX.total + (S.chapter >= 1 || hs ? ' · 숨은 기록 ' + hs + '/' + IDX.hiddenTotal : '');
  refreshWin('found');
}
function tickClock(){
  var n = gameNow();
  $('#tb-clock').innerHTML = n.hm + '<br>' + n.ymd + '(' + n.dow + ')';
}

/* ---------------- 본문 마크업 ---------------- */
function sceneSVG(id){ return (D.scenes && D.scenes[id]) || '<svg viewBox="0 0 320 180"><rect width="320" height="180" fill="#333"/></svg>'; }
function markup(str){
  return String(str || '')
    .replace(/\[\[photo:([\w\-]+)\|([^\]]*)\]\]/g, function(_, id, cap){
      return '<figure class="photo" data-scene="' + id + '" data-cap="' + esc(cap) + '"><span class="zoomhint">확대</span>' + sceneSVG(id) + '<figcaption>' + cap + '</figcaption></figure>';
    })
    .replace(/\[\[page:([\w\-]+)\|([^\]]*)\]\]/g, '<a class="ilink" data-page="$1">$2</a>')
    .replace(/\[\[sns:(\d{4}):([\w]+)\|([^\]]*)\]\]/g, '<a class="ilink" data-sns="$1:$2">$3</a>')
    .replace(/\[\[thread:([\w\-]+)\|([^\]]*)\]\]/g, '<a class="ilink" data-thread="$1">$2</a>')
    .replace(/\[\[app:(\w+)\|([^\]]*)\]\]/g, '<a class="ilink" data-app="$1">$2</a>')
    .replace(/\[\[note:([\s\S]*?)\]\]/g, '<div class="note-paper">$1</div>');
}
function bindLinks(root){
  $$('figure.photo', root).forEach(function(f){ f.addEventListener('click', function(){ openPhoto(f.getAttribute('data-scene'), f.getAttribute('data-cap')); }); });
  $$('[data-page]', root).forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); openSearch({ page: a.getAttribute('data-page') }); }); });
  $$('[data-sns]', root).forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); var p = a.getAttribute('data-sns').split(':'); gotoSNS(p[0], p[1]); }); });
  $$('[data-thread]', root).forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); if (!S.apps.nana) { toast('아직 열 수 없습니다', '나나채널 앱이 잠겨 있습니다', 'bad'); return; } E.open('nana', { thread: a.getAttribute('data-thread') }); }); });
  $$('[data-app]', root).forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); E.open(a.getAttribute('data-app')); }); });
}
function gotoSNS(era, id){
  if (!S.apps.sns) { toast('아직 열 수 없습니다', '중얼중얼 앱이 아직 잠겨 있습니다', 'bad'); return; }
  if (era === '2026' && !S.flags.sns2026) { toast('아직 열 수 없습니다', '중얼중얼 2026 탭이 아직 잠겨 있습니다', 'bad'); return; }
  E.open('sns', { era: era, acc: id });
}

/* ---------------- 사진 보기(확대) ---------------- */
function openPhoto(scene, cap){
  var W = openWin('photo', '사진 보기', 780, 560);
  W.body.innerHTML = '';
  var st = W.st = { z: 1, x: 0, y: 0 };
  var stage = h('div', { class:'pv-stage' });
  var label = h('span', { class:'z' }, '×1');
  function apply(){ var svg = stage.querySelector('svg'); if (svg) svg.style.transform = 'translate(' + st.x + 'px,' + st.y + 'px) scale(' + st.z + ')'; label.textContent = '×' + st.z.toFixed(1).replace('.0', ''); }
  function zoom(f, cx, cy){
    var nz = Math.max(1, Math.min(8, st.z * f));
    if (cx == null) { cx = stage.clientWidth / 2; cy = stage.clientHeight / 2; }
    st.x = cx - (cx - st.x) * nz / st.z; st.y = cy - (cy - st.y) * nz / st.z; st.z = nz;
    if (st.z === 1) { st.x = 0; st.y = 0; } apply();
  }
  var tools = h('div', { class:'pv-tools' },
    h('button', { class:'btn ghost icon-only', title:'축소', 'aria-label':'축소', html: ico('minus'), onclick:function(){ zoom(1/1.5); } }),
    h('button', { class:'btn ghost icon-only', title:'확대', 'aria-label':'확대', html: ico('plus'), onclick:function(){ zoom(1.5); } }),
    h('button', { class:'btn ghost icon-only', title:'원래대로', 'aria-label':'원래대로', html: ico('rotate-ccw'), onclick:function(){ st.z = 1; st.x = 0; st.y = 0; apply(); } }), label,
    h('span', { style:'margin-left:auto' }, '끌어서 이동, 휠로 확대'));
  var capEl = h('div', { class:'pv-cap', html: cap || '' });
  W.body.appendChild(h('div', { class:'pv' }, tools, stage, capEl));
  stage.innerHTML = sceneSVG(scene);
  function fit(){ var svg = stage.querySelector('svg'); if (!svg) return; svg.setAttribute('width', stage.clientWidth); svg.removeAttribute('height'); svg.style.height = 'auto'; }
  setTimeout(function(){ fit(); apply(); }, 0);
  W.onresize = function(){ fit(); };
  var drag = null;
  stage.addEventListener('pointerdown', function(e){ drag = { x: e.clientX, y: e.clientY, ox: st.x, oy: st.y }; try { stage.setPointerCapture(e.pointerId); } catch (x) {} });
  stage.addEventListener('pointermove', function(e){ if (!drag) return; st.x = drag.ox + e.clientX - drag.x; st.y = drag.oy + e.clientY - drag.y; apply(); });
  stage.addEventListener('pointerup', function(){ drag = null; });
  stage.addEventListener('wheel', function(e){ e.preventDefault(); var r = stage.getBoundingClientRect(); zoom(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top); }, { passive:false });
}

/* ============================================================
   메아리 검색
   ============================================================ */
function openSearch(arg){
  var W = openWin('search', '메아리 검색', 900, 640);
  if (!W.st) buildSearch(W);
  if (arg && arg.page) showPage(W, arg.page, true);
  if (arg && arg.focus) setTimeout(function(){ W.st.inp.focus(); }, 50);
}
function buildSearch(W){
  W.st = { tab:'web', view:'home', back:[] };
  var inp = h('input', { class:'inp', placeholder:'한 단어로 검색', 'aria-label':'검색어', autocomplete:'off', enterkeyhint:'search' });
  var form = h('form', { class:'srch-form', onsubmit:function(e){ e.preventDefault(); runSearch(W, inp.value); } }, h('span', { html: ico('search') }), inp, h('button', { class:'btn pri', type:'submit' }, '검색'));
  function tb(k, label){ return h('button', { class: W.st.tab === k ? 'on' : '', 'data-tab': k, onclick:function(){ setTab(W, k); } }, label); }
  var tabs = h('div', { class:'srch-tabs' }, tb('web', '웹'), tb('arch', '아카이브'));
  var top = h('div', { class:'srch-top' }, h('div', { class:'srch-logo' }, '메아리'), form, tabs);
  var main = h('div', { class:'srch-main' });
  W.body.innerHTML = '';
  W.body.appendChild(h('div', { class:'srch' }, top, main));
  W.st.inp = inp; W.st.main = main; W.st.tabsEl = tabs;
  var setTop = function(){ W.body.style.setProperty('--srch-top', top.offsetHeight + 'px'); };
  setTimeout(setTop, 0);
  if (window.ResizeObserver) { try { new ResizeObserver(setTop).observe(top); } catch (e) {} }
  searchHome(W);
}
function setTab(W, k){
  W.st.tab = k;
  $$('button', W.st.tabsEl).forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-tab') === k); });
  W.st.inp.placeholder = k === 'arch' ? '페이지 주소 또는 게시글 ID' : '한 단어로 검색';
  W.st.inp.value = ''; searchHome(W);
}
function searchHome(W){
  W.st.view = 'home'; W.st.back = [];
  var arch = W.st.tab === 'arch';
  W.st.main.innerHTML = '';
  W.st.main.appendChild(h('div', { class:'srch-home' },
    h('div', { class:'big' }, arch ? '아카이브' : '메아리'),
    h('p', null, arch ? '지워진 페이지의 보관본을 찾습니다' : '정확한 한 단어만 메아리가 되어 돌아옵니다'),
    h('p', { class:'tips', html: arch
      ? '<b>페이지 주소</b>나 <b>게시글 ID</b>를 넣으세요. 주소 앞의 http:// 는 빼도 됩니다. 웹 검색에서 「삭제된 페이지」로 나온 주소를 여기에 넣어 보세요.'
      : '띄어쓰기 없이 <b>한 단어</b>만 검색됩니다. 인물 이름은 붙여 쓰고, 영문 아이디는 대소문자를 가리지 않습니다. 결과가 없으면 단어를 바꿔 보세요.' })));
}
function runSearch(W, q){
  var raw = String(q || '').trim(); if (!raw) return;
  sfx('search');
  var main = W.st.main; main.innerHTML = '';
  W.st.view = 'results'; W.st.back = [];
  if (/\s/.test(raw)) {
    main.appendChild(h('div', { class:'srch-zero' }, h('div', { class:'z', style:'font-size:28px' }, '한 단어만 입력하세요'),
      h('p', null, '「' + raw + '」에는 띄어쓰기가 있습니다. 인물 이름은 붙여서 검색합니다.')));
    sfx('bad'); return;
  }
  var key = H(raw), arch = W.st.tab === 'arch';
  var res = IDX.pageList.filter(function(p){
    return !!p.archive === arch && p.keys && p.keys.indexOf(key) >= 0 && (!p.requires || S.flags[p.requires]) && !(p.hideIf && S.flags[p.hideIf]);
  });
  W.st.lastQ = raw; W.st.lastRes = res;
  if (!res.length) {
    var c = S.chapter; S.fail[c] = (S.fail[c] || 0) + 1;
    var sug = null;
    if (S.fail[c] >= 12) { S.fail[c] = 0; sug = pickSuggest(); }
    save();
    var z = h('div', { class:'srch-zero' },
      h('div', { class:'z', html:'검색 결과 <em>0</em>건' }),
      h('p', null, '「' + raw + '」' + (arch ? '의 보관본을 찾을 수 없습니다.' : '와(과) 일치하는 페이지가 없습니다.')),
      h('p', { class:'small' }, arch ? '주소는 정확히 입력해야 합니다. 대소문자는 가리지 않습니다.' : '다른 한 단어로 검색해 보세요. 지워진 페이지는 아카이브 탭에서 찾을 수 있습니다.'));
    if (sug) {
      var b = h('span', { class:'blur', title:'눌러서 선명하게' }, sug);
      b.addEventListener('click', function(){ b.classList.add('clear'); W.st.inp.value = sug; });
      z.appendChild(h('div', { class:'suggest' }, '혹시 이것을 찾으셨나요? ', b));
    }
    main.appendChild(z); return;
  }
  S.fail[S.chapter] = 0; save();
  renderResults(W, res, raw);
}
function pickSuggest(){
  var ch = IDX.chapters[S.chapter], list = (ch && ch.suggest) || [];
  for (var i = 0; i < list.length; i++) if (!S.seen['page:' + list[i].page]) return list[i].show;
  return list.length ? list[Math.floor(Math.random() * list.length)].show : null;
}
var TYPE_LABEL = { news:'뉴스', wiki:'백과', blog:'블로그', blog09:'블로그', letter:'마을 소식지', shop:'가게', matome:'정리 사이트', tool:'도구', dead:'삭제됨', sns:'SNS', board:'게시판' };
function renderResults(W, res, raw){
  var main = W.st.main; main.innerHTML = '';
  var box = h('div', { class:'srch-res' }, h('div', { class:'srch-count' }, '「' + raw + '」 검색 결과 ' + res.length + '건'));
  res.forEach(function(p){
    var seen = S.seen['page:' + p.id];
    var tags = [h('span', { class:'tag' }, p.archive ? '아카이브' : (TYPE_LABEL[p.type] || '웹'))];
    if (p.archive && p.hidden && S.hidden[p.id]) tags.push(h('span', { class:'tag' }, '숨은 기록'));
    var it = h('div', { class:'r-item' + (p.type === 'dead' ? ' dead' : '') + (seen ? ' seen' : '') },
      h('div', { class:'r-url' }, p.url || ''),
      h('a', { class:'r-title', onclick:function(){ showPage(W, p.id, true); } }, p.title),
      h('div', { class:'r-snip' }, tags, (p.date ? p.date + ' — ' : ''), p.snippet || ''));
    box.appendChild(it);
  });
  main.appendChild(box);
  main.scrollTop = 0; W.body.scrollTop = 0;
}
function showPage(W, id, push){
  var p = IDX.pages[id]; if (!p) return;
  if (p.requires && !S.flags[p.requires]) return;
  if (push && W.st.view !== 'page-init') W.st.back.push(W.st.view === 'page' ? { page: W.st.pageId } : { results: true });
  W.st.view = 'page'; W.st.pageId = id;
  discover('page', id, p.title);
  fx(p.fx);
  var main = W.st.main; main.innerHTML = '';
  var nav = h('div', { class:'page-nav' },
    h('button', { class:'btn ghost', html: ico('arrow-left') + '<span>뒤로</span>', onclick:function(){ goBack(W); } }),
    h('div', { class:'addr', title: p.url }, (p.archive ? '보관본 · ' : '') + (p.url || '')));
  var holder = h('div', { class:'webpage', html: pageHTML(p) });
  main.appendChild(nav); main.appendChild(holder);
  if (p.lock) holder.appendChild(lockBox(p));
  if (p.endBtn && S.flags.ending_true) {
    holder.appendChild(h('div', { class:'center', style:'padding:10px 0 40px' }, h('button', { class:'btn pri', onclick:function(){ endingScreen('correction'); } }, '기록을 닫는다 →')));
  }
  bindLinks(holder);
  W.body.scrollTop = 0;
}
function goBack(W){
  var b = W.st.back.pop();
  if (!b) { if (W.st.lastRes) renderResults(W, W.st.lastRes, W.st.lastQ); else searchHome(W); W.st.view = 'results'; return; }
  if (b.page) { W.st.view = 'page-init'; showPage(W, b.page, false); }
  else if (W.st.lastRes) { W.st.view = 'results'; renderResults(W, W.st.lastRes, W.st.lastQ); }
  else searchHome(W);
}
function pageHTML(p){
  var body = markup(p.body || ''), t = p.type, o = '';
  var site = esc(p.site || ''), sub = esc(p.siteSub || '');
  if (t === 'news') o = '<div class="pg pg-news"><div class="paper">' + site + '</div><h1>' + esc(p.title) + '</h1><div class="meta">' + esc(p.date || '') + (p.byline ? ' · ' + esc(p.byline) : '') + '</div>' + body + '</div>';
  else if (t === 'wiki') o = '<div class="pg pg-wiki"><div class="wk-head">' + (site || '열린백과 — 누구나 고치는 백과사전') + '</div><h1>' + esc(p.title) + '</h1>' + body + '</div>';
  else if (t === 'blog09') o = '<div class="pg pg-blog09"><div class="bh">' + site + '<small>' + sub + '</small></div>' + body + '</div>';
  else if (t === 'blog') o = '<div class="pg pg-blog"><div class="bh">' + site + '<small>' + sub + '</small></div>' + body + '</div>';
  else if (t === 'letter') o = '<div class="pg pg-letter">' + body + '</div>';
  else if (t === 'shop') o = '<div class="pg pg-shop"><div class="sh">' + site + '<small>' + sub + '</small></div>' + body + '</div>';
  else if (t === 'matome') o = '<div class="pg pg-matome"><div class="mt">' + site + '</div><h1>' + esc(p.title) + '</h1><div class="meta">' + esc(p.date || '') + '</div>' + body + '</div>';
  else if (t === 'dead') o = '<div class="dead404"><div class="n">404</div><p><b>이 페이지는 삭제되었거나 존재하지 않습니다.</b></p><p class="small">' + esc(p.url || '') + '</p>' + body + '</div>';
  else o = '<div class="pg pg-tool">' + (site ? '<div class="meta">' + site + '</div>' : '') + '<h1>' + esc(p.title) + '</h1>' + body + '</div>';
  if (p.archive) o = '<div class="arch-banner"><b>아카이브 보관본</b> · 원래 주소: ' + esc(p.url || '') + ' · 저장 시각: ' + esc(p.saved || '알 수 없음') + (p.hidden ? ' · <b>★ 숨겨진 기록</b>' : '') + '</div>' + o;
  return o;
}
function lockBox(p){
  var box = h('div', { class:'lockbox' });
  function showOpen(key){
    var txt = '';
    try { txt = decStr(p.lock.enc, key); } catch (e) { txt = '(내용을 열 수 없습니다)'; }
    box.className = 'pg'; box.innerHTML = markup(txt); bindLinks(box);
  }
  if (S.unlocked[p.id]) { showOpen(S.unlockKey[p.id]); return box; }
  var inp = h('input', { class:'inp', placeholder:'비밀번호', autocomplete:'off' });
  var fb = h('div', { class:'small', style:'margin-top:8px;min-height:18px' });
  function tryIt(){
    if (H(inp.value) === p.lock.pw) {
      S.unlocked[p.id] = true; S.unlockKey[p.id] = inp.value; sfx('good');
      fx(p.lock.fx); save(); showOpen(inp.value);
    } else { fb.textContent = '비밀번호가 다릅니다.'; fb.style.color = '#e0475b'; sfx('bad'); }
  }
  inp.addEventListener('keydown', function(e){ if (e.key === 'Enter') tryIt(); });
  box.appendChild(h('div', null, h('b', { class:'lk', html: ico('lock') + '보호된 글입니다' }), h('p', { class:'small muted' }, p.lock.hint || '비밀번호를 입력하세요.'), inp, ' ', h('button', { class:'btn pri', onclick: tryIt }, '열기'), fb));
  return box;
}

/* ============================================================
   메일 (2026)
   ============================================================ */
function openMail(arg){
  var W = openWin('mail', '메일 — 받은편지함', 820, 560);
  W.st = W.st || { sel: null, full: false };
  if (arg && arg.id) W.st.sel = arg.id;
  if (!W.st.sel && S.mails.length) W.st.sel = S.mails[S.mails.length - 1].id;
  W.refresh = function(){ renderMail(W); };
  renderMail(W);
}
function renderMail(W){
  W.body.innerHTML = '';
  if (W.st.sel && IDX.mails[W.st.sel] && !S.mailRead[W.st.sel]) { S.mailRead[W.st.sel] = true; W.st.fxPending = W.st.sel; save(); renderIcons(); }
  var list = h('div', { class:'mail-list' }), view = h('div', { class:'mail-view' });
  var ms = S.mails.slice().reverse();
  if (!ms.length) list.appendChild(h('div', { class:'empty' }, '받은 메일이 없습니다.'));
  ms.forEach(function(r){
    var m = IDX.mails[r.id]; if (!m) return;
    list.appendChild(h('div', { class:'mail-item' + (W.st.sel === r.id ? ' on' : '') + (S.mailRead[r.id] ? '' : ' unread'), onclick:function(){ W.st.sel = r.id; W.st.full = false; renderMail(W); } },
      h('div', { class:'mi-from' }, m.fromName + ' · ' + (m.date || r.at)), h('div', { class:'mi-sub' }, m.subject)));
  });
  if (W.st.sel && IDX.mails[W.st.sel]) {
    var m = IDX.mails[W.st.sel], rec = null;
    S.mails.forEach(function(x){ if (x.id === W.st.sel) rec = x; });
    if (W.st.fxPending === W.st.sel) { W.st.fxPending = null; fx(m.fx); }
    var hdr = '보낸 사람: ' + esc(m.fromName) + ' &lt;' + esc(m.from) + '&gt;<br>받는 사람: ' + esc(m.to || 'k3ngai@hotline.example') + '<br>날짜: ' + esc(m.date || (rec && rec.at) || '');
    if (W.st.full) hdr += (m.headers || []).map(function(x){ return '<br>' + esc(x); }).join('');
    var hdrEl = h('div', { class:'mail-hdr', html: hdr });
    var tog = h('button', { class:'btn mail-tog', onclick:function(){ W.st.full = !W.st.full; renderMail(W); } }, W.st.full ? '헤더 간단히' : '헤더 전체 보기');
    var body = h('div', { class:'mail-body', html: markup(m.body) });
    var at = h('div');
    (m.attach || []).forEach(function(a){
      at.appendChild(h('button', { class:'btn attach', html: ico(a.type === 'photo' ? 'image' : 'paperclip') + '<span>' + esc(a.name) + '</span>', onclick:function(){
        if (a.type === 'photo') openPhoto(a.scene, a.cap);
        else if (a.type === 'app') E.open(a.app);
      } }));
    });
    view.appendChild(h('h2', null, m.subject)); view.appendChild(hdrEl); view.appendChild(tog); view.appendChild(body);
    if ((m.attach || []).length) { view.appendChild(h('div', { class:'mail-att-h' }, '첨부 파일')); view.appendChild(at); }
    bindLinks(view);
  } else view.appendChild(h('div', { class:'empty' }, '메일을 선택하세요.'));
  W.body.appendChild(h('div', { class:'mail' }, list, view));
}

/* ============================================================
   미정리 기록부
   ============================================================ */
function confCount(){ return Object.keys(S.conf).length; }
function openRecord(){
  var W = openWin('record', '미정리 기록부', 940, 640);
  W.refresh = function(){ renderRecord(W); };
  renderRecord(W);
}
function renderRecord(W){
  var keepScroll = W.body.scrollTop;
  W.body.innerHTML = '';
  var total = IDX.peopleList.length, cc = confCount();
  var chkBtn = h('button', { class:'btn pri' }, '기록 대조');
  var fb = h('div', { class:'rec-fb' });
  var head = h('div', { class:'rec-head' },
    h('div', { class:'rec-row' }, h('h3', null, '달성 조건'), h('span', { class:'num', html: '정리됨 <b>' + cc + '</b>/' + total }), chkBtn),
    h('div', { class:'rec-bar' }, h('i', { style:'transform:scaleX(' + (cc / total) + ')' })),
    h('p', { class:'rec-rule' }, '한 사람의 네 칸이 모두 맞으면 「정리됨」이 됩니다. 3명 단위로만 확정을 알립니다. 맞은 사람이 3명 모일 때마다 그 3명이 한꺼번에 확정되고 잠기며, 어느 칸이 틀렸는지는 알려 주지 않습니다. 남은 사람이 3명보다 적으면 남은 전원이 맞을 때 확정됩니다. 「기록 대조」는 10초에 한 번 할 수 있습니다.'),
    fb);
  chkBtn.addEventListener('click', function(){
    var now = Date.now();
    if (now - (S.lastCheck || 0) < 10000) { fb.textContent = Math.ceil((10000 - (now - S.lastCheck)) / 1000) + '초 뒤에 다시 대조할 수 있습니다'; return; }
    S.lastCheck = now; S.recTries++;
    var r = recCheck();
    if (r) fb.textContent = r; else { fb.textContent = '아직 확정할 수 있는 묶음이 없습니다'; sfx('bad'); }
    save();
  });
  W.body.appendChild(head);
  var grid = h('div', { class:'rec-grid' });
  var shown = 0;
  IDX.peopleList.forEach(function(p){
    if (!S.cards[p.id]) return; shown++;
    var r = S.rec[p.id] || (S.rec[p.id] = { n:'', s:-1, w:-1, r:-1 });
    var locked = !!S.conf[p.id];
    function sel(key, opts, label){
      var s = h('select', { class:'inp', disabled: locked }, h('option', { value:'-1' }, label));
      opts.forEach(function(o, i){ s.appendChild(h('option', { value: String(i), selected: r[key] === i }, o)); });
      s.addEventListener('change', function(){ r[key] = +s.value; save(); });
      return s;
    }
    var nameInp = h('input', { class:'inp', value: r.n, disabled: locked, placeholder:'이름 (붙여 써도 됨)' });
    nameInp.addEventListener('input', function(){ r.n = nameInp.value; save(); });
    grid.appendChild(h('div', { class:'card' + (locked ? ' locked' : '') },
      h('span', { class:'c-st' }, locked ? '정리됨' : '미정리'),
      h('div', { class:'c-label' }, p.label),
      h('div', { class:'c-handle' + (locked ? ' redline' : '') }, p.handle),
      h('div', { class:'c-desc' }, p.desc),
      h('label', null, '이름'), nameInp,
      h('label', null, '현재 상태'), sel('s', D.options.status, '선택'),
      h('label', null, '2009년 8월 15일 밤 행적'), sel('w', D.options.where, '선택'),
      h('label', null, '사건에서의 역할'), sel('r', D.options.role, '선택')));
  });
  if (!shown) grid.appendChild(h('div', { class:'empty' }, '아직 기록할 인물이 없습니다.'));
  W.body.appendChild(grid);
  var fin = h('div', { class:'rec-final' });
  if (cc >= total && S.chapter >= IDX.chapters.length - 1) {
    fin.appendChild(h('button', { class:'btn pri lg', onclick:function(){ unlockApp('final'); E.open('final'); } }, '기록부 최종 제출'));
  } else if (cc >= total) {
    fin.appendChild(h('p', null, '모든 인물이 정리되었습니다. 이야기의 끝(종장)에서 최종 제출이 열립니다.'));
  } else {
    fin.appendChild(h('p', null, '종장에서 8명 전원이 「정리됨」이 되면 최종 제출이 열립니다. 인물 카드는 관련 페이지를 처음 발견할 때 추가됩니다. 지금 ' + shown + '/' + total + '명'));
  }
  W.body.appendChild(fin);
  W.body.scrollTop = keepScroll;
}
function recCorrect(pid){
  var p = IDX.people[pid], r = S.rec[pid];
  if (!r || !r.n || r.s < 0 || r.w < 0 || r.r < 0) return false;
  return p.answers.indexOf(HR(r.n, r.s, r.w, r.r)) >= 0;
}
function recCheck(){
  var unconf = IDX.peopleList.filter(function(p){ return S.cards[p.id] && !S.conf[p.id]; });
  var correct = unconf.filter(function(p){ return recCorrect(p.id); });
  var remaining = IDX.peopleList.length - confCount();
  var batch = null;
  if (correct.length >= 3) batch = correct.slice(0, 3);
  else if (remaining > 0 && remaining < 3 && correct.length === remaining) batch = correct;
  if (!batch) return null;
  batch.forEach(function(p){ S.conf[p.id] = true; });
  var names = batch.map(function(p){ return p.handle; }).join(', ');
  toast('기록 확정', names + ' — ' + batch.length + '명이 「정리됨」으로 확정되었습니다', 'good');
  sfx('unlock'); save();
  setTimeout(function(){ refreshWin('record'); }, 50);
  if (confCount() >= IDX.peopleList.length && S.chapter >= IDX.chapters.length - 1) { unlockApp('final'); }
  return batch.length + '명이 확정되었습니다';
}

/* ============================================================
   사건 연표
   ============================================================ */
function openTimeline(){
  var W = openWin('timeline', '사건 연표', 640, 600);
  W.refresh = function(){ renderTimeline(W); };
  renderTimeline(W);
}
function renderTimeline(W){
  var st = W.body.scrollTop;
  W.body.innerHTML = '';
  var items = Object.keys(S.tl).map(function(k){ return IDX.tl[k]; }).filter(Boolean).sort(function(a, b){ return a.t < b.t ? -1 : a.t > b.t ? 1 : 0; });
  var box = h('div', { class:'tl' }, h('p', { class:'tl-help' }, '발견한 사건이 시간순으로 자동 정렬됩니다. 각 카드 아래에 메모를 남길 수 있습니다.'));
  if (!items.length) box.appendChild(h('div', { class:'empty' }, '아직 기록된 사건이 없습니다.'));
  var yr = '';
  items.forEach(function(t){
    var y = t.t.slice(0, 4);
    if (y !== yr) { yr = y; box.appendChild(h('div', { class:'tl-year' }, y + '년')); }
    var ta = h('textarea', { placeholder:'메모…' }); ta.value = S.tlMemo[t.id] || '';
    ta.addEventListener('input', function(){ S.tlMemo[t.id] = ta.value; save(); });
    box.appendChild(h('div', { class:'tl-item' }, h('div', { class:'tt' }, t.t.replace(/-/g, '.')), h('div', { class:'tn' }, t.title), t.detail ? h('div', { class:'td' }, t.detail) : null, ta));
  });
  W.body.appendChild(box);
  W.body.scrollTop = st;
}

/* ============================================================
   메모장
   ============================================================ */
function openMemo(){
  var W = openWin('memo', '메모장', 520, 480);
  W.body.innerHTML = '';
  var ta = h('textarea', { placeholder:'자유롭게 메모하세요. 자동으로 저장됩니다.' }); ta.value = S.memo || '';
  var st = h('div', { class:'ms' }, '자동 저장됨');
  ta.addEventListener('input', function(){ S.memo = ta.value; save(); st.textContent = '저장 중…'; clearTimeout(ta._t); ta._t = setTimeout(function(){ st.textContent = '자동 저장됨 · ' + gameNow().hm; }, 500); });
  W.body.appendChild(h('div', { class:'memo' }, ta, st));
}

/* ============================================================
   추리 체크포인트
   ============================================================ */
function openCheckpoint(){
  var W = openWin('checkpoint', '추리 체크포인트', 680, 560);
  W.refresh = function(){ renderCP(W); };
  renderCP(W);
}
function renderCP(W){
  W.body.innerHTML = '';
  var box = h('div', { class:'cp' });
  for (var i = 0; i < S.chapter; i++) {
    var pc = IDX.chapters[i];
    if (pc.checkpoint) box.appendChild(h('div', { class:'cp-past', html: ico('check') + '<span>' + esc(pc.num + ' 「' + pc.title + '」 정리 완료') + '</span>' }));
  }
  var ch = IDX.chapters[S.chapter];
  box.appendChild(h('h3', null, ch.num + ' 「' + ch.title + '」'));
  if (!ch.checkpoint) {
    box.appendChild(h('p', { class:'muted', html: ch.cpNote || '' }));
    W.body.appendChild(box); return;
  }
  box.appendChild(h('p', { class:'cp-help' }, '빈칸을 채워 문장을 완성하세요. 틀리면 몇 칸이 맞았는지만 알려줍니다. 띄어쓰기와 대소문자는 상관없습니다.'));
  ch.checkpoint.sentences.forEach(function(sn){
    var done = !!S.cp[sn.id];
    var sent = h('div', { class:'cp-sent' + (done ? ' done' : '') });
    var inputs = [];
    var bi = 0;
    sn.parts.forEach(function(pt){
      if (typeof pt === 'string') { sent.appendChild(document.createTextNode(pt)); return; }
      var val = done && S.cpVals[sn.id] ? S.cpVals[sn.id][bi] : '';
      var el;
      if (pt.type === 'choice') {
        el = h('select', { class:'inp', disabled: done }, h('option', { value:'' }, '— 선택 —'));
        pt.opts.forEach(function(o){ el.appendChild(h('option', { value:o, selected: val === o }, o)); });
      } else {
        el = h('input', { class:'inp', placeholder: pt.ph || '', value: val || '', disabled: done, style:'width:' + (pt.w || 9) + 'em', autocomplete:'off' });
        el.addEventListener('keydown', function(e){ if (e.key === 'Enter') check(); });
      }
      inputs.push({ el: el, pt: pt }); bi++;
      sent.appendChild(el);
    });
    var fb = h('div', { class:'cp-fb' + (done ? ' good' : '') }, done ? '정답' : '');
    var btn = h('button', { class:'btn pri', disabled: done }, '확인');
    function check(){
      if (btn.disabled) return;
      var ok = 0, vals = [];
      inputs.forEach(function(x){ var v = x.el.value; vals.push(v); if (v && x.pt.ans.indexOf(H(v)) >= 0) ok++; });
      if (ok === inputs.length) {
        S.cp[sn.id] = true; S.cpVals[sn.id] = vals; sfx('good'); save();
        fb.className = 'cp-fb good'; fb.textContent = '정답';
        afterCP(ch); renderCP(W);
      } else {
        fb.className = 'cp-fb bad'; fb.textContent = inputs.length + '칸 중 ' + ok + '칸 정답'; sfx('bad');
        btn.disabled = true; setTimeout(function(){ btn.disabled = false; }, 2500);
      }
    }
    btn.addEventListener('click', check);
    sent.appendChild(h('div', { class:'cp-act' }, btn, fb));
    box.appendChild(sent);
  });
  if (ch.checkpoint.sentences.every(function(sn){ return S.cp[sn.id]; }) && ch.cpAfter) box.appendChild(h('p', { class:'cp-after', html: ch.cpAfter }));
  W.body.appendChild(box);
}
function afterCP(ch){
  if (!ch.checkpoint.sentences.every(function(sn){ return S.cp[sn.id]; })) return;
  if (S.flags['cpdone_' + ch.id]) return;
  S.flags['cpdone_' + ch.id] = true;
  toast('추리 체크포인트 통과', ch.num + ' 「' + ch.title + '」', 'good');
  fx(ch.checkpoint.onSolve);
  if (ch.checkpoint.next != null) setTimeout(function(){ startChapter(ch.checkpoint.next); }, 2200);
  save();
}

/* ============================================================
   단계별 힌트
   ============================================================ */
function openHint(){
  var W = openWin('hint', '단계별 힌트', 620, 600);
  W.st = W.st || { tab: 'ch' };
  W.refresh = function(){ renderHint(W); };
  renderHint(W);
}
function renderHint(W){
  var st = W.body.scrollTop;
  W.body.innerHTML = '';
  var tabs = h('div', { class:'tabs' },
    h('button', { class: W.st.tab === 'ch' ? 'on' : '', onclick:function(){ W.st.tab = 'ch'; renderHint(W); } }, '추리 문제'),
    h('button', { class: W.st.tab === 'pp' ? 'on' : '', onclick:function(){ W.st.tab = 'pp'; renderHint(W); } }, '기록부 인물'));
  var sec = h('div', { class:'hint-sec' }, h('p', { class:'h-help' }, '힌트는 3단계입니다. 방향, 어디를 볼지, 거의 정답 순서로 열립니다. 열어 본 횟수는 엔딩에 기록됩니다. (지금까지 ' + S.hints + '회)'));
  function item(key, q, hs){
    var lv = S.hintOpen[key] || 0;
    var row = h('div', { class:'hint-item' }, h('div', { class:'hq' }, q));
    var bl = h('div', { class:'hl' });
    ['1단계 방향', '2단계 어디를', '3단계 거의 정답'].forEach(function(lb, i){
      bl.appendChild(h('button', { class:'btn' + (lv > i ? ' done' : ''), disabled: i !== lv, html: (lv > i ? ico('check') : '') + '<span>' + lb + '</span>', onclick:function(){ S.hintOpen[key] = i + 1; S.hints++; save(); renderHint(W); } }));
    });
    row.appendChild(bl);
    for (var i = 0; i < lv; i++) { var tx = hs[i]; try { tx = decStr(hs[i], 'kengai-hint'); } catch (e) {} row.appendChild(h('div', { class:'ht', html: tx })); }
    return row;
  }
  if (W.st.tab === 'ch') {
    for (var c = S.chapter; c >= 0; c--) {
      var ch = IDX.chapters[c];
      if (!(ch.hints || []).length) continue;
      sec.appendChild(h('h3', null, ch.num + ' 「' + ch.title + '」'));
      ch.hints.forEach(function(hh, i){ sec.appendChild(item('c' + c + '_' + i, hh.q, hh.h)); });
    }
  } else {
    var any = false;
    IDX.peopleList.forEach(function(p){
      if (!S.cards[p.id]) return; any = true;
      sec.appendChild(item('p_' + p.id, p.handle + ' (' + p.label + ')' + (S.conf[p.id] ? ' — 정리됨' : ''), p.hint));
    });
    if (!any) sec.appendChild(h('div', { class:'empty' }, '기록부에 인물이 없습니다.'));
  }
  W.body.appendChild(tabs); W.body.appendChild(sec);
  W.body.scrollTop = st;
}

/* ============================================================
   발견 기록
   ============================================================ */
function openFound(){
  var W = openWin('found', '발견 기록', 560, 560);
  W.refresh = function(){ renderFound(W); };
  renderFound(W);
}
var KIND_LABEL = { page:'웹·보관본', thread:'나나채널', acc:'중얼중얼', video:'밀밀동화' };
function renderFound(W){
  W.body.innerHTML = '';
  var n = S.seenOrder.length, hs = Object.keys(S.hidden).length;
  var box = h('div', { class:'found-list' },
    h('div', { class:'found-head', html: '발견 페이지 <span class="num">' + n + '/' + IDX.total + '</span> · 숨은 기록 <span class="num">' + hs + '/' + IDX.hiddenTotal + '</span>' }),
    h('p', { class:'found-help' }, '지금까지 연 모든 페이지입니다. 누르면 바로 이동합니다. (최근 순)'));
  S.seenOrder.slice().reverse().forEach(function(e){
    var star = e.k === 'page' && IDX.pages[e.id] && IDX.pages[e.id].hidden;
    box.appendChild(h('div', { class:'found-row', onclick:function(){ gotoFound(e); } }, h('span', { class:'k' }, KIND_LABEL[e.k] || e.k), h('span', { class:'t' }, star ? h('span', { class:'dot', title:'숨은 기록' }) : null, e.title)));
  });
  W.body.appendChild(box);
}
function gotoFound(e){
  if (e.k === 'page') openSearch({ page: e.id });
  else if (e.k === 'thread') E.open('nana', { thread: e.id });
  else if (e.k === 'acc') { var p = e.id.split(':'); gotoSNS(p[0], p[1]); }
  else if (e.k === 'video') E.open('video');
}

/* ============================================================
   나나채널 (익명 게시판 과거 로그)
   ============================================================ */
function openNana(arg){
  var W = openWin('nana', '나나채널 — 과거 로그 창고', 860, 640);
  W.st = W.st || { view: 'boards' };
  if (arg && arg.thread) { W.st.view = 'thread'; W.st.tid = arg.thread; }
  W.refresh = function(){ renderNana(W); };
  renderNana(W);
  if (arg && arg.bottom) setTimeout(function(){ W.body.scrollTop = W.body.scrollHeight; }, 60);
}
function nanaGate(){ return IDX.chapters[0].gate; }
function renderNana(W){
  W.body.innerHTML = '';
  if (!S.flags.nana_login) return renderNanaLogin(W);
  if (W.st.view === 'thread' && IDX.threads[W.st.tid]) return renderThread(W, IDX.threads[W.st.tid]);
  var wrap = h('div', { class:'nana' });
  wrap.appendChild(h('div', { class:'nana-head' }, h('b', null, '나나채널'), h('span', { class:'nh-nav' }, '과거 로그 창고 · 로그인: ◆K3nGai')));
  var bd = h('div', { class:'nana-board' });
  bd.appendChild(h('div', { class:'nana-rule', html: D.nanaRule }));
  IDX.boards.forEach(function(b){
    var ths = IDX.threadList.filter(function(t){ return t.board === b.id && (!t.requires || S.flags[t.requires]); });
    if (!ths.length) return;
    bd.appendChild(h('h2', null, b.name));
    if (b.desc) bd.appendChild(h('div', { class:'small', style:'margin:-4px 0 8px' }, b.desc));
    var tl = h('div', { class:'nana-tl' });
    ths.forEach(function(t, i){
      var cnt = t._res.length + (S.flags.ending_true ? t._end.length : 0);
      tl.appendChild(h('div', null, (i + 1) + ': ', h('a', { onclick:function(){ W.st.view = 'thread'; W.st.tid = t.id; renderNana(W); W.body.scrollTop = 0; } }, t.title + ' (' + cnt + ')'), S.seen['thread:' + t.id] ? '' : h('span', { style:'color:#c00;font-size:11px' }, '  new')));
    });
    bd.appendChild(tl);
  });
  wrap.appendChild(bd);
  W.body.appendChild(wrap);
}
function renderNanaLogin(W){
  var g = nanaGate();
  var inp = h('input', { class:'inp', placeholder:'트립 키', autocomplete:'off', style:'width:100%;margin:6px 0' });
  var fb = h('div', { class:'small', style:'min-height:18px;color:#c00' });
  function go(){
    if (H(inp.value) === g.tripKey) {
      S.flags.nana_login = true; sfx('unlock'); save();
      toast('로그인 성공', '◆K3nGai — 17년 만의 로그인입니다', 'good');
      renderNana(W);
      if (S.chapter === 0) setTimeout(function(){ startChapter(1); }, 1200);
    } else { fb.textContent = '트립 키가 일치하지 않습니다.'; sfx('bad'); }
  }
  inp.addEventListener('keydown', function(e){ if (e.key === 'Enter') go(); });
  W.body.appendChild(h('div', { class:'nana' }, h('div', { class:'nana-head' }, h('b', null, '나나채널'), h('span', { class:'nh-nav' }, '과거 로그 창고')),
    h('div', { class:'nana-login' }, h('h2', null, '트립 로그인'), h('div', { html: g.text }), inp, h('button', { class:'btn pri', onclick: go }, '로그인'), fb,
      h('div', { class:'nana-rule', html: D.nanaRule }))));
}
function resBody(body){
  var s = esc(body).replace(/¶/g, '<br>');
  s = s.replace(/&gt;&gt;(\d+)/g, '<span class="anc" data-anc="$1">&gt;&gt;$1</span>');
  return s;
}
function resHTML(t, r, counts, idx, extraCls){
  var cls = 'res' + (r.del ? ' del' : '') + (r.flags.indexOf('dossier') >= 0 ? ' dossier' : '') + (extraCls ? ' ' + extraCls : '');
  if (r.del) return '<div class="' + cls + '" data-no="' + r.no + '"><div class="rh"><span class="no">' + r.no + '</span> ：<span class="nm">삭제됨</span>：삭제됨 ID:???</div><div class="rb">이 레스는 삭제되었습니다.</div></div>';
  var name = esc(r.name || '이름 없음');
  var trip = r.trip ? ' <span class="trip idl" data-trip="' + esc(r.trip) + '">◆' + esc(r.trip) + '</span>' : '';
  var c = counts[r.date + r.id] || 1, k = idx[r.date + r.id + '#' + r.no];
  return '<div class="' + cls + '" data-no="' + r.no + '"><div class="rh"><span class="no">' + r.no + '</span> ：<span class="nm">' + name + '</span>' + trip +
    '：' + esc(r.date) + '(' + dowOf(r.date) + ') ' + esc(r.time) + ' <span class="idl" data-id="' + esc(r.id) + '" data-date="' + esc(r.date) + '">ID:' + esc(r.id) + '</span> <span class="small">(' + k + '/' + c + ')</span></div><div class="rb">' + resBody(r.body) + '</div></div>';
}
function threadRes(t){
  var all = t._res.slice();
  if (S.flags.ending_true && t._end.length) t._end.forEach(function(r){ all.push(Object.assign({}, r, { no: all.length + 1, isNew: true })); });
  return all;
}
function renderThread(W, t){
  discover('thread', t.id, t.title);
  fx(t.fx);
  var all = threadRes(t);
  var counts = {}, idx = {};
  all.forEach(function(r){ if (r.del) return; var k = r.date + r.id; counts[k] = (counts[k] || 0) + 1; idx[k + '#' + r.no] = counts[k]; });
  var wrap = h('div', { class:'nana' });
  var board = IDX.boards.filter(function(b){ return b.id === t.board; })[0];
  wrap.appendChild(h('div', { class:'nana-head' }, h('a', { onclick:function(){ W.st.view = 'boards'; renderNana(W); } }, '← 게시판 목록'), h('span', { class:'nh-nav' }, (board ? board.name : '') + ' · ' + (t.url || ''))));
  var html = '<div class="nana-thread"><h1>' + esc(t.title) + '</h1>';
  if (t.note) html += '<div class="small" style="margin-bottom:12px;color:#555">' + esc(t.note) + '</div>';
  var closed = false;
  all.forEach(function(r){
    if (r.isNew && !closed && t.closing) { html += '<div class="small" style="color:#c00;margin:10px 0 14px">' + esc(t.closing) + '</div>'; closed = true; }
    html += resHTML(t, r, counts, idx, r.isNew ? 'newres' : '');
  });
  if (t.closing && !closed) html += '<div class="small" style="color:#c00;margin-top:10px">' + esc(t.closing) + '</div>';
  html += '</div>';
  var body = h('div', { html: html });
  wrap.appendChild(body);
  W.body.appendChild(wrap);
  // 앵커 · ID · 트립 팝업
  body.addEventListener('click', function(e){
    var a = e.target.closest('.anc');
    if (a) { var no = +a.getAttribute('data-anc'); var r = all[no - 1]; showPop(e, r ? resHTML(t, r, counts, idx) : '<div class="small">(&gt;&gt;' + no + ' 레스는 이 스레드에 없습니다)</div>'); return; }
    var il = e.target.closest('.idl');
    if (il) {
      var hs = '', n = 0;
      if (il.getAttribute('data-trip')) {
        var tr = il.getAttribute('data-trip');
        all.forEach(function(r){ if (!r.del && r.trip === tr) { hs += resHTML(t, r, counts, idx); n++; } });
        showPop(e, '<div class="small" style="margin-bottom:6px"><b>트립 ◆' + esc(tr) + '</b> — 이 스레드에서 ' + n + '개 (트립은 날짜가 바뀌어도 같습니다)</div>' + hs);
      } else {
        var id = il.getAttribute('data-id'), dt = il.getAttribute('data-date');
        all.forEach(function(r){ if (!r.del && r.id === id && r.date === dt) { hs += resHTML(t, r, counts, idx); n++; } });
        showPop(e, '<div class="small" style="margin-bottom:6px"><b>ID:' + esc(id) + '</b> (' + esc(dt) + ') — 이 스레드에서 ' + n + '개 (ID는 그날 하루 동안 사이트 전체에서 같습니다)</div>' + hs);
      }
      return;
    }
  });
  body.addEventListener('mouseover', function(e){
    var a = e.target.closest('.anc'); if (!a || isMobile()) return;
    var no = +a.getAttribute('data-anc'); var r = all[no - 1];
    showPop(e, r ? resHTML(t, r, counts, idx) : '<div class="small">(없음)</div>');
  });
  if (t.guilt && !S.guiltSeen[t.id]) {
    S.guiltSeen[t.id] = true; save();
    setTimeout(function(){
      var tgt = body.querySelector('.res.dossier');
      if (tgt) tgt.scrollIntoView({ block:'center' });
      setTimeout(function(){ guiltScene(t.guilt); }, 1600);
    }, 400);
  }
}
var popEl = null;
function showPop(e, html){
  hidePop();
  popEl = h('div', { class:'nana-pop', html: html });
  document.body.appendChild(popEl);
  var x = Math.min(window.innerWidth - popEl.offsetWidth - 8, e.clientX + 8), y = e.clientY + 14;
  if (y + popEl.offsetHeight > window.innerHeight - 50) y = Math.max(8, e.clientY - popEl.offsetHeight - 10);
  popEl.style.left = Math.max(8, x) + 'px'; popEl.style.top = y + 'px';
  popEl.addEventListener('mouseleave', hidePop);
}
function hidePop(){ if (popEl) { popEl.remove(); popEl = null; } }
document.addEventListener('pointerdown', function(e){ if (popEl && !e.target.closest('.nana-pop') && !e.target.closest('.anc') && !e.target.closest('.idl')) hidePop(); });
document.addEventListener('keydown', function(e){ if (e.key === 'Escape') hidePop(); });

/* ============================================================
   밀밀동화 (탄막 동영상 · 녹화 보관본)
   ============================================================ */
function openVideo(arg){
  var W = openWin('video', '밀밀동화 — 녹화 보관본', 1000, 680);
  var ids = Object.keys(IDX.videos);
  if (!W.st) buildVideo(W, IDX.videos[ids[0]]);
  if (arg && arg.t != null) seekVideo(W, arg.t);
}
function buildVideo(W, v){
  discover('video', v.id, v.title);
  var st = W.st = { v: v, t: 0, playing: false, speed: 1, last: 0, seg: -1, lastSec: -1, raf: 0, lanes: [] };
  var screen = h('div', { class:'mm-screen' });
  var scene = h('div', { style:'position:absolute;inset:0' }), dm = h('div', { style:'position:absolute;inset:0;overflow:hidden' });
  screen.appendChild(scene); screen.appendChild(dm);
  var playBtn = h('button', null, '▶ 재생');
  var slider = h('input', { type:'range', min:'0', max: String(v._dur), step:'0.5', value:'0', 'aria-label':'재생 위치' });
  var tm = h('span', { class:'mm-time' }, '00:00 / ' + v.duration);
  var spBtns = [1, 4, 16].map(function(s){ return h('button', { class: s === 1 ? 'on' : '', onclick:function(){ st.speed = s; spBtns.forEach(function(b){ b.classList.toggle('on', b.textContent === '×' + s); }); } }, '×' + s); });
  var jump = h('input', { class:'inp', placeholder:'mm:ss', style:'width:70px;padding:3px 6px;background:#222;color:#eee;border-color:#555' });
  var jumpBtn = h('button', { onclick:function(){ var s = parseSec(jump.value); if (s != null) seekVideo(W, s); } }, '이동');
  jump.addEventListener('keydown', function(e){ if (e.key === 'Enter') jumpBtn.click(); });
  var ctrl = h('div', { class:'mm-ctrl' }, playBtn, slider, tm);
  var ctrl2 = h('div', { class:'mm-ctrl', style:'padding-top:0' }, h('span', { class:'small' }, '속도'), spBtns, h('span', { class:'small', style:'margin-left:10px' }, '시간 이동'), jump, jumpBtn);
  var desc = h('div', { class:'mm-desc' });
  var info = h('div', { class:'mm-info', html: markup(v.info) });
  var clh = h('div', { class:'cl-h' }, '댓글 목록 (현재 시간 ±20초)');
  var cl = h('div', { class:'cl' });
  var prof = h('div', { class:'mm-prof hidden' });
  var right = h('div', { class:'mm-right' }, clh, cl);
  var left = h('div', { class:'mm-left' }, screen, ctrl, ctrl2, desc, prof, info);
  W.body.innerHTML = '';
  W.body.appendChild(h('div', { class:'mm' }, h('div', { class:'mm-head' }, h('span', { class:'logo' }, '밀밀동화'), h('b', null, v.title)), h('div', { class:'mm-main' }, left, right)));
  bindLinks(info);
  st.el = { screen: screen, scene: scene, dm: dm, playBtn: playBtn, slider: slider, tm: tm, desc: desc, cl: cl, prof: prof };
  playBtn.addEventListener('click', function(){ st.playing ? pauseVideo(W) : playVideo(W); });
  screen.style.cursor = 'zoom-in';
  screen.addEventListener('click', function(){ var sg = v.segments[st.seg]; if (sg) { pauseVideo(W); openPhoto(sg.scene, '[' + fmtSec(st.t) + '] ' + sg.desc); } });
  slider.addEventListener('input', function(){ seekVideo(W, +slider.value, true); });
  cl.addEventListener('click', function(e){ var u = e.target.closest('.cu'); if (u) showMMUser(W, u.getAttribute('data-u')); });
  W.onclose = function(){ st.playing = false; cancelAnimationFrame(st.raf); };
  W.onmin = function(){ pauseVideo(W); };
  seekVideo(W, 0, true);
}
function playVideo(W){
  var st = W.st; if (st.t >= st.v._dur) seekVideo(W, 0);
  st.playing = true; st.el.playBtn.textContent = '❚❚ 일시정지'; st.last = performance.now();
  var loop = function(now){
    if (!st.playing) return;
    var dt = Math.min(.25, (now - st.last) / 1000); st.last = now;
    var t0 = st.t; st.t = Math.min(st.v._dur, st.t + dt * st.speed);
    spawnRange(W, t0, st.t);
    updVideo(W);
    if (st.t >= st.v._dur) { pauseVideo(W); return; }
    st.raf = requestAnimationFrame(loop);
  };
  st.raf = requestAnimationFrame(loop);
}
function pauseVideo(W){ var st = W.st; if (!st) return; st.playing = false; cancelAnimationFrame(st.raf); st.el.playBtn.textContent = '▶ 재생'; }
function seekVideo(W, t, fromSlider){
  var st = W.st; st.t = Math.max(0, Math.min(st.v._dur, t));
  st.el.dm.innerHTML = '';
  st.v._c.forEach(function(c){ if (c.t > st.t - 3.5 && c.t <= st.t) spawnDM(W, c, (st.t - c.t) / 5); });
  if (!fromSlider) st.el.slider.value = st.t;
  updVideo(W, true);
}
function spawnRange(W, a, b){
  var st = W.st, n = 0;
  for (var i = 0; i < st.v._c.length; i++) { var c = st.v._c[i]; if (c.t > a && c.t <= b) { if (n++ < 14) spawnDM(W, c, 0); } if (c.t > b) break; }
}
function spawnDM(W, c, progress){
  var st = W.st, layer = st.el.dm;
  if (layer.childElementCount > 46) layer.firstChild.remove();
  var el = h('div', { class:'mm-dm' + (c.text.length > 24 ? ' small' : '') + (c.color ? ' ' + c.color : '') }, c.del ? '' : c.text);
  if (c.del) return;
  var hgt = layer.clientHeight || 300, lanes = Math.max(6, Math.floor(hgt / 26));
  var lane = Math.floor(Math.abs(Math.sin(c.t * 12.9898) * 43758.5453) % lanes);
  el.style.top = (lane * (hgt - 24) / lanes + 2) + 'px'; el.style.left = '0px';
  layer.appendChild(el);
  var w = layer.clientWidth || 600, ew = el.offsetWidth || 100;
  var dur = 5200 / Math.sqrt(st.speed);
  try {
    var an = el.animate([{ transform:'translateX(' + w + 'px)' }, { transform:'translateX(' + (-ew - 10) + 'px)' }], { duration: dur, easing:'linear', fill:'forwards' });
    if (progress > 0) an.currentTime = Math.min(.98, progress) * dur;
    an.onfinish = function(){ el.remove(); };
  } catch (e) { setTimeout(function(){ el.remove(); }, 5000); }
}
function updVideo(W, force){
  var st = W.st, v = st.v, t = st.t;
  if (st.playing) st.el.slider.value = t;
  st.el.tm.textContent = fmtSec(t) + ' / ' + v.duration;
  var si = -1;
  for (var i = 0; i < v.segments.length; i++) if (t >= v.segments[i]._a && t < v.segments[i]._b) { si = i; break; }
  if (si < 0) si = v.segments.length - 1;
  if (si !== st.seg || force) {
    if (si !== st.seg) { st.seg = si; st.el.scene.innerHTML = sceneSVG(v.segments[si].scene); }
    st.el.desc.innerHTML = '<b>[' + v.segments[si].from + ' ~ ' + v.segments[si].to + ']</b> ' + v.segments[si].desc;
  }
  var sec = Math.floor(t);
  if (sec !== st.lastSec || force) { st.lastSec = sec; renderCL(W); }
  (v.events || []).forEach(function(ev){
    if (S.vidFx[ev.id]) return;
    if (t >= ev._t - 1 && t <= ev._t + (ev.win || 25)) { S.vidFx[ev.id] = true; fx(ev.fx); save(); }
  });
}
function renderCL(W){
  var st = W.st, t = st.t, cl = st.el.cl;
  var rows = st.v._c.filter(function(c){ return c.t >= t - 20 && c.t <= t + 20; });
  var html = '';
  rows.forEach(function(c){
    var u = st.v.users[c.u], name = u ? u.label : c.u;
    html += '<div class="cl-row' + (c.del ? ' del' : '') + '" style="' + (c.t > t ? 'opacity:.45' : '') + '"><span class="ct">' + fmtSec(c.t) + '</span><span class="cu" data-u="' + esc(c.u) + '">' + esc(name) + '</span><span class="cx">' + (c.del ? '(운영자에 의해 삭제된 댓글)' : esc(c.text)) + '</span></div>';
  });
  cl.innerHTML = html || '<div class="empty" style="color:#777">이 구간에는 댓글이 없습니다.</div>';
}
function showMMUser(W, key){
  var st = W.st, u = st.v.users[key], p = st.el.prof;
  p.classList.remove('hidden');
  if (u) { p.innerHTML = markup(u.html); bindLinks(p); fx(u.fx); }
  else p.innerHTML = '<b>' + esc(key) + '</b> · 일반 회원<br><span class="small" style="color:#999">프로필 비공개 · 이 회원의 다른 정보는 남아 있지 않습니다.</span>';
}

/* ============================================================
   중얼중얼 (SNS)
   ============================================================ */
function acc(era, id){ return IDX.accounts[era + ':' + String(id).toLowerCase()]; }
function openSNS(arg){
  var W = openWin('sns', '중얼중얼', 780, 640);
  W.st = W.st || { era: '2009', view: 'home', sub: 'posts', hist: [] };
  if (arg) {
    if (arg.era) W.st.era = arg.era;
    if (arg.acc) { pushSNS(W); W.st.view = 'prof'; W.st.acc = arg.acc; W.st.sub = 'posts'; }
  }
  W.refresh = function(){ renderSNS(W); };
  renderSNS(W);
}
function pushSNS(W){ W.st.hist.push({ era: W.st.era, view: W.st.view, acc: W.st.acc, tag: W.st.tag, sub: W.st.sub, q: W.st.q }); if (W.st.hist.length > 40) W.st.hist.shift(); }
function snsGo(W, o){ pushSNS(W); for (var k in o) W.st[k] = o[k]; renderSNS(W); W.body.scrollTop = 0; }
function renderSNS(W){
  var st = W.st, era = st.era;
  W.body.innerHTML = '';
  var root = h('div', { class:'sns ' + (era === '2009' ? 'e09' : 'e26') });
  function eraBtn(e){ return h('button', { class: era === e ? 'on' : '', onclick:function(){
    if (e === '2026' && !S.flags.sns2026) { toast('아직 열 수 없습니다', '2026 현재 탭은 아직 잠겨 있습니다', 'bad'); return; }
    snsGo(W, { era: e, view: 'home' }); } }, e === '2009' ? '2009 아카이브' : '2026 현재'); }
  var inp = h('input', { class:'inp', placeholder:'@아이디 또는 #해시태그', autocomplete:'off' });
  var form = h('form', { class:'sns-form', onsubmit:function(e){ e.preventDefault(); snsSearch(W, inp.value); } }, inp, h('button', { class:'btn', type:'submit' }, '찾기'));
  var back = h('button', { class:'btn', onclick:function(){ var p = st.hist.pop(); if (p) { for (var k in p) st[k] = p[k]; renderSNS(W); } } }, '←');
  root.appendChild(h('div', { class:'sns-top' }, back, h('span', { class:'sns-logo' }, '중얼중얼'), h('div', { class:'sns-era' }, eraBtn('2009'), eraBtn('2026')), form));
  var body = h('div', { class:'sns-body' });
  if (st.view === 'prof') renderProfile(W, body);
  else if (st.view === 'tag') renderTag(W, body);
  else if (st.view === 'none') body.appendChild(h('div', { class:'sns-zero' }, h('div', { class:'z', html:'검색 결과 <em>0</em>건' }), h('p', null, '「' + (st.q || '') + '」 — @아이디나 #해시태그를 정확히 입력하세요.')));
  else {
    var hm = D.sns['home' + era];
    body.appendChild(h('div', { class:'sns-home', html: hm.text }));
    var tg = h('div', { class:'sns-home' }, h('b', null, '많이 쓰인 해시태그 '));
    hm.tags.forEach(function(t){ tg.appendChild(h('span', { class:'tag', style:'cursor:pointer', onclick:function(){ snsGo(W, { view:'tag', tag: t }); } }, '#' + t)); });
    body.appendChild(tg);
  }
  root.appendChild(body);
  W.body.appendChild(root);
}
function snsSearch(W, q){
  q = String(q || '').trim(); if (!q) return;
  if (q.charAt(0) === '#') {
    var tag = q.slice(1);
    if (postsWithTag(W.st.era, tag).length) return snsGo(W, { view:'tag', tag: tag });
  } else {
    var id = q.replace(/^@/, '');
    if (acc(W.st.era, id)) return snsGo(W, { view:'prof', acc: id, sub:'posts' });
  }
  snsGo(W, { view:'none', q: q });
}
function postsWithTag(era, tag){
  var t = '#' + tag.toLowerCase();
  function has(s){ return (' ' + String(s).toLowerCase() + ' ').split(/[\s,.!?()]/).indexOf(t) >= 0; }
  return IDX.posts.filter(function(p){ return p.era === era && (has(p.t) || (p.rp || []).some(function(r){ return has(r[2]); })); });
}
function linkify(s){
  return esc(s).replace(/@([A-Za-z0-9_]+)/g, '<span class="mn" data-acc="$1">@$1</span>').replace(/#([^\s#@.,!?()\[\]&;]+)/g, '<span class="ht" data-tag="$1">#$1</span>');
}
function avatar(a){ return h('div', { class:'av', style:'background:' + (a.color || '#789') }, a.av || a.name.charAt(0)); }
function postEl(W, p, isReply){
  var a = acc(p.era, p.by) || { name: p.by, id: p.by };
  var el = h('div', { class:'post' });
  el.appendChild(h('div', { class:'ph' }, h('b', { 'data-acc': a.id }, a.name), ' ', h('span', { class:'pi', 'data-acc': a.id }, '@' + a.id), ' · ', h('span', { class:'pd' }, p.d)));
  el.appendChild(h('div', { class:'pt', html: linkify(p.t) }));
  if (p.scene) el.appendChild(h('div', { html: markup('[[photo:' + p.scene + '|' + (p.cap || '사진') + ']]') }));
  if (!isReply) {
    var rp = p.rp || [];
    var act = h('div', { class:'pa' }, h('span', null, '답글 ' + rp.length), h('span', null, '퍼가기 ' + (p.rt || 0)), h('span', null, '좋아요 ' + (p.fav || 0)));
    el.appendChild(act);
    if (rp.length) {
      var rep = h('div', { class:'rep' });
      rp.forEach(function(r){ rep.appendChild(postEl(W, { era: p.era, by: r[0], d: r[1], t: r[2] }, true)); });
      el.appendChild(rep);
    }
  }
  return el;
}
function bindSNS(W, root){
  root.addEventListener('click', function(e){
    var m = e.target.closest('[data-acc]');
    if (m) { var id = m.getAttribute('data-acc'); if (acc(W.st.era, id)) snsGo(W, { view:'prof', acc: id, sub:'posts' }); else toast('계정을 찾을 수 없습니다', '@' + id + ' — 탈퇴했거나 이 시기의 기록이 없습니다', 'bad'); return; }
    var t = e.target.closest('[data-tag]');
    if (t) { snsGo(W, { view:'tag', tag: t.getAttribute('data-tag') }); return; }
    var ac2 = e.target.closest('.acc-row');
    if (ac2 && ac2.getAttribute('data-go')) snsGo(W, { view:'prof', acc: ac2.getAttribute('data-go'), sub:'posts' });
  });
  $$('figure.photo', root).forEach(function(f){ f.addEventListener('click', function(ev){ ev.stopPropagation(); openPhoto(f.getAttribute('data-scene'), f.getAttribute('data-cap')); }); });
}
function renderProfile(W, body){
  var st = W.st, a = acc(st.era, st.acc);
  if (!a) { body.appendChild(h('div', { class:'empty' }, '이 계정은 존재하지 않습니다.')); return; }
  discover('acc', st.era + ':' + a.id, a.name + ' (@' + a.id + ') · ' + st.era);
  fx(a.fx);
  var prof = h('div', { class:'sns-prof' }, avatar(a), h('div', { class:'pn', html: esc(a.name) + (a.verified ? ico('badge-check') : '') + (a.locked ? ico('lock') : '') }), h('div', { class:'pid' }, '@' + a.id),
    h('div', { class:'pb', html: linkify(a.bio || '') }),
    h('div', { class:'pm', html: (a.loc ? ico('map-pin') + esc(a.loc) + '&nbsp;&nbsp;' : '') + '가입: ' + esc(a.joined || '?') }),
    h('div', { class:'pf' }, h('a', { onclick:function(){ st.sub = 'following'; renderSNS(W); } }, h('b', null, String(a.fwingCount != null ? a.fwingCount : (a.following || []).length)), ' 팔로잉'),
      h('a', { onclick:function(){ st.sub = 'followers'; renderSNS(W); } }, h('b', null, String(a.fwerCount != null ? a.fwerCount : (a.followers || []).length)), ' 팔로워')));
  body.appendChild(prof);
  function sb(k, l){ return h('button', { class: st.sub === k ? 'on' : '', onclick:function(){ st.sub = k; renderSNS(W); } }, l); }
  body.appendChild(h('div', { class:'sns-sub' }, sb('posts', '게시물'), sb('following', '팔로잉'), sb('followers', '팔로워')));
  var list = h('div');
  if (st.sub === 'posts') {
    var ps = IDX.posts.filter(function(p){ return p.era === st.era && p.by === a.id; }).sort(function(x, y){ return x.d < y.d ? 1 : -1; });
    ps.forEach(function(p){ list.appendChild(postEl(W, p)); });
    if (!ps.length && !a.locked) list.appendChild(h('div', { class:'empty' }, '게시물이 없습니다.'));
  } else {
    var ids = st.sub === 'following' ? (a.following || []) : (a.followers || []);
    if (!ids.length) list.appendChild(h('div', { class:'empty' }, '표시할 계정이 없습니다.'));
    ids.forEach(function(id){
      var b = acc(st.era, id);
      list.appendChild(h('div', { class:'acc-row', 'data-go': b ? b.id : null, style: b ? '' : 'opacity:.55;cursor:default' }, b ? avatar(b) : h('div', { class:'av', style:'background:#999' }, '?'),
        h('div', null, h('div', { class:'an' }, b ? b.name : '(정보 없음)'), h('div', { class:'ai' }, '@' + id + (b ? '' : ' · 탈퇴했거나 기록 없음')))));
    });
    if (st.sub === 'followers' && a.fwerCount && a.fwerCount > ids.length) list.appendChild(h('div', { class:'small muted', style:'padding:8px 12px' }, '…외 ' + (a.fwerCount - ids.length) + '명 (보관본에는 일부만 남아 있습니다)'));
  }
  body.appendChild(list);
  bindSNS(W, body);
}
function renderTag(W, body){
  var st = W.st, ps = postsWithTag(st.era, st.tag).sort(function(x, y){ return x.d < y.d ? 1 : -1; });
  body.appendChild(h('div', { class:'sns-prof' }, h('div', { class:'pn' }, '#' + st.tag), h('div', { class:'pid' }, st.era + ' · 게시물 ' + ps.length + '개')));
  if (!ps.length) body.appendChild(h('div', { class:'empty' }, '이 해시태그가 달린 게시물이 없습니다.'));
  ps.forEach(function(p){ body.appendChild(postEl(W, p)); });
  bindSNS(W, body);
}

/* ============================================================
   폴더폰 메일함 (2009 백업)
   ============================================================ */
var KEYS = { '1':'.,?!', '2':'ABC', '3':'DEF', '4':'GHI', '5':'JKL', '6':'MNO', '7':'PQRS', '8':'TUV', '9':'WXYZ', '0':' ' };
function openPhone(){
  var W = openWin('phone', '폴더폰 메일함 — 2009 백업', 420, 680);
  W.st = W.st || { scr: S.flags.phone_open ? 'menu' : 'lock', buf: '', sel: 0, box: null, mid: null, mt: { txt: '', k: null, i: 0, tm: 0 }, msg: '' };
  renderPhone(W);
}
function phoneBoxes(){ return D.phone.boxes; }
function phoneMails(box){ return Object.keys(IDX.mails).map(function(k){ return IDX.mails[k]; }).filter(function(m){ return m.box === box; }).sort(function(a, b){ return a.date < b.date ? 1 : -1; }); }
function renderPhone(W){
  var st = W.st;
  W.body.innerHTML = '';
  var main = h('div', { class:'ph-main' }), soft = h('div', { class:'ph-soft' });
  var bar = h('div', { class:'ph-bar' }, h('span', null, '권외'), h('span', null, '2009/08/15 22:30'), h('span', null, '▮▮▮▯'));
  var title = '';
  if (st.scr === 'lock') {
    title = '잠금';
    main.innerHTML = '\n  ' + esc(D.phone.lockText) + '\n\n  비밀번호 4자리\n\n      [ ' + ('●●●●'.slice(0, st.buf.length) + '____'.slice(st.buf.length)) + ' ]\n\n  ' + esc(st.msg || '') + '\n\n  ' + esc(D.phone.lockHint);
    soft.innerHTML = '<span>지우기(#)</span><span>OK 확인</span>';
  } else if (st.scr === 'menu') {
    title = '메일';
    var items = phoneBoxes().map(function(b){ return b.name + ' (' + phoneMails(b.id).length + ')'; }).concat(['문자 입력 연습']);
    main.innerHTML = '<b>— 메일 메뉴 —</b>\n' + items.map(function(x, i){ return '<div class="li' + (st.sel === i ? ' sel' : '') + '" data-i="' + i + '">' + (i + 1) + '. ' + esc(x) + '</div>'; }).join('');
    soft.innerHTML = '<span>번호 / ▲▼</span><span>OK 선택</span>';
  } else if (st.scr === 'list') {
    var box = phoneBoxes().filter(function(b){ return b.id === st.box; })[0];
    var ms = phoneMails(st.box);
    main.innerHTML = '<b>— ' + esc(box.name) + ' —</b>\n' + (ms.length ? ms.map(function(m, i){ return '<div class="li' + (st.sel === i ? ' sel' : '') + '" data-i="' + i + '">' + esc(m.date.slice(5)) + ' ' + esc(m.fromName.slice(0, 8)) + '\n  ' + esc(m.subject.slice(0, 16)) + '</div>'; }).join('') : '(메일 없음)');
    soft.innerHTML = '<span>◀ 뒤로</span><span>OK 열기</span>';
  } else if (st.scr === 'view') {
    var m = IDX.mails[st.mid];
    main.innerHTML = '보낸이: ' + esc(m.fromName) + '\n받는이: ' + esc(m.toName || '') + '\n' + esc(m.date) + '\n제목: ' + esc(m.subject) + '\n────────────\n' + esc(m.body);
    soft.innerHTML = '<span>◀ 뒤로</span><span>▲▼ 스크롤</span>';
  } else if (st.scr === 'practice') {
    main.innerHTML = '<b>— 문자 입력 연습 —</b>\n같은 키를 빠르게 여러 번 = 다음 글자\n(2→A, 22→B, 222→C)\n0 = 띄어쓰기, # = 한 글자 지우기\n* = 모두 지우기\n────────────\n' + esc(st.mt.txt) + '<span style="background:#b6f5a6">&nbsp;</span>';
    soft.innerHTML = '<span>◀ 뒤로</span><span>대문자 영문</span>';
  }
  var screen = h('div', { class:'ph-screen' }, bar, main, soft);
  var keys = h('div', { class:'ph-keys' });
  ['1','2','3','4','5','6','7','8','9','*','0','#'].forEach(function(k){
    var sub = k === '0' ? '띄어쓰기' : k === '1' ? '.,?!' : (KEYS[k] || '');
    keys.appendChild(h('button', { onclick:function(){ phoneKey(W, k); } }, k, h('small', null, sub)));
  });
  var nav = h('div', { class:'ph-nav', style:'grid-template-columns:repeat(4,1fr)' },
    h('button', { onclick:function(){ phoneKey(W, 'back'); } }, '◀ 뒤로'), h('button', { onclick:function(){ phoneKey(W, 'up'); } }, '▲'),
    h('button', { onclick:function(){ phoneKey(W, 'down'); } }, '▼'), h('button', { onclick:function(){ phoneKey(W, 'ok'); } }, 'OK'));
  var phone = h('div', { class:'phone' }, h('div', { class:'center small', style:'color:#333;margin-bottom:6px;font-weight:700' }, title || '유메'), screen, nav, keys);
  W.body.appendChild(h('div', { class:'phone-wrap' }, phone));
  main.addEventListener('click', function(e){
    var li = e.target.closest('.li'); if (!li) return;
    st.sel = +li.getAttribute('data-i'); phoneKey(W, 'ok');
  });
  if (st.scr === 'view' && st.scroll) main.scrollTop = st.scroll;
}
function phoneKey(W, k){
  var st = W.st; sfx('key');
  if (st.scr === 'lock') {
    if (/^\d$/.test(k) && st.buf.length < 4) { st.buf += k; st.msg = ''; }
    else if (k === '#' || k === 'back') st.buf = st.buf.slice(0, -1);
    else if (k === 'ok') {
      if (H(st.buf) === D.phone.lock) { S.flags.phone_open = true; st.scr = 'menu'; st.sel = 0; sfx('good'); fx(D.phone.fx); save(); }
      else { st.msg = '비밀번호가 다릅니다'; st.buf = ''; sfx('bad'); }
    }
  } else if (st.scr === 'menu') {
    var n = phoneBoxes().length + 1;
    if (k === 'up') st.sel = (st.sel + n - 1) % n;
    else if (k === 'down') st.sel = (st.sel + 1) % n;
    else if (/^[1-9]$/.test(k) && +k <= n) { st.sel = +k - 1; k = 'ok'; }
    if (k === 'ok') {
      if (st.sel < n - 1) { st.box = phoneBoxes()[st.sel].id; st.scr = 'list'; st.sel = 0; }
      else { st.scr = 'practice'; st.mt = { txt: '', k: null, i: 0, tm: 0 }; }
    }
  } else if (st.scr === 'list') {
    var ms = phoneMails(st.box);
    if (k === 'up') st.sel = Math.max(0, st.sel - 1);
    else if (k === 'down') st.sel = Math.min(ms.length - 1, st.sel + 1);
    else if (k === 'back') { st.scr = 'menu'; st.sel = 0; }
    else if (k === 'ok' && ms[st.sel]) { st.mid = ms[st.sel].id; st.scr = 'view'; st.scroll = 0; st.lsel = st.sel; fx(ms[st.sel].fx); }
  } else if (st.scr === 'view') {
    if (k === 'back') { st.scr = 'list'; st.sel = st.lsel || 0; }
    else if (k === 'down') st.scroll = (st.scroll || 0) + 60;
    else if (k === 'up') st.scroll = Math.max(0, (st.scroll || 0) - 60);
  } else if (st.scr === 'practice') {
    var mt = st.mt, now = Date.now();
    if (k === 'back') { st.scr = 'menu'; st.sel = phoneBoxes().length; }
    else if (k === '*') { mt.txt = ''; mt.k = null; }
    else if (k === '#') { mt.txt = mt.txt.slice(0, -1); mt.k = null; }
    else if (KEYS[k]) {
      var L = KEYS[k];
      if (mt.k === k && now - mt.tm < 1000 && k !== '0') { mt.i = (mt.i + 1) % L.length; mt.txt = mt.txt.slice(0, -1) + L[mt.i]; }
      else { mt.i = 0; mt.txt += L[0]; }
      mt.k = k; mt.tm = now;
    }
  }
  renderPhone(W);
}

/* ============================================================
   최종 선택 · 엔딩
   ============================================================ */
function openFinal(){
  var W = openWin('final', '최종 선택', 680, 600);
  W.body.innerHTML = '';
  var box = h('div', { class:'final' });
  if (confCount() < IDX.peopleList.length) {
    box.appendChild(h('p', null, '기록부의 8명이 모두 「정리됨」이 되어야 최종 선택이 열립니다. (현재 ' + confCount() + '/8)'));
    W.body.appendChild(box); return;
  }
  var hs = Object.keys(S.hidden).length;
  box.appendChild(h('div', { html: D.finalIntro }));
  D.finalOptions.forEach(function(o){
    var lockedOpt = o.needHidden && hs < IDX.hiddenTotal;
    var b = h('button', { class:'opt', disabled: lockedOpt }, h('b', null, o.label), h('span', null, o.desc),
      lockedOpt ? h('div', { class:'lockn', html: ico('lock') + '<span>숨은 기록을 모두 모아야 고를 수 있습니다. 지금 ' + hs + '/' + IDX.hiddenTotal + '</span>' }) : null);
    b.addEventListener('click', function(){ if (lockedOpt) return; if (!confirm('「' + o.label + '」을(를) 선택합니다. 되돌릴 수 없습니다.')) return; closeWin('final'); runEnding(o.ending); });
    box.appendChild(b);
  });
  W.body.appendChild(box);
}
function runEnding(key){
  var en = D.endings[key];
  S.ending = key; save();
  sfx('drone');
  playSeq(en.seq, function(){
    if (key === 'correction') {
      S.flags.ending_true = true; save();
      fx(en.after);
      setTimeout(function(){ if (S.apps.nana) E.open('nana', { thread: en.thread, bottom: true }); }, 600);
      setTimeout(function(){ toast('마지막 한 단어', en.searchHint, 'star'); }, 2600);
    } else endingScreen(key);
  });
}
function playSeq(seq, done){
  var i = 0;
  function next(){
    if (i >= seq.length) { closeOverlay(); done && done(); return; }
    var s = seq[i++];
    showOverlay('<div class="ov-text' + (s.center ? ' center' : '') + '">' + s.text + '</div>', s.btn || '다음', next);
  }
  next();
}
function endingScreen(key){
  var en = D.endings[key];
  S.endDone = true; S.ending = key; save();
  sfx('end');
  var n = Object.keys(S.seen).length, hs = Object.keys(S.hidden).length;
  var box = $('#ending'); box.classList.remove('hidden'); box.innerHTML = '';
  var report = D.meta.reportTpl.replace('{ending}', en.name).replace('{time}', fmtDur(S.playMs)).replace('{hints}', S.hints).replace('{people}', confCount() + '/' + IDX.peopleList.length).replace('{found}', n + '/' + IDX.total).replace('{star}', hs + '/' + IDX.hiddenTotal);
  var copyFb = h('div', { class:'e-fb' });
  box.appendChild(h('div', { class:'e-box' },
    h('div', { class:'ov-num' }, '엔딩'),
    h('div', { class:'e-name' }, h('span', { class: key === 'correction' ? 'redline' : '' }, en.name), ' 엔딩'),
    h('div', { class:'e-text', html: en.epilogue }),
    h('table', null,
      h('tr', null, h('td', null, '엔딩'), h('td', null, en.name)),
      h('tr', null, h('td', null, '플레이 시간'), h('td', null, fmtDur(S.playMs))),
      h('tr', null, h('td', null, '힌트 사용'), h('td', null, S.hints + '회')),
      h('tr', null, h('td', null, '정리된 인물'), h('td', null, confCount() + '/' + IDX.peopleList.length + '명')),
      h('tr', null, h('td', null, '발견 페이지'), h('td', null, n + '/' + IDX.total)),
      h('tr', null, h('td', null, '숨은 기록'), h('td', null, hs + '/' + IDX.hiddenTotal))),
    h('div', { class:'e-act' },
      h('button', { class:'btn lg pri', onclick:function(){ copyText(report, copyFb); } }, '클리어 보고 복사'),
      h('button', { class:'btn lg', onclick:function(){ box.classList.add('hidden'); } }, '데스크톱으로'),
      h('button', { class:'btn lg', onclick:function(){ location.reload(); } }, '타이틀로')),
    copyFb));
}
function copyText(txt, fb){
  function ok(){ fb.textContent = '클립보드에 복사했습니다'; }
  function fallback(){
    var ta = h('textarea', { style:'position:fixed;left:-9999px' }); ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); ok(); } catch (e) { fb.textContent = txt; } ta.remove();
  }
  try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, fallback); else fallback(); } catch (e) { fallback(); }
}

/* ---------------- 오버레이 ---------------- */
var ovCb = null;
function showOverlay(html, btn, cb){
  overlayOpen = true;
  var o = $('#overlay'), inn = $('#overlay-in');
  inn.innerHTML = html;
  if (btn) { var b = h('button', { class:'btn ov-btn' }, btn); b.addEventListener('click', function(){ var f = ovCb; ovCb = null; f ? f() : closeOverlay(); }); inn.appendChild(b); setTimeout(function(){ b.focus(); }, 50); }
  ovCb = cb || null;
  o.classList.add('on');
}
function closeOverlay(){ $('#overlay').classList.remove('on'); overlayOpen = false; setTimeout(flushToasts, 300); }
function titleCard(ch){
  sfx('drone');
  showOverlay('<div class="ov-num">' + esc(ch.num) + '</div><div class="ov-title">「' + esc(ch.title) + '」</div><div class="ov-sub">' + ch.intro + '</div>', '계속', function(){ closeOverlay(); });
}
function guiltScene(g){
  sfx('drone');
  showOverlay('<div class="ov-guilt">' + g.text + '</div><div class="ov-sub" style="margin-top:16px">' + g.sub + '</div>', '…', function(){ closeOverlay(); fx(g.fx); });
}

/* ---------------- 장 진행 ---------------- */
function startChapter(i){
  if (i >= IDX.chapters.length) return;
  S.chapter = i;
  var ch = IDX.chapters[i];
  S.flags['ch_' + ch.id] = true;
  overlayOpen = true; // 제목 카드가 닫힐 때까지 알림을 모아 둔다
  (ch.unlocks || []).forEach(function(a){ unlockApp(a, i === 0); });
  fx(ch.start);
  save(); renderIcons(); updateFound();
  refreshWin('checkpoint'); refreshWin('hint'); refreshWin('record');
  titleCard(ch);
}

/* ---------------- 시작 ---------------- */
function startGame(fresh){
  $('#title').classList.add('hidden');
  running = true;
  var st = $('#sticky');
  if (D.desktop && D.desktop.sticky) { $('#sticky-text').innerHTML = D.desktop.sticky; st.classList.remove('hidden'); }
  renderIcons(); updateFound(); tickClock(); if (E._setSound) E._setSound();
  setInterval(tickClock, 15000);
  setInterval(function(){ if (running && !document.hidden && S && !S.endDone) { S.playMs += 1000; if (S.playMs % 10000 === 0) saveNow(); } }, 1000);
  if (fresh) startChapter(0);
  else {
    if (S.ending && S.endDone) toast('엔딩을 본 기록이 있습니다', '「' + D.endings[S.ending].name + '」 · 계속 둘러볼 수 있습니다');
    else if (S.ending === 'correction') toast('마지막 한 단어', D.endings.correction.searchHint, 'star');
    else if (S.ending) endingScreen(S.ending);
    else toast('이어하기', IDX.chapters[S.chapter].num + ' 「' + IDX.chapters[S.chapter].title + '」');
  }
}
E.boot = function(data){
  D = data; index();
  var saved = loadSave();
  var cont = $('#t-continue'), del = $('#t-delete'), nw = $('#t-new');
  if (saved) { cont.classList.remove('hidden'); del.classList.remove('hidden'); nw.classList.remove('pri'); }
  cont.addEventListener('click', function(){ ac(); S = Object.assign(newState(), saved); startGame(false); });
  nw.addEventListener('click', function(){
    if (saved && !confirm('처음부터 시작하면 저장된 진행 상황이 지워집니다. 계속할까요?')) return;
    ac(); wipeSave(); S = newState(); saveNow(); startGame(true);
  });
  del.addEventListener('click', function(){ if (!confirm('저장 데이터를 삭제할까요? 되돌릴 수 없습니다.')) return; wipeSave(); saved = null; cont.classList.add('hidden'); del.classList.add('hidden'); nw.classList.add('pri'); });
  $('#tb-found').addEventListener('click', function(){ if (S) E.open('found'); });
  var setSound = function(){ $('#tb-sound').innerHTML = ico(S && !S.sound ? 'volume-x' : 'volume-2'); };
  setSound(); $('#tb-start').innerHTML = ico('minimize-2');
  $('#tb-sound').addEventListener('click', function(){ if (!S) return; S.sound = !S.sound; setSound(); save(); });
  E._setSound = setSound;
  $('#tb-start').addEventListener('click', function(){ Object.keys(WM.wins).forEach(minWin); });
  window.addEventListener('beforeunload', saveNow);
  document.addEventListener('visibilitychange', function(){ if (document.hidden) saveNow(); });
};
// 테스트·디버그용 읽기 전용 정보 (정답은 들어 있지 않다)
E._state = function(){ return S; };
E._idx = function(){ return IDX; };
})();
