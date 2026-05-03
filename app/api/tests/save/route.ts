import { NextResponse } from 'next/server';
// ❌ REMOVE THIS: import { createClient } from '@/lib/supabase/client'
// ✅ ADD THIS:
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        // This helper (server-side) knows how to read cookies!
        const supabase = await createClient();

        // Now this will actually find the user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json();

        // ... rest of your insert logic ...
        const { data, error } = await supabase
            .from('tests')
            .upsert({
                ...(body.id ? { id: body.id } : {}), // ✅ Only include ID if it exists
                title: body.title,
                description: body.description,
                level: body.level,
                time_limit: body.timeLimit,
                sample_size: body.sampleSize,
                sections: body.sections,
                author_id: user.id,
                status: body.status,
                updated_at: new Date().toISOString(), // Good practice for updates
            }, {
                onConflict: 'id' // ✅ Tells Supabase to update if ID matches
            })
            // .insert([
            //     {
            //         title: body.title,
            //         description: body.description,
            //         level: body.level,
            //         time_limit: body.timeLimit,
            //         sample_size: body.sampleSize,
            //         sections: body.sections, 
            //         author_id: user.id,
            //         status: body.status || 'draft',
            //     },
            // ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, testId: data.id });
    } catch (error: any) {
        // ... error handling
    }
}