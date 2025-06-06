import { Page } from 'puppeteer'
import { FacebookMarketplaceScraper } from '../lib/scrapers/facebookScraper'
import { writeFileSync } from 'fs'
import { facebookConfig } from '../config/facebook.config'

export class FacebookSelectorUpdater {
  static async updateSelectors(): Promise<void> {
    const scraper = new FacebookMarketplaceScraper()
    
    try {
      // Inicializar y navegar
      await scraper['initialize']() // Acceder a método protected
      const page = scraper['page'] as Page
      
      if (!page) {
        throw new Error('No se pudo inicializar la página')
      }

      await page.goto('https://www.facebook.com/marketplace')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Analizar estructura actual
      const currentSelectors = await page.evaluate(() => {
        const selectors: Record<string, string[]> = {
          products: [],
          prices: [],
          titles: [],
          images: []
        }
        
        // Buscar patrones comunes
        document.querySelectorAll('a[href*="/marketplace/item/"]').forEach(link => {
          const parent = link.parentElement
          if (parent) {
            // Intentar identificar estructura de producto
            const priceElements = parent.querySelectorAll('span:contains("$"), div:contains("$")')
            const titleElements = parent.querySelectorAll('span[dir="auto"], div[role="heading"]')
            const imageElements = parent.querySelectorAll('img')
            
            // Guardar selectores únicos
            priceElements.forEach(el => {
              const selector = el.getAttribute('data-testid') || el.className || el.tagName
              if (selector) selectors.prices.push(selector)
            })
            
            titleElements.forEach(el => {
              const selector = el.getAttribute('data-testid') || el.className || el.tagName
              if (selector) selectors.titles.push(selector)
            })

            imageElements.forEach(el => {
              const selector = el.getAttribute('data-testid') || el.className || el.tagName
              if (selector) selectors.images.push(selector)
            })
          }
        })
        
        return selectors
      })
      
      console.log('Current selectors found:', currentSelectors)
      
      // Actualizar configuración
      const updatedConfig = {
        ...facebookConfig,
        selectors: {
          ...facebookConfig.selectors,
          productItem: [...new Set([...facebookConfig.selectors.productItem, ...currentSelectors.products])],
          price: [...new Set([...facebookConfig.selectors.price, ...currentSelectors.prices])],
          title: [...new Set([...facebookConfig.selectors.title, ...currentSelectors.titles])]
        }
      }
      
      // Guardar selectores actualizados
      writeFileSync(
        'config/facebook.config.ts',
        `// config/facebook.config.ts
export const facebookConfig = ${JSON.stringify(updatedConfig, null, 2)}`
      )
      
      console.log('✅ Selectores actualizados exitosamente')
      
    } catch (error) {
      console.error('Error updating selectors:', error)
    } finally {
      await scraper['close']()
    }
  }
} 