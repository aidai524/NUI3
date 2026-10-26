// ZIP-321 payment request URIs: zcash:<address>?amount=...&memo=...
import { parseAddress } from './address.js';
import { encodeMemoBase64Url, isMemoValid } from './memo.js';

export interface PaymentRequest {
  address: string;
  /** Decimal ZEC string, e.g. "1.5". Max 8 decimals. Strings only, to avoid float errors. */
  amount?: string;
  /** Plain-text memo; encoded to base64url. Only allowed for shielded recipients. */
  memo?: string;
  label?: string;
  message?: string;
}

const enc = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

function validate(p: PaymentRequest) {
  const info = parseAddress(p.address);
  if (!info) throw new Error(`ZIP-321: not a Zcash address: ${p.address}`);
  if (p.amount !== undefined && !/^\d{1,8}(\.\d{1,8})?$/.test(p.amount)) throw new Error(`ZIP-321: invalid amount "${p.amount}"`);
  if (p.memo !== undefined) {
    if (!info.shielded) throw new Error('ZIP-321: memos can only be sent to shielded addresses');
    if (!isMemoValid(p.memo)) throw new Error('ZIP-321: memo exceeds 512 bytes');
  }
}

/** Build a payment URI for one or many recipients. Throws on invalid input. */
export function buildPaymentUri(request: PaymentRequest | PaymentRequest[]): string {
  const list = Array.isArray(request) ? request : [request];
  if (list.length === 0) throw new Error('ZIP-321: at least one payment required');
  list.forEach(validate);

  const params = (p: PaymentRequest, i: number, includeAddress: boolean) => {
    const suffix = i === 0 ? '' : `.${i}`;
    const out: string[] = [];
    if (includeAddress) out.push(`address${suffix}=${p.address}`);
    if (p.amount !== undefined) out.push(`amount${suffix}=${p.amount}`);
    if (p.memo !== undefined) out.push(`memo${suffix}=${encodeMemoBase64Url(p.memo)}`);
    if (p.label !== undefined) out.push(`label${suffix}=${enc(p.label)}`);
    if (p.message !== undefined) out.push(`message${suffix}=${enc(p.message)}`);
    return out;
  };

  if (list.length === 1) {
    const qs = params(list[0]!, 0, false);
    return `zcash:${list[0]!.address}${qs.length ? `?${qs.join('&')}` : ''}`;
  }
  return `zcash:?${list.flatMap((p, i) => params(p, i, true)).join('&')}`;
}
