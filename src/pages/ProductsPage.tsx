import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingBag, Grid3x3 as Grid3X3, LayoutList, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import { useCart } from '../components/layout/CartContext';
import { MOCK_PRODUCTS } from '../data/MOCK_PRODUCTS';

export default function ProductsPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const { addItem } = useCart();

  // Estados dos filtros
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [onlyInStock, setOnlyInStock] = useState(false);

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      // 1. Definir categoria se houver slug
      let categoryId = '';
      if (slug) {
        const { data: catData } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
        setCategory(catData);
        categoryId = catData?.id || slug;
      } else {
        setCategory(null);
      }

      // 2. Buscar produtos (Supabase + Mock)
      try {
        let query = supabase.from('products').select('*');
        if (categoryId) query = query.eq('category_id', categoryId);
        const { data: dbData } = await query;
        
        const dbProducts = (dbData as Product[]) || [];
        const mockFiltered = categoryId 
          ? MOCK_PRODUCTS.filter(p => p.category_id === categoryId || p.category_id === slug)
          : MOCK_PRODUCTS;

        const combined = [...dbProducts];
        mockFiltered.forEach(mp => {
          if (!combined.find(p => String(p.id) === String(mp.id))) {
            combined.push(mp);
          }
        });

        setProducts(combined);
      } catch (err) {
        setProducts(MOCK_PRODUCTS.filter(p => !slug || p.category_id === slug));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  // Lógica de filtragem e ordenação
  const processedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const matchPrice = p.price <= maxPrice;
      const matchStock = !onlyInStock || p.in_stock !== false;
      return matchBrand && matchPrice && matchStock;
    });

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'review_count') return (b.review_count || 0) - (a.review_count || 0);
      return 0; // Default created_at (already handled by fetch usually)
    });

    return result;
  }, [products, selectedBrands, maxPrice, onlyInStock, sortBy]);

  const brands = useMemo(() => {
    const b = products.map(p => p.brand).filter(Boolean);
    return Array.from(new Set(b)).sort();
  }, [products]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const title = category ? category.name : 'Todos os Produtos';

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <ChevronRight size={14} />
          <span className="text-white">{title}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white">{title}</h1>
            <p className="text-gray-500 mt-2">{processedProducts.length} produtos disponíveis</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all text-sm font-medium ${showFilters ? 'bg-cyan-500 border-cyan-500 text-black' : 'bg-[#111] border-white/10 text-white hover:border-white/20'}`}
            >
              <SlidersHorizontal size={18} />
              Filtros
            </button>
            


            <div className="hidden sm:flex p-1 bg-[#111] rounded-lg border border-white/10">
              <button onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
                <Grid3X3 size={16} />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
                <LayoutList size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <AnimatePresence>
            {showFilters && (
              <motion.aside 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:w-64 space-y-8"
              >
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Marcas</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {brands.map(brand => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 rounded border-white/10 bg-[#111] text-cyan-500 focus:ring-cyan-500/20"
                        />
                        <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Preço Máximo</h3>
                  <input 
                    type="range" min="0" max="1000" step="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#111] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between mt-2 text-xs font-mono text-cyan-400">
                    <span>R$ 0</span>
                    <span className="bg-cyan-500/10 px-2 py-1 rounded">R$ {maxPrice}</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={onlyInStock}
                        onChange={(e) => setOnlyInStock(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#111] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-500 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </div>
                    <span className="text-sm text-gray-400 font-medium">Apenas em estoque</span>
                  </label>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-[#111] rounded-2xl animate-pulse border border-white/5" />
                ))}
              </div>
            ) : processedProducts.length === 0 ? (
              <div className="text-center py-32 bg-[#111] rounded-3xl border border-white/5 shadow-2xl">
                <SlidersHorizontal size={48} className="mx-auto text-gray-800 mb-4" />
                <p className="text-gray-500 text-lg">Nenhum produto corresponde aos filtros.</p>
                <button 
                  onClick={() => { setSelectedBrands([]); setMaxPrice(1000); setOnlyInStock(false); }}
                  className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 text-sm font-semibold"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {processedProducts.map(product => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-[#111] rounded-2xl border border-white/5 overflow-hidden flex flex-col group hover:border-cyan-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/5 ${viewMode === 'list' ? 'md:flex-row' : ''}`}
                  >
                    <Link to={`/produto/${product.slug}`} className={`block relative bg-[#1a1a1a] overflow-hidden ${viewMode === 'list' ? 'md:w-64 shrink-0' : 'aspect-square'}`}>
                      <img 
                        src={product.image_url || 'https://via.placeholder.com/400?text=Vapex'} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {product.badge && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                          {product.badge}
                        </span>
                      )}
                    </Link>

                    <div className="p-5 flex-grow flex flex-col">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{product.brand}</div>
                      <Link to={`/produto/${product.slug}`}>
                        <h3 className="text-white font-bold text-sm hover:text-cyan-400 transition-colors line-clamp-2 min-h-[40px] leading-tight">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-1 mt-auto pt-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={10} className={i < Math.round(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-800'} />
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-black text-white">
                          R$ {(product.price || 0).toFixed(2).replace('.', ',')}
                        </span>
                        <button 
                          onClick={() => addItem(product)}
                          className="p-3 bg-white text-black rounded-xl hover:bg-cyan-500 hover:text-black transition-all shadow-xl active:scale-95"
                        >
                          <ShoppingBag size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
