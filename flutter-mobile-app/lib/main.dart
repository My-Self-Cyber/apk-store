import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme/app_theme.dart';
import 'screens/home_screen.dart';
import 'services/ad_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF080C16),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  await AdService.initialize();
  runApp(const APKStoreApp());
}

class APKStoreApp extends StatelessWidget {
  const APKStoreApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'APKStore',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const HomeScreen(),
    );
  }
}
