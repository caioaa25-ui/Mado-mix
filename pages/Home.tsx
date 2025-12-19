
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('ativo', '==', true), limit(8));
        const querySnapshot = await getDocs(q);
        const items: Product[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(items);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-start overflow-hidden px-4 md:px-12">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2070" 
            className="w-full h-full object-cover brightness-[0.4]"
            alt="Banner Hero"
          />
        </div>
        <div className="relative z-10 max-w-3xl animate-slideUp">
          <div className="inline-flex items-center bg-indigo-600/20 backdrop-blur-md text-indigo-400 px-4 py-2 rounded-full text-xs font-black mb-6 border border-indigo-500/30">
            <Sparkles size={14} className="mr-2" /> COLEÇÃO DE INVERNO 2024
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1]">
            Estilo que define <br /> <span className="text-indigo-400 italic">quem você é.</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-xl font-medium leading-relaxed">
            Descubra peças exclusivas desenhadas para elevar sua confiança e transformar seu guarda-roupa com sofisticação.
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <button 
              onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
              className="bg-white text-gray-900 px-10 py-5 rounded-[2rem] font-black hover:scale-105 transition-transform flex items-center justify-center shadow-2xl"
            >
              Comprar Agora <ArrowRight className="ml-2" size={20} />
            </button>
            <button 
              onClick={() => navigate('/register?type=afiliado')}
              className="bg-transparent border-2 border-white/30 backdrop-blur-sm text-white px-10 py-5 rounded-[2rem] font-black hover:bg-white/10 transition"
            >
              Lucrar como Afiliado
            </button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="font-black text-gray-900">FRETE GRÁTIS</p>
            <p className="text-xs text-gray-400">Em compras acima de R$ 199</p>
          </div>
          <div className="text-center">
            <p className="font-black text-gray-900">PARCELAMENTO</p>
            <p className="text-xs text-gray-400">Até 12x sem juros</p>
          </div>
          <div className="text-center">
            <p className="font-black text-gray-900">TROCA FÁCIL</p>
            <p className="text-xs text-gray-400">30 dias para devolver</p>
          </div>
          <div className="text-center">
            <p className="font-black text-gray-900">SEGURANÇA</p>
            <p className="text-xs text-gray-400">Pagamento 100% seguro</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4 text-center md:text-left">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Novos Lançamentos</h2>
            <p className="text-gray-500 mt-3 text-lg">As últimas tendências diretamente para o seu closet.</p>
          </div>
          <Link to="/" className="bg-gray-100 text-gray-900 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition">Explorar Tudo</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="space-y-4">
                <div className="bg-gray-100 aspect-[3/4] animate-pulse rounded-[2.5rem]"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="group animate-fadeIn"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] mb-6 shadow-sm border border-transparent group-hover:border-indigo-100 group-hover:shadow-2xl transition-all duration-500">
                  <img 
                    src={product.imagens[0] || 'https://via.placeholder.com/600x800'} 
                    alt={product.nome}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-1000"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition duration-300">
                    <Star className="text-yellow-400 fill-yellow-400" size={18} />
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <button className="w-full bg-white text-gray-900 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2">
                       VER DETALHES
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{product.nome}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-indigo-600 font-black text-lg">R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action for Affiliates */}
      <section className="bg-gray-900 py-24 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Ganhe com a gente <br /> sem sair de casa.</h2>
            <p className="text-gray-400 text-lg mb-8">Participe do nosso programa de afiliados e ganhe <span className="text-indigo-400 font-bold">10% de comissão</span> em cada venda realizada através do seu link.</p>
            <button 
              onClick={() => navigate('/register?type=afiliado')}
              className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20"
            >
              Começar a Lucrar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10 text-center">
              <p className="text-3xl font-black text-white mb-1">10%</p>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Comissão</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10 text-center">
              <p className="text-3xl font-black text-white mb-1">Pix</p>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Pagamento Rápido</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
