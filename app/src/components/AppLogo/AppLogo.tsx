import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Colors} from '../../theme';

const LOGO_WHITE = require('../../assets/images/logo-white.png');
const LOGO_DARK = require('../../assets/images/logo-dark.png');

interface AppLogoProps {
  size?: number;
  /** 'light' = white logo on primary blue bg. 'dark' = dark logo on white bg. */
  variant?: 'light' | 'dark';
  testID?: string;
}

export function AppLogo({size = 64, variant = 'light', testID}: AppLogoProps) {
  const imageSize = Math.round(size * 0.68);

  if (variant === 'light') {
    // Plain white icon — no blue box on top of blue header.
    return (
      <View
        testID={testID ?? 'app-logo'}
        accessibilityLabel="StreetSignal logo"
        accessibilityRole="image"
        style={[styles.iconWrap, {width: size, height: size}]}>
        <Image
          source={LOGO_WHITE}
          style={{width: imageSize, height: imageSize}}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View
      testID={testID ?? 'app-logo'}
      accessibilityLabel="StreetSignal logo"
      accessibilityRole="image"
      style={[styles.containerDark, {width: size, height: size}]}>
      <Image
        source={LOGO_DARK}
        style={{width: imageSize, height: imageSize}}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerDark: {
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
  },
});
