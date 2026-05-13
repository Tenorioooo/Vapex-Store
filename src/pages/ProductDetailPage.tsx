import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, Heart, Truck, Shield, CreditCard, ChevronRight, Minus, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Review } from '../types';
import { useCart } from '../components/layout/CartContext';
import { useAuth } from '../hooks/useSupabase';
import ProductImage from '../components/ui/ProductImage';
import { MOCK_PRODUCTS } from '../data/MOCK_PRODUCTS';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase.from('products').select('*, category:categories(*)').eq('slug', slug).maybeSingle().then(({ data }) => {
      if (data) {
        setProduct(data as Product);
        if (data.flavors?.length) setSelectedFlavor(data.flavors[0]);
        if (data.colors?.length) setSelectedColor(data.colors[0]);

        // Fetch reviews
        supabase.from('reviews').select('*').eq('product_id', data.id).order('created_at', { ascending: false }).then(({ data: revs }) => {
          if (revs) setReviews(revs);
        });

        // Fetch related
        supabase.from('products').select('*').eq('category_id', data.category_id).neq('id', data.id).limit(4).then(({ data: rel }) => {
          if (rel) setRelated(rel as Product[]);
        });
      } else {
        // Fallback to local data
        const localProduct = MOCK_PRODUCTS.find(p => p.slug === slug);
        if (localProduct) {
          setProduct(localProduct);
          if (localProduct.flavors?.length) setSelectedFlavor(localProduct.flavors[0]);
          if (localProduct.colors?.length) setSelectedColor(localProduct.colors[0]);

          // Related products from mock
          setRelated(MOCK_PRODUCTS.filter(p => p.category_id === localProduct.category_id && p.id !== localProduct.id).slice(0, 4));
        }
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-[#111] rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-[#111] rounded animate-pulse w-3/4" />
              <div className="h-6 bg-[#111] rounded animate-pulse w-1/2" />
              <div className="h-10 bg-[#111] rounded animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Produto não encontrado</h2>
          <Link to="/produtos" className="text-cyan-400 hover:text-cyan-300">Ver todos os produtos</Link>
        </div>
      </div>
    );
  }

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedFlavor || undefined, selectedColor || undefined);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <ChevronRight size={14} />
          <Link to="/produtos" className="hover:text-gray-300">Produtos</Link>
          <ChevronRight size={14} />
          {product.category && (
            <>
              <Link to={`/categoria/${product.category.slug}`} className="hover:text-gray-300">{product.category.name}</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-white">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] border border-white/5 overflow-hidden">
              <ProductImage src={product.image_url} alt={product.name} brand={product.brand} size="xl" />
            </div>
            {product.badge && (
              <span className="absolute top-4 left-4 px-4 py-2 bg-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg">
                {product.badge}
              </span>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-sm text-gray-500 mb-2">{product.brand}</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} className={i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-700'} />
                ))}
              </div>
              <span className="text-gray-400 text-sm">{product.rating}</span>
              <span className="text-gray-600 text-sm">({product.review_count} avaliações)</span>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-bold text-white">R$ {product.price.toFixed(2).replace('.', ',')}</span>
              {product.compare_at_price && (
                <>
                  <span className="text-xl text-gray-600 line-through">R$ {product.compare_at_price.toFixed(2).replace('.', ',')}</span>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-sm font-bold rounded-lg">-{discount}%</span>
                </>
              )}
            </div>

            {product.price >= 100 && (
              <p className="text-gray-500 text-sm mb-6">
                ou 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')} sem juros
              </p>
            )}

            {/* Flavor selection */}
            {product.flavors?.length > 0 && (
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Sabor</label>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map(flavor => (
                    <button
                      key={flavor}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedFlavor === flavor
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selection */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedColor === color
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block">Quantidade</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-white font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Stock */}
            <div className="mb-6">
              {product.in_stock ? (
                <span className="text-emerald-400 text-sm font-medium">Em estoque{product.stock_count ? ` (${product.stock_count} disponíveis)` : ''}</span>
              ) : (
                <span className="text-red-400 text-sm font-medium">Fora de estoque</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={20} /> Adicionar ao Carrinho
              </button>
              <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-400 hover:text-red-400 transition-colors">
                <Heart size={20} />
              </button>
            </div>

            {/* Quick benefits */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <Truck size={16} className="text-cyan-400" />
                <span className="text-xs text-gray-400">Envio Rápido</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <Shield size={16} className="text-emerald-400" />
                <span className="text-xs text-gray-400">Original</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <CreditCard size={16} className="text-amber-400" />
                <span className="text-xs text-gray-400">Seguro</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-1 p-1 bg-[#111] rounded-xl border border-white/5 mb-8 w-fit">
            {(['description', 'specs', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
              >
                {tab === 'description' ? 'Descrição' : tab === 'specs' ? 'Especificações' : `Avaliações (${product.review_count})`}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert max-w-none">
              <p className="text-gray-400 leading-relaxed">{product.description || 'Descrição em breve.'}</p>
            </motion.div>
          )}

          {activeTab === 'specs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 gap-4">
              {[
                product.puffs && { label: 'Puffs', value: product.puffs.toLocaleString() },
                product.battery && { label: 'Bateria', value: product.battery },
                product.intensity && { label: 'Intensidade', value: product.intensity },
                product.technology && { label: 'Tecnologia', value: product.technology },
                product.brand && { label: 'Marca', value: product.brand },
              ].filter(Boolean).map((spec, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-white/5">
                  <span className="text-gray-500 text-sm">{spec!.label}</span>
                  <span className="text-white font-medium text-sm">{spec!.value}</span>
                </div>
              ))}
              {product.features?.map((feat, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-white/5">
                  <span className="text-gray-500 text-sm">{feat.label || `Feature ${i + 1}`}</span>
                  <span className="text-white font-medium text-sm">{feat.value}</span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma avaliação ainda. Seja o primeiro!</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="p-4 bg-[#0a0a0a] rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-700'} />
                        ))}
                      </div>
                      {review.title && <span className="text-white font-medium text-sm">{review.title}</span>}
                    </div>
                    {review.comment && <p className="text-gray-400 text-sm">{review.comment}</p>}
                  </div>
                ))
              )}
            </motion.div>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} to={`/produto/${p.slug}`}
                  className="group p-4 bg-[#111] rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="aspect-square rounded-xl overflow-hidden mb-3">
                    <ProductImage src={p.image_url} alt={p.name} brand={p.brand} size="md" className="group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="text-xs text-gray-500">{p.brand}</div>
                  <h3 className="text-white font-semibold text-sm line-clamp-1">{p.name}</h3>
                  <div className="text-lg font-bold text-white mt-2">R$ {p.price.toFixed(2).replace('.', ',')}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
