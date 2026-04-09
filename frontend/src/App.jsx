import React, { useState } from 'react';
import { Search, TrendingUp, ShoppingCart, ExternalLink, Star, Filter, AlertCircle, Award, CheckCircle, Info } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const PriceComparisonApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pincode, setPincode] = useState('400001');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSource, setSelectedSource] = useState('all');
  const [sortBy, setSortBy] = useState('price-asc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStorage, setSelectedStorage] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setProducts([]);

    try {
      const response = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery, pincode: pincode })
      });

      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        if (data.products.length === 0) {
          setError('No products found. Try a different search term.');
        }
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to connect to server. Make sure the backend is running on http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getSourceIcon = (source) => {
    const icons = {
      'Flipkart': '📱',
      'Amazon': '🛒',
      'Vijay Sales': '🏬',
      'JioMart': '🔵'
    };
    return icons[source] || '🛍️';
  };

  const filteredProducts = products
    .filter(p => selectedSource === 'all' || p.source === selectedSource)
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => selectedStorage === 'all' || p.storage === selectedStorage)
    .filter(p => selectedColor === 'all' || p.color === selectedColor)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price_num - b.price_num;
      if (sortBy === 'price-desc') return b.price_num - a.price_num;
      return 0;
    });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const sources = [...new Set(products.map(p => p.source).filter(Boolean))];
  const storages = [...new Set(products.map(p => p.storage).filter(s => s && s !== 'N/A'))].sort();
  const colors = [...new Set(products.map(p => p.color).filter(c => c && c !== 'N/A'))].sort();
  const bestDeal = filteredProducts.length > 0 ? filteredProducts[0] : null;

  return (
  <div className="min-h-screen bg-gray-50 text-gray-900">
    {/* Header */}
    <header className="p-6 bg-white shadow-sm flex flex-col items-center gap-2">
      <h1 className="text-2xl font-bold">PriceWise</h1>
      <p className="text-gray-600">Compare 4 platforms locally</p>
      <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full max-w-2xl">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for laptops, phones, headphones..."
          className="flex-[3] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base"
          disabled={loading}
        />
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="Pincode (e.g. 400001)"
          className="flex-[1] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base w-full sm:w-auto"
          disabled={loading}
          maxLength={6}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </header>

    {/* Main Content */}
    <main className="p-6 max-w-5xl mx-auto">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Best Deal Banner */}
      {bestDeal && !loading && !error && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-green-700 flex items-center gap-2">
            Best Deal Found! {getSourceIcon(bestDeal.source)} {bestDeal.source}
          </h2>
          <p className="text-gray-800">{bestDeal.title}</p>
          <p className="font-bold text-lg">{bestDeal.price}</p>
          <a
            href={bestDeal.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            View Deal
          </a>
        </div>
      )}

      {/* Filters */}
      {products.length > 0 && !loading && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-semibold mb-1">Source</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="all">All Sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {getSourceIcon(source)} {source}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {storages.length > 0 && (
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-semibold mb-1">Storage</label>
            <select
              value={selectedStorage}
              onChange={(e) => setSelectedStorage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="all">All Storage</option>
              {storages.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          )}

          {colors.length > 0 && (
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-semibold mb-1">Color</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="all">All Colors</option>
              {colors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          )}

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-semibold mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-600">
          <p>Searching across platforms...</p>
          <p>This may take a few seconds</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && filteredProducts.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-3 flex flex-col items-start gap-2 relative">
              {product.discount && product.discount !== "N/A" && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {product.discount}
                </div>
              )}
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-40 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <p className="font-semibold">{product.title}</p>
              <p>{getSourceIcon(product.source)} {product.source}</p>
              <p className="font-bold text-lg">{product.price}</p>
              
              <div className="flex gap-2 text-xs font-medium text-gray-500 mt-1 mb-2">
                {product.storage && product.storage !== "N/A" && (
                  <span className="bg-gray-100 px-2 py-1 rounded">{product.storage}</span>
                )}
                {product.color && product.color !== "N/A" && (
                  <span className="bg-gray-100 px-2 py-1 rounded">{product.color}</span>
                )}
              </div>

              {product.original_price && product.original_price !== product.price && (
                <p className="line-through text-gray-400">{product.original_price}</p>
              )}
              {product.category && <p className="text-sm text-gray-600 mb-2">Category: {product.category}</p>}
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto w-full text-center px-4 py-2 bg-blue-50 text-blue-600 flex items-center justify-center gap-2 rounded-md hover:bg-blue-100 transition-colors font-medium border border-blue-200"
              >
                View Deal <ExternalLink size={16} />
              </a>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length > 0 && filteredProducts.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p>No products match your current filters.</p>
          <button onClick={() => { setSelectedSource('all'); setSelectedCategory('all'); setSelectedColor('all'); setSelectedStorage('all'); }} className="mt-4 text-blue-500 underline">Reset Filters</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center text-gray-600 mt-10">
          <h2 className="text-xl font-semibold mb-2">Start Your Search</h2>
          <p className="mb-4">
            Enter a product name above to compare prices across Flipkart, Amazon, Vijay Sales, and JioMart.
          </p>
          <p className="text-sm text-gray-500">
            Popular searches: iPhone 15, Samsung TV, Sony Headphones, MacBook Air, PlayStation 5
          </p>
        </div>
      )}
    </main>

    {/* Footer */}
    <footer className="text-center p-6 text-sm text-gray-500">
      PriceWise - Compare prices and find the best deals.<br />
      Searches across Flipkart, Amazon, Vijay Sales & JioMart.<br />
      Made with ❤️ for smart shoppers.
    </footer>
  </div>
);
};

export default PriceComparisonApp;
