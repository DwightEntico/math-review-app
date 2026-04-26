"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

const topicSchema = z.object({
  name: z.string().min(2, "Name is required"),
  ai_model_type: z.string().min(1, "Please select an AI model"),
})

type TopicFormValues = z.infer<typeof topicSchema>

export function TopicForm({ initialData, onSuccess }: { initialData?: any, onSuccess: () => void }) {
  const supabase = createClient()
  
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: initialData || { name: "", ai_model_type: "General Math AI" },
  })

  const onSubmit = async (values: TopicFormValues) => {
    try {
      const { error } = await supabase
        .from("math_topics")
        .upsert({
          id: initialData?.id, // Supabase handles Insert vs Update based on ID
          ...values,
        })

      if (error) throw error
      toast.success("Topic saved!")
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-5">
      <div className="space-y-2">
        <label className="text-sm font-medium">Topic Name</label>
        <Input {...form.register("name")} placeholder="e.g. Algebra and Graphs" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">AI Logic</label>
        <Select 
          onValueChange={(v) => form.setValue("ai_model_type", v)} 
          defaultValue={form.getValues("ai_model_type")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select AI type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="General Math AI">General Math AI</SelectItem>
            <SelectItem value="Algebra Problems AI">Algebra Problems AI</SelectItem>
            <SelectItem value="Geometry and Measures Problems AI">Geometry & Measures AI</SelectItem>
            <SelectItem value="Functions Problems AI">Functions AI</SelectItem>
            <SelectItem value="Probability and Statistics Problems AI">Stats & Prob AI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving..." : "Save Topic"}
      </Button>
    </form>
  )
}