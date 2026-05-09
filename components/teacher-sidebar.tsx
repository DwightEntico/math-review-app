"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useUser } from "@/hooks/use-user" // Import your new hook
const data = {
  user: {
    name: "Teacher Name",
    email: "teacher@school.com",
    avatar: "/avatars/teacher.jpg",
  },
  teams: [
    { name: "IGCSE MATH", logo: GalleryVerticalEnd, plan: "Teacher" },
  ],
  navMain: [
    {
      title: "Classroom",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "My Classes", url: "/teacher/classes" },
        { title: "Student Progress", url: "/teacher/analytics" },
      ],
    },
    {
      title: "Test Bank", // NEW: Aligned with your database tables
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Create New Test", url: "/teacher/tests/new" },
        { title: "View Test Banks", url: "/teacher/tests/view" },
        { title: "Browse Questions", url: "/teacher/bank" },

        { title: "Create Question", url: "/teacher/bank/new" }, // Logic for the Schema we built
        { title: "Manage Tests", url: "/teacher/tests" },
      ],
    },
    {
      title: "Syllabus Mapping", // For the topic mapping UI we did earlier
      url: "#",
      icon: Map,
      items: [
        { title: "Paper Config", url: "/teacher/config" },
        { title: "Topic Hierarchy", url: "/teacher/topics" },
      ],
    },
  ],
  // projects: [
  //   { name: "Department Shared", url: "#", icon: Frame },
  //   { name: "Past Paper Archive", url: "#", icon: PieChart },
  // ],
}

export function TeacherSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useUser()
  // Format the display data
  const userData = {
    name: loading ? "Loading..." : `${user?.first_name || "Student"} ${user?.last_name || ""}`,
    email: user?.email || "",
    avatar: user?.avatar_url || "/logo.png"
    // avatar: user?.avatar_url || "/avatars/default.jpg",
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        {/* CLEANER APPROACH: 
          Let NavMain handle the Collapsible logic for its own sub-items.
          Don't wrap NavMain in another Collapsible unless you want to hide the whole menu.
        */}
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}