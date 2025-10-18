package com.skylantern.gromoread;

import android.os.Bundle;
import android.os.Handler;

import com.bytedance.sdk.openadsdk.AdSlot;
import com.bytedance.sdk.openadsdk.CSJAdError;
import com.bytedance.sdk.openadsdk.CSJSplashAd;
// GroMore SDK imports
import com.bytedance.sdk.openadsdk.TTAdConfig;
import com.bytedance.sdk.openadsdk.TTAdConstant;
import com.bytedance.sdk.openadsdk.TTAdNative;
import com.bytedance.sdk.openadsdk.TTAdSdk;
import com.bytedance.sdk.openadsdk.TTFullScreenVideoAd;
import com.bytedance.sdk.openadsdk.TTRewardVideoAd;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.app.Activity;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.widget.FrameLayout;

/**
 * GroMore广告模块
 * 提供完整的GroMore SDK集成功能
 */
public class GroMoreModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private static final String TAG = "GroMoreModule";
    private ReactApplicationContext reactContext;
    private TTAdNative adNative;
    private CSJSplashAd splashAd;
    private TTRewardVideoAd rewardVideoAd;
    private TTFullScreenVideoAd fullScreenVideoAd;
    private boolean isSDKInitialized = false;
    private Handler mainHandler = new Handler(Looper.getMainLooper());
    private ViewGroup splashContainer;

    public GroMoreModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        reactContext.addLifecycleEventListener(this);
        Log.d(TAG, "GroMoreModule 构造函数被调用");
    }

    @Override
    public String getName() {
        return "GroMoreModule";
    }

    @Override
    public void onHostResume() {
        Log.d(TAG, "onHostResume");
    }

    @Override
    public void onHostPause() {
        Log.d(TAG, "onHostPause");
    }

    @Override
    public void onHostDestroy() {
        Log.d(TAG, "onHostDestroy");
        if (splashAd != null) {
            splashAd = null;
        }
        if (rewardVideoAd != null) {
            rewardVideoAd = null;
        }
        if (fullScreenVideoAd != null) {
            fullScreenVideoAd = null;
        }
    }

    // Required for React Native's NativeEventEmitter bridge
    // See: https://reactnative.dev/docs/native-modules-android#sending-events-to-javascript
    @ReactMethod
    public void addListener(String eventName) {
        // No-op: RN JS side manages subscriptions; this method is required to avoid warnings
    }

    @ReactMethod
    public void removeListeners(double count) {
        // No-op: RN JS side manages subscriptions; this method is required to avoid warnings
    }

    /**
     * 初始化GroMore SDK
     */
    @ReactMethod
    public void init(String appId, Promise promise) {
        Log.d(TAG, "init called with appId: " + appId);
        
        if (isSDKInitialized) {
            Log.d(TAG, "SDK already initialized");
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "SDK already initialized");
            promise.resolve(result);
            return;
        }

        try {
            // 创建SDK配置
            TTAdConfig adConfig = new TTAdConfig.Builder()
                    .appId(appId)
                    .appName("SkyLanternWishes")
                    .titleBarTheme(TTAdConstant.TITLE_BAR_THEME_DARK)
                    .allowShowNotify(true)
                    .debug(true)
                    .directDownloadNetworkType(TTAdConstant.NETWORK_STATE_WIFI, TTAdConstant.NETWORK_STATE_3G)
                    .supportMultiProcess(false)
                    .useMediation(true)
                    .build();

            // 初始化SDK
            boolean initResult = TTAdSdk.init(reactContext, adConfig);
            Log.d(TAG, "TTAdSdk.init() result: " + initResult);

            if (initResult) {
                // 启动SDK
                TTAdSdk.start(new TTAdSdk.Callback() {
                    @Override
                    public void success() {
                        Log.d(TAG, "GroMore SDK started successfully");
                        isSDKInitialized = true;
                        adNative = TTAdSdk.getAdManager().createAdNative(reactContext);
                        
                        WritableMap result = Arguments.createMap();
                        result.putBoolean("success", true);
                        result.putString("message", "SDK initialized successfully");
                        result.putString("sdkVersion", TTAdSdk.getAdManager().getSDKVersion());
                        promise.resolve(result);
                    }

                    @Override
                    public void fail(int code, String msg) {
                        Log.e(TAG, "GroMore SDK start failed: " + code + ", " + msg);
                        WritableMap result = Arguments.createMap();
                        result.putBoolean("success", false);
                        result.putString("message", "SDK start failed: " + msg);
                        result.putInt("code", code);
                        promise.reject("SDK_START_FAILED", msg);
                    }
                });
            } else {
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                result.putString("message", "SDK init failed");
                promise.reject("SDK_INIT_FAILED", "SDK init failed");
            }
        } catch (Exception e) {
            Log.e(TAG, "Exception during SDK initialization", e);
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "Exception: " + e.getMessage());
            promise.reject("SDK_INIT_EXCEPTION", e.getMessage());
        }
    }

    /**
     * 加载并显示开屏广告
     */
    @ReactMethod
    public void loadSplashAd(String adUnitId, Promise promise) {
        Log.d(TAG, "loadSplashAd called with adUnitId: " + adUnitId);
        
        if (!isSDKInitialized || adNative == null) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "SDK not initialized");
            promise.resolve(result);
            return;
        }

        try {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                result.putString("message", "No current activity");
                promise.resolve(result);
                return;
            }

            // 创建开屏广告请求参数
            AdSlot adSlot = new AdSlot.Builder()
                    .setCodeId(adUnitId)
                    .setImageAcceptedSize(1080, 2400)
                    .build();

            // 加载开屏广告
            adNative.loadSplashAd(adSlot, new TTAdNative.CSJSplashAdListener() {
                @Override
                public void onSplashLoadSuccess(CSJSplashAd ad) {
                    Log.d(TAG, "Splash ad loaded successfully");
                    splashAd = ad;
                    
                    // 发送加载成功事件
                    sendEvent("onSplashAdLoaded", Arguments.createMap());
                    
                    WritableMap result = Arguments.createMap();
                    result.putBoolean("success", true);
                    result.putString("message", "Splash ad loaded");
                    promise.resolve(result);
                }

                @Override
                public void onSplashLoadFail(CSJAdError adError) {
                    Log.e(TAG, "Splash load fail: " + adError.getCode() + ", " + adError.getMsg());
                }

                // Removed deprecated onNoAd; using onSplashLoadFail instead

                @Override
                public void onSplashRenderFail(CSJSplashAd ad, CSJAdError adError) {
                    Log.e(TAG, "Splash render fail: " + adError.getCode() + ", " + adError.getMsg());
                    WritableMap errorData = Arguments.createMap();
                    errorData.putInt("code", adError.getCode());
                    errorData.putString("message", adError.getMsg());
                    sendEvent("onSplashAdRenderFail", errorData);
                }

                @Override
                public void onSplashRenderSuccess(CSJSplashAd ad) {
                    Log.d(TAG, "Splash render success; preparing to show");
                    splashAd = ad;

                    // 绑定交互监听
                    ad.setSplashAdListener(new CSJSplashAd.SplashAdListener() {
                        @Override
                        public void onSplashAdShow(CSJSplashAd splash) {
                            sendEvent("onSplashShow", Arguments.createMap());
                        }

                        @Override
                        public void onSplashAdClick(CSJSplashAd splash) {
                            sendEvent("onSplashClick", Arguments.createMap());
                        }

                        @Override
                        public void onSplashAdClose(CSJSplashAd splash, int closeType) {
                            WritableMap data = Arguments.createMap();
                            data.putInt("closeType", closeType);
                            sendEvent("onSplashClose", data);
                            // 也派发跳过事件，便于前端统一处理
                            WritableMap skip = Arguments.createMap();
                            skip.putInt("closeType", closeType);
                            sendEvent("onSplashAdSkip", skip);

                            // 清理容器
                            if (splashContainer != null) {
                                removeFromParent(splashContainer);
                                splashContainer = null;
                            }
                            splashAd = null;
                        }
                    });

                    // 展示到全屏容器
                    Activity activity = getCurrentActivity();
                    if (activity != null) {
                        mainHandler.post(() -> {
                            try {
                                ViewGroup root = activity.findViewById(android.R.id.content);
                                if (root != null) {
                                    if (splashContainer != null) {
                                        removeFromParent(splashContainer);
                                    }
                                    splashContainer = new FrameLayout(activity);
                                    FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(
                                            ViewGroup.LayoutParams.MATCH_PARENT,
                                            ViewGroup.LayoutParams.MATCH_PARENT
                                    );
                                    root.addView(splashContainer, lp);
                                    ad.showSplashView(splashContainer);
                                    splashContainer.bringToFront();
                                }
                            } catch (Exception e) {
                                Log.e(TAG, "Error showing splash", e);
                            }
                        });
                    }
                }
            }, 0);

            // 如需监听开屏广告事件，请根据所用SDK版本的接口签名添加监听器实现

        } catch (Exception e) {
            Log.e(TAG, "Exception during splash ad loading", e);
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "Exception: " + e.getMessage());
            promise.resolve(result);
        }
    }

    /**
     * 加载激励视频广告
     */
    @ReactMethod
    public void loadRewardVideoAd(String adUnitId, Promise promise) {
        Log.d(TAG, "loadRewardVideoAd called with adUnitId: " + adUnitId);
        
        if (!isSDKInitialized || adNative == null) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "SDK not initialized");
            promise.resolve(result);
            return;
        }

        try {
            // 创建激励视频广告请求参数
            AdSlot adSlot = new AdSlot.Builder()
                    .setCodeId(adUnitId)
                    .setOrientation(TTAdConstant.ORIENTATION_VERTICAL)
                    .build();

            // 加载激励视频广告
            adNative.loadRewardVideoAd(adSlot, new TTAdNative.RewardVideoAdListener() {
                @Override
                public void onError(int code, String message) {
                    Log.e(TAG, "Reward video ad load failed: " + code + ", " + message);
                    
                    WritableMap errorData = Arguments.createMap();
                    errorData.putInt("code", code);
                    errorData.putString("message", message);
                    sendEvent("onRewardVideoError", errorData);
                    
                    WritableMap result = Arguments.createMap();
                    result.putBoolean("success", false);
                    result.putString("message", message);
                    result.putInt("code", code);
                    promise.resolve(result);
                }

                @Override
                public void onRewardVideoAdLoad(TTRewardVideoAd ad) {
                    Log.d(TAG, "Reward video ad loaded successfully");
                    rewardVideoAd = ad;
                    
                    // 发送加载成功事件
                    sendEvent("onRewardVideoLoaded", Arguments.createMap());
                    
                    WritableMap result = Arguments.createMap();
                    result.putBoolean("success", true);
                    result.putString("message", "Reward video ad loaded");
                    promise.resolve(result);
                }

                @Override
                public void onRewardVideoCached() {
                    Log.d(TAG, "Reward video ad cached");
                }

                // For SDKs that pass the ad instance
                public void onRewardVideoCached(TTRewardVideoAd ad) {
                    Log.d(TAG, "Reward video ad cached (with ad instance)");
                }
            });

        } catch (Exception e) {
            Log.e(TAG, "Exception during reward video ad loading", e);
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "Exception: " + e.getMessage());
            promise.resolve(result);
        }
    }

    /**
     * 显示激励视频广告
     */
    @ReactMethod
    public void showRewardVideoAd(Promise promise) {
        Log.d(TAG, "showRewardVideoAd called");
        
        if (rewardVideoAd == null) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "No reward video ad loaded");
            promise.resolve(result);
            return;
        }

        try {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                result.putString("message", "No current activity");
                promise.resolve(result);
                return;
            }

            // 设置激励视频广告监听器
            rewardVideoAd.setRewardAdInteractionListener(new TTRewardVideoAd.RewardAdInteractionListener() {
                @Override
                public void onAdShow() {
                    Log.d(TAG, "Reward video ad shown");
                    sendEvent("onRewardVideoShow", Arguments.createMap());
                }

                @Override
                public void onAdVideoBarClick() {
                    Log.d(TAG, "Reward video ad clicked");
                    sendEvent("onRewardVideoClick", Arguments.createMap());
                }

                @Override
                public void onAdClose() {
                    Log.d(TAG, "Reward video ad closed");
                    sendEvent("onRewardVideoClose", Arguments.createMap());
                }

                @Override
                public void onVideoComplete() {
                    Log.d(TAG, "Reward video completed");
                    sendEvent("onRewardVideoComplete", Arguments.createMap());
                }

                @Override
                public void onVideoError() {
                    Log.e(TAG, "Reward video error");
                    sendEvent("onRewardVideoPlayError", Arguments.createMap());
                }

                @Override
                public void onRewardVerify(boolean rewardVerify, int rewardAmount, String rewardName, int errorCode, String errorMsg) {
                    Log.d(TAG, "Reward verify: " + rewardVerify + ", amount: " + rewardAmount + ", name: " + rewardName);
                    
                    WritableMap rewardData = Arguments.createMap();
                    rewardData.putBoolean("rewardVerify", rewardVerify);
                    rewardData.putInt("rewardAmount", rewardAmount);
                    rewardData.putString("rewardName", rewardName);
                    rewardData.putInt("errorCode", errorCode);
                    rewardData.putString("errorMsg", errorMsg);
                    sendEvent("onRewardVideoReward", rewardData);
                }

                @Override
                public void onSkippedVideo() {
                    Log.d(TAG, "Reward video skipped");
                    sendEvent("onRewardVideoSkipped", Arguments.createMap());
                }

                @Override
                public void onRewardArrived(boolean isRewardValid, int amount, Bundle extraInfo) {
                    Log.d(TAG, "Reward arrived: valid=" + isRewardValid + ", amount=" + amount);
                }
            });

            // 显示激励视频广告
            rewardVideoAd.showRewardVideoAd(currentActivity);
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "Reward video ad shown");
            promise.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "Exception during reward video ad showing", e);
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "Exception: " + e.getMessage());
            promise.resolve(result);
        }
    }

    /**
     * 加载全屏视频广告
     */
    @ReactMethod
    public void loadFullScreenVideoAd(String adUnitId, Promise promise) {
        Log.d(TAG, "loadFullScreenVideoAd called with adUnitId: " + adUnitId);
        
        if (!isSDKInitialized || adNative == null) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "SDK not initialized");
            promise.resolve(result);
            return;
        }

        try {
            // 创建全屏视频广告请求参数
            AdSlot adSlot = new AdSlot.Builder()
                    .setCodeId(adUnitId)
                    .setOrientation(TTAdConstant.ORIENTATION_VERTICAL)
                    .build();

            // 加载全屏视频广告
            adNative.loadFullScreenVideoAd(adSlot, new TTAdNative.FullScreenVideoAdListener() {
                @Override
                public void onError(int code, String message) {
                    Log.e(TAG, "Full screen video ad load failed: " + code + ", " + message);
                    
                    WritableMap result = Arguments.createMap();
                    result.putBoolean("success", false);
                    result.putString("message", message);
                    result.putInt("code", code);
                    promise.resolve(result);
                }

                @Override
                public void onFullScreenVideoAdLoad(TTFullScreenVideoAd ad) {
                    Log.d(TAG, "Full screen video ad loaded successfully");
                    fullScreenVideoAd = ad;
                    
                    WritableMap result = Arguments.createMap();
                    result.putBoolean("success", true);
                    result.putString("message", "Full screen video ad loaded");
                    promise.resolve(result);
                }

                @Override
                public void onFullScreenVideoCached() {
                    Log.d(TAG, "Full screen video ad cached");
                }

                // For SDKs that pass the ad instance
                public void onFullScreenVideoCached(TTFullScreenVideoAd ad) {
                    Log.d(TAG, "Full screen video ad cached (with ad instance)");
                }
            });

        } catch (Exception e) {
            Log.e(TAG, "Exception during full screen video ad loading", e);
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "Exception: " + e.getMessage());
            promise.resolve(result);
        }
    }

    /**
     * 显示全屏视频广告
     */
    @ReactMethod
    public void showFullScreenVideoAd(Promise promise) {
        Log.d(TAG, "showFullScreenVideoAd called");
        
        if (fullScreenVideoAd == null) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "No full screen video ad loaded");
            promise.resolve(result);
            return;
        }

        try {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                result.putString("message", "No current activity");
                promise.resolve(result);
                return;
            }

            // 设置全屏视频广告监听器
            fullScreenVideoAd.setFullScreenVideoAdInteractionListener(new TTFullScreenVideoAd.FullScreenVideoAdInteractionListener() {
                @Override
                public void onAdShow() {
                    Log.d(TAG, "Full screen video ad shown");
                    sendEvent("onFullScreenVideoShow", Arguments.createMap());
                }

                @Override
                public void onAdVideoBarClick() {
                    Log.d(TAG, "Full screen video ad clicked");
                    sendEvent("onFullScreenVideoClick", Arguments.createMap());
                }

                @Override
                public void onAdClose() {
                    Log.d(TAG, "Full screen video ad closed");
                    sendEvent("onFullScreenVideoClose", Arguments.createMap());
                }

                @Override
                public void onVideoComplete() {
                    Log.d(TAG, "Full screen video completed");
                    sendEvent("onFullScreenVideoComplete", Arguments.createMap());
                }

                @Override
                public void onSkippedVideo() {
                    Log.d(TAG, "Full screen video skipped");
                    sendEvent("onFullScreenVideoSkipped", Arguments.createMap());
                }
            });

            // 显示全屏视频广告
            fullScreenVideoAd.showFullScreenVideoAd(currentActivity);
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "Full screen video ad shown");
            promise.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "Exception during full screen video ad showing", e);
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "Exception: " + e.getMessage());
            promise.resolve(result);
        }
    }

    /**
     * 通用加载广告方法
     */
    @ReactMethod
    public void loadAd(String adType, String adUnitId, Promise promise) {
        Log.d(TAG, "loadAd called with adType: " + adType + ", adUnitId: " + adUnitId);
        
        switch (adType.toLowerCase()) {
            case "rewardvideo":
                loadRewardVideoAd(adUnitId, promise);
                break;
            case "fullscreenvideo":
                loadFullScreenVideoAd(adUnitId, promise);
                break;
            default:
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                result.putString("message", "Unsupported ad type: " + adType);
                promise.resolve(result);
                break;
        }
    }

    /**
     * 通用显示广告方法
     */
    @ReactMethod
    public void showAd(String adType, String adUnitId, Promise promise) {
        Log.d(TAG, "showAd called with adType: " + adType + ", adUnitId: " + adUnitId);
        
        switch (adType.toLowerCase()) {
            case "rewardvideo":
                showRewardVideoAd(promise);
                break;
            case "fullscreenvideo":
                showFullScreenVideoAd(promise);
                break;
            default:
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                result.putString("message", "Unsupported ad type: " + adType);
                promise.resolve(result);
                break;
        }
    }

    /**
     * 检查广告是否已加载
     */
    @ReactMethod
    public void isAdLoaded(String adType, String adUnitId, Promise promise) {
        Log.d(TAG, "isAdLoaded called with adType: " + adType + ", adUnitId: " + adUnitId);
        
        WritableMap result = Arguments.createMap();
        
        switch (adType.toLowerCase()) {
            case "splash":
                result.putBoolean("isLoaded", splashAd != null);
                break;
            case "rewardvideo":
                result.putBoolean("isLoaded", rewardVideoAd != null);
                break;
            case "fullscreenvideo":
                result.putBoolean("isLoaded", fullScreenVideoAd != null);
                break;
            default:
                result.putBoolean("isLoaded", false);
                result.putString("message", "Unsupported ad type: " + adType);
                break;
        }
        
        promise.resolve(result);
    }

    /**
     * 获取SDK版本
     */
    @ReactMethod
    public void getSDKVersion(Promise promise) {
        try {
            String version = TTAdSdk.getAdManager().getSDKVersion();
            promise.resolve(version);
        } catch (Exception e) {
            Log.e(TAG, "Exception getting SDK version", e);
            promise.reject("VERSION_ERROR", e.getMessage());
        }
    }

    /**
     * 关闭开屏广告
     */
    @ReactMethod
    public void closeSplashAd(Promise promise) {
        Log.d(TAG, "closeSplashAd called");
        
        try {
            if (splashAd != null) {
                splashAd = null;
                sendEvent("onSplashAdClose", Arguments.createMap());
            }
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "Splash ad closed");
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Exception closing splash ad", e);
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("message", "Exception: " + e.getMessage());
            promise.resolve(result);
        }
    }

    /**
     * 强制关闭开屏广告
     */
    @ReactMethod
    public void forceCloseSplashAd(Promise promise) {
        Log.d(TAG, "forceCloseSplashAd called");
        closeSplashAd(promise);
    }

    /**
     * 通用关闭广告方法
     */
    @ReactMethod
    public void closeAd(String adType, Promise promise) {
        Log.d(TAG, "closeAd called with adType: " + adType);
        
        switch (adType.toLowerCase()) {
            case "splash":
                closeSplashAd(promise);
                break;
            default:
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                result.putString("message", "Unsupported ad type for close: " + adType);
                promise.resolve(result);
                break;
        }
    }

    /**
     * 发送事件到JavaScript
     */
    private void sendEvent(String eventName, WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    /**
     * 从父容器中安全移除视图
     */
    private void removeFromParent(View view) {
        if (view == null) {
            return;
        }
        ViewParent parent = view.getParent();
        if (parent instanceof ViewGroup) {
            ((ViewGroup) parent).removeView(view);
        }
    }
}
