// 广告类型枚举
export enum AdType {
  SPLASH = 'splash',
  REWARD_VIDEO = 'rewardVideo',
  FULL_SCREEN_VIDEO = 'fullScreenVideo',
  BANNER = 'banner',
  INTERSTITIAL = 'interstitial'
}

// 广告事件类型
export enum AdEventType {
  // 开屏广告事件
  SPLASH_AD_LOADED = 'onSplashAdLoaded',
  SPLASH_AD_SHOW = 'onSplashAdShow',
  SPLASH_AD_CLICK = 'onSplashAdClick',
  SPLASH_AD_SKIP = 'onSplashAdSkip',
  SPLASH_AD_CLOSE = 'onSplashAdClose',
  SPLASH_AD_ERROR = 'onSplashAdError',
  
  // 激励视频广告事件
  REWARD_VIDEO_LOADED = 'onRewardVideoLoaded',
  REWARD_VIDEO_SHOW = 'onRewardVideoShow',
  REWARD_VIDEO_CLICK = 'onRewardVideoClick',
  REWARD_VIDEO_CLOSE = 'onRewardVideoClose',
  REWARD_VIDEO_REWARD = 'onRewardVideoReward',
  REWARD_VIDEO_ERROR = 'onRewardVideoError'
}

// 广告加载结果接口
export interface AdLoadResult {
  success: boolean;
  message: string;
  code?: number;
  sdkVersion?: string;
}

// 广告状态检查结果接口
export interface AdStatusResult {
  isLoaded: boolean;
  message: string;
}

// SDK版本信息接口
export interface SDKVersionResult {
  version: string;
  initialized: boolean;
}

// 激励视频奖励信息接口
export interface RewardInfo {
  rewardVerify: boolean;
  rewardAmount: number;
  rewardName: string;
  errorCode: number;
  errorMsg: string;
}

// 事件监听器类型
export type AdEventListener = (data: any) => void;

// 广告状态类型
export interface AdState {
  isAdLoaded: boolean;
  isAdShowing: boolean;
  adLoadError: string | null;
  canSkipAd: boolean;
  skipCountdown: number;
  lastAdShownTime: number | null;
  adFrequency: number;
}

// 插件配置接口
export interface PluginConfig {
  appId: string;
  testMode?: boolean;
  safePlaceholderMode?: boolean;
  adUnitIds?: {
    splash?: string;
    rewardVideo?: string;
    fullScreenVideo?: string;
    banner?: string;
    interstitial?: string;
  };
  frequency?: {
    splash?: {
      minInterval: number; // 小时
      maxPerDay: number;
    };
    rewardVideo?: {
      minInterval: number;
      maxPerDay: number;
    };
  };
  timeout?: {
    splash?: number;
    rewardVideo?: number;
    fullScreenVideo?: number;
    banner?: number;
    interstitial?: number;
  };
}

// 奖励上下文接口
export interface RewardContext {
  user_id: string;
  reward_amount: number;
  reward_type: string;
  trans_id?: string;
  [k: string]: any;
}
