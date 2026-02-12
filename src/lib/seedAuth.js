import { supabase } from '@/lib/customSupabaseClient';

export const ensureAdminUser = async () => {
  try {
    console.log('🔐 [Auth Seeder] Ensuring admin user exists...');
    const { data, error } = await supabase.functions.invoke('seed-admin-user');
    
    if (error) throw error;
    
    console.log('✅ [Auth Seeder] Result:', data);
    return data;
  } catch (error) {
    console.error('❌ [Auth Seeder] Failed:', error);
    return null;
  }
};