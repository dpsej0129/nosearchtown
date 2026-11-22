/* ---- 정규화 · 해시 · 잠금 해제 (빌드 스크립트와 엔진이 같은 코드를 공유) ---- */
function cyrb53(str, seed){
  seed = seed || 0;
  var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (var i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
/* 공백 제거, 소문자화, 주소 앞부분과 기호 제거 */
function norm(s){
  s = String(s == null ? '' : s).normalize('NFC').trim().toLowerCase();
  s = s.replace(/^https?:\/\//, '').replace(/^www\./, '');
  return s.replace(/[\s .,·:;'"`!?~\-_\/\\()\[\]{}<>◆#@|+*=]+/g, '');
}
function H(s){ return cyrb53('kengai|' + norm(s), 1729).toString(36); }
function HR(name, s, w, r){ return cyrb53('kengai-rec|' + norm(name) + '|' + s + '|' + w + '|' + r, 4242).toString(36); }
function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function xorBytes(bytes, key){
  var r = mulberry32(cyrb53('ks|' + norm(key), 7) % 4294967296);
  var out = new Uint8Array(bytes.length);
  for (var i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ Math.floor(r() * 256);
  return out;
}
function encStr(text, key){
  var b = xorBytes(new TextEncoder().encode(text), key), s = '';
  for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s);
}
function decStr(b64, key){
  var s = atob(b64), b = new Uint8Array(s.length);
  for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return new TextDecoder().decode(xorBytes(b, key));
}
