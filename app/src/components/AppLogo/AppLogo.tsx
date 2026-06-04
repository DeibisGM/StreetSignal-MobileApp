import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Colors} from '../../theme';

const LOGO_WHITE = require('../../assets/images/logo-white.png');
const LOGO_DARK = require('../../assets/images/logo-dark.png');

interface AppLogoProps {
  size?: number;
  /** 'light' = white logo on primary blue bg (default). 'dark' = dark logo on white bg. */
  variant?: 'light' | 'dark';
  testID?: string;
}

export function AppLogo({size = 64, variant = 'light', testID}: AppLogoProps) {
  const radius = Math.round(size * 0.28);
  const imageSize = Math.round(size * 0.68);

  return (
    <View
      testID={testID ?? 'app-logo'}
      accessibilityLabel="StreetSignal logo"
      accessibilityRole="image"
      style={[
        styles.container,
        variant === 'dark' && styles.containerDark,
        {width: size, height: size, borderRadius: radius},
      ]}>
      <Image
        source={variant === 'light' ? LOGO_WHITE : LOGO_DARK}
        style={{width: imageSize, height: imageSize}}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerDark: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
});
