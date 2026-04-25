import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // 1. We start with a base response
  let response = NextResponse.next({ request })

  // 2. Initialize Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // Use ANON KEY here
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // IMPORTANT: Update the response object itself
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // 3. Get Session and User
  // Use getSession first as it's faster. 
  // We only call getUser if the session exists to avoid unnecessary overhead.
  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  // 4. AUTH GUARD: If not logged in and not on an auth page, go to login
  if (!session) {
    if (!pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return response // Allow access to /auth pages
  }

  // 5. FETCH PROFILE: We have a session, now we need the role and status
  const { data: profile } = await supabase
    .from('profiles')
    .select('last_name, role')
    .eq('id', session.user.id)
    .single()

  const userRole = profile?.role || 'student'
  const isIncomplete = !profile?.last_name
  const isAlreadyOnSetup = pathname === '/setup'

  // 6. ONBOARDING GUARD: Redirect incomplete profiles to /setup
  if (isIncomplete && !isAlreadyOnSetup && !pathname.startsWith('/auth')) {
    // We allow them to be on setup or auth pages, otherwise force setup
    return NextResponse.redirect(new URL('/setup', request.url))
  }

  // 7. SETUP PROTECTION: Completed users shouldn't be on /setup
  if (!isIncomplete && isAlreadyOnSetup) {
    return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
  }

  // 8. ROLE PROTECTION: The "Bouncer" Logic
  const isAccessingStudent = pathname.startsWith('/student')
  const isAccessingTeacher = pathname.startsWith('/teacher')
  const isAccessingAdmin = pathname.startsWith('/admin')

  // Student Protection
  if (userRole === 'student' && (isAccessingTeacher || isAccessingAdmin)) {
    return NextResponse.redirect(new URL('/student/dashboard', request.url))
  }

  // Teacher Protection
  if (userRole === 'teacher' && (isAccessingStudent || isAccessingAdmin)) {
    return NextResponse.redirect(new URL('/teacher/dashboard', request.url))
  }

  // Admin Protection
  if (userRole === 'admin' && (isAccessingStudent || isAccessingTeacher)) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // 9. Root path redirect (e.g., "/")
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}