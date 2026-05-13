import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, QrCode, FileText, Shield, Lock, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../components/layout/CartContext';
import { useAuth } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';

type PaymentMethod = 'pix' | 'card' | 'boleto';
type Step = 'info' | 'payment' | 'confirm';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('info');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ pix_code: string; pix_qr_code: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: '', email: user?.email || '', phone: '', cpf: '',
    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
    cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '',
  });

  const shipping = 0;
  const finalTotal = total + shipping;

  const updateForm = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!user && import.meta.env.VITE_SUPABASE_URL) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      let order = { id: `GUEST-${Date.now()}` };
      
      if (import.meta.env.VITE_SUPABASE_URL) {
        const { data: newOrder } = await supabase.from('orders').insert({
          user_id: user?.id,
          status: 'pending',
          total: finalTotal,
          subtotal: total,
          shipping,
          payment_method: paymentMethod,
          payment_status: 'pending',
          shipping_address: {
            name: form.name, street: form.street, number: form.number,
            complement: form.complement, neighborhood: form.neighborhood,
            city: form.city, state: form.state, cep: form.cep,
          },
        }).select().maybeSingle();
        
        if (newOrder) {
          order = newOrder;
          for (const item of items) {
            await supabase.from('order_items').insert({
              order_id: order.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.product?.price ?? 0,
              flavor: item.flavor,
              color: item.color,
            });
          }
        }
      }

      if (order) {
        setOrderId(order.id);

        if (paymentMethod === 'pix') {
          try {
            const productNames = items.map(i => i.product?.name).join(", ") || "Pedido Vapex";
            const pixResponse = await fetch('/api/pix', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: form.name,
                cpf: form.cpf,
                email: form.email,
                phone: form.phone,
                amount: finalTotal - total * 0.05,
                productName: productNames.substring(0, 255),
                referenceId: order.id
              }),
            }).catch(() => null);

            if (pixResponse && pixResponse.ok) {
              const pixResult = await pixResponse.json();
              if (pixResult.status === 'success' && pixResult.pix_code) {
                setPixData({
                  pix_code: pixResult.pix_code,
                  pix_qr_code: pixResult.pix_qr_code || ''
                });
              } else {
                alert("Erro ao gerar PIX real: " + (pixResult.error || "Verifique as chaves no .env"));
              }
            } else {
              // MODO DE TESTE LOCAL
              console.log("Ambiente local: Gerando PIX de teste.");
              const mockPixCode = "00020126580014BR.GOV.BCB.PIX0136vapex-pagamentos-teste-12345678905204000053039865802BR5913Vapex Store6009Sao Paulo62070503***6304ABCD";
              setPixData({
                pix_code: mockPixCode,
                pix_qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockPixCode)}`
              });
            }
          } catch (pixErr) {
            console.error("Erro no processamento:", pixErr);
          }
        }

        await clearCart();
        setStep('confirm');
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  if (items.length === 0 && !orderId) {
    navigate('/carrinho');
    return null;
  }

  const steps = [
    { key: 'info' as const, label: 'Dados', num: 1 },
    { key: 'payment' as const, label: 'Pagamento', num: 2 },
    { key: 'confirm' as const, label: 'Confirmação', num: 3 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === s.key ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' :
                steps.indexOf(steps.find(x => x.key === step)!) > i ? 'bg-emerald-500 text-white' :
                'bg-white/5 text-gray-500 border border-white/10'
              }`}>
                {steps.indexOf(steps.find(x => x.key === step)!) > i ? <Check size={16} /> : s.num}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${
                step === s.key ? 'text-white' : 'text-gray-500'
              }`}>{s.label}</span>
              {i < steps.length - 1 && <div className="w-12 h-px bg-white/10 mx-2" />}
            </div>
          ))}
        </div>

        {step === 'info' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-white mb-6">Dados de Entrega</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Nome completo</label>
                  <input value={form.name} onChange={e => updateForm('name', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Seu nome" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">E-mail</label>
                  <input value={form.email} onChange={e => updateForm('email', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="seu@email.com" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Telefone</label>
                <input value={form.phone} onChange={e => updateForm('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">CPF</label>
                <input value={form.cpf} onChange={e => updateForm('cpf', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">CEP</label>
                <input value={form.cep} onChange={e => updateForm('cep', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  placeholder="00000-000" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-400 mb-1.5 block">Rua</label>
                  <input value={form.street} onChange={e => updateForm('street', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Rua" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Número</label>
                  <input value={form.number} onChange={e => updateForm('number', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="123" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Complemento</label>
                  <input value={form.complement} onChange={e => updateForm('complement', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Apto" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Bairro</label>
                  <input value={form.neighborhood} onChange={e => updateForm('neighborhood', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Bairro" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Cidade</label>
                  <input value={form.city} onChange={e => updateForm('city', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Cidade" />
                </div>
              </div>
              <div className="w-1/3">
                <label className="text-sm text-gray-400 mb-1.5 block">Estado</label>
                <input value={form.state} onChange={e => updateForm('state', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  placeholder="SP" />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Link to="/carrinho" className="px-6 py-3 text-gray-400 hover:text-white transition-colors text-sm">
                Voltar ao carrinho
              </Link>
              <button onClick={() => setStep('payment')}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/25">
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-white mb-6">Forma de Pagamento</h2>

            <div className="space-y-3 mb-8">
              {([
                { key: 'pix' as const, icon: <QrCode size={20} />, label: 'PIX', desc: 'Aprovação imediata - 5% de desconto', color: 'text-cyan-400' },
              ]).map(pm => (
                <button
                  key={pm.key}
                  disabled
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left bg-cyan-500/10 border-cyan-500/30 cursor-default"
                >
                  <div className={`${pm.color}`}>{pm.icon}</div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">{pm.label}</div>
                    <div className="text-gray-500 text-sm">{pm.desc}</div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-500 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  </div>
                </button>
              ))}
            </div>


            {/* Order summary */}
            <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 mb-8">
              <h3 className="text-white font-semibold mb-4">Resumo do Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({items.length} itens)</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Frete</span>
                  <span>{shipping === 0 ? <span className="text-emerald-400">Grátis</span> : `R$ ${shipping.toFixed(2).replace('.', ',')}`}</span>
                </div>
                {paymentMethod === 'pix' && (
                  <div className="flex justify-between text-cyan-400">
                    <span>Desconto PIX (5%)</span>
                    <span>-R$ {(total * 0.05).toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="border-t border-white/5 pt-2 flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>R$ {(paymentMethod === 'pix' ? finalTotal - total * 0.05 : finalTotal).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-xs mb-6">
              <Lock size={14} /> Pagamento 100% seguro com criptografia SSL
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep('info')} className="px-6 py-3 text-gray-400 hover:text-white transition-colors text-sm">
                Voltar
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/25 disabled:opacity-50">
                {submitting ? 'Processando...' : 'Finalizar Pedido'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Pedido Confirmado!</h2>
            <p className="text-gray-400 mb-2">Seu pedido foi realizado com sucesso.</p>
            {orderId && <p className="text-gray-500 text-sm mb-8">ID do pedido: {orderId.slice(0, 8).toUpperCase()}</p>}
            
            {pixData && (
              <div className="mb-8 max-w-sm mx-auto p-6 bg-white/[0.02] border border-white/10 rounded-3xl">
                <h3 className="text-white font-bold mb-4 flex items-center justify-center gap-2">
                  <QrCode size={20} className="text-cyan-400" /> Pagamento via PIX
                </h3>
                <div className="bg-white p-4 rounded-2xl mb-6 inline-block shadow-lg shadow-cyan-500/10">
                  {pixData.pix_qr_code ? (
                    <img 
                      src={pixData.pix_qr_code.startsWith('http') ? pixData.pix_qr_code : (pixData.pix_qr_code.includes('data:image') ? pixData.pix_qr_code : `data:image/png;base64,${pixData.pix_qr_code}`)} 
                      alt="QR Code PIX" 
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-xs">
                      QR Code não disponível
                    </div>
                  )}
                </div>
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 mb-4 text-left">
                  <p className="text-[10px] text-gray-500 font-mono break-all line-clamp-2">{pixData.pix_code}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.pix_code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-all"
                >
                  {copied ? <Check size={18} /> : <FileText size={18} />}
                  {copied ? 'Copiado!' : 'Copiar Código PIX'}
                </button>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Link to="/conta" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-2xl border border-white/10 transition-colors">
                Meus Pedidos
              </Link>
              <Link to="/" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/25">
                Voltar à Loja
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
