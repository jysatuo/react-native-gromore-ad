import { useEffect } from 'react';
import { AdManager, AdType } from '../services/AdManager';

interface GromoreInterstitialAdProps {
  adUnitId: string;
  onAdLoaded: () => void;
  onAdClosed: () => void;
  onAdError: (error: string) => void;
}

export const useGromoreInterstitialAd = (props: GromoreInterstitialAdProps) => {
  useEffect(() => {
    const loadAd = async () => {
      // 这里需要传入配置，暂时使用空配置
      const adManager = AdManager.getInstance({ appId: '' });
      const success = await adManager.loadAd(AdType.INTERSTITIAL, props.adUnitId);
      if (success) {
        props.onAdLoaded();
      } else {
        props.onAdError('Failed to load interstitial ad');
      }
    };
    loadAd();
  }, [props.adUnitId]);

  const showAd = async () => {
    const adManager = AdManager.getInstance({ appId: '' });
    const success = await adManager.showAd(AdType.INTERSTITIAL, props.adUnitId);
    if (!success) {
      props.onAdError('Failed to show interstitial ad');
    }
  };

  return { showAd };
};
