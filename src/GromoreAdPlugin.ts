import { getAdConfig, getAdUnitId, getAppId } from './config/adConfig';
import { AdManager } from './services/AdManager';
import { groMoreService } from './services/GroMoreService';
import { useAdStore } from './state/adStore';
import { AdEventListener, AdEventType, AdType, PluginConfig, RewardInfo } from './types';

/**
 * GroMore广告插件主类
 * 提供统一的广告管理接口
 */
export class GromoreAdPlugin {
  private adManager: AdManager;
  private config: PluginConfig;
  private eventListeners: Map<string, AdEventListener[]> = new Map();

  constructor(config: PluginConfig) {
    this.config = config;
    this.adManager = AdManager.getInstance(config);
    this.setupEventListeners();
  }

  /**
   * 初始化插件
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 初始化GroMore广告插件...');
      const success = await this.adManager.initialize();
      
      if (success) {
        console.log('✅ GroMore广告插件初始化成功');
        this.emit('initialized', { success: true });
      } else {
        console.error('❌ GroMore广告插件初始化失败');
        this.emit('initialized', { success: false });
      }
      
      return success;
    } catch (error) {
      console.error('❌ GroMore广告插件初始化异常:', error);
      this.emit('initialized', { success: false, error });
      return false;
    }
  }

  /**
   * 显示开屏广告
   */
  async showSplashAd(): Promise<boolean> {
    try {
      console.log('🎬 显示开屏广告...');
      const success = await this.adManager.loadAndShowSplashAd();
      
      if (success) {
        console.log('✅ 开屏广告显示成功');
        this.emit('splashAdShown', { success: true });
      } else {
        console.error('❌ 开屏广告显示失败');
        this.emit('splashAdShown', { success: false });
      }
      
      return success;
    } catch (error) {
      console.error('❌ 开屏广告显示异常:', error);
      this.emit('splashAdShown', { success: false, error });
      return false;
    }
  }

  /**
   * 预加载开屏广告
   */
  async preloadSplashAd(): Promise<boolean> {
    try {
      console.log('⏳ 预加载开屏广告...');
      const success = await this.adManager.preloadSplashAd();
      
      if (success) {
        console.log('✅ 开屏广告预加载成功');
        this.emit('splashAdPreloaded', { success: true });
      } else {
        console.error('❌ 开屏广告预加载失败');
        this.emit('splashAdPreloaded', { success: false });
      }
      
      return success;
    } catch (error) {
      console.error('❌ 开屏广告预加载异常:', error);
      this.emit('splashAdPreloaded', { success: false, error });
      return false;
    }
  }

  /**
   * 显示激励视频广告
   */
  async showRewardVideoAd(): Promise<RewardInfo | null> {
    try {
      console.log('🎬 显示激励视频广告...');
      const reward = await this.adManager.showRewardVideoAd();
      
      if (reward) {
        console.log('✅ 激励视频广告完成，获得奖励:', reward);
        this.emit('rewardVideoReward', reward);
      } else {
        console.log('ℹ️ 激励视频广告未获得奖励');
        this.emit('rewardVideoClosed', { reward: null });
      }
      
      return reward;
    } catch (error) {
      console.error('❌ 激励视频广告显示异常:', error);
      this.emit('rewardVideoError', { error });
      return null;
    }
  }

  /**
   * 显示全屏视频广告
   */
  async showFullScreenVideoAd(): Promise<boolean> {
    try {
      console.log('🎬 显示全屏视频广告...');
      const success = await this.adManager.showFullScreenVideoAd();
      
      if (success) {
        console.log('✅ 全屏视频广告显示成功');
        this.emit('fullScreenVideoShown', { success: true });
      } else {
        console.error('❌ 全屏视频广告显示失败');
        this.emit('fullScreenVideoShown', { success: false });
      }
      
      return success;
    } catch (error) {
      console.error('❌ 全屏视频广告显示异常:', error);
      this.emit('fullScreenVideoShown', { success: false, error });
      return false;
    }
  }

  /**
   * 加载横幅广告
   */
  async loadBannerAd(adUnitId?: string): Promise<boolean> {
    try {
      const unitId = adUnitId || getAdUnitId(AdType.BANNER, this.config);
      if (!unitId) {
        console.error('❌ Banner Ad Unit ID not configured');
        return false;
      }

      console.log('⏳ 加载横幅广告...');
      const success = await this.adManager.loadAd(AdType.BANNER, unitId);
      
      if (success) {
        console.log('✅ 横幅广告加载成功');
        this.emit('bannerAdLoaded', { success: true });
      } else {
        console.error('❌ 横幅广告加载失败');
        this.emit('bannerAdLoaded', { success: false });
      }
      
      return success;
    } catch (error) {
      console.error('❌ 横幅广告加载异常:', error);
      this.emit('bannerAdLoaded', { success: false, error });
      return false;
    }
  }

  /**
   * 显示插屏广告
   */
  async showInterstitialAd(): Promise<boolean> {
    try {
      console.log('🎬 显示插屏广告...');
      const adUnitId = getAdUnitId(AdType.INTERSTITIAL, this.config);
      if (!adUnitId) {
        console.error('❌ Interstitial Ad Unit ID not configured');
        return false;
      }

      const success = await this.adManager.showAd(AdType.INTERSTITIAL, adUnitId);
      
      if (success) {
        console.log('✅ 插屏广告显示成功');
        this.emit('interstitialAdShown', { success: true });
      } else {
        console.error('❌ 插屏广告显示失败');
        this.emit('interstitialAdShown', { success: false });
      }
      
      return success;
    } catch (error) {
      console.error('❌ 插屏广告显示异常:', error);
      this.emit('interstitialAdShown', { success: false, error });
      return false;
    }
  }

  /**
   * 关闭广告
   */
  async closeAd(adType: AdType = AdType.SPLASH): Promise<boolean> {
    try {
      console.log(`🔄 关闭${adType}广告...`);
      const success = await this.adManager.closeAd(adType);
      
      if (success) {
        console.log(`✅ ${adType}广告关闭成功`);
        this.emit('adClosed', { adType, success: true });
      } else {
        console.error(`❌ ${adType}广告关闭失败`);
        this.emit('adClosed', { adType, success: false });
      }
      
      return success;
    } catch (error) {
      console.error(`❌ 关闭${adType}广告异常:`, error);
      this.emit('adClosed', { adType, success: false, error });
      return false;
    }
  }

  /**
   * 检查广告是否就绪
   */
  async isAdReady(adType: AdType): Promise<boolean> {
    try {
      return await this.adManager.isAdReady(adType);
    } catch (error) {
      console.error(`❌ 检查${adType}广告状态异常:`, error);
      return false;
    }
  }

  /**
   * 获取SDK版本信息
   */
  async getSDKVersion() {
    return await this.adManager.getSDKVersion();
  }

  /**
   * 获取原生诊断信息
   */
  async getNativeDiagnostics() {
    return await groMoreService.getNativeDiagnostics();
  }

  /**
   * 添加事件监听器
   */
  addEventListener(event: string, listener: AdEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(event: string, listener: AdEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 获取广告状态
   */
  get adState() {
    return useAdStore.getState().adState;
  }

  /**
   * 检查是否已初始化
   */
  get isInitialized(): boolean {
    return this.adManager.initialized;
  }

  /**
   * 检查是否有广告正在显示
   */
  get isAdShowing(): boolean {
    return this.adState.isAdShowing;
  }

  /**
   * 获取配置信息
   */
  get configuration() {
    return {
      ...this.config,
      appId: getAppId(this.config),
      adConfig: getAdConfig(this.config)
    };
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    // 监听内部广告事件
    groMoreService.addEventListener(AdEventType.SPLASH_AD_LOADED, () => {
      this.emit('splashAdLoaded', {});
    });

    groMoreService.addEventListener(AdEventType.SPLASH_AD_SHOW, () => {
      this.emit('splashAdShow', {});
    });

    groMoreService.addEventListener(AdEventType.SPLASH_AD_CLOSE, () => {
      this.emit('splashAdClose', {});
    });

    groMoreService.addEventListener(AdEventType.SPLASH_AD_ERROR, (error) => {
      this.emit('splashAdError', { error });
    });

    groMoreService.addEventListener(AdEventType.REWARD_VIDEO_LOADED, () => {
      this.emit('rewardVideoLoaded', {});
    });

    groMoreService.addEventListener(AdEventType.REWARD_VIDEO_REWARD, (reward) => {
      this.emit('rewardVideoReward', reward);
    });

    groMoreService.addEventListener(AdEventType.REWARD_VIDEO_CLOSE, () => {
      this.emit('rewardVideoClose', {});
    });

    groMoreService.addEventListener(AdEventType.REWARD_VIDEO_ERROR, (error) => {
      this.emit('rewardVideoError', { error });
    });
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`❌ 事件监听器执行异常 (${event}):`, error);
        }
      });
    }
  }
}

// 导出便捷函数
export * from './components/GromoreBannerAd';
export { useGromoreInterstitialAd } from './components/GromoreInterstitialAd';
export * from './components/GromoreSplashAd';
export { getAdConfig, getAdUnitId, getAppId } from './config/adConfig';
export { loadRewardVideoWithContext, showRewardVideoWithContext } from './services/GroMoreService';
export { useAdStore } from './state/adStore';
export * from './types';

