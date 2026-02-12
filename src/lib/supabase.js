
import { supabase } from '@/lib/customSupabaseClient';

// Helper to simulate network delay (optional, can be removed in prod)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for retry logic
const fetchWithRetry = async (fn, retries = 3, delayMs = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await delay(delayMs);
    return fetchWithRetry(fn, retries - 1, delayMs * 2); // Exponential backoff
  }
};

// --- Properties Operations ---

/**
 * Optimized fetch for properties with pagination and column selection.
 * @param {Object} options - { page, limit, columns }
 */
export const fetchProperties = async ({ page = 1, limit = 100, columns = '*' } = {}) => {
  console.log(`📦 [Supabase] Fetching properties (Page: ${page}, Limit: ${limit})...`);
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const query = async () => {
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), 10000)
    );

    const fetchPromise = supabase
      .from('properties')
      .select(columns, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    // Race the fetch against the timeout
    const { data, error, count } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error) {
      console.error('❌ [Supabase] Error fetching properties:', error.message);
      throw error;
    }

    return { data, count };
  };

  try {
    return await fetchWithRetry(query);
  } catch (error) {
    console.error('❌ [Supabase] Exception in fetchProperties after retries:', error);
    throw error;
  }
};

export const fetchPropertyById = async (id, columns = '*') => {
  console.log(`📦 [Supabase] Fetching property by id: ${id}`);
  const { data, error } = await supabase
    .from('properties')
    .select(columns)
    .eq('id', id)
    .single();

  if (error) {
    console.error('❌ [Supabase] Error fetching property:', error.message);
    throw error;
  }

  return data;
};

export const saveProperty = async (property) => {
  console.log('💾 [Supabase] Saving new property:', property.title);
  try {
    const payload = {
      ...property,
      price: Number(property.price),
      bedrooms: Number(property.bedrooms),
      bathrooms: Number(property.bathrooms),
      area: Number(property.area),
      latitude: Number(property.latitude),
      longitude: Number(property.longitude),
      images: Array.isArray(property.images) ? property.images : [],
      address: property.address || ''
    };

    delete payload.id;

    const { data, error } = await supabase
      .from('properties')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('❌ [Supabase] Error saving property:', error.message);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('❌ [Supabase] Exception in saveProperty:', error);
    throw error;
  }
};

export const updateProperty = async (id, updates) => {
  console.log(`💾 [Supabase] Updating property ${id}`);
  try {
    const payload = { ...updates };
    if (payload.price) payload.price = Number(payload.price);
    if (payload.bedrooms) payload.bedrooms = Number(payload.bedrooms);
    if (payload.bathrooms) payload.bathrooms = Number(payload.bathrooms);
    if (payload.area) payload.area = Number(payload.area);
    if (payload.latitude) payload.latitude = Number(payload.latitude);
    if (payload.longitude) payload.longitude = Number(payload.longitude);
    
    delete payload.id;
    delete payload.created_at;

    const { data, error } = await supabase
      .from('properties')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [Supabase] Error updating property:', error.message);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('❌ [Supabase] Exception in updateProperty:', error);
    throw error;
  }
};

export const deleteProperty = async (id) => {
  console.log(`🗑️ [Supabase] Deleting property ${id}`);
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [Supabase] Error deleting property:', error.message);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('❌ [Supabase] Exception in deleteProperty:', error);
    throw error;
  }
};

// --- Contacts Operations (LocalStorage Mock) ---

export const fetchContacts = async () => {
  console.log('📦 [Supabase] Fetching contacts...');
  try {
    const stored = localStorage.getItem('rinova_contacts');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error fetching contacts', error);
    return [];
  }
};

export const saveContact = async (contact) => {
  console.log('💾 [Supabase] Saving contact locally');
  const contacts = await fetchContacts();
  const newContact = { ...contact, id: Date.now(), fecha: new Date().toISOString(), read: false };
  contacts.push(newContact);
  localStorage.setItem('rinova_contacts', JSON.stringify(contacts));
  return newContact;
};

export const deleteContact = async (id) => {
  console.log(`🗑️ [Supabase] Deleting contact ${id}`);
  const contacts = await fetchContacts();
  const filtered = contacts.filter(c => c.id !== id);
  localStorage.setItem('rinova_contacts', JSON.stringify(filtered));
  return true;
};

export const markContactRead = async (id, status = true) => {
  console.log(`👀 [Supabase] Marking contact ${id} as read: ${status}`);
  const contacts = await fetchContacts();
  const updated = contacts.map(c => 
    c.id === id ? { ...c, read: status } : c
  );
  localStorage.setItem('rinova_contacts', JSON.stringify(updated));
  return true;
};

// --- Auth Operations ---

export const authenticateAdmin = async (email, password) => {
  console.log('🔐 [Auth] Attempting login for:', email);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('⛔ [Auth] Supabase login error:', error.message);
      throw error;
    }

    if (!data.session) {
      console.error('⛔ [Auth] Login succeeded but no session returned.');
      throw new Error("No session returned from provider");
    }

    console.log('✅ [Auth] Login successful. User ID:', data.user.id);
    return data.session;
  } catch (error) {
    console.error('❌ [Auth] Exception in authenticateAdmin:', error);
    throw error;
  }
};

export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ [Auth] Error getting session:', error);
      return null;
    }
    return data.session;
  } catch (err) {
    console.error('❌ [Auth] Unexpected error getting session:', err);
    return null;
  }
};

export const signOut = async () => {
  console.log('👋 [Auth] Signing out');
  await supabase.auth.signOut();
};
