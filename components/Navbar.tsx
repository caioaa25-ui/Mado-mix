
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, LogOut, ChevronDown } from 'lucide-react';
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
    navigate('/');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            MODA ELITE
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">Início</Link>
            <Link to="/orders" className="text-gray-600 hover:text-indigo-600 font-medium">Meus Pedidos</Link>
            
            {user?.tipo === UserRole.ADMIN && (
              <Link to="/admin" className="text-indigo-600 font-semibold">Admin</Link>
            )}
            
            {user?.tipo === UserRole.AFILIADO && (
              <Link to="/affiliate" className="text-purple-600 font-semibold">Afiliado</Link>
            )}

            <div className="flex items-center space-x-4">
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition">
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 font-medium"
                  >
                    <User size={24} />
                    <ChevronDown size={16} />
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-bold text-gray-800 truncate">{user.nome}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut size={16} className="mr-2" /> Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition">
                  Entrar
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-gray-600">
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t px-4 py-6 space-y-4">
          <Link to="/" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-gray-700">Início</Link>
          <Link to="/orders" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-gray-700">Meus Pedidos</Link>
          {user?.tipo === UserRole.ADMIN && (
            <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-lg font-semibold text-indigo-600">Painel Admin</Link>
          )}
          {user?.tipo === UserRole.AFILIADO && (
            <Link to="/affiliate" onClick={() => setIsOpen(false)} className="block text-lg font-semibold text-purple-600">Painel Afiliado</Link>
          )}
          {user ? (
            <button 
              onClick={() => { handleLogout(); setIsOpen(false); }}
              className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-semibold"
            >
              Sair da Conta
            </button>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-semibold">
              Entrar / Cadastrar
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
