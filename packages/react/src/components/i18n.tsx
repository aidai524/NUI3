import { createContext, useContext, useMemo, type ReactNode } from 'react';

/** Every user-visible default string in the kit. Override any subset via <LocaleProvider messages>. */
export interface NuiMessages {
  copy: string; copied: string; copyAddress: string; copyHash: string;
  close: string; dismiss: string; notifications: string; cancel: string; confirm: string;
  menu: string; primaryNav: string; breadcrumb: string;
  selectToken: string; searchTokens: string; searchTokensPlaceholder: string; noTokensMatch: string; tokens: string;
  balance: string; max: string; amount: string; switchTokens: string;
  amountHidden: string; increase: string; decrease: string; opensInNewTab: string; open: string; noResults: string;
  syncing: string; synced: string;
  memoPlaceholder: string; memoTransparent: string; bytes: string;
  qrFor: string;
  healthFactor: string; zoneSafe: string; zoneWarning: string; zoneDanger: string;
  txPending: string; txConfirming: string; txConfirmed: string; txFailed: string; txExpired: string; txRefunded: string;
  privacyShielded: string; privacyShieldedDesc: string;
  privacyConfidential: string; privacyConfidentialDesc: string;
  privacyPublic: string; privacyPublicDesc: string;
  poolOrchard: string; poolSapling: string; poolTransparent: string;
  disclaimer: string;
  stepPending: string; stepActive: string; stepComplete: string; stepError: string;
  // trading / charts / content
  price: string; size: string; total: string; spread: string; bids: string; asks: string; lastPrice: string;
  leverage: string; long: string; short: string; entry: string; mark: string; liqPrice: string; pnl: string; market: string; side: string; closePosition: string;
  previous: string; next: string; page: string; reveal: string; hide: string;
  dropFiles: string; browse: string; fileTooLarge: string;
  days: string; hours: string; minutes: string; seconds: string; ended: string;
  operational: string; degraded: string; outage: string; noData: string;
  recipient: string; memo: string; status: string; remove: string; valid: string; rowsInvalid: string; recipients: string;
  invalidAddress: string; invalidAmount: string; memoNotAllowed: string; memoTooLong: string;
  pasteCsv: string; pasteCsvHint: string; importCsv: string; noCsvRows: string;
  chartEmpty: string;
}

export const en: NuiMessages = {
  copy: 'Copy', copied: 'Copied', copyAddress: 'Copy address', copyHash: 'Copy hash',
  close: 'Close', dismiss: 'Dismiss', notifications: 'Notifications', cancel: 'Cancel', confirm: 'Confirm',
  menu: 'Menu', primaryNav: 'Primary', breadcrumb: 'Breadcrumb',
  selectToken: 'Select token', searchTokens: 'Search tokens', searchTokensPlaceholder: 'Search name, symbol or address', noTokensMatch: 'No tokens match', tokens: 'Tokens',
  balance: 'Balance', max: 'Max', amount: 'Amount', switchTokens: 'Switch tokens',
  amountHidden: 'Amount hidden', increase: 'increase', decrease: 'decrease', opensInNewTab: 'opens in a new tab', open: 'Open', noResults: 'No results',
  syncing: 'Syncing', synced: 'Synced',
  memoPlaceholder: 'Optional encrypted memo', memoTransparent: 'Memos can only be sent to shielded addresses', bytes: 'bytes',
  qrFor: 'QR code for',
  healthFactor: 'Health factor', zoneSafe: 'safe', zoneWarning: 'at risk', zoneDanger: 'liquidatable',
  txPending: 'Pending', txConfirming: 'Confirming', txConfirmed: 'Confirmed', txFailed: 'Failed', txExpired: 'Expired', txRefunded: 'Refunded',
  privacyShielded: 'Shielded', privacyShieldedDesc: 'Zcash shielded pool. Sender, recipient and amount are encrypted on-chain.',
  privacyConfidential: 'Confidential', privacyConfidentialDesc: 'Confidential execution. Balances and positions are hidden from the public, but are processed by the execution environment and are not protected by Zcash shielded cryptography.',
  privacyPublic: 'Public', privacyPublicDesc: 'Public chain or external protocol. Addresses, amounts and history are visible to anyone.',
  poolOrchard: 'Orchard', poolSapling: 'Sapling', poolTransparent: 'Transparent',
  disclaimer: 'Not affiliated with the Zcash Foundation or Electric Coin Company.',
  stepPending: 'pending', stepActive: 'in progress', stepComplete: 'complete', stepError: 'error',
  price: 'Price', size: 'Size', total: 'Total', spread: 'Spread', bids: 'Bids', asks: 'Asks', lastPrice: 'Last price',
  leverage: 'Leverage', long: 'Long', short: 'Short', entry: 'Entry', mark: 'Mark', liqPrice: 'Liq. price', pnl: 'PnL', market: 'Market', side: 'Side', closePosition: 'Close',
  previous: 'Previous', next: 'Next', page: 'Page', reveal: 'Reveal', hide: 'Hide',
  dropFiles: 'Drop a file here, or', browse: 'browse', fileTooLarge: 'File is too large',
  days: 'd', hours: 'h', minutes: 'm', seconds: 's', ended: 'Ended',
  operational: 'Operational', degraded: 'Degraded', outage: 'Outage', noData: 'No data',
  recipient: 'Recipient', memo: 'Memo', status: 'Status', remove: 'Remove', valid: 'Valid', rowsInvalid: 'rows need attention', recipients: 'recipients',
  invalidAddress: 'Invalid address', invalidAmount: 'Invalid amount', memoNotAllowed: 'Memos need a shielded address', memoTooLong: 'Memo over 512 bytes',
  pasteCsv: 'Paste CSV', pasteCsvHint: 'Columns: name, address, amount, memo. The header is optional.', importCsv: 'Import CSV', noCsvRows: 'No payment rows found',
  chartEmpty: 'No data for this range',
};

export const zh: NuiMessages = {
  copy: '复制', copied: '已复制', copyAddress: '复制地址', copyHash: '复制哈希',
  close: '关闭', dismiss: '关闭', notifications: '通知', cancel: '取消', confirm: '确认',
  menu: '菜单', primaryNav: '主导航', breadcrumb: '面包屑',
  selectToken: '选择代币', searchTokens: '搜索代币', searchTokensPlaceholder: '搜索名称、符号或地址', noTokensMatch: '没有匹配的代币', tokens: '代币',
  balance: '余额', max: '最大', amount: '数量', switchTokens: '交换方向',
  amountHidden: '金额已隐藏', increase: '上涨', decrease: '下跌', opensInNewTab: '在新标签页打开', open: '打开', noResults: '没有结果',
  syncing: '同步中', synced: '已同步',
  memoPlaceholder: '可选的加密备注', memoTransparent: '只有屏蔽地址可以接收备注', bytes: '字节',
  qrFor: '二维码：',
  healthFactor: '健康系数', zoneSafe: '安全', zoneWarning: '有风险', zoneDanger: '可被清算',
  txPending: '待处理', txConfirming: '确认中', txConfirmed: '已确认', txFailed: '失败', txExpired: '已过期', txRefunded: '已退回',
  privacyShielded: '屏蔽', privacyShieldedDesc: 'Zcash 屏蔽池。发送方、接收方和金额在链上加密。',
  privacyConfidential: '机密', privacyConfidentialDesc: '机密执行。余额和仓位对公众不可见，但由执行环境处理，不受 Zcash 屏蔽密码学保护。',
  privacyPublic: '公开', privacyPublicDesc: '公链或外部协议。地址、金额和历史对所有人可见。',
  poolOrchard: 'Orchard', poolSapling: 'Sapling', poolTransparent: '透明',
  disclaimer: '与 Zcash 基金会及 Electric Coin Company 无隶属关系。',
  stepPending: '未开始', stepActive: '进行中', stepComplete: '已完成', stepError: '出错',
  price: '价格', size: '数量', total: '累计', spread: '价差', bids: '买单', asks: '卖单', lastPrice: '最新价',
  leverage: '杠杆', long: '做多', short: '做空', entry: '开仓价', mark: '标记价', liqPrice: '强平价', pnl: '盈亏', market: '市场', side: '方向', closePosition: '平仓',
  previous: '上一页', next: '下一页', page: '第', reveal: '显示', hide: '隐藏',
  dropFiles: '把文件拖到这里，或', browse: '选择文件', fileTooLarge: '文件过大',
  days: '天', hours: '时', minutes: '分', seconds: '秒', ended: '已结束',
  operational: '正常', degraded: '降级', outage: '故障', noData: '无数据',
  recipient: '收款人', memo: '备注', status: '状态', remove: '移除', valid: '有效', rowsInvalid: '行需要处理', recipients: '位收款人',
  invalidAddress: '地址无效', invalidAmount: '金额无效', memoNotAllowed: '备注需要屏蔽地址', memoTooLong: '备注超过 512 字节',
  pasteCsv: '粘贴 CSV', pasteCsvHint: '列：name、address、amount、memo；表头可省略。', importCsv: '导入 CSV', noCsvRows: '未找到付款记录',
  chartEmpty: '该时间段没有数据',
};

export const locales = { en, zh } as const;

interface LocaleValue {
  /** BCP-47 tag used for Intl number/date formatting. */
  locale: string;
  m: NuiMessages;
}
const LocaleContext = createContext<LocaleValue>({ locale: 'en-US', m: en });

export interface LocaleProviderProps {
  /** 'en' | 'zh' or any BCP-47 tag (formatting). */
  locale?: string;
  /** Base message pack. Defaults to `zh` for zh-* locales, else `en`. */
  base?: NuiMessages;
  /** Partial overrides on top of the base pack. */
  messages?: Partial<NuiMessages>;
  children: ReactNode;
}
/** Localize every built-in string and number format. Nest to override per section. */
export function LocaleProvider({ locale = 'en', base, messages, children }: LocaleProviderProps) {
  const value = useMemo(() => {
    const tag = locale === 'zh' ? 'zh-CN' : locale === 'en' ? 'en-US' : locale;
    const pack = base ?? (tag.startsWith('zh') ? zh : en);
    return { locale: tag, m: messages ? { ...pack, ...messages } : pack };
  }, [locale, base, messages]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Current messages and Intl locale. Works without a provider (English). */
export const useNuiLocale = () => useContext(LocaleContext);
