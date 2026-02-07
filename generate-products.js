const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync'); // npm install csv-parse

function generateProducts() {
  try {
    // 1. Read CSV file
    const csvData = fs.readFileSync(path.join(__dirname, 'products.csv'), 'utf8');
    
    // 2. Parse CSV
    const products = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`Loaded ${products.length} products from CSV`);
    
    // 3. Generate HTML for products page
    const productsHTML = products.map(product => `
      <div class="product-card" data-category="${product.Category.toLowerCase().replace(' ', '-')}" data-featured="${product.Featured === 'Yes' ? 'true' : 'false'}">
        <div class="product-image">
          <img src="images/${product.Image}" alt="${product.Name}" loading="lazy">
          ${product.Stock < 10 ? '<span class="low-stock">Low Stock</span>' : ''}
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.Name}</h3>
          <span class="product-category">${product.Category}</span>
          <p class="product-description">${product.Description}</p>
          <div class="product-footer">
            <span class="product-price">${product.Price}</span>
            <span class="product-stock">${product.Stock} in stock</span>
          </div>
          <button class="add-to-cart" data-id="${product.ID}">Add to Quote</button>
        </div>
      </div>
    `).join('\n');
    
    // 4. Generate full HTML page
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MATI SUPPLIERS - Industrial Products</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header { background: #1a365d; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        h1 { margin-bottom: 10px; }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
        .product-card { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: transform 0.3s; }
        .product-card:hover { transform: translateY(-5px); }
        .product-image { position: relative; height: 200px; overflow: hidden; }
        .product-image img { width: 100%; height: 100%; object-fit: cover; }
        .low-stock { position: absolute; top: 10px; right: 10px; background: #f56565; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
        .product-info { padding: 20px; }
        .product-title { font-size: 18px; margin-bottom: 8px; color: #2d3748; }
        .product-category { display: inline-block; background: #e2e8f0; color: #4a5568; padding: 3px 10px; border-radius: 12px; font-size: 12px; margin-bottom: 10px; }
        .product-description { color: #718096; margin-bottom: 15px; font-size: 14px; line-height: 1.5; }
        .product-footer { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .product-price { font-size: 20px; font-weight: bold; color: #2b6cb0; }
        .product-stock { color: #48bb78; font-size: 14px; }
        .add-to-cart { width: 100%; background: #4299e1; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background 0.3s; }
        .add-to-cart:hover { background: #3182ce; }
        .filters { margin-bottom: 20px; }
        .filter-btn { background: #e2e8f0; border: none; padding: 8px 16px; margin-right: 10px; border-radius: 6px; cursor: pointer; }
        .filter-btn.active { background: #4299e1; color: white; }
        @media (max-width: 768px) {
          .products-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>🏭 MATI SUPPLIERS</h1>
          <p>Industrial Safety Equipment & Supplies</p>
        </header>
        
        <div class="filters">
          <button class="filter-btn active" data-filter="all">All Products</button>
          <button class="filter-btn" data-filter="safety">Safety</button>
          <button class="filter-btn" data-filter="footwear">Footwear</button>
          <button class="filter-btn" data-filter="head-protection">Head Protection</button>
          <button class="filter-btn" data-filter="visibility">Visibility</button>
          <button class="filter-btn" data-filter="hearing">Hearing</button>
          <button class="filter-btn" data-filter="eye-protection">Eye Protection</button>
          <button class="filter-btn" data-filter="respiratory">Respiratory</button>
          <button class="filter-btn" data-filter="medical">Medical</button>
          <button class="filter-btn" data-filter="featured">Featured</button>
        </div>
        
        <div class="products-grid" id="products-container">
          ${productsHTML}
        </div>
      </div>
      
      <script>
        // Filter functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            const products = document.querySelectorAll('.product-card');
            
            products.forEach(product => {
              if (filter === 'all' || 
                  (filter === 'featured' && product.dataset.featured === 'true') ||
                  product.dataset.category.includes(filter)) {
                product.style.display = 'block';
              } else {
                product.style.display = 'none';
              }
            });
          });
        });
        
        // Add to cart/quote functionality
        document.querySelectorAll('.add-to-cart').forEach(btn => {
          btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            const productName = this.closest('.product-card').querySelector('.product-title').textContent;
            alert('Added to quote: ' + productName);
            // Here you would normally add to a cart/quote system
          });
        });
      </script>
    </body>
    </html>
    `;
    
    // 5. Write to file
    fs.writeFileSync('index.html', htmlTemplate);
    console.log('✅ HTML file generated successfully!');
    
    // 6. Also create a simple products.json for API use (optional)
    fs.writeFileSync('products.json', JSON.stringify({ products }, null, 2));
    console.log('✅ JSON file created for API use');
    
  } catch (error) {
    console.error('❌ Error generating products:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateProducts();
}

module.exports = { generateProducts };
