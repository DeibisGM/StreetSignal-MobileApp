import React, {useCallback, useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

interface Props {
  message: string | null;
  onDismiss: () => void;
}

export function SuccessToast({message, onDismiss}: Props) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const dismiss = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -80,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onDismissRef.current());
  }, [translateY]);

  useEffect(() => {
    if (!message) {return;}
    translateY.setValue(-80);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
    const timer = setTimeout(dismiss, 3500);
    return () => clearTimeout(timer);
  }, [message, dismiss, translateY]);

  if (!message) {return null;}

  return (
    <Animated.View style={[styles.container, {transform: [{translateY}]}]}>
      <TouchableOpacity
        onPress={dismiss}
        activeOpacity={0.9}
        style={styles.inner}>
        <View style={styles.iconWrapper}>
          <Text style={styles.icon}>&#10003;</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={2}>
          {message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 20,
  },
});
