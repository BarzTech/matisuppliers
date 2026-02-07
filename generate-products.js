const fs = require('fs');
const path = require('path');

// Simple CSV parser
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = [];
        let current = '';
        let inQuotes = false;
        
        // Parse CSV line handling quotes
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        const product = {};
        headers.forEach((header, index) => {
            product[header] = values[index] || '';
        });
        
        // Convert price to number
        if (product.price) {
            product.price = parseInt(product.price) || 0;
        }
        
        // Add ID if missing
        if (!product.id) {
            product.id = i;
        }
        
        products.push(product);
    }
    
    return products;
}

function generateProducts() {
    console.log('🚀 Starting product generation...');
    
    try {
        // 1. Read CSV file
        const csvPath = path.join(__dirname, 'products.csv');
        if (!fs.existsSync(csvPath)) {
            console.error('❌ ERROR: products.csv not found!');
            return;
        }
        
        const csvData = fs.readFileSync(csvPath, 'utf8');
        console.log('📁 Loaded products.csv');
        
        // 2. Parse CSV
        const products = parseCSV(csvData);
        console.log(`✅ Found ${products.length} products`);
        
        if (products.length === 0) {
            console.log('⚠️ No products found in CSV');
            return;
        }
        
        // 3. Create products.json
        fs.writeFileSync('products.json', JSON.stringify({ products }, null, 2));
        console.log('✅ Created products.json');
        
        // 4. Create products.js for direct browser loading
        const jsContent = `window.productsData = ${JSON.stringify({ products }, null, 2)};`;
        fs.writeFileSync('products.js', jsContent);
        console.log('✅ Created products.js');
        
        console.log('✅ All files generated successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the function
generateProducts();
