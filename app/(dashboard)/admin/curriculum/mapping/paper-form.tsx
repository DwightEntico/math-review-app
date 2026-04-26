"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const paperSchema = z.object({
  name: z.string().min(1, "Paper name is required"),
  description: z.string().optional(),
  has_calculator: z.boolean().default(false).optional(),
})

type PaperFormValues = z.infer<typeof paperSchema>

interface PaperFormProps {
  levelId: string
  onSuccess: () => void
}

export function PaperForm({ levelId, onSuccess }: PaperFormProps) {
  const supabase = createClient()
  const form = useForm<PaperFormValues>({
    resolver: zodResolver(paperSchema),
    defaultValues: {
      name: "",
      description: "",
      has_calculator: false,
    },
  })

  const onSubmit = async (values: PaperFormValues) => {
    try {
      const { error } = await supabase
        .from('math_papers')
        .insert([{ 
          level_id: levelId, 
          ...values 
        }])

      if (error) throw error
      toast.success("Exam paper created!")
      onSuccess()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-5">
      <div className="space-y-2">
        <Label>Paper Name</Label>
        <Input {...form.register("name")} placeholder="e.g. Paper 2" />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea 
          {...form.register("description")} 
          placeholder="e.g. Short-answer questions (Extended)" 
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
          <Label>Calculator Allowed</Label>
          <p className="text-[0.8rem] text-muted-foreground">
            Is a scientific calculator permitted for this paper?
          </p>
        </div>
        <Switch 
          checked={form.watch("has_calculator")}
          onCheckedChange={(checked) => form.setValue("has_calculator", checked)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating..." : "Create Paper"}
      </Button>
    </form>
  )
}