"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Note: Using a standard select if shadcn/ui select is also failing to install
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
  contact_details: z.string().email("Please enter a valid email"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      sex: "male",
    },
  })

  const onSubmit = (data: ProfileFormValues) => {
    console.log("Form Data:", data)
  }

  return (
    <div className="flex flex-col gap-8 mx-auto p-4 md:p-8">
      {/* Header Section */}
      <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-lg bg-slate-900">
        <div className="absolute inset-0 opacity-40 bg-[url('/profile-bg.jpg')] bg-cover bg-center grayscale" />
        <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-black/60 to-transparent">
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Student Identity</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* Field Group: Full Name */}
            <fieldset className="border p-4 rounded-lg space-y-4">
              <legend className="text-sm font-medium px-2 text-muted-foreground">Legal Name</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              </div>
            </fieldset>

            {/* Field Group: Information & Contact */}
            <fieldset className="border p-4 rounded-lg">
              <legend className="text-sm font-medium px-2 text-muted-foreground">Contact & Identity</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase">Sex</label>
                  <Select
                    onValueChange={(value) => setValue("sex", value as any)}
                    defaultValue={watch("sex")}
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
                  <label className="text-xs font-semibold uppercase">Email Address</label>
                  <Input {...register("contact_details")} placeholder="email@school.edu" />
                  {errors.contact_details && <p className="text-xs text-red-500">{errors.contact_details.message}</p>}
                </div>
              </div>
            </fieldset>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-40">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}