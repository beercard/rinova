import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, Mail, Phone, Calendar, Trash2, CheckCircle, Circle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { fetchContacts, deleteContact, markContactRead } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      console.log('👥 [AdminContacts] Loading contacts...');
      setLoading(true);
      const data = await fetchContacts();
      // Sort by date, newest first
      const sorted = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      console.log(`✅ [AdminContacts] Loaded ${sorted.length} contacts`);
      setContacts(sorted);
    } catch (error) {
      console.error('❌ [AdminContacts] Error loading contacts:', error);
      toast({
        title: "Error de carga",
        description: "No se pudieron cargar los contactos. Verifique su conexión.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Seguro que deseas eliminar este contacto?')) return;

    try {
      await deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado correctamente."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el contacto.",
        variant: "destructive"
      });
    }
  };

  const handleToggleRead = async (id, currentStatus, e) => {
    e.stopPropagation();
    try {
      const newStatus = !currentStatus;
      await markContactRead(id, newStatus);
      
      setContacts(prev => prev.map(c => 
        c.id === id ? { ...c, read: newStatus } : c
      ));

      toast({
        title: newStatus ? "Marcado como leído" : "Marcado como no leído",
        description: "Estado del contacto actualizado."
      });
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const handleExport = () => {
    try {
      if (contacts.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay contactos para exportar",
          variant: "warning"
        });
        return;
      }

      console.log('📊 [AdminContacts] Exporting contacts to CSV');
      
      // Define CSV headers
      const headers = ['Nombre', 'Email', 'Teléfono', 'Tipo', 'Mensaje', 'Fecha', 'Leído'];
      
      // Convert data to CSV format
      const csvRows = [
        headers.join(','), // Header row
        ...contacts.map(contact => {
          const row = [
            `"${contact.nombre || ''}"`,
            `"${contact.email || ''}"`,
            `"${contact.telefono || ''}"`,
            `"${contact.tipo || ''}"`,
            `"${(contact.mensaje || '').replace(/"/g, '""')}"`, // Escape quotes in message
            `"${new Date(contact.fecha).toLocaleString('es-UY')}"`,
            `"${contact.read ? 'Si' : 'No'}"`
          ];
          return row.join(',');
        })
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `contactos_rinova_${dateStr}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportación exitosa",
        description: "El archivo CSV se ha descargado correctamente.",
        variant: "success"
      });
    } catch (error) {
      console.error('❌ [AdminContacts] Error exporting contacts:', error);
      toast({
        title: "Error de exportación",
        description: "Hubo un problema al generar el archivo CSV.",
        variant: "destructive"
      });
    }
  };

  const filteredContacts = filter === 'all' 
    ? contacts 
    : contacts.filter(c => c.tipo === filter);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoBadgeColor = (tipo) => {
    switch (tipo) {
      case 'alquilar':
        return 'bg-blue-100 text-blue-800';
      case 'vender':
        return 'bg-green-100 text-green-800';
      case 'invertir':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>Gestión de Contactos - Admin Rinova</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#030083]">Gestión de Contactos</h1>
              <p className="text-gray-600 mt-1">Revisa y administra los mensajes recibidos</p>
            </div>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {['all', 'alquilar', 'vender', 'invertir'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    filter === f
                      ? 'bg-[#030083] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f} ({f === 'all' ? contacts.length : contacts.filter(c => c.tipo === f).length})
                </button>
              ))}
            </div>
          </div>

          {/* Contacts List */}
          {loading ? (
             <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#030083]"></div>
                <p className="text-gray-500">Cargando contactos...</p>
              </div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-xl text-gray-600">No hay contactos registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={`rounded-xl p-6 transition-all border ${
                    contact.read 
                      ? 'bg-gray-50 border-gray-200 opacity-90' 
                      : 'bg-white border-blue-100 shadow-md border-l-4 border-l-[#030083]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => handleToggleRead(contact.id, contact.read, e)}
                            className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${contact.read ? 'text-gray-400' : 'text-[#030083]'}`}
                            title={contact.read ? "Marcar como no leído" : "Marcar como leído"}
                          >
                             {contact.read ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5 fill-current" />}
                          </button>
                          <div>
                            <h3 className={`text-xl font-bold ${contact.read ? 'text-gray-600' : 'text-[#060805]'}`}>
                              {contact.nombre}
                            </h3>
                            <span className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-semibold uppercase ${getTipoBadgeColor(contact.tipo)}`}>
                              {contact.tipo}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <div className="flex items-center text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(contact.fecha)}
                            </div>
                            <button
                              onClick={(e) => handleDelete(contact.id, e)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar contacto"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center text-gray-700 hover:text-[#030083] transition-colors p-2 hover:bg-gray-50 rounded-lg"
                        >
                          <Mail className="w-5 h-5 mr-3 text-gray-400" />
                          {contact.email}
                        </a>
                        <a
                          href={`tel:${contact.telefono}`}
                          className="flex items-center text-gray-700 hover:text-[#030083] transition-colors p-2 hover:bg-gray-50 rounded-lg"
                        >
                          <Phone className="w-5 h-5 mr-3 text-gray-400" />
                          {contact.telefono}
                        </a>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Mensaje:</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{contact.mensaje}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminContacts;