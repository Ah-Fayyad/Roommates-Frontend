export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Roommates Finder';
export const IS_PRODUCTION = import.meta.env.VITE_ENVIRONMENT === 'production';
export const IS_DEVELOPMENT = import.meta.env.VITE_ENVIRONMENT === 'development';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        RESET_PASSWORD: '/api/auth/reset-password',
    },
    LISTINGS: {
        GET_ALL: '/api/listings',
        GET_BY_ID: (id: string) => `/api/listings/${id}`,
        CREATE: '/api/listings',
        UPDATE: (id: string) => `/api/listings/${id}`,
        DELETE: (id: string) => `/api/listings/${id}`,
    },
    USERS: {
        PROFILE: '/api/users/profile',
        UPDATE_PROFILE: '/api/users/profile',
        UPDATE_SETTINGS: '/api/users/settings',
        DELETE_ACCOUNT: '/api/users/account',
    },
    FAVORITES: {
        GET_ALL: '/api/favorites',
        ADD: '/api/favorites',
        REMOVE: (id: string) => `/api/favorites/${id}`,
    },
    MESSAGES: {
        GET_CHATS: '/api/chats',
        GET_MESSAGES: (chatId: string) => `/api/chats/${chatId}/messages`,
        SEND_MESSAGE: (chatId: string) => `/api/chats/${chatId}/messages`,
    },
    UPLOAD: {
        IMAGES: '/api/upload/images',
        AVATAR: '/api/upload/avatar',
    },
    ANALYTICS: {
        TRACK_VIEW: (listingId: string) => `/api/analytics/listings/${listingId}/view`,
        GET_STATS: (listingId: string) => `/api/analytics/listings/${listingId}/stats`,
    },
    REPORTS: {
        CREATE: '/api/reports',
        GET_USER_REPORTS: '/api/reports/user',
    },
    NOTIFICATIONS: {
        GET_ALL: '/api/notifications',
        MARK_READ: (id: string) => `/api/notifications/${id}/read`,
        MARK_ALL_READ: '/api/notifications/read-all',
        DELETE: (id: string) => `/api/notifications/${id}`,
    },
    VISITS: {
        CREATE: '/api/visits',
        GET_ALL: '/api/visits',
        ACCEPT: (id: string) => `/api/visits/${id}/accept`,
        DECLINE: (id: string) => `/api/visits/${id}/decline`,
        COMPLETE: (id: string) => `/api/visits/${id}/complete`,
    },
};

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    DASHBOARD: '/dashboard',
    LISTINGS: '/listings',
    LISTING_DETAILS: (id: string) => `/listings/${id}`,
    CREATE_LISTING: '/create-listing',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    MESSAGES: '/messages',
    FAVORITES: '/favorites',
    MATCHES: '/matches',
    ADMIN: '/admin',
};

export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
};

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
} as const;

export const LANGUAGES = {
    EN: 'en',
    AR: 'ar',
} as const;
