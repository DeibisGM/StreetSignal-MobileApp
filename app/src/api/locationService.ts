import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_CACHE_KEY = '@streetsignal/location_cache';
const LOCATION_CACHE_TTL_MS = 2 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

export interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationCache {
  coords: Coordinates;
  address?: string | null;
  savedAt: number;
}

let mockCoords: Coordinates | null | undefined;

function withTimeout<T>(promise: Promise<T>, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    promise.then(
      value => {
        clearTimeout(timer);
        resolve(value);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function readCache(): Promise<LocationCache | null> {
  const raw = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LocationCache;
  } catch {
    return null;
  }
}

async function writeCache(cache: LocationCache): Promise<void> {
  await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cache));
}

function isCacheFresh(cache: LocationCache | null): boolean {
  if (!cache) {
    return false;
  }

  return Date.now() - cache.savedAt <= LOCATION_CACHE_TTL_MS;
}

function showPermissionDeniedAlert(): void {
  Alert.alert(
    'Permiso requerido',
    'Necesitamos acceso a tu ubicacion para obtener el reporte.',
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

function formatApproximateAddress(address: {
  road?: string;
  pedestrian?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
}): string | null {
  const locality =
    address.city ??
    address.town ??
    address.village ??
    address.county ??
    address.state ??
    address.country ??
    null;

  const street =
    address.road ?? address.pedestrian ?? address.neighbourhood ?? address.suburb ?? null;

  if (street && locality) {
    return `${street}, ${locality}`;
  }

  if (street) {
    return street;
  }

  return locality;
}

function formatCoordinateFallback(coords: Coordinates): string {
  return `Ubicacion aproximada: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
}

async function requestAndroidLocationPermission(): Promise<boolean> {
  const permission = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  const result = await PermissionsAndroid.request(permission);

  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }

  showPermissionDeniedAlert();
  return false;
}

function getGeolocationApi():
  | {
      getCurrentPosition: (
        success: (position: {
          coords: {latitude: number; longitude: number};
        }) => void,
        error?: (err: {code?: number; message?: string}) => void,
        options?: {
          enableHighAccuracy?: boolean;
          timeout?: number;
          maximumAge?: number;
        },
      ) => void;
    }
  | null {
  if (Platform.OS === 'web') {
    const geolocation = globalThis.navigator?.geolocation;
    return geolocation?.getCurrentPosition ? geolocation : null;
  }

  try {
    const module = require('react-native-geolocation-service') as {
      default?: {
        getCurrentPosition: (
          success: (position: {
            coords: {latitude: number; longitude: number};
          }) => void,
          error?: (err: {code?: number; message?: string}) => void,
          options?: {
            enableHighAccuracy?: boolean;
            timeout?: number;
            maximumAge?: number;
          },
        ) => void;
      };
      getCurrentPosition?: (
        success: (position: {
          coords: {latitude: number; longitude: number};
        }) => void,
        error?: (err: {code?: number; message?: string}) => void,
        options?: {
          enableHighAccuracy?: boolean;
          timeout?: number;
          maximumAge?: number;
        },
      ) => void;
    };

    return module.default ?? module ?? null;
  } catch {
    return null;
  }
}

async function getBrowserOrNativeCoords(): Promise<Coordinates | null> {
  const geolocation = getGeolocationApi();

  if (!geolocation?.getCurrentPosition) {
    return null;
  }

  return withTimeout(
    new Promise<Coordinates | null>(resolve => {
      geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        error => {
          if (error?.code === 1) {
            showPermissionDeniedAlert();
          }
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: REQUEST_TIMEOUT_MS,
          maximumAge: LOCATION_CACHE_TTL_MS,
        },
      );
    }),
  );
}

export function setMockCurrentCoordsForTests(coords: Coordinates | null): void {
  mockCoords = coords;
}

export function clearMockCurrentCoordsForTests(): void {
  mockCoords = undefined;
}

export async function getCurrentCoords(): Promise<Coordinates | null> {
  if (mockCoords !== undefined) {
    return mockCoords;
  }

  const cache = await readCache();
  if (isCacheFresh(cache)) {
    return cache.coords;
  }

  if (Platform.OS === 'android') {
    const allowed = await requestAndroidLocationPermission();
    if (!allowed) {
      return null;
    }
  }

  const coords = await getBrowserOrNativeCoords();
  if (coords) {
    await writeCache({coords, address: cache?.address ?? undefined, savedAt: Date.now()});
  }

  return coords;
}

export async function reverseGeocode(coords: Coordinates): Promise<string | null> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18` +
    `&lat=${encodeURIComponent(String(coords.lat))}` +
    `&lon=${encodeURIComponent(String(coords.lng))}`;

  try {
    const response = await withTimeout(
      fetch(url, {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'es',
          'User-Agent': 'StreetSignal-MobileApp/1.0',
        },
      }),
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      display_name?: string;
      address?: {
        road?: string;
        pedestrian?: string;
        neighbourhood?: string;
        suburb?: string;
        city?: string;
        town?: string;
        village?: string;
        county?: string;
        state?: string;
        country?: string;
      };
    };
    const address =
      data.display_name?.trim() ||
      (data.address ? formatApproximateAddress(data.address) : null);

    if (address) {
      await writeCache({
        coords,
        address,
        savedAt: Date.now(),
      });
    }

    return address ?? formatCoordinateFallback(coords);
  } catch {
    return formatCoordinateFallback(coords);
  }
}
