import 'package:flutter/material.dart';

class AppColors {
  static const Color background = Color(0xFF080C16);
  static const Color cardBg = Color(0xFF0D131F);
  static const Color cardBorder = Color(0xFF1A2336);
  static const Color neonGreen = Color(0xFF00E676);
  static const Color neonGreenAccent = Color(0xFF00FF87);
  static const Color verifiedBlue = Color(0xFF38BDF8);
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);
  static const Color pillBg = Color(0xFF131B2E);
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.background,
      primaryColor: AppColors.neonGreen,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.neonGreen,
        secondary: AppColors.neonGreenAccent,
        surface: AppColors.cardBg,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF090D16),
        elevation: 0,
        centerTitle: false,
      ),
    );
  }
}
