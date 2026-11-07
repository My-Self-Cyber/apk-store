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

      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        onProgress(1.0);
        onComplete();
      } else {
        onError('Could not launch download URL: $downloadUrl');
      }
    } catch (e) {
      onError(e.toString());
    }
  }
}
