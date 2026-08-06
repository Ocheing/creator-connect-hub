import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hoyfmceculhkyuxtlane.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveWZtY2VjdWxoa3l1eHRsYW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzIzMDgsImV4cCI6MjA4NjU0ODMwOH0.S3S-4zfSCB8Sq9lW_mL-vLruMLinhEwzIU-uDQ4aqVM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, title, status, brand_id')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('Recent campaigns:', data, error);
}
check();
