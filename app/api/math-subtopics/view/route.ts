import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    // Extracting params
    const mathLevelId = searchParams.get('mathLevelId')
    const paperId = searchParams.get('mathPaperId')
    const topicId = searchParams.get('mathTopicId')

    // --- DEBUG LOG: Incoming Request ---
    console.log('🔍 [GET /api/math-subtopics] Params received:', {
        mathLevelId,
        paperId,
        topicId
    })

    const supabase = await createClient()

    let query = supabase
        .from('math_subtopics')
        .select(`
            id,
            name,
            topic_id,
            paper_id
            
        `)
        .eq('level_id', mathLevelId)
        .eq('paper_id', paperId)
        .eq('topic_id', topicId)

    // 1. Primary Filter: Specific Topic
    // if (topicId && topicId !== "undefined" && topicId !== "null") {
    //     console.log('📌 Filtering by Topic:', topicId)
    //     query = query.eq('topic_id', topicId)
    // }

    // // 2. Secondary Filter: Specific Paper
    // if (paperId && paperId !== "undefined" && paperId !== "null") {
    //     console.log('📄 Filtering by Paper:', paperId)
    //     query = query.eq('paper_id', paperId)
    // }

    // // 3. Tertiary Filter: Math Level (Tier)
    // if (mathLevelId && mathLevelId !== "undefined" && mathLevelId !== "null") {
    //     console.log('🎓 Filtering by Math Level:', mathLevelId)
    //     query = query.eq('math_topics.math_level_id', mathLevelId)
    // }

    const { data, error } = await query.order('name', { ascending: true })

    // --- DEBUG LOG: Response Status ---
    if (error) {
        console.error('❌ [GET /api/math-subtopics] Database Error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ [GET /api/math-subtopics] Success: Found ${data?.length || 0} subtopics`)

    return NextResponse.json(data)
}