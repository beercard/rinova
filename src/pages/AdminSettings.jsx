import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Settings, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    annual_return_percentage: 5,
    operational_expenses_percentage: 10,
    tax_percentage: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const getSupabaseHost = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!url) return '';
    try {
      return new URL(url).host;
    } catch {
      return String(url);
    }
  };

  const isPlaceholderSupabaseUrl = () => {
    const url = (import.meta.env.VITE_SUPABASE_URL || '').toLowerCase();
    return url.includes('your-project') || url.includes('your_supabase') || url.includes('your supabase');
  };

  const testSupabaseConnection = async () => {
    setTesting(true);
    setConnectionInfo(null);
    try {
      const sessionRes = await supabase.auth.getSession();
      const sessionUserEmail = sessionRes?.data?.session?.user?.email || null;

      const propertiesRes = await supabase
        .from('properties')
        .select('id', { count: 'exact' })
        .limit(1);

      if (propertiesRes.error) throw propertiesRes.error;

      const roiRes = await supabase
        .from('roi_settings')
        .select('id')
        .limit(1);

      if (roiRes.error && roiRes.error.code !== 'PGRST116') throw roiRes.error;

      const info = {
        host: getSupabaseHost(),
        sessionUserEmail,
        propertiesCount: propertiesRes.count ?? null,
      };

      setConnectionInfo(info);
      toast({
        title: "Conexión OK",
        description: `Supabase responde. Properties: ${info.propertiesCount ?? 'N/D'}`,
      });
    } catch (error) {
      const message = error?.message || 'Error desconocido';
      toast({
        title: "Falla de conexión / permisos",
        description: message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('roi_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
        throw error;
      }

      if (data) {
        setFormData({
          id: data.id,
          annual_return_percentage: data.annual_return_percentage,
          operational_expenses_percentage: data.operational_expenses_percentage,
          tax_percentage: data.tax_percentage
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        annual_return_percentage: formData.annual_return_percentage,
        operational_expenses_percentage: formData.operational_expenses_percentage,
        tax_percentage: formData.tax_percentage,
        updated_at: new Date().toISOString()
      };

      // If we have an ID, update specific row. If not (shouldn't happen with seed), insert.
      // Since we used .single(), we likely have an ID if data exists.
      // But upsert works well if we assume there's only one relevant row or we want to create it.
      // However, without a WHERE clause for update, we need the Primary Key for upsert to update.
      if (formData.id) {
        payload.id = formData.id;
      }

      const { data, error } = await supabase
        .from('roi_settings')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFormData(prev => ({ ...prev, id: data.id }));
      }

      toast({
        title: "Configuración guardada",
        description: "Los valores de la calculadora han sido actualizados.",
        variant: "default"
      });

    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Configuración - Admin Rinova</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#030083] flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Configuración del Sistema
            </h1>
            <p className="text-gray-600 mt-2">Ajusta los parámetros globales de la aplicación</p>
          </div>

          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">Estado de Supabase</h2>
              <p className="text-sm text-gray-500">Verifica URL configurada, sesión y permisos de lectura</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-600">Proyecto</div>
                  <div className="font-semibold text-gray-900 break-all">{getSupabaseHost() || 'Sin configurar'}</div>
                  {isPlaceholderSupabaseUrl() && (
                    <div className="text-sm text-red-600 mt-1">
                      La URL parece un placeholder. Completá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
                    </div>
                  )}
                  {connectionInfo?.sessionUserEmail && (
                    <div className="text-sm text-gray-600 mt-1">
                      Sesión: <span className="font-medium text-gray-900">{connectionInfo.sessionUserEmail}</span>
                    </div>
                  )}
                  {connectionInfo?.propertiesCount !== null && connectionInfo?.propertiesCount !== undefined && (
                    <div className="text-sm text-gray-600 mt-1">
                      Properties (count): <span className="font-medium text-gray-900">{connectionInfo.propertiesCount}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={testSupabaseConnection}
                  disabled={testing}
                  className="bg-[#030083] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#0041CF] transition-all flex items-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Probando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Probar Conexión
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">Calculadora ROI</h2>
              <p className="text-sm text-gray-500">Define los valores por defecto y porcentajes fijos para la calculadora pública</p>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#030083]" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apreciación Anual (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="annual_return_percentage"
                          value={formData.annual_return_percentage}
                          onChange={handleChange}
                          step="0.1"
                          min="0"
                          max="100"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Valor estimado de crecimiento anual de la propiedad
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gastos Operativos (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="operational_expenses_percentage"
                          value={formData.operational_expenses_percentage}
                          onChange={handleChange}
                          step="0.1"
                          min="0"
                          max="100"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all outline-none"
                        />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Porcentaje del alquiler destinado a mantenimiento y gestión
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Impuestos (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="tax_percentage"
                          value={formData.tax_percentage}
                          onChange={handleChange}
                          step="0.1"
                          min="0"
                          max="100"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#030083] focus:border-transparent transition-all outline-none"
                        />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Tasa impositiva estimada sobre las ganancias
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#030083] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0041CF] transition-all flex items-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminSettings;
