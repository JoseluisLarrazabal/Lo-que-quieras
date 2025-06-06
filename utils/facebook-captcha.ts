// utils/facebook-captcha.ts
import { Page } from "puppeteer"

export class FacebookCaptchaHandler {
  static async checkAndHandle(page: Page): Promise<boolean> {
    const captchaSelectors = [
      'div[aria-label*="Security Check"]',
      'div[role="main"] img[src*="captcha"]',
      'input[name="captcha_response"]'
    ]
    
    for (const selector of captchaSelectors) {
      const element = await page.$(selector)
      if (element) {
        console.log('🔒 Captcha detected on Facebook')
        
        // Aquí podrías integrar un servicio de resolución de captchas
        // o notificar al usuario para resolverlo manualmente
        
        // Por ahora, esperar y reintentar
        await new Promise(resolve => setTimeout(resolve, 30000))
        return true
      }
    }
    
    return false
  }
} 