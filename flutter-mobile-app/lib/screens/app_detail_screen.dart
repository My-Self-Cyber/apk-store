import 'package:flutter/material.dart';

import '../models/app_model.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/downloader_service.dart';

class AppDetailScreen extends StatefulWidget {
  final AppItem app;

  const AppDetailScreen({Key? key, required this.app}) : super(key: key);

  @override
  State<AppDetailScreen> createState() => _AppDetailScreenState();
}

class _AppDetailScreenState extends State<AppDetailScreen> {
  bool _isDownloading = false;
  double _downloadProgress = 0.0;

  void _startDownload() {
    setState(() {
      _isDownloading = true;
      _downloadProgress = 0.0;
    });

    DownloaderService.downloadAndInstall(
      appId: widget.app.id,
      apkFileName: widget.app.apkFileName.isNotEmpty
          ? widget.app.apkFileName
          : '${widget.app.name.toLowerCase().replaceAll(' ', '_')}.apk',
      onProgress: (progress) {
        setState(() {
          _downloadProgress = progress;
        });
      },
      onError: (err) {
        setState(() {
          _isDownloading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Download failed: $err'),
            backgroundColor: Colors.redAccent,
          ),
        );
      },
      onComplete: () {
        setState(() {
          _isDownloading = false;
          _downloadProgress = 0.0;
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = widget.app;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: const Color(0xFF090D16),
        title: Text(
          app.name,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // App Header Row
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    width: 76,
                    height: 76,
                    color: const Color(0xFF131B2E),
                    child: Image.network(ApiService.resolveUrl(app.iconUrl, fit: BoxFit.cover, errorBuilder: (c, e, s) => Image.asset('assets/images/logo.png')),
                      fit: BoxFit.cover,
                      placeholder: (c, u) => const Center(
                        child: CircularProgressIndicator(color: AppColors.neonGreen, strokeWidth: 2),
                      ),
                      errorWidget: (c, u, e) => Image.asset('assets/images/logo.webp'),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              app.name,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const Icon(Icons.check_circle, color: AppColors.verifiedBlue, size: 18),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        app.developer,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        app.packageName,
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Big Action Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isDownloading ? null : _startDownload,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.neonGreen,
                  foregroundColor: const Color(0xFF090D16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 6,
                  shadowColor: AppColors.neonGreen.withOpacity(0.3),
                ),
                child: _isDownloading
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Color(0xFF090D16),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'Downloading ${(_downloadProgress * 100).toInt()}%',
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                          ),
                        ],
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.download, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Download APK (${app.fileSizeFormatted})',
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                          ),
                        ],
                      ),
              ),
            ),

            const SizedBox(height: 24),

            // Specs grid strip
            Container(
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildSpecItem('Category', app.category),
                  _buildDivider(),
                  _buildSpecItem('Version', 'v${app.version}'),
                  _buildDivider(),
                  _buildSpecItem('Downloads', '${app.downloadCount}'),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Screenshots Gallery
            if (app.screenshots.isNotEmpty) ...[
              const Text(
                'Screenshots',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 180,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: app.screenshots.length,
                  separatorBuilder: (c, i) => const SizedBox(width: 12),
                  itemBuilder: (context, index) {
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.network(
                        app.screenshots[index],
                        fit: BoxFit.cover,
                        width: 280,
                        errorBuilder: (c, e, s) => Container(width: 280, color: AppColors.cardBg, child: const Icon(Icons.broken_image, color: Colors.grey)),
                      ),
                        ),
                        errorWidget: (c, u, e) => Container(
                          width: 280,
                          color: AppColors.cardBg,
                          child: const Icon(Icons.broken_image, color: Colors.grey),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Description
            const Text(
              'About Application',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(
              app.description.isNotEmpty ? app.description : app.shortDescription,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
                height: 1.5,
              ),
            ),

            if (app.changelog.isNotEmpty) ...[
              const SizedBox(height: 24),
              const Text(
                "What's New",
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F1523),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Text(
                  app.changelog,
                  style: const TextStyle(
                    color: Color(0xFFCBD5E1),
                    fontSize: 13,
                    height: 1.5,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSpecItem(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
        ),
      ],
    );
  }

  Widget _buildDivider() {
    return Container(height: 26, width: 1, color: AppColors.cardBorder);
  }
}
