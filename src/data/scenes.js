/* ============================================================
   GAME_DATA.scenes — 이미지 파일 대신 SVG로 그린 「사진」
   작은 글씨는 확대해야 읽힌다.
   ============================================================ */
const FONT = 'Apple SD Gothic Neo, Malgun Gothic, Noto Sans KR, sans-serif';
function svg(id, body){ return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" font-family="' + FONT + '" data-scene="' + id + '">' + body + '</svg>'; }
function grad(id, a, b){ return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect width="320" height="180" fill="url(#' + id + ')"/>'; }
function mountains(c1, c2){ return '<path d="M0 95 L40 60 L80 85 L130 45 L180 80 L230 50 L280 78 L320 60 L320 120 L0 120Z" fill="' + c1 + '"/><path d="M0 110 L60 80 L110 100 L170 75 L240 98 L320 82 L320 130 L0 130Z" fill="' + c2 + '"/>'; }
function yume(x, y, s, mood){
  var eyes = mood === 'shock' ? '<circle cx="-3.2" cy="0" r="1.3" fill="#222"/><circle cx="3.2" cy="0" r="1.3" fill="#222"/><ellipse cx="0" cy="4.5" rx="1.4" ry="1.8" fill="#8a3b3b"/>'
    : '<path d="M-4.5 0 Q-3 -1.6 -1.5 0" stroke="#222" fill="none" stroke-width=".8"/><path d="M1.5 0 Q3 -1.6 4.5 0" stroke="#222" fill="none" stroke-width=".8"/><path d="M-2 4 Q0 5.6 2 4" stroke="#b24" fill="none" stroke-width=".8"/>';
  return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' +
    '<path d="M-15 44 Q-17 14 0 11 Q17 14 15 44Z" fill="#f6f2ea"/><path d="M-15 44 L-13 30 L13 30 L15 44Z" fill="#8fb6e0"/>' +
    '<circle cx="0" cy="0" r="9.5" fill="#f3d6bd"/>' +
    '<path d="M-10.5 1 Q-11 -13 0 -12.5 Q11 -13 10.5 1 L11 12 Q8 4 6.5 -4 Q0 -2 -6.5 -4 Q-8 4 -11 12Z" fill="#2b1d16"/>' +
    '<circle cx="7.5" cy="-7.5" r="2.8" fill="#ff7ab0"/><circle cx="7.5" cy="-7.5" r="1" fill="#fff"/>' + eyes + '</g>';
}
function vending(x, y, s, rusty, label){
  return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' +
    '<rect x="0" y="0" width="34" height="62" rx="2" fill="' + (rusty ? '#8a5a3c' : '#c8102e') + '"/><rect x="3" y="4" width="28" height="22" fill="' + (rusty ? '#5b4636' : '#eef4f8') + '"/>' +
    '<rect x="5" y="7" width="5" height="9" rx="1" fill="#3a7d44"/><rect x="11.5" y="7" width="5" height="9" rx="1" fill="#6b3e1d"/><rect x="18" y="7" width="5" height="9" rx="1" fill="#2c5aa0"/>' +
    '<rect x="24.5" y="7" width="5" height="9" rx="1" fill="#f4e3b5"/><circle cx="27" cy="11" r="1.6" fill="#d22"/><path d="M27 9.2 l.4 -.9" stroke="#3a7d44" stroke-width=".4"/>' +
    '<text x="4" y="21" font-size="1.7" fill="' + (rusty ? '#ccb' : '#333') + '">녹차 · 커피 · 탄산</text><text x="3.2" y="24.4" font-size="1.9" fill="' + (rusty ? '#ffd9a0' : '#c8102e') + '" font-weight="700">히다 사과사이다</text>' +
    '<rect x="5" y="30" width="24" height="5" fill="#222"/><rect x="5" y="44" width="24" height="10" fill="#111"/>' +
    (label ? '<rect x="22" y="38" width="10" height="4" fill="#fff"/><text x="22.4" y="40.7" font-size="1.3" fill="#333">' + label + '</text>' : '') + '</g>';
}
function lockers(x, y, cols, rows, w, h, start, opts){
  var o = '', n = start; opts = opts || {};
  for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
    var lx = x + c * w, ly = y + r * h, num = n++;
    var locked = num === 815;
    o += '<rect x="' + lx + '" y="' + ly + '" width="' + (w - 1) + '" height="' + (h - 1) + '" fill="' + (opts.dark ? '#5b6168' : '#9aa3ad') + '" stroke="#555" stroke-width=".3"/>';
    if (opts.ajar && !locked) o += '<rect x="' + (lx + w - 4) + '" y="' + (ly + 1) + '" width="2.5" height="' + (h - 3) + '" fill="#2a2d31"/>';
    o += '<text x="' + (lx + 1.5) + '" y="' + (ly + 3.6) + '" font-size="2.4" fill="#222">' + num + '</text>';
    if (locked && opts.mark) o += '<circle cx="' + (lx + w / 2) + '" cy="' + (ly + h / 2 + 1) + '" r="2.4" fill="#222"/><circle cx="' + (lx + w / 2) + '" cy="' + (ly + h / 2 + 1) + '" r="1.5" fill="#bbb"/>' +
      (opts.tag ? '<rect x="' + (lx + 2) + '" y="' + (ly + h - 6) + '" width="' + (w - 5) + '" height="3.4" fill="#eee9d8"/><text x="' + (lx + 2.6) + '" y="' + (ly + h - 3.6) + '" font-size="2" fill="#998">' + opts.tag + '</text>' : '');
  }
  return o;
}
function pole(x, plateText, sub){
  return '<rect x="' + x + '" y="10" width="9" height="170" fill="#8d8a80"/><rect x="' + (x - 18) + '" y="22" width="45" height="3" fill="#6d6a62"/>' +
    '<rect x="' + (x - 2) + '" y="88" width="13" height="26" rx="1" fill="#1d4f91"/><text x="' + (x + 4.5) + '" y="95" font-size="2.2" fill="#fff" text-anchor="middle">' + (sub || '미즈하초') + '</text>' +
    '<text x="' + (x + 4.5) + '" y="102.5" font-size="3.6" fill="#fff" text-anchor="middle" font-weight="700">' + plateText.split(' ')[0] + '</text><text x="' + (x + 4.5) + '" y="109.5" font-size="4.4" fill="#fff" text-anchor="middle" font-weight="700">' + plateText.split(' ')[1] + '</text>';
}

module.exports = {
  sc_mail_photo: svg('sc_mail_photo', grad('g_mp', '#a7adb5', '#d7d9d6') + mountains('#7f8b84', '#6a786f') +
    '<rect x="0" y="125" width="320" height="55" fill="#5c6b4f"/>' +
    '<rect x="120" y="70" width="150" height="72" fill="#cfc6b4"/><path d="M112 72 L195 50 L278 72Z" fill="#5a4a3e"/>' +
    '<rect x="132" y="96" width="78" height="46" fill="#9aa0a6"/>' + Array.from({ length: 11 }, function(_, i){ return '<rect x="132" y="' + (98 + i * 4) + '" width="78" height=".6" fill="#7b8186"/>'; }).join('') +
    '<rect x="140" y="76" width="66" height="14" fill="#f3efe3" stroke="#7a6a55" stroke-width=".8"/><text x="173" y="86.4" font-size="8.5" fill="#6d5a45" text-anchor="middle" font-weight="700" opacity=".75">도리이 민박</text>' +
    '<rect x="160" y="112" width="20" height="12" fill="#fff"/><text x="170" y="117" font-size="2" fill="#333" text-anchor="middle">폐업했습니다</text><text x="170" y="120.5" font-size="1.6" fill="#555" text-anchor="middle">그동안 감사했습니다</text><text x="170" y="123" font-size="1.4" fill="#777" text-anchor="middle">2009. 9. 도리이</text>' +
    '<rect x="222" y="100" width="26" height="42" fill="none" stroke="#8a6b52" stroke-width="1.2" stroke-dasharray="2 1.5"/><text x="235" y="122" font-size="2.2" fill="#665" text-anchor="middle">(철거 흔적)</text>' +
    pole(62, '히나고 12') +
    '<path d="M0 150 Q30 135 60 152 T120 148 T200 155 T320 146 L320 180 L0 180Z" fill="#4a5a3c"/>' +
    Array.from({ length: 40 }, function(_, i){ var x = (i * 37) % 320; return '<path d="M' + x + ' 180 L' + (x + 2) + ' ' + (150 + (i * 13) % 20) + ' L' + (x + 4) + ' 180Z" fill="#3e5032"/>'; }).join('')),

  sc_v_entrance: svg('sc_v_entrance', grad('g_ve', '#f6b26b', '#7a5c9c') + mountains('#4b3f5e', '#3a3350') +
    '<rect x="0" y="118" width="320" height="22" fill="#6f7fa6"/><rect x="0" y="125" width="320" height="2" fill="#9fb0d6" opacity=".6"/>' +
    '<rect x="0" y="138" width="320" height="42" fill="#3d4a2f"/>' +
    '<rect x="-20" y="80" width="46" height="62" fill="#8e8576"/><rect x="-14" y="84" width="38" height="9" fill="#e8e0cc"/><text x="2" y="90.6" font-size="5" fill="#6d5a45" opacity=".6">… 민박</text>' +
    yume(205, 112, 1.25) + '<path d="M222 126 l10 -14" stroke="#f3d6bd" stroke-width="3" stroke-linecap="round"/>' +
    '<text x="8" y="12" font-size="6" fill="#fff" opacity=".85">● 생방송 유메링</text>'),

  sc_v_pole: svg('sc_v_pole', grad('g_vp', '#d98c5f', '#5c4a6e') + mountains('#4a3d55', '#3b3249') + '<rect x="0" y="130" width="320" height="50" fill="#384529"/>' +
    pole(150, '히나고 12') + yume(250, 118, 1.1) + '<path d="M236 132 L168 104" stroke="#f3d6bd" stroke-width="3" stroke-linecap="round"/>' +
    '<text x="8" y="12" font-size="6" fill="#fff" opacity=".85">● 생방송 유메링</text>'),

  sc_v_path: svg('sc_v_path', grad('g_vpa', '#8a6f8f', '#3c3550') + mountains('#352d45', '#2b2538') +
    '<path d="M120 180 L150 110 L170 110 L220 180Z" fill="#6b6352"/>' +
    '<path d="M20 120 L60 95 L100 120 L100 150 L20 150Z" fill="#4d4337"/><path d="M60 95 L92 150" stroke="#2a241d" stroke-width="3"/>' +
    '<path d="M230 115 L270 92 L310 115 L305 148 L235 148Z" fill="#4a4034"/><rect x="250" y="122" width="14" height="26" fill="#1e1a16"/>' +
    Array.from({ length: 50 }, function(_, i){ var x = (i * 29) % 320; return '<path d="M' + x + ' 180 L' + (x + 3) + ' ' + (140 + (i * 11) % 30) + ' L' + (x + 6) + ' 180Z" fill="#2f3b24"/>'; }).join('') +
    yume(160, 125, .8) + '<text x="8" y="12" font-size="6" fill="#fff" opacity=".85">● 생방송 유메링</text>'),

  sc_v_phone: svg('sc_v_phone', grad('g_vph', '#4c4060', '#221c2e') +
    '<rect x="70" y="20" width="140" height="160" rx="16" fill="#c9cdd6"/><rect x="80" y="30" width="120" height="96" rx="4" fill="#0b0f0a"/>' +
    '<rect x="80" y="30" width="120" height="10" fill="#1a2a17"/><text x="84" y="37.5" font-size="6" fill="#ff8080" font-weight="700">권외</text><text x="196" y="37.5" font-size="6" fill="#9be88a" text-anchor="end">20:12</text>' +
    '<text x="140" y="80" font-size="14" fill="#9be88a" text-anchor="middle">20:12</text><text x="140" y="96" font-size="5.5" fill="#9be88a" text-anchor="middle">8/15 (토)</text>' +
    '<path d="M60 180 Q66 120 90 130 L100 180Z" fill="#f3d6bd"/><text x="8" y="12" font-size="6" fill="#fff" opacity=".85">● 생방송 유메링</text>'),

  sc_v_shrine: svg('sc_v_shrine', grad('g_vs', '#5d4b72', '#221d30') + mountains('#2c2540', '#241f33') + '<rect x="0" y="128" width="320" height="52" fill="#2a3322"/>' +
    '<rect x="30" y="60" width="6" height="80" fill="#8b2a22"/><rect x="74" y="60" width="6" height="80" fill="#8b2a22"/><rect x="22" y="54" width="66" height="6" fill="#8b2a22"/><rect x="28" y="66" width="54" height="4" fill="#8b2a22"/>' +
    Array.from({ length: 4 }, function(_, i){ var x = 110 + i * 16; return '<ellipse cx="' + x + '" cy="138" rx="6" ry="9" fill="#77756e"/><circle cx="' + x + '" cy="126" r="5" fill="#86847c"/><rect x="' + (x - 6) + '" y="131" width="12" height="3" fill="#b33"/>'; }).join('') +
    vending(220, 72, 1.1, true, '') + '<circle cx="237" cy="78" r="30" fill="#ffd98a" opacity=".07"/>' +
    yume(290, 128, .8) + '<text x="8" y="12" font-size="6" fill="#fff" opacity=".85">● 생방송 유메링</text>'),

  sc_v_hall: svg('sc_v_hall', '<rect width="320" height="180" fill="#6e5a44"/><rect x="0" y="140" width="320" height="40" fill="#4c3d2e"/>' +
    Array.from({ length: 16 }, function(_, i){ return '<rect x="' + (i * 20) + '" y="0" width="1" height="140" fill="#5b4a37"/>'; }).join('') +
    '<rect x="18" y="14" width="22" height="16" rx="2" fill="#d8d2c4"/><circle cx="29" cy="22" r="5" fill="#555"/><text x="29" y="35" font-size="3" fill="#f2e8d0" text-anchor="middle">히나고 유선방송</text>' +
    '<rect x="150" y="30" width="160" height="104" fill="#3e3a35"/>' + lockers(152, 32, 6, 5, 26, 20, 801, { mark: true }) +
    '<rect x="20" y="96" width="80" height="6" fill="#8a6b4a"/><rect x="26" y="102" width="4" height="38" fill="#8a6b4a"/><rect x="90" y="102" width="4" height="38" fill="#8a6b4a"/>' +
    '<rect x="32" y="66" width="34" height="30" rx="2" fill="#d6d1c4"/><rect x="36" y="70" width="26" height="20" fill="#2f5c8a"/><rect x="70" y="86" width="20" height="10" rx="1" fill="#e8e5dc"/><circle cx="86" cy="91" r="1.4" fill="#3f3"/>' +
    '<text x="72" y="91.6" font-size="1.8" fill="#555">ISDN 회선 상자</text>' +
    '<rect x="18" y="40" width="40" height="18" fill="#efe6cf"/><text x="38" y="47" font-size="3" fill="#6b5a3a" text-anchor="middle">인터넷 체험 교실</text><text x="38" y="52.5" font-size="2.4" fill="#6b5a3a" text-anchor="middle">매주 토요일 오후 2시</text>' +
    yume(118, 112, .95) + '<text x="8" y="176" font-size="6" fill="#fff" opacity=".85">● 생방송 유메링</text>'),

  sc_v_wait: svg('sc_v_wait', grad('g_vw', '#ffd1e3', '#c9e4ff') +
    '<circle cx="60" cy="40" r="20" fill="#fff" opacity=".5"/><circle cx="270" cy="140" r="30" fill="#fff" opacity=".4"/>' +
    '<text x="160" y="88" font-size="16" fill="#e0558f" text-anchor="middle" font-weight="700">잠시만 기다려 주세요 ♪</text><text x="160" y="106" font-size="7" fill="#7a6b8f" text-anchor="middle">유메링의 꿈방송</text>'),

  sc_v_lockers: svg('sc_v_lockers', '<rect width="320" height="180" fill="#4e4134"/><rect x="0" y="140" width="320" height="40" fill="#382d23"/>' +
    '<rect x="40" y="18" width="240" height="126" fill="#33302c"/>' + lockers(44, 22, 6, 5, 38, 24, 801, { mark: true, dark: true }) +
    '<rect width="320" height="180" fill="#000" opacity=".25"/>' + yume(160, 120, 1.15) + '<text x="8" y="176" font-size="6" fill="#fff" opacity=".85">● 생방송 유메링</text>'),

  sc_v_last: svg('sc_v_last', '<rect width="320" height="180" fill="#0b0d14"/><g opacity=".9">' + yume(160, 100, 4.2, 'shock') + '</g><rect width="320" height="180" fill="#0a1030" opacity=".45"/>' +
    '<rect x="0" y="60" width="320" height="3" fill="#fff" opacity=".08"/><rect x="0" y="120" width="320" height="2" fill="#fff" opacity=".06"/><text x="8" y="176" font-size="6" fill="#f66" opacity=".85">● 생방송 유메링</text>'),

  sc_v_black: svg('sc_v_black', '<rect width="320" height="180" fill="#000"/><text x="160" y="92" font-size="10" fill="#bbb" text-anchor="middle">통신이 끊겼습니다</text><text x="160" y="106" font-size="5" fill="#666" text-anchor="middle">방송자의 연결을 기다리는 중…</text>'),

  sc_urbex_hall: svg('sc_urbex_hall', grad('g_uh', '#bcd3e6', '#e8eef2') + mountains('#7d9a7a', '#6a8a66') + '<rect x="0" y="128" width="320" height="52" fill="#6f8f4f"/>' +
    '<rect x="80" y="70" width="170" height="70" fill="#8c7a63"/><path d="M70 72 L165 40 L260 72Z" fill="#4e463f"/>' +
    '<rect x="140" y="96" width="44" height="44" fill="#5a4b3c"/><rect x="161" y="96" width="1" height="44" fill="#3a3027"/>' +
    '<rect x="96" y="80" width="36" height="10" fill="#e9e1cc"/><text x="114" y="87" font-size="3.4" fill="#5a4a36" text-anchor="middle">히나고 공민관</text>' +
    '<rect x="200" y="90" width="30" height="20" fill="#bcc9cf"/>' + Array.from({ length: 30 }, function(_, i){ var x = (i * 41) % 320; return '<path d="M' + x + ' 180 L' + (x + 3) + ' ' + (135 + (i * 7) % 25) + ' L' + (x + 6) + ' 180Z" fill="#557a3a"/>'; }).join('')),

  sc_urbex_lockers: svg('sc_urbex_lockers', '<rect width="320" height="180" fill="#7a6750"/><rect x="0" y="150" width="320" height="30" fill="#5c4b39"/>' +
    '<rect x="40" y="12" width="240" height="134" fill="#3f3b36"/>' + lockers(44, 16, 6, 5, 38, 25.5, 801, { mark: true, ajar: true, tag: '도리… (향우회)' }) +
    '<rect width="320" height="180" fill="#fff" opacity=".05"/>'),

  sc_urbex_pc: svg('sc_urbex_pc', '<rect width="320" height="180" fill="#7d6a52"/><rect x="0" y="122" width="320" height="58" fill="#5d4c3a"/>' +
    '<rect x="40" y="112" width="240" height="10" fill="#8a6b4a"/><rect x="50" y="122" width="8" height="50" fill="#8a6b4a"/><rect x="262" y="122" width="8" height="50" fill="#8a6b4a"/>' +
    '<rect x="80" y="40" width="90" height="72" rx="4" fill="#d6d1c4"/><rect x="88" y="48" width="74" height="52" fill="#20262b"/><rect x="100" y="104" width="50" height="8" fill="#c8c2b4"/>' +
    '<rect x="190" y="92" width="58" height="20" rx="2" fill="#ece9e1"/><circle cx="240" cy="102" r="2.2" fill="#555"/><text x="196" y="100" font-size="3" fill="#444">ISDN 회선 상자</text>' +
    '<rect x="194" y="103" width="38" height="6" fill="#fff6b0"/><text x="196" y="107.4" font-size="2.6" fill="#7a5a00">공민관 회선 · 향우회</text>' +
    '<path d="M248 104 Q270 120 300 112" stroke="#333" stroke-width="1.2" fill="none"/><text x="250" y="130" font-size="3" fill="#ddd">(전원 꺼짐)</text>'),

  sc_locker_open: svg('sc_locker_open', '<rect width="320" height="180" fill="#3f3b36"/>' +
    '<rect x="90" y="20" width="140" height="150" fill="#9aa3ad" stroke="#555"/><rect x="100" y="30" width="120" height="132" fill="#2a2d31"/>' +
    '<text x="96" y="28" font-size="7" fill="#222">815</text>' +
    '<path d="M230 22 L300 40 L300 172 L230 168Z" fill="#a9b1ba" stroke="#666"/>' +
    '<rect x="128" y="100" width="64" height="44" rx="2" fill="#f7f3e3" opacity=".95"/><rect x="124" y="96" width="72" height="52" rx="3" fill="#e8f2ff" opacity=".35"/>' +
    '<text x="160" y="118" font-size="4" fill="#557" text-anchor="middle">(접힌 쪽지)</text>' +
    '<circle cx="262" cy="96" r="12" fill="#222"/><circle cx="262" cy="96" r="8" fill="#ccc"/><text x="262" y="98.5" font-size="5" fill="#222" text-anchor="middle">8 1 5</text>'),

  sc_vending: svg('sc_vending', '<rect width="320" height="180" fill="#d8d3c6"/><rect x="0" y="140" width="320" height="40" fill="#9b958a"/>' +
    '<rect x="0" y="0" width="320" height="140" fill="#c9bfa9"/>' + Array.from({ length: 12 }, function(_, i){ return '<rect x="0" y="' + (i * 12) + '" width="320" height=".7" fill="#b3a88f"/>'; }).join('') +
    vending(110, 22, 1.9, false, '히나고 12') + '<rect x="40" y="40" width="40" height="60" fill="#7c6a55"/><text x="60" y="73" font-size="4" fill="#efe" text-anchor="middle">현관</text>' +
    '<rect x="200" y="60" width="70" height="20" fill="#f3efe3"/><text x="235" y="72.5" font-size="5.5" fill="#6d5a45" text-anchor="middle">도리이 민박</text>'),

  sc_parcel: svg('sc_parcel', '<rect width="320" height="180" fill="#bba98f"/><rect x="0" y="130" width="320" height="50" fill="#8a7a63"/>' +
    '<path d="M70 50 L250 50 L270 150 L50 150Z" fill="#c8a06a"/><rect x="50" y="98" width="220" height="4" fill="#a8824e"/>' +
    '<rect x="120" y="62" width="100" height="56" fill="#fff"/><rect x="120" y="62" width="100" height="9" fill="#2e7d32"/><text x="124" y="68.6" font-size="4.2" fill="#fff">택배 송장 · 받는 분</text>' +
    '<g transform="translate(124,74)"><rect x="0" y="0" width="7" height="7" fill="none" stroke="#c00" stroke-width=".5"/><path d="M1.3 1.8 H5.7 M1.3 3.2 H5.7 M3.5 3.2 V6" stroke="#c00" stroke-width=".6"/></g>' +
    '<text x="133" y="80" font-size="5" fill="#c00" font-weight="700">506-1412</text>' +
    '<rect x="124" y="85" width="80" height="4" fill="#bbb"/><rect x="124" y="92" width="64" height="4" fill="#bbb"/><text x="190" y="110" font-size="4.6" fill="#222">도리이 님</text>' +
    '<text x="124" y="115" font-size="2.6" fill="#777">품명: 그림 도구 (크레용 · 스케치북)</text>' +
    '<path d="M150 82 Q190 70 215 96 Q218 104 208 104 Q186 92 154 98Z" fill="#e7c2a3"/>'),

  sc_breakfast: svg('sc_breakfast', '<rect width="320" height="180" fill="#6b4b33"/><rect x="40" y="30" width="240" height="130" rx="6" fill="#a6764c"/>' +
    '<circle cx="100" cy="80" r="26" fill="#f4f1e8"/><circle cx="100" cy="80" r="18" fill="#c98b4a"/><circle cx="200" cy="70" r="20" fill="#f4f1e8"/><circle cx="200" cy="70" r="13" fill="#6a8f3a"/>' +
    '<circle cx="160" cy="125" r="22" fill="#f4f1e8"/><circle cx="160" cy="125" r="15" fill="#e3d7b8"/><circle cx="240" cy="125" r="14" fill="#c62"/><text x="240" y="127" font-size="3" fill="#fff" text-anchor="middle">사과 조림</text>'),

  sc_yume_cider: svg('sc_yume_cider', grad('g_yc', '#bde0f6', '#f7efe0') + '<rect x="0" y="120" width="320" height="60" fill="#8e7a5c"/>' +
    vending(240, 40, 1.5, false, '') +
    '<rect x="40" y="110" width="170" height="10" fill="#7a5a3a"/><rect x="50" y="120" width="8" height="40" fill="#6a4a2a"/><rect x="190" y="120" width="8" height="40" fill="#6a4a2a"/>' +
    ['90', '140'].map(function(x){ return '<rect x="' + x + '" y="62" width="18" height="48" rx="4" fill="#d7efc8" opacity=".9"/><rect x="' + (+x + 5) + '" y="52" width="8" height="12" fill="#cfe6c0"/><rect x="' + x + '" y="78" width="18" height="16" fill="#fff"/><circle cx="' + (+x + 9) + '" cy="84" r="3.5" fill="#d22"/><text x="' + (+x + 9) + '" y="92" font-size="2.2" fill="#c8102e" text-anchor="middle">히다 사과사이다</text>'; }).join('')),

  sc_saki_drawing: svg('sc_saki_drawing', '<rect width="320" height="180" fill="#fffdf4"/><rect x="0" y="0" width="320" height="180" fill="none" stroke="#e8d9b0" stroke-width="6"/>' +
    '<path d="M30 140 Q160 130 290 142" stroke="#5ab55a" stroke-width="6" fill="none"/>' +
    '<rect x="220" y="60" width="44" height="78" fill="none" stroke="#e33" stroke-width="3"/><circle cx="242" cy="80" r="7" fill="none" stroke="#e33" stroke-width="2.4"/><text x="242" y="112" font-size="7" fill="#e33" text-anchor="middle">사이다</text>' +
    '<circle cx="90" cy="70" r="16" fill="none" stroke="#333" stroke-width="2.4"/><path d="M78 62 Q90 48 102 62" stroke="#333" stroke-width="5" fill="none"/><circle cx="102" cy="58" r="5" fill="#ff5fa2"/><path d="M90 86 L80 130 L100 130Z" fill="none" stroke="#4a8be0" stroke-width="2.6"/><text x="90" y="146" font-size="8" fill="#ff5fa2" text-anchor="middle">유메 언니</text>' +
    '<circle cx="150" cy="84" r="12" fill="none" stroke="#333" stroke-width="2.4"/><path d="M150 96 L142 132 L158 132Z" fill="none" stroke="#f2a93b" stroke-width="2.6"/><text x="150" y="146" font-size="8" fill="#f2a93b" text-anchor="middle">사키</text>' +
    '<text x="160" y="28" font-size="11" fill="#555" text-anchor="middle">8월 15일 언니 잊지 마</text><text x="290" y="170" font-size="6" fill="#999" text-anchor="end">6학년 도리이 사키</text>'),

  sc_netcafe: svg('sc_netcafe', '<rect width="320" height="180" fill="#06080f"/>' +
    '<rect x="10" y="10" width="300" height="140" fill="#0d1428"/>' +
    '<rect x="10" y="100" width="300" height="50" fill="#1b2233"/><ellipse cx="170" cy="125" rx="80" ry="14" fill="#262f45"/>' +
    '<rect x="210" y="60" width="90" height="40" fill="#1a2238"/><rect x="214" y="64" width="82" height="10" fill="#e8f0ff" opacity=".85"/><text x="255" y="71.5" font-size="5.6" fill="#1a2238" text-anchor="middle" font-weight="700">다카야마역</text>' +
    Array.from({ length: 9 }, function(_, i){ return '<circle cx="' + (30 + i * 32) + '" cy="' + (96 + (i % 2) * 3) + '" r="2.4" fill="#ffd27a"/><circle cx="' + (30 + i * 32) + '" cy="' + (96 + (i % 2) * 3) + '" r="7" fill="#ffd27a" opacity=".12"/>'; }).join('') +
    '<text x="40" y="60" font-size="3.6" fill="#ffd27a" opacity=".8">우동 한 그릇</text><rect x="36" y="62" width="40" height="18" fill="#3a2a18" opacity=".8"/>' +
    '<g opacity=".38"><ellipse cx="96" cy="70" rx="22" ry="27" fill="#9aa4b8"/>' +
    '<rect x="110" y="96" width="84" height="46" rx="3" fill="#a9b3c6"/>' +
    '<g transform="translate(152,118) scale(-1,1)"><circle cx="0" cy="0" r="11" fill="#fff"/><circle cx="0" cy="0" r="11" fill="none" stroke="#d6336c" stroke-width="1.2"/><text x="0" y="-3" font-size="4" fill="#d6336c" text-anchor="middle">hina</text><text x="0" y="3.4" font-size="5" fill="#222" text-anchor="middle" font-weight="700">774</text><text x="0" y="8" font-size="2.8" fill="#222" text-anchor="middle">(o_o)</text></g></g>' +
    '<rect x="10" y="10" width="300" height="140" fill="none" stroke="#2a2f3a" stroke-width="5"/><rect x="158" y="10" width="4" height="140" fill="#2a2f3a"/>' +
    '<text x="300" y="172" font-size="5" fill="#888" text-anchor="end">2009/08/15 19:40</text>'),

  sc_laptop2026: svg('sc_laptop2026', grad('g_lt', '#2a2d36', '#16181e') + '<rect x="0" y="130" width="320" height="50" fill="#3b3229"/>' +
    '<circle cx="270" cy="50" r="26" fill="none" stroke="#f4f4f4" stroke-width="5" opacity=".7"/><rect x="40" y="60" width="18" height="50" rx="6" fill="#111"/>' +
    '<path d="M90 130 L230 130 L240 140 L80 140Z" fill="#9aa0aa"/><rect x="100" y="56" width="120" height="74" rx="4" fill="#a7adb7"/>' +
    '<g transform="translate(160,92)"><circle cx="0" cy="0" r="14" fill="#fff" opacity=".9"/><circle cx="0" cy="0" r="14" fill="none" stroke="#d6336c" stroke-width="1.4"/><text x="0" y="-4" font-size="5" fill="#d6336c" text-anchor="middle">hina</text><text x="0" y="4" font-size="6.4" fill="#222" text-anchor="middle" font-weight="700">774</text><text x="0" y="9.6" font-size="3.4" fill="#222" text-anchor="middle">(o_o)</text></g>' +
    '<rect x="108" y="64" width="20" height="8" fill="#e2e4e8" opacity=".7"/><text x="118" y="69.4" font-size="2.6" fill="#555" text-anchor="middle">2008</text>' +
    '<text x="300" y="172" font-size="5" fill="#bbb" text-anchor="end">@bakuro_hinata · 작업실</text>'),

  sc_dm: svg('sc_dm', '<rect width="320" height="180" fill="#101217"/><rect x="60" y="0" width="200" height="180" fill="#16181e"/>' +
    '<rect x="60" y="0" width="200" height="22" fill="#1d2027"/><circle cx="76" cy="11" r="6" fill="#7fb77e"/><text x="88" y="10" font-size="5" fill="#eee">유키</text><text x="88" y="16.5" font-size="3.6" fill="#888">@yuki_nonomura</text>' +
    '<rect x="120" y="44" width="130" height="30" rx="8" fill="#d6336c"/><text x="126" y="55" font-size="5" fill="#fff">찾았다. 꽃집 앞치마</text><text x="126" y="64" font-size="5" fill="#fff">잘 어울리더라. 👀</text>' +
    '<rect x="140" y="80" width="110" height="20" rx="8" fill="#d6336c"/><text x="146" y="92.5" font-size="5" fill="#fff">11/30을 기다리라는 거지.</text>' +
    '<text x="248" y="108" font-size="3.4" fill="#777" text-anchor="end">2026/11/01 20:58 · 읽지 않음</text>' +
    '<text x="160" y="150" font-size="4" fill="#555" text-anchor="middle">이 사용자는 회원님의 메시지를 받지 않도록 설정했습니다</text>'),

  sc_family1990: svg('sc_family1990', '<defs><filter id="f_sep"><feColorMatrix type="matrix" values=".39 .76 .18 0 0 .34 .68 .16 0 0 .27 .53 .13 0 0 0 0 0 1 0"/></filter></defs><g filter="url(#f_sep)">' + grad('g_fm', '#cfd8e3', '#eef0ec') +
    '<rect x="40" y="40" width="240" height="100" fill="#8c7a63"/><path d="M30 42 L160 14 L290 42Z" fill="#4e463f"/><rect x="60" y="52" width="50" height="10" fill="#e9e1cc"/><text x="85" y="59" font-size="4.5" fill="#5a4a36" text-anchor="middle">히나고 공민관</text>' +
    '<rect x="0" y="140" width="320" height="40" fill="#7a8a6a"/>' +
    '<g transform="translate(130,108)"><circle cx="0" cy="0" r="11" fill="#f2d6bd"/><path d="M-12 2 Q-12 -14 0 -13 Q12 -14 12 2 L10 -2 Q0 -8 -10 -2Z" fill="#222"/><path d="M-18 70 L-14 14 L14 14 L18 70Z" fill="#fafafa"/></g>' +
    '<g transform="translate(186,110)"><circle cx="0" cy="0" r="10" fill="#e8c8a8"/><path d="M-10 -2 Q-10 -12 0 -12 Q10 -12 10 -2Z" fill="#222"/><path d="M-16 70 L-14 12 L14 12 L16 70Z" fill="#2c3440"/></g></g>' +
    '<text x="290" y="170" font-size="6" fill="#fff" text-anchor="end" font-style="italic">헤이세이 2년 1월 — 미사코 누나와</text>'),

  sc_pole2014: svg('sc_pole2014', grad('g_p14', '#cfe3f0', '#f1f3ef') + mountains('#8aa38a', '#7a957a') + '<rect x="0" y="128" width="320" height="52" fill="#7a8c5a"/>' +
    '<rect x="190" y="74" width="120" height="66" fill="#bdb4a2"/><rect x="200" y="96" width="70" height="44" fill="#9aa0a6"/><rect x="210" y="80" width="56" height="12" fill="#f3efe3" opacity=".7"/><text x="238" y="88.6" font-size="6" fill="#6d5a45" text-anchor="middle" opacity=".6">도리이 민박</text>' +
    pole(120, '히나고 12') + '<text x="12" y="172" font-size="5" fill="#fff">2014.10</text>'),

  sc_cider2026: svg('sc_cider2026', grad('g_c26', '#f4f1ea', '#e7e2d6') + '<rect x="0" y="120" width="320" height="60" fill="#c8b9a0"/>' +
    Array.from({ length: 7 }, function(_, i){ return '<circle cx="' + (40 + i * 18) + '" cy="' + (60 + (i % 3) * 12) + '" r="9" fill="' + ['#f6a5c0', '#ffd166', '#f78c6b', '#c3a6ff', '#f6a5c0', '#ffd166', '#a0e7a0'][i] + '"/>'; }).join('') +
    '<path d="M40 70 L60 120 M80 72 L80 120 M120 70 L100 120" stroke="#5a8a4a" stroke-width="2"/>' +
    '<rect x="180" y="58" width="24" height="62" rx="5" fill="#d7efc8"/><rect x="186" y="46" width="12" height="14" fill="#cfe6c0"/><rect x="180" y="78" width="24" height="20" fill="#fff"/><circle cx="192" cy="85" r="4.5" fill="#d22"/><text x="192" y="94.6" font-size="2.6" fill="#c8102e" text-anchor="middle">히다 사과사이다</text>' +
    '<rect x="220" y="100" width="54" height="30" fill="#fffef6" transform="rotate(-6 247 115)"/><text x="247" y="113" font-size="3.6" fill="#555" text-anchor="middle" transform="rotate(-6 247 115)">생일 축하해, 언니</text><text x="247" y="120" font-size="3.2" fill="#555" text-anchor="middle" transform="rotate(-6 247 115)">사과사이다 같이 마시자</text><text x="262" y="126" font-size="3" fill="#888" text-anchor="middle" transform="rotate(-6 247 115)">— 사키</text>')
};
