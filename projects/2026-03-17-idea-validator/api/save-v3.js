import { createClient } from '@supabase/supabase-js';

let _supabase;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }
  return _supabase;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { draft, lens, thoughts, verdict } = req.body || {};
  if (!draft || !draft.ideaTitle || !lens) {
    return res.status(400).json({ error: 'draft (with ideaTitle) and lens are required' });
  }

  const { data, error } = await getSupabase()
    .from('v3_evaluations')
    .insert({
      idea_title: draft.ideaTitle,
      draft,
      lens,
      thoughts: thoughts || [],
      verdict: verdict || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Supabase save error:', error.message);
    return res.status(500).json({ error: 'Save failed. Try again.' });
  }

  return res.status(200).json({ id: data.id });
}
