import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpbtgkunrdzcoyfdhskh.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwYnRna3VucmR6Y295ZmRoc2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MjAzNzUsImV4cCI6MjA3ODQ5NjM3NX0.ZAtjUoDnIWUOs6Os1NUGKIRUQVOuXDlaCJ4HwQqZu50';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type API = {
  id: string;
  name: string;
  description: string;
  url: string;
  auth: string;
  https: boolean;
  cors: string;
  category: string;
  category_id: string;
  featured?: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  api_count: number;
  icon?: string;
};

export type Collection = {
  id: string;
  share_id: string;
  name: string;
  description?: string;
  api_ids: string[];
  view_count: number;
  created_at: string;
};
