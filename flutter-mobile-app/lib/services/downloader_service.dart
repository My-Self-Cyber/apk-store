import 'dart:io';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_filex/open_filex.dart';
import 'package:permission_handler/permission_handler.dart';
import 'api_service.dart';

class DownloaderService {
  static final Dio _dio = Dio();

  static Future<void> downloadAndInstall({
    required String appId,
    required String apkFileName,
    required Function(double progress) onProgress,
    required Function(String error) onError,
    required Function() onComplete,
  }) async {
    try {
      // Check installation permissions on Android
      if (Platform.isAndroid) {
        final installPermission = await Permission.requestInstallPackages.status;
        if (!installPermission.isGranted) {
          await Permission.requestInstallPackages.request();
        }
      }

      final downloadUrl = '${ApiService.baseUrl}/api/download/$appId';
      
      // Get directory to store temporary APK
      Directory? dir;
      if (Platform.isAndroid) {
        dir = await getExternalStorageDirectory() ?? await getApplicationDocumentsDirectory();
      } else {
        dir = await getApplicationDocumentsDirectory();
      }

      final safeName = apkFileName.endsWith('.apk') ? apkFileName : '$apkFileName.apk';
      final savePath = '${dir.path}/$safeName';

      // Download file with progress updates
      await _dio.download(
        downloadUrl,
        savePath,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            final progress = received / total;
            onProgress(progress);
          }
        },
      );

      onComplete();

      // Launch native Android Package Installer
      final result = await OpenFilex.open(
        savePath,
        type: 'application/vnd.android.package-archive',
      );

      if (result.type != ResultType.done) {
        print('OpenFilex notice: ${result.message}');
      }
    } catch (e) {
      onError(e.toString());
    }
  }
}
