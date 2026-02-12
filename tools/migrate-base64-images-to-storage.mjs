import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'property-images';
const PREFIX = process.env.SUPABASE_STORAGE_PREFIX || 'properties';
const DRY_RUN = (process.env.DRY_RUN || '').toLowerCase() === 'true';
const LIMIT = Number(process.env.LIMIT || 500);

if (!SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL (or VITE_SUPABASE_URL)');
}
if (!SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (service role key)');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const isDataImage = (value) => typeof value === 'string' && value.startsWith('data:image/');

const parseDataUrl = (dataUrl) => {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/.exec(dataUrl);
  if (!m) throw new Error('Invalid data URL');
  const mime = m[1];
  const base64 = m[2];
  const buffer = Buffer.from(base64, 'base64');
  return { mime, buffer };
};

const extFromMime = (mime) => {
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/gif') return '.gif';
  if (mime === 'image/svg+xml') return '.svg';
  return '';
};

const toObjectPath = ({ propertyId, index, mime }) => {
  const ext = extFromMime(mime);
  const id = crypto.randomUUID();
  return `${PREFIX}/${propertyId}/${String(index).padStart(2, '0')}-${id}${ext}`;
};

const uploadBuffer = async ({ objectPath, buffer, mime }) => {
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: mime,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) throw new Error('No public URL returned');
  return publicUrl;
};

const migratePropertyImages = async (row) => {
  const images = Array.isArray(row.images) ? row.images : [];
  const base64Indexes = images
    .map((img, idx) => (isDataImage(img) ? idx : null))
    .filter((v) => v !== null);

  if (base64Indexes.length === 0) return { changed: false };

  const newImages = [...images];
  let uploaded = 0;

  for (const idx of base64Indexes) {
    const img = images[idx];
    const { mime, buffer } = parseDataUrl(img);
    const objectPath = toObjectPath({ propertyId: row.id, index: idx, mime });
    const publicUrl = DRY_RUN ? `dry-run://${BUCKET}/${objectPath}` : await uploadBuffer({ objectPath, buffer, mime });
    newImages[idx] = publicUrl;
    uploaded += 1;
  }

  if (DRY_RUN) return { changed: true, uploaded };

  const { error } = await supabase.from('properties').update({ images: newImages }).eq('id', row.id);
  if (error) throw new Error(error.message);

  return { changed: true, uploaded };
};

const main = async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('id, title, images, created_at')
    .order('created_at', { ascending: false })
    .limit(LIMIT);

  if (error) throw new Error(error.message);

  const rows = Array.isArray(data) ? data : [];
  let scanned = 0;
  let migrated = 0;
  let uploadedTotal = 0;

  for (const row of rows) {
    scanned += 1;
    try {
      const result = await migratePropertyImages(row);
      if (result.changed) {
        migrated += 1;
        uploadedTotal += result.uploaded || 0;
        console.log(`[ok] ${row.id} "${row.title}" uploaded=${result.uploaded}${DRY_RUN ? ' (dry-run)' : ''}`);
      }
    } catch (e) {
      console.error(`[error] ${row.id} "${row.title}": ${e?.message || e}`);
    }
  }

  console.log(`done scanned=${scanned} migrated=${migrated} uploaded=${uploadedTotal}${DRY_RUN ? ' (dry-run)' : ''}`);
};

await main();
