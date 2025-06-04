-- Schema para la base de datos SQLite de "Lo que quieras!"
-- Comparador de precios libre

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    price REAL,
    marketplace TEXT,
    url TEXT,
    image_url TEXT,
    description TEXT,
    category TEXT,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de búsquedas (historial)
CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_products_marketplace ON products(marketplace);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_cached_at ON products(cached_at);
CREATE INDEX IF NOT EXISTS idx_searches_query ON searches(query);
CREATE INDEX IF NOT EXISTS idx_searches_created_at ON searches(created_at);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

-- Trigger para limpiar favoritos cuando se elimina un producto
CREATE TRIGGER IF NOT EXISTS cleanup_favorites_on_product_delete
    AFTER DELETE ON products
    FOR EACH ROW
BEGIN
    DELETE FROM favorites WHERE product_id = OLD.id;
END;

-- Vista para obtener productos con información de favoritos
CREATE VIEW IF NOT EXISTS products_with_favorites AS
SELECT 
    p.*,
    CASE WHEN f.product_id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
FROM products p
LEFT JOIN favorites f ON p.id = f.product_id;

-- Vista para estadísticas de búsquedas
CREATE VIEW IF NOT EXISTS search_stats AS
SELECT 
    query,
    COUNT(*) as search_count,
    MAX(created_at) as last_searched,
    MIN(created_at) as first_searched
FROM searches 
GROUP BY query
ORDER BY search_count DESC;
