// Single source of truth for products, sub-pages and navigation. Product modules read this; don't duplicate it.

export type ProductId = 'dex' | 'perps' | 'prediction' | 'lending' | 'launchpad' | 'bridge' | 'deploy' | 'nft' | 'wallet' | 'explorer' | 'rpc' | 'payroll';
export type GroupId = 'trade' | 'earn' | 'assets' | 'pay' | 'build';

export interface Bilingual { en: string; zh: string }

export interface SubPage {
  /** URL segment after the product, '' = index. */
  id: string;
  label: Bilingual;
  /** Detail pages (with an id) are reachable by link only, not listed in the sub-nav. */
  hidden?: boolean;
}

export interface ProductMeta {
  id: ProductId;
  group: GroupId;
  name: Bilingual;
  tagline: Bilingual;
  /** Roadmap phase from the NoirProtocol plan. */
  phase: 1 | 2 | 3 | 4;
  /** Business priority 1–11 from the plan. Wallet = 0 (entry point). */
  priority: number;
  pages: SubPage[];
}

export const GROUPS: Record<GroupId, Bilingual> = {
  trade: { en: 'Trade', zh: '交易' },
  earn: { en: 'Earn', zh: '理财' },
  assets: { en: 'Assets', zh: '资产' },
  pay: { en: 'Pay', zh: '支付' },
  build: { en: 'Build', zh: '开发' },
};

const p = (id: string, en: string, zh: string, hidden?: boolean): SubPage => ({ id, label: { en, zh }, hidden });

export const PRODUCTS: ProductMeta[] = [
  { id: 'bridge', group: 'assets', priority: 1, phase: 1, name: { en: 'Bridge', zh: '跨链桥' }, tagline: { en: 'Move ZEC and major assets in and out of Noir.', zh: '把 ZEC 和主流资产转入、转出 Noir。' },
    pages: [p('', 'Transfer', '转账'), p('history', 'History', '历史'), p('tx', 'Transfer detail', '转账详情', true), p('routes', 'Routes & limits', '路线与限额'), p('recovery', 'Recovery', '资金恢复')] },
  { id: 'deploy', group: 'assets', priority: 2, phase: 1, name: { en: 'TokenDeploy', zh: '发币' }, tagline: { en: 'Create and manage TKN / TKNX tokens.', zh: '创建和管理 TKN / TKNX 代币。' },
    pages: [p('', 'Create', '创建'), p('tokens', 'My tokens', '我的代币'), p('token', 'Manage token', '管理代币', true), p('templates', 'Templates', '模板')] },
  { id: 'explorer', group: 'build', priority: 3, phase: 1, name: { en: 'Explorer', zh: '浏览器' }, tagline: { en: 'Transactions, blocks, tokens and cross-chain state.', zh: '交易、区块、代币和跨链状态。' },
    pages: [p('', 'Overview', '概览'), p('txs', 'Transactions', '交易'), p('tx', 'Transaction', '交易详情', true), p('blocks', 'Blocks', '区块'), p('block', 'Block', '区块详情', true), p('address', 'Address', '地址', true), p('tokens', 'Tokens', '代币'), p('token', 'Token', '代币详情', true), p('bridge', 'Bridge status', '跨链状态'), p('anchors', 'Anchors', '锚定')] },
  { id: 'dex', group: 'trade', priority: 4, phase: 1, name: { en: 'DEX', zh: 'DEX' }, tagline: { en: 'Swap and provide liquidity for ZEC, stablecoins and new tokens.', zh: '兑换 ZEC、稳定币和新代币，并提供流动性。' },
    pages: [p('', 'Swap', '兑换'), p('pools', 'Pools', '流动性池'), p('pool', 'Pool', '池详情', true), p('add', 'Add liquidity', '添加流动性'), p('positions', 'My positions', '我的仓位'), p('tokens', 'Tokens', '代币')] },
  { id: 'lending', group: 'earn', priority: 5, phase: 2, name: { en: 'Lending', zh: '借贷' }, tagline: { en: 'Borrow against ZEC without selling it.', zh: '抵押 ZEC 借款，无需卖出。' },
    pages: [p('', 'Dashboard', '我的'), p('markets', 'Markets', '市场'), p('market', 'Market', '市场详情', true), p('liquidations', 'Liquidations', '清算')] },
  { id: 'perps', group: 'trade', priority: 6, phase: 2, name: { en: 'Perps', zh: '永续合约' }, tagline: { en: 'Perpetual futures with leverage and risk controls.', zh: '带杠杆和风控的永续合约。' },
    pages: [p('', 'Trade', '交易'), p('markets', 'Markets', '市场'), p('portfolio', 'Portfolio', '资产组合'), p('funding', 'Funding', '资金费率')] },
  { id: 'rpc', group: 'build', priority: 7, phase: 3, name: { en: 'RPC', zh: 'RPC' }, tagline: { en: 'Zcash RPC, lightwalletd and Noir APIs.', zh: 'Zcash RPC、lightwalletd 和 Noir API。' },
    pages: [p('', 'Overview', '概览'), p('keys', 'API keys', 'API 密钥'), p('usage', 'Usage', '用量'), p('docs', 'Quickstart', '快速开始'), p('plans', 'Plans', '套餐')] },
  { id: 'nft', group: 'assets', priority: 8, phase: 4, name: { en: 'NFTTrade', zh: 'NFT 交易' }, tagline: { en: 'Mint, list and trade NFTs.', zh: '铸造、挂单和交易 NFT。' },
    pages: [p('', 'Explore', '探索'), p('collection', 'Collection', '合集', true), p('item', 'Item', '藏品', true), p('create', 'Create', '创建'), p('mine', 'My NFTs', '我的 NFT')] },
  { id: 'launchpad', group: 'earn', priority: 9, phase: 4, name: { en: 'LaunchPad', zh: 'LaunchPad' }, tagline: { en: 'Token sales and initial liquidity.', zh: '代币发售与初始流动性。' },
    pages: [p('', 'Projects', '项目'), p('project', 'Project', '项目详情', true), p('create', 'Launch', '发起'), p('mine', 'My contributions', '我的参与')] },
  { id: 'prediction', group: 'trade', priority: 10, phase: 2, name: { en: 'Prediction', zh: '预测市场' }, tagline: { en: 'Trade on real-world outcomes with ZEC.', zh: '用 ZEC 交易真实事件的结果。' },
    pages: [p('', 'Markets', '市场'), p('market', 'Market', '市场详情', true), p('portfolio', 'Portfolio', '持仓')] },
  { id: 'payroll', group: 'pay', priority: 11, phase: 3, name: { en: 'Payroll', zh: '工资支付' }, tagline: { en: 'Shielded salaries and batch payouts.', zh: '屏蔽工资发放与批量付款。' },
    pages: [p('', 'Overview', '概览'), p('new', 'New run', '新建发放'), p('run', 'Run', '发放详情', true), p('people', 'People', '收款人'), p('history', 'History', '历史')] },
  { id: 'wallet', group: 'pay', priority: 0, phase: 1, name: { en: 'Wallet', zh: '钱包' }, tagline: { en: 'Balances, send, receive and activity.', zh: '余额、发送、收款和动态。' },
    pages: [p('', 'Overview', '概览'), p('send', 'Send', '发送'), p('receive', 'Receive', '收款'), p('activity', 'Activity', '动态'), p('settings', 'Settings', '设置')] },
];

export const productById = (id: string) => PRODUCTS.find((x) => x.id === id);

/** Hash link: link('dex', 'pool', 'zec-usdc') -> "#/dex/pool/zec-usdc". */
export const link = (...parts: string[]) => `#/${parts.filter(Boolean).join('/')}`;
