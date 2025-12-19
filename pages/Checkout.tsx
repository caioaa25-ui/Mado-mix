
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, getDocs, query, where, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../App';
import { CartItem, Order } from '../types';
import { CheckCircle2, CreditCard, Banknote, QrCode, Lock } from 'lucide-react';

const Checkout: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState<CartItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    cpf: '',
    endereco: '',
    cidade: '',
    cep: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) navigate('/cart');
    setItems(cart);
  }, [navigate]);

  const total = items.reduce((acc, item) => acc + (item.preco * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Por favor, faça login para finalizar o pedido.");
      navigate('/login?redirect=checkout');
      return;
    }

    setProcessing(true);

    try {
      // 1. Simulate Gateway Processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Identify Affiliate
      const refCode = localStorage.getItem('affiliate_ref');
      let afiliadoId = '';
      let commissionValue = 0;

      if (refCode) {
        const affQuery = query(collection(db, 'affiliates'), where('codigoReferencia', '==', refCode));
        const affSnap = await getDocs(affQuery);
        if (!affSnap.empty) {
          const affDoc = affSnap.docs[0];
          const affData = affDoc.data();
          afiliadoId = affDoc.id;
          commissionValue = (total * (affData.percentualComissao || 10)) / 100;
        }
      }

      // 3. Create Order
      const orderData = {
        userId: user.uid,
        userName: formData.nome,
        produtos: items,
        valorTotal: total,
        statusPagamento: 'pago', // Simulated success
        statusPedido: 'processando',
        afiliadoId: afiliadoId || null,
        criadoEm: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // 4. Record Commission if Affiliate exists
      if (afiliadoId) {
        await addDoc(collection(db, 'commissions'), {
          orderId: orderRef.id,
          afiliadoId: afiliadoId,
          valor: commissionValue,
          status: 'pendente',
          criadoEm: serverTimestamp(),
        });

        // Update Affiliate Totals
        const affRef = doc(db, 'affiliates', afiliadoId);
        await updateDoc(affRef, {
          saldo: increment(commissionValue),
          totalVendas: increment(1)
        });
      }

      // 5. Update Inventory (simplified loop)
      for (const item of items) {
        const prodRef = doc(db, 'products', item.id);
        await updateDoc(prodRef, {
          estoque: increment(-item.quantity)
        });
      }

      // 6. Finalize
      localStorage.removeItem('cart');
      localStorage.removeItem('affiliate_ref');
      window.dispatchEvent(new Event('cart-updated'));
      setSuccess(true);
      
    } catch (error) {
      console.error(error);
      alert("Erro ao processar pedido.");
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Pedido Realizado!</h1>
        <p className="text-xl text-gray-500 mb-10">Obrigado por sua compra. Você receberá os detalhes no seu e-mail em instantes.</p>
        <div className="space-y-4">
          <button onClick={() => navigate('/orders')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition">
            Ver Meus Pedidos
          </button>
          <button onClick={() => navigate('/')} className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-3xl font-bold mb-8">Dados de Entrega</h2>
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
                <input 
                  required
                  type="text" 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="contato@exemplo.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Endereço Completo</label>
              <input 
                required
                type="text" 
                value={formData.endereco}
                onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Rua, número, complemento e bairro"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cidade</label>
                <input 
                  required
                  type="text" 
                  value={formData.cidade}
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">CEP</label>
                <input 
                  required
                  type="text" 
                  value={formData.cep}
                  onChange={(e) => setFormData({...formData, cep: e.target.value})}
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="00000-000"
                />
              </div>
            </div>

            <h3 className="text-2xl font-bold mt-12 mb-6">Método de Pagamento</h3>
            <div className="grid grid-cols-3 gap-4">
              <button 
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-center gap-2 transition ${paymentMethod === 'pix' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <QrCode size={32} />
                <span className="font-bold text-sm">Pix</span>
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-center gap-2 transition ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <CreditCard size={32} />
                <span className="font-bold text-sm">Cartão</span>
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMethod('boleto')}
                className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-center gap-2 transition ${paymentMethod === 'boleto' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <Banknote size={32} />
                <span className="font-bold text-sm">Boleto</span>
              </button>
            </div>
          </form>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Sua Compra</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6 hide-scrollbar">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <img src={item.imagens[0]} className="w-12 h-12 rounded-lg object-cover mr-3" alt={item.nome} />
                    <div>
                      <p className="font-bold text-gray-900 truncate w-32">{item.nome}</p>
                      <p className="text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">R$ {(item.preco * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Frete</span>
                <span className="text-green-600 font-bold">Grátis</span>
              </div>
              <div className="flex justify-between text-2xl font-bold pt-4 border-t-2 border-dashed border-gray-100">
                <span>Total</span>
                <span className="text-indigo-600">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button 
              form="checkout-form"
              disabled={processing}
              className="w-full mt-8 bg-gray-900 text-white h-16 rounded-2xl font-bold text-xl flex items-center justify-center hover:bg-black transition disabled:opacity-50"
            >
              {processing ? (
                <div className="flex items-center">
                  <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                  Processando...
                </div>
              ) : (
                `Pagar R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              )}
            </button>
            
            <div className="mt-6 flex items-center justify-center text-gray-400 text-xs">
              <Lock size={14} className="mr-2" /> Pagamento Protegido por SSL de 256 bits
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
