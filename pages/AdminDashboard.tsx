
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product, UserProfile, Order, Affiliate } from '../types';
import { LayoutDashboard, Package, Users, TrendingUp, Plus, Trash2, Edit, Save, X, Camera } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'affiliates' | 'orders'>('stats');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    nome: '',
    descricao: '',
    preco: 0,
    estoque: 0,
    tamanhos: ['P', 'M', 'G', 'GG'],
    cores: ['Preto', 'Branco'],
    categoria: 'Feminino',
    ativo: true,
    imagens: [] as string[]
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Products
      const prodSnap = await getDocs(query(collection(db, 'products'), orderBy('criadoEm', 'desc')));
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      
      // Fetch Orders
      const orderSnap = await getDocs(query(collection(db, 'orders'), orderBy('criadoEm', 'desc')));
      setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));

      // Fetch Affiliates
      const affSnap = await getDocs(collection(db, 'affiliates'));
      setAffiliates(affSnap.docs.map(d => ({ userId: d.id, ...d.data() } as Affiliate)));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    const urls: string[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    setProductForm({ ...productForm, imagens: [...productForm.imagens, ...urls] });
    setUploading(false);
  };

  const handleSaveProduct = async () => {
    if (!productForm.nome || productForm.preco <= 0) return alert("Preencha os campos obrigatórios");
    try {
      await addDoc(collection(db, 'products'), {
        ...productForm,
        criadoEm: new Date()
      });
      setShowProductModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Deseja excluir este produto?")) {
      await deleteDoc(doc(db, 'products', id));
      fetchData();
    }
  };

  const totalRevenue = orders.reduce((acc, o) => acc + o.valorTotal, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex-shrink-0">
        <div className="p-8">
          <h2 className="text-xl font-bold text-indigo-600">Admin Console</h2>
        </div>
        <nav className="px-4 space-y-2">
          <button onClick={() => setActiveTab('stats')} className={`w-full flex items-center p-3 rounded-xl transition ${activeTab === 'stats' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <LayoutDashboard className="mr-3" size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center p-3 rounded-xl transition ${activeTab === 'products' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Package className="mr-3" size={20} /> Produtos
          </button>
          <button onClick={() => setActiveTab('affiliates')} className={`w-full flex items-center p-3 rounded-xl transition ${activeTab === 'affiliates' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Users className="mr-3" size={20} /> Afiliados
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center p-3 rounded-xl transition ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <TrendingUp className="mr-3" size={20} /> Vendas
          </button>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-grow p-4 md:p-12 overflow-y-auto">
        {activeTab === 'stats' && (
          <div className="animate-fadeIn">
            <h1 className="text-3xl font-extrabold mb-10">Visão Geral</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-bold uppercase mb-2">Total de Vendas</p>
                <p className="text-3xl font-extrabold text-indigo-600">R$ {totalRevenue.toLocaleString()}</p>
                <p className="text-green-500 text-xs mt-2 font-bold">+12% vs mês anterior</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-bold uppercase mb-2">Pedidos</p>
                <p className="text-3xl font-extrabold text-gray-900">{orders.length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-bold uppercase mb-2">Afiliados</p>
                <p className="text-3xl font-extrabold text-purple-600">{affiliates.length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-bold uppercase mb-2">Tickets Médio</p>
                <p className="text-3xl font-extrabold text-gray-900">R$ {(totalRevenue / (orders.length || 1)).toFixed(0)}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-96">
              <h3 className="font-bold mb-6">Volume de Vendas (Últimos dias)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orders.slice(0, 10).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="id" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valorTotal" fill="#6366f1" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-3xl font-extrabold">Gerenciar Produtos</h1>
              <button 
                onClick={() => setShowProductModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-indigo-700 transition"
              >
                <Plus size={20} className="mr-2" /> Novo Produto
              </button>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Produto</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Preço</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Estoque</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img src={p.imagens[0]} className="w-10 h-10 rounded-lg object-cover mr-3" alt="" />
                          <span className="font-bold text-gray-900">{p.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">R$ {p.preco.toLocaleString()}</td>
                      <td className="px-6 py-4">{p.estoque} un</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button className="text-gray-400 hover:text-indigo-600"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
              <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold">Adicionar Novo Produto</h3>
                <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Produto</label>
                    <input type="text" value={productForm.nome} onChange={e => setProductForm({...productForm, nome: e.target.value})} className="w-full p-4 border rounded-xl" placeholder="Ex: Camiseta Oversized" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                    <select value={productForm.categoria} onChange={e => setProductForm({...productForm, categoria: e.target.value})} className="w-full p-4 border rounded-xl">
                      <option>Feminino</option>
                      <option>Masculino</option>
                      <option>Acessórios</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                  <textarea value={productForm.descricao} onChange={e => setProductForm({...productForm, descricao: e.target.value})} className="w-full p-4 border rounded-xl h-24" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Preço (R$)</label>
                    <input type="number" value={productForm.preco} onChange={e => setProductForm({...productForm, preco: Number(e.target.value)})} className="w-full p-4 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Estoque Inicial</label>
                    <input type="number" value={productForm.estoque} onChange={e => setProductForm({...productForm, estoque: Number(e.target.value)})} className="w-full p-4 border rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Imagens do Produto</label>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {productForm.imagens.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                    <label className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition ${uploading ? 'bg-gray-50' : 'hover:bg-indigo-50 hover:border-indigo-300'}`}>
                      <Camera className="text-gray-400" size={24} />
                      <input type="file" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gray-50 border-t flex gap-4">
                <button onClick={() => setShowProductModal(false)} className="flex-grow py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
                <button onClick={handleSaveProduct} className="flex-grow py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Salvar Produto</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'affiliates' && (
          <div className="animate-fadeIn">
            <h1 className="text-3xl font-extrabold mb-10">Afiliados Parceiros</h1>
            <div className="grid grid-cols-1 gap-6">
              {affiliates.map(aff => (
                <div key={aff.userId} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{aff.nome}</h3>
                    <p className="text-sm text-gray-500">Código: <code className="bg-gray-100 px-2 py-0.5 rounded text-indigo-600 font-mono font-bold">{aff.codigoReferencia}</code></p>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Comissão</p>
                      <p className="text-lg font-bold">{aff.percentualComissao}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Vendas</p>
                      <p className="text-lg font-bold">{aff.totalVendas}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Saldo</p>
                      <p className="text-lg font-bold text-green-600">R$ {aff.saldo.toFixed(2)}</p>
                    </div>
                  </div>
                  <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition">Detalhes</button>
                </div>
              ))}
              {affiliates.length === 0 && <p className="text-gray-400">Nenhum afiliado cadastrado.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
