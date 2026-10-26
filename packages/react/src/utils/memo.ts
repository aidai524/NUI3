/** Zcash shielded memo field: 512 bytes of UTF-8. Transparent recipients cannot receive memos. */
export const MEMO_MAX_BYTES = 512;

const encoder = new TextEncoder();

export const memoByteLength = (text: string) => encoder.encode(text).length;

export function isMemoValid(text: string, maxBytes = MEMO_MAX_BYTES): boolean {
  return memoByteLength(text) <= maxBytes;
}

/** Trim to the byte limit without splitting a multi-byte character. */
export function truncateMemo(text: string, maxBytes = MEMO_MAX_BYTES): string {
  if (memoByteLength(text) <= maxBytes) return text;
  let out = '';
  let bytes = 0;
  for (const ch of text) {
    const n = encoder.encode(ch).length;
    if (bytes + n > maxBytes) break;
    out += ch;
    bytes += n;
  }
  return out;
}

/** Base64url (no padding) for ZIP-321 `memo=` parameters. */
export function encodeMemoBase64Url(text: string): string {
  let bin = '';
  for (const b of encoder.encode(text)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
