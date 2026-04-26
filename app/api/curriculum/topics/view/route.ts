import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { }
        },
      },
    }
  )
  try {
    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn("🔐 Auth Check: No user found or session expired", authError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log(`👤 Auth Check: User authenticated (ID: ${user.id})`)

    // 2. Role Authorization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      console.warn(`🚫 Permission Denied: User ${user.id} has role '${profile?.role}' (Admin required)`)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.log("✅ Permission Granted: User is Admin")

    // 3. Fetch Topics
    console.log("📊 Database: Fetching math_topics...")
    const { data, error: fetchError } = await supabase
      .from("math_topics")
      .select("*")
      .order("name", { ascending: true })

    if (fetchError) {
      console.error("❌ Database Error fetching math_topics:", fetchError.message)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    console.log(`📦 Success: Retrieved ${data?.length || 0} topics`)
    return NextResponse.json(data)

  } catch (err: any) {
    console.error("🚨 Unexpected API Route Crash:", err.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
  // return NextResponse.json(data)
}