import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env manually
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    envVars[key] = val;
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Anon Key exists:', !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('*');
    
    console.log('Posts query result:', { count: posts?.length, error: postsError });
    if (posts && posts.length > 0) {
      console.log('Sample post:', posts[0]);
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role, full_name, email');
    console.log('Profiles query result:', { count: profiles?.length, error: profilesError });
    if (profiles && profiles.length > 0) {
      console.log('Sample profile:', profiles[0]);
    }
  } catch (err) {
    console.error('Error executing query:', err);
  }
}

check();
