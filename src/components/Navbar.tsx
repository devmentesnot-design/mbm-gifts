import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Globe, LogIn, LogOut, User, ChevronDown, Package, Shield, Gift, X } from 'lucide-react';
import { CartItem } from '../types/cart';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { MarketSwitcher } from './MarketSwitcher';

interface NavbarProps {
  cartItems: CartItem[];
  session: any;
  onOpenCart: () => void;
  onNavigateToLogin?: () => void;
  onNavigate?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartItems, session, onOpenCart, onNavigateToLogin, onNavigate }) => {
  const { lang, setLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleNavLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      window.location.href = '/login';
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Get user's first name and avatar
  const getUserInfo = () => {
    if (!session?.user) return { firstName: '', avatar: null };

    const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
    const avatarUrl = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null;
    
    if (fullName.trim()) {
      const parts = fullName.trim().split(' ');
      const firstName = parts[0];
      return {
        firstName,
        avatar: avatarUrl,
      };
    }

    const email = session.user.email || '';
    const username = email.split('@')[0] || 'User';
    const capitalizedFirstName = username.charAt(0).toUpperCase() + username.slice(1);
    return {
      firstName: capitalizedFirstName,
      avatar: avatarUrl,
    };
  };

  const { firstName, avatar } = getUserInfo();

  const navLinks = [
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.howToOrder'), path: '/how-to-order' },
    { label: t('nav.packages'), path: '/' },
  ];

  return (
    <>
      <header className="sticky top-0 w-full px-4 sm:px-8 lg:px-12 py-2 h-16 sm:h-20 flex items-center justify-between z-30 bg-[#8c1119]/90 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => handleNavLinkClick(e, '/')}
          className="flex items-center transition-transform hover:scale-105 py-0.5"
        >
          <img
            src="/logo.png"
            alt="MBM Gifts"
            referrerPolicy="no-referrer"
            className="h-14 sm:h-16 lg:h-18 w-auto object-contain scale-[2.5] origin-left drop-shadow-md"
          />
        </a>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={(e) => handleNavLinkClick(e, link.path)}
              className="font-inter text-xs sm:text-sm font-medium text-white/90 tracking-widest uppercase hover:text-amber-300 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
          {/* Market Switcher */}
          <MarketSwitcher cartItems={cartItems} />

          {/* Language Switcher Button */}
          <button
            onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
            className="flex items-center gap-1.5 bg-black/30 hover:bg-black/50 text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer"
            title="Switch Language / ቋንቋ ይቀይሩ"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span className="uppercase">{lang === 'en' ? 'EN' : 'አማርኛ'}</span>
          </button>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-white hover:text-amber-300 transition-colors focus:outline-none flex items-center gap-2 cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-inter uppercase tracking-wider text-white/80 hidden lg:inline">{t('nav.cart')}</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-[#8c1119] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Profile Avatar / Login Button */}
          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 bg-black/40 hover:bg-black/60 border border-amber-400/40 rounded-full pl-1.5 pr-3 py-1 text-xs text-white transition-all duration-200 cursor-pointer"
              >
                {/* Avatar Image or Initial Fallback */}
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt={firstName}
                    className="w-7 h-7 rounded-full object-cover border-2 border-amber-400/50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-[#8c1119] font-extrabold flex items-center justify-center text-xs shadow-inner">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* First Name Only */}
                <span className="font-semibold tracking-wide text-amber-200 max-w-[100px] truncate">
                  {firstName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-amber-300/80 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#2a0407] border border-amber-400/40 rounded-xl shadow-2xl p-2 z-50 animate-scale-in">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs text-amber-300 font-bold truncate">{firstName}</p>
                    <p className="text-[11px] text-white/50 truncate">{session.user?.email}</p>
                  </div>

                  <a
                    href="/my-orders"
                    onClick={(e) => {
                      setProfileDropdownOpen(false);
                      handleNavLinkClick(e, '/my-orders');
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-300" />
                    <span>My Orders</span>
                  </a>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      supabase.auth.signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer mt-1 border-t border-white/5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              className="group inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#8c1119] px-4 py-2 text-xs tracking-widest uppercase font-inter font-bold rounded-full transition-all duration-300 cursor-pointer shadow-md shadow-amber-400/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('nav.login')}</span>
            </button>
          )}
        </div>

        {/* Mobile Header Controls */}
        <div className="flex md:hidden items-center space-x-1.5">
          <MarketSwitcher cartItems={cartItems} compact={true} />

          {/* Language Toggle Mobile */}
          <button
            onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
            className="flex items-center gap-1 bg-black/30 text-amber-300 border border-amber-400/30 px-2 py-1 rounded-full text-[10px] font-bold tracking-wider"
            title="Switch Language"
          >
            <Globe className="w-3 h-3 text-amber-300" />
            <span>{lang === 'en' ? 'EN' : 'አማ'}</span>
          </button>

          {/* Mobile Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-1.5 text-white hover:text-amber-300 transition-colors focus:outline-none"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-[#8c1119] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-end space-y-1 p-2 focus:outline-none"
            aria-label="Open menu"
          >
            <span className="w-5 h-0.5 bg-white" />
            <span className="w-5 h-0.5 bg-white" />
            <span className="w-3 h-0.5 bg-white" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-md md:hidden flex flex-col justify-between transition-all duration-500 ${menuOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
          }`}
      >
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
          <img
            src="/logo.png"
            alt="MBM Gifts"
            referrerPolicy="no-referrer"
            className="h-12 sm:h-14 w-auto object-contain scale-[1.3] origin-left drop-shadow-md"
          />
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 text-white hover:text-white/70 transition-colors focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6 my-auto py-6">
          {session && (
            <div className="flex flex-col items-center mb-2">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={firstName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-lg mb-2"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-400 text-[#8c1119] font-bold font-podium text-xl flex items-center justify-center mb-2 shadow-lg">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="text-amber-300 font-bold text-sm">{firstName}</p>
              <p className="text-white/50 text-xs mb-3">{session.user?.email}</p>
              <a
                href="/my-orders"
                onClick={(e) => {
                  setMenuOpen(false);
                  handleNavLinkClick(e, '/my-orders');
                }}
                className="inline-flex items-center gap-2 border border-amber-400/50 bg-amber-400/10 text-amber-300 font-bold px-5 py-2 text-xs font-inter tracking-widest uppercase rounded-full hover:bg-amber-400/20 transition-all"
              >
                <Package className="w-4 h-4 text-amber-300" />
                <span>My Orders</span>
              </a>
            </div>
          )}

          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={(e) => {
                setMenuOpen(false);
                handleNavLinkClick(e, link.path);
              }}
              className="font-podium text-2xl text-white uppercase tracking-wider hover:text-amber-300 transition-colors"
            >
              {link.label}
            </a>
          ))}

          {session ? (
            <button
              onClick={() => {
                supabase.auth.signOut();
                setMenuOpen(false);
              }}
              className="inline-flex items-center gap-2 border border-white/30 bg-white/10 px-6 py-3 text-xs font-inter tracking-widest uppercase text-white rounded-full"
            >
              <LogOut className="w-4 h-4 text-amber-300" />
              <span>{t('nav.logout')}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLoginClick();
              }}
              className="inline-flex items-center gap-2 border border-amber-400/60 bg-amber-400 text-[#8c1119] font-bold px-6 py-3 text-xs font-inter tracking-widest uppercase rounded-full"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('nav.login')}</span>
            </button>
          )}
        </div>

        <div className="py-6 border-t border-white/10 text-center text-xs text-white/40">
          MBM GIFTS &copy; 2026
        </div>
      </div>
    </>
  );
};
