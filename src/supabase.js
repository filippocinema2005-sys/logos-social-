// Importiamo la funzione per creare la connessione a Supabase
import { createClient } from '@supabase/supabase-js';

//L'indirizzo del tuo database — lo trovi in Supabase > Impostazioni > API > Project URL
const supabaseUrl = 'https://somlpzqojdvgrhwwmcls.supabase.co';

// La chiave pubblica — la trovi in Supabase > Impostazioni > API > anon public
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbWxwenFvamR2Z3Jod3dtY2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjA4OTQsImV4cCI6MjA5NTI5Njg5NH0.WVwzR1quDh77hju1-ltZ05vQsnHl9tW4gfz-2fCJx_E';

// Creiamo la connessione — questo oggetto lo useremo in tutto il progetto
const supabase = createClient(supabaseUrl, supabaseKey);

// Esportiamo la connessione così gli altri file possono usarla
export default supabase;