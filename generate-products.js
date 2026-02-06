const fs = require('fs');
const https = require('https');

const SHEET_ID = '2PACX-1vRVOL6rI9nUxm-bZURwflTwthZR3ZtzLYGFDMZMNgdN0XcmJi6ngpTeMthNmyenoMHZi2-ca4cMeZof';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv`;

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
            if (index < values.length) {
                product[header] = values[index];
            }
        });
        
        const processedProduct = {
            id: parseInt(product.id) || i,
            name: product.name || 'Unnamed Product',
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
        console.log('Fetching data from Google Sheets...');
        const csvText = await fetchCSV(SHEET_URL);
        
        const products = parseCSV(csvText);
        const jsonData = { products };
        
        fs.writeFileSync('products.json', JSON.stringify(jsonData, null, 2));
        console.log(`✅ Generated products.json with ${products.length} products`);
        
        // Also create a products.js for direct inclusion
        fs.writeFileSync('products.js', `window.productsData = ${JSON.stringify(jsonData)};`);
        console.log('✅ Generated products.js');
        
    } catch (error) {
        console.error('Error:', error.message);
        // Create empty products file
        fs.writeFileSync('products.json', JSON.stringify({ products: [] }, null, 2));
    }
}

main();