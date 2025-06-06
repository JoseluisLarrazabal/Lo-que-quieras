// utils/facebook-monitor.ts
import { Page } from 'puppeteer'

export class FacebookDOMMonitor {
    private static knownStructures: Map<string, string> = new Map()
    
    static async detectStructureChange(page: Page): Promise<boolean> {
      const structure = await page.evaluate(() => {
        // Crear un hash simple de la estructura del DOM
        const elements = document.querySelectorAll('[data-testid], [role]')
        return Array.from(elements)
          .map(el => `${el.tagName}-${el.getAttribute('data-testid') || el.getAttribute('role')}`)
          .join('|')
      })
      
      const previousStructure = this.knownStructures.get('facebook')
    
      if (previousStructure && previousStructure !== structure) {
        console.warn('⚠️ Facebook DOM structure has changed')
        this.knownStructures.set('facebook', structure)
        return true
      }
      
      this.knownStructures.set('facebook', structure)
      return false
    }
    
    static async findNewSelectors(page: Page, targetText: string): Promise<string[]> {
      return await page.evaluate((text: string) => {
        const selectors: string[] = []
        
        // Buscar elementos que contengan el texto objetivo
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              return node.textContent?.includes(text) 
                ? NodeFilter.FILTER_ACCEPT 
                : NodeFilter.FILTER_REJECT
            }
          }
        )
        
        let node
        while (node = walker.nextNode()) {
          const element = node.parentElement
          if (element) {
            // Generar selector único
            let selector = element.tagName.toLowerCase()
            
            // Priorizar data-testid
            if (element.getAttribute('data-testid')) {
              selector = `[data-testid="${element.getAttribute('data-testid')}"]`
            } else if (element.getAttribute('role')) {
              selector += `[role="${element.getAttribute('role')}"]`
            } else if (element.id) {
              selector = `#${element.id}`
            } else if (element.className) {
              const classes = element.className.split(' ').filter(c => c && !c.includes(':'))
              if (classes.length > 0) {
                selector += `.${classes[0]}`
              }
            }
            
            selectors.push(selector)
          }
        }
        
        return [...new Set(selectors)].slice(0, 10)
      }, targetText)
    }
  }