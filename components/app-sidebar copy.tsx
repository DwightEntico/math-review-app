"use client"

import * as React from "react"
import {
  BookOpen,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  Library,
  MessageSquare,
  Settings2,
  Star,
  Trophy,
  Video,
} from "lucide-react"

import { NavMain } from "../components/nav-main"
import { NavProjects } from "../components/nav-projects"
import { NavUser } from "../components/nav-user"
import { TeamSwitcher } from "../components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Alex Student",
    email: "alex.smith@university.edu",
    avatar: "/avatars/student.jpg",
  },
  // Replaced Teams with Academic Years/Semesters
  semesters: [
    {
      name: "Fall 2024",
      logo: GraduationCap,
      plan: "Current Semester",
    },
    {
      name: "Spring 2024",
      logo: BookOpen,
      plan: "Completed",
    },
  ],
  navMain: [
    {
      title: "Academic Hub",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "My Schedule",
          url: "/schedule",
        },
        {
          title: "Grades & Progress",
          url: "/grades",
        },
        {
          title: "Announcements",
          url: "/announcements",
        },
      ],
    },
    {
      title: "My Courses",
      url: "/courses",
      icon: BookOpen,
      items: [
        {
          title: "CS50: Computer Science",
          url: "/courses/cs50",
        },
        {
          title: "Advanced Mathematics",
          url: "/courses/math-401",
        },
        {
          title: "Digital Marketing",
          url: "/courses/mkt-202",
        },
      ],
    },
    {
      title: "Campus Life",
      url: "/campus",
      icon: MessageSquare,
      items: [
        {
          title: "Study Groups",
          url: "/campus/groups",
        },
        {
          title: "Event Calendar",
          url: "/campus/events",
        },
        {
          title: "Career Services",
          url: "/campus/career",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "/student/settings/profile",
        },
        {
          title: "Notifications",
          url: "/settings/notifications",
        },
      ],
    },
  ],
  // Quick access to "Starred" or "Important" items
  favorites: [
    {
      name: "Final Project - Thesis",
      url: "/projects/thesis",
      icon: Trophy,
    },
    {
      name: "Library Resources",
      url: "/resources/library",
      icon: Library,
    },
    {
      name: "Office Hours (Zoom)",
      url: "/zoom/office-hours",
      icon: Video,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* We reuse TeamSwitcher to switch between Semesters */}
        <TeamSwitcher teams={data.semesters} />
      </SidebarHeader>
      
      <SidebarContent>
        {/* Core academic navigation */}
        <NavMain items={data.navMain} />
        
        {/* We use NavProjects to display "Quick Links" or "Active Projects" */}
        <NavProjects projects={data.favorites} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}