export type Language = 'es' | 'en';

const esTerms = `1. Uso del servicio

StreetSignal es una plataforma ciudadana para reportar incidencias en el espacio público. Al crear una cuenta y usar la aplicación aceptas utilizarla de forma responsable y exclusivamente para reportar situaciones reales que afecten a la comunidad.

2. Información que proporcionas

Los reportes que envíes quedan registrados y son visibles para las autoridades municipales correspondientes. No incluyas datos personales sensibles (como números de documento, datos bancarios o información médica) en las descripciones de tus reportes o fotografías.

3. Privacidad y datos personales

Almacenamos tu nombre, dirección de correo electrónico y los reportes que creas para brindarte el servicio. No compartimos tu información personal con terceros sin tu consentimiento explícito, salvo cuando sea requerido por ley.

4. Conducta del usuario

Queda estrictamente prohibido usar StreetSignal para enviar reportes falsos, contenido ofensivo, spam o cualquier información que pueda perjudicar a otras personas. El incumplimiento puede resultar en la suspensión permanente de tu cuenta.

5. Responsabilidad

StreetSignal actúa como intermediario entre ciudadanos y autoridades. No garantizamos que todos los reportes sean atendidos en un plazo determinado, ya que la gestión depende de cada municipio.

6. Modificaciones

Podemos actualizar estos términos en cualquier momento. Te notificaremos en la aplicación cuando haya cambios relevantes. El uso continuado de la app tras la notificación implica tu aceptación de los nuevos términos.

Última actualización: junio 2025`;

const enTerms = `1. Service use

StreetSignal is a citizen platform for reporting incidents in public spaces. By creating an account and using the app you agree to use it responsibly and exclusively to report real situations that affect the community.

2. Information you provide

The reports you submit are recorded and visible to the relevant municipal authorities. Do not include sensitive personal data (such as ID numbers, bank details or medical information) in report descriptions or photos.

3. Privacy and personal data

We store your name, email address and the reports you create in order to provide the service. We do not share your personal information with third parties without your explicit consent, except when required by law.

4. User conduct

Using StreetSignal to submit false reports, offensive content, spam or any information that could harm others is strictly prohibited. Non-compliance may result in the permanent suspension of your account.

5. Responsibility

StreetSignal acts as an intermediary between citizens and authorities. We do not guarantee that all reports will be addressed within a specific timeframe, as management depends on each municipality.

6. Modifications

We may update these terms at any time. We will notify you in the app when there are relevant changes. Continued use of the app after notification implies your acceptance of the new terms.

Last updated: June 2025`;

export const translations = {
  es: {
    dateLocale: 'es-CR',
    common: {
      appName: 'StreetSignal',
      tagline: 'Plataforma de Reportes Ciudadanos',
      loading: 'Cargando...',
      retry: 'Reintentar',
      cancel: 'Cancelar',
      close: 'Cerrar',
    },
    statusLabels: {
      Pending: 'Pendiente',
      InReview: 'En revisión',
      Assigned: 'Asignado',
      InProgress: 'En proceso',
      Resolved: 'Resuelto',
      Rejected: 'Rechazado',
    },
    auth: {
      login: {
        title: 'Iniciar sesión',
        subtitle: 'Ingresa tus credenciales para continuar',
        emailLabel: 'Correo electrónico',
        emailPlaceholder: 'correo@ejemplo.com',
        passwordLabel: 'Contraseña',
        passwordPlaceholder: 'Mínimo 6 caracteres',
        showPassword: 'Ver',
        hidePassword: 'Ocultar',
        submitButton: 'Iniciar sesión',
        noAccount: '¿No tienes cuenta? ',
        register: 'Regístrate',
      },
      register: {
        title: 'Crear cuenta',
        subtitle: 'Completa los datos para registrarte',
        fullNameLabel: 'Nombre completo',
        fullNamePlaceholder: 'Tu nombre completo',
        emailLabel: 'Correo electrónico',
        emailPlaceholder: 'correo@ejemplo.com',
        passwordLabel: 'Contraseña',
        passwordPlaceholder: 'Mínimo 6 caracteres',
        confirmPasswordLabel: 'Confirmar contraseña',
        confirmPasswordPlaceholder: 'Repite tu contraseña',
        passwordsMatch: 'Las contraseñas coinciden',
        showPassword: 'Ver',
        hidePassword: 'Ocultar',
        submitButton: 'Crear cuenta',
        hasAccount: '¿Ya tienes cuenta? ',
        login: 'Inicia sesión',
        strengthWeak: 'Débil',
        strengthMedium: 'Media',
        strengthStrong: 'Fuerte',
      },
      errors: {
        noInternet: 'Sin conexión a internet. Verifica tu red e intenta de nuevo.',
        invalidCredentials: 'Credenciales incorrectas. Verifica tu correo y contraseña.',
        emailInUse: 'Este correo ya está en uso. Prueba con otro o inicia sesión.',
        serverError: 'Error en el servidor. Intenta de nuevo en unos momentos.',
        unexpected: 'Ocurrió un error inesperado. Intenta de nuevo.',
      },
      validation: {
        nameRequired: 'El nombre es obligatorio',
        nameTooShort: 'El nombre debe tener al menos 3 caracteres',
        emailRequired: 'El correo es obligatorio',
        emailInvalid: 'Ingresa un correo con formato válido',
        passwordRequired: 'La contraseña es obligatoria',
        passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
        confirmPasswordRequired: 'Confirma tu contraseña',
        passwordsMismatch: 'Las contraseñas no coinciden',
      },
    },
    navigation: {
      home: 'Inicio',
      alerts: 'Alertas',
      profile: 'Perfil',
      exit: 'Salir',
      reports: 'Reportes',
      detail: 'Detalle',
      myReports: 'Mis reportes',
      reportDetail: 'Detalle del reporte',
      newReport: 'Nuevo reporte',
      signOut: {
        confirmTitle: '¿Cerrar sesión?',
        confirmMessage: 'Tu sesión actual se cerrará.',
        cancel: 'Cancelar',
        confirm: 'Cerrar sesión',
        accessibilityLabel: 'Cerrar sesión',
      },
    },
    home: {
      defaultGreeting: 'ciudadano',
      notificationsA11y: 'Notificaciones',
      newReportTitle: 'Nuevo reporte',
      newReportSub: 'Foto · Categoría · Ubicación',
      newReportA11y: 'Crear nuevo reporte',
      myReports: 'Mis reportes',
      loadingReports: 'Cargando tus reportes...',
      loadError: 'No se pudieron cargar tus reportes.',
      emptyTitle: 'Aún no tienes reportes',
      emptySub: 'Cuando crees un reporte aparecerá aquí con su estado actualizado.',
      createFirst: 'Crear mi primer reporte',
    },
    reports: {
      myReports: {
        title: 'Mis reportes',
        subtitle: 'Revisa el estado actual y el historial de cada reporte.',
        loading: 'Cargando tus reportes...',
        loadError: 'No se pudieron cargar tus reportes.',
        emptyTitle: 'Todavía no tienes reportes.',
        emptySub: 'Cuando envíes uno, aparecerá aquí con su estado e historial.',
        retryA11y: 'Reintentar carga de mis reportes',
        retry: 'Reintentar',
      },
      detail: {
        loading: 'Cargando reporte...',
        loadError: 'No se pudo cargar el detalle del reporte.',
        retry: 'Reintentar',
        photoA11y: 'Foto del reporte',
        photoError: 'No se pudo cargar la imagen',
        noPhoto: 'Sin foto',
        createdBy: 'Reporte creado por',
        currentStatus: 'Estado actual',
        history: 'Historial',
        noUpdates: 'Todavía no hay actualizaciones registradas.',
      },
      create: {
        titleLabel: 'Título',
        titlePlaceholder: '¿Qué problema detectaste?',
        descriptionLabel: 'Descripción',
        descriptionPlaceholder: 'Describe el problema con más detalle...',
        categoryLabel: 'Categoría',
        photoLabel: 'Foto del problema (opcional)',
        locationLabel: 'Ubicación (opcional)',
        submitButton: 'Enviar reporte',
        addPhotoTitle: 'Agregar foto',
        addPhotoMessage: 'Selecciona el origen de la imagen',
        gallery: 'Galería',
        camera: 'Cámara',
        cancel: 'Cancelar',
        success: '¡Reporte enviado con éxito!',
        errors: {
          titleTooShort: 'El título debe tener al menos 5 caracteres.',
          descriptionTooShort: 'La descripción debe tener al menos 10 caracteres.',
          categoryRequired: 'Selecciona una categoría.',
          sessionExpiredTitle: 'Sesión expirada',
          sessionExpiredMsg: 'Tu sesión ha caducado. Inicia sesión nuevamente.',
          invalidDataTitle: 'Datos inválidos',
          invalidDataMsg: 'Revisa el formulario e intenta nuevamente.',
          errorTitle: 'Error',
          sendError: 'No se pudo enviar el reporte.',
          noConnectionTitle: 'Sin conexión',
          noConnectionMsg: 'Verifica tu conexión e intenta nuevamente.',
        },
      },
      card: {
        withLocation: 'Con ubicación',
        photoA11y: 'Foto del reporte',
      },
    },
    staff: {
      list: {
        title: 'Todos los reportes',
        subtitle: 'Cola de revisión · Usa los filtros para acotar la lista.',
        searchLabel: 'Buscar por título',
        searchPlaceholder: 'Escribe un título de reporte',
        clearSearchA11y: 'Limpiar búsqueda',
        statusFilter: 'Estado',
        categoryFilter: 'Categoría',
        allOption: 'Todos',
        clearFilters: 'Limpiar filtros',
        clearFiltersA11y: 'Limpiar todos los filtros',
        activeFilters: (n: number) => `${n} activo${n > 1 ? 's' : ''}`,
        countLabel: (loaded: number, total: number) =>
          `${loaded} cargados de ${total} en total`,
        loadError: 'No se pudieron cargar los reportes.',
        emptyTitle: 'No se encontraron reportes.',
        emptyHint: 'Intenta ajustar el estado, la categoría o la búsqueda.',
        loadingMore: 'Cargando más reportes...',
        loading: 'Cargando reportes...',
        retryA11y: 'Reintentar carga de reportes',
        retry: 'Reintentar',
      },
      detail: {
        loading: 'Cargando detalle...',
        loadError: 'No se pudo cargar el detalle del reporte.',
        retry: 'Reintentar',
        actionsTitle: 'Acciones de staff',
        actionsHint:
          'El cambio de estado y el comentario quedan registrados en la línea de tiempo.',
        currentStatus: 'Estado actual',
        messageLabel: 'Mensaje',
        messagePlaceholder: 'Describe el avance o la razón del cambio',
        messageHint: 'Obligatorio. Máximo 500 caracteres.',
        submitButton: 'Actualizar',
        errors: {
          messageEmpty: 'El mensaje no puede estar vacío.',
          messageTooLong: 'El mensaje no puede exceder 500 caracteres.',
          invalidStatus: 'Selecciona un estado válido.',
          updateFailed: 'No se pudo actualizar el reporte.',
        },
        success: {
          statusUpdated: 'Estado actualizado correctamente.',
          commentAdded: 'Comentario agregado correctamente.',
        },
      },
    },
    notifications: {
      title: 'Notificaciones',
    },
    profile: {
      header: 'Mi perfil',
      roleLabels: {citizen: 'Ciudadano', staff: 'Personal'},
      noEmail: 'Sin correo registrado',
      defaultName: 'Usuario',
      sections: {
        account: 'Cuenta',
        settings: 'Configuración',
        about: 'Acerca de',
      },
      signOut: {
        title: 'Cerrar sesión',
        subtitle: 'Finaliza tu sesión actual en este dispositivo',
        confirmTitle: 'Cerrar sesión',
        confirmMessage: '¿Seguro que quieres salir de tu cuenta?',
        cancel: 'Cancelar',
        confirm: 'Cerrar sesión',
      },
      language: {
        title: 'Cambiar idioma',
        subtitle: 'Idioma actual: Español',
        modalTitle: 'Seleccionar idioma',
        optionEs: 'Español',
        optionEn: 'English',
        close: 'Cancelar',
      },
      terms: {
        title: 'Ver términos',
        subtitle: 'Términos de uso y privacidad',
        modalTitle: 'Términos y condiciones',
        close: 'Cerrar',
        content: esTerms,
      },
      appVersion: 'Versión de la app',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  en: {
    dateLocale: 'en-US',
    common: {
      appName: 'StreetSignal',
      tagline: 'Citizens\' Reporting Platform',
      loading: 'Loading...',
      retry: 'Retry',
      cancel: 'Cancel',
      close: 'Close',
    },
    statusLabels: {
      Pending: 'Pending',
      InReview: 'In Review',
      Assigned: 'Assigned',
      InProgress: 'In Progress',
      Resolved: 'Resolved',
      Rejected: 'Rejected',
    },
    auth: {
      login: {
        title: 'Sign in',
        subtitle: 'Enter your credentials to continue',
        emailLabel: 'Email address',
        emailPlaceholder: 'email@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: 'At least 6 characters',
        showPassword: 'Show',
        hidePassword: 'Hide',
        submitButton: 'Sign in',
        noAccount: 'Don\'t have an account? ',
        register: 'Register',
      },
      register: {
        title: 'Create account',
        subtitle: 'Fill in your details to register',
        fullNameLabel: 'Full name',
        fullNamePlaceholder: 'Your full name',
        emailLabel: 'Email address',
        emailPlaceholder: 'email@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: 'At least 6 characters',
        confirmPasswordLabel: 'Confirm password',
        confirmPasswordPlaceholder: 'Repeat your password',
        passwordsMatch: 'Passwords match',
        showPassword: 'Show',
        hidePassword: 'Hide',
        submitButton: 'Create account',
        hasAccount: 'Already have an account? ',
        login: 'Sign in',
        strengthWeak: 'Weak',
        strengthMedium: 'Medium',
        strengthStrong: 'Strong',
      },
      errors: {
        noInternet: 'No internet connection. Check your network and try again.',
        invalidCredentials: 'Incorrect credentials. Check your email and password.',
        emailInUse: 'This email is already in use. Try another one or sign in.',
        serverError: 'Server error. Please try again in a moment.',
        unexpected: 'An unexpected error occurred. Please try again.',
      },
      validation: {
        nameRequired: 'Name is required',
        nameTooShort: 'Name must be at least 3 characters',
        emailRequired: 'Email is required',
        emailInvalid: 'Enter a valid email address',
        passwordRequired: 'Password is required',
        passwordTooShort: 'Password must be at least 6 characters',
        confirmPasswordRequired: 'Please confirm your password',
        passwordsMismatch: 'Passwords do not match',
      },
    },
    navigation: {
      home: 'Home',
      alerts: 'Alerts',
      profile: 'Profile',
      exit: 'Exit',
      reports: 'Reports',
      detail: 'Detail',
      myReports: 'My reports',
      reportDetail: 'Report detail',
      newReport: 'New report',
      signOut: {
        confirmTitle: 'Sign out?',
        confirmMessage: 'Your current session will be closed.',
        cancel: 'Cancel',
        confirm: 'Sign out',
        accessibilityLabel: 'Sign out',
      },
    },
    home: {
      defaultGreeting: 'citizen',
      notificationsA11y: 'Notifications',
      newReportTitle: 'New report',
      newReportSub: 'Photo · Category · Location',
      newReportA11y: 'Create new report',
      myReports: 'My reports',
      loadingReports: 'Loading your reports...',
      loadError: 'Could not load your reports.',
      emptyTitle: 'No reports yet',
      emptySub: 'When you create a report it will appear here with its current status.',
      createFirst: 'Create my first report',
    },
    reports: {
      myReports: {
        title: 'My reports',
        subtitle: 'Check the current status and history of each report.',
        loading: 'Loading your reports...',
        loadError: 'Could not load your reports.',
        emptyTitle: 'No reports yet.',
        emptySub: 'When you submit one, it will appear here with its status and history.',
        retryA11y: 'Retry loading my reports',
        retry: 'Retry',
      },
      detail: {
        loading: 'Loading report...',
        loadError: 'Could not load the report detail.',
        retry: 'Retry',
        photoA11y: 'Report photo',
        photoError: 'Could not load image',
        noPhoto: 'No photo',
        createdBy: 'Report created by',
        currentStatus: 'Current status',
        history: 'History',
        noUpdates: 'No updates registered yet.',
      },
      create: {
        titleLabel: 'Title',
        titlePlaceholder: 'What problem did you find?',
        descriptionLabel: 'Description',
        descriptionPlaceholder: 'Describe the problem in more detail...',
        categoryLabel: 'Category',
        photoLabel: 'Problem photo (optional)',
        locationLabel: 'Location (optional)',
        submitButton: 'Submit report',
        addPhotoTitle: 'Add photo',
        addPhotoMessage: 'Select image source',
        gallery: 'Gallery',
        camera: 'Camera',
        cancel: 'Cancel',
        success: 'Report submitted successfully!',
        errors: {
          titleTooShort: 'Title must be at least 5 characters.',
          descriptionTooShort: 'Description must be at least 10 characters.',
          categoryRequired: 'Please select a category.',
          sessionExpiredTitle: 'Session expired',
          sessionExpiredMsg: 'Your session has expired. Please sign in again.',
          invalidDataTitle: 'Invalid data',
          invalidDataMsg: 'Please review the form and try again.',
          errorTitle: 'Error',
          sendError: 'Could not submit the report.',
          noConnectionTitle: 'No connection',
          noConnectionMsg: 'Check your connection and try again.',
        },
      },
      card: {
        withLocation: 'With location',
        photoA11y: 'Report photo',
      },
    },
    staff: {
      list: {
        title: 'All reports',
        subtitle: 'Staff review queue · Use filters to narrow the list.',
        searchLabel: 'Search by title',
        searchPlaceholder: 'Type a report title',
        clearSearchA11y: 'Clear search',
        statusFilter: 'Status',
        categoryFilter: 'Category',
        allOption: 'All',
        clearFilters: 'Clear filters',
        clearFiltersA11y: 'Clear all filters',
        activeFilters: (n: number) => `${n} active`,
        countLabel: (loaded: number, total: number) =>
          `${loaded} loaded of ${total} total`,
        loadError: 'Could not load reports.',
        emptyTitle: 'No reports found.',
        emptyHint: 'Try adjusting status, category, or title search.',
        loadingMore: 'Loading more reports...',
        loading: 'Loading reports...',
        retryA11y: 'Retry loading reports',
        retry: 'Retry',
      },
      detail: {
        loading: 'Loading detail...',
        loadError: 'Could not load the report detail.',
        retry: 'Retry',
        actionsTitle: 'Staff actions',
        actionsHint:
          'The status change and comment are recorded in the timeline.',
        currentStatus: 'Current status',
        messageLabel: 'Message',
        messagePlaceholder: 'Describe the progress or reason for the change',
        messageHint: 'Required. Maximum 500 characters.',
        submitButton: 'Update',
        errors: {
          messageEmpty: 'Message cannot be empty.',
          messageTooLong: 'Message cannot exceed 500 characters.',
          invalidStatus: 'Please select a valid status.',
          updateFailed: 'Could not update the report.',
        },
        success: {
          statusUpdated: 'Status updated successfully.',
          commentAdded: 'Comment added successfully.',
        },
      },
    },
    notifications: {
      title: 'Notifications',
    },
    profile: {
      header: 'My profile',
      roleLabels: {citizen: 'Citizen', staff: 'Staff'},
      noEmail: 'No email registered',
      defaultName: 'User',
      sections: {
        account: 'Account',
        settings: 'Settings',
        about: 'About',
      },
      signOut: {
        title: 'Sign out',
        subtitle: 'End your current session on this device',
        confirmTitle: 'Sign out',
        confirmMessage: 'Are you sure you want to sign out?',
        cancel: 'Cancel',
        confirm: 'Sign out',
      },
      language: {
        title: 'Change language',
        subtitle: 'Current language: English',
        modalTitle: 'Select language',
        optionEs: 'Español',
        optionEn: 'English',
        close: 'Cancel',
      },
      terms: {
        title: 'View terms',
        subtitle: 'Terms of use and privacy',
        modalTitle: 'Terms and conditions',
        close: 'Close',
        content: enTerms,
      },
      appVersion: 'App version',
    },
  },
} as const;

export type Translations = typeof translations.es;
