import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdService {
  // Real AdMob IDs from user console
  static const String appId = 'ca-app-pub-3839531386767343~2207859262';
  static const String realBannerId = 'ca-app-pub-3839531386767343/3554544613';
  static const String realRewardedId = 'ca-app-pub-3839531386767343/2049891258';

  // Official Google Test IDs (guaranteed to always show test ads 100% of the time)
  static const String testBannerId = 'ca-app-pub-3940256099942544/6300978111';
  static const String testRewardedId = 'ca-app-pub-3940256099942544/5354046379';

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

  static void loadRewardedInterstitial({bool useTestFallback = false}) {
    if (_isLoadingRewarded || _rewardedInterstitialAd != null) return;
    _isLoadingRewarded = true;

    final targetUnitId = useTestFallback ? testRewardedId : realRewardedId;

    RewardedInterstitialAd.load(
      adUnitId: targetUnitId,
      request: const AdRequest(),
      rewardedInterstitialAdLoadCallback: RewardedInterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _rewardedInterstitialAd = ad;
          _isLoadingRewarded = false;
        },
        onAdFailedToLoad: (error) {
          debugPrint('Rewarded Interstitial failed ($targetUnitId): $error');
          _rewardedInterstitialAd = null;
          _isLoadingRewarded = false;
          if (!useTestFallback) {
            // Automatically fallback to test ad so ad displays immediately
            loadRewardedInterstitial(useTestFallback: true);
          }
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

  static BannerAd createBannerAd({
    required Function() onAdLoaded,
    bool useTestFallback = false,
    Function(dynamic)? onFailed,
  }) {
    final targetId = useTestFallback ? testBannerId : realBannerId;
    return BannerAd(
      adUnitId: targetId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (ad) => onAdLoaded(),
        onAdFailedToLoad: (ad, error) {
          debugPrint('BannerAd error ($targetId): $error');
          ad.dispose();
          if (onFailed != null) {
            onFailed(error);
          }
        },
      ),
    );
  }
}
