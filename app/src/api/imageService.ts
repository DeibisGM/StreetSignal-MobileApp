import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';

import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export interface ImageAsset {
  uri: string;
  fileName?: string | null;
  type?: string | null;
  fileSize?: number | null;
  file?: any;
}

interface PickerResponse {
  assets?: Array<{
    uri?: string | null;
    fileName?: string | null;
    type?: string | null;
    fileSize?: number | null;
  }>;
  didCancel?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

interface FileUploadResponse {
  fileUrl: string;
}

function getExtensionFromMimeType(type?: string | null): string {
  if (type === 'image/png') {
    return '.png';
  }
  return '.jpg';
}

function showPermissionDeniedAlert() {
  Alert.alert(
    'Permiso requerido',
    'Necesitamos acceso a la cámara o a la galería para adjuntar una imagen.',
    [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Open settings',
        onPress: () => {
          Linking.openSettings().catch(() => {});
        },
      },
    ],
  );
}

function showInvalidImageAlert(message: string) {
  Alert.alert('Imagen no válida', message);
}

async function ensureNativePermission(source: 'gallery' | 'camera'): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permission =
    source === 'camera'
      ? PermissionsAndroid.PERMISSIONS.CAMERA
      : PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES ??
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

  const result = await PermissionsAndroid.request(permission);

  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }

  showPermissionDeniedAlert();
  return false;
}

function validateImageAsset(asset: ImageAsset): boolean {
  const type = asset.type?.toLowerCase();
  if (!type || !ALLOWED_MIME_TYPES.has(type)) {
    showInvalidImageAlert('Solo se permiten imágenes JPG o PNG.');
    return false;
  }

  if (asset.fileSize && asset.fileSize > MAX_SIZE_BYTES) {
    showInvalidImageAlert('La imagen debe pesar menos de 5 MB.');
    return false;
  }

  return true;
}

async function pickFromNative(source: 'gallery' | 'camera'): Promise<ImageAsset | null> {
  const allowed = await ensureNativePermission(source);
  if (!allowed) {
    return null;
  }

  const picker = require('react-native-image-picker') as {
    launchImageLibrary: (options: unknown) => Promise<PickerResponse>;
    launchCamera: (options: unknown) => Promise<PickerResponse>;
  };
  const options =
    source === 'camera'
      ? {mediaType: 'photo', saveToPhotos: false}
      : {mediaType: 'photo', selectionLimit: 1};

  const response: PickerResponse =
    source === 'camera'
      ? await picker.launchCamera(options)
      : await picker.launchImageLibrary(options);

  if (response.errorCode === 'permission') {
    showPermissionDeniedAlert();
    return null;
  }

  if (response.didCancel || !response.assets?.length) {
    return null;
  }

  const raw = response.assets[0];
  if (!raw.uri) {
    return null;
  }

  const asset: ImageAsset = {
    uri: raw.uri,
    fileName: raw.fileName,
    type: raw.type,
    fileSize: raw.fileSize,
  };

  return validateImageAsset(asset) ? asset : null;
}

function pickFromWeb(capture: boolean): Promise<ImageAsset | null> {
  return new Promise(resolve => {
    const doc = globalThis as any;
    const input = doc.document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (capture) {
      input.setAttribute('capture', 'environment');
    }

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const asset: ImageAsset = {
        uri: doc.URL.createObjectURL(file),
        fileName: file.name,
        type: file.type,
        fileSize: file.size,
        file,
      };

      resolve(validateImageAsset(asset) ? asset : null);
    };

    input.click();
  });
}

export async function pickFromGallery(): Promise<ImageAsset | null> {
  if (Platform.OS === 'web') {
    return pickFromWeb(false);
  }

  return pickFromNative('gallery');
}

export async function captureFromCamera(): Promise<ImageAsset | null> {
  if (Platform.OS === 'web') {
    return pickFromWeb(true);
  }

  return pickFromNative('camera');
}

export async function uploadReportImage(asset: ImageAsset): Promise<string> {
  if (!validateImageAsset(asset)) {
    throw new Error('Invalid image asset.');
  }

  const formData = new FormData();
  const fileName =
    asset.fileName?.trim() ||
    `report-image-${Date.now()}${getExtensionFromMimeType(asset.type)}`;
  const type = asset.type?.trim() || 'image/jpeg';

  if (asset.file) {
    (formData as any).append('file', asset.file, fileName);
  } else {
    (formData as any).append(
      'file',
      {
        uri: asset.uri,
        name: fileName,
        type,
      } as unknown as Blob,
    );
  }

  const response = await apiClient.postForm<FileUploadResponse>(
    ENDPOINTS.files.upload,
    formData,
  );
  return response.fileUrl;
}
