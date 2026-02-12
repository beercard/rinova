
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import PropertyForm from '@/components/PropertyForm';
import { fetchProperties, deleteProperty } from '@/lib/supabase';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    loadProperties();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('properties-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'properties'
        },
        (payload) => {
          console.log('🔔 [Realtime] Change received!', payload);
          // Refresh list immediately when change occurs
          loadProperties(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page]); // Reload when page changes

  const loadProperties = async () => {
    try {
      // Don't set loading true if it's a background refresh to avoid flickering
      if (properties.length === 0) setLoading(true);
      setError(null);
      
      console.log(`🏢 [AdminProperties] Loading properties list (Page ${page})...`);
      const { data, count } = await fetchProperties({ 
        page, 
        limit: ITEMS_PER_PAGE,
        columns: 'id, title, price, type, zone, images' // Optimize: fetch only needed columns
      });
      
      setProperties(data);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('❌ [AdminProperties] Error loading properties:', error);
      setError('No se pudieron cargar las propiedades. Verifique su conexión.');
      toast({
        title: "Error",
        description: "No se pudieron cargar las propiedades. Verifique su conexión.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property) => {
    console.log('✏️ [AdminProperties] Editing property:', property.id);
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      console.log('🗑️ [AdminProperties] Deleting property:', id);
      await deleteProperty(id);
      toast({
        title: "Propiedad eliminada",
        description: "La propiedad ha sido eliminada correctamente",
        variant: "default"
      });
      // List refresh is handled by Realtime subscription
    } catch (error) {
      console.error('❌ [AdminProperties] Error deleting property:', error);
      toast({
        title: "Error",
        description: `No se pudo eliminar la propiedad: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleFormClose = () => {
    console.log('🔒 [AdminProperties] Closing property form');
    setShowForm(false);
    setEditingProperty(null);
    // Refresh to ensure we have latest data (in case realtime is slow/disconnected)
    loadProperties();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <Helmet>
        <title>Gestión de Propiedades - Admin Rinova</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#030083]">Gestión de Propiedades</h1>
              <p className="text-gray-600 mt-1">Administra el catálogo de propiedades</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#030083] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0041CF] transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Nueva Propiedad
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#030083]"></div>
                <p className="text-gray-500">Cargando propiedades...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={loadProperties}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="mb-4 inline-block p-4 bg-gray-100 rounded-full">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-xl font-medium text-gray-900 mb-2">No hay propiedades registradas</p>
              <p className="text-gray-500 mb-6">Comienza agregando tu primera propiedad al catálogo.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-2 bg-[#030083] text-white rounded-lg hover:bg-[#0041CF] font-medium transition-colors"
              >
                Agregar Propiedad
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48 flex-shrink-0 bg-gray-100">
                      <img
                        src={property.images && property.images.length > 0 ? property.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Error'}
                      />
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                          property.type === 'venta' 
                            ? 'bg-[#030083] text-white' 
                            : 'bg-green-600 text-white'
                        }`}>
                          {property.type === 'venta' ? 'Venta' : 'Alquiler'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900">{property.title}</h3>
                      <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                        {property.zone}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <p className="text-2xl font-bold text-[#030083] mb-4">
                          {formatPrice(property.price)}
                        </p>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(property)}
                            className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(property.id)}
                            className="flex-1 bg-white border border-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-gray-600 font-medium">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {showForm && (
          <PropertyForm
            property={editingProperty}
            onClose={handleFormClose}
          />
        )}
      </AdminLayout>
    </>
  );
};

export default AdminProperties;
