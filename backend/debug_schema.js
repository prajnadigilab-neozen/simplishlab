const supabase = require('./config/supabase');

async function checkSchema() {
    console.log('--- Checking Assessments Table Schema ---');
    // Using a hacky way to see columns/constraints if possible via RPC or just samples
    const { data: cols } = await supabase.from('assessments').select('*').limit(1);
    console.log('Assessment sample:', JSON.stringify(cols, null, 2));

    const { data: qCols } = await supabase.from('questions').select('*').limit(1);
    console.log('Question sample:', JSON.stringify(qCols, null, 2));

    // Check if we can find unique indexes via information_schema (if permissions allow)
    const { data: schema, error: schemaErr } = await supabase.rpc('get_table_info', { table_name: 'assessments' });
    if (schemaErr) {
        console.warn('RPC get_table_info not available. Trying direct query on info schema...');
        const { data: info, error: infoErr } = await supabase
            .from('information_schema.table_constraints')
            .select('*')
            .eq('table_name', 'assessments');
        // This might fail due to RLS/Permissions
        if (infoErr) console.error('Info Schema Failed:', infoErr.message);
        else console.log('Constraints:', info);
    } else {
        console.log('Schema:', schema);
    }
}

checkSchema();
