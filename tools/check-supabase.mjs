import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const readEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
};

const projectRoot = path.resolve(process.cwd());
const baseEnv = readEnvFile(path.join(projectRoot, '.env'));
const localEnv = readEnvFile(path.join(projectRoot, '.env.local'));
const env = { ...baseEnv, ...localEnv, ...process.env };

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env/.env.local');
  process.exit(2);
}

let host = '';
try {
  host = new URL(supabaseUrl).host;
} catch {
  host = String(supabaseUrl);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const safePrintError = (label, error) => {
  const payload = {
    label,
    message: error?.message || String(error),
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
  };
  console.error(JSON.stringify(payload, null, 2));
};

try {
  const propertiesRes = await supabase
    .from('properties')
    .select('id', { count: 'exact' })
    .limit(1);

  if (propertiesRes.error) {
    safePrintError('properties_select_failed', propertiesRes.error);
    process.exit(1);
  }

  const roiRes = await supabase
    .from('roi_settings')
    .select('id', { count: 'exact' })
    .limit(1);

  const roiStatus = roiRes.error
    ? { ok: false, code: roiRes.error.code, message: roiRes.error.message }
    : { ok: true, count: roiRes.count ?? null };

  console.log(
    JSON.stringify(
      {
        ok: true,
        supabaseHost: host,
        propertiesCount: propertiesRes.count ?? null,
        roiSettings: roiStatus,
      },
      null,
      2
    )
  );
} catch (error) {
  safePrintError('unexpected_error', error);
  process.exit(1);
}
