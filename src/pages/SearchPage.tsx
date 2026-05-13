import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingBag, Star, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { useCart } from '../components/layout/CartContext';
import { MOCK_PRODUCTS } from '../data/MOCK_PRODUCTS';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { addItem } = useCart();

  // Estados dos filtros
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [onlyInStock, setOnlyInStock] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!q) { setLoading(false); return; }
      setLoading(true);

      const searchTerm = q.toLowerCase();
      const mockResults = MOCK_PRODUCTS.filter(p => 
        (p.name?.toLowerCase() || '').includes(searchTerm) ||
        (p.brand?.toLowerCase() || '').includes(searchTerm)
      );

      try {
        const { data: dbData } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
          .limit(50);

        const dbProducts = (dbData as Product[]) || [];
        const combined = [...mockResults];
        dbProducts.forEach(dbp => {
          if (!combined.find(p => String(p.id) === String(dbp.id))) {
            combined.push(dbp);
          }
        });
        setProducts(combined);
      } catch (err) {
        setProducts(mockResults);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [q]);

  // Lógica de filtragem local (rápida e funcional)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const matchPrice = p.price <= maxPrice;
      const matchStock = !onlyInStock || p.in_stock !== false;
      return matchBrand && matchPrice && matchStock;
    });
  }, [products, selectedBrands, maxPrice, onlyInStock]);

  // Lista única de marcas para o filtro
  const availableBrands = useMemo(() => {
    const brands = products.map(p => p.brand).filter(Boolean);
    return Array.from(new Set(brands)).sort();
  }, [products]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2">Resultados para "{q}"</h1>
            <p className="text-gray-500">{filteredProducts.length} produtos encontrados</p>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-[#111] border border-white/10 rounded-2xl hover:border-cyan-500/50 transition-all text-sm font-medium"
          >
            <SlidersHorizontal size={18} className="text-cyan-400" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar de Filtros */}
          {showFilters && (
            <aside className="lg:w-64 space-y-8 animate-in fade-in slide-in-from-left duration-300">
              {/* Filtro de Marcas */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center justify-between">
                  Marcas
                  {selectedBrands.length > 0 && (
                    <button onClick={() => setSelectedBrands([])} className="text-[10px] text-cyan-500 hover:underline">Limpar</button>
                  )}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  {availableBrands.map(brand => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="w-4 h-4 rounded border-white/10 bg-[#111] text-cyan-500 focus:ring-cyan-500/20 transition-all"
                      />
                      <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtro de Preço */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Preço Máximo</h3>
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#111] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between mt-2 text-xs font-mono text-cyan-400">
                  <span>R$ 0</span>
                  <span className="bg-cyan-500/10 px-2 py-1 rounded">Até R$ {maxPrice}</span>
                </div>
              </div>

              {/* Filtro de Estoque */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative inline-flex items-center">
                    <input 
                      type="checkbox" 
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#111] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-500 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 after:peer-checked:bg-white"></div>
                  </div>
                  <span className="text-sm text-gray-400 font-medium">Apenas em estoque</span>
                </label>
              </div>
            </aside>
          )}

          {/* Grid de Produtos */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-[#111] rounded-3xl border border-white/5">
                <Search size={48} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-400">Nenhum produto encontrado com esses filtros.</p>
                <button 
                  onClick={() => { setSelectedBrands([]); setMaxPrice(500); setOnlyInStock(false); }}
                  className="mt-4 text-cyan-400 text-sm hover:underline"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <motion.div 
                    layout
                    key={product.id} 
                    className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full group"
                  >
                    <Link to={`/produto/${product.slug}`} className="block relative aspect-square overflow-hidden bg-[#1a1a1a]">
                      <img 
                        src={product.image_url || 'https://via.placeholder.com/400?text=Vapex'} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <div className="p-4 flex-grow flex flex-col">
                      <div className="text-xs text-gray-500 mb-1 font-medium">{product.brand}</div>
                      <Link to={`/produto/${product.slug}`}>
                        <h3 className="text-white font-semibold text-sm hover:text-cyan-400 transition-colors line-clamp-2 min-h-[40px]">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 mt-auto pt-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} className={i < Math.round(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-700'} />
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-white">
                          R$ {(product.price || 0).toFixed(2).replace('.', ',')}
                        </span>
                        <button 
                          onClick={() => addItem(product)}
                          className="p-2.5 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/10 active:scale-95"
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
