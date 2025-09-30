'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import { Car, Menu, X, Globe } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const isProcessingClick = useRef(false);
  const router = useRouter();

  const menuItems = [
    { name: 'Home', link: '/' },
    { name: 'Book Taxi', link: '#book-taxi-section' },
    { name: 'Shared Rides', link: '#shared-rides-section' },
    { name: 'Car Option', link: '#vehicle-options-section' },
  ];

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if menu is open and click is outside the menu
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Check if the click target is not the hamburger button
        const hamburgerButton = document.querySelector('[aria-label="Toggle mobile menu"]');
        if (hamburgerButton && !hamburgerButton.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle search submission
  const handleSearch = (query: string, closeMobileMenu = false) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      if (closeMobileMenu) {
        setIsMenuOpen(false);
      }
    }
  };

  // Handle mobile search form submission
  const handleMobileSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(mobileSearchQuery, true);
  };

  // Handle Enter key press for search
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, query: string, closeMobileMenu = false) => {
    if (e.key === 'Enter') {
      handleSearch(query, closeMobileMenu);
    }
  };

  return (
    <nav className="bg-black shadow-md mt-8">
      {/* Header container with top and side spacing */}
      <div className="flex h-20 md:h-24 items-center px-4 md:px-8 py-4">
        {/* Larger Rounded Background Shape (removed bg-white to inherit black) */}
        <div className="flex-1 rounded-full py-2 md:py-3 px-4 md:px-6 mx-4 md:mx-8 shadow-lg">
          {/* Smaller Inner Navbar (removed bg-white to inherit black) */}
          <div className="rounded-lg flex items-center justify-between px-3 md:px-6 py-2 w-full">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-4">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Car className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Share Taxi Sri Lanka</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  className="text-white hover:text-primary transition-all duration-300 font-semibold text-xl tracking-wide" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right side: Language, Login, Sign Up, Mobile Button */}
            <div className="flex items-center space-x-3 md:space-x-4">
              {/* Language Button */}
              <button
                className="!bg-black !text-white hover:!bg-gray-800 !rounded-full shadow-md hover:shadow-lg w-12 h-12 md:w-10 md:h-10 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary !border-0"
              >
                <Globe className="w-5 h-5" />
              </button>

              {/* Login Button for Desktop */}
              <Link
                href="/login"
                className="hidden md:block text-center !bg-black !text-white hover:!bg-gray-800 py-2 px-4 font-medium text-lg tracking-wide rounded-lg transition-all duration-200 !border-0"
              >
                Login
              </Link>

              {/* Sign Up Button for Desktop */}
              <Link
                href="/signup"
                className="hidden md:block text-center !bg-black !text-white hover:!bg-gray-800 py-2 px-4 font-medium text-lg tracking-wide rounded-lg transition-all duration-200 !border-0"
              >
                Sign Up
              </Link>

              {/* Mobile Menu Toggle */}
              <div className="md:hidden">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Prevent double-clicking by checking if we're already processing
                    if (isProcessingClick.current) {
                      return;
                    }

                    isProcessingClick.current = true;

                    setIsMenuOpen(prev => !prev);

                    // Reset the processing flag after a short delay
                    setTimeout(() => {
                      isProcessingClick.current = false;
                    }, 300);
                  }}
                  className="text-white hover:bg-gray-800 active:bg-gray-900 rounded-lg p-2 transition-all duration-150 flex items-center justify-center w-12 h-12 touch-manipulation select-none"
                  aria-label="Toggle mobile menu"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                >
                  {isMenuOpen ? (
                    <X className="text-2xl transition-all duration-200" />
                  ) : (
                    <Menu className="text-2xl transition-all duration-200" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="md:hidden bg-black border-t border-gray-700 px-4 py-6 rounded-full"
        >
          {/* Mobile Navigation Menu */}
          <div className="space-y-3 mb-6">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.link}
                className="block w-full text-center text-white hover:text-primary active:bg-gray-800 py-4 px-4 font-semibold text-xl tracking-wide rounded-lg transition-all duration-200 touch-manipulation border-0"
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }}
                onTouchStart={(e: React.TouchEvent<HTMLAnchorElement>) => {
                  e.stopPropagation();
                }}
              >
                {item.name}
              </Link>
            ))}

            {/* Login Button for Mobile */}
            <Link
              href="/login"
              className="block w-full text-center !bg-black !text-white hover:!bg-gray-800 py-4 px-4 font-medium text-lg tracking-wide rounded-lg transition-all duration-200 touch-manipulation !border-0"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
                setIsMenuOpen(false);
              }}
              onTouchStart={(e: React.TouchEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
              }}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Login
            </Link>

            {/* Sign Up Button for Mobile */}
            <Link
              href="/signup"
              className="block w-full text-center !bg-black !text-white hover:!bg-gray-800 py-4 px-4 font-medium text-lg tracking-wide rounded-lg transition-all duration-200 touch-manipulation !border-0"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
                setIsMenuOpen(false);
              }}
              onTouchStart={(e: React.TouchEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
              }}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleMobileSearchSubmit} className="relative">
            <input
              type="text"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, mobileSearchQuery, true)}
              placeholder="Search destinations..."
              className="w-full pr-12 pl-4 py-3 text-base border border-gray-600 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 rounded-full"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-primary transition-all duration-300 focus:outline-none"
            >
              <FaSearch />
            </button>
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;