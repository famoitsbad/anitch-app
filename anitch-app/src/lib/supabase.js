import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://cxnttdfwzyxlrdnzbysh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Wkqf6CtYS57DY9lJQEFhvw_pw_ioqYb';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
