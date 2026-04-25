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
    { accessorKey: "sex", header: "Sex" },
    { accessorKey: "contact_details", header: "Contact Details" },
    { accessorKey: "birthdate", header: "Birth Date" },

    // { accessorKey: "email", header: "Email" },
    // { accessorKey: "role", header: "Role" },


    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
      ),
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
          <SheetHeader className="mb-6">
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

