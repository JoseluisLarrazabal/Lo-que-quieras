import { BaseScraper, Product, LoginCredentials } from "./baseScraper"

interface MercadoLibreConfig {
  useLogin?: boolean
  credentials?: LoginCredentials
}

export class MercadoLibreScraper extends BaseScraper {
  private isLoggedIn: boolean = false

  constructor(config?: MercadoLibreConfig) {
    super({
      marketplace: "MercadoLibre",
      scraperType: "mercadoLibre",
      useLogin: config?.useLogin || process.env.USE_LOGIN === 'true',
      credentials: config?.credentials || {
        email: process.env.ML_EMAIL || '',
        password: process.env.ML_PASSWORD || ''
      }
    })
  }

  protected getMainDomain(): string {
    return "https://www.mercadolibre.com.ar"
  }

  protected async performLogin(): Promise<boolean> {
    if (!this.page || !this.credentials) return false

    try {
      console.log('🔐 Starting MercadoLibre login process...')
      
      // Navegar a la página de login
      await this.page.goto('https://www.mercadolibre.com.ar', {
        waitUntil: 'networkidle0',
        timeout: 30000
      })

      // Click en "Ingresá"
      const loginLink = await this.page.$('a[data-link-id="login"]')
      if (loginLink) {
        await loginLink.click()
        await this.page.waitForNavigation({ waitUntil: 'networkidle0' })
      } else {
        // Alternativa: ir directamente al login
        await this.page.goto('https://www.mercadolibre.com/jms/mla/lgz/login', {
          waitUntil: 'networkidle0'
        })
      }

      await this.humanDelay(2000, 3000)

      // Ingresar email/usuario
      const emailSelector = 'input[name="user_id"], input#user_id'
      await this.waitForSelectorWithRetry(emailSelector)
      await this.typeHumanLike(emailSelector, this.credentials.email)
      
      // Click en continuar
      const continueButton = await this.page.$('button[type="submit"], span.andes-button__content')
      if (continueButton) {
        await continueButton.click()
        await this.humanDelay(2000, 3000)
      }

      // Ingresar contraseña
      const passwordSelector = 'input[name="password"], input#password'
      await this.waitForSelectorWithRetry(passwordSelector)
      await this.typeHumanLike(passwordSelector, this.credentials.password)

      // Click en ingresar
      const submitButton = await this.page.$('button[type="submit"], button#action-complete')
      if (submitButton) {
        await submitButton.click()
        
        // Esperar navegación
        await this.page.waitForNavigation({
          waitUntil: 'networkidle0',
          timeout: 30000
        }).catch(() => {})
      }

      await this.humanDelay(3000, 5000)

      // Verificar login exitoso
      const loginSuccess = await this.checkIfLoggedIn()
      
      if (loginSuccess) {
        console.log('✅ MercadoLibre login successful')
        this.isLoggedIn = true
        return true
      } else {
        console.warn('⚠️ MercadoLibre login failed')
        return false
      }
    } catch (error) {
      console.error('❌ Error during MercadoLibre login:', error)
      return false
    }
  }

  private async checkIfLoggedIn(): Promise<boolean> {
    if (!this.page) return false

    try {
      // Verificar elementos que indican login exitoso
      const loggedInSelectors = [
        'a[data-link-id="profile"]',
        'a[data-link-id="my-account"]',
        'div[data-testid="user-menu"]'
      ]

      for (const selector of loggedInSelectors) {
        const element = await this.page.$(selector)
        if (element) return true
      }

      return false
    } catch (error) {
      console.error('Error checking login status:', error)
      return false
    }
  }

  public async search(query: string): Promise<Product[]> {
    const startTime = Date.now()
    
    try {
      console.log(`🔍 Starting MercadoLibre search for: "${query}"`)
      
      await this.initialize()
      
      // Delay inicial aleatorio
      await this.humanDelay(2000, 5000)
      
      const results = await this.scrapeWithRetry(
        () => this.scrapeResults(query),
        "MercadoLibre search"
      ) || []
      
      const duration = Date.now() - startTime
      console.log(`✅ MercadoLibre search completed in ${duration}ms - Found ${results.length} products`)
      
      return results
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ MercadoLibre search failed after ${duration}ms:`, error)
      return []
    } finally {
      await this.close()
    }
  }

  private async scrapeResults(query: string): Promise<Product[]> {
    if (!this.page) return []

    try {
      // Primero visitar la página principal
      await this.page.goto("https://www.mercadolibre.com.ar/", {
        waitUntil: "networkidle0",
        timeout: 30000
      })

      // Simular comportamiento humano
      await this.simulateHumanBehavior()
      await this.humanDelay()

      // Construir URL de búsqueda
      const searchUrl = `https://listado.mercadolibre.com.ar/${encodeURIComponent(query)}`
      
      // Navegar a la página de resultados
      await this.page.goto(searchUrl, {
        waitUntil: "networkidle0",
        timeout: 30000
      })

      // Simular comportamiento humano
      await this.simulateHumanBehavior()
      await this.humanDelay()

      // Extraer resultados
      const results = await this.page.evaluate(() => {
        const items = document.querySelectorAll("li.ui-search-layout__item")
        return Array.from(items).map((item) => {
          const titleElement = item.querySelector("h2.ui-search-item__title")
          const priceElement = item.querySelector("span.price-tag-fraction")
          const linkElement = item.querySelector("a.ui-search-link") as HTMLAnchorElement
          const imageElement = item.querySelector("img.ui-search-result-image__element") as HTMLImageElement

          return {
            title: titleElement?.textContent?.trim() || "",
            price: parseFloat(priceElement?.textContent?.replace(/[^\d]/g, "") || "0"),
            url: linkElement?.href || "",
            imageUrl: imageElement?.src || "",
          }
        })
      })

      // Convertir a formato Product
      return results.map((result) =>
        this.createProduct(
          result.title,
          result.price,
          result.url,
          result.imageUrl
        )
      )
    } catch (error) {
      console.error("Error scraping MercadoLibre:", error)
      return []
    }
  }
}

export async function searchMercadoLibre(query: string): Promise<Product[]> {
  const scraper = new MercadoLibreScraper()
  return scraper.search(query)
} 