
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { CartItem } from '../types';

const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setItems(cart);
  }, []);

  const updateQuantity = (idx: number, delta: number) => {
    const newItems = [...items];
    newItems[idx].quantity = Math.max(1, newItems[idx].quantity + delta);
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.preco * item.quantity), 0);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center px-4">
        <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Seu carrinho está vazio</h2>
        <p className="text-gray-500 mb-10 text-lg">Parece que você ainda não escolheu seu look perfeito. Que tal dar uma olhada nas novidades?</p>
        <Link to="/" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold inline-block hover:bg-indigo-700 transition shadow-lg">
          Começar a Comprar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10">Meu Carrinho</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-lg transition">
              <div className="w-full sm:w-32 h-40 rounded-2xl overflow-hidden bg-gray-50 shadow-inner">
                <img src={item.imagens[0]} alt={item.nome} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{item.nome}</h3>
                    <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded-md text-gray-600">Tam: {item.selectedSize}</span>
                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded-md text-gray-600">Cor: {item.selectedColor}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => updateQuantity(idx, -1)} className="p-2 hover:bg-gray-50 text-gray-400"><Minus size={16} /></button>
                    <span className="px-4 font-bold text-gray-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(idx, 1)} className="p-2 hover:bg-gray-50 text-gray-400"><Plus size={16} /></button>
                  </div>
                  <span className="text-xl font-bold text-indigo-600">R$ {(item.preco * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl sticky top-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">Resumo do Pedido</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 text-lg">
                <span>Subtotal</span>
                <span className="text-gray-900 font-medium">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-lg">
                <span>Frete</span>
                <span className="text-green-600 font-bold">Grátis</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-gray-900 pt-6 border-t">
                <span>Total</span>
                <span className="text-indigo-600">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 group"
            >
              Finalizar Pedido <ArrowRight className="ml-2 group-hover:translate-x-1 transition" />
            </button>
            
            <p className="text-center text-gray-400 text-sm mt-6 flex items-center justify-center">
              <ShieldCheck size={16} className="mr-1" /> Pagamento 100% seguro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShieldCheck = ({size, className}: {size: number, className: string}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Cart;
