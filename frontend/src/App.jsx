import React, { useState, useEffect, useRef } from 'react';
import { Search, ExternalLink, AlertCircle, Trophy, SlidersHorizontal, Sparkles, ShoppingBag, MapPin, ArrowUpDown, X, ChevronDown } from 'lucide-react';

const API_URL = 'http://localhost:5000';

/* ==========================================
   Animated Background Component
   ========================================== */
const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    {/* Base gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950" />
    {/* Ambient orbs */}
    <div className="orb orb-1 animate-float" />
    <div className="orb orb-2 animate-float" style={{ animationDelay: '2s' }} />
    <div className="orb orb-3 animate-float" style={{ animationDelay: '4s' }} />
    {/* Grid pattern overlay */}
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    />
  </div>
);

/* ==========================================
   Loading Skeleton Cards
   ========================================== */
const SkeletonCard = () => (
  <div className="glass-card rounded-2xl p-4 space-y-4 animate-fade-in">
    <div className="skeleton h-44 w-full rounded-xl" />
    <div className="skeleton h-4 w-3/4 rounded" />
    <div className="skeleton h-3 w-1/2 rounded" />
    <div className="skeleton h-6 w-1/3 rounded" />
    <div className="skeleton h-10 w-full rounded-xl" />
  </div>
);

const LoadingGrid = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} style={{ animationDelay: `${i * 0.1}s` }}>
        <SkeletonCard />
      </div>
    ))}
  </div>
);

/* ==========================================
   Platform Badge Component
   ========================================== */
const sourceConfig = {
  'Flipkart': { color: 'from-yellow-500 to-yellow-600', icon: '📱', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  'Amazon': { color: 'from-orange-500 to-orange-600', icon: '🛒', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  'Vijay Sales': { color: 'from-blue-500 to-blue-600', icon: '🏬', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  'JioMart': { color: 'from-indigo-500 to-indigo-600', icon: '🔵', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
};

const PlatformBadge = ({ source }) => {
  const config = sourceConfig[source] || { color: 'from-gray-500 to-gray-600', icon: '🛍️', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border} transition-all duration-200`}>
      <span>{config.icon}</span>
      {source}
    </span>
  );
};

/* ==========================================
   Discount Badge
   ========================================== */
const DiscountBadge = ({ discount }) => {
  if (!discount || discount === 'N/A') return null;
  return (
    <span className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg shadow-rose-500/25 animate-scale-in">
      {discount}
    </span>
  );
};

/* ==========================================
   Product Card Component
   ========================================== */
const ProductCard = ({ product, index, isBestDeal }) => {
  const delay = Math.min(index * 0.07, 0.8);

  return (
    <div
      className={`group relative glass-card rounded-2xl overflow-hidden hover-lift animate-fade-in-up ${isBestDeal ? 'ring-2 ring-brand-500/40 shadow-neon' : ''}`}
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
    >
      {/* Best Deal Crown */}
      {isBestDeal && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-bold rounded-full shadow-lg shadow-brand-500/30">
          <Trophy size={12} />
          Best Deal
        </div>
      )}

      {/* Discount */}
      <DiscountBadge discount={product.discount} />

      {/* Image Container */}
      <div className="relative p-4 pb-2">
        <div className="bg-white/5 rounded-xl p-3 flex items-center justify-center h-48 overflow-hidden group-hover:bg-white/[0.07] transition-colors duration-300">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <ShoppingBag size={48} className="text-surface-600" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-2 flex flex-col gap-2.5 flex-1">
        {/* Title */}
        <h3 className="text-sm font-semibold text-surface-200 line-clamp-2 leading-snug group-hover:text-white transition-colors duration-200">
          {product.title}
        </h3>

        {/* Source */}
        <PlatformBadge source={product.source} />

        {/* Tags */}
        {(product.storage && product.storage !== 'N/A') || (product.color && product.color !== 'N/A') ? (
          <div className="flex flex-wrap gap-1.5">
            {product.storage && product.storage !== 'N/A' && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-800 text-surface-400 border border-surface-700">
                {product.storage}
              </span>
            )}
            {product.color && product.color !== 'N/A' && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-800 text-surface-400 border border-surface-700">
                {product.color}
              </span>
            )}
          </div>
        ) : null}

        {/* Price */}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">{product.price}</span>
            {product.original_price && product.original_price !== product.price && (
              <span className="text-sm line-through text-surface-500">{product.original_price}</span>
            )}
          </div>
        </div>

        {/* CTA */}
        <a
          href={product.url || product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold 
                     bg-gradient-to-r from-brand-600 to-brand-500 text-white
                     hover:from-brand-500 hover:to-brand-400
                     shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30
                     transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          View Deal
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

/* ==========================================
   Custom Select Component
   ========================================== */
const CustomSelect = ({ label, value, onChange, options, icon }) => (
  <div className="flex-1 min-w-[160px]">
    <label className="block text-xs font-medium text-surface-400 mb-1.5 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none w-full px-3 py-2.5 pr-9 bg-surface-800/80 border border-surface-700 rounded-xl text-sm text-surface-200 
                   focus:border-brand-500 focus:ring-0 hover:border-surface-600 
                   transition-all duration-200 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
    </div>
  </div>
);

/* ==========================================
   Best Deal Banner
   ========================================== */
const BestDealBanner = ({ deal }) => {
  if (!deal) return null;
  const config = sourceConfig[deal.source] || {};

  return (
    <div className="animate-slide-down glass rounded-2xl p-5 mb-6 relative overflow-hidden">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-brand-500 to-purple-500" />
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Trophy size={22} className="text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Best Deal</span>
              <PlatformBadge source={deal.source} />
            </div>
            <p className="text-surface-300 text-sm truncate">{deal.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-2xl font-bold text-white">{deal.price}</span>
          <a
            href={deal.url || deal.link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-sm font-bold rounded-xl 
                       hover:from-emerald-400 hover:to-emerald-300 shadow-lg shadow-emerald-500/25
                       transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            Grab Deal →
          </a>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   Empty State Component
   ========================================== */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
    <div className="relative mb-8">
      <div className="w-24 h-24 rounded-full bg-brand-500/10 flex items-center justify-center animate-pulse-glow">
        <Sparkles size={40} className="text-brand-400" />
      </div>
    </div>
    <h2 className="text-2xl font-bold text-white mb-3">Find the Best Deals</h2>
    <p className="text-surface-400 text-center max-w-md mb-6 leading-relaxed">
      Search for any product to compare prices across <span className="text-brand-400 font-medium">Flipkart</span>, <span className="text-orange-400 font-medium">Amazon</span>, <span className="text-blue-400 font-medium">Vijay Sales</span>, and <span className="text-indigo-400 font-medium">JioMart</span>.
    </p>
    <div className="flex flex-wrap justify-center gap-2">
      {['iPhone 15', 'Samsung TV', 'Sony Headphones', 'MacBook Air', 'PS5'].map((term) => (
        <span key={term} className="px-3 py-1.5 bg-surface-800/60 border border-surface-700 rounded-full text-xs text-surface-400 hover:text-brand-400 hover:border-brand-500/30 transition-all duration-200 cursor-default">
          {term}
        </span>
      ))}
    </div>
  </div>
);

/* ==========================================
   Main App Component
   ========================================== */
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
  const [showFilters, setShowFilters] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const searchInputRef = useRef(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setProducts([]);
    setSearchPerformed(true);

    try {
      const response = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, pincode: pincode }),
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
    if (e.key === 'Enter') handleSearch();
  };

  const resetFilters = () => {
    setSelectedSource('all');
    setSelectedCategory('all');
    setSelectedStorage('all');
    setSelectedColor('all');
    setSortBy('price-asc');
  };

  const filteredProducts = products
    .filter((p) => selectedSource === 'all' || p.source === selectedSource)
    .filter((p) => selectedCategory === 'all' || p.category === selectedCategory)
    .filter((p) => selectedStorage === 'all' || p.storage === selectedStorage)
    .filter((p) => selectedColor === 'all' || p.color === selectedColor)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price_num - b.price_num;
      if (sortBy === 'price-desc') return b.price_num - a.price_num;
      return 0;
    });

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const sources = [...new Set(products.map((p) => p.source).filter(Boolean))];
  const storages = [...new Set(products.map((p) => p.storage).filter((s) => s && s !== 'N/A'))].sort();
  const colors = [...new Set(products.map((p) => p.color).filter((c) => c && c !== 'N/A'))].sort();
  const bestDeal = filteredProducts.length > 0 ? filteredProducts[0] : null;
  const activeFilterCount = [selectedSource, selectedCategory, selectedStorage, selectedColor].filter((f) => f !== 'all').length;

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* ===== HEADER / NAVBAR ===== */}
      <header className="sticky top-0 z-50 glass border-b border-surface-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6">
          {/* Brand + Search Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text leading-none">PriceWise</h1>
                <p className="text-[10px] text-surface-500 uppercase tracking-[0.2em] mt-0.5">Smart Comparison</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-1 w-full max-w-2xl gap-2">
              <div className="flex-[3] relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for laptops, phones, headphones..."
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-800/80 border border-surface-700 rounded-xl text-sm text-surface-200 placeholder:text-surface-500
                             focus:border-brand-500 hover:border-surface-600 transition-all duration-200"
                  disabled={loading}
                  id="search-input"
                />
              </div>
              <div className="flex-1 relative min-w-[100px]">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="Pincode"
                  className="w-full pl-8 pr-3 py-2.5 bg-surface-800/80 border border-surface-700 rounded-xl text-sm text-surface-200 placeholder:text-surface-500
                             focus:border-brand-500 hover:border-surface-600 transition-all duration-200"
                  disabled={loading}
                  maxLength={6}
                  id="pincode-input"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl text-sm font-semibold
                           hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg shadow-brand-600/25 hover:shadow-brand-500/30
                           transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97]
                           flex items-center gap-2 whitespace-nowrap"
                id="search-button"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Searching</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span className="hidden sm:inline">Search</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Error Banner */}
        {error && (
          <div className="animate-slide-down flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto hover:text-rose-200 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Best Deal Banner */}
        {bestDeal && !loading && !error && (
          <BestDealBanner deal={bestDeal} />
        )}

        {/* Filter Bar */}
        {products.length > 0 && !loading && (
          <div className="animate-fade-in mb-6">
            {/* Filter Toggle + Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border
                    ${showFilters 
                      ? 'bg-brand-500/15 border-brand-500/30 text-brand-400' 
                      : 'bg-surface-800/60 border-surface-700 text-surface-400 hover:text-surface-200 hover:border-surface-600'
                    }`}
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-brand-500 text-white text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-surface-500 hover:text-brand-400 transition-colors duration-200"
                  >
                    Reset all
                  </button>
                )}
              </div>
              <span className="text-sm text-surface-500">
                <span className="text-white font-semibold">{filteredProducts.length}</span> of {products.length} results
              </span>
            </div>

            {/* Filter Dropdowns */}
            {showFilters && (
              <div className="animate-slide-down flex flex-wrap gap-3 p-4 glass-card rounded-xl mb-4">
                <CustomSelect
                  label="Source"
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Sources' },
                    ...sources.map((s) => ({ value: s, label: `${(sourceConfig[s]?.icon || '🛍️')} ${s}` })),
                  ]}
                />
                <CustomSelect
                  label="Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Categories' },
                    ...categories.map((c) => ({ value: c, label: c })),
                  ]}
                />
                {storages.length > 0 && (
                  <CustomSelect
                    label="Storage"
                    value={selectedStorage}
                    onChange={(e) => setSelectedStorage(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Storage' },
                      ...storages.map((s) => ({ value: s, label: s })),
                    ]}
                  />
                )}
                {colors.length > 0 && (
                  <CustomSelect
                    label="Color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Colors' },
                      ...colors.map((c) => ({ value: c, label: c })),
                    ]}
                  />
                )}
                <CustomSelect
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: 'price-asc', label: '↑ Price: Low to High' },
                    { value: 'price-desc', label: '↓ Price: High to Low' },
                  ]}
                  icon={<ArrowUpDown size={14} />}
                />
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="animate-fade-in">
            <div className="flex flex-col items-center gap-3 mb-8 mt-4">
              <div className="loader" />
              <p className="text-surface-400 text-sm font-medium">Searching across platforms...</p>
              <p className="text-surface-600 text-xs">This may take a few seconds</p>
            </div>
            <LoadingGrid />
          </div>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 products-grid">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={index}
                product={product}
                index={index}
                isBestDeal={index === 0}
              />
            ))}
          </div>
        )}

        {/* No Filter Match */}
        {!loading && products.length > 0 && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-surface-500" />
            </div>
            <p className="text-surface-400 mb-4">No products match your current filters.</p>
            <button
              onClick={resetFilters}
              className="px-5 py-2 bg-brand-600/20 text-brand-400 rounded-xl text-sm font-medium border border-brand-500/20 hover:bg-brand-600/30 transition-all duration-200"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && !searchPerformed && (
          <EmptyState />
        )}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-surface-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <ShoppingBag size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold gradient-text">PriceWise</span>
          </div>
          <p className="text-xs text-surface-600 leading-relaxed">
            Compare prices across Flipkart, Amazon, Vijay Sales & JioMart.
            <br />
            Made with ❤️ for smart shoppers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PriceComparisonApp;
