import { supabase } from '../shared/db/supabase';
import { handleResponse } from './baseService';

export const applicationService = {
  async getApplications(userId) {
    return handleResponse(
      supabase
        .from('user_applications')
        .select(`
          id,
          status,
          deadline,
          program_id,
          programs (*)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
    );
  },

  async createApplication(userId, programId) {
    return handleResponse(
      supabase
        .from('user_applications')
        .insert([{ 
          user_id: userId, 
          program_id: programId,
          status: 'planning'
        }])
    );
  },

  async updateStatus(id, newStatus) {
    return handleResponse(
      supabase
        .from('user_applications')
        .update({ status: newStatus })
        .eq('id', id)
    );
  },

  async updateDeadline(id, newDeadline) {
    return handleResponse(
      supabase
        .from('user_applications')
        .update({ deadline: newDeadline })
        .eq('id', id)
    );
  },

  async deleteApplication(id) {
    return handleResponse(
      supabase
        .from('user_applications')
        .delete()
        .eq('id', id)
    );
  }
};
