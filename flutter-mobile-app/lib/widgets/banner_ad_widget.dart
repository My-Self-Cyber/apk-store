import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../services/ad_service.dart';

class BannerAdWidget extends StatefulWidget {
  const BannerAdWidget({Key? key}) : super(key: key);

  @override
  State<BannerAdWidget> createState() => _BannerAdWidgetState();
}

class _BannerAdWidgetState extends State<BannerAdWidget> {
  BannerAd? _bannerAd;
  bool _isLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadBanner(useFallback: false);
  }

  void _loadBanner({required bool useFallback}) {
    _bannerAd?.dispose();
    _bannerAd = AdService.createBannerAd(
      useTestFallback: useFallback,
      onAdLoaded: () {
        if (mounted) {
          setState(() {
            _isLoaded = true;
          });
        }
      },
      onFailed: (err) {
        if (!useFallback && mounted) {
          // If real ad unit returns error (no-fill or partner bidding), load test banner immediately
          _loadBanner(useFallback: true);
        }
      },
    )..load();
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isLoaded || _bannerAd == null) {
      return const SizedBox.shrink();
    }
    return Container(
      width: _bannerAd!.size.width.toDouble(),
      height: _bannerAd!.size.height.toDouble(),
      alignment: Alignment.center,
      color: const Color(0xFF0D131F),
      child: AdWidget(ad: _bannerAd!),
    );
  }
}
