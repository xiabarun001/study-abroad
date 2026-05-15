import { supabase } from '../shared/db/supabase';

export const authService = {
  async signUp(email, password) {
    return supabase.auth.signUp({ email, password });
  },
  async signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  },
  async signOut() {
    return supabase.auth.signOut();
  },
  async getSession() {
    return supabase.auth.getSession();
  },
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
