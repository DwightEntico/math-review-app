"use client"

import * as React from "react"
import {
  AudioWaveform,
  BarChart3,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboardIcon,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useUser } from "@/hooks/use-user" // Import your new hook
// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "ELMS",
      logo: GalleryVerticalEnd,
      plan: "v1.0.0",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboardIcon,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
        },
        // {
        //   title: "Starred",
        //   url: "#",
        // },
        // {
        //   title: "Settings",
        //   url: "#",
        // },
      ],
    },
    {
      title: "Curriculum Editor",
      url: "/admin/curriculum",
      icon: BookOpen,
      items: [
        { title: "Topics & Sub-topics", url: "/admin/curriculum/topics" },
        { title: "Paper Mapping", url: "/admin/curriculum/papers" },
        { title: "AI Prompt Settings", url: "/admin/curriculum/ai-config" },
      ],
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: Users,
      items: [        
        { title: "Teachers", url: "/admin/users/teachers" },
        { title: "Students", url: "/admin/users/students" },
        { title: "Verification Queue", url: "/admin/users/verify" },
      ],
    },
    {
      title: "Reports & Logs",
      url: "/admin/reports",
      icon: BarChart3,
      items: [
        {
          title: "Reports",
          url: "#",
        },
        {
          title: "Logs",
          url: "#",
        },
      ]
    },
    {
      title: "Learning Materials",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Video Tutorials",
          url: "#",
        },
        {
          title: "E-books",
          url: "#",
        },
        // {
        //   title: "Introduction",
        //   url: "#",
        // },
        // {
        //   title: "Get Started",
        //   url: "#",
        // },
        // {
        //   title: "Tutorials",
        //   url: "#",
        // },
        // {
        //   title: "Changelog",
        //   url: "#",
        // },
      ],
    },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "User Accounts",
    //       url: "/admin/settings/user-accounts",
    //     },
    //     // {
    //     //   title: "Team",
    //     //   url: "#",
    //     // },
    //     // {
    //     //   title: "Billing",
    //     //   url: "#",
    //     // },
    //     // {
    //     //   title: "Limits",
    //     //   url: "#",
    //     // },
    //   ],
    // },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useUser()
  // Format the display data
  const userData = {
    name: loading ? "Loading..." : `${user?.first_name || "Student"} ${user?.last_name || ""}`,
    email: user?.email || "",
    avatar: user?.avatar_url || "/avatars/default.jpg",
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
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
