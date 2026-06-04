import React, {useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Mailbox, MagnifyingGlass} from 'phosphor-react-native';
import {Colors, Spacing} from '../../theme';
import {AppLogo} from '../AppLogo';
import {AppTextInput} from '../AppTextInput';
import {CategoryPicker} from '../CategoryPicker';
import {CommentItem} from '../CommentItem';
import {EmptyState} from '../EmptyState';
import {ErrorMessage} from '../ErrorMessage';
import {ImagePickerField} from '../ImagePickerField';
import {LoadingButton} from '../LoadingButton';
import {LocationField} from '../LocationField';
import {ReportCard} from '../ReportCard';
import {StatusBadge} from '../StatusBadge';
import {UpdateTimelineItem} from '../UpdateTimelineItem';
import type {Category, Report, ReportUpdate} from '../../types';

const CATEGORIES: Category[] = [
  {id: 1, name: 'Vías', slug: 'vias', icon: '🛣️', isActive: true},
  {id: 2, name: 'Alumbrado', slug: 'alumbrado', icon: '💡', isActive: true},
  {id: 3, name: 'Acueducto', slug: 'acueducto', icon: '💧', isActive: true},
  {id: 4, name: 'Parques', slug: 'parques', icon: '🌳', isActive: true},
  {id: 5, name: 'Basuras', slug: 'basuras', icon: '🗑️', isActive: true},
];

const SAMPLE_REPORT: Report = {
  id: '1',
  title: 'Bache profundo en Av. 7a con Calle 45',
  description: 'Bache de 30 cm.',
  categoryId: 1,
  category: 'Vías',
  status: 'InProgress',
  latitude: 4.624,
  longitude: -74.063,
  address: 'Av. 7a con Calle 45, Bogotá',
  createdById: 'u1',
  createdByName: 'Juan García',
  createdAt: new Date().toISOString(),
};

const COMMENT: ReportUpdate = {
  id: 'u1', reportId: '1', createdById: 's1', createdByName: 'Ana Roja',
  type: 'comment', message: 'Se programó visita técnica para el jueves.',
  isOfficial: true, createdAt: new Date().toISOString(),
};

const STATUS_CHANGE: ReportUpdate = {
  id: 'u2', reportId: '1', createdById: 's1', createdByName: 'Ana Roja',
  type: 'status_change', message: '', oldStatus: 'InReview', newStatus: 'InProgress',
  isOfficial: true, createdAt: new Date().toISOString(),
};

const ALL_STATUSES = ['Pending','InReview','Assigned','InProgress','Resolved','Rejected'] as const;

export function ComponentsDemo() {
  const [selectedCat, setSelectedCat] = useState<number | null>(1);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <AppLogo size={56} />
          <View>
            <Text style={styles.headerTitle}>Component Library</Text>
            <Text style={styles.headerSub}>StreetSignal Design System</Text>
          </View>
        </View>

        {/* AppLogo */}
        <Section title="AppLogo">
          <View style={styles.row}>
            <AppLogo size={40} />
            <AppLogo size={56} />
            <AppLogo size={72} />
            <AppLogo size={88} variant="dark" />
          </View>
        </Section>

        {/* StatusBadge */}
        <Section title="StatusBadge">
          <View style={styles.wrap}>
            {ALL_STATUSES.map(s => <StatusBadge key={s} status={s} />)}
          </View>
        </Section>

        {/* ReportCard */}
        <Section title="ReportCard" noPad>
          <ReportCard report={SAMPLE_REPORT} onPress={() => {}} />
          <ReportCard report={{...SAMPLE_REPORT, id:'2', status:'Resolved'}} onPress={() => {}} />
          <ReportCard
            report={{...SAMPLE_REPORT, id:'3', status:'Rejected',
              imageUrl:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200'}}
            onPress={() => {}}
          />
        </Section>

        {/* AppTextInput */}
        <Section title="AppTextInput">
          <AppTextInput label="Correo" placeholder="correo@ejemplo.com"
            value={text} onChangeText={setText} keyboardType="email-address" autoCapitalize="none" />
          <AppTextInput label="Con error" placeholder="..." error="Campo obligatorio" value="" />
          <AppTextInput label="Con ayuda" placeholder="Mínimo 8 caracteres" helperText="Usa letras y números." />
          <AppTextInput label="Deshabilitado" value="Solo lectura" editable={false} />
        </Section>

        {/* LoadingButton */}
        <Section title="LoadingButton">
          <LoadingButton label="Enviar reporte" onPress={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }} loading={loading} />
          <View style={styles.spacer} />
          <LoadingButton label="Cancelar" onPress={() => {}} variant="ghost" />
          <View style={styles.spacer} />
          <LoadingButton label="Deshabilitado" onPress={() => {}} disabled />
        </Section>

        {/* ErrorMessage */}
        <Section title="ErrorMessage">
          <ErrorMessage message="Las credenciales no son correctas. Intenta de nuevo." />
        </Section>

        {/* EmptyState */}
        <Section title="EmptyState">
          <EmptyState Icon={Mailbox} title="Sin reportes"
            subtitle="Cuando crees un reporte aparecerá aquí."
            actionLabel="Crear reporte" onAction={() => {}} />
        </Section>

        {/* EmptyState — búsqueda */}
        <Section title="EmptyState (búsqueda)">
          <EmptyState Icon={MagnifyingGlass} title="Sin resultados"
            subtitle="Intenta con otros términos de búsqueda." />
        </Section>

        {/* CategoryPicker */}
        <Section title="CategoryPicker" noPad>
          <View style={{paddingLeft: Spacing.marginPage}}>
            <CategoryPicker categories={CATEGORIES} selectedId={selectedCat}
              onSelect={c => setSelectedCat(c.id)} label="Categoría" />
          </View>
        </Section>

        {/* ImagePickerField */}
        <Section title="ImagePickerField">
          <ImagePickerField label="Foto del problema" value={image}
            onPick={() => setImage('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400')}
            onRemove={() => setImage(null)} />
        </Section>

        {/* LocationField */}
        <Section title="LocationField">
          <LocationField label="Con valor" value="Av. 7a con Calle 45, Bogotá" onPress={() => {}} />
          <LocationField label="Vacío" onPress={() => {}} />
          <LocationField label="Deshabilitado" value="Carrera 15 #93-75" disabled />
        </Section>

        {/* CommentItem */}
        <Section title="CommentItem">
          <CommentItem update={COMMENT} />
          <CommentItem update={{...COMMENT, id:'u3', isOfficial:false, createdByName:'Luis Pérez',
            message:'Esto lleva meses así.'}} />
        </Section>

        {/* UpdateTimelineItem */}
        <Section title="UpdateTimelineItem">
          <UpdateTimelineItem update={STATUS_CHANGE} />
          <UpdateTimelineItem update={COMMENT} />
          <UpdateTimelineItem update={{...COMMENT, id:'u4', message:'Reparación finalizada.'}} isLast />
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>StreetSignal Design System · v1</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({title, children, noPad}: {title: string; children: React.ReactNode; noPad?: boolean}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.sectionBody, noPad && styles.noPad]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  scroll: {paddingBottom: 48},
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.gutter,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.marginPage, paddingTop: 24, paddingBottom: 28,
  },
  headerTitle: {fontSize: 20, fontWeight: '700', color: Colors.onPrimary, letterSpacing: -0.3},
  headerSub: {fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500', marginTop: 2},
  section: {marginTop: Spacing.stackLg},
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: Spacing.stackMd, paddingHorizontal: Spacing.marginPage,
  },
  sectionBody: {paddingHorizontal: Spacing.marginPage},
  noPad: {paddingHorizontal: 0},
  row: {flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.gutter},
  wrap: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.stackSm},
  footer: {marginTop: Spacing.stackXl, alignItems: 'center', paddingBottom: Spacing.stackLg},
  footerText: {fontSize: 12, color: Colors.outline},
  spacer: {height: 12},
});
