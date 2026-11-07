import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdService {
  // Real AdMob IDs from user console
  static const String appId = 'ca-app-pub-3839531386767343~2207859262';
  static const String bannerUnitId = 'ca-app-pub-3839531386767343/3554544613';
  static const String rewardedInterstitialUnitId = 'ca-app-pub-3839531386767343/2049891258';

  static RewardedInterstitialAd? _rewardedInterstitialAd;
  static bool _isLoadingRewarded = false;

  static Future<void> initialize() async {
    try {
      await MobileAds.instance.initialize();
      loadRewardedInterstitial();
    } catch (e) {
      debugPrint('AdMob Init Error: $e');
    }
  }

  static void loadRewardedInterstitial() {
    if (_isLoadingRewarded || _rewardedInterstitialAd != null) return;
    _isLoadingRewarded = true;

    RewardedInterstitialAd.load(
      adUnitId: rewardedInterstitialUnitId,
      request: const AdRequest(),
      rewardedInterstitialAdLoadCallback: RewardedInterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _rewardedInterstitialAd = ad;
          _isLoadingRewarded = false;
        },
        onAdFailedToLoad: (error) {
          debugPrint('Rewarded Interstitial failed to load: $error');
          _rewardedInterstitialAd = null;
          _isLoadingRewarded = false;
        },
      ),
    );
  }

  static void showRewardedInterstitial({required VoidCallback onProceed}) {
    if (_rewardedInterstitialAd != null) {
      _rewardedInterstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
        onAdDismissedFullScreenContent: (ad) {
          ad.dispose();
          _rewardedInterstitialAd = null;
          loadRewardedInterstitial();
          onProceed();
        },
        onAdFailedToShowFullScreenContent: (ad, err) {
          ad.dispose();
          _rewardedInterstitialAd = null;
          loadRewardedInterstitial();
          onProceed();
        },
      );

      _rewardedInterstitialAd!.show(
        onUserEarnedReward: (adWithoutView, reward) {
          // Reward earned callback
        },
      );
    } else {
      // If ad is not ready, don't block user from downloading
      loadRewardedInterstitial();
      onProceed();
    }
  }

  static BannerAd createBannerAd({required Function() onAdLoaded}) {
    return BannerAd(
      adUnitId: bannerUnitId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (ad) => onAdLoaded(),
        onAdFailedToLoad: (ad, error) {
          debugPrint('BannerAd error: $error');
          ad.dispose();
        },
      ),
    );
  }
}
