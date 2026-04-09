from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import concurrent.futures

from scrapers.amazon import AmazonScraper
from scrapers.flipkart import FlipkartScraper
from scrapers.vijaysales import VijaySalesScraper
from scrapers.jiomart import JioMartScraper

import ssl
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask Application
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

def run_scraper(scraper_class, search_query, pincode):
    """Instantiate a scraper and run it"""
    scraper = scraper_class()
    if hasattr(scraper, 'pincode'):
        scraper.pincode = pincode
    return scraper.scrape(search_query)

def compare_prices_concurrently(search_query, pincode="400001"):
    """Compare prices across all platforms in parallel"""
    logger.info(f"\n🔍 UNIVERSAL PRICE COMPARISON (CONCURRENT)")
    logger.info(f"Searching for: '{search_query}' | Pincode: {pincode}")
    logger.info("=" * 60)
    
    scrapers = [
        AmazonScraper,
        FlipkartScraper,
        VijaySalesScraper,
        JioMartScraper
    ]
    
    all_products = []
    
    # Run scrapers in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_to_scraper = {executor.submit(run_scraper, scraper, search_query, pincode): scraper for scraper in scrapers}
        for future in concurrent.futures.as_completed(future_to_scraper):
            try:
                products = future.result()
                all_products.extend(products)
            except Exception as exc:
                logger.error(f"A scraper generated an exception: {exc}")
                
    # Filter valid products
    temp_valid = [p for p in all_products if p['price_num'] is not None and p['price_num'] >= 10]
    
    # Pass 2: Median Outlier Filter
    valid_products = temp_valid
    if len(temp_valid) > 2:
        prices = sorted([p['price_num'] for p in temp_valid])
        mid = len(prices) // 2
        median_price = (prices[mid] + prices[~mid]) / 2.0
        
        # 30% threshold of median drops obvious accessories 
        # Ex: If median iphone is 70k, 30% is 21k. A 500rs charger is dropped.
        threshold = median_price * 0.3
        valid_products = [p for p in temp_valid if p['price_num'] >= threshold]
        
    valid_products.sort(key=lambda x: x['price_num'])
    
    logger.info(f"\n✅ Total products found: {len(valid_products)}")
    return valid_products

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'Price Comparison API is running',
        'version': '2.0.0'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running'
    }), 200

@app.route('/api/search', methods=['POST'])
def search_products():
    """Search products across all platforms"""
    try:
        data = request.json
        query = data.get('query', '').strip()
        pincode = data.get('pincode', '400001').strip()
        
        if not query:
            return jsonify({
                'error': 'Search query is required',
                'products': []
            }), 400
        
        logger.info(f"\n📡 API Request received for: {query}")
        
        products = compare_prices_concurrently(query, pincode)
        
        logger.info(f"✅ Returning {len(products)} products to frontend\n")
        
        return jsonify({
            'success': True,
            'query': query,
            'total_products': len(products),
            'products': products
        }), 200
    
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'products': []
        }), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 PRICE COMPARISON API SERVER (V2 - CONCURRENT)")
    print("="*60)
    print("📡 Server running on http://localhost:5000")
    print("🌐 Ready to receive search requests")
    print("📝 Endpoints:")
    print("   - GET  /               : Health check")
    print("   - GET  /api/health     : Health status")
    print("   - POST /api/search     : Search products")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)