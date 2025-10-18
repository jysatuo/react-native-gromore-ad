import { AppState, NativeEventEmitter, NativeModules } from 'react-native';
import { AdEventListener, AdEventType, AdLoadResult, AdStatusResult, AdType, SDKVersionResult } from '../types';

// 获取原生模块
console.log('🔍 检查原生模块注册情况...');
console.log('📋 所有可用的原生模块:', Object.keys(NativeModules));

const { GroMoreModule } = NativeModules;
const groMoreModule = GroMoreModule;

console.log('📦 GroMoreModule 是否存在:', !!GroMoreModule);
console.log('📦 groMoreModule 对象:', groMoreModule);

// 创建事件发射器
let moduleForEvents: any = undefined;
if (groMoreModule) {
  const m: any = groMoreModule as any;
  if (typeof m.addListener !== 'function') {
    m.addListener = (_eventName: string) => {};
  }
  if (typeof m.removeListeners !== 'function') {
    m.removeListeners = (_count: number) => {};
  }
  moduleForEvents = m;
}
const groMoreEventEmitter = new NativeEventEmitter(moduleForEvents);

// 内部事件监听器类型
interface InternalEventListener {
  id: string;
  callback: AdEventListener;
}

/**
 * GroMore广告服务类
 * 提供完整的GroMore SDK集成功能
 */
export class GroMoreService {
  private eventListeners: Map<string, InternalEventListener[]> = new Map();
  private isInitialized = false;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * 初始化GroMore SDK
   */
  async init(appId: string, testMode: boolean = false): Promise<AdLoadResult> {
    try {
      console.log('🚀 初始化GroMore SDK, AppId:', appId, 'TestMode:', testMode);
      
      if (!groMoreModule) {
        console.error('❌ groMoreModule not found!');
        console.error('❌ 可用的原生模块:', Object.keys(NativeModules));
        throw new Error('groMoreModule not found. Please check native module setup.');
      }

      const result = await groMoreModule.init(appId);
      
      if (result.success) {
        this.isInitialized = true;
        console.log('✅ GroMore SDK初始化成功:', result);
      } else {
        console.error('❌ GroMore SDK初始化失败:', result);
      }
      return result;
    } catch (error: any) {
      console.error('❌ GroMore SDK初始化异常:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 加载广告
   */
  async loadAd(adType: AdType, adUnitId: string): Promise<AdLoadResult> {
    if (!this.isInitialized) {
      return { success: false, message: 'SDK not initialized' };
    }
    try {
      if (adType === AdType.REWARD_VIDEO) {
        return await groMoreModule.loadRewardVideoAd(adUnitId);
      }
      return await groMoreModule.loadAd(adType, adUnitId);
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * 显示广告
   */
  async showAd(adType: AdType, adUnitId: string): Promise<AdLoadResult> {
    if (!this.isInitialized) {
      return { success: false, message: 'SDK not initialized' };
    }
    try {
      if (adType === AdType.REWARD_VIDEO) {
        const loadRes = await groMoreModule.loadRewardVideoAd(adUnitId);
        if (!loadRes?.success) return loadRes;
        return await groMoreModule.showRewardVideoAd();
      }
      return await groMoreModule.showAd(adType, adUnitId);
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * 加载并显示开屏广告
   */
  async loadAndShowSplashAd(adUnitId: string): Promise<AdLoadResult> {
    if (!this.isInitialized) {
      return { success: false, message: 'SDK not initialized' };
    }
    
    if (!groMoreModule || typeof groMoreModule.loadSplashAd !== 'function') {
      console.warn('⚠️ GroMoreService: 原生方法 loadSplashAd 不可用，跳过开屏广告');
      return { success: false, message: 'Native loadSplashAd unavailable' };
    }
    
    try {
      if (AppState.currentState !== 'active') {
        await new Promise<void>((resolve) => {
          const subscription = AppState.addEventListener('change', (s: string) => {
            if (s === 'active') {
              subscription?.remove();
              resolve();
            }
          });
          setTimeout(() => {
            subscription?.remove();
            resolve();
          }, 2000);
        });
      }
      await new Promise(r => requestAnimationFrame(() => r(undefined)));
      await new Promise(r => setTimeout(r, 150));
    } catch {}

    try {
      console.log('🚀 GroMoreService: 开始加载开屏广告, 广告位ID:', adUnitId);
      const result = await groMoreModule.loadSplashAd(adUnitId);
      console.log('📊 GroMoreService: 开屏广告加载结果:', result);
      return result;
    } catch (error: any) {
      console.error('❌ GroMoreService: 开屏广告加载异常:', error);
      return { success: false, message: error.message, code: error.code };
    }
  }

  /**
   * 检查广告是否已加载
   */
  async checkAdStatus(adType: AdType, adUnitId: string): Promise<AdStatusResult> {
    if (!this.isInitialized) {
      return { isLoaded: false, message: 'SDK not initialized' };
    }
    try {
      return await groMoreModule.isAdLoaded(adType, adUnitId);
    } catch (error: any) {
      return { isLoaded: false, message: error.message };
    }
  }

  /**
   * 获取SDK版本信息
   */
  async getSDKVersion(): Promise<SDKVersionResult> {
    try {
      const version = await groMoreModule.getSDKVersion();
      return { version, initialized: this.isInitialized };
    } catch {
      return { version: 'unknown', initialized: this.isInitialized };
    }
  }

  /**
   * 原生可用性诊断
   */
  async getNativeDiagnostics(): Promise<{ hasModule: boolean; hasLoadSplashAd: boolean; hasAddListener: boolean; hasRemoveListeners: boolean; }> {
    const hasModule = !!groMoreModule;
    const hasLoadSplashAd = !!(groMoreModule && typeof groMoreModule.loadSplashAd === 'function');
    const hasAddListener = !!(groMoreModule && typeof (groMoreModule as any).addListener === 'function');
    const hasRemoveListeners = !!(groMoreModule && typeof (groMoreModule as any).removeListeners === 'function');
    return { hasModule, hasLoadSplashAd, hasAddListener, hasRemoveListeners };
  }

  /**
   * 添加事件监听器
   */
  addEventListener(eventType: AdEventType, listener: AdEventListener): string {
    const listenerId = `${eventType}_${Date.now()}`;
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)?.push({ id: listenerId, callback: listener });
    return listenerId;
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listenerId: string) {
    for (const [eventType, listeners] of this.eventListeners.entries()) {
      const filteredListeners = listeners.filter(l => l.id !== listenerId);
      this.eventListeners.set(eventType, filteredListeners);
    }
  }

  /**
   * 设置内部事件监听
   */
  private setupEventListeners() {
    if (this.eventListeners.size > 0) {
      return;
    }
    
    Object.values(AdEventType).forEach(eventType => {
      try {
        groMoreEventEmitter.addListener(eventType, (data: any) => {
          console.log(`🎧 GroMore Event: ${eventType}`, data);
          const listeners = this.eventListeners.get(eventType) || [];
          listeners.forEach(listener => listener.callback(data));
        });
      } catch (err) {
        console.warn(`⚠️ 无法添加事件监听器 ${eventType}:`, err);
      }
    });
  }

  /**
   * SDK是否已初始化
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * 强制关闭开屏广告
   */
  async forceCloseSplashAdFromNative(): Promise<AdLoadResult> {
    if (!this.isInitialized) {
      return { success: false, message: 'SDK not initialized' };
    }
    try {
      console.log('💥 强制关闭开屏广告');
      if (groMoreModule && typeof groMoreModule.forceCloseSplashAd === 'function') {
        const res = await groMoreModule.forceCloseSplashAd();
        try {
          const closeEventType = AdEventType.SPLASH_AD_CLOSE;
          const eventData = { adType: AdType.SPLASH, timestamp: Date.now(), reason: 'force_close' };
          const listeners = this.eventListeners.get(closeEventType) || [];
          listeners.forEach(listener => listener.callback(eventData));
        } catch {}
        return res;
      } else {
        return await this.closeSplashAdFromNative();
      }
    } catch (error: any) {
      console.warn('⚠️ GroMoreService: 强制关闭开屏广告失败:', error);
      return { success: false, message: error.message || 'Force close failed' };
    }
  }

  /**
   * 从原生关闭开屏广告
   */
  async closeSplashAdFromNative(): Promise<AdLoadResult> {
    if (!this.isInitialized) {
      return { success: false, message: 'SDK not initialized' };
    }
    try {
      console.log('🎯 使用官方方法关闭开屏广告');
      if (groMoreModule && typeof groMoreModule.closeSplashAd === 'function') {
        const res = await groMoreModule.closeSplashAd();
        try {
          const closeEventType = AdEventType.SPLASH_AD_CLOSE;
          const eventData = { adType: AdType.SPLASH, timestamp: Date.now(), reason: 'js_sync_close' };
          const listeners = this.eventListeners.get(closeEventType) || [];
          listeners.forEach(listener => listener.callback(eventData));
        } catch {}
        return res;
      } else {
        const res = await groMoreModule.closeAd('splash');
        try {
          const closeEventType = AdEventType.SPLASH_AD_CLOSE;
          const eventData = { adType: AdType.SPLASH, timestamp: Date.now(), reason: 'js_sync_close' };
          const listeners = this.eventListeners.get(closeEventType) || [];
          listeners.forEach(listener => listener.callback(eventData));
        } catch {}
        return res;
      }
    } catch (error: any) {
      console.warn('⚠️ GroMoreService: 原生关闭开屏广告方法调用失败:', error);
      return { success: false, message: error.message || 'Native closeSplashAd failed' };
    }
  }

  /**
   * 从原生关闭广告
   */
  async closeAdFromNative(adType: AdType): Promise<AdLoadResult> {
    if (!this.isInitialized) {
      return { success: false, message: 'SDK not initialized' };
    }
    try {
      if (adType === AdType.SPLASH) {
        return await this.closeSplashAdFromNative();
      }
      return await groMoreModule.closeAd(adType);
    } catch (error: any) {
      console.warn('⚠️ GroMoreService: 原生closeAd方法调用失败:', error);
      return { success: false, message: error.message || 'Native closeAd failed' };
    }
  }

  /**
   * 强制关闭广告
   */
  forceCloseAd(adType: AdType): void {
    console.log(`🎯 GroMoreService: 强制关闭${adType}广告`);
    
    try {
      const eventData = {
        adType: adType,
        timestamp: Date.now(),
        reason: 'force_close'
      };
      
      if (adType === AdType.SPLASH) {
        const closeEventType = AdEventType.SPLASH_AD_CLOSE;
        const skipEventType = AdEventType.SPLASH_AD_SKIP;
        
        const closeListeners = this.eventListeners.get(closeEventType) || [];
        closeListeners.forEach(listener => {
          try {
            listener.callback(eventData);
          } catch (error) {
            console.error(`⚠️ GroMoreService: 通知监听器出错`, error);
          }
        });
        
        const skipListeners = this.eventListeners.get(skipEventType) || [];
        skipListeners.forEach(listener => {
          try {
            listener.callback(eventData);
          } catch (error) {
            console.error(`⚠️ GroMoreService: 通知监听器出错`, error);
          }
        });
      } else if (adType === AdType.REWARD_VIDEO) {
        const closeEventType = AdEventType.REWARD_VIDEO_CLOSE;
        const listeners = this.eventListeners.get(closeEventType) || [];
        listeners.forEach(listener => {
          try {
            listener.callback(eventData);
          } catch (error) {
            console.error(`⚠️ GroMoreService: 通知监听器出错`, error);
          }
        });
      }
    } catch (error) {
      console.error(`❌ GroMoreService: 强制关闭广告异常`, error);
    }
  }
}

// 导出单例实例
export const groMoreService = new GroMoreService();

export type RewardContext = {
  user_id: string;
  reward_amount: number;
  reward_type: string;
  trans_id?: string;
  [k: string]: any;
};

export async function loadRewardVideoWithContext(adUnitId: string, ctx: RewardContext) {
  if (!groMoreService.initialized) {
    return { success: false, message: 'SDK not initialized' };
  }
  try {
    return await (NativeModules as any).GroMoreModule.loadRewardVideoAdWithContext(adUnitId, ctx);
  } catch (e: any) {
    return { success: false, message: e?.message || 'loadRewardVideoAdWithContext failed' };
  }
}

export async function showRewardVideoWithContext(adUnitId: string, ctx: RewardContext) {
  const res = await loadRewardVideoWithContext(adUnitId, ctx);
  if (!res?.success) return res;
  try {
    return await (NativeModules as any).GroMoreModule.showRewardVideoAd();
  } catch (e: any) {
    return { success: false, message: e?.message || 'showRewardVideoAd failed' };
  }
}
