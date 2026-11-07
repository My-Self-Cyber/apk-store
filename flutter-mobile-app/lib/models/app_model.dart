class AppItem {
  final String id;
  final String name;
  final String packageName;
  final String version;
  final String category;
  final String developer;
  final String shortDescription;
  final String description;
  final String iconUrl;
  final List<String> screenshots;
  final String apkFileName;
  final String fileSizeFormatted;
  final int downloadCount;
  final String minAndroidVersion;
  final String changelog;

  AppItem({
    required this.id,
    required this.name,
    required this.packageName,
    required this.version,
    required this.category,
    required this.developer,
    required this.shortDescription,
    required this.description,
    required this.iconUrl,
    required this.screenshots,
    required this.apkFileName,
    required this.fileSizeFormatted,
    required this.downloadCount,
    required this.minAndroidVersion,
    required this.changelog,
  });

  factory AppItem.fromJson(Map<String, dynamic> json) {
    return AppItem(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      packageName: json['packageName'] ?? '',
      version: json['version'] ?? '1.0.0',
      category: json['category'] ?? 'Tools',
      developer: json['developer'] ?? 'Independent Developer',
      shortDescription: json['shortDescription'] ?? '',
      description: json['description'] ?? '',
      iconUrl: json['iconUrl'] ?? '',
      screenshots: (json['screenshots'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      apkFileName: json['apkFileName'] ?? '',
      fileSizeFormatted: json['fileSizeFormatted'] ?? '0 MB',
      downloadCount: json['downloadCount'] ?? 0,
      minAndroidVersion: json['minAndroidVersion'] ?? 'Android 8.0+',
      changelog: json['changelog'] ?? '',
    );
  }
}
