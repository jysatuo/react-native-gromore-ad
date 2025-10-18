const { withDangerousMod, withAndroidManifest, withAppBuildGradle, withProjectBuildGradle, withGradleProperties, withMainApplication } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * @param {import('@expo/config-types').ExpoConfig} config
 * @param {{ appIdAndroid?: string; testMode?: boolean; safePlaceholderMode?: boolean; adUnitIds?: Record<string,string>; }} [props]
 */
function withGromoreAd(config, props = {}) {
  // Copy AAR files to android/app/libs
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const pluginRoot = path.join(projectRoot, 'plugins', 'gromore-ad');
      const targetLibsDir = path.join(projectRoot, 'android', 'app', 'libs');
      
      // Ensure target directory exists
      if (!fs.existsSync(targetLibsDir)) {
        fs.mkdirSync(targetLibsDir, { recursive: true });
      }
      
      // Copy all AAR files from plugin to app libs
      const sourceLibsDir = path.join(pluginRoot, 'android', 'libs');
      if (fs.existsSync(sourceLibsDir)) {
        const copyRecursive = (src, dest) => {
          if (fs.statSync(src).isDirectory()) {
            if (!fs.existsSync(dest)) {
              fs.mkdirSync(dest, { recursive: true });
            }
            fs.readdirSync(src).forEach(file => {
              copyRecursive(path.join(src, file), path.join(dest, file));
            });
          } else if (src.endsWith('.aar')) {
            fs.copyFileSync(src, dest);
            console.log(`Copied AAR: ${path.basename(src)}`);
          }
        };
        
        copyRecursive(sourceLibsDir, targetLibsDir);
      }
      
      return config;
    },
  ]);

  // Add GroMore permissions to AndroidManifest
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    
    // Ensure permissions exist
    const permissions = [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_WIFI_STATE',
      'android.permission.CHANGE_WIFI_STATE',
      'android.permission.READ_PHONE_STATE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.REQUEST_INSTALL_PACKAGES'
    ];
    
    permissions.forEach(permission => {
      if (!androidManifest.manifest['uses-permission']?.find(p => p.$['android:name'] === permission)) {
        if (!androidManifest.manifest['uses-permission']) {
          androidManifest.manifest['uses-permission'] = [];
        }
        androidManifest.manifest['uses-permission'].push({
          $: { 'android:name': permission }
        });
      }
    });
    
    // Add GroMore application configuration
    if (!androidManifest.manifest.application) {
      androidManifest.manifest.application = [{}];
    }
    
    const application = androidManifest.manifest.application[0];
    
    // Add GroMore App ID meta-data
    if (props.appIdAndroid) {
      if (!application['meta-data']) {
        application['meta-data'] = [];
      }
      
      const existingAppId = application['meta-data'].find(m => m.$['android:name'] === 'com.bytedance.sdk.openadsdk.TTAppId');
      if (!existingAppId) {
        application['meta-data'].push({
          $: {
            'android:name': 'com.bytedance.sdk.openadsdk.TTAppId',
            'android:value': props.appIdAndroid
          }
        });
      }
    }
    
    return config;
  });

  // Configure app/build.gradle to include AAR dependencies
  config = withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    // Add repositories if not exists
    if (!buildGradle.includes('flatDir')) {
      const repositoriesMatch = buildGradle.match(/repositories\s*\{([^}]*)\}/);
      if (repositoriesMatch) {
        const newRepositories = repositoriesMatch[0].replace(
          '}',
          `\n        flatDir {\n            dirs 'libs'\n        }\n    }`
        );
        buildGradle = buildGradle.replace(repositoriesMatch[0], newRepositories);
      }
    }
    
    // Add dependencies for GroMore AARs
    const dependenciesSection = buildGradle.match(/dependencies\s*\{([^}]*)\}/);
    if (dependenciesSection) {
      const dependenciesContent = dependenciesSection[1];
      
      // Add fileTree for libs directory if not exists
      if (!dependenciesContent.includes("fileTree(dir: 'libs'")) {
        const newDependencies = dependenciesSection[0].replace(
          '}',
          `\n    implementation fileTree(dir: 'libs', include: ['*.aar'])\n    implementation fileTree(dir: 'libs/adapter', include: ['*.aar'])\n    implementation fileTree(dir: 'libs/adn', include: ['*.aar'])\n}`
        );
        buildGradle = buildGradle.replace(dependenciesSection[0], newDependencies);
      }
    }
    
    config.modResults.contents = buildGradle;
    return config;
  });

  // Register native module in MainApplication (for Kotlin)
  config = withMainApplication(config, (config) => {
    const mainApplication = config.modResults.contents;
    
    // For Kotlin MainApplication, add to packages list
    if (mainApplication.includes('PackageList(this).packages.apply')) {
      if (!mainApplication.includes('add(com.skylantern.gromoread.GroMorePackage())')) {
        const packagesMatch = mainApplication.match(/PackageList\(this\)\.packages\.apply\s*\{([^}]*)\}/);
        if (packagesMatch) {
          const packagesContent = packagesMatch[1];
          const newPackages = packagesContent.trim() + 
            (packagesContent.trim() ? '\n              add(com.skylantern.gromoread.GroMorePackage())' : 'add(com.skylantern.gromoread.GroMorePackage())');
          config.modResults.contents = config.modResults.contents.replace(packagesMatch[0], 
            `PackageList(this).packages.apply {\n              ${newPackages}\n            }`);
        }
      }
    }
    
    return config;
  });

  // Add ProGuard rules
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const proguardRulesPath = path.join(projectRoot, 'android', 'app', 'proguard-rules.pro');
      
      const proguardRules = `
# GroMore Ad SDK ProGuard Rules
-keep class com.bytedance.sdk.openadsdk.** { *; }
-keep class com.bytedance.sdk.openadsdk.adapter.** { *; }
-keep class com.bytedance.sdk.openadsdk.component.** { *; }
-keep class com.bytedance.sdk.openadsdk.core.** { *; }
-keep class com.bytedance.sdk.openadsdk.downloadnew.** { *; }
-keep class com.bytedance.sdk.openadsdk.mediation.** { *; }
-keep class com.bytedance.sdk.openadsdk.multipro.** { *; }
-keep class com.bytedance.sdk.openadsdk.personalize.** { *; }
-keep class com.bytedance.sdk.openadsdk.utils.** { *; }

# GDT Adapter
-keep class com.qq.e.** { *; }
-keep class com.tencent.** { *; }

# Baidu Adapter  
-keep class com.baidu.mobads.** { *; }

# Mintegral Adapter
-keep class com.mbridge.** { *; }

# Unity Ads Adapter
-keep class com.unity3d.ads.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
`;
      
      // Append to existing proguard rules
      if (fs.existsSync(proguardRulesPath)) {
        const existingRules = fs.readFileSync(proguardRulesPath, 'utf8');
        if (!existingRules.includes('GroMore Ad SDK ProGuard Rules')) {
          fs.appendFileSync(proguardRulesPath, proguardRules);
        }
      } else {
        fs.writeFileSync(proguardRulesPath, proguardRules);
      }
      
      return config;
    },
  ]);

  return config;
}

module.exports = withGromoreAd;
module.exports.name = 'withGromoreAd';
