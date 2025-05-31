import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu, X, Package } from "lucide-react";
import { logout } from "../apis/userApis";
import { removeAuth } from "../redux/slices/authSlice";
import type { RootStateType } from "../redux/store";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootStateType) => !!state.auth.user);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(removeAuth());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAuthAction = () => {
    if (isLoggedIn) {
      handleLogout();
    } else {
      navigate("/login");
    }
  };

  return (
    <nav className="bg-black border-b border-red-600/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-red-600 mr-2" />
            <span className="text-white text-xl font-bold">InventoryPro</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              <button onClick={() => navigate("/inventory")} className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer">
                Inventory
              </button>
              <button onClick={() => navigate("/customer")} className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer">
                Customers
              </button>
              <button onClick={() => navigate("/sales")} className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer">
                Sales
              </button>
              <button onClick={() => navigate("/reports")} className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer">
                Reports
              </button>
            </div>

            <button
              onClick={handleAuthAction}
              className={`px-4 py-2 rounded-md font-medium transition-colors cursor-pointer ${isLoggedIn
                ? 'text-gray-300 hover:text-red-400 border border-gray-600 hover:border-red-600'
                : 'bg-red-600 text-white hover:bg-red-700'
                }`}
            >
              {isLoggedIn ? 'Logout' : 'Sign In'}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-300 hover:text-red-400 transition-colors">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-red-600/20">
              <button onClick={() => navigate("/inventory")} className="block w-full text-left px-3 py-2 text-gray-300 hover:text-red-400">
                Inventory
              </button>
              <button onClick={() => navigate("/reports")} className="block w-full text-left px-3 py-2 text-gray-300 hover:text-red-400">
                Reports
              </button>
              <button
                onClick={handleAuthAction}
                className={`block w-full text-left px-3 py-2 mt-2 rounded-md font-medium transition-colors ${isLoggedIn
                  ? 'text-gray-300 hover:text-red-400 border border-gray-600'
                  : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
              >
                {isLoggedIn ? 'Logout' : 'Sign In'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
