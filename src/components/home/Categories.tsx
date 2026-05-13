import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wind, Battery, Droplets, Cpu } from 'lucide-react';

const categories = [
  {
    id: '1',
    name: 'Pods Descartáveis',
    slug: 'pods-descartaveis',
    description: 'Praticidade e sabor em cada puff',
    icon: <Wind size={28} />,
    colors: { from: 'from-cyan-500', to: 'to-blue-600', glow: 'shadow-cyan-500/20' }
  },
  {
    id: '2',
    name: 'Life Pod',
    slug: 'pods-recarregaveis',
    description: 'Sustentabilidade e performance',
    icon: <Battery size={28} />,
    colors: { from: 'from-emerald-500', to: 'to-teal-600', glow: 'shadow-emerald-500/20' }
  },
  {
    id: '3',
    name: 'Pod System',
    slug: 'pod-system',
    description: 'Sistemas avançados e compactos',
    icon: <Cpu size={28} />,
    colors: { from: 'from-indigo-500', to: 'to-violet-600', glow: 'shadow-indigo-500/20' }
  },
  {
    id: '4',
    name: 'Juice',
    slug: 'essencias',
    description: 'As melhores essências do mercado',
    icon: <Droplets size={28} />,
    colors: { from: 'from-rose-500', to: 'to-pink-600', glow: 'shadow-rose-500/20' }
  }
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Categories() {
  return (
    <section className="py-20 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Categorias</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Encontre o produto perfeito para sua experiência</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {categories.map(cat => (
            <motion.div key={cat.id} variants={item}>
              <Link to={`/categoria/${cat.slug}`}
                className={`group relative block p-6 rounded-2xl bg-[#111] border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg ${cat.colors.glow} text-center overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${cat.colors.from} ${cat.colors.to} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>
                <h3 className="text-white font-semibold text-sm">{cat.name}</h3>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{cat.description}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
