import React, {useEffect, useRef, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

import {AppTextInput} from '../../../components/AppTextInput';
import {CategoryPicker} from '../../../components/CategoryPicker';
import {ImagePickerField} from '../../../components/ImagePickerField';
import {LoadingButton} from '../../../components/LoadingButton';
import {LocationField} from '../../../components/LocationField';
import {SuccessToast} from '../../../components/SuccessToast';
import {categoriesService} from '../../../api/categoriesService';
import {reportsService} from '../../../api/reportsService';
import {storageService, STORAGE_KEYS} from '../../../storage/storageService';
import type {ReportDraft} from '../../../storage/storageService';
import {ApiError} from '../../../api/types';
import {Colors, Spacing, Typography} from '../../../theme';
import type {AppTabParamList} from '../../../navigation/types';
import type {Category} from '../../../types';

type Nav = BottomTabNavigationProp<AppTabParamList, 'CreateReport'>;

interface LocationValue {
  latitude: number;
  longitude: number;
  address?: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  image?: string;
  location?: string;
}

export default function CreateReportScreen() {
  const navigation = useNavigation<Nav>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationValue | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const submittingRef = useRef(false);

  // Load categories + restore draft on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoadingCategories(true);
      try {
        const cats = await categoriesService.getCategories();
        if (mounted) {
          setCategories(cats);
        }
      } catch {
        // Non-blocking — picker renders empty until categories load
      } finally {
        if (mounted) {
          setLoadingCategories(false);
        }
      }

      try {
        const draft = await storageService.getItem<ReportDraft>(
          STORAGE_KEYS.REPORT_DRAFT,
        );
        if (draft && mounted) {
          setTitle(draft.title);
          setDescription(draft.description);
          if (draft.categoryId) {
            setCategoryId(draft.categoryId);
          }
          if (draft.imageUri) {
            setImageUri(draft.imageUri);
          }
        }
      } catch {
        // Ignore — start with empty form
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Persist draft on every field change (location excluded per storage spec)
  useEffect(() => {
    if (!title && !description && !categoryId && !imageUri) {
      return;
    }
    const draft: ReportDraft = {
      title,
      description,
      categoryId: categoryId ?? 0,
      imageUri: imageUri ?? undefined,
    };
    storageService
      .setItem<ReportDraft>(STORAGE_KEYS.REPORT_DRAFT, draft)
      .catch(() => {});
  }, [title, description, categoryId, imageUri]);

  function clearError(field: keyof FormErrors) {
    setErrors(prev => {
      if (!prev[field]) {
        return prev;
      }
      const next = {...prev};
      delete next[field];
      return next;
    });
  }

  function validate(): boolean {
    const errs: FormErrors = {};
    if (title.trim().length < 5) {
      errs.title = 'El título debe tener al menos 5 caracteres.';
    }
    if (description.trim().length < 10) {
      errs.description = 'La descripción debe tener al menos 10 caracteres.';
    }
    if (categoryId === null) {
      errs.category = 'Selecciona una categoría.';
    }
    if (!imageUri) {
      errs.image = 'Agrega una imagen del problema.';
    }
    if (!location) {
      errs.location = 'Selecciona tu ubicación.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // TODO(#13): replace with imageService.pickFromGallery / captureFromCamera
  function handleImagePick() {
    Alert.alert('Agregar foto', 'Selecciona el origen de la imagen', [
      {
        text: 'Galería',
        onPress: () => {
          // imageService.pickFromGallery().then(asset => {
          //   if (asset) { setImageUri(asset.uri); clearError('image'); }
          // });
        },
      },
      {
        text: 'Cámara',
        onPress: () => {
          // imageService.captureFromCamera().then(asset => {
          //   if (asset) { setImageUri(asset.uri); clearError('image'); }
          // });
        },
      },
      {text: 'Cancelar', style: 'cancel'},
    ]);
  }

  // TODO(#14): replace with locationService.getCurrentCoords
  function handleLocationPress() {
    // locationService.getCurrentCoords().then(coords => {
    //   if (!coords) return;
    //   locationService.reverseGeocode(coords).then(addr => {
    //     setLocation({...coords, address: addr ?? undefined});
    //     clearError('location');
    //   }).catch(() => {
    //     setLocation(coords);
    //     clearError('location');
    //   });
    // }).catch(() => {
    //   Alert.alert('Sin ubicación', 'No se pudo obtener tu ubicación. Intenta nuevamente.');
    // });
  }

  async function handleSubmit() {
    if (submittingRef.current) {
      return;
    }
    if (!validate()) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      await reportsService.createReport({
        title: title.trim(),
        description: description.trim(),
        categoryId: categoryId!,
        latitude: location!.latitude,
        longitude: location!.longitude,
        address: location?.address,
        images: imageUri
          ? [{uri: imageUri, name: 'report.jpg', type: 'image/jpeg'}]
          : undefined,
      });

      await storageService.removeItem(STORAGE_KEYS.REPORT_DRAFT);

      setTitle('');
      setDescription('');
      setCategoryId(null);
      setImageUri(null);
      setLocation(null);
      setErrors({});
      setToastMessage('¡Reporte enviado con éxito!');

      setTimeout(() => {
        navigation.navigate('HomeTab', {screen: 'Home'});
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          Alert.alert(
            'Sesión expirada',
            'Tu sesión ha caducado. Inicia sesión nuevamente.',
          );
        } else if (err.statusCode === 400) {
          Alert.alert(
            'Datos inválidos',
            err.message || 'Revisa el formulario e intenta nuevamente.',
          );
        } else {
          Alert.alert('Error', err.message || 'No se pudo enviar el reporte.');
        }
      } else {
        Alert.alert('Sin conexión', 'Verifica tu conexión e intenta nuevamente.');
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const locationDisplay = location
    ? (location.address ??
        `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`)
    : null;

  return (
    <View style={styles.root} testID="create-report-screen">
      <SuccessToast
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <Text style={styles.heading}>Nuevo reporte</Text>

        <AppTextInput
          label="Título"
          placeholder="¿Qué problema detectaste?"
          value={title}
          onChangeText={text => {
            setTitle(text);
            clearError('title');
          }}
          error={errors.title}
          maxLength={120}
          returnKeyType="next"
          testID="input-title"
        />

        <AppTextInput
          label="Descripción"
          placeholder="Describe el problema con más detalle..."
          value={description}
          onChangeText={text => {
            setDescription(text);
            clearError('description');
          }}
          error={errors.description}
          multiline
          numberOfLines={4}
          maxLength={1000}
          testID="input-description"
        />

        <CategoryPicker
          label="Categoría"
          categories={categories}
          selectedId={categoryId}
          onSelect={cat => {
            setCategoryId(cat.id);
            clearError('category');
          }}
          testID="category-picker"
        />
        {errors.category ? (
          <Text style={styles.fieldError} accessibilityRole="alert">
            {errors.category}
          </Text>
        ) : null}

        <ImagePickerField
          label="Foto del problema"
          value={imageUri}
          onPick={handleImagePick}
          onRemove={() => {
            setImageUri(null);
            clearError('image');
          }}
          disabled={submitting || loadingCategories}
          testID="image-picker-field"
        />
        {errors.image ? (
          <Text style={styles.fieldError} accessibilityRole="alert">
            {errors.image}
          </Text>
        ) : null}

        <LocationField
          label="Ubicación"
          value={locationDisplay}
          onPress={handleLocationPress}
          disabled={submitting}
          testID="location-field"
        />
        {errors.location ? (
          <Text style={styles.fieldError} accessibilityRole="alert">
            {errors.location}
          </Text>
        ) : null}

        <LoadingButton
          label="Enviar reporte"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitButton}
          testID="submit-button"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.marginPage,
    paddingTop: Spacing.stackLg,
    paddingBottom: Spacing.stackXl,
  },
  heading: {
    ...Typography.headlineLgMobile,
    color: Colors.onSurface,
    marginBottom: Spacing.stackLg,
  },
  fieldError: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.error,
    marginTop: -Spacing.stackMd + 4,
    marginBottom: Spacing.stackMd,
    marginLeft: 2,
  },
  submitButton: {
    marginTop: Spacing.stackMd,
  },
});
