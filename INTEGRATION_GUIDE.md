# GroMore广告插件集成指南

## 概述

这个插件包含了完整的GroMore广告功能，包括JavaScript层和Android原生模块。插件已经将原有的广告模块重构为独立的、可复用的形式。

## 插件结构

```
plugins/gromore-ad/
├── src/                    # JavaScript源代码
│   ├── types/             # TypeScript类型定义
│   ├── config/            # 配置管理
│   ├── services/          # 核心服务
│   ├── state/             # 状态管理
│   ├── components/        # React组件
│   ├── GromoreAdPlugin.ts # 主插件类
│   └── index.ts           # 入口文件
├── android/               # Android原生模块
│   ├── src/main/java/com/skylantern/gromoread/
│   │   ├── GroMoreModule.java    # 原生模块实现
│   │   └── GroMorePackage.java   # React Native包
│   ├── build.gradle       # Android构建配置
│   ├── proguard-rules.pro # 混淆规则
│   └── src/main/AndroidManifest.xml # 权限配置
├── package.json           # 插件配置
├── tsconfig.json          # TypeScript配置
└── README.md             # 插件文档
```

## 集成步骤

### 1. 复制插件到项目

将整个 `plugins/gromore-ad/` 目录复制到你的项目中。

### 2. 安装依赖

在项目根目录运行：

```bash
npm install
```

### 3. Android集成

#### 3.1 添加插件到Android项目

在 `android/settings.gradle` 中添加：

```gradle
include ':gromore-ad-plugin'
project(':gromore-ad-plugin').projectDir = new File(rootProject.projectDir, '../plugins/gromore-ad/android')
```

#### 3.2 添加依赖

在 `android/app/build.gradle` 中添加：

```gradle
dependencies {
    implementation project(':gromore-ad-plugin')
    
    // GroMore SDK dependencies (如果还没有的话)
    implementation 'com.bytedance.sdk:openadsdk:5.6.1.1'
    implementation 'com.bytedance.sdk:mediation_ad:5.6.1.1'
}
```

#### 3.3 注册原生模块

在 `android/app/src/main/java/com/yourpackage/MainApplication.kt` 中：

```kotlin
import com.skylantern.gromoread.GroMorePackage

class MainApplication : Application(), ReactApplication {
    override fun getPackages(): List<ReactPackage> {
        return PackageList(this).packages.apply {
            add(GroMorePackage()) // 添加GroMore包
        }
    }
}
```

#### 3.4 添加权限

在 `android/app/src/main/AndroidManifest.xml` 中确保有以下权限：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.DOWNLOAD_WITHOUT_NOTIFICATION" />
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
```

### 4. JavaScript集成

#### 4.1 导入插件

```typescript
import { GromoreAdPlugin } from '../plugins/gromore-ad/src/GromoreAdPlugin';
```

#### 4.2 创建插件实例

```typescript
const adPlugin = new GromoreAdPlugin({
  appId: 'your-app-id',
  testMode: true,
  safePlaceholderMode: true, // 开发时使用占位模式
  adUnitIds: {
    splash: 'your-splash-ad-unit-id',
    rewardVideo: 'your-reward-video-ad-unit-id',
  }
});
```

#### 4.3 初始化和使用

```typescript
// 初始化插件
await adPlugin.initialize();

// 显示开屏广告
await adPlugin.showSplashAd();

// 显示激励视频广告
const reward = await adPlugin.showRewardVideoAd();
```

## 从现有项目迁移

如果你已经有现有的广告模块，可以按以下步骤迁移：

### 1. 备份现有代码

```bash
cp -r ads/ ads_backup/
```

### 2. 替换导入路径

将所有文件中的导入路径从：
```typescript
import { adManager } from '../../ads/services/AdManager';
```

改为：
```typescript
import { GromoreAdPlugin } from '../plugins/gromore-ad/src/GromoreAdPlugin';
```

### 3. 更新使用方式

将原有的直接调用：
```typescript
await adManager.initialize();
await adManager.loadAndShowSplashAd();
```

改为插件方式：
```typescript
const adPlugin = new GromoreAdPlugin(config);
await adPlugin.initialize();
await adPlugin.showSplashAd();
```

### 4. 更新原生模块注册

将 `MainApplication.kt` 中的：
```kotlin
import com.jysatuo.SkyLanternWishes.GroMorePackage
```

改为：
```kotlin
import com.skylantern.gromoread.GroMorePackage
```

## 测试

### 1. 在设置页面测试

插件已经在设置页面添加了测试功能，可以：
- 查看原生模块状态
- 测试开屏广告
- 测试激励视频广告
- 查看插件状态

### 2. 代码测试

```typescript
// 测试插件基本功能
const testPlugin = async () => {
  const { GromoreAdPlugin } = await import('../plugins/gromore-ad/src/GromoreAdPlugin');
  
  const adPlugin = new GromoreAdPlugin({
    appId: '5740367',
    testMode: true,
    safePlaceholderMode: true,
  });
  
  await adPlugin.initialize();
  await adPlugin.showSplashAd();
};
```

## 配置选项

```typescript
interface PluginConfig {
  appId: string;                    // 必填：GroMore应用ID
  testMode?: boolean;               // 可选：是否启用测试模式
  safePlaceholderMode?: boolean;    // 可选：是否使用安全占位模式
  adUnitIds?: {                    // 可选：广告位ID配置
    splash?: string;
    rewardVideo?: string;
    fullScreenVideo?: string;
    banner?: string;
    interstitial?: string;
  };
  frequency?: {                    // 可选：频率控制
    splash?: {
      minInterval: number;         // 最小间隔（小时）
      maxPerDay: number;           // 每天最大次数
    };
    rewardVideo?: {
      minInterval: number;
      maxPerDay: number;
    };
  };
  timeout?: {                      // 可选：超时配置
    splash?: number;
    rewardVideo?: number;
    fullScreenVideo?: number;
    banner?: number;
    interstitial?: number;
  };
}
```

## 故障排除

### 常见问题

1. **原生模块找不到**
   - 检查 `MainApplication.kt` 中是否正确注册了 `GroMorePackage`
   - 确认 `android/settings.gradle` 中是否添加了插件路径
   - 重新编译Android项目

2. **权限问题**
   - 检查 `AndroidManifest.xml` 中是否添加了所有必需权限
   - 确认权限声明在正确的位置

3. **SDK初始化失败**
   - 检查App ID是否正确
   - 确认网络连接正常
   - 查看控制台日志获取详细错误信息

4. **广告不显示**
   - 检查广告位ID配置
   - 确认SDK是否初始化成功
   - 使用测试模式验证功能

### 调试方法

1. 查看控制台日志
2. 使用设置页面的测试功能
3. 检查原生模块状态
4. 验证配置参数

## 注意事项

1. **原生模块依赖**：插件依赖GroMore SDK，确保正确集成
2. **权限配置**：必须添加所有必需的Android权限
3. **测试模式**：开发时建议启用测试模式和占位模式
4. **错误处理**：插件提供了完善的错误处理，注意监听错误事件
5. **性能优化**：合理配置广告频率，避免影响用户体验

## 支持

如果遇到问题，请：
1. 查看控制台日志
2. 检查配置是否正确
3. 使用测试功能验证
4. 参考故障排除部分
