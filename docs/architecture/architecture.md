# StreetSignal — Arquitectura del Sistema

---

## 1. Visión General de la Arquitectura

El sistema sigue una arquitectura cliente-servidor de tres capas desacoplada: el cliente móvil se comunica exclusivamente a través de una API REST con el backend, que a su vez accede a la capa de datos. Esta separación permite escalar, reemplazar o testear cada capa de forma independiente.

### 1.1 Diagrama 1 — Arquitectura General

El siguiente diagrama corresponde a la arquitectura principal con los 5 componentes principales del sistema.

*Figura 1. Arquitectura general del sistema **StreetSignal** (React Native + .NET 8 + MySQL 8)*

| Componente | Descripción |
|---|---|
| Mobile App (React Native) | Aplicación móvil multiplataforma (Android / iOS). Implementa las vistas para ciudadanos y personal. Se comunica con el backend a través de un `apiClient` basado en `fetch` con soporte JWT. |
| REST API (.NET 8) | Backend construido con ASP.NET Core 8 Web API. Expone endpoints RESTful bajo `/api`. Aplica autenticación JWT Bearer, autorización por roles y gestión global de excepciones. |
| Base de Datos (MySQL 8) | Almacenamiento relacional gestionado a través de Entity Framework Core. Contiene: `Users`, `Reports`, `Categories`, `ReportUpdates`, `Notifications` y `DeviceTokens`. |
| File Storage (disco local) | Imágenes de reportes almacenadas en `wwwroot/uploads/reports/`. Servidas vía URL estática por el middleware de archivos estáticos de ASP.NET. |
| Servicios Externos (opt.) | Geocodificación inversa (Nominatim / Google Maps) y Push Notifications (FCM / APNs) registrando device tokens en base de datos. |

---

## 2. Flujo de Reportes

### 2.2 Diagrama 2 — Flujo de Estados

El siguiente diagrama muestra los seis estados del enum `ReportStatus` y las transiciones posibles entre ellos, los actores involucrados y los eventos generados en cada transición.

*Figura 2. Flujo de estados de un reporte (`ReportStatus` enum) y actores del sistema*

| Estado | Valor (`int`) | Descripción y condiciones |
|---|---|---|
| `Pending` | 0 | Estado inicial al crear el reporte. El ciudadano puede editar título, descripción e imagen mientras el reporte permanezca en este estado. |
| `InReview` | 1 | Staff ha tomado el reporte para evaluación. El ciudadano ya no puede editar. Staff puede agregar comentarios. |
| `Assigned` | 2 | El reporte fue asignado a personal de campo para su atención. Registro de `AssignedToId` en la entidad `Report`. |
| `InProgress` | 3 | Trabajo activo en campo. El staff puede agregar actualizaciones y comentarios. |
| `Resolved` | 4 | Problema solucionado. Estado final exitoso. Se registra el campo `ResolvedAt` con la marca de tiempo UTC. |
| `Rejected` | 5 | Reporte rechazado por Staff o Admin. Estado final negativo. Requiere justificación en mensaje. |

> **Nota:** Cada transición de estado crea automáticamente un registro `ReportUpdate` (`Type = StatusChange`) y una `Notification` para el ciudadano creador del reporte. Los estados `Resolved` y `Rejected` son terminales y no tienen transiciones de salida.

---

## 3. Descripción de Capas

### 3.1 Capa de Presentación — React Native

La aplicación móvil está desarrollada en React Native con TypeScript. No se utiliza Expo; se trabaja con el CLI de React Native puro para tener acceso completo a los módulos nativos.

#### 3.1.1 Estructura de pantallas

- **AuthStack:** `SplashScreen` (restauración de sesión), `LoginScreen`, `RegisterScreen`
- **HomeStack (ciudadano):** `HomeScreen`, `MyReportsScreen`, `ReportDetailScreen`, `CreateReportScreen`
- **StaffStack:** `StaffReportsListScreen`, `StaffReportDetailScreen`
- **AppTabs:** `HomeTab`, `Notifications`, `Profile`, `StaffTab`

#### 3.1.2 Capa de API del cliente

- **`apiClient`:** único cliente `fetch` con soporte JWT, timeout (15 s / 60 s upload), reintento en error de red, manejo de 401.
- **`sessionManager`:** almacén en memoria del JWT y datos del usuario. Notifica desautorización mediante callback.
- **`storageService`:** persistencia en Keychain (iOS) / Keystore (Android) vía `react-native-keychain`.
- **`reportsService`, `authService`, `categoriesService`, `notificationsService`, `imageService`:** servicios específicos por dominio.

#### 3.1.3 Gestión de estado y sesión

No se utiliza Redux ni Context global de datos. El estado de sesión es gestionado por `AuthContext` (React Context). El estado de cada pantalla es local (`useState` / hooks personalizados).

---

### 3.2 Capa de Aplicación — .NET 8 Web API

El backend implementa un patrón de arquitectura en capas: `Controllers → Services → Repositories → Data Context`. Cada capa depende únicamente de la capa inferior mediante interfaces.

#### 3.2.1 Controllers

- **`AuthController`:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
- **`ReportsController`:** `GET /reports/my`, `GET /reports`, `POST /reports`, `GET /reports/{id}`, `PATCH /reports/{id}`, `PATCH /reports/{id}/status`
- **`FilesController`:** `POST /files/upload` (multipart/form-data, hasta 10 MB)
- **`NotificationsController`:** `GET /notifications`, `PATCH /notifications/{id}/read`, `POST /notifications/device-token`

#### 3.2.2 Services

- **`ReportService`:** creación, edición (solo `Pending`), cambio de estado con `ReportUpdate` + `Notification`.
- **`AuthService`:** registro con hash BCrypt, login, generación de JWT.
- **`NotificationService`:** listado paginado, marcado como leído, registro de device token (upsert).
- **`FileService`:** almacenamiento de imagen en `wwwroot/uploads/reports/` con nombre GUID único.
- **`JwtTokenService`:** generación de tokens HS256 con claims de `Id`, `Email`, `Role`; expiración 24 h.

#### 3.2.3 Repositories

Siguen el patrón Repository para abstraer el acceso a EF Core. Cada repositorio expone operaciones específicas de dominio (`ListAsync` con filtros, `GetByIdAsync`, `AddAsync`, `SaveChangesAsync`). Facilita el testing unitario mediante mocks.

#### 3.2.4 Middlewares y Cross-Cutting Concerns

- **`ExceptionHandlingMiddleware`:** captura excepciones y devuelve respuestas JSON estandarizadas.
- **JWT Bearer Authentication:** validación de tokens con parámetros estrictos (issuer, audience, firma, expiración).
- **Autorización por roles:** políticas `StaffOnly`, `CitizenOnly`, `AuthenticatedUser`.
- **Static Files Middleware:** sirve imágenes desde `wwwroot` bajo `/uploads/{filename}`.
- **Swagger / OpenAPI:** interfaz interactiva en `/swagger`. Contrato en `docs/api-contracts/streetsignal-api-contracts.yml`.

---

### 3.3 Capa de Datos

#### 3.3.1 Base de datos relacional (MySQL 8)

| Entidad | Campos principales |
|---|---|
| `User` | `Id` (GUID), `FullName`, `Email` (unique), `Phone`, `PasswordHash`, `Role`, `IsActive`, `CreatedAt` |
| `Report` | `Id`, `Title`, `Description`, `CategoryId`, `ImageUrl`, `Latitude`, `Longitude`, `Address`, `Status`, `Priority`, `CreatedById`, `AssignedToId`, `CreatedAt`, `UpdatedAt`, `ResolvedAt` |
| `Category` | `Id`, `Name` (unique), `Description`, `Icon`, `Color`, `SortOrder`, `IsActive` |
| `ReportUpdate` | `Id`, `ReportId` (cascade), `UserId`, `Type` (System/StatusChange/Comment), `Message`, `OldStatus`, `NewStatus`, `CreatedAt` |
| `Notification` | `Id`, `UserId` (cascade), `ReportId` (SetNull), `Title`, `Message`, `IsRead`, `CreatedAt` |
| `DeviceToken` | `Id`, `UserId` (cascade), `Token` (unique), `Platform` (ios/android), `CreatedAt`, `UpdatedAt` |

---

## 4. Decisiones Técnicas (Architecture Decision Records)

Esta sección documenta las decisiones de diseño más relevantes adoptadas durante el proyecto.

### ADR-001: React Native como framework móvil

| Campo | Detalle |
|---|---|
| Estado | Aceptado |
| Decisión | React Native puro (sin Expo) con TypeScript para el desarrollo móvil. |
| Justificación | Permite compartir ~90% del código entre Android e iOS con acceso nativo completo. CLI puro da control total sobre módulos nativos sin las restricciones del managed workflow de Expo. |
| Alternativas | Flutter (Dart, curva alta), Expo, Kotlin/Swift nativo (doble base de código). |

### ADR-002: .NET 8 Web API como backend

| Campo | Detalle |
|---|---|
| Estado | Aceptado |
| Decisión | ASP.NET Core 8 con arquitectura Controllers / Services / Repositories. |
| Justificación | .NET 8 ofrece alto rendimiento (top 3 TechEmpower), ecosistema eficiente en backend. La arquitectura en capas facilita mantenimiento y testeo. |
| Alternativas | Node.js/Express, FastAPI Python, Spring Boot Java. |

### ADR-003: MySQL 8 con Entity Framework Core

| Campo | Detalle |
|---|---|
| Estado | Aceptado |
| Decisión | Base de datos relacional MySQL 8 gestionada mediante EF Core con `Pomelo.EntityFrameworkCore.MySql`. |
| Justificación | MySQL es ampliamente soportado en hosting económico, gratuito y open source. EF Core reduce el boilerplate SQL y facilita pruebas de integración con SQLite in-memory. |
| Alternativas | PostgreSQL, SQLite, MongoDB. |

### ADR-004: Autenticación JWT Bearer

| Campo | Detalle |
|---|---|
| Estado | Aceptado |
| Decisión | JWT (HS256) con expiración de 24 horas y almacenamiento en Keychain/Keystore en el cliente. |
| Justificación | JWT elimina sesiones en servidor (stateless), es estándar de la industria para APIs REST, y facilita la implementación de roles en claims. Keychain/Keystore protege el token en el dispositivo. |
| Consideraciones | Logout es best-effort (JWT stateless). En producción se recomienda mecanismo de revocación (blacklist en Redis o refresh tokens). |

### ADR-005: Patrón Repository sobre EF Core

| Campo | Detalle |
|---|---|
| Estado | Aceptado |
| Decisión | Interfaces Repository implementadas por clases concretas que encapsulan las consultas EF Core. |
| Justificación | Permite testear servicios con mocks (Moq) sin levantar base de datos. Centraliza consultas complejas. Las pruebas unitarias existentes usan intensivamente este patrón. |

---

## 5. Justificación de Tecnologías

| Categoría | Tecnología | Justificación |
|---|---|---|
| Framework móvil | React Native (TypeScript) | Código compartido Android/iOS, ecosistema maduro, comunidad amplia. |
| Navegación móvil | React Navigation 6 | Estándar de facto en React Native, soporta stack, tab y deep linking. |
| HTTP Client | `fetch` nativo + wrapper propio | Sin dependencias externas, control total sobre timeouts y reintentos. |
| Almacenamiento seguro | `react-native-keychain` | Almacena JWT en Keychain (iOS) / Keystore (Android) de forma cifrada. |
| Backend framework | ASP.NET Core 8 | Alto rendimiento, DI nativa, testing con `WebApplicationFactory`. |
| ORM | Entity Framework Core 8 | LINQ, migraciones, in-memory provider para tests, Pomelo para MySQL. |
| Base de datos | MySQL 8 | Open source, soportado en la mayoría de hosting, ampliamente conocido. |
| Autenticación | JWT HS256 (`Microsoft.IdentityModel`) | Stateless, estándar, soporte nativo en ASP.NET Core. |
| Hash de contraseñas | BCrypt (`IPasswordHasher`) | Hashing con salt y costo adaptativo, resistente a fuerza bruta. |
| Documentación API | Swagger / OpenAPI 3.0 | Documentación interactiva autogenerada desde controladores. |
| Pruebas backend | xUnit + `WebApplicationFactory` | Pruebas unitarias (Moq) y de integración (in-memory DB). |
| Pruebas móvil | Jest + React Native Testing Library | Pruebas unitarias y de componentes, snapshots, mocks nativos. |
| CI/CD | GitHub Actions | Automatización de build y pruebas en cada push/PR. |
| Geocodificación | Nominatim API (opcional) | Conversión gratuita de coordenadas a dirección legible. |
| Push Notifications | FCM + APNs (opcional) | Firebase Cloud Messaging (Android) y Apple Push Notification (iOS). |
| Diagramas | Draw.io (app.diagrams.net) | Herramienta gratuita, formato XML abierto, editable en navegador y VSCode. |

---

## 6. Referencias

- Microsoft Corporation. (2024). *ASP.NET Core documentation*. https://docs.microsoft.com/aspnet/core
- Microsoft Corporation. (2024). *Entity Framework Core documentation*. https://docs.microsoft.com/ef/core
- Meta Platforms, Inc. (2024). *React Native documentation*. https://reactnative.dev/docs/getting-started
- Jones, J. E. (2023). *JSON Web Token (JWT)* [RFC 7519]. IETF. https://datatracker.ietf.org/doc/html/rfc7519
- OpenAPI Initiative. (2023). *OpenAPI Specification 3.0*. https://spec.openapis.org/oas/v3.0.3
- Pomelo Foundation. (2024). *Pomelo.EntityFrameworkCore.MySql*. https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql
- Google. (2024). *Firebase Cloud Messaging documentation*. https://firebase.google.com/docs/cloud-messaging
- Apple Inc. (2024). *Apple Push Notification service documentation*. https://developer.apple.com/documentation/usernotifications
- JGraph Ltd. (2024). *draw.io / diagrams.net*. https://www.diagrams.net
- OpenStreetMap Contributors. (2024). *Nominatim geocoding service*. https://nominatim.org
- Beck, K., & Gamma, E. (1994). *Design patterns: Elements of reusable object-oriented software*. Addison-Wesley.
- Fowler, M. (2002). *Patterns of enterprise application architecture*. Addison-Wesley.

---

*StreetSignal — Arquitectura v1.0 | Junio 2026*
