
import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../App';
import { Affiliate, Commission, Order } from '../types';
import { Link2, DollarSign, MousePointer2, Briefcase, Share2, Check } from 'lucide-react';

const AffiliateDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [affiliateData, setAffiliateData] = useState<Affiliate | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const affDoc = await getDoc(doc(db, 'affiliates', user.uid));
        if (affDoc.exists()) {
          setAffiliateData(affDoc.data() as Affiliate);
        }

        const commQuery = query(collection(db, 'commissions'), where('afiliadoId', '==', user.uid));
        const commSnap = await getDocs(commQuery);
        setCommissions(commSnap.docs.map(d => ({ id: d.id, ...d.data() } as Commission)));

      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const copyLink = () => {
    if (!affiliateData) return;
    // Ajustado para o formato padrão do HashRouter: /#/?ref=CODE
    const link = `${window.location.origin}/#/?ref=${affiliateData.codigoReferencia}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-20 text-center"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 rounded-full border-t-transparent mx-auto"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Olá, {user?.nome}!</h1>
          <p className="text-gray-500">Bem-vindo ao seu painel de parceiro exclusivo.</p>
        </div>
        <div className="flex items-center bg-white p-2 rounded-2xl border shadow-sm w-full md:w-auto">
          <Link2 className="text-gray-400 mx-3" size={20} />
          <input 
            readOnly 
            value={affiliateData ? `${window.location.origin}/#/?ref=${affiliateData.codigoReferencia}` : 'Carregando...'} 
            className="flex-grow bg-transparent outline-none text-sm font-medium text-gray-600 pr-4 w-full md:w-64"
          />
          <button 
            onClick={copyLink}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-indigo-700 transition"
          >
            {copied ? <Check size={16} className="mr-2" /> : <Share2 size={16} className="mr-2" />} {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><DollarSign size={24} /></div>
            <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded">SALDO ATUAL</span>
          </div>
          <p className="text-4xl font-black mb-2">R$ {affiliateData?.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-indigo-100 text-sm">Disponível para saque em breve</p>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl"><MousePointer2 size={24} /></div>
            <span className="text-xs font-bold text-gray-400">CLIQUES</span>
          </div>
          <p className="text-4xl font-black text-gray-900 mb-2">{affiliateData?.totalCliques || 0}</p>
          <p className="text-gray-500 text-sm">Acessos através do seu link</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl"><Briefcase size={24} /></div>
            <span className="text-xs font-bold text-gray-400">VENDAS</span>
          </div>
          <p className="text-4xl font-black text-gray-900 mb-2">{affiliateData?.totalVendas || 0}</p>
          <p className="text-gray-500 text-sm">Conversões concluídas</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800">Extrato de Comissões</h2>
          <button className="text-indigo-600 text-sm font-bold hover:underline">Ver tudo</button>
        </div>
        <div className="divide-y divide-gray-100">
          {commissions.length > 0 ? commissions.map(comm => (
            <div key={comm.id} className="px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition">
              <div>
                <p className="font-bold text-gray-900">Venda #{comm.orderId.slice(0, 8)}</p>
                <p className="text-xs text-gray-500">{new Date(comm.criadoEm?.toDate()).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-600">+ R$ {comm.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${comm.status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {comm.status}
                </span>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center text-gray-400">Nenhuma comissão registrada ainda.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
