import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import { MOCK_PRODUCTS } from '../../data/MOCK_PRODUCTS';

export default function Hero() {
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledList, setShuffledList] = useState<Product[]>([]);

  useEffect(() => {
    // Filtra e embaralha a lista de produtos em destaque
    const featured = MOCK_PRODUCTS.filter(p => p.is_featured);
    const shuffled = [...featured].sort(() => Math.random() - 0.5);
    
    setShuffledList(shuffled);
    if (shuffled.length > 0) {
      setFeaturedProduct(shuffled[0]);
    }
  }, []);

  useEffect(() => {
    if (shuffledList.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % shuffledList.length;
        setFeaturedProduct(shuffledList[next]);
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [shuffledList]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050505]">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[200px]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6"
            >
              <Sparkles size={14} /> Novo Lançamento
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              O Futuro
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                do Vape
              </span>
              <br />
              Chegou
            </h1>

            <p className="text-lg text-gray-400 max-w-lg mb-8 leading-relaxed">
              Experiência premium em cada puff. Tecnologia de ponta, sabores exclusivos e design que impressiona.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/produtos"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40">
                Explorar Produtos
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/lancamentos"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl border border-white/10 transition-all">
                Lançamentos
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-12">
              <div>
                <div className="text-2xl font-bold text-white">40K+</div>
                <div className="text-sm text-gray-500">Puffs</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-white">200+</div>
                <div className="text-sm text-gray-500">Sabores</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-white">4.8</div>
                <div className="text-sm text-gray-500">Avaliação</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-80 h-80 sm:w-96 sm:h-96">
              {/* Glow rings */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute inset-4 rounded-full border border-blue-500/15 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
              <div className="absolute inset-8 rounded-full border border-emerald-500/10 animate-spin" style={{ animationDuration: '25s' }} />

              {/* Center product display */}
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] border border-white/10 flex items-center justify-center overflow-hidden">
                {featuredProduct?.image_url ? (
                  <img
                    src={featuredProduct.image_url}
                    alt={featuredProduct.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-2">💨</div>
                    <div className="text-white font-bold text-lg">{featuredProduct?.brand || 'Elf Bar'}</div>
                    <div className="text-cyan-400 text-sm">{featuredProduct?.name?.split(' ').slice(-1)[0] || 'BC10000'}</div>
                    {featuredProduct?.puffs && (
                      <div className="mt-2 px-3 py-1 bg-cyan-500/20 rounded-full text-cyan-400 text-xs font-medium">
                        {featuredProduct.puffs.toLocaleString()} Puffs
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Floating specs */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-4 right-4 px-3 py-2 bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/10 rounded-xl text-xs"
              >
                <div className="text-gray-400">Bateria</div>
                <div className="text-white font-semibold">850mAh</div>
              </motion.div>

              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-4 left-4 px-3 py-2 bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/10 rounded-xl text-xs"
              >
                <div className="text-gray-400">Recarga</div>
                <div className="text-white font-semibold">USB-C</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
