import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReportDetail'>;

export default function ReportDetailScreen({route}: Props) {
  return (
    <View style={styles.container} testID="report-detail-screen">
      <Text style={styles.title}>Reporte</Text>
      <Text style={styles.id}>{route.params.reportId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A3C5E',
  },
  id: {
    fontSize: 14,
    color: '#5A7A99',
    marginTop: 8,
  },
});
