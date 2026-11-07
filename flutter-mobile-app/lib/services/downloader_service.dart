import 'package:url_launcher/url_launcher.dart';
import 'api_service.dart';

class DownloaderService {
  static Future<void> downloadAndInstall({
    required String appId,
    required String apkFileName,
    required Function(double progress) onProgress,
    required Function(String error) onError,
    required Function() onComplete,
  }) async {
    try {
      final downloadUrl = '${ApiService.baseUrl}/api/download/$appId';
      final uri = Uri.parse(downloadUrl);

      onProgress(0.5);

      bool launched = false;
      try {
        launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      } catch (_) {
        try {
          launched = await launchUrl(uri, mode: LaunchMode.platformDefault);
        } catch (_) {
          launched = false;
        }
      }

      if (launched) {
        onProgress(1.0);
        onComplete();
      } else {
        onError('Could not launch browser for download: $downloadUrl');
      }
    } catch (e) {
      onError(e.toString());
    }
  }
}
