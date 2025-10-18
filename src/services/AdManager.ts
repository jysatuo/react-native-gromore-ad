import { AppState, InteractionManager } from 'react-native';
import { getAdConfig, getAdUnitId, getAppId } from '../config/adConfig';
import { useAdStore } from '../state/adStore';
import { AdType, PluginConfig, RewardInfo } from '../types';
import { groMoreService } from './GroMoreService';

/**
 * 广告管理器 - 高级封装
 * 集成状态管理和业务逻辑
 */
export class AdManager {
  private static instance: AdManager;
  private isInitializing = false;
  private initPromise: Promise<boolean> | null = null;
  private _softInitialized = false;
  private config: PluginConfig;

  private constructor(config: PluginConfig) {
    this.config = config;
    this.setupEventListeners();
  }

  /**
   * 获取单例实例
   */
  static getInstance(config: PluginConfig): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager(config);
    }
    return AdManager.instance;
  }

  /**
   * 初始化广告SDK
   */
  async initialize(): Promise<boolean> {
    if (groMoreService.initialized) {
      console.log('✅ GroMore SDK already initialized');
      return true;
    }

    if (this.isInitializing && this.initPromise) {
      console.log('⏳ GroMore SDK initialization in progress, waiting...');
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = this._doInitialize();
    
    try {
      const result = await this.initPromise;
      return result;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  /**
   * 执行实际的初始化
   */
  private async _doInitialize(): Promise<boolean> {
    try {
      const appId = getAppId(this.config);
      
      if (!appId) {
        console.error('❌ App ID not configured');
        return false;
      }

      console.log('🚀 开始初始化GroMore SDK...', 'AppId:', appId);
      const result = await groMoreService.init(appId, this.config.testMode);
      
      if (result.success) {
        console.log('✅ GroMore SDK初始化成功');
        this._softInitialized = true;

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        for (let i = 0; i < 5; i++) {
          const sdkInfo = await groMoreService.getSDKVersion();
          if (sdkInfo.initialized) {
            console.log('✅ GroMore SDK验证就绪');
            return true;
          } else {
            console.warn(`⚠️ GroMore SDK验证未就绪，重试 ${i + 1}/5`);
            if (i < 4) {
              await new Promise(resolve => setTimeout(resolve, 800));
            }
          }
        }
        
        console.warn('⚠️ GroMore SDK初始化成功但验证未就绪，已达到最大重试次数');
        return true;
      } else {
        console.error('❌ GroMore SDK初始化失败:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ GroMore SDK初始化异常:', error);
      return false;
    }
  }

  /**
   * 预加载开屏广告
   */
  async preloadSplashAd(): Promise<boolean> {
    try {
      console.log('🚀 开始预加载开屏广告...');
      
      const shouldShow = await useAdStore.getState().shouldShowAd();
      if (!shouldShow) {
        console.log('🚫 根据频率控制，本次不预加载开屏广告');
        return false;
      }

      if (!this.initialized) {
        console.error('❌ SDK未初始化，无法预加载开屏广告');
        return false;
      }

      const adUnitId = getAdUnitId(AdType.SPLASH, this.config);
      if (!adUnitId) {
        console.error('❌ Splash Ad Unit ID not configured');
        return false;
      }

      console.log('⏳ 预加载开屏广告...', 'AdUnitId:', adUnitId);
      
      const adConfig = getAdConfig(this.config);
      if (adConfig.safePlaceholderMode) {
        console.warn('⚠️ 使用安全占位模式预加载开屏广告（测试/开发环境）');
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ 占位开屏广告预加载成功');
        return true;
      }

      await this.waitForAppActive(1000);
      await this.waitForFirstFrame();
      
      const result = await groMoreService.loadAndShowSplashAd(adUnitId);
      console.log('**开屏广告预加载结果:', result);
      
      if (result.success) {
        console.log('✅ 开屏广告预加载成功');
        return true;
      } else {
        console.error('❌ 开屏广告预加载失败:', result.message);
        return false;
      }
    } catch (error: any) {
      console.error('❌ 开屏广告预加载异常:', error);
      return false;
    }
  }

  /**
   * 加载并显示开屏广告
   */
  async loadAndShowSplashAd(): Promise<boolean> {
    try {
      const adStore = useAdStore.getState();
      
      const shouldShow = await adStore.shouldShowAd();
      if (!shouldShow) {
        console.log('🚫 根据频率控制，本次不显示开屏广告');
        return false;
      }

      if (!this.initialized) {
        console.error('❌ SDK未初始化，无法显示开屏广告');
        return false;
      }

      const sdkInfo = await groMoreService.getSDKVersion();
      if (!sdkInfo.initialized) {
        console.error('❌ SDK验证未就绪，无法显示开屏广告');
        return false;
      }

      if (useAdStore.getState().adState?.isAdShowing) {
        console.warn('⚠️ 已有开屏广告在展示中，跳过重复展示');
        return false;
      }
      
      adStore.resetAdState();

      const adUnitId = getAdUnitId(AdType.SPLASH, this.config);
      if (!adUnitId) {
        console.error('❌ Splash Ad Unit ID not configured');
        adStore.setAdShowing(false);
        return false;
      }

      console.log('⏳ 加载并显示开屏广告...', 'AdUnitId:', adUnitId);
      
      if (useAdStore.getState().adState?.isAdShowing) {
        console.warn('⚠️ 调用前检测到广告已在展示，跳过本次显示');
        return false;
      }
      
      const adConfig = getAdConfig(this.config);
      if (adConfig.safePlaceholderMode) {
        console.warn('⚠️ 使用安全占位模式展示开屏广告（测试/开发环境）');
        await new Promise(resolve => setTimeout(resolve, 600));
        useAdStore.getState().setAdLoaded(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('✅ 占位开屏广告展示成功');
        adStore.updateLastAdShownTime();
        adStore.setAdShowing(false);
        return true;
      }
      
      console.log('**开始加载开屏广告...');
      await this.waitForAppActive(2500);
      await this.waitForFirstFrame();
      
      const result = await groMoreService.loadAndShowSplashAd(adUnitId);
      console.log('**开屏广告显示结果:', result);
      
      if (result.success) {
        console.log('✅ 开屏广告显示成功');
        adStore.updateLastAdShownTime();
        return true;
      } else {
        console.error('❌ 开屏广告显示失败:', result.message);
        console.error('❌ 开屏广告错误码:', result.code);
        adStore.setAdLoadError(result.message);
        adStore.setAdShowing(false);
        return false;
      }
    } catch (error: any) {
      console.error('❌ 开屏广告显示异常:', error);
      console.error('❌ 开屏广告异常码:', error.code);
      console.error('❌ 开屏广告异常信息:', error.message);
      useAdStore.getState().setAdShowing(false);
      return false;
    }
  }

  /**
   * 等待 AppState 变为 active
   */
  private async waitForAppActive(maxWaitMs: number = 2500): Promise<void> {
    if (AppState.currentState === 'active') {
      await new Promise(r => setTimeout(r, 200));
      return;
    }
    let resolved = false;
    return new Promise<void>((resolve) => {
      const subscription = AppState.addEventListener('change', (state: string) => {
        if (state === 'active' && !resolved) {
          resolved = true;
          subscription?.remove();
          setTimeout(() => resolve(), 200);
        }
      });
      setTimeout(() => {
        if (!resolved) {
          subscription?.remove();
          resolve();
        }
      }, maxWaitMs);
    });
  }

  /**
   * 等待一次 UI 帧与交互结束
   */
  private async waitForFirstFrame(): Promise<void> {
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
    await new Promise(resolve => InteractionManager.runAfterInteractions(() => resolve(undefined)));
    await new Promise(r => setTimeout(r, 120));
  }

  /**
   * 加载激励视频广告
   */
  async loadRewardVideoAd(): Promise<boolean> {
    try {
      const adUnitId = getAdUnitId(AdType.REWARD_VIDEO, this.config);
      if (!adUnitId) {
        console.error('❌ Reward Video Ad Unit ID not configured');
        return false;
      }

      console.log('⏳ 加载激励视频广告...');
      const result = await groMoreService.loadAd(AdType.REWARD_VIDEO, adUnitId);
      
      if (result.success) {
        console.log('✅ 激励视频广告加载成功');
        return true;
      } else {
        console.error('❌ 激励视频广告加载失败:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ 激励视频广告加载异常:', error);
      return false;
    }
  }

  /**
   * 显示激励视频广告
   */
  async showRewardVideoAd(): Promise<RewardInfo | null> {
    return new Promise(async (resolve) => {
      const adUnitId = getAdUnitId(AdType.REWARD_VIDEO, this.config);
      if (!adUnitId) {
        console.error('❌ Reward Video Ad Unit ID not configured');
        resolve(null);
        return;
      }

      const rewardListener = groMoreService.addEventListener('onRewardVideoReward', (reward: RewardInfo) => {
        console.log('🎁 获得激励视频奖励:', reward);
        resolve(reward);
        groMoreService.removeEventListener(rewardListener);
        closeListener && groMoreService.removeEventListener(closeListener);
      });

      const closeListener = groMoreService.addEventListener('onRewardVideoClose', () => {
        console.log('🚪 激励视频广告关闭');
        resolve(null);
        groMoreService.removeEventListener(rewardListener);
        groMoreService.removeEventListener(closeListener);
      });

      try {
        console.log('⏳ 显示激励视频广告...');
        const result = await groMoreService.showAd(AdType.REWARD_VIDEO, adUnitId);
        if (!result.success) {
          console.error('❌ 激励视频广告显示失败:', result.message);
          resolve(null);
          groMoreService.removeEventListener(rewardListener);
          groMoreService.removeEventListener(closeListener);
        }
      } catch (error) {
        console.error('❌ 激励视频广告显示异常:', error);
        resolve(null);
        groMoreService.removeEventListener(rewardListener);
        groMoreService.removeEventListener(closeListener);
      }
    });
  }

  /**
   * 加载全屏视频广告
   */
  async loadFullScreenVideoAd(): Promise<boolean> {
    try {
      const adUnitId = getAdUnitId(AdType.FULL_SCREEN_VIDEO, this.config);
      if (!adUnitId) {
        console.error('❌ Full Screen Video Ad Unit ID not configured');
        return false;
      }

      console.log('⏳ 加载全屏视频广告...');
      const result = await groMoreService.loadAd(AdType.FULL_SCREEN_VIDEO, adUnitId);
      
      if (result.success) {
        console.log('✅ 全屏视频广告加载成功');
        return true;
      } else {
        console.error('❌ 全屏视频广告加载失败:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ 全屏视频广告加载异常:', error);
      return false;
    }
  }

  /**
   * 显示全屏视频广告
   */
  async showFullScreenVideoAd(): Promise<boolean> {
    try {
      const adUnitId = getAdUnitId(AdType.FULL_SCREEN_VIDEO, this.config);
      if (!adUnitId) {
        console.error('❌ Full Screen Video Ad Unit ID not configured');
        return false;
      }

      console.log('⏳ 显示全屏视频广告...');
      const result = await groMoreService.showAd(AdType.FULL_SCREEN_VIDEO, adUnitId);
      
      if (result.success) {
        console.log('✅ 全屏视频广告显示成功');
        return true;
      } else {
        console.error('❌ 全屏视频广告显示失败:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ 全屏视频广告显示异常:', error);
      return false;
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    // 开屏广告事件
    groMoreService.addEventListener('onSplashAdLoaded', () => useAdStore.getState().setAdLoaded(true));
    groMoreService.addEventListener('onSplashAdShow', () => useAdStore.getState().setAdShowing(true));
    groMoreService.addEventListener('onSplashAdClose', () => useAdStore.getState().setAdShowing(false));
    groMoreService.addEventListener('onSplashAdSkip', () => useAdStore.getState().setAdShowing(false));
    groMoreService.addEventListener('onSplashAdError', (error) => {
      useAdStore.getState().setAdLoadError(error.message);
      useAdStore.getState().setAdShowing(false);
    });

    // 激励视频事件
    groMoreService.addEventListener('onRewardVideoLoaded', () => console.log('🎧 Reward video ad loaded'));
    groMoreService.addEventListener('onRewardVideoError', (error) => console.error('❌ Reward video ad error:', error));
  }

  /**
   * 检查广告是否就绪
   */
  async isAdReady(adType: AdType): Promise<boolean> {
    const adUnitId = getAdUnitId(adType, this.config);
    if (!adUnitId) return false;

    const status = await groMoreService.checkAdStatus(adType, adUnitId);
    return status.isLoaded;
  }

  /**
   * 获取SDK版本信息
   */
  getSDKVersion() {
    return groMoreService.getSDKVersion();
  }
  
  /**
   * 获取单例实例
   */
  get initialized(): boolean {
    return groMoreService.initialized || this._softInitialized;
  }

  /**
   * 从原生关闭广告
   */
  async closeAdFromNative(adType: AdType = AdType.SPLASH): Promise<boolean> {
    try {
      console.log(`🎯 尝试从原生关闭${adType}广告`);
      const result = await groMoreService.closeAdFromNative(adType);
      console.log(`📊 原生关闭广告结果:`, result);
      
      if (result.success) {
        useAdStore.getState().setAdShowing(false);
        console.log(`✅ 成功从原生关闭${adType}广告`);
        return true;
      } else {
        console.warn(`⚠️ 原生关闭广告失败:`, result.message);
        return false;
      }
    } catch (error) {
      console.error(`❌ 关闭广告异常:`, error);
      return false;
    }
  }

  /**
   * 关闭广告
   */
  async closeAd(adType: AdType = AdType.SPLASH): Promise<boolean> {
    try {
      console.log(`🔄 开始关闭${adType}广告流程`);
      
      if (adType === AdType.SPLASH) {
        console.log(`💥 使用强制关闭方法关闭开屏广告`);
        const forceCloseResult = await groMoreService.forceCloseSplashAdFromNative();
        
        if (forceCloseResult.success) {
          console.log(`✅ 开屏广告强制关闭成功`);
          useAdStore.getState().setAdShowing(false);
          return true;
        } else {
          console.warn(`⚠️ 强制关闭失败，尝试普通关闭方法: ${forceCloseResult.message}`);
        }
      }
      
      const nativeCloseSuccess = await this.closeAdFromNative(adType);
      
      if (nativeCloseSuccess) {
        console.log(`✅ 广告关闭成功（原生方法）`);
        return true;
      }
      
      console.log(`🔄 原生关闭方法不可用，使用强制关闭策略`);
      groMoreService.forceCloseAd(adType);
      
      useAdStore.getState().setAdShowing(false);
      console.log(`✅ 广告关闭成功（强制关闭策略已执行）`);
      
      return true;
    } catch (error) {
      console.error(`❌ 关闭广告流程异常:`, error);
      
      try {
        useAdStore.getState().setAdShowing(false);
        console.log(`✅ 广告状态已强制更新为关闭`);
      } catch (stateError) {
        console.error(`❌ 更新广告状态失败:`, stateError);
      }
      
      return false;
    }
  }
}
