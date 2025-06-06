// olx.scraper.ts
import { BaseScraper, Product, LoginCredentials } from "./baseScraper"

interface OLXConfig {
  useLogin?: boolean
  credentials?: LoginCredentials
}

export class OLXScraper extends BaseScraper {
  private isLoggedIn: boolean = false

  constructor(config?: OLXConfig) {
    super({
      marketplace: "OLX",
      scraperType: "olx",
      useLogin: config?.useLogin || process.env.USE_LOGIN === 'true',
      credentials: config?.credentials || {
        email: process.env.OLX_EMAIL || '',
        password: process.env.OLX_PASSWORD || ''
      }
    })
  }

  protected getMainDomain(): string {
    return "https://www.olx.com.ar"
  }

  protected async performLogin(): Promise<boolean> {
    if (!this.page || !this.credentials) return false

    try {
      console.log('🔐 Starting OLX login process...')
      
      // Navegar a OLX
      await this.page.goto('https://www.olx.com.ar', {
        waitUntil: 'networkidle0',
        timeout: 30000
      })

      // Click en "Mi cuenta" o "Ingresar"
      const loginButton = await this.page.$('button[data-aut-id="btnLogin"], a[data-aut-id="btnLogin"]')
      if (loginButton) {
        await loginButton.click()
        await this.humanDelay(2000, 3000)
      }

      // Esperar modal de login
      await this.waitForSelectorWithRetry('div[data-aut-id="loginForm"], form[data-aut-id="loginForm"]')

      // Opción de email/contraseña
      const emailOption = await this.page.$('button[data-aut-id="emailLogin"]')
      if (emailOption) {
        await emailOption.click()
        await this.humanDelay(1000, 2000)
      }

      // Ingresar email
      const emailSelector = 'input[data-aut-id="email"], input[type="email"]'
      await this.typeHumanLike(emailSelector, this.credentials.email)
      await this.humanDelay(1000, 2000)

      // Ingresar contraseña
      const passwordSelector = 'input[data-aut-id="password"], input[type="password"]'
      await this.typeHumanLike(passwordSelector, this.credentials.password)
      await this.humanDelay(1000, 2000)

      // Submit
      const submitButton = await this.page.$('button[data-aut-id="submit"], button[type="submit"]')
      if (submitButton) {
        await submitButton.click()
        await this.humanDelay(3000, 5000)
      }

      // Verificar login exitoso
      const loginSuccess = await this.checkIfLoggedIn()
      
      if (loginSuccess) {
        console.log('✅ OLX login successful')
        this.isLoggedIn = true
        return true
      }

      return false
    } catch (error) {
      console.error('❌ OLX login error:', error)
      return false
    }
  }

  private async checkIfLoggedIn(): Promise<boolean> {
    if (!this.page) return false
    
    try {
      // Verificar elementos de usuario logueado
      const loggedInSelectors = [
        'a[data-aut-id="btnProfile"]',
        'div[data-aut-id="profileButton"]',
        'button[data-aut-id="btnMyAccount"]'
      ]
      
      for (const selector of loggedInSelectors) {
        const element = await this.page.$(selector)
        if (element) return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  public async search(query: string): Promise<Product[]> {
    const startTime = Date.now()
    
    try {
      console.log(`🔍 Starting OLX search for: "${query}"`)
      
      await this.initialize()
      
      // Delay inicial aleatorio
      await this.humanDelay(2000, 5000)
      
      const results = await this.scrapeWithRetry(
        () => this.scrapeResults(query),
        "OLX search"
      ) || []
      
      const duration = Date.now() - startTime
      console.log(`✅ OLX search completed in ${duration}ms - Found ${results.length} products`)
      
      return results
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ OLX search failed after ${duration}ms:`, error)
      return []
    } finally {
      await this.close()
    }
  }

  private async scrapeResults(query: string): Promise<Product[]> {
    if (!this.page) return []

    try {
      // Primero visitar la página principal
      await this.page.goto("https://www.olx.com.ar/", {
        waitUntil: "networkidle0",
        timeout: 30000
      })

      // Simular comportamiento humano
      await this.simulateHumanBehavior()
      await this.humanDelay()

      // Construir URL de búsqueda
      const searchUrl = `https://www.olx.com.ar/items/q-${encodeURIComponent(query)}`
      
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
        const items = document.querySelectorAll("div[data-cy='l-card']")
        return Array.from(items).map((item) => {
          const titleElement = item.querySelector("h6")
          const priceElement = item.querySelector("p[data-testid='ad-price']")
          const linkElement = item.querySelector("a") as HTMLAnchorElement
          const imageElement = item.querySelector("img") as HTMLImageElement

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
      console.error("Error scraping OLX:", error)
      return []
    }
  }
}

export async function searchOLX(query: string): Promise<Product[]> {
  const scraper = new OLXScraper()
  return scraper.search(query)
}