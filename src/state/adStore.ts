import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { AdState } from '../types';

// 广告管理器状态
type AdStoreState = {
  adState: AdState;
  setAdLoaded: (loaded: boolean) => void;
  setAdShowing: (showing: boolean) => void;
  setAdLoadError: (error: string | null) => void;
  setCanSkipAd: (canSkip: boolean) => void;
  setSkipCountdown: (countdown: number) => void;
  updateLastAdShownTime: () => void;
  shouldShowAd: () => Promise<boolean>;
  resetAdState: () => void;
};

const initialAdState: AdState = {
  isAdLoaded: false,
  isAdShowing: false,
  adLoadError: null,
  canSkipAd: false,
  skipCountdown: 3,
  lastAdShownTime: null,
  adFrequency: 0.01,
};

export const useAdStore = create<AdStoreState>((set, get) => ({
  adState: initialAdState,
  
  setAdLoaded: (loaded) => 
    set((state) => ({
      adState: { ...state.adState, isAdLoaded: loaded }
    })),
    
  setAdShowing: (showing) => 
    set((state) => ({
      adState: { ...state.adState, isAdShowing: showing }
    })),
    
  setAdLoadError: (error) => 
    set((state) => ({
      adState: { ...state.adState, adLoadError: error }
    })),
    
  setCanSkipAd: (canSkip) => 
    set((state) => ({
      adState: { ...state.adState, canSkipAd: canSkip }
    })),
    
  setSkipCountdown: (countdown) => 
    set((state) => ({
      adState: { ...state.adState, skipCountdown: countdown }
    })),
    
  updateLastAdShownTime: async () => {
    const now = Date.now();
    set((state) => ({
      adState: { ...state.adState, lastAdShownTime: now }
    }));
    await AsyncStorage.setItem('lastAdShownTime', now.toString());
  },
  
  shouldShowAd: async () => {
    const { adState } = get();
    const lastShown = await AsyncStorage.getItem('lastAdShownTime');
    
    console.log('=== 检查是否应该显示广告 ===');
    console.log('广告状态:', adState);
    console.log('上次显示时间:', lastShown);
    console.log('当前时间:', Date.now());
    console.log('广告频率:', adState.adFrequency, '小时');
    
    // 强制显示广告 - 每次进入应用都显示开屏广告
    console.log('强制显示开屏广告');
    return true;
  },
  
  resetAdState: () => set({ adState: initialAdState }),
}));
