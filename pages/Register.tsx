
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
// Added Link to the imports from react-router-dom to resolve the error on line 128
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { UserPlus, User, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'afiliado' ? UserRole.AFILIADO : UserRole.CLIENTE;
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState<UserRole>(initialType);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // 1. Create User Document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        nome,
        email,
        tipo,
        status: 'ativo',
        criadoEm: serverTimestamp(),
      });

      // 2. If Affiliate, Create Affiliate Profile
      if (tipo === UserRole.AFILIADO) {
        const refCode = nome.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 1000);
        await setDoc(doc(db, 'affiliates', user.uid), {
          nome,
          codigoReferencia: refCode,
          percentualComissao: 10,
          saldo: 0,
          totalVendas: 0,
          totalCliques: 0
        });
      }

      navigate('/');
    } catch (err: any) {
      alert("Erro ao cadastrar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50 py-12">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="bg-indigo-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Crie sua conta</h2>
          <p className="text-gray-500 mt-2">Junte-se à nossa comunidade exclusiva</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
            <button 
              type="button" 
              onClick={() => setTipo(UserRole.CLIENTE)}
              className={`flex-grow py-3 rounded-xl font-bold text-sm transition ${tipo === UserRole.CLIENTE ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
            >
              Sou Cliente
            </button>
            <button 
              type="button" 
              onClick={() => setTipo(UserRole.AFILIADO)}
              className={`flex-grow py-3 rounded-xl font-bold text-sm transition ${tipo === UserRole.AFILIADO ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
            >
              Quero ser Afiliado
            </button>
          </div>

          <div className="space-y-4">
            <input 
              required
              type="text" 
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <input 
              required
              type="email" 
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <input 
              required
              type="password" 
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex items-center space-x-3 text-xs text-gray-500 px-2">
            <ShieldCheck className="text-indigo-600 flex-shrink-0" size={18} />
            <p>Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade de dados.</p>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            {loading ? "Processando..." : "Finalizar Cadastro"}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500">
          Já possui uma conta? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Entre aqui</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
