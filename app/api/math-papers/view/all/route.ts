import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    // const mathLevelId = searchParams.get('mathLevelId')

    const supabase = await createClient()

    // 1. Start the query selecting fields from math_papers
    // 2. We join 'math_levels' to get the associated level name
    let query = supabase
        .from('math_papers')
        .select(`
            *,
            math_levels (
                name
            )
        `)

    // 3. Optional Filter: If a mathLevelId is provided in the URL, 
    // we filter the papers (useful for the Test Builder dropdowns)
    // if (mathLevelId && mathLevelId !== "undefined" && mathLevelId !== "null") {
    //     query = query.eq('level_id', mathLevelId)
    // }

    // 4. Execute the query with a clean sort
    const { data, error } = await query.order('name', { ascending: true })

    if (error) {
        console.error("❌ API Error [math-papers]:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    const flattenedData = data.map(paper => ({
        ...paper,
        level_name: paper.math_levels?.name || 'Unassigned'
    }))

    return NextResponse.json(flattenedData)
}