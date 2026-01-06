
import { supabase } from './src/lib/supabase.js';

async function inspectDeckSchema() {
    const { data, error } = await supabase
        .from('decks')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching deck:", error);
    } else if (data && data.length > 0) {
        console.log("Deck Columns:", Object.keys(data[0]));
    } else {
        console.log("No decks found to inspect.");
    }
}

inspectDeckSchema();
