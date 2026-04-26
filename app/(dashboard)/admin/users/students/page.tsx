"use client"

import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import ProfileForm from "@/components/profile-form"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { timeAgo } from "@/lib/utils/date-formatter"

// Define the shape of your data
type User = {
  id: string
  first_name: string
  last_name: string
  suffix?: string
  sex: string
  middle_name?: string
  contact_details: string
  email?: string
  role?: string

}

export default function StudentsPage() {
  const supabase = createClient()
  const [students, setStudents] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // 1. Fetching Logic via API
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/students/view')

      if (!response.ok) throw new Error('Failed to fetch students')

      const data = await response.json()
      setStudents(data)
    } catch (error) {
      toast.error("Could not load students list")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleEdit = (student: User) => {
    setSelectedStudent(student)
    setIsSheetOpen(true)
  }

  // 1. Define Columns
  const columns: ColumnDef<User>[] = [
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEdit(row.original)}
                className="h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Edit Student Details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: "first_name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    { accessorKey: "middle_name", header: "Middle Name" },
    { accessorKey: "last_name", header: "Last Name" },
    { accessorKey: "suffix", header: "Suffix" },
    {
      accessorKey: "sex",
      header: "Sex",
      cell: ({ row }) => (
        <span className="capitalize">
          {row.getValue("sex")?.toString().replace(/_/g, ' ')}
        </span>
      ),
    },
    
    {
      accessorKey: "birthdate",
      header: "Birth Date",
      cell: ({ row }) => {
        const dateStr = row.getValue("birthdate") as string;

        if (!dateStr) return <span className="text-muted-foreground italic">N/A</span>;

        // We use 'UTC' to prevent the common "off-by-one-day" timezone bug
        const date = new Date(dateStr);

        return new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "2-digit",
          year: "numeric",
        }).format(date);
      },
    },
    { accessorKey: "contact_details", header: "Contact Details" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "created_at",
      header: "Date Registered",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));

        // Format for the Tooltip: "Sunday, April 26, 2026"
        const fullDate = new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          month: "long",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true, // Uses AM/PM format
        }).format(date);

        return (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <span className="cursor-help border-b border-dotted border-muted-foreground/50 pb-0.5 text-sm">
                  {timeAgo(date)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{fullDate}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },


  ]

  // 2. Sample Data (In real app, fetch from Supabase here)
  // const data: User[] = [
  //   { id: "1", first_name: "John", last_name: "Doe", role: "Student", contact_details: "123-456-7890" },
  //   { id: "2", first_name: "Jane", last_name: "Smith", role: "Student", contact_details: "098-765-4321" },
  //   // ... more records
  // ]

  return (
    <div className="container py-10 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <p className="text-muted-foreground">Detailed list of all registered students.</p>
      </div>

      <DataTable
        columns={columns}
        data={students}
        searchKey="name"
        title="Students"
        onRefresh={fetchStudents}
      />
      {/* The Responsive Edit Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Student Profile</SheetTitle>
            <SheetDescription>
              Modify the student&apos;s identity details. Click save when you&apos;re done.
            </SheetDescription>
          </SheetHeader>

          {selectedStudent && (
            <ProfileForm
              initialData={selectedStudent}
              onSuccess={() => {
                setIsSheetOpen(false)
                fetchStudents() // Refresh table after update
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

