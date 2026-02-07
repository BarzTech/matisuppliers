const fs = require('fs');
const https = require('https');

// YOUR GOOGLE SHEET
const SHEET_ID = '2PACX-1vRVOL6rI9nUxm-bZURwflTwthZR3ZtzLYGFDMZMNgdN0XcmJi6ngpTeMthNmyenoMHZi2-ca4cMeZof';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=0&single=true&output=csv`;

console.log('📦 Generating products from Google Sheets...');

function fetchCSV(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const product = {};
        
        headers.forEach((header, index) => {
            if (index < values.length) product[header] = values[index];
        });
        
        const processedProduct = {
            id: parseInt(product.id) || i,
            name: product.name || 'Product ' + i,
            category: product.category || 'other',
            price: parseInt(product.price) || 0,
            description: product.description || '',
            image: product.image || '',
            status: product.status || 'active',
            stock: parseInt(product.stock) || 0
        };
        
        if (processedProduct.status === 'active') {
            products.push(processedProduct);
        }
    }
    
    return products;
}

async function main() {
    try {
        console.log('📥 Fetching from Google Sheets...');
        const csvText = await fetchCSV(SHEET_URL);
        
        console.log('📊 Parsing data...');
        const products = parseCSV(csvText);
        
        const jsonData = { 
            products,
            meta: {
                lastUpdated: new Date().toISOString(),
                totalProducts: products.length
            }
        };
        
        fs.writeFileSync('products.json', JSON.stringify(jsonData, null, 2));
        fs.writeFileSync('products.js', `window.productsData = ${JSON.stringify(jsonData)};`);
        
        console.log(`✅ Generated ${products.length} products`);
        console.log(`🕒 Updated: ${new Date().toLocaleTimeString()}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        // Create empty files as fallback
        const fallbackData = { 
            products: [],
            meta: {
                lastUpdated: new Date().toISOString(),
                error: error.message
            }
        };
        
        fs.writeFileSync('products.json', JSON.stringify(fallbackData, null, 2));
        fs.writeFileSync('products.js', `window.productsData = ${JSON.stringify(fallbackData)};`);
        
        console.log('⚠️ Created empty product files as fallback');
    }
}

main();
