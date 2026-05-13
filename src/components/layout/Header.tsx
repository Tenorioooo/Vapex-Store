import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, Settings } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from '../../hooks/useSupabase';
import Logo from '../ui/Logo';

const navLinks = [
  { label: 'Pods Descartáveis', href: '/categoria/pods-descartaveis' },
  { label: 'Life Pod', href: '/categoria/pods-recarregaveis' },
  { label: 'Pod System', href: '/categoria/pod-system' },
  { label: 'Juice', href: '/categoria/essencias' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <div className="bg-[#0a0a0a] text-center text-xs text-gray-400 py-1.5 border-b border-white/5">
        Venda proibida para menores de 18 anos
      </div>
      <header className={`fixed top-[30px] left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <Logo className="w-8 h-8" />
              <span className="text-white font-bold text-xl tracking-tight">
                VAPE<span className="text-cyan-400">X</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.href} to={link.href}
                  className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <Search size={20} />
              </button>
              <Link to={user ? '/conta' : '/login'}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <User size={20} />
              </Link>
              {user && (
                <Link to="/admin/produtos"
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 hidden sm:flex"
                  title="Admin">
                  <Settings size={20} />
                </Link>
              )}
              <Link to="/favoritos"
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 hidden sm:flex">
                <Heart size={20} />
              </Link>
              <Link to="/carrinho" className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-cyan-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>
              <button onClick={() => setMobileOpen(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 lg:hidden">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl mx-4"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar produtos, marcas, sabores..."
                  className="w-full pl-12 pr-12 py-4 bg-[#1a1a1a] border border-white/10 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                />
                <button type="button" onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#0a0a0a] border-l border-white/10 overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="text-white font-bold text-lg">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navLinks.map(link => (
                  <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-white/10 space-y-1">
                <Link to={user ? '/conta' : '/login'} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  <User size={18} /> Minha Conta
                </Link>
                <Link to="/favoritos" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  <Heart size={18} /> Favoritos
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
