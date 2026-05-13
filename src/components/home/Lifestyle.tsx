import { motion } from 'framer-motion';

export default function Lifestyle() {
  return (
    <section className="py-20 bg-[#080808] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Experiência premium
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  em cada puff
                </span>
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Mais do que um dispositivo, uma experiência. Tecnologia avançada, sabores exclusivos e design que reflete seu estilo.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { title: 'Tecnologia Avançada', desc: 'Sistemas de aquecimento de última geração para sabor puro', icon: '⚡' },
                { title: 'Sabores Exclusivos', desc: 'Desenvolvidos por especialistas para uma experiência única', icon: '🎯' },
                { title: 'Design Premium', desc: 'Materiais de alta qualidade com acabamento impecável', icon: '✨' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Night Vibe', gradient: 'from-cyan-900/40 to-blue-900/40', emoji: '🌙' },
                { label: 'Urban Style', gradient: 'from-emerald-900/40 to-teal-900/40', emoji: '🏙️' },
                { label: 'Premium Life', gradient: 'from-rose-900/40 to-pink-900/40', emoji: '💎' },
                { label: 'Tech Future', gradient: 'from-amber-900/40 to-orange-900/40', emoji: '🚀' },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`aspect-square rounded-2xl bg-gradient-to-br ${card.gradient} border border-white/5 flex flex-col items-center justify-center gap-3 hover:border-white/10 transition-colors`}
                >
                  <span className="text-4xl">{card.emoji}</span>
                  <span className="text-white font-semibold text-sm">{card.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Floating quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="absolute -bottom-4 left-4 right-4 p-4 bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl"
            >
              <p className="text-white font-medium text-sm italic">
                "O futuro do vape chegou. Tecnologia, sabor e estilo em um só lugar."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
