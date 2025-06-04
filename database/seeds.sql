-- Datos de ejemplo para "Lo que quieras!"
-- Estos datos se usan para probar la aplicación

-- Productos de ejemplo de MercadoLibre
INSERT OR IGNORE INTO products (
    id, title, price, marketplace, url, image_url, description, category
) VALUES 
(
    'ml_iphone15_001', 
    'iPhone 15 Pro 128GB Titanio Natural', 
    1299999.99, 
    'MercadoLibre', 
    'https://articulo.mercadolibre.com.ar/MLA-123456789', 
    '/placeholder.svg?height=200&width=200', 
    'iPhone 15 Pro nuevo en caja sellada. Incluye cargador USB-C y documentación. Garantía oficial Apple.', 
    'Electrónicos'
),
(
    'ml_samsung_001', 
    'Samsung Galaxy S23 Ultra 256GB', 
    899999.99, 
    'MercadoLibre', 
    'https://articulo.mercadolibre.com.ar/MLA-987654321', 
    '/placeholder.svg?height=200&width=200', 
    'Samsung Galaxy S23 Ultra nuevo. Pantalla Dynamic AMOLED 6.8". Cámara 200MP.', 
    'Electrónicos'
),
(
    'ml_macbook_001', 
    'MacBook Air M2 13" 256GB', 
    1599999.99, 
    'MercadoLibre', 
    'https://articulo.mercadolibre.com.ar/MLA-555666777', 
    '/placeholder.svg?height=200&width=200', 
    'MacBook Air con chip M2. Pantalla Liquid Retina de 13.6". Nuevo en caja.', 
    'Electrónicos'
);

-- Productos de ejemplo de OLX
INSERT OR IGNORE INTO products (
    id, title, price, marketplace, url, image_url, description, category
) VALUES 
(
    'olx_iphone14_001', 
    'iPhone 14 128GB Azul - Usado', 
    899999.99, 
    'OLX', 
    'https://www.olx.com.ar/item/iphone-14-azul', 
    '/placeholder.svg?height=200&width=200', 
    'iPhone 14 en excelente estado. Sin rayones. Batería al 95%. Incluye cargador.', 
    'Electrónicos'
),
(
    'olx_ps5_001', 
    'PlayStation 5 + 2 Joysticks', 
    699999.99, 
    'OLX', 
    'https://www.olx.com.ar/item/playstation-5-completa', 
    '/placeholder.svg?height=200&width=200', 
    'PS5 en perfecto estado. Incluye 2 controles DualSense y cables originales.', 
    'Electrónicos'
),
(
    'olx_nike_001', 
    'Zapatillas Nike Air Max 270 Talle 42', 
    89999.99, 
    'OLX', 
    'https://www.olx.com.ar/item/nike-air-max-270', 
    '/placeholder.svg?height=200&width=200', 
    'Zapatillas Nike Air Max 270 originales. Poco uso. Excelente estado.', 
    'Ropa'
);

-- Productos de ejemplo de Facebook Marketplace
INSERT OR IGNORE INTO products (
    id, title, price, marketplace, url, image_url, description, category
) VALUES 
(
    'fb_tv_001', 
    'Smart TV Samsung 55" 4K', 
    459999.99, 
    'Facebook Marketplace', 
    'https://www.facebook.com/marketplace/item/123456789', 
    '/placeholder.svg?height=200&width=200', 
    'Smart TV Samsung 55 pulgadas 4K. Excelente imagen. Poco uso.', 
    'Electrónicos'
),
(
    'fb_sofa_001', 
    'Sofá 3 Cuerpos Cuero Marrón', 
    299999.99, 
    'Facebook Marketplace', 
    'https://www.facebook.com/marketplace/item/987654321', 
    '/placeholder.svg?height=200&width=200', 
    'Sofá de cuero genuino en excelente estado. Muy cómodo y elegante.', 
    'Hogar'
),
(
    'fb_bici_001', 
    'Bicicleta Mountain Bike Rodado 29', 
    199999.99, 
    'Facebook Marketplace', 
    'https://www.facebook.com/marketplace/item/456789123', 
    '/placeholder.svg?height=200&width=200', 
    'Mountain bike rodado 29. Cambios Shimano. Excelente para ciudad y montaña.', 
    'Deportes'
);

-- Búsquedas de ejemplo (historial)
INSERT OR IGNORE INTO searches (query) VALUES 
('iPhone'),
('Samsung Galaxy'),
('MacBook'),
('PlayStation 5'),
('Nike Air Max'),
('Smart TV'),
('Sofá'),
('Bicicleta'),
('Auriculares'),
('Notebook');

-- Búsquedas populares adicionales
INSERT OR IGNORE INTO searches (query) VALUES 
('iPhone 15'),
('iPhone 15'),
('iPhone 15'),
('Samsung S23'),
('Samsung S23'),
('MacBook Air'),
('PlayStation 5'),
('PlayStation 5'),
('PlayStation 5'),
('PlayStation 5');

-- Algunos favoritos de ejemplo
INSERT OR IGNORE INTO favorites (product_id) VALUES 
('ml_iphone15_001'),
('olx_ps5_001'),
('fb_tv_001');
