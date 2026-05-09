import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const mathLevelId = searchParams.get('mathLevelId')
    const paperId = searchParams.get('paperId')

    const supabase = await createClient()

    // We use !inner on the relations we want to use for filtering
    let query = supabase
        .from('math_topics')
        .select(`
            id,
            name,
            math_level_id,
            math_paper_id,
            math_levels (
                name
            ),
            math_papers (
                name
                
            )
        `)

    // Priority 1: Filter by specific Paper
    if (paperId && paperId !== "undefined") {
        query = query.eq('math_paper_id', paperId)
    }
    // Priority 2: Filter by Math Level (Tier)
    else if (mathLevelId && mathLevelId !== "undefined") {
        query = query.eq('math_level_id', mathLevelId)
    }

    const { data, error } = await query.order('name', { ascending: true })

    if (error) {
        console.error("Fetch Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}