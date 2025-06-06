// config/facebook.config.ts
export const facebookConfig = {
  // Selectores actualizados regularmente
  selectors: {
    searchInput: [
      'input[placeholder*="Search Marketplace"]',
      'input[placeholder*="Buscar en Marketplace"]',
      'input[aria-label*="Search"]',
      'label[aria-label*="Search"] input'
    ],
    productItem: [
      'div[data-testid="marketplace-search-result"]',
      'div[data-testid="browse-result-card"]',
      'a[role="link"][href*="/marketplace/item/"]'
    ],
    price: [
      'span:has-text("$")',
      'div[dir="auto"] span[dir="auto"]:has-text("$")',
      '[aria-label*="price"]'
    ],
    title: [
      'span[dir="auto"]:not(:has-text("$"))',
      'div[role="heading"] span',
      '[aria-label]:not([aria-label*="price"])'
    ]
  },
  
  // Configuración de delays específicos para Facebook
  delays: {
    betweenActions: { min: 1500, max: 3000 },
    afterLogin: { min: 5000, max: 8000 },
    scrollDelay: { min: 2000, max: 4000 },
    typingDelay: { min: 100, max: 200 }
  },
  
  // URLs alternativas
  urls: {
    marketplace: [
      'https://www.facebook.com/marketplace',
      'https://m.facebook.com/marketplace',
      'https://web.facebook.com/marketplace'
    ]
  }
} 