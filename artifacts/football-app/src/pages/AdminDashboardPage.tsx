import React from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Helmet } from 'react-helmet-async';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <Helmet><title>Admin Dashboard - Karga CMS</title></Helmet>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Hoş Geldiniz, Yönetici</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-2">CMS Kurulumu Tamamlandı</h3>
          <p className="text-slate-500">Sol menüyü kullanarak blog yazılarını, üyeleri, API anahtarlarını ve site ayarlarını yönetebilirsiniz.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
