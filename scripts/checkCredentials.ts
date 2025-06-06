// scripts/checkCredentials.ts
import dotenv from 'dotenv'
import { resolve } from 'path'

// Cargar específicamente .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

function checkCredentials() {
  console.log('🔍 Checking scraper credentials from .env.local...\n')
  
  const credentials = [
    { name: 'Facebook', email: process.env.FB_EMAIL, password: process.env.FB_PASSWORD },
    { name: 'MercadoLibre', email: process.env.ML_EMAIL, password: process.env.ML_PASSWORD },
    { name: 'OLX', email: process.env.OLX_EMAIL, password: process.env.OLX_PASSWORD }
  ]
  
  let allValid = true
  
  credentials.forEach(({ name, email, password }) => {
    const hasEmail = email && email.length > 0
    const hasPassword = password && password.length > 0
    const isValid = hasEmail && hasPassword
    
    console.log(`${name}:`)
    console.log(`  Email: ${hasEmail ? '✅ Configured' : '❌ Missing'} ${hasEmail ? `(${email?.substring(0, 3)}***@***)` : ''}`)
    console.log(`  Password: ${hasPassword ? '✅ Configured' : '❌ Missing'} ${hasPassword ? '(****)' : ''}`)
    console.log(`  Status: ${isValid ? '✅ Ready' : '❌ Incomplete'}\n`)
    
    if (!isValid) allValid = false
  })
  
  console.log(`Overall status: ${allValid ? '✅ All credentials configured' : '⚠️ Some credentials missing'}`)
  console.log(`\n💡 Tip: Set USE_LOGIN=true in .env.local to enable login`)
  console.log(`Current USE_LOGIN value: ${process.env.USE_LOGIN || 'not set (defaults to false)'}`)
}

checkCredentials() 