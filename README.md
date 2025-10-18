# GroMore广告插件

一个功能完整的React Native GroMore广告插件，支持多种广告类型和高级功能。插件包含完整的JavaScript层和Android原生模块。

## GroMore版本号

open_ad_sdk_7.1.3.2

## 功能特性

- 🚀 **开屏广告** - 应用启动时的全屏广告
- 🎬 **激励视频广告** - 用户观看完整视频获得奖励
- 📺 **全屏视频广告** - 沉浸式视频广告体验
- 🎯 **横幅广告** - 页面底部的横幅广告
- 📱 **插屏广告** - 页面切换时的插屏广告
- 🔧 **完整原生集成** - 包含Android原生模块
- 🛡️ **安全模式** - 支持测试和占位模式
- 📊 **状态管理** - 完整的状态管理和事件系统

## 插件结构

```
plugins/gromore-ad/
├── src/                    # JavaScript源代码
├── android/               # Android原生模块
├── package.json           # 插件配置
└── README.md             # 文档
```

## 安装


```bash
npm install @skylantern/gromore-ad
```

## 快速开始

### 1. 初始化插件

```typescript
// 两种导入方式均可：
// 方式A：默认导入
import GromoreAdPlugin from '@skylantern/gromore-ad';
// 方式B：具名导入
// import { GromoreAdPlugin } from '@skylantern/gromore-ad';

// 初始化插件（建议在应用启动阶段调用）
const adPlugin = new GromoreAdPlugin({
  appId: 'your-app-id',
  testMode: __DEV__,
  adUnitIds: {
    splash: 'your-splash-id',
    rewardVideo: 'your-reward-id',
    fullScreenVideo: 'your-fullscreen-id',
  },
});

// 初始化SDK
await adPlugin.initialize();

// 监听常用事件（可选）
adPlugin.addEventListener('splashAdLoaded', () => console.log('开屏已加载'));
adPlugin.addEventListener('rewardVideoReward', (reward) => console.log('奖励', reward));
```

### 2. 显示开屏广告

```typescript
// 显示开屏广告
const success = await adPlugin.showSplashAd();
if (success) {
  console.log('开屏广告显示成功');
}
```

### 3. 显示激励视频广告

```typescript
// 显示激励视频广告
const reward = await adPlugin.showRewardVideoAd();
if (reward) {
  console.log('获得奖励:', reward);
}
```

### 4. 显示全屏视频广告

```typescript
const ok = await adPlugin.showFullScreenVideoAd();
if (ok) {
  console.log('全屏视频已展示');
}
```

<<<<<<< HEAD
### 5. 显示横幅/插屏（开发中）
=======
### 5. 显示横幅/插屏（暂未加入）
>>>>>>> f25bd0819cf49eabc38c4417b95290fb96bcca70

```typescript
// 横幅（需要在页面中放置对应的 React 组件）
// import { GromoreBannerAd } from '@skylantern/gromore-ad';

// 插屏
// const ok = await adPlugin.showInterstitialAd();
```

## 配置选项

```typescript
interface PluginConfig {
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
}
```

## API文档

### 核心方法

- `initialize()` - 初始化广告SDK
- `showSplashAd()` - 显示开屏广告
- `showRewardVideoAd()` - 显示激励视频广告
- `showFullScreenVideoAd()` - 显示全屏视频广告
- `loadBannerAd(adUnitId)` - 加载横幅广告
- `showInterstitialAd()` - 显示插屏广告

### 状态管理

- `isInitialized` - SDK是否已初始化
- `isAdShowing` - 是否有广告正在显示
- `adState` - 广告状态信息

### 事件监听

```typescript
// 监听广告事件
adPlugin.addEventListener('splashAdLoaded', () => {
  console.log('开屏广告加载完成');
});

adPlugin.addEventListener('rewardVideoReward', (reward) => {
  console.log('获得奖励:', reward);
});
```

## 原生集成

插件已经包含了完整的Android原生模块，无需额外配置。

### Android集成

插件包含：
- `GroMoreModule.java` - 原生模块实现
- `GroMorePackage.java` - React Native包
- `build.gradle` - 构建配置
- `AndroidManifest.xml` - 权限配置

集成步骤：
1. 将插件添加到Android项目
2. 在 `MainApplication.kt` 中注册包
3. 添加必要的权限

详细集成指南请参考 [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

### iOS支持

iOS支持正在开发中，目前仅支持Android平台。

## 测试模式

插件支持测试模式，可以在开发阶段安全测试广告功能：

```typescript
const adPlugin = new GromoreAdPlugin({
  appId: 'your-app-id',
  testMode: true,
  safePlaceholderMode: true, // 使用占位模式，不调用原生SDK
});
```

## 许可证

MIT License


## 支持作者 / 打赏

如果这个插件/文档对你有帮助，欢迎打赏支持我继续维护与改进：

**支付宝**

<div align="left">
<<<<<<< HEAD

<img src="https://github.com/user-attachments/assets/033e94d4-a775-4bd3-b98a-637beaaae554" alt="支付宝收款码" width="300" />

=======
<img width="300" alt="wxpay" src="https://github.com/user-attachments/assets/033e94d4-a775-4bd3-b98a-637beaaae554" />
>>>>>>> f25bd0819cf49eabc38c4417b95290fb96bcca70
</div>

**微信支付**

<div align="left">
<<<<<<< HEAD

<img src="https://github.com/user-attachments/assets/8e8a14f3-2cb6-4738-a906-f96792bc2a91" alt="微信收款码" width="300" />

=======
<img width="300" alt="wxpay" src="https://github.com/user-attachments/assets/8e8a14f3-2cb6-4738-a906-f96792bc2a91" />
>>>>>>> f25bd0819cf49eabc38c4417b95290fb96bcca70
</div>

非常感谢你的支持！🙏 也可添加微信联系：`Jysatuo1314`（说明来意）。
