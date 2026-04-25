import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/student-sidebar" // This is your actual Sidebar content component

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 1. SidebarProvider must wrap everything that uses sidebar hooks or components
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        
        {/* 2. Your Sidebar component */}
        <AppSidebar />

        <main className="flex-1 flex flex-col">
          {/* 3. The Header area */}
          <header className="flex h-16 items-center border-b px-4 gap-4 bg-white">
            {/* SidebarTrigger is the button that toggles the sidebar */}
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-slate-200" />
            <h1 className="font-semibold text-lg">Student Portal</h1>
          </header>

          {/* 4. The Page Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}