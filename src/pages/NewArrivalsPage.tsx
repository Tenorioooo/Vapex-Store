import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../data/MOCK_PRODUCTS';
import type { Product } from '../types';
import { useCart } from '../components/layout/CartContext';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    // Filtra apenas os produtos marcados como novos (is_new)
    const newProducts = MOCK_PRODUCTS.filter(p => p.is_new);
    setProducts(newProducts);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6"
          >
            <Sparkles size={14} /> Novidades Fresquinhas
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Lançamentos</h1>
          <p className="text-gray-500 max-w-2xl text-lg">
            Confira as últimas novidades que acabaram de chegar na Vapex. Tecnologia de ponta e os sabores mais desejados do momento.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden flex flex-col group"
            >
              <Link to={`/produto/${product.slug}`} className="block relative aspect-square overflow-hidden bg-[#1a1a1a]">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">💨</div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Novo
                  </span>
                </div>
              </Link>

              <div className="p-5 flex-grow flex flex-col">
                <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
                <Link to={`/produto/${product.slug}`}>
                  <h3 className="text-white font-semibold text-sm hover:text-cyan-400 transition-colors line-clamp-2 min-h-[40px]">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-1 mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < Math.round(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-700'}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-white">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    {product.compare_at_price && (
                      <span className="text-xs text-gray-500 line-through">
                        R$ {product.compare_at_price.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => addItem(product)}
                    className="p-3 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                  >
                    <ShoppingBag size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
