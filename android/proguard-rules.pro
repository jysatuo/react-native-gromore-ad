# GroMore SDK ProGuard rules
-keep class com.bytedance.sdk.openadsdk.** { *; }
-keep class com.bytedance.sdk.mediation.** { *; }
-dontwarn com.bytedance.sdk.openadsdk.**
-dontwarn com.bytedance.sdk.mediation.**

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**

# Keep our module
-keep class com.skylantern.gromoread.** { *; }
