import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useROISettings = () => {
  const [settings, setSettings] = useState({
    annual_return_percentage: 5,
    operational_expenses_percentage: 10,
    tax_percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('roi_settings')
        .select('*')
        .single();

      if (error) {
        // If no row exists or other error, we might stick with defaults
        console.warn('⚠️ [useROISettings] Could not fetch settings, using defaults.', error.message);
        // Not necessarily a blocking error, just fallback to defaults
      } else if (data) {
        setSettings({
          annual_return_percentage: Number(data.annual_return_percentage),
          operational_expenses_percentage: Number(data.operational_expenses_percentage),
          tax_percentage: Number(data.tax_percentage)
        });
      }
    } catch (err) {
      console.error('❌ [useROISettings] Unexpected error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, refetch: fetchSettings };
};