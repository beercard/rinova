
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Users, MessageSquare, TrendingUp, Building, ArrowRight, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { fetchProperties, fetchContacts } from '@/lib/supabase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalContacts: 0,
    recentInquiries: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch count only for properties to be faster
      const { count } = await fetchProperties({ limit: 1, columns: 'id' });
      const contacts = await fetchContacts();
      
      // Count recent inquiries (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recent = contacts.filter(c => new Date(c.fecha) > sevenDaysAgo);

      setStats({
        totalProperties: count || 0,
        totalContacts: contacts.length,
        recentInquiries: recent.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Error al cargar estadísticas. Mostrando datos parciales o vacíos.');
      // Fallback values
      setStats({
        totalProperties: '-',
        totalContacts: '-',
        recentInquiries: '-'
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Propiedades',
      value: stats.totalProperties,
      icon: <Building className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      link: '/admin/propiedades'
    },
    {
      title: 'Total Contactos',
      value: stats.totalContacts,
      icon: <Users className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      link: '/admin/contactos'
    },
    {
      title: 'Consultas Recientes',
      value: stats.recentInquiries,
      icon: <MessageSquare className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      link: '/admin/contactos'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Admin Rinova</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminLayout>
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-[#030083]">Dashboard</h1>
              <p className="text-gray-600 mt-1">Bienvenido al panel de administración de Rinova</p>
            </div>
          </motion.div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={stat.link} className="block h-full group">
                  <div className={`${stat.color} rounded-xl p-6 text-white shadow-lg transition-transform transform group-hover:-translate-y-1 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-150 group-hover:scale-125 transition-transform duration-700">
                      {stat.icon}
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="text-4xl font-bold mb-1">
                        {loading ? (
                          <div className="h-8 w-16 bg-white/30 animate-pulse rounded"></div>
                        ) : (
                          stat.value
                        )}
                      </div>
                      <div className="text-white/90 font-medium flex items-center gap-2">
                        {stat.title}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-[#030083] mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/admin/propiedades"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#030083] hover:bg-blue-50 transition-all group"
              >
                <div className="bg-blue-100 text-blue-700 p-3 rounded-lg group-hover:bg-[#030083] group-hover:text-white transition-colors">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-[#030083]">Propiedades</div>
                  <div className="text-xs text-gray-500">Administrar catálogo</div>
                </div>
              </Link>

              <Link
                to="/admin/contactos"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#030083] hover:bg-blue-50 transition-all group"
              >
                <div className="bg-green-100 text-green-700 p-3 rounded-lg group-hover:bg-[#030083] group-hover:text-white transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-[#030083]">Contactos</div>
                  <div className="text-xs text-gray-500">Ver mensajes</div>
                </div>
              </Link>

              <Link
                to="/"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#030083] hover:bg-blue-50 transition-all group"
              >
                <div className="bg-purple-100 text-purple-700 p-3 rounded-lg group-hover:bg-[#030083] group-hover:text-white transition-colors">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-[#030083]">Sitio Web</div>
                  <div className="text-xs text-gray-500">Ver página pública</div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
