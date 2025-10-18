'use strict';

const { NativeModules, NativeEventEmitter, Platform } = require('react-native');

const { GroMoreModule } = NativeModules;

if (!GroMoreModule) {
  throw new Error('@skylantern/gromore-ad: Native module not found. Make sure Android is linked and built.');
}

const emitter = new NativeEventEmitter(GroMoreModule);
let listenerCount = 0;

function on(event, listener) {
  listenerCount += 1;
  const sub = emitter.addListener(event, listener);
  const originalRemove = sub.remove;
  sub.remove = () => {
    if (originalRemove) originalRemove.call(sub);
    listenerCount = Math.max(0, listenerCount - 1);
  };
  return sub;
}

// Provide no-op removeListeners hook to satisfy RN dev warning when module is passed to NativeEventEmitter
if (typeof GroMoreModule.removeListeners !== 'function') {
  GroMoreModule.removeListeners = function removeListeners(n) {
    // Best-effort: adjust internal count
    listenerCount = Math.max(0, listenerCount - (Number(n) || 0));
  };
}

async function init(appId) {
  return await GroMoreModule.init(appId);
}

async function getSDKVersion() {
  return await GroMoreModule.getSDKVersion();
}

async function loadSplashAd(adUnitId) {
  return await GroMoreModule.loadSplashAd(adUnitId);
}

async function closeSplashAd() {
  return await GroMoreModule.closeSplashAd();
}

async function forceCloseSplashAd() {
  return await GroMoreModule.forceCloseSplashAd();
}

async function loadRewardVideoAd(adUnitId) {
  return await GroMoreModule.loadRewardVideoAd(adUnitId);
}

async function showRewardVideoAd() {
  return await GroMoreModule.showRewardVideoAd();
}

async function loadFullScreenVideoAd(adUnitId) {
  return await GroMoreModule.loadFullScreenVideoAd(adUnitId);
}

async function showFullScreenVideoAd() {
  return await GroMoreModule.showFullScreenVideoAd();
}

async function loadAd(adType, adUnitId) {
  return await GroMoreModule.loadAd(adType, adUnitId);
}

async function showAd(adType, adUnitId) {
  return await GroMoreModule.showAd(adType, adUnitId);
}

async function isAdLoaded(adType, adUnitId) {
  return await GroMoreModule.isAdLoaded(adType, adUnitId);
}

module.exports = {
  on,
  init,
  getSDKVersion,
  loadSplashAd,
  closeSplashAd,
  forceCloseSplashAd,
  loadRewardVideoAd,
  showRewardVideoAd,
  loadFullScreenVideoAd,
  showFullScreenVideoAd,
  loadAd,
  showAd,
  isAdLoaded,
};


