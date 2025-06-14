import { createClient } from '@supabase/supabase-js';

const supabaseRole = createClient(
    'https://zgrjjnifqoactpuqolao.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmpqbmlmcW9hY3RwdXFvbGFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTI0NzQ1OCwiZXhwIjoyMDU2ODIzNDU4fQ.gvSU1l3pRGkZgNmKYv12OXwa-agUxfLihMoABI3M1g0'
);
export default supabaseRole;