const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { draft_data, analysis, assumptions, steps } = req.body || {};
  if (!draft_data || !analysis) {
    return res.status(400).json({ error: 'draft_data and analysis are required' });
  }

  const { data, error } = await supabase
    .from('evaluations')
    .insert({
      idea_title:  draft_data.ideaTitle || 'Untitled idea',
      draft_data,
      analysis,
      assumptions: assumptions || [],
      steps:       steps       || [],
    })
    .select('id')
    .single();

  if (error) {
    console.error('Supabase save error:', error.message);
    return res.status(500).json({ error: 'Save failed. Try again.' });
  }

  return res.status(200).json({ id: data.id });
};
