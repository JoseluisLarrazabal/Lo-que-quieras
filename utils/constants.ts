export const MARKETPLACES = {
  MERCADOLIBRE: "MercadoLibre",
  OLX: "OLX",
  FACEBOOK: "Facebook Marketplace",
} as const

export const CATEGORIES = {
  ELECTRONICS: "Electrónicos",
  CLOTHING: "Ropa",
  HOME: "Hogar",
  SPORTS: "Deportes",
  BOOKS: "Libros",
  TOYS: "Juguetes",
} as const

export const SORT_OPTIONS = {
  RELEVANCE: "relevance",
  PRICE_ASC: "price-asc",
  PRICE_DESC: "price-desc",
  NEWEST: "newest",
} as const

export const CACHE_DURATION = {
  SEARCH_RESULTS: 60 * 60 * 1000, // 1 hour
  PRODUCT_DETAILS: 30 * 60 * 1000, // 30 minutes
  USER_PREFERENCES: 24 * 60 * 60 * 1000, // 24 hours
} as const

export const API_ENDPOINTS = {
  SEARCH: "/api/search",
  PRODUCT: "/api/product",
  FAVORITES: "/api/favorites",
  HISTORY: "/api/history",
  HEALTH: "/api/health",
} as const

export const STORAGE_KEYS = {
  FAVORITES: "favorites",
  SEARCH_HISTORY: "searchHistory",
  USER_PREFERENCES: "userPreferences",
  CACHE_PREFIX: "cache_",
} as const

export const APP_CONFIG = {
  NAME: "Lo que quieras!",
  VERSION: "1.0.0",
  MAX_SEARCH_HISTORY: 50,
  MAX_FAVORITES: 100,
  SEARCH_DEBOUNCE_MS: 300,
  REQUEST_TIMEOUT_MS: 10000,
} as const
