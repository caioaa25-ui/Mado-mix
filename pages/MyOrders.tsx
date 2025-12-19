
import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../App';
import { Order } from '../types';
import { Package, ChevronRight, Clock, CheckCircle } from 'lucide-react';

const MyOrders: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('criadoEm', 'desc'));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (loading) return <div className="py-20 text-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 rounded-full border-t-transparent mx-auto"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-10">Meus Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center shadow-sm border">
          <Package className="mx-auto text-gray-300 mb-6" size={64} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum pedido encontrado</h2>
          <p className="text-gray-500">Você ainda não realizou nenhuma compra conosco.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Pedido #{order.id.slice(-6)}</p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(order.criadoEm?.toDate()).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                  <CheckCircle size={14} className="mr-1.5" /> Pago
                </div>
              </div>
              
              <div className="flex items-center gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {order.produtos.map((p, i) => (
                  <div key={i} className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border">
                    <img src={p.imagens[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t">
                <div className="flex items-center text-sm font-semibold text-gray-500">
                  <Clock size={16} className="mr-2" /> {order.statusPedido}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total do Pedido</p>
                  <p className="text-lg font-black text-gray-900">R$ {order.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
