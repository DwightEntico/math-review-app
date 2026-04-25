import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar" // Create this component
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast, Toaster } from "sonner"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  console.log(user)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  console.log(profile)

  // if (profile?.role !== 'admin') {
  //   redirect('/auth/login') // Bounce unauthorized users
  // }
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1">
          <header className="flex h-16 items-center border-b px-4 gap-4 bg-slate-900 text-white">
            <SidebarTrigger className="text-white hover:bg-slate-800" />
            <h1 className="font-bold">Admin Control Center</h1>
          </header>
          <div className="p-6">
            {children}
            <Toaster />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}