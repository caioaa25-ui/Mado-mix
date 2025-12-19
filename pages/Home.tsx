
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), where('ativo', '==', true), limit(12));
      const querySnapshot = await getDocs(q);
      const items: Product[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(items);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center text-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          alt="Banner"
        />
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">Redefina Seu Estilo</h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Coleções exclusivas com o toque de sofisticação que você merece. Explore as novas tendências.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition flex items-center justify-center">
              Ver Coleção <ArrowRight className="ml-2" size={20} />
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-indigo-600 transition">
              Saiba Mais
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Destaques da Semana</h2>
            <p className="text-gray-500 mt-2">Os produtos mais desejados selecionados para você.</p>
          </div>
          <Link to="/catalog" className="text-indigo-600 font-semibold hover:underline hidden sm:block">Ver tudo</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-gray-100 h-80 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="group bg-white rounded-2xl border border-transparent hover:border-indigo-100 hover:shadow-xl transition-all p-3"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl mb-4">
                  <img 
                    src={product.imagens[0] || 'https://via.placeholder.com/400'} 
                    alt={product.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition">{product.nome}</h3>
                <p className="text-sm text-gray-500 mb-2 truncate">{product.descricao}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-indigo-600">R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <button className="bg-gray-900 text-white p-2 rounded-lg hover:bg-indigo-600 transition opacity-0 group-hover:opacity-100">
                    <ShoppingBag size={18} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Explore Categorias</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group overflow-hidden rounded-3xl h-64 cursor-pointer shadow-lg">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover group-hover:scale-110 transition duration-700 brightness-75" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-3xl font-bold text-white tracking-wider">FEMININO</h3>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-3xl h-64 cursor-pointer shadow-lg">
              <img src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover group-hover:scale-110 transition duration-700 brightness-75" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-3xl font-bold text-white tracking-wider">MASCULINO</h3>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-3xl h-64 cursor-pointer shadow-lg">
              <img src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover group-hover:scale-110 transition duration-700 brightness-75" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-3xl font-bold text-white tracking-wider">ACESSÓRIOS</h3>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Internal icon for Home
const ShoppingBag = ({size}: {size: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

export default Home;
