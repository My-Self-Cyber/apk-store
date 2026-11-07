import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/app_model.dart';

class ApiService {
  static String baseUrl = 'https://apkvault-store.vercel.app';

  static void setBaseUrl(String url) {
    baseUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }

  static String resolveUrl(String path) {
    if (path.isEmpty) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return '$baseUrl$cleanPath';
  }

  static Future<List<AppItem>> getApps({String? category, String? search}) async {
    try {
      final queryParams = <String, String>{};
      if (category != null && category != 'All') queryParams['category'] = category;
      if (search != null && search.trim().isNotEmpty) queryParams['search'] = search.trim();

      final uri = Uri.parse('$baseUrl/api/apps').replace(queryParameters: queryParams);
      final response = await http.get(uri).timeout(const Duration(seconds: 12));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['apps'] != null) {
          final list = (data['apps'] as List)
              .map((item) => AppItem.fromJson(item))
              .toList();
          return list;
        }
      }
      return [];
    } catch (e) {
      print('API Error: $e');
      return [];
    }
  }

  static Future<AppItem?> getAppDetails(String id) async {
    try {
      final uri = Uri.parse('$baseUrl/api/apps/$id');
      final response = await http.get(uri).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['app'] != null) {
          return AppItem.fromJson(data['app']);
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
