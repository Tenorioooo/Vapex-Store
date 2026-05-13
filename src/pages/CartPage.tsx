import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../components/layout/CartContext';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import ProductImage from '../components/ui/ProductImage';

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const shipping = 0;
  const finalTotal = total - discount + shipping;

  const handleCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    if (!coupon.trim()) return;

    const { data } = await supabase.from('coupons').select('*').eq('code', coupon.toUpperCase()).eq('is_active', true).maybeSingle();
    if (!data) {
      setCouponError('Cupom inválido');
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError('Cupom expirado');
      return;
    }
    if (data.max_uses && data.uses_count >= data.max_uses) {
      setCouponError('Cupom esgotado');
      return;
    }
    const disc = (total * data.discount_percent) / 100;
    setDiscount(disc);
    setCouponSuccess(`Cupom aplicado! ${data.discount_percent}% de desconto`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-700 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Seu carrinho está vazio</h2>
          <p className="text-gray-500 mb-8">Explore nossos produtos e adicione ao carrinho</p>
          <Link to="/produtos"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/25">
            Explorar Produtos <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Carrinho</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex gap-4 p-4 bg-[#0a0a0a] rounded-2xl border border-white/5"
              >
                <Link to={`/produto/${item.product?.slug || ''}`}
                  className="w-24 h-24 shrink-0 rounded-xl overflow-hidden">
                  <ProductImage src={item.product?.image_url || null} alt={item.product?.name || ''} brand={item.product?.brand} size="sm" />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/produto/${item.product?.slug || ''}`}>
                    <h3 className="text-white font-semibold text-sm hover:text-cyan-400 transition-colors truncate">
                      {item.product?.name || 'Produto'}
                    </h3>
                  </Link>
                  <div className="text-xs text-gray-500 mt-1">{item.product?.brand}</div>
                  {item.flavor && <div className="text-xs text-gray-500">Sabor: {item.flavor}</div>}
                  {item.color && <div className="text-xs text-gray-500">Cor: {item.color}</div>}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-white text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">
                        R$ {((item.product?.price ?? 0) * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                      <button onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 space-y-4">
              <h2 className="text-lg font-bold text-white">Resumo</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto</span>
                    <span>-R$ {discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Frete</span>
                  <span>{shipping === 0 ? <span className="text-emerald-400">Grátis</span> : `R$ ${shipping.toFixed(2).replace('.', ',')}`}</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>


              {/* Coupon */}
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      value={coupon}
                      onChange={e => setCoupon(e.target.value)}
                      placeholder="Cupom de desconto"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <button onClick={handleCoupon}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium transition-colors">
                    Aplicar
                  </button>
                </div>
                {couponError && <p className="text-red-400 text-xs mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-emerald-400 text-xs mt-1">{couponSuccess}</p>}
              </div>

              <Link to="/checkout"
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/25">
                Finalizar Compra <ArrowRight size={18} />
              </Link>

              <Link to="/produtos" className="block text-center text-sm text-gray-400 hover:text-white transition-colors">
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
