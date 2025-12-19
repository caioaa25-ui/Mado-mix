
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { ShoppingCart, Heart, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Product;
        setProduct({ id: docSnap.id, ...data });
        setMainImage(data.imagens[0]);
        if (data.tamanhos.length > 0) setSelectedSize(data.tamanhos[0]);
        if (data.cores.length > 0) setSelectedColor(data.cores[0]);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const newItem = {
      ...product,
      quantity,
      selectedSize,
      selectedColor,
      cartId: `${product.id}-${selectedSize}-${selectedColor}`
    };

    const existingIndex = cart.findIndex((item: any) => item.cartId === newItem.cartId);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(newItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    navigate('/cart');
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  if (!product) return <div className="text-center py-20 text-xl font-semibold">Produto não encontrado.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-inner">
            <img src={mainImage} alt={product.nome} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {product.imagens.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setMainImage(img)}
                className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition ${mainImage === img ? 'border-indigo-600' : 'border-transparent'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">{product.categoria}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 mb-4">{product.nome}</h1>
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-3xl font-bold text-gray-900">R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span className="text-gray-400 line-through text-lg">R$ {(product.preco * 1.3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">30% OFF</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">{product.descricao}</p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Size Selector */}
            {product.tamanhos.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Tamanho selecionado: <span className="text-indigo-600">{selectedSize}</span></label>
                <div className="flex flex-wrap gap-3">
                  {product.tamanhos.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 w-12 flex items-center justify-center rounded-xl border-2 font-bold transition ${selectedSize === size ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-200'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.cores.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Cor selecionada: <span className="text-indigo-600">{selectedColor}</span></label>
                <div className="flex gap-4">
                  {product.cores.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-2 rounded-full border-2 font-medium transition ${selectedColor === color ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-200'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex items-center border-2 border-gray-200 rounded-xl">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-gray-50">-</button>
                <span className="px-6 font-bold text-gray-800">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-3 hover:bg-gray-50">+</button>
              </div>
              <span className="text-sm text-gray-500 font-medium">{product.estoque} disponíveis</span>
            </div>
          </div>

          <div className="flex gap-4 mt-auto">
            <button 
              onClick={addToCart}
              className="flex-grow bg-indigo-600 text-white h-16 rounded-2xl font-bold text-lg flex items-center justify-center hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              <ShoppingCart className="mr-3" /> Adicionar ao Carrinho
            </button>
            <button className="h-16 w-16 flex items-center justify-center border-2 border-gray-200 rounded-2xl text-gray-400 hover:text-red-500 hover:border-red-200 transition">
              <Heart size={28} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-100">
            <div className="text-center">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-600"><Truck size={20} /></div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Frete Grátis</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-600"><RefreshCcw size={20} /></div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Troca 30 dias</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-600"><ShieldCheck size={20} /></div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Compra Segura</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
