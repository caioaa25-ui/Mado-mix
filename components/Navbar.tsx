
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, LogOut, ChevronDown, Award } from 'lucide-react';
import { AuthContext } from '../App';
import { auth } from '../firebase';
import { UserRole } from '../types';

const Navbar: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((acc: number, item: any) => acc + item.quantity, 0));
    };
    updateCart();
    window.addEventListener('cart-updated', updateCart);
    return () => window.removeEventListener('cart-updated', updateCart);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setShowProfileMenu(false);
    navigate('/');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter text-indigo-600">
            MODA<span className="text-gray-900">ELITE</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-semibold transition">Início</Link>
            <Link to="/orders" className="text-gray-600 hover:text-indigo-600 font-semibold transition">Meus Pedidos</Link>
            
            {!user && (
               <Link to="/register?type=afiliado" className="flex items-center text-purple-600 font-bold hover:text-purple-700 transition">
                <Award size={18} className="mr-1" /> Seja Afiliado
              </Link>
            )}

            {user?.tipo === UserRole.ADMIN && (
              <Link to="/admin" className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold border border-indigo-100">Painel Admin</Link>
            )}
            
            {user?.tipo === UserRole.AFILIADO && (
              <Link to="/affiliate" className="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl font-bold border border-purple-100">Painel Afiliado</Link>
            )}

            <div className="flex items-center space-x-6 border-l pl-8">
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-indigo-600 transition">
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-2xl border border-transparent hover:border-gray-200 transition"
                  >
                    <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                      {user.nome.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border rounded-[1.5rem] shadow-2xl py-3 z-50 overflow-hidden animate-fadeIn">
                      <div className="px-5 py-3 border-b mb-2">
                        <p className="text-sm font-black text-gray-900 truncate">{user.nome}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link to="/orders" onClick={() => setShowProfileMenu(false)} className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 font-medium">Histórico de Pedidos</Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center font-bold mt-2"
                      >
                        <LogOut size={16} className="mr-2" /> Sair da Conta
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-black transition shadow-lg shadow-gray-200">
                  Entrar
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-gray-700">
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-900 p-2 bg-gray-50 rounded-xl">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t px-6 py-8 space-y-6 animate-fadeIn h-screen">
          <Link to="/" onClick={closeMenu} className="block text-xl font-bold text-gray-900 border-b pb-4">Início</Link>
          <Link to="/orders" onClick={closeMenu} className="block text-xl font-bold text-gray-900 border-b pb-4">Meus Pedidos</Link>
          
          {user?.tipo === UserRole.ADMIN && (
            <Link to="/admin" onClick={closeMenu} className="block text-xl font-black text-indigo-600 bg-indigo-50 p-4 rounded-2xl">Painel Administrativo</Link>
          )}
          {user?.tipo === UserRole.AFILIADO && (
            <Link to="/affiliate" onClick={closeMenu} className="block text-xl font-black text-purple-600 bg-purple-50 p-4 rounded-2xl">Painel de Afiliado</Link>
          )}

          {!user && (
            <Link to="/register?type=afiliado" onClick={closeMenu} className="block text-xl font-black text-purple-600 border-b pb-4">Programa de Afiliados</Link>
          )}

          <div className="pt-8">
            {user ? (
              <button 
                onClick={() => { handleLogout(); closeMenu(); }}
                className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black flex items-center justify-center text-lg"
              >
                <LogOut className="mr-2" /> Sair Agora
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link to="/login" onClick={closeMenu} className="bg-gray-100 text-gray-900 text-center py-4 rounded-2xl font-bold">Login</Link>
                <Link to="/register" onClick={closeMenu} className="bg-indigo-600 text-white text-center py-4 rounded-2xl font-bold">Criar Conta</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
