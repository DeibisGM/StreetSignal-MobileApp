# StreetSignal Mobile App

StreetSignal mobile application for citizen reports, case tracking, and real-time notifications.

## Research Explanation Video

Add the link to the research explanation video here:

```text
Research explanation video: https://youtu.be/d3n7BB6u0kg
```

This video explains the research process, the problem addressed by StreetSignal, the proposed solution, and the main findings that support the development of the mobile application.

This repository contains the mobile app built with `React Native`. The backend lives in a separate StreetSignal service and must be available for login, reports, and notifications to work correctly.

## What This Repository Includes

* Mobile app for citizens and officials.
* Navigation using stacks and tabs.
* Login, registration, and session management.
* Creation, consultation, and tracking of reports.
* In-app notification list.
* Device token registration for push notifications.
* Local notifications with `Notifee`.

## Prerequisites

Install the following before trying to run the project:

* `Node.js` 22 or higher.
* `npm`.
* `Java JDK 17`.
* `Android Studio` with Android SDK, platform tools, and a configured emulator.
* `adb` available in the PATH.
* For iPhone/iOS: `Xcode` and `CocoaPods`, only on macOS.
* A StreetSignal backend running and accessible from the device or emulator.
* A Firebase account configured for Android push notifications.

## Quick Structure

```text
/
├── README.md
├── docs/
│   └── api-contracts/        API contracts and supporting resources
└── app/
    ├── android/              Native Android project
    ├── ios/                  Native iOS project
    ├── src/                  Main app source code
    ├── package.json          Scripts and dependencies
    ├── .env                  Optional environment variables
    └── .env.example          Configuration example
```

## Before Starting with Notifications

For notifications to work, these 3 requirements must be met:

1. The app must be able to reach the backend.
2. The device must register its token through `POST /device-tokens`.
3. The backend must send push notifications using that token.

Additionally, on Android, the following is required:

* The file `app/android/app/google-services.json`.
* Notification permissions on Android 13+.
* Ideally, push notifications should be tested on a real device. Local notifications can be seen on an emulator, but FCM push notifications are more reliable on a real phone.

## Backend Configuration

The app consumes the StreetSignal backend through `BASE_URL`.

### Default URL

If no changes are made, the app uses the URL defined in `app/src/constants/index.ts`.

### Recommended Option for Development

If the backend is running locally:

* Android emulator: use `adb reverse tcp:5000 tcp:5000` or configure the computer’s IP address.
* iOS simulator: `http://localhost:5000/api`.
* Physical device: use the computer’s LAN IP address, for example `http://192.168.1.20:5000/api`.

### Optional Environment Variables

The repository includes `app/.env.example` and `app/.env`, but the app is a `bare React Native` project and does not read those variables automatically unless a loader such as `react-native-dotenv` is configured.

If you want to use `.env` with `EXPO_PUBLIC_API_URL`, you must:

1. Install the environment variable plugin you want to use.
2. Configure it in `babel.config.js`.
3. Restart Metro.

If you do not want to edit that, leave the default URL in `app/src/constants/index.ts`.

## Firebase Configuration for Push Notifications

This project already includes native support for Firebase Messaging on Android:

* `@react-native-firebase/app`
* `@react-native-firebase/messaging`
* `Notifee` to display local notifications

### Required Files

* `app/android/app/google-services.json`

This file already exists in this repository. If you clone the project on another machine, verify that it is still inside `app/android/app/`. If it is not found, register the app in Firebase, download the file, and then add it to that path.

### Gradle

Android is already prepared to apply the Google Services plugin from:

* `app/android/build.gradle`
* `app/android/app/build.gradle`

There is no need to edit this for normal development.

## How to Install and Run

### 1. Go to the App Folder

```bash
cd app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Backend

Before opening the app, make sure the StreetSignal backend is running and responding at the URL the app will use.

If the backend exposes `http://localhost:5000/api`, then:

* on the Android emulator, run `adb reverse tcp:5000 tcp:5000` or change the backend IP;
* on a physical phone, use the real IP address of your PC, or simply use localhost if the computer IP does not work.

### 4. Start Metro

```bash
npm start
```

### 5. Run Android

In another terminal, from `app/`:

```bash
npm run android
```

## How to Run on iPhone / iOS

This only applies on macOS:

```bash
cd app/ios
pod install
cd ..
npm start
```

In another terminal:

```bash
npm run ios
```

## Test Credentials

Once the backend is available:

| Role     | Email                                               | Password |
| -------- | --------------------------------------------------- | -------- |
| Citizen  | [ciudadano@test.com](mailto:ciudadano@test.com)     | 123456   |
| Official | [funcionario@test.com](mailto:funcionario@test.com) | 123456   |

## How Notifications Work

The app has two notification layers:

### 1. Device Token Registration

After a real login, the app:

1. asks for notification permission;
2. gets the device’s FCM token;
3. registers that token in the backend using `POST /device-tokens`.

This is implemented in:

* `app/src/services/notificationService.ts`
* `app/src/navigation/RootNavigator.tsx`
* `app/src/api/notificationsService.ts`

### 2. Local Notifications Inside the App

While the user is authenticated and the app is active, the app checks for unread notifications every 60 seconds.

If it finds new notifications:

* it saves them as known notifications for that user;
* it shows a local notification with `Notifee`.

This means that:

* even if backend push notifications take longer, the user can still see alerts inside the app;
* for real background push notifications, the backend must send FCM notifications.

## Recommended Flow to Test Notifications

1. Start the backend.
2. Start Metro with `npm start`.
3. Run the app on Android.
4. Log in with a valid account.
5. Accept the notification permission.
6. Verify that the backend receives the device token.
7. Generate a new notification from the backend or through the report flow.
8. Leave the app open to see polling and the local notification.
9. To validate real push notifications, also test on a physical phone.

## Troubleshooting

### The App Does Not Connect to the Backend

* Verify that the backend is running.
* Check the URL used by the app.
* On the Android emulator, try `adb reverse tcp:5000 tcp:5000`.
* On a physical device, use the LAN IP address of your computer. Sometimes the device does not recognize the computer’s IP, but localhost works; other times localhost does not work and the computer’s IP does.

### Notifications Do Not Arrive

* Confirm that the user logged in.
* Check that the notification permission was accepted.
* Verify that `google-services.json` exists.
* Confirm that the backend is saving the token in `/device-tokens`.
* Confirm that the backend is actually sending push notifications through FCM.

### I See Notifications in the App, but Not Background Push Notifications

This usually means that polling is working, but the backend or Firebase is not yet sending real push notifications.

### Android 13 or Higher Does Not Show Alerts

* Verify the `POST_NOTIFICATIONS` permission.
* Reinstall the app if you had already denied the permission and want to test again from scratch.

## Available Scripts

From `app/`:

```bash
npm start     # Metro bundler
npm run android
npm run ios
npm run web
npm run lint
npm test
```

## Code Structure

```text
app/src/
├── api/           HTTP client and domain services
├── components/    Reusable components
├── constants/     URLs, statuses, and storage keys
├── features/      Screens by module
├── hooks/         Custom hooks
├── navigation/    Navigation and auth
├── services/      Notification services and other flows
├── storage/       Local persistence
└── utils/         Helpers
```

## Notes

* The app is not Expo; it is `bare React Native`.
* Token registration only happens after a real login.
* To review the available endpoints, check `docs/api-contracts/streetsignal-api-contracts.yml`.