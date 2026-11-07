import 'package:flutter/material.dart';
import '../models/app_model.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/downloader_service.dart';
import '../services/ad_service.dart';
import '../widgets/banner_ad_widget.dart';
import 'app_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<AppItem> _apps = [];
  bool _isLoading = true;
  String _selectedCategory = 'All';
  final TextEditingController _searchController = TextEditingController();

  final Map<String, double> _downloadProgress = {};
  final Set<String> _downloadingIds = {};

  final List<String> _categories = ['All', 'Games', 'Apps', 'Tools'];

  @override
  void initState() {
    super.initState();
    _loadApps();
  }

  Future<void> _loadApps() async {
    setState(() => _isLoading = true);
    final apps = await ApiService.getApps(
      category: _selectedCategory,
      search: _searchController.text,
    );
    setState(() {
      _apps = apps;
      _isLoading = false;
    });
  }

  void _downloadApp(AppItem app) {
    AdService.showRewardedInterstitial(
      onProceed: () {
        setState(() {
          _downloadingIds.add(app.id);
          _downloadProgress[app.id] = 0.0;
        });

    DownloaderService.downloadAndInstall(
      appId: app.id,
      apkFileName: app.apkFileName.isNotEmpty
          ? app.apkFileName
          : '${app.name.toLowerCase().replaceAll(' ', '_')}.apk',
      onProgress: (progress) {
        setState(() {
          _downloadProgress[app.id] = progress;
        });
      },
      onError: (err) {
        setState(() {
          _downloadingIds.remove(app.id);
          _downloadProgress.remove(app.id);
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Download error: $err'), backgroundColor: Colors.redAccent),
        );
      },
      onComplete: () {
        setState(() {
          _downloadingIds.remove(app.id);
          _downloadProgress.remove(app.id);
        });
      },
    );
      },
    );
  }

  void _showSettingsDialog() {
    final urlController = TextEditingController(text: ApiService.baseUrl);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Server Configuration', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Set the backend API endpoint:',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: urlController,
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF090D16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.cardBorder),
                ),
                hintText: 'https://apkvault-store.vercel.app',
              ),
              style: const TextStyle(fontSize: 13),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              ApiService.setBaseUrl(urlController.text.trim());
              Navigator.pop(ctx);
              _loadApps();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.neonGreen,
              foregroundColor: const Color(0xFF090D16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Save & Reconnect', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: const Color(0xFF090D16),
        titleSpacing: 16,
        title: Row(
          children: [
            Image.asset(
              'assets/images/logo.webp',
              width: 36,
              height: 36,
              fit: BoxFit.contain,
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                RichText(
                  text: const TextSpan(
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
                    children: [
                      TextSpan(text: 'APK', style: TextStyle(color: Colors.white)),
                      TextSpan(text: 'Store', style: TextStyle(color: AppColors.neonGreen)),
                    ],
                  ),
                ),
                const Text(
                  'SAFE & VERIFIED',
                  style: TextStyle(
                    fontSize: 8.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textMuted,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.neonGreen.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.neonGreen.withOpacity(0.3)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.shield, color: AppColors.neonGreen, size: 12),
                SizedBox(width: 4),
                Text(
                  '100% Virus Free',
                  style: TextStyle(color: AppColors.neonGreen, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: AppColors.textSecondary, size: 20),
            onPressed: _showSettingsDialog,
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadApps,
        color: AppColors.neonGreen,
        backgroundColor: AppColors.cardBg,
        child: CustomScrollView(
          slivers: [
            // Search Input
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
                child: Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Row(
                    children: [
                      const Icon(Icons.search, color: AppColors.textMuted, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          decoration: const InputDecoration(
                            hintText: 'Search APKs, games, packages...',
                            hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 13),
                            border: InputBorder.none,
                            isDense: true,
                          ),
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          onSubmitted: (v) => _loadApps(),
                        ),
                      ),
                      if (_searchController.text.isNotEmpty)
                        GestureDetector(
                          onTap: () {
                            _searchController.clear();
                            _loadApps();
                          },
                          child: const Icon(Icons.close, color: AppColors.textMuted, size: 16),
                        ),
                    ],
                  ),
                ),
              ),
            ),

            // Category Filter Pills
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: SizedBox(
                  height: 34,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    scrollDirection: Axis.horizontal,
                    itemCount: _categories.length,
                    separatorBuilder: (c, i) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final cat = _categories[index];
                      final isSelected = _selectedCategory == cat;

                      return GestureDetector(
                        onTap: () {
                          setState(() => _selectedCategory = cat);
                          _loadApps();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.neonGreen : AppColors.cardBg,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected ? AppColors.neonGreen : AppColors.cardBorder,
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            cat,
                            style: TextStyle(
                              color: isSelected ? const Color(0xFF090D16) : AppColors.textSecondary,
                              fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),

            // Available Packages Section Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Available Packages',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Showing verified Android packages',
                      style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
            ),

            // Packages List
            _isLoading
                ? const SliverFillRemaining(
                    child: Center(
                      child: CircularProgressIndicator(color: AppColors.neonGreen),
                    ),
                  )
                : _apps.isEmpty
                    ? SliverFillRemaining(
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.inventory_2_outlined, color: AppColors.textMuted, size: 48),
                              SizedBox(height: 12),
                              Text('No packages found', style: TextStyle(color: Colors.white, fontSize: 16)),
                              SizedBox(height: 4),
                              Text('Pull down to refresh', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                            ],
                          ),
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final app = _apps[index];
                              final isDownloading = _downloadingIds.contains(app.id);
                              final progress = _downloadProgress[app.id] ?? 0.0;

                              return Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: AppColors.cardBg,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: AppColors.cardBorder),
                                ),
                                child: Column(
                                  children: [
                                    GestureDetector(
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => AppDetailScreen(app: app),
                                          ),
                                        );
                                      },
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          ClipRRect(
                                            borderRadius: BorderRadius.circular(14),
                                            child: Container(
                                              width: 54,
                                              height: 54,
                                              color: const Color(0xFF131B2E),
                                              child: Image.network(
                                                ApiService.resolveUrl(app.iconUrl),
                                                fit: BoxFit.cover,
                                                errorBuilder: (c, e, s) => Image.asset('assets/images/logo.png'),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  children: [
                                                    Expanded(
                                                      child: Row(
                                                        children: [
                                                          Flexible(
                                                            child: Text(
                                                              app.name,
                                                              style: const TextStyle(
                                                                color: Colors.white,
                                                                fontSize: 15,
                                                                fontWeight: FontWeight.w800,
                                                              ),
                                                              maxLines: 1,
                                                              overflow: TextOverflow.ellipsis,
                                                            ),
                                                          ),
                                                          const SizedBox(width: 4),
                                                          const Icon(
                                                            Icons.check_circle,
                                                            color: AppColors.verifiedBlue,
                                                            size: 15,
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                    const Icon(
                                                      Icons.shield_outlined,
                                                      color: AppColors.neonGreen,
                                                      size: 16,
                                                    ),
                                                  ],
                                                ),
                                                const SizedBox(height: 2),
                                                Text(
                                                  app.packageName,
                                                  style: const TextStyle(
                                                    color: AppColors.textMuted,
                                                    fontSize: 11,
                                                    fontFamily: 'monospace',
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                                const SizedBox(height: 6),
                                                Row(
                                                  children: [
                                                    _buildPill(Icons.check, 'v${app.version}', AppColors.neonGreen),
                                                    const SizedBox(width: 6),
                                                    _buildPill(Icons.memory, app.fileSizeFormatted, AppColors.textSecondary),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 12),

                                    // Full-Width Bright Neon Green Download Button
                                    SizedBox(
                                      width: double.infinity,
                                      height: 38,
                                      child: ElevatedButton(
                                        onPressed: isDownloading ? null : () => _downloadApp(app),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: AppColors.neonGreen,
                                          foregroundColor: const Color(0xFF090D16),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          elevation: 2,
                                        ),
                                        child: isDownloading
                                            ? Row(
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                children: [
                                                  const SizedBox(
                                                    width: 14,
                                                    height: 14,
                                                    child: CircularProgressIndicator(
                                                      strokeWidth: 2,
                                                      color: Color(0xFF090D16),
                                                    ),
                                                  ),
                                                  const SizedBox(width: 8),
                                                  Text(
                                                    'Downloading ${(progress * 100).toInt()}%',
                                                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12),
                                                  ),
                                                ],
                                              )
                                            : const Text(
                                                'Download APK',
                                                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12),
                                              ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                            childCount: _apps.length,
                          ),
                        ),
                      ),
          ],
        ),
      ),
      bottomNavigationBar: const BannerAdWidget(),
    );
  }

  Widget _buildPill(IconData icon, String text, Color iconColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
      decoration: BoxDecoration(
        color: AppColors.pillBg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 10, color: iconColor),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              fontSize: 10,
              fontFamily: 'monospace',
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
