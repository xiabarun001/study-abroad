const { supabase } = require('../../src/shared/db/supabase');
describe('Supabase Client', () => {
  it('should initialize supabase client', () => {
    expect(supabase).toBeDefined();
  });
});
