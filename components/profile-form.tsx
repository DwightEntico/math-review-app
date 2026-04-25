"use client"

import { createClient } from '@/lib/supabase/client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import React, { useEffect } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const profileSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  middle_name: z.string().optional().nullable(),
  suffix: z.string().optional().nullable(),
  sex: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  contact_details: z.string().min(10, "Please enter a valid phone number"),
  birthdate: z.string().min(1, "Birthdate is required"),
  role: z.enum(["student", "teacher", "admin"]).optional() // Optional role field for admin use
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  initialData?: any; // Data passed when editing a record
  onSuccess?: () => void; // Callback to close modals or refresh lists
  isReadOnly?: boolean; // Optional: for a "View Only" mode
}

export default function ProfileForm({ initialData, onSuccess, isReadOnly = false }: ProfileFormProps) {
  const supabase = createClient()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      sex: "male",
      first_name: "",
      last_name: "",
      middle_name: "",
      suffix: "",
      contact_details: "",
      birthdate: "",
      role: "student",
    },
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = form

  // 🔄 Sync initialData into the form (Crucial for Edit Mode)
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        // Ensure nulls from DB become empty strings for HTML inputs
        middle_name: initialData.middle_name || "",
        suffix: initialData.suffix || "",
        role: initialData.role || "student",
      })
    }
  }, [initialData, reset])

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // 1. Determine Target ID 
      // If initialData exists, we use its ID (Admin mode). Otherwise, get current user (Setup mode).
      let targetId = initialData?.id

      if (!targetId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Session expired.")
        targetId = user.id
      }

      // 2. Perform Upsert
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: targetId,
          ...values,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success("Profile saved successfully!")

      // 3. Logic Branching
      if (onSuccess) {
        // If an onSuccess prop exists (Modal/Edit mode), run it
        onSuccess()
      } else if (!initialData) {
        // If it's a fresh setup (no initialData), do the hard redirect
        window.location.href = "/student/dashboard"
      }

    } catch (error: any) {
      toast.error(error.message || "An error occurred.")
    }
  }

  return (
    <div className="flex flex-col gap-6 mx-auto w-full px-3">
      {/* Visual Header - Only show if not in a modal (i.e., no initialData) */}
      {!initialData && (
        <div className="relative h-32 w-full rounded-xl overflow-hidden shadow-lg bg-slate-900">
          <div className="absolute inset-0 opacity-40 bg-[url('/profile-bg.jpg')] bg-cover bg-center grayscale" />
          <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-black/60 to-transparent">
            <h1 className="text-2xl font-bold text-white uppercase">Student Identity</h1>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <fieldset className="border p-4 rounded-lg space-y-4" disabled={isSubmitting || isReadOnly}>
          <legend className="text-sm font-medium px-2 text-muted-foreground">Legal Name</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase">First Name</label>
              <Input {...register("first_name")} placeholder="John" />
              {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase">Middle Name</label>
              <Input {...register("middle_name")} placeholder="Quincy" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase">Last Name</label>
              <Input {...register("last_name")} placeholder="Doe" />
              {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase">Suffix</label>
              <Input {...register("suffix")} placeholder="Jr." />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase">Birthdate</label>
              <Input {...register("birthdate")} type="date" />
              {errors.birthdate && <p className="text-xs text-red-500">{errors.birthdate.message}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset className="border p-4 rounded-lg" disabled={isSubmitting || isReadOnly}>
          <legend className="text-sm font-medium px-2 text-muted-foreground">Contact & Identity</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase">Sex</label>
              <Select
                onValueChange={(value) => setValue("sex", value as any)}
                value={watch("sex")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase">Contact Number</label>
              <Input {...register("contact_details")} placeholder="123-456-7890" />
              {errors.contact_details && <p className="text-xs text-red-500">{errors.contact_details.message}</p>}
            </div>
          </div>
        </fieldset>
        {/* Field Group: Account Settings (ONLY FOR EDITING) */}
        {initialData && (
          <fieldset className="border p-4 rounded-lg bg-slate-50/50" disabled={isSubmitting || isReadOnly}>
            <legend className="text-sm font-medium px-2 text-primary">System Access</legend>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase">User Role</label>
                <Select
                  onValueChange={(value) => setValue("role", value as any)}
                  value={watch("role")}
                >
                  <SelectTrigger className="bg-white w-full">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground italic w-full">
                  Changing this will move the user to a different dashboard section.
                </p>
              </div>
            </div>
          </fieldset>
        )}

        {!isReadOnly && (
          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-40">
              {isSubmitting ? "Saving..." : "Save Identity"}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}