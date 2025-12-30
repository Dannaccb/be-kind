import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  MapPinIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen: controlledIsOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const sidebarOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;
  const setSidebarOpen = controlledIsOpen !== undefined ? (onClose ? () => onClose() : () => {}) : setIsOpen;

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname, setSidebarOpen]);

  const menuItems = [
    { path: '/dashboard', label: 'Home', icon: HomeIcon, id: 'home' },
    { path: '/dashboard/impacto', label: 'Impacto Social', icon: ChartBarIcon, id: 'impacto' },
    { path: '/dashboard/comunidad', label: 'Comunidad', icon: UserGroupIcon, id: 'comunidad' },
    { path: '/dashboard/sponsors', label: 'Sponsors', icon: CurrencyDollarIcon, id: 'sponsors' },
    { path: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingCartIcon, id: 'marketplace' },
    { path: '/dashboard/bakanes', label: 'Bakanes', icon: MapPinIcon, id: 'bakanes' },
    { path: '/dashboard/contenidos', label: 'Contenidos', icon: DocumentTextIcon, id: 'contenidos' },
    { path: '/dashboard/categorias', label: 'Categorías de acciones', icon: Cog6ToothIcon, id: 'categorias' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-white shadow-lg flex flex-col z-50
          w-64 sm:w-72 lg:w-64
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header with close button for mobile */}
        <div className="p-3 sm:p-4 lg:p-6 border-b flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logo.png" alt="be kind network" className="h-7 sm:h-8 w-auto" />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-600 hover:text-gray-800 p-1.5 rounded transition-colors flex-shrink-0"
            aria-label="Cerrar menú"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 sm:py-4 overflow-y-auto sidebar-nav" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path === '/dashboard' && location.pathname === '/dashboard');
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-xs sm:text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 sm:p-4 border-t flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

