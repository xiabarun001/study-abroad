// Minimal implementation for Supabase Client
const supabase = {
  from: (table) => ({
    select: () => Promise.resolve({ data: [], error: null })
  })
};

module.exports = { supabase };
