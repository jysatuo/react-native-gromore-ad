// 简单的插件测试脚本
const { GromoreAdPlugin } = require('./lib/GromoreAdPlugin');

async function testPlugin() {
  console.log('🚀 开始测试GroMore广告插件...');
  
  try {
    // 创建插件实例
    const adPlugin = new GromoreAdPlugin({
      appId: '5740367',
      testMode: true,
      safePlaceholderMode: true,
      adUnitIds: {
        splash: '103664273',
        rewardVideo: '103673847',
      }
    });

    console.log('✅ 插件实例创建成功');

    // 测试配置
    const config = adPlugin.configuration;
    console.log('📋 插件配置:', {
      appId: config.appId,
      testMode: config.testMode,
      safePlaceholderMode: config.safePlaceholderMode
    });

    // 测试初始化
    console.log('⏳ 开始初始化插件...');
    const initialized = await adPlugin.initialize();
    console.log('📊 初始化结果:', initialized ? '成功' : '失败');

    if (initialized) {
      // 测试状态检查
      console.log('📊 插件状态:', {
        isInitialized: adPlugin.isInitialized,
        isAdShowing: adPlugin.isAdShowing
      });

      // 测试广告状态
      const adState = adPlugin.adState;
      console.log('📊 广告状态:', {
        isAdLoaded: adState.isAdLoaded,
        isAdShowing: adState.isAdShowing,
        adLoadError: adState.adLoadError,
        skipCountdown: adState.skipCountdown
      });

      console.log('✅ 插件测试完成，所有基本功能正常');
    } else {
      console.log('❌ 插件初始化失败');
    }

  } catch (error) {
    console.error('❌ 插件测试异常:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testPlugin();
}

module.exports = { testPlugin };
