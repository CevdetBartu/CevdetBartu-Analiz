import React from 'react';
import { Link, useLocation } from "wouter";
import { Users, FileText, Settings, Key, LayoutDashboard, LogOut, Home } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/admin", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { href: "/admin/blog", icon: <FileText size={20} />, label: "Blog Yönetimi" },
    { href: "/admin/users", icon: <Users size={20} />, label: "Üye Yönetimi" },
    { href: "/admin/api", icon: <Key size={20} />, label: "API Key Yönetimi" },
    { href: "/admin/settings", icon: <Settings size={20} />, label: "Site Ayarları" },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Helmet><title>KargaTahmin CMS</title></Helmet>
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <Link href="/admin" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            🦅 Karga CMS
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
            <Home size={20} /> Siteye Dön
          </Link>
          <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-slate-800">
            <LogOut size={20} /> Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
