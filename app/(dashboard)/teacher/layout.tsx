import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TeacherSidebar } from "@/components/teacher-sidebar" // Create this component

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <TeacherSidebar />
        <main className="flex-1">
          <header className="flex h-16 items-center border-b px-4 gap-4 bg-white">
            <SidebarTrigger />
            <h1 className="font-semibold">Instructor Portal</h1>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}