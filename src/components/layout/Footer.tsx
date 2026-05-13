import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, Mail, Phone, Shield, Truck, CreditCard, Lock } from 'lucide-react';
import Logo from '../ui/Logo';

const footerLinks = {
  produtos: [
    { label: 'Pods Descartáveis', href: '/categoria/pods-descartaveis' },
    { label: 'Life Pod', href: '/categoria/pods-recarregaveis' },
    { label: 'Pod System', href: '/categoria/pod-system' },
    { label: 'Juice', href: '/categoria/essencias' },
  ],
  institucional: [
    { label: 'Sobre Nós', href: '/sobre' },
    { label: 'Política de Privacidade', href: '/privacidade' },
    { label: 'Termos de Uso', href: '/termos' },
    { label: 'Trocas e Devoluções', href: '/trocas' },
    { label: 'FAQ', href: '/faq' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <Logo className="w-8 h-8" />
              <span className="text-white font-bold text-xl tracking-tight">VAPE<span className="text-cyan-400">X</span></span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Experiência premium em cada puff. Tecnologia, sabor e estilo no melhor ecommerce de vape do Brasil.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/vapex.ofc" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-cyan-500/20 flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-all">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Produtos</h3>
            <ul className="space-y-2.5">
              {footerLinks.produtos.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Institucional</h3>
            <ul className="space-y-2.5">
              {footerLinks.institucional.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-500 text-sm mb-4">Receba ofertas exclusivas e lançamentos.</p>
            <form onSubmit={e => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
              <button type="submit" className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm rounded-xl transition-colors">
                OK
              </button>
            </form>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Mail size={14} /> contato@vapex.com.br
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Shield size={14} /> Compra Segura
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Truck size={14} /> Envio Rápido
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Lock size={14} /> Dados Protegidos
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 text-xs font-bold tracking-wider">PIX</div>
            </div>
          </div>
          <p className="text-center text-gray-600 text-xs mt-6">
            VAPEX 2024. Todos os direitos reservados. Venda proibida para menores de 18 anos.
          </p>
        </div>
      </div>
    </footer>
  );
}
