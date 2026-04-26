import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // Use PUBLISHABLE KEY for standard session checks
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Safe to ignore in GET routes
          }
        },
      },
    }
  )

  // 1. Verify Session & Role (Security first)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Optional: Check if the requester is actually an Admin
  // (Prevents students from hitting this API to see other students' emails)
  const { data: adminCheck } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (adminCheck?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 2. Fetch from the View
  // Using the View allows us to get 'email' as if it were a regular column
  const { data, error } = await supabase
    .from('user_master_list')
    .select('*') // Includes email, first_name, last_name, etc. from the join
    .eq('role', 'student')
    .order('last_name', { ascending: true })

  if (error) {
    console.error('API Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}