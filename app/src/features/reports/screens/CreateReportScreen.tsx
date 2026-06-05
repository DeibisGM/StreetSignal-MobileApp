import React, {useEffect, useRef, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
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
import {captureFromCamera, pickFromGallery, uploadReportImage, type ImageAsset} from '../../../api/imageService';
import {reportsService} from '../../../api/reportsService';
import {storageService, STORAGE_KEYS} from '../../../storage/storageService';
import type {ReportDraft} from '../../../storage/storageService';
import {ApiError} from '../../../api/types';
import {Colors, Spacing} from '../../../theme';
import {useLanguage} from '../../../i18n';
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
  const {t} = useLanguage();
  const cr = t.reports.create;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageAsset, setImageAsset] = useState<ImageAsset | null>(null);
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
      errs.title = cr.errors.titleTooShort;
    }
    if (description.trim().length < 10) {
      errs.description = cr.errors.descriptionTooShort;
    }
    if (categoryId === null) {
      errs.category = cr.errors.categoryRequired;
    }
    // Image and location are optional.
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleImagePick() {
    Alert.alert(cr.addPhotoTitle, cr.addPhotoMessage, [
      {
        text: cr.gallery,
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
        text: cr.camera,
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
      {text: cr.cancel, style: 'cancel'},
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
      await storageService.removeItem(STORAGE_KEYS.STAFF_REPORTS_CACHE);

      setTitle('');
      setDescription('');
      setCategoryId(null);
      setImageUri(null);
      setImageAsset(null);
      setLocation(null);
      setErrors({});
      setToastMessage(cr.success);

      setTimeout(() => {
        navigation.navigate('HomeTab', {screen: 'Home'});
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          Alert.alert(cr.errors.sessionExpiredTitle, cr.errors.sessionExpiredMsg);
        } else if (err.statusCode === 400) {
          Alert.alert(cr.errors.invalidDataTitle, err.message || cr.errors.invalidDataMsg);
        } else {
          Alert.alert(cr.errors.errorTitle, err.message || cr.errors.sendError);
        }
      } else {
        Alert.alert(cr.errors.noConnectionTitle, cr.errors.noConnectionMsg);
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

        <AppTextInput
          label={cr.titleLabel}
          placeholder={cr.titlePlaceholder}
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
          label={cr.descriptionLabel}
          placeholder={cr.descriptionPlaceholder}
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
          label={cr.categoryLabel}
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
          label={cr.photoLabel}
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
          label={cr.locationLabel}
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
      </ScrollView>

      {/* Fixed footer */}
      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        <LoadingButton
          label={cr.submitButton}
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
  footer: {
    paddingHorizontal: Spacing.marginPage,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
});
