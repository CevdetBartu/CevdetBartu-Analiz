import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, User, LogOut } from 'lucide-react';
import { isAuthenticated, removeToken, removeUserEmail, getUserRole } from '../../lib/auth';

export function Header() {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  
  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, [location]);

  const handleLogout = () => {
    removeToken();
    removeUserEmail();
    setIsAuth(false);
    setLocation('/login');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const NavLinks = () => (
    <>
      <Link href="/bugun" onClick={closeMenu} className={`hover:text-primary transition-colors ${location === '/bugun' ? 'text-primary font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>BÃ¼lten / Analiz</Link>
      <Link href="/canli" onClick={closeMenu} className={`hover:text-primary transition-colors ${location === '/canli' ? 'text-primary font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>CanlÄ±</Link>
      <Link href="/manuel" onClick={closeMenu} className={`hover:text-primary transition-colors ${location === '/manuel' ? 'text-primary font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>Manuel Tahmin</Link>
      <Link href="/blog" onClick={closeMenu} className={`hover:text-primary transition-colors ${location.startsWith('/blog') ? 'text-primary font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>Blog</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation('/')}>
            <img src="/logo.jpg" alt="ØargaTahmin" className="w-8 h-8 rounded-full shadow-sm" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }} />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              KargaTahmin <span className="font-normal opacity-70">Analytics</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
            <NavLinks />
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {getUserRole() === "admin" && (<Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Veritabanı</Link>)}
            
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>

            {isAuth ? (
              <div className="flex items-center gap-2">
                <Link href="/hesabim" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition-colors">
                  <User size={16} /> HesabÄ±m
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-300 transition-colors">GiriÅ Yap</Link>
                <Link href="/register" className="text-sm font-semibold text-white bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-lg transition-colors">Ãcretsiz BaÅla</Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-6 space-y-4 shadow-xl absolute w-full">
          <nav className="flex flex-col gap-4 font-medium">
            <NavLinks />
            <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
            {getUserRole() === "admin" && (<Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Veritabanı</Link>)}
            
            {isAuth ? (
              <>
                <Link href="/hesabim" onClick={closeMenu} className="flex items-center gap-2 text-slate-900 dazä:text-white font-semibold">
                  <User size={18} /> HesabÄ±m
                </Link>
                <button onClick={() => { handleLogout(); closeMenu(); }} className="flex items-center gap-2 text-red-600 font-semibold w-full text-left">
                  <LogOut size={18} /> ÃioÄ±Å Yap
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <Link href="/login" onClick={closeMenu} className="text-center py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold">GiriuÅ Yap</Link>
                <Link href="/register" onClick={closeMenu} className="text-center py-2 px-4 rounded-lg bg-primary text-white font-semibold">Ãcretsiz BaÅla</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
