// baseScraper.ts
import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import AnonymizeUA from "puppeteer-extra-plugin-anonymize-ua"
import UserAgent from "user-agents"
import { v4 as uuidv4 } from "uuid"
import type { Browser, Page, Cookie } from "puppeteer"
import { executablePath } from "puppeteer"
import dotenv from 'dotenv'

dotenv.config()

// Configurar stealth plugin con todas las evasiones
const stealth = StealthPlugin()
stealth.enabledEvasions.delete('iframe.contentWindow')
stealth.enabledEvasions.delete('media.codecs')

puppeteer.use(stealth)
puppeteer.use(AnonymizeUA())

export interface Product {
  id: string
  title: string
  price: number
  marketplace: string
  url: string
  imageUrl: string
  description?: string
  category?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ScraperConfig {
  marketplace: string
  scraperType: "mercadoLibre" | "olx" | "facebook"
  useProxy?: boolean
  proxyUrl?: string
  useLogin?: boolean
  credentials?: LoginCredentials
}

// Lista de proxies rotativos (deberías usar proxies reales)
const PROXY_LIST: string[] = [
  // 'http://user:pass@proxy1.com:8080',
  // 'http://user:pass@proxy2.com:8080',
]

class ScraperErrorHandler {
  private errorCounts: Map<string, number> = new Map()
  private readonly maxErrorsBeforeAbort = 5
  
  async handle(error: Error, context: string): Promise<boolean> {
    const errorKey = `${context}:${error.message}`
    const count = (this.errorCounts.get(errorKey) || 0) + 1
    this.errorCounts.set(errorKey, count)
    
    console.error(`❌ Error in ${context}: ${error.message} (attempt ${count})`)
    
    if (error.message.includes('net::ERR_PROXY_CONNECTION_FAILED')) {
      return this.handleProxyError()
    } else if (error.message.includes('Timeout') || error.message.includes('Navigation timeout')) {
      return this.handleTimeoutError()
    } else if (error.message.includes('Session closed') || error.message.includes('Target closed')) {
      return this.handleSessionError()
    } else if (error.message.includes('blocked') || error.message.includes('captcha')) {
      return this.handleBlockedError()
    }
    
    return count < this.maxErrorsBeforeAbort
  }
  
  private async handleProxyError(): Promise<boolean> {
    console.log('🔄 Switching to next proxy...')
    return true
  }
  
  private async handleTimeoutError(): Promise<boolean> {
    console.log('⏱️ Increasing timeout and retrying...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    return true
  }
  
  private async handleSessionError(): Promise<boolean> {
    console.log('🔄 Session lost, reinitializing...')
    return false
  }
  
  private async handleBlockedError(): Promise<boolean> {
    console.log('🛡️ Detected blocking, applying advanced evasion...')
    await new Promise(resolve => setTimeout(resolve, 30000))
    return true
  }
}

class RateLimiter {
  private requests: number[] = []
  private readonly windowSize: number = 60000
  private readonly maxRequests: number = 10
  private readonly backoffMultiplier: number = 2
  private currentBackoff: number = 0

  async checkLimit(): Promise<void> {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowSize)
    
    if (this.requests.length >= this.maxRequests) {
      this.currentBackoff = Math.min(
        (this.currentBackoff || 1000) * this.backoffMultiplier,
        60000
      )
      
      console.log(`⏱️ Rate limit reached. Waiting ${this.currentBackoff}ms...`)
      await new Promise(resolve => setTimeout(resolve, this.currentBackoff))
      return this.checkLimit()
    }
    
    this.requests.push(now)
    
    if (this.requests.length < this.maxRequests / 2) {
      this.currentBackoff = 0
    }
  }
}

export abstract class BaseScraper {
  protected browser: Browser | null = null
  protected page: Page | null = null
  protected marketplace: string
  protected scraperType: "mercadoLibre" | "olx" | "facebook"
  protected userAgent: string
  protected useProxy: boolean
  protected proxyUrl?: string
  protected sessionCookies: Cookie[] = []
  private retryCount = 0
  private maxRetries = 3
  private requestCount = 0
  private lastRequestTime = Date.now()
  private errorHandler = new ScraperErrorHandler()
  private rateLimiter = new RateLimiter()
  protected useLogin: boolean
  protected credentials?: LoginCredentials

  private fingerprints = [
    {
      screen: { width: 1920, height: 1080, availWidth: 1920, availHeight: 1040 },
      viewport: { width: 1920, height: 1080 },
      hardwareConcurrency: 8,
      deviceMemory: 8,
      platform: 'Win32',
      vendor: 'Google Inc.',
      renderer: 'Intel Iris OpenGL Engine'
    },
    {
      screen: { width: 1366, height: 768, availWidth: 1366, availHeight: 728 },
      viewport: { width: 1366, height: 768 },
      hardwareConcurrency: 4,
      deviceMemory: 4,
      platform: 'Win32',
      vendor: 'Google Inc.',
      renderer: 'ANGLE (Intel HD Graphics 620 Direct3D11)'
    },
    {
      screen: { width: 1440, height: 900, availWidth: 1440, availHeight: 860 },
      viewport: { width: 1440, height: 900 },
      hardwareConcurrency: 6,
      deviceMemory: 8,
      platform: 'MacIntel',
      vendor: 'Apple Computer, Inc.',
      renderer: 'Apple GPU'
    }
  ]

  constructor(config: ScraperConfig) {
    this.marketplace = config.marketplace
    this.scraperType = config.scraperType
    this.useProxy = config.useProxy || false
    this.proxyUrl = config.proxyUrl || this.getRandomProxy()
    this.userAgent = this.getRealisticUserAgent()
    this.useLogin = config.useLogin || false
    this.credentials = config.credentials
  }

  private getRandomProxy(): string | undefined {
    if (PROXY_LIST.length === 0) return undefined
    return PROXY_LIST[Math.floor(Math.random() * PROXY_LIST.length)]
  }

  private getRealisticUserAgent(): string {
    // User agents más realistas y variados
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    ]
    return userAgents[Math.floor(Math.random() * userAgents.length)]
  }

  protected async initialize(): Promise<void> {
    try {
      console.log(`🚀 Initializing ${this.marketplace} scraper with advanced stealth...`)

      const fingerprint = this.getCurrentFingerprint()

      const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        `--window-size=${fingerprint.viewport.width},${fingerprint.viewport.height}`,
        '--start-maximized',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--lang=es-AR,es',
        '--disable-notifications',
        '--disable-popup-blocking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-sync',
        '--disable-domain-reliability',
        '--disable-infobars',
        '--disable-features=site-per-process',
        '--disable-features=AudioServiceOutOfProcess',
        '--metrics-recording-only',
        '--safebrowsing-disable-auto-update',
        '--password-store=basic',
        '--use-mock-keychain'
      ]

      // Agregar proxy si está configurado
      if (this.useProxy && this.proxyUrl) {
        args.push(`--proxy-server=${this.proxyUrl}`)
      }

      // Configuración del navegador
      this.browser = await puppeteer.launch({
        headless: process.env.DEBUG === 'true' ? false : true,
        args,
        executablePath: executablePath(),
        defaultViewport: null,
        ignoreDefaultArgs: ['--enable-automation', '--enable-blink-features=AutomationControlled'],
        devtools: false,
        // @ts-ignore - La propiedad existe pero no está en los tipos
        ignoreHTTPSErrors: true,
        slowMo: 0,
      })

      // Crear página con contexto
      const context = await this.browser.createBrowserContext()
      this.page = await context.newPage()

      const client = await this.page.target().createCDPSession()
      
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: fingerprint.viewport.width,
        height: fingerprint.viewport.height,
        deviceScaleFactor: 1,
        mobile: false,
        screenOrientation: { type: 'landscapePrimary', angle: 0 },
        screenWidth: fingerprint.screen.width,
        screenHeight: fingerprint.screen.height,
      })

      // Configurar la página antes de cualquier navegación
      await this.setupPageEvasion()
      
      // Después de crear la página, intentar login si está configurado
      if (this.useLogin && this.credentials && this.performLogin) {
        console.log(`🔐 Attempting login for ${this.marketplace}...`)
        const loginSuccess = await this.performLogin()
        
        if (!loginSuccess) {
          console.warn(`⚠️ Login failed for ${this.marketplace}, continuing without authentication`)
        } else {
          console.log(`✅ Successfully logged in to ${this.marketplace}`)
          // Guardar cookies de sesión
          this.sessionCookies = await this.page!.cookies()
        }
      }
      
      console.log(`✅ ${this.marketplace} scraper initialized successfully`)
    } catch (error) {
      console.error(`❌ Error initializing ${this.marketplace} scraper:`, error)
      throw error
    }
  }

  private getCurrentFingerprint() {
    return this.fingerprints[Math.floor(Math.random() * this.fingerprints.length)]
  }

  private async setupPageEvasion(): Promise<void> {
    if (!this.page) return

    // Configurar User-Agent
    await this.page.setUserAgent(this.userAgent)

    // Headers más realistas
    await this.page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    })

    // Viewport realista
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1536, height: 864 },
      { width: 1440, height: 900 },
    ]
    const viewport = viewports[Math.floor(Math.random() * viewports.length)]
    await this.page.setViewport(viewport)

    // Inyectar scripts anti-detección antes de la navegación
    await this.page.evaluateOnNewDocument(() => {
      // Webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      })

      // Chrome
      // @ts-ignore - La propiedad existe pero no está en los tipos
      window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      }

      // Permissions
      const originalQuery = window.navigator.permissions.query
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
          : originalQuery(parameters)

      // Plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', length: 1 },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', length: 1 },
          { name: 'Native Client', filename: 'internal-nacl-plugin', length: 2 }
        ]
      })

      // Languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['es-AR', 'es', 'en-US', 'en']
      })

      // Platform
      Object.defineProperty(navigator, 'platform', {
        get: () => 'Win32'
      })

      // Hardware concurrency
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 8
      })

      // Device memory
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => 8
      })

      // Screen resolution
      Object.defineProperty(screen, 'width', { get: () => 1920 })
      Object.defineProperty(screen, 'height', { get: () => 1080 })
      Object.defineProperty(screen, 'availWidth', { get: () => 1920 })
      Object.defineProperty(screen, 'availHeight', { get: () => 1040 })

      // WebGL Vendor
      const getParameter = WebGLRenderingContext.prototype.getParameter
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) {
          return 'Intel Inc.'
        }
        if (parameter === 37446) {
          return 'Intel Iris OpenGL Engine'
        }
        return getParameter.apply(this, [parameter])
      }

      // Battery API
      Object.defineProperty(navigator, 'getBattery', {
        value: () => Promise.resolve({
          charging: true,
          chargingTime: 0,
          dischargingTime: Infinity,
          level: 1
        })
      })

      // Connection API
      Object.defineProperty(navigator, 'connection', {
        get: () => ({
          rtt: 100,
          downlink: 10,
          effectiveType: '4g',
          saveData: false
        })
      })

      // WebRTC - Muy importante para evitar detección
      const mediaDevices = navigator.mediaDevices
      if (mediaDevices && mediaDevices.enumerateDevices) {
        mediaDevices.enumerateDevices = () => Promise.resolve([])
      }

      // Canvas Fingerprinting
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL
      HTMLCanvasElement.prototype.toDataURL = function() {
        const context = this.getContext('2d')
        if (context) {
          const imageData = context.getImageData(0, 0, this.width, this.height)
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = imageData.data[i] ^ (Math.random() * 2)
            imageData.data[i + 1] = imageData.data[i + 1] ^ (Math.random() * 2)
            imageData.data[i + 2] = imageData.data[i + 2] ^ (Math.random() * 2)
          }
          context.putImageData(imageData, 0, 0)
        }
        return originalToDataURL.apply(this, arguments as any)
      }

      // Audio Fingerprinting
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContext) {
        const originalCreateOscillator = AudioContext.prototype.createOscillator
        AudioContext.prototype.createOscillator = function() {
          const oscillator = originalCreateOscillator.apply(this, arguments as any)
          const originalConnect = oscillator.connect
          // @ts-ignore - La propiedad existe pero no está en los tipos
          oscillator.connect = function(destination: AudioNode | AudioParam, output?: number, input?: number) {
            // @ts-ignore - La propiedad existe pero no está en los tipos
            return originalConnect.call(this, destination, output, input)
          }
          return oscillator
        }
      }

      // Timezone spoofing más realista
      const originalDateTimeFormat = Intl.DateTimeFormat
      // @ts-ignore - La propiedad existe pero no está en los tipos
      Intl.DateTimeFormat = function(locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
        const newOptions = { ...options, timeZone: 'America/Argentina/Buenos_Aires' }
        return originalDateTimeFormat.call(this, locales, newOptions)
      }

      // Touch support (importante para consistencia)
      Object.defineProperty(navigator, 'maxTouchPoints', {
        get: () => 0
      })
    })

    // Interceptar requests
    await this.page.setRequestInterception(true)
    
    this.page.on('request', (request) => {
      const resourceType = request.resourceType()
      const url = request.url()

      // Solo bloquear recursos específicos, no todos
      const blockedResources = ['font', 'media'] // Quitar 'image' y 'stylesheet'
      const blockedDomains = [
        'google-analytics.com',
        'googletagmanager.com',
        'facebook.com/tr',
        'doubleclick.net',
        'cloudflare.com/cdn-cgi/challenge-platform',
        'datadome.co',
        'perimeterx.net',
        'shape.security',
        'distilnetworks.com',
        'imperva.com',
        'incapsula.com'
      ]

      // Permitir imágenes y CSS del dominio principal
      const mainDomain = this.getDomainForMarketplace()
      const isMainDomain = url.includes(mainDomain.replace('https://', ''))

      if (!isMainDomain && (blockedResources.includes(resourceType) || 
          blockedDomains.some(domain => url.includes(domain)))) {
        request.abort()
      } else {
        const headers = Object.assign({}, request.headers(), {
          'Referer': this.getReferer(),
          'Origin': this.getOrigin()
        })
        request.continue({ headers })
      }
    })

    // Manejar diálogos (como alertas)
    this.page.on('dialog', async dialog => {
      await dialog.dismiss()
    })

    // Configurar cookies realistas
    await this.setupRealisticCookies()
  }

  private getReferer(): string {
    switch (this.scraperType) {
      case 'mercadoLibre':
        return 'https://www.google.com/'
      case 'olx':
        return 'https://www.google.com.ar/'
      case 'facebook':
        return 'https://www.facebook.com/'
      default:
        return 'https://www.google.com/'
    }
  }

  private getOrigin(): string {
    switch (this.scraperType) {
      case 'mercadoLibre':
        return 'https://www.mercadolibre.com.ar'
      case 'olx':
        return 'https://www.olx.com.ar'
      case 'facebook':
        return 'https://www.facebook.com'
      default:
        return ''
    }
  }

  private async setupRealisticCookies(): Promise<void> {
    if (!this.page) return

    const domain = this.getDomainForMarketplace()
    const now = Date.now()
    const oneYear = 365 * 24 * 60 * 60 * 1000

    // Cookies comunes
    const commonCookies = [
      {
        name: 'session_id',
        value: uuidv4(),
        domain,
        path: '/',
        expires: now + oneYear,
        httpOnly: true,
        secure: true,
        sameSite: 'Lax' as const
      },
      {
        name: 'user_id',
        value: uuidv4(),
        domain,
        path: '/',
        expires: now + oneYear,
        httpOnly: true,
        secure: true,
        sameSite: 'Lax' as const
      },
      {
        name: 'last_visit',
        value: new Date(now - Math.random() * 86400000).toISOString(),
        domain,
        path: '/',
        expires: now + oneYear,
        httpOnly: true,
        secure: true,
        sameSite: 'Lax' as const
      }
    ]

    // Cookies específicas por marketplace
    const marketplaceCookies = this.getMarketplaceSpecificCookies(domain, now, oneYear)

    // Establecer todas las cookies
    await this.page.setCookie(...commonCookies, ...marketplaceCookies)
  }

  private getMarketplaceSpecificCookies(domain: string, now: number, oneYear: number): Cookie[] {
    switch (this.scraperType) {
      case 'mercadoLibre':
        return [
          {
            name: 'ML_visitor',
            value: uuidv4(),
            domain,
            path: '/',
            expires: now + oneYear,
            httpOnly: true,
            secure: true,
            sameSite: 'Lax' as const,
            size: 0,
            session: false
          },
          {
            name: 'ML_region',
            value: 'MLA',
            domain,
            path: '/',
            expires: now + oneYear,
            httpOnly: true,
            secure: true,
            sameSite: 'Lax' as const,
            size: 0,
            session: false
          }
        ]
      case 'olx':
        return [
          {
            name: 'olx_session',
            value: uuidv4(),
            domain,
            path: '/',
            expires: now + oneYear,
            httpOnly: true,
            secure: true,
            sameSite: 'Lax' as const,
            size: 0,
            session: false
          }
        ]
      case 'facebook':
        return [
          {
            name: 'fb_session',
            value: uuidv4(),
            domain,
            path: '/',
            expires: now + oneYear,
            httpOnly: true,
            secure: true,
            sameSite: 'Lax' as const,
            size: 0,
            session: false
          }
        ]
      default:
        return []
    }
  }

  private getDomainForMarketplace(): string {
    switch (this.scraperType) {
      case 'mercadoLibre':
        return '.mercadolibre.com.ar'
      case 'olx':
        return '.olx.com.ar'
      case 'facebook':
        return '.facebook.com'
      default:
        return ''
    }
  }

  protected async humanDelay(min = 1000, max = 3000): Promise<void> {
    // Usar distribución normal en lugar de uniforme
    const mean = (min + max) / 2
    const stdDev = (max - min) / 6
    
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    
    let delay = mean + z0 * stdDev
    delay = Math.max(min, Math.min(max, delay))
    
    if (Math.random() < 0.3) {
      delay += Math.random() * 500
    }
    
    await this.delay(delay)
  }

  protected async intelligentPause(): Promise<void> {
    this.requestCount++
    
    const timeSinceLastRequest = Date.now() - this.lastRequestTime
    
    if (this.requestCount > 10 && timeSinceLastRequest < 5000) {
      console.log('⏸️ Taking a break to avoid detection...')
      await this.humanDelay(10000, 20000)
      this.requestCount = 0
    } else if (this.requestCount > 5) {
      await this.humanDelay(3000, 5000)
    } else {
      await this.humanDelay(1000, 3000)
    }
    
    this.lastRequestTime = Date.now()
  }

  protected async simulateHumanBehavior(): Promise<void> {
    if (!this.page) return

    try {
      const actions = [
        // Movimiento de mouse con curva de Bézier
        async () => {
          const viewport = this.page!.viewport()
          if (viewport) {
            const startX = Math.random() * viewport.width
            const startY = Math.random() * viewport.height
            const endX = Math.random() * viewport.width
            const endY = Math.random() * viewport.height
            
            const cp1x = startX + (endX - startX) * 0.25 + (Math.random() - 0.5) * 100
            const cp1y = startY + (endY - startY) * 0.25 + (Math.random() - 0.5) * 100
            const cp2x = startX + (endX - startX) * 0.75 + (Math.random() - 0.5) * 100
            const cp2y = startY + (endY - startY) * 0.75 + (Math.random() - 0.5) * 100
            
            const steps = 20 + Math.floor(Math.random() * 10)
            for (let i = 0; i <= steps; i++) {
              const t = i / steps
              const x = Math.pow(1-t, 3) * startX + 
                       3 * Math.pow(1-t, 2) * t * cp1x + 
                       3 * (1-t) * Math.pow(t, 2) * cp2x + 
                       Math.pow(t, 3) * endX
              const y = Math.pow(1-t, 3) * startY + 
                       3 * Math.pow(1-t, 2) * t * cp1y + 
                       3 * (1-t) * Math.pow(t, 2) * cp2y + 
                       Math.pow(t, 3) * endY
              
              await this.page!.mouse.move(x, y)
              await this.delay(10 + Math.random() * 20)
            }
          }
        },
        
        // Scroll con inercia
        async () => {
          await this.page!.evaluate(() => {
            let currentPosition = window.scrollY
            const targetPosition = currentPosition + (Math.random() * 300 - 150)
            let velocity = 0
            const friction = 0.8
            const force = 0.2
            
            const animate = () => {
              const distance = targetPosition - currentPosition
              velocity += distance * force
              velocity *= friction
              currentPosition += velocity
              
              window.scrollTo({
                top: currentPosition,
                behavior: 'auto'
              })
              
              if (Math.abs(velocity) > 0.5) {
                requestAnimationFrame(animate)
              }
            }
            
            animate()
          })
        },
        
        // Hover sobre elementos
        async () => {
          const elements = await this.page!.$$('a, button, input')
          if (elements.length > 0) {
            const randomElement = elements[Math.floor(Math.random() * Math.min(elements.length, 10))]
            const box = await randomElement.boundingBox()
            if (box) {
              await this.page!.mouse.move(
                box.x + box.width / 2,
                box.y + box.height / 2,
                { steps: 10 }
              )
              await this.delay(500 + Math.random() * 1000)
            }
          }
        }
      ]

      for (const action of actions) {
        if (Math.random() < 0.7) {
          await action()
          await this.humanDelay(300, 1000)
        }
      }
    } catch (error) {
      // Ignorar errores de simulación
    }
  }

  protected async checkIfBlocked(): Promise<boolean> {
    if (!this.page) return false

    try {
      const pageContent = await this.page.content()
      const pageUrl = this.page.url()
      const title = await this.page.title()

      const indicators = [
        'captcha',
        'recaptcha',
        'robot',
        'blocked',
        'denied',
        'suspicious',
        'unusual activity',
        'security check',
        'validateCaptcha',
        'challenge',
        '/security-check',
        'Tu seguridad es importante'
      ]

      const contentLower = pageContent.toLowerCase()
      const urlLower = pageUrl.toLowerCase()
      const titleLower = title.toLowerCase()

      return indicators.some(indicator => 
        contentLower.includes(indicator.toLowerCase()) || 
        urlLower.includes(indicator.toLowerCase()) ||
        titleLower.includes(indicator.toLowerCase())
      )
    } catch (error) {
      return false
    }
  }

  protected async close(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close()
        this.browser = null
        this.page = null
        console.log(`🔒 ${this.marketplace} scraper closed`)
      }
    } catch (error) {
      console.error(`Error closing ${this.marketplace} scraper:`, error)
    }
  }

  protected generateProductId(): string {
    return uuidv4()
  }

  protected createProduct(
    title: string,
    price: number,
    url: string,
    imageUrl: string,
    description?: string,
    category?: string,
  ): Product {
    return {
      id: this.generateProductId(),
      title: title.trim(),
      price: Math.round(price * 100) / 100,
      marketplace: this.marketplace,
      url: url.trim(),
      imageUrl: imageUrl.trim(),
      description: description?.trim(),
      category: category?.trim(),
    }
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  protected async scrapeWithRetry<T>(
    scrapeFunction: () => Promise<T>,
    context: string
  ): Promise<T | null> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.rateLimiter.checkLimit()
        const result = await scrapeFunction()
        return result
      } catch (error) {
        const shouldRetry = await this.errorHandler.handle(error as Error, context)
        
        if (!shouldRetry || attempt === this.maxRetries) {
          console.error(`❌ Failed after ${attempt} attempts`)
          return null
        }
        
        const waitTime = Math.min(attempt * 5000, 30000)
        console.log(`⏳ Waiting ${waitTime}ms before retry ${attempt + 1}...`)
        await this.delay(waitTime)
        
        if (attempt === this.maxRetries - 1) {
          await this.close()
          await this.initialize()
        }
      }
    }
    
    return null
  }

  // Métodos abstractos que deben ser implementados por las clases hijas
  protected abstract getMainDomain(): string
  public abstract search(query: string): Promise<Product[]>

  protected async navigateWithRetry(url: string, options: any = {}): Promise<boolean> {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        const response = await this.page!.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
          ...options
        })

        // Verificar si fue bloqueado
        if (response) {
          const status = response.status()
          if (status === 403 || status === 429) {
            console.warn(`⚠️ Blocked with status ${status}, retrying...`)
            await this.humanDelay(5000, 10000)
            continue
          }
        }

        // Verificar si hay captcha o bloqueo
        const isBlocked = await this.checkIfBlocked()
        if (isBlocked) {
          console.warn('⚠️ Detected blocking mechanism, retrying...')
          await this.handleBlocking()
          continue
        }

        return true
      } catch (error) {
        console.warn(`Navigation attempt ${i + 1} failed:`, error)
        if (i < this.maxRetries - 1) {
          await this.humanDelay(3000, 6000)
        }
      }
    }
    return false
  }

  protected async handleBlocking(): Promise<void> {
    console.log('🛡️ Handling blocking mechanism...')
    
    // Esperar más tiempo
    await this.humanDelay(10000, 20000)
    
    // Simular comportamiento humano intensivo
    await this.simulateHumanBehavior()
    
    // Intentar refrescar la página
    try {
      await this.page!.reload({ waitUntil: 'networkidle0' })
    } catch (error) {
      // Ignorar errores de recarga
    }

    // Si sigue bloqueado después de varios intentos, cambiar de estrategia
    if (this.retryCount >= 2) {
      console.log('🔄 Switching strategy...')
      // Cambiar user agent
      this.userAgent = this.getRealisticUserAgent()
      await this.page!.setUserAgent(this.userAgent)
      
      // Limpiar cookies
      const cookies = await this.page!.cookies()
      await this.page!.deleteCookie(...cookies)
      
      // Reinicializar
      await this.close()
      await this.initialize()
    }
    
    this.retryCount++
  }

  protected async waitForSelectorWithRetry(
    selector: string, 
    options: { timeout?: number, visible?: boolean } = {}
  ): Promise<boolean> {
    if (!this.page) return false

    const maxAttempts = 3
    const timeout = options.timeout || 10000

    for (let i = 0; i < maxAttempts; i++) {
      try {
        await this.page.waitForSelector(selector, {
          timeout,
          visible: options.visible
        })
        return true
      } catch (error) {
        console.log(`⚠️ Retry ${i + 1}/${maxAttempts} for selector: ${selector}`)
        if (i < maxAttempts - 1) {
          await this.humanDelay()
          await this.simulateHumanBehavior()
          
          // Intentar scroll para cargar elementos lazy
          await this.page.evaluate(() => {
            window.scrollBy(0, window.innerHeight / 2)
          })
        }
      }
    }
    return false
  }

  // Método abstracto para login
  protected abstract performLogin?(): Promise<boolean>

  // Método helper para escribir texto como humano
  protected async typeHumanLike(selector: string, text: string): Promise<void> {
    if (!this.page) return
    
    await this.page.click(selector)
    await this.humanDelay(500, 1000)
    
    // Limpiar el campo primero
    await this.page.evaluate((sel) => {
      const element = document.querySelector(sel) as HTMLInputElement
      if (element) element.value = ''
    }, selector)
    
    // Escribir caracter por caracter con delays variables
    for (const char of text) {
      await this.page.type(selector, char, { 
        delay: Math.floor(Math.random() * 150) + 50 
      })
    }
  }
}