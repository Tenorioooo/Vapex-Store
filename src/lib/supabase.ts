import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (() => {
      const mockQuery = {
        select: () => mockQuery,
        insert: () => mockQuery,
        update: () => mockQuery,
        delete: () => mockQuery,
        eq: () => mockQuery,
        neq: () => mockQuery,
        gt: () => mockQuery,
        lt: () => mockQuery,
        not: () => mockQuery,
        order: () => mockQuery,
        limit: () => mockQuery,
        single: () => Promise.resolve({ data: null, error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        then: (onfulfilled: any) => Promise.resolve({ data: [], error: null }).then(onfulfilled),
      };

      return {
        from: () => mockQuery,
        auth: {
          getSession: () => Promise.resolve({ data: { session: null } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
          signUp: () => Promise.resolve({ data: {}, error: null }),
          signOut: () => Promise.resolve({ error: null }),
        },
      };
    })();
