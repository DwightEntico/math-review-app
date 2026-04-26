import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log("🌐 GET /api/curriculum/mapping: Fetching structure")
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  try {
    // 1. Fetch Levels with their Papers and assigned Topics
    // We use a nested select here (Supabase's superpower)
    const { data, error } = await supabase
      .from('math_levels')
      .select(`
        id,
        name,
        slug,
        math_papers (
          id,
          name,
          description,
          paper_topic_config (
            topic_id,
            math_topics (
              id,
              name
            )
          )
        )
      `)

    if (error) throw error

    console.log("✅ Mapping data retrieved successfully")
    console.log(`📊 Levels fetched: ${data?.length || 0}`
      + ` | Sample Level: ${data?.[0]?.name || 'N/A'}`
      + ` | Sample Paper Count: ${data?.[0]?.math_papers?.length || 0}`
      + ` | Sample Topic Count (first paper): ${data?.[0]?.math_papers?.[0]?.paper_topic_config?.length || 0}`  
    )
    return NextResponse.json(data)
  } catch (err: any) {
    console.error("🚨 Mapping API Error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}