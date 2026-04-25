// app/api/students/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies() // Get the cookies from the request

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
            // The setAll method might fail if called from a Server Component
          }
        },
      },
    }
  )

  // 1. Verify Session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Fetch Data
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, suffix, sex, middle_name, contact_details, birthdate')
    .eq('role', 'student')
    .eq('is_deleted', false) // Exclude soft-deleted records
    .neq('last_name', null) // Only include incomplete profiles
    .order('created_at', { ascending: false }) // Optional: order by creation date

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}