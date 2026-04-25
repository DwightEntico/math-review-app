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

const data = {
  user: {
    name: "Teacher Name", // Map this to your Supabase Auth user later
    email: "teacher@school.com",
    avatar: "/avatars/teacher.jpg",
  },
  teams: [
    { name: "School Academy", logo: GalleryVerticalEnd, plan: "Pro" },
  ],
  navMain: [
    {
      title: "Classroom",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "My Classes", url: "/teacher/classes" },
        { title: "Assignments", url: "/teacher/assignments" },
      ],
    },
    {
      title: "Resources",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Lesson Plans", url: "/teacher/lessons" },
        { title: "Library", url: "/teacher/library" },
      ],
    },
  ],
  projects: [
    { name: "Math Dept", url: "#", icon: Frame },
    { name: "Science Fair", url: "#", icon: PieChart },
  ],
}

export function TeacherSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavProjects projects={data.projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}