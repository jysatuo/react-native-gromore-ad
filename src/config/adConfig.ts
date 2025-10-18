import { Platform } from 'react-native';
import { AdType, PluginConfig } from '../types';

// 默认广告配置
export const DEFAULT_AD_CONFIG = {
  // 开屏广告配置
  SPLASH_AD_CONFIG: {
    timeout: 5000,
    skipTime: 5000,
    autoCloseTime: 5000,
    imageSize: {
      width: 1080,
      height: 2400
    }
  },
  
  // 激励视频广告配置
  REWARD_VIDEO_CONFIG: {
    timeout: 8000,
    rewardName: '金币',
    rewardAmount: 10,
    orientation: 'vertical',
  },
  
  // 全屏视频广告配置
  FULL_SCREEN_VIDEO_CONFIG: {
    timeout: 8000,
    orientation: 'vertical',
  },
  
  // Banner广告配置
  BANNER_CONFIG: {
    timeout: 5000,
    refreshInterval: 30000,
    size: {
      width: 320,
      height: 50
    }
  },
  
  // 测试配置
  TEST_CONFIG: {
    enableTestMode: false,
    safePlaceholderMode: false,
    testAdUnitIds: {
      splash: {
        android: '103664273', 
        ios: '',
      },
      rewardVideo: {
        android: '', 
        ios: '',
      },
      fullScreenVideo: {
        android: '', 
        ios: '',
      },
      banner: {
        android: '', 
        ios: '',
      },
      interstitial: {
        android: '', 
        ios: '',
      }
    }
  },
  
  // 广告频率控制
  FREQUENCY_CONFIG: {
    splash: {
      minInterval: 0.01,
      maxPerDay: 50,
    },
    rewardVideo: {
      minInterval: 0,
      maxPerDay: 100,
    }
  }
};

// 生产环境广告配置
const PROD_AD_CONFIG = {
  GROMORE_APP_ID: {
    android: '5740367', 
    ios: ''
  },
  SPLASH_AD_UNIT_ID: {
    android: '103664273',
    ios: ''
  },
  REWARD_VIDEO_AD_UNIT_ID: {
    android: '103673847',
    ios: ''
  }
};

/**
 * 获取当前平台的广告位ID
 */
export const getAdUnitId = (type: keyof typeof AdType | string, config?: PluginConfig) => {
  const platform = Platform.OS as 'android' | 'ios';
  const isTest = config?.testMode || DEFAULT_AD_CONFIG.TEST_CONFIG.enableTestMode;
  const typeStr = String(type);
  // 兼容不同大小写/命名：优先精确键，其次小写键
  const pickFrom = (obj: Record<string, any> | undefined) => {
    if (!obj) return '';
    if (Object.prototype.hasOwnProperty.call(obj, typeStr)) return (obj as any)[typeStr] || '';
    const lower = typeStr.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(obj, lower)) return (obj as any)[lower] || '';
    return '';
  };
  
  if (isTest) {
    const testIds = DEFAULT_AD_CONFIG.TEST_CONFIG.testAdUnitIds as any;
    const candidate = pickFrom(testIds);
    if (candidate && typeof candidate === 'object') return candidate[platform] || '';
    return '';
  } else {
    // 优先使用配置中的广告位ID
    if (config?.adUnitIds) {
      const candidate = pickFrom(config.adUnitIds as any);
      return candidate || '';
    }
    
    // 使用默认配置
    switch (type) {
      case 'splash':
        return PROD_AD_CONFIG.SPLASH_AD_UNIT_ID[platform];
      case 'rewardVideo':
        return PROD_AD_CONFIG.REWARD_VIDEO_AD_UNIT_ID?.[platform] || '';
      default:
        return '';
    }
  }
};

/**
 * 获取应用ID
 */
export const getAppId = (config?: PluginConfig) => {
  const platform = Platform.OS as 'android' | 'ios';
  const isTest = config?.testMode || DEFAULT_AD_CONFIG.TEST_CONFIG.enableTestMode;
  
  if (config?.appId) {
    return config.appId;
  }
  
  return isTest ? '5740367' : PROD_AD_CONFIG.GROMORE_APP_ID[platform];
};

/**
 * 获取广告配置
 */
export const getAdConfig = (config?: PluginConfig) => {
  return {
    ...DEFAULT_AD_CONFIG,
    testMode: config?.testMode || DEFAULT_AD_CONFIG.TEST_CONFIG.enableTestMode,
    safePlaceholderMode: config?.safePlaceholderMode || DEFAULT_AD_CONFIG.TEST_CONFIG.safePlaceholderMode,
    frequency: config?.frequency || DEFAULT_AD_CONFIG.FREQUENCY_CONFIG,
    timeout: config?.timeout || {
      splash: DEFAULT_AD_CONFIG.SPLASH_AD_CONFIG.timeout,
      rewardVideo: DEFAULT_AD_CONFIG.REWARD_VIDEO_CONFIG.timeout,
      fullScreenVideo: DEFAULT_AD_CONFIG.FULL_SCREEN_VIDEO_CONFIG.timeout,
      banner: DEFAULT_AD_CONFIG.BANNER_CONFIG.timeout,
    }
  };
};
