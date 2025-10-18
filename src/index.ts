// 主插件类
export { GromoreAdPlugin } from './GromoreAdPlugin';

// 类型定义
export * from './types';

// 配置
export { DEFAULT_AD_CONFIG, getAdConfig, getAdUnitId, getAppId } from './config/adConfig';

// 服务
export { AdManager } from './services/AdManager';
export { groMoreService, loadRewardVideoWithContext, showRewardVideoWithContext } from './services/GroMoreService';

// 状态管理
export { useAdStore } from './state/adStore';

// 组件
export { GromoreBannerAd } from './components/GromoreBannerAd';
export { useGromoreInterstitialAd } from './components/GromoreInterstitialAd';
export { GromoreSplashAd } from './components/GromoreSplashAd';

// 默认导出
export { GromoreAdPlugin as default } from './GromoreAdPlugin';
