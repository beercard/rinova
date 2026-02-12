import { supabase } from '@/lib/customSupabaseClient';

const BUCKET = 'property-images';

const createObjectId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getFileExt = (file) => {
  const name = file?.name || '';
  const idx = name.lastIndexOf('.');
  if (idx > -1 && idx < name.length - 1) return name.slice(idx).toLowerCase();
  if (file?.type === 'image/jpeg') return '.jpg';
  if (file?.type === 'image/png') return '.png';
  if (file?.type === 'image/webp') return '.webp';
  return '';
};

export const uploadPropertyImage = async (file, { prefix = 'properties' } = {}) => {
  const id = createObjectId();
  const ext = getFileExt(file);
  const objectPath = `${prefix}/${id}${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, file, {
      contentType: file.type || undefined,
      cacheControl: '31536000',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) {
    throw new Error('No public URL returned for uploaded image');
  }

  return { publicUrl, objectPath };
};

export const uploadPropertyImages = async (files, opts) => {
  const list = Array.isArray(files) ? files : [];
  const uploads = await Promise.all(list.map((f) => uploadPropertyImage(f, opts)));
  return uploads.map((u) => u.publicUrl);
};
