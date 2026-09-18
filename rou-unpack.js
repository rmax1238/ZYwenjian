/**
 * 肉視頻 rou.video 伪装 PNG 解包 · QuantumultX 重写脚本 v1.0.0 (2026-09-18)
 * ========================================================================
 * 背景：rou.video 的 HLS（m3u8 清单 + MPEG-TS 分段）全部伪装成 PNG 图片响应，
 * 真实数据藏在 PNG 自定义块 "roUd" 里：
 *
 *   roUd = [flag: 1 字节][payload]
 *     flag & 1  →  payload = zlib 压缩的 m3u8 文本（zlib 头 0x78 0x9C）
 *     否则      →  payload = 裸 MPEG-TS 分段
 *
 * 本脚本拦截响应体并解包：
 *   清单  …/<vid>/<vid>-1280/index.png → 还原为 m3u8 文本
 *   分段  …/<vid>/<vid>-1280/C-<NNN>.png → 还原为 MPEG-TS
 * 解包后播放器拿到的就是标准 HLS 流，任何播放器都能直接播
 * https://rou.video/api/hls/<视频id>（该地址 302 到伪装 PNG）。
 *
 * 安装（QuantumultX）：
 *   1. QX → 重写 → 脚本：新建 rou-unpack.js，粘贴本文件全文。
 *   2. 重写规则（[rewrite_local]）加一行（完整 conf 见 rou-qx.conf）：
 *      ^https?:\/\/[^\/]*(?:gokj68|monb18|devn81|hihl36|lacz71)\.xyz\/hls\/[^?#]+\.png url script-response-body rou-unpack.js
 *   3. [mitm] hostname 追加（CDN 主域清单，出现新主域时补）：
 *      gokj68.xyz, *.gokj68.xyz, monb18.xyz, *.monb18.xyz,
 *      devn81.xyz, *.devn81.xyz, hihl36.xyz, *.hihl36.xyz,
 *      lacz71.xyz, *.lacz71.xyz
 *
 * 关键限制（务必同时阅读 rou-qx.conf「验证与排错」）：
 *   QX 以 JS 字符串交出响应体，脚本用 charCodeAt() 逐字节重建原始字节，
 *   并以 PNG 魔数 0x89 0x50 作「读侧保真」试金石。若当前 QX 版本把响应体
 *   按 UTF-8 解码（高字节已损坏），试金石必然失败 —— 脚本弹一次系统通知并
 *   原样放行，此时本方案在该版本不可用。TS 分段「回写侧」的保真需真机
 *   播放验证（manifest 是文本，绝对安全；TS 若被 UTF-8 回写会长度膨胀）。
 */

'use strict';

var RULE_NAME = '肉視頻解包';
var WARN_KEY = 'rou_unpack_binary_warned';

function done(result) {
  if (typeof $done === 'function') $done(result);
}

function notifyOnce(title, subtitle, content) {
  try {
    var seen = ($prefs && typeof $prefs.getValueForKey === 'function')
      ? $prefs.getValueForKey(WARN_KEY) : '1';
    if (seen !== '1') {
      if ($prefs && typeof $prefs.setValueForKey === 'function') {
        $prefs.setValueForKey('1', WARN_KEY);
      }
      $notify(title, subtitle, content);
    }
  } catch (e) { /* 通知失败不影响主流程 */ }
}

/* ------------------------------------------------------------------
 * 纯 JS DEFLATE 解压（puff 风格，零依赖，约 150 行）
 * 已在 Safari/WebKit 对 rou.video 真实负载做过字节级验证：
 * 输出与 DecompressionStream('deflate') 完全一致（9114 字节逐位相同）。
 * ------------------------------------------------------------------ */
function inflateRaw(src) {
  var pos = 0, bit = 0, bitBuf = 0;
  var out = [];

  function bits(need) {
    var val = bitBuf;
    while (bit < need) {
      if (pos >= src.length) throw new Error('inflate: unexpected EOF');
      val |= src[pos++] << bit;
      bit += 8;
    }
    bitBuf = val >>> need;
    bit -= need;
    return val & ((1 << need) - 1);
  }

  function build(lengths, n) {
    var count = new Array(16).fill(0);
    for (var i = 0; i < n; i++) count[lengths[i]]++;
    if (count[0] === n) return { count: count, symbol: [] };
    var left = 1;
    for (var l = 1; l <= 15; l++) {
      left <<= 1;
      left -= count[l];
      if (left < 0) throw new Error('inflate: over-subscribed code');
    }
    var offs = new Array(16).fill(0);
    for (var m = 1; m < 15; m++) offs[m + 1] = offs[m] + count[m];
    var symbol = new Array(n);
    for (var j = 0; j < n; j++) if (lengths[j]) symbol[offs[lengths[j]]++] = j;
    return { count: count, symbol: symbol };
  }

  function decode(h) {
    var code = 0, first = 0, index = 0;
    for (var l = 1; l <= 15; l++) {
      code |= bits(1);
      var cnt = h.count[l];
      if (code - first < cnt) return h.symbol[index + (code - first)];
      index += cnt;
      first = (first + cnt) << 1;
      code <<= 1;
    }
    throw new Error('inflate: invalid code');
  }

  var LENS = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  var LEXT = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  var DISTS = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  var DEXT = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

  function codes(hl, hd) {
    for (;;) {
      var sym = decode(hl);
      if (sym < 256) out.push(sym);
      else if (sym === 256) return;
      else {
        sym -= 257;
        if (sym >= 29) throw new Error('inflate: bad length code');
        var len = LENS[sym] + bits(LEXT[sym]);
        var ds = decode(hd);
        if (ds >= 30) throw new Error('inflate: bad distance code');
        var dist = DISTS[ds] + bits(DEXT[ds]);
        if (dist > out.length) throw new Error('inflate: distance too far');
        for (var i = 0; i < len; i++) out.push(out[out.length - dist]);
      }
    }
  }

  var fl = new Array(288);
  for (var f = 0; f < 288; f++) fl[f] = f < 144 ? 8 : f < 256 ? 9 : f < 280 ? 7 : 8;
  var FIXED_LIT = build(fl, 288);
  var FIXED_DIST = build(new Array(30).fill(5), 30);

  for (;;) {
    var last = bits(1), type = bits(2);
    if (type === 0) {
      bit = 0; bitBuf = 0;
      var len = src[pos] | (src[pos + 1] << 8);
      pos += 4;
      for (var s = 0; s < len; s++) out.push(src[pos++]);
    } else if (type === 1) {
      codes(FIXED_LIT, FIXED_DIST);
    } else if (type === 2) {
      var nlit = bits(5) + 257, ndist = bits(5) + 1, ncode = bits(4) + 4;
      var ORDER = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
      var clens = new Array(19).fill(0);
      for (var c = 0; c < ncode; c++) clens[ORDER[c]] = bits(3);
      var hc = build(clens, 19);
      var lens = new Array(nlit + ndist).fill(0);
      var i2 = 0;
      while (i2 < nlit + ndist) {
        var cs = decode(hc);
        if (cs < 16) lens[i2++] = cs;
        else if (cs === 16) {
          var prev = lens[i2 - 1], rep = 3 + bits(2);
          for (var r = 0; r < rep; r++) lens[i2++] = prev;
        }
        else if (cs === 17) i2 += 3 + bits(3);
        else i2 += 11 + bits(7);
      }
      if (lens[256] === 0) throw new Error('inflate: missing end-of-block code');
      codes(build(lens.slice(0, nlit), nlit), build(lens.slice(nlit), ndist));
    } else {
      throw new Error('inflate: bad block type');
    }
    if (last) return Uint8Array.from(out);
  }
}

/* zlib 容器 = 2 字节头（CMF/FLG，FDICT 置位时另跟 4 字节字典）+ deflate 流 */
function inflateZlib(payload) {
  if (payload.length < 3) throw new Error('zlib: too short');
  if ((payload[0] & 0x0f) !== 8) throw new Error('zlib: not deflate');
  var off = (payload[1] & 0x20) ? 6 : 2;
  return inflateRaw(payload.subarray(off));
}

/* ------------------------------------------------------------------
 * PNG chunk 遍历，提取 roUd 块
 * ------------------------------------------------------------------ */
var PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function isPng(u8) {
  for (var i = 0; i < 8; i++) if (u8[i] !== PNG_MAGIC[i]) return false;
  return true;
}

function unpack(u8) {
  if (!isPng(u8)) return null;
  var i = 8, n = u8.length;
  while (i + 8 <= n) {
    var ln = ((u8[i] << 24) | (u8[i + 1] << 16) | (u8[i + 2] << 8) | u8[i + 3]) >>> 0;
    var t = String.fromCharCode(u8[i + 4], u8[i + 5], u8[i + 6], u8[i + 7]);
    var d = i + 8;
    if (ln > n - d) break; /* chunk 越界：结构不符 */
    if (t === 'roUd') {
      var flag = u8[d];
      var payload = u8.slice(d + 1, d + ln);
      if (flag & 1) return { kind: 'm3u8', data: inflateZlib(payload) };
      return { kind: 'ts', data: payload };
    }
    i = d + ln + 4; /* 4 字节 CRC */
  }
  return null;
}

/* 字节 → Latin-1 字符串（字节值 = 码点，无信息损失）。分块防栈溢出。 */
function bytesToString(u8) {
  var s = '', CHUNK = 8192;
  for (var i = 0; i < u8.length; i += CHUNK) {
    s += String.fromCharCode.apply(null, u8.subarray(i, Math.min(i + CHUNK, u8.length)));
  }
  return s;
}

/* ------------------------------------------------------------------
 * QuantumultX 入口（script-response-body）
 * ------------------------------------------------------------------ */
try {
  var body = (typeof $response !== 'undefined' && $response) ? $response.body : null;
  if (typeof body !== 'string' || body.length < 16) {
    done({});
  } else {
    /* 逐字节重建（QX 交出的是 JS 字符串） */
    var u8 = new Uint8Array(body.length);
    for (var b = 0; b < body.length; b++) u8[b] = body.charCodeAt(b) & 0xff;

    /* 读侧保真试金石：PNG 魔数 0x89 0x50。0x89 一旦经 UTF-8 解码必然损坏
       （变 U+FFFD 或多字节序列首字节），检验不过 = 本方案不可用 */
    if (u8[0] !== 0x89 || u8[1] !== 0x50) {
      notifyOnce(RULE_NAME, '响应体二进制保真检验失败',
        'QX 提供的响应体已被文本化解码（PNG 魔数丢失），本重写无法解包，' +
        '已放行原响应。请删除本重写以免影响播放。');
      done({});
    } else {
      var r = unpack(u8);
      if (!r) {
        done({}); /* 真 PNG 图（如封面）或结构不符：原样放行 */
      } else {
        /* m3u8（ASCII 文本）与 TS 分段都按 Latin-1 重建回写：
           文本侧绝对安全；TS 侧若 QX 以 UTF-8 编码回写会导致长度膨胀，
           需真机播放验证（conf 有排查步骤） */
        done({ body: bytesToString(r.data) });
      }
    }
  }
} catch (e) {
  done({}); /* 任何异常都不吞响应：原样放行 */
}
