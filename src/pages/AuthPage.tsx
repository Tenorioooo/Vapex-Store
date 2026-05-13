import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useSupabase';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/conta');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (resetMode) {
        await resetPassword(email);
        setResetSent(true);
      } else if (isLogin) {
        await signIn(email, password);
        navigate('/conta');
      } else {
        await signUp(email, password);
        navigate('/conta');
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos' :
                err.message === 'User already registered' ? 'E-mail já cadastrado' :
                err.message || 'Erro ao processar');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="text-white font-bold text-2xl">VAPE<span className="text-cyan-400">X</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {resetMode ? 'Recuperar Senha' : isLogin ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-gray-500 mt-2">
            {resetMode ? 'Enviaremos um link de recuperação' : isLogin ? 'Acesse sua conta' : 'Crie sua conta e comece a comprar'}
          </p>
        </div>

        <div className="p-8 bg-[#0a0a0a] rounded-3xl border border-white/5">
          {resetSent ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Mail size={24} className="text-cyan-400" />
              </div>
              <p className="text-white font-semibold mb-2">E-mail enviado!</p>
              <p className="text-gray-500 text-sm mb-6">Verifique sua caixa de entrada para redefinir sua senha.</p>
              <button onClick={() => { setResetMode(false); setResetSent(false); }}
                className="text-cyan-400 hover:text-cyan-300 text-sm">
                Voltar ao login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {!resetMode && (
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Senha</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                {loading ? 'Processando...' : (
                  <>
                    {resetMode ? 'Enviar Link' : isLogin ? 'Entrar' : 'Criar Conta'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {!resetMode && (
                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={() => setIsLogin(!isLogin)}
                    className="text-gray-400 hover:text-white transition-colors">
                    {isLogin ? 'Não tem conta? Criar' : 'Já tem conta? Entrar'}
                  </button>
                  {isLogin && (
                    <button type="button" onClick={() => setResetMode(true)}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors">
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
              )}

              {resetMode && (
                <button type="button" onClick={() => setResetMode(false)}
                  className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors">
                  Voltar ao login
                </button>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
