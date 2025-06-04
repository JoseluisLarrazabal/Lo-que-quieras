import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import { promisify } from "util"

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const mkdir = promisify(fs.mkdir)
const access = promisify(fs.access)

// In-memory cache
const memoryCache = new NodeCache({
  stdTTL: 3600, // 1 hour default TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Don't clone objects (for performance)
})

// Cache directory
const CACHE_DIR = path.join(process.cwd(), "cache")

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await access(CACHE_DIR)
  } catch (error) {
    await mkdir(CACHE_DIR, { recursive: true })
  }
}

// Initialize cache
ensureCacheDir().catch(console.error)

// Memory cache functions
export function getFromMemoryCache<T>(key: string): T | undefined {
  return memoryCache.get<T>(key)
}

export function setInMemoryCache<T>(key: string, value: T, ttlSeconds?: number): void {
  memoryCache.set(key, value, ttlSeconds)
}

export function removeFromMemoryCache(key: string): void {
  memoryCache.del(key)
}

export function clearMemoryCache(): void {
  memoryCache.flushAll()
}

// File cache functions
export async function getFromFileCache<T>(key: string): Promise<T | null> {
  try {
    const filePath = path.join(CACHE_DIR, `${key}.json`)
    const data = await readFile(filePath, "utf8")
    const { value, expiry } = JSON.parse(data)

    // Check if cache is expired
    if (expiry && Date.now() > expiry) {
      return null
    }

    return value as T
  } catch (error) {
    return null
  }
}

export async function setInFileCache<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
  try {
    await ensureCacheDir()
    const filePath = path.join(CACHE_DIR, `${key}.json`)
    const expiry = Date.now() + ttlSeconds * 1000
    await writeFile(filePath, JSON.stringify({ value, expiry }), "utf8")
  } catch (error) {
    console.error("Error writing to file cache:", error)
  }
}

// Combined cache functions (memory + file)
export async function getCached<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds = 3600): Promise<T> {
  // Try memory cache first
  const memoryResult = getFromMemoryCache<T>(key)
  if (memoryResult !== undefined) {
    return memoryResult
  }

  // Try file cache
  const fileResult = await getFromFileCache<T>(key)
  if (fileResult !== null) {
    // Store in memory for faster access next time
    setInMemoryCache(key, fileResult, ttlSeconds)
    return fileResult
  }

  // Fetch fresh data
  const freshData = await fetchFn()

  // Store in both caches
  setInMemoryCache(key, freshData, ttlSeconds)
  await setInFileCache(key, freshData, ttlSeconds)

  return freshData
}

export async function getCacheStatus() {
  const memoryStats = memoryCache.getStats()

  return {
    memory: {
      keys: memoryCache.keys().length,
      hits: memoryStats.hits,
      misses: memoryStats.misses,
      ksize: memoryStats.ksize,
      vsize: memoryStats.vsize,
    },
    file: {
      directory: CACHE_DIR,
      exists: fs.existsSync(CACHE_DIR),
    },
  }
}
