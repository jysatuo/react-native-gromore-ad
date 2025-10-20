# GroMore广告插件使用说明

## 插件概述

这是一个完整的GroMore广告插件，将原有的广告模块重构为独立的插件形式，提供了更好的模块化和可维护性。

## 插件结构

```
plugins/gromore-ad/
├── src/
│   ├── types/           # 类型定义
│   ├── config/          # 配置管理
│   ├── services/        # 核心服务
│   ├── state/           # 状态管理
│   ├── components/      # React组件
│   ├── GromoreAdPlugin.ts  # 主插件类
│   └── index.ts         # 入口文件
├── package.json         # 插件配置
├── tsconfig.json        # TypeScript配置
├── README.md           # 插件文档
└── USAGE.md           # 使用说明
```

## 在项目中使用插件

### 1. 基本使用

```typescript
import { GromoreAdPlugin } from '../plugins/gromore-ad/src/GromoreAdPlugin';

// 创建插件实例
const adPlugin = new GromoreAdPlugin({
  appId: 'your-app-id',
  testMode: true,
  safePlaceholderMode: true, // 开发时使用占位模式
  adUnitIds: {
    splash: 'your-splash-ad-unit-id',
    rewardVideo: 'your-reward-video-ad-unit-id',
  }
});

// 初始化插件
await adPlugin.initialize();

// 显示开屏广告
await adPlugin.showSplashAd();

// 显示激励视频广告
const reward = await adPlugin.showRewardVideoAd();
```

### 2. 在设置页面测试

已经在设置页面添加了"GroMore插件测试"选项，可以：

- 查看原生模块状态
- 测试开屏广告功能
- 测试激励视频广告功能
- 查看插件状态信息

### 3. 事件监听

```typescript
// 监听插件事件
adPlugin.addEventListener('initialized', (data) => {
  console.log('插件初始化完成:', data);
});

adPlugin.addEventListener('splashAdShown', (data) => {
  console.log('开屏广告显示:', data);
});

adPlugin.addEventListener('rewardVideoReward', (reward) => {
  console.log('获得奖励:', reward);
});
```

## 插件特性

### 1. 模块化设计
- 清晰的目录结构
- 独立的类型定义
- 分离的配置管理
- 独立的状态管理

### 2. 安全模式
- 支持测试模式
- 占位模式避免原生崩溃
- 完善的错误处理

### 3. 事件系统
- 完整的事件监听机制
- 支持多种广告事件
- 灵活的事件处理

### 4. 状态管理
- 使用Zustand进行状态管理
- 持久化广告显示记录
- 频率控制机制

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

## 测试方法

### 1. 在设置页面测试
1. 打开应用
2. 进入设置页面
3. 点击"GroMore插件测试"
4. 选择要测试的功能

### 2. 代码测试
```typescript
// 在组件中测试
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

## 注意事项

1. **原生模块依赖**：插件依赖原生GroMore模块，确保原生代码正确集成
2. **权限配置**：确保Android和iOS的权限配置正确
3. **测试模式**：开发时建议启用测试模式和占位模式
4. **错误处理**：插件提供了完善的错误处理，注意监听错误事件

## 迁移指南

从原有广告模块迁移到插件：

1. 替换导入路径
2. 使用新的插件API
3. 更新配置方式
4. 测试功能是否正常

## 故障排除

### 常见问题

1. **插件初始化失败**
   - 检查appId配置
   - 确认原生模块是否正确集成
   - 查看控制台错误信息

2. **广告不显示**
   - 检查广告位ID配置
   - 确认网络连接
   - 查看广告状态信息

3. **原生模块不存在**
   - 检查原生代码集成
   - 确认模块注册
   - 重新编译原生代码

### 调试方法

1. 使用设置页面的测试功能
2. 查看控制台日志
3. 检查插件状态信息
4. 使用原生诊断功能
