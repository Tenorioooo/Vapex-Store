import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Heart, User, LogOut, ChevronRight, MapPin, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import type { Order, WishlistItem, Product } from '../types';
import ProductImage from '../components/ui/ProductImage';

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setOrders(data);
    });
    supabase.from('wishlists').select('*, product:products(*)').eq('user_id', user.id).then(({ data }) => {
      if (data) setWishlist(data as WishlistItem[]);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-[#050505]" />;

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400',
    processing: 'bg-cyan-500/20 text-cyan-400',
    shipped: 'bg-blue-500/20 text-blue-400',
    delivered: 'bg-emerald-500/20 text-emerald-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    processing: 'Processando',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Minha Conta</h1>
            <p className="text-gray-500 mt-1">{user?.email}</p>
          </div>
          <button onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-400 transition-colors text-sm">
            <LogOut size={16} /> Sair
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-1">
              {([
                { key: 'orders' as const, icon: <Package size={18} />, label: 'Meus Pedidos' },
                { key: 'favorites' as const, icon: <Heart size={18} />, label: 'Favoritos' },
                { key: 'profile' as const, icon: <User size={18} />, label: 'Meus Dados' },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.key ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-bold text-white mb-4">Meus Pedidos</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-700 mb-4" />
                    <p className="text-gray-500">Nenhum pedido encontrado</p>
                    <Link to="/produtos" className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block">
                      Começar a comprar
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div key={order.id} className="p-4 bg-[#0a0a0a] rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-white font-semibold text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                            <span className="text-gray-500 text-xs ml-3">
                              {new Date(order.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                          {order.tracking_code && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin size={12} /> {order.tracking_code}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-bold text-white mb-4">Favoritos</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart size={48} className="mx-auto text-gray-700 mb-4" />
                    <p className="text-gray-500">Nenhum favorito adicionado</p>
                    <Link to="/produtos" className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block">
                      Explorar produtos
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlist.map(item => (
                      <Link key={item.id} to={`/produto/${item.product?.slug}`}
                        className="group p-4 bg-[#0a0a0a] rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="aspect-square rounded-xl overflow-hidden mb-3">
                          <ProductImage src={item.product?.image_url || null} alt={item.product?.name || ''} brand={item.product?.brand} size="md" className="group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h3 className="text-white font-semibold text-sm line-clamp-1">{item.product?.name}</h3>
                        <div className="text-lg font-bold text-white mt-1">R$ {item.product?.price.toFixed(2).replace('.', ',')}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-bold text-white mb-4">Meus Dados</h2>
                <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">E-mail</label>
                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">ID da Conta</label>
                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-sm">
                      {user?.id}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Membro desde</label>
                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
