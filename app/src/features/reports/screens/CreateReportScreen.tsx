import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

import {AppTextInput} from '../../../components/AppTextInput';
import {CategoryPicker} from '../../../components/CategoryPicker';
import {ImagePickerField} from '../../../components/ImagePickerField';
import {LoadingButton} from '../../../components/LoadingButton';
import {LocationField} from '../../../components/LocationField';
import {SuccessToast} from '../../../components/SuccessToast';
import {categoriesService} from '../../../api/categoriesService';
import {
  captureFromCamera,
  pickFromGallery,
  uploadReportImage,
  type ImageAsset,
} from '../../../api/imageService';
import {getCurrentCoords, reverseGeocode} from '../../../api/locationService';
import {reportsService} from '../../../api/reportsService';
import {storageService, STORAGE_KEYS} from '../../../storage/storageService';
import type {ReportDraft} from '../../../storage/storageService';
import {ApiError} from '../../../api/types';
import {Colors, Spacing} from '../../../theme';
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
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageAsset, setImageAsset] = useState<ImageAsset | null>(null);
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const submittingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let mounted = true;

    (async () => {
      setLoadingCategories(true);
      try {
        const cats = await categoriesService.getCategories();
        if (mounted) {
          setCategories(cats);
        }
      } catch {
        // Non-blocking: picker renders empty until categories load
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
        // Ignore and start with an empty form
      }
    })();

    void captureLocation();

    return () => {
      mounted = false;
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!title && !description && !categoryId && !imageUri) {
      return;
    }

    const draft: ReportDraft = {
      title,
      description,
      categoryId: categoryId ?? '',
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
      errs.title = 'El titulo debe tener al menos 5 caracteres.';
    }
    if (description.trim().length < 10) {
      errs.description = 'La descripcion debe tener al menos 10 caracteres.';
    }
    if (categoryId === null) {
      errs.category = 'Selecciona una categoria.';
    }
    if (location === null) {
      errs.location = 'Obtén tu ubicacion para continuar.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function captureLocation() {
    if (locationLoading) {
      return;
    }

    setLocationLoading(true);
    setLocationMessage(null);
    setErrors(prev => {
      if (!prev.location) {
        return prev;
      }
      const next = {...prev};
      delete next.location;
      return next;
    });

    try {
      const coords = await getCurrentCoords();
      if (!mountedRef.current) {
        return;
      }

      if (!coords) {
        setLocation(null);
        setLocationMessage(null);
        setErrors(prev => ({
          ...prev,
          location: 'No se pudo obtener tu ubicacion. Toca Reintentar.',
        }));
        return;
      }

      const address = await reverseGeocode(coords);
      if (!mountedRef.current) {
        return;
      }

      setLocation({
        latitude: coords.lat,
        longitude: coords.lng,
        address: address ?? undefined,
      });

      if (!address) {
        setLocationMessage(
          'No pudimos obtener la direccion aproximada. Se guardaran solo las coordenadas.',
        );
      } else {
        setLocationMessage(null);
      }
    } catch {
      if (!mountedRef.current) {
        return;
      }

      setLocation(null);
      setLocationMessage(null);
      setErrors(prev => ({
        ...prev,
        location: 'No se pudo obtener tu ubicacion. Toca Reintentar.',
      }));
    } finally {
      if (mountedRef.current) {
        setLocationLoading(false);
      }
    }
  }

  function handleImagePick() {
    Alert.alert('Agregar foto', 'Selecciona el origen de la imagen', [
      {
        text: 'Galeria',
        onPress: () => {
          pickFromGallery().then(asset => {
            if (asset) {
              setImageAsset(asset);
              setImageUri(asset.uri);
              clearError('image');
            }
          });
        },
      },
      {
        text: 'Camara',
        onPress: () => {
          captureFromCamera().then(asset => {
            if (asset) {
              setImageAsset(asset);
              setImageUri(asset.uri);
              clearError('image');
            }
          });
        },
      },
      {text: 'Cancelar', style: 'cancel'},
    ]);
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
      const uploadedImageUrl =
        imageAsset !== null
          ? await uploadReportImage(imageAsset)
          : imageUri?.startsWith('http')
            ? imageUri
            : undefined;

      await reportsService.createReport({
        title: title.trim(),
        description: description.trim(),
        categoryId: categoryId!,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        address: location?.address ?? undefined,
        imageUrl: uploadedImageUrl,
      });

      await storageService.removeItem(STORAGE_KEYS.REPORT_DRAFT);

      setTitle('');
      setDescription('');
      setCategoryId(null);
      setImageUri(null);
      setImageAsset(null);
      setLocation(null);
      setLocationMessage(null);
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
        Alert.alert(
          'Sin conexión',
          'Verifica tu conexión e intenta nuevamente.',
        );
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const locationDisplay = location
    ? `${location.address ? `${location.address}\n` : ''}${location.latitude.toFixed(
        5,
      )}, ${location.longitude.toFixed(5)}`
    : locationLoading
      ? 'Obteniendo ubicacion...'
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
        <AppTextInput
          label="Titulo"
          placeholder="¿Que problema detectaste?"
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
          label="Descripcion"
          placeholder="Describe el problema con mas detalle..."
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
          label="Categoria"
          categories={categories}
          selectedId={categoryId}
          loading={loadingCategories}
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
          label="Foto del problema (opcional)"
          value={imageUri}
          onPick={handleImagePick}
          onRemove={() => {
            setImageUri(null);
            setImageAsset(null);
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
          label="Ubicacion"
          value={locationDisplay}
          onPress={() => {
            void captureLocation();
          }}
          disabled={submitting || loadingCategories || locationLoading}
          testID="location-field"
        />
        {locationMessage ? (
          <Text style={styles.locationMessage}>{locationMessage}</Text>
        ) : null}
        {errors.location ? (
          <View style={styles.locationErrorRow}>
            <Text style={styles.fieldError} accessibilityRole="alert">
              {errors.location}
            </Text>
            <TouchableOpacity
              onPress={() => {
                void captureLocation();
              }}
              accessibilityRole="button"
              accessibilityLabel="Reintentar ubicación"
              testID="location-retry">
              <Text style={styles.locationRetry}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        <LoadingButton
          label="Enviar reporte"
          onPress={handleSubmit}
          loading={submitting}
          testID="submit-button"
        />
      </View>
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
    paddingBottom: Spacing.stackLg,
  },
  fieldError: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.error,
    marginTop: -Spacing.stackMd + 4,
    marginBottom: Spacing.stackMd,
    marginLeft: 2,
  },
  locationMessage: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.onSurfaceVariant,
    marginTop: -Spacing.stackMd + 4,
    marginBottom: Spacing.stackMd,
    marginLeft: 2,
  },
  locationErrorRow: {
    marginTop: -Spacing.stackMd + 4,
    marginBottom: Spacing.stackMd,
  },
  locationRetry: {
    marginLeft: 2,
    marginTop: -8,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: Spacing.marginPage,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
});
