import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye, Flame, Sparkles, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';
import type { Product } from '../../types';
import { useCart } from '../layout/CartContext';
import ProductImage from '../ui/ProductImage';
import { MOCK_PRODUCTS } from '../../data/MOCK_PRODUCTS';

const badgeStyles: Record<string, { bg: string; text: string; icon?: React.ReactNode }> = {
  'Lancamento': { bg: 'bg-cyan-500', text: 'text-white', icon: <Sparkles size={10} /> },
  'Mais Vendido': { bg: 'bg-amber-500', text: 'text-black', icon: <Flame size={10} /> },
  'Premium': { bg: 'bg-gradient-to-r from-cyan-500 to-blue-600', text: 'text-white' },
  'Best Seller': { bg: 'bg-emerald-500', text: 'text-white', icon: <Flame size={10} /> },
  'Edicao Limitada': { bg: 'bg-rose-500', text: 'text-white' },
  'Novo': { bg: 'bg-cyan-500', text: 'text-white', icon: <Sparkles size={10} /> },
};

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const badge = badgeStyles[product.badge || ''];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="relative bg-[#111] rounded-2xl border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5">
        <Link to={`/produto/${product.slug}`} className="block relative aspect-square overflow-hidden">
          <ProductImage src={product.image_url} alt={product.name} brand={product.brand} size="md" className="group-hover:scale-110 transition-transform duration-500" />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {badge && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${badge.bg} ${badge.text} text-xs font-bold rounded-lg`}>
                {badge.icon}{product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                <Tag size={10} />-{discount}%
              </span>
            )}
          </div>

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={e => { e.preventDefault(); addItem(product); }}
              className="p-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-colors shadow-lg"
            >
              <ShoppingBag size={18} />
            </button>
            <Link to={`/produto/${product.slug}`}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <Eye size={18} />
            </Link>
          </div>
        </Link>

        <div className="p-4">
          <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
          <Link to={`/produto/${product.slug}`}>
            <h3 className="text-white font-semibold text-sm hover:text-cyan-400 transition-colors line-clamp-1">{product.name}</h3>
          </Link>

          {product.puffs && (
            <div className="text-xs text-gray-500 mt-1">{product.puffs.toLocaleString()} puffs</div>
          )}

          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-700'} />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.review_count})</span>
          </div>

          <div className="flex items-end gap-2 mt-3">
            <span className="text-xl font-bold text-white">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.compare_at_price && (
              <span className="text-sm text-gray-600 line-through">
                R$ {product.compare_at_price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          {product.price >= 100 && (
            <div className="text-xs text-gray-500 mt-1">
              ou 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'featured' | 'new' | 'offers'>('featured');

  useEffect(() => {
    let query = supabase.from('products').select('*, category:categories(*)');
    if (activeTab === 'featured') query = query.eq('badge', 'Mais Vendido');
    else if (activeTab === 'new') query = query.eq('is_new', true);
    else query = query.not('compare_at_price', 'is', null);

    query.limit(8).then(({ data }) => {
      if (data && data.length > 0) {
        setProducts(data as Product[]);
      } else {
        // Use local data when Supabase is missing
        setProducts(MOCK_PRODUCTS.filter(p => {
          if (activeTab === 'featured') return p.badge === 'Mais Vendido';
          if (activeTab === 'new') return p.is_new;
          if (activeTab === 'offers') return (p.compare_at_price ?? 0) > 0;
          return true;
        }));
      }
    });
  }, [activeTab]);

  const tabs = [
    { key: 'featured' as const, label: 'Destaques' },
    { key: 'new' as const, label: 'Lancamentos' },
    { key: 'offers' as const, label: 'Ofertas' },
  ];

  return (
    <section className="py-20 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Produtos em Destaque</h2>
            <p className="text-gray-500 mt-2">Os mais vendidos e desejados</p>
          </motion.div>

          <div className="flex gap-1 p-1 bg-[#111] rounded-xl border border-white/5">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.key
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/produtos"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl border border-white/10 transition-all">
            Ver Todos os Produtos
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
