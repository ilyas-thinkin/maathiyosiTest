import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase URL and public anon key
const supabaseUrl = 'https://kcvghsnlzythcublawvf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjdmdoc25senl0aGN1Ymxhd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDUxODAsImV4cCI6MjA2ODkyMTE4MH0.5A1TkCQvyGxaxodmWP_xllQ1Orz_p60Cz8Hvt406sJQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
