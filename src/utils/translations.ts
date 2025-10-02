import { Language } from '../contexts/SettingsContext';

export const translations = {
  en: {
    // Auth
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    userType: 'User Type',
    student: 'Student',
    moderator: 'Moderator',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    
    // Navigation
    home: 'Home',
    chat: 'Chat',
    flashcards: 'Flashcards',
    image: 'Image',
    analytics: 'Analytics',
    settings: 'Settings',
    progress: 'Progress',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    export: 'Export',
    download: 'Download',
    close: 'Close',
    
    // Features
    aiTutor: 'AI Tutor Chat',
    generateFlashcards: 'Generate Flashcards',
    imageAnalysis: 'Image Analysis',
    progressTracking: 'Progress Tracking',
    
    // Settings
    darkMode: 'Dark Mode',
    fontSize: 'Font Size',
    fontStyle: 'Font Style',
    language: 'Language',
    appearance: 'Appearance',
    accessibility: 'Accessibility',
    
    // Messages
    welcomeMessage: 'Your AI-Powered Learning Companion',
    poweredBy: 'Powered by Groq AI - Fast, free, and ready to help you learn!',
  },
  es: {
    // Auth
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    name: 'Nombre Completo',
    userType: 'Tipo de Usuario',
    student: 'Estudiante',
    moderator: 'Moderador',
    welcomeBack: 'Bienvenido de Nuevo',
    createAccount: 'Crear Cuenta',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    dontHaveAccount: '¿No tienes una cuenta?',
    
    // Navigation
    home: 'Inicio',
    chat: 'Chat',
    flashcards: 'Tarjetas',
    image: 'Imagen',
    analytics: 'Análisis',
    settings: 'Configuración',
    progress: 'Progreso',
    
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    save: 'Guardar',
    cancel: 'Cancelar',
    export: 'Exportar',
    download: 'Descargar',
    close: 'Cerrar',
    
    // Features
    aiTutor: 'Chat con Tutor IA',
    generateFlashcards: 'Generar Tarjetas',
    imageAnalysis: 'Análisis de Imagen',
    progressTracking: 'Seguimiento de Progreso',
    
    // Settings
    darkMode: 'Modo Oscuro',
    fontSize: 'Tamaño de Fuente',
    fontStyle: 'Estilo de Fuente',
    language: 'Idioma',
    appearance: 'Apariencia',
    accessibility: 'Accesibilidad',
    
    // Messages
    welcomeMessage: 'Tu Compañero de Aprendizaje con IA',
    poweredBy: '¡Impulsado por Groq AI - Rápido, gratuito y listo para ayudarte a aprender!',
  },
  fr: {
    // Auth
    login: 'Connexion',
    signup: "S'inscrire",
    logout: 'Déconnexion',
    email: 'Email',
    password: 'Mot de Passe',
    name: 'Nom Complet',
    userType: "Type d'Utilisateur",
    student: 'Étudiant',
    moderator: 'Modérateur',
    welcomeBack: 'Bon Retour',
    createAccount: 'Créer un Compte',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    dontHaveAccount: "Vous n'avez pas de compte?",
    
    // Navigation
    home: 'Accueil',
    chat: 'Chat',
    flashcards: 'Cartes',
    image: 'Image',
    analytics: 'Analytique',
    settings: 'Paramètres',
    progress: 'Progrès',
    
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    save: 'Enregistrer',
    cancel: 'Annuler',
    export: 'Exporter',
    download: 'Télécharger',
    close: 'Fermer',
    
    // Features
    aiTutor: 'Chat avec Tuteur IA',
    generateFlashcards: 'Générer des Cartes',
    imageAnalysis: "Analyse d'Image",
    progressTracking: 'Suivi des Progrès',
    
    // Settings
    darkMode: 'Mode Sombre',
    fontSize: 'Taille de Police',
    fontStyle: 'Style de Police',
    language: 'Langue',
    appearance: 'Apparence',
    accessibility: 'Accessibilité',
    
    // Messages
    welcomeMessage: "Votre Compagnon d'Apprentissage IA",
    poweredBy: 'Propulsé par Groq AI - Rapide, gratuit et prêt à vous aider à apprendre!',
  },
};

export function useTranslation(language: Language) {
  return (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || key;
  };
}
