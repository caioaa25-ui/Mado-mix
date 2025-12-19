
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(redirect);
    } catch (err: any) {
      alert("Erro ao entrar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="bg-indigo-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Seja bem-vindo</h2>
          <p className="text-gray-500 mt-2">Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              required
              type="email" 
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              required
              type="password" 
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="text-right">
            <a href="#" className="text-sm font-semibold text-indigo-600 hover:underline">Esqueceu a senha?</a>
          </div>
          <button 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center"
          >
            {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : "Entrar"}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500">
          Ainda não tem conta? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
