import { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, Truck, HelpCircle, Info, FileText } from 'lucide-react';

const CONTENT = {
  'sobre': {
    title: 'Sobre Nós',
    icon: <Info size={24} className="text-cyan-400" />,
    text: `
      A VAPEX nasceu da paixão pela tecnologia e pelo estilo de vida vape. Somos mais que uma loja, somos uma comunidade dedicada a trazer o que há de melhor no mercado mundial para o Brasil.
      
      Nossa missão é proporcionar uma experiência de compra premium, oferecendo produtos originais das marcas mais renomadas como Ignite, Vaporesso, e Life Pod. Valorizamos a transparência, a segurança e a agilidade na entrega.
      
      Cada puff conta uma história, e estamos aqui para garantir que a sua seja repleta de sabor e qualidade.
    `
  },
  'privacidade': {
    title: 'Política de Privacidade',
    icon: <Shield size={24} className="text-cyan-400" />,
    text: `
      Sua privacidade é nossa prioridade absoluta. Na Vapex, utilizamos as tecnologias de criptografia mais avançadas para garantir que seus dados pessoais e financeiros estejam 100% protegidos.
      
      Coletamos apenas as informações necessárias para processar seu pedido e melhorar sua experiência de navegação. Nunca compartilhamos seus dados com terceiros sem seu consentimento explícito.
      
      Ao navegar em nosso site, você concorda com o uso de cookies para personalização de conteúdo e análise de tráfego.
    `
  },
  'termos': {
    title: 'Termos de Uso',
    icon: <FileText size={24} className="text-cyan-400" />,
    text: `
      Ao acessar o site da Vapex, você concorda em cumprir estes termos de serviço. É estritamente proibida a venda de qualquer produto para menores de 18 anos.
      
      Todos os preços e promoções estão sujeitos a alteração sem aviso prévio. Garantimos a originalidade de todos os produtos vendidos em nossa plataforma. O uso indevido dos dispositivos é de inteira responsabilidade do usuário.
      
      Reservamo-nos o direito de cancelar pedidos em caso de suspeita de fraude ou erro sistêmico de preço.
    `
  },
  'trocas': {
    title: 'Trocas e Devoluções',
    icon: <Truck size={24} className="text-cyan-400" />,
    text: `
      Nossa política de trocas segue rigorosamente o Código de Defesa do Consumidor. Você tem até 7 dias corridos após o recebimento para solicitar a devolução por arrependimento.
      
      Para produtos com defeito de fabricação, o prazo de garantia é de 30 dias. O produto deve estar em sua embalagem original, sem sinais de mau uso e com todos os acessórios inclusos.
      
      Para iniciar um processo de troca, entre em contato através do nosso E-mail oficial com o número do seu pedido.
    `
  },
  'faq': {
    title: 'FAQ - Perguntas Frequentes',
    icon: <HelpCircle size={24} className="text-cyan-400" />,
    text: `
      1. Os produtos são originais? Sim, trabalhamos apenas com importações oficiais e produtos 100% autênticos.
      
      2. Qual o prazo de entrega? O prazo varia de acordo com sua região, mas geralmente enviamos em até 24h úteis após a confirmação do pagamento.
      
      3. Aceitam PIX? Sim, aceitamos PIX com confirmação instantânea e processamento acelerado do pedido.
      
      4. Como acompanho meu pedido? Você receberá o código de rastreamento por e-mail assim que o produto for postado.
    `
  }
};

export default function InfoPage() {
  const { pathname } = useLocation();
  const slug = pathname.replace('/', '');
  const page = CONTENT[slug as keyof typeof CONTENT] || CONTENT['sobre'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 text-white">
      <div className="max-w-3xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <ChevronRight size={14} />
          <span className="text-white">{page.title}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-8 sm:p-12 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-cyan-500/10 rounded-2xl">
              {page.icon}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">{page.title}</h1>
          </div>

          <div className="prose prose-invert max-w-none">
            {page.text.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-gray-400 leading-relaxed text-lg mb-6 whitespace-pre-line">
                {paragraph.trim()}
              </p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-4">
            <Link to="/produtos" className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-all">
              Voltar às Compras
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
