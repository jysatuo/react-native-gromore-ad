export type InitResult = {
  success: boolean;
  message?: string;
  sdkVersion?: string;
  code?: number;
};

export type CommonResult = {
  success: boolean;
  message?: string;
  code?: number;
};

export function on(event: string, listener: (data: any) => void): { remove: () => void };

export function init(appId: string): Promise<InitResult>;
export function getSDKVersion(): Promise<string>;

export function loadSplashAd(adUnitId: string): Promise<CommonResult>;
export function closeSplashAd(): Promise<CommonResult>;
export function forceCloseSplashAd(): Promise<CommonResult>;

export function loadRewardVideoAd(adUnitId: string): Promise<CommonResult>;
export function showRewardVideoAd(): Promise<CommonResult>;

export function loadFullScreenVideoAd(adUnitId: string): Promise<CommonResult>;
export function showFullScreenVideoAd(): Promise<CommonResult>;

export function loadAd(adType: string, adUnitId: string): Promise<CommonResult>;
export function showAd(adType: string, adUnitId: string): Promise<CommonResult>;
export function isAdLoaded(adType: string, adUnitId: string): Promise<{ isLoaded: boolean; message?: string }>; 


