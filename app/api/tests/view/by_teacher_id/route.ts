import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // 1. Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // 2. Return unauthorized if no user is found
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Filter the query by the author_id
    const { data, error } = await supabase
        .from('tests')
        .select(`
            *,
            test_sections (
                test_questions (
                    id
                )
            )
        `)
        .eq('author_id', user.id) // ✅ This ensures users only see their own bank
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Fetch Error:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}