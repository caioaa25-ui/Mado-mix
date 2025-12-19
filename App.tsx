
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from './types';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AffiliateDashboard from './pages/AffiliateDashboard';
import MyOrders from './pages/MyOrders';

// Contexts
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refreshUser: async () => {} });

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as UserProfile);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Affiliate Link Logic: Catch 'ref' parameter and store it
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('affiliate_ref', refCode);
      // Logic for tracking clicks could be added here
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/orders" element={<MyOrders />} />
            
            {/* Protected Routes */}
            {user?.tipo === UserRole.ADMIN && (
              <Route path="/admin/*" element={<AdminDashboard />} />
            )}
            {user?.tipo === UserRole.AFILIADO && (
              <Route path="/affiliate/*" element={<AffiliateDashboard />} />
            )}
          </Routes>
        </main>
        <footer className="bg-gray-900 text-white py-12 px-4 mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Moda Elite</h3>
              <p className="text-gray-400">A melhor moda com o melhor custo-benefício.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white transition">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Atendimento</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Suporte: contato@modaelite.com</li>
                <li>WhatsApp: (11) 99999-9999</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Afiliados</h4>
              <p className="text-gray-400 mb-4">Ganhe comissões vendendo nossos produtos.</p>
              <button 
                onClick={() => navigate('/register?type=afiliado')}
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Seja um Afiliado
              </button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            &copy; 2024 Moda Elite. Todos os direitos reservados.
          </div>
        </footer>
      </div>
    </AuthContext.Provider>
  );
};

export default App;
