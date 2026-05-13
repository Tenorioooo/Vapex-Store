import { motion } from 'framer-motion';
import { Truck, Shield, QrCode, Headphones, Eye } from 'lucide-react';

const benefits = [
  { icon: <Truck size={24} />, title: 'Frete Grátis', desc: 'Para todo o Brasil, sem valor mínimo', color: 'from-cyan-500 to-blue-600' },
  { icon: <Shield size={24} />, title: 'Produtos Originais', desc: '100% originais com garantia de autenticidade', color: 'from-emerald-500 to-teal-600' },
  { icon: <QrCode size={24} />, title: 'Pagamento Seguro', desc: 'PIX com proteção total', color: 'from-amber-500 to-orange-600' },
  { icon: <Headphones size={24} />, title: 'Suporte Especializado', desc: 'Atendimento premium', color: 'from-rose-500 to-pink-600' },
  { icon: <Eye size={24} />, title: 'Compra Discreta', desc: 'Embalagem discreta para sua privacidade', color: 'from-violet-500 to-purple-600' },
];

export default function Benefits() {
  return (
    <section className="py-20 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Por que escolher a VAPEX?</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Experiência premium do início ao fim</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 text-center transition-all duration-300"
            >
              <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {b.icon}
              </div>
              <h3 className="text-white font-semibold mb-1">{b.title}</h3>
              <p className="text-gray-500 text-sm">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
