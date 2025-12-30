import { useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'A';
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    if (onMenuClick) {
      onMenuClick();
    }
  };

  return (
    <header className="bg-blue-900 text-white flex items-center justify-between px-3 sm:px-4 lg:px-6 fixed top-0 left-0 right-0 lg:left-64 z-30 shadow-lg h-14 sm:h-16 lg:h-16" style={{ minHeight: '56px' }}>
      <div className="flex items-center gap-2">
        <button
          onClick={handleMenuClick}
          className="lg:hidden text-white hover:text-gray-200 p-2 rounded transition-colors flex-shrink-0"
          aria-label="Abrir menú"
        >
          <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 font-bold shadow-sm text-xs sm:text-sm flex-shrink-0">
          {getInitials(user?.name, user?.email)}
        </div>
      </div>
    </header>
  );
};

export default Header;

