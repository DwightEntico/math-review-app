import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const mathLevelId = searchParams.get('mathLevelId')

    if (!mathLevelId) {
        return NextResponse.json({ error: 'mathLevelId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch papers linked to this specific math level
    const { data, error } = await supabase
        .from('math_papers')
        .select('id, name, has_calculator, level_id')
        .eq('level_id', mathLevelId) // Filter by the ID
        .order('name', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}