"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useState } from "react"
import { Calculator, Loader2 } from "lucide-react"

const paperSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    level_id: z.string().min(1, "Please select a curriculum level"),
    has_calculator: z.boolean().default(false),
})

type PaperFormValues = z.infer<typeof paperSchema>

interface PaperFormProps {
    initialData?: any
    levels: { id: string; name: string }[]
    onSuccess: () => void
}

export default function PaperForm({ initialData, levels, onSuccess }: PaperFormProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<PaperFormValues>({
        resolver: zodResolver(paperSchema as any),
        defaultValues: initialData || {
            name: "",
            description: "",
            level_id: "",
            has_calculator: false,
        },
    })

    const onSubmit = async (values: PaperFormValues) => {
        try {
            setLoading(true)
            const url = initialData ? `/api/math-papers/update` : `/api/math-papers/create`

            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify({ ...values, id: initialData?.id }),
            })

            if (!response.ok) throw new Error("Failed to save paper")

            toast.success(initialData ? "Paper updated" : "Paper created")
            onSuccess()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Paper Name</label>
                <Input {...form.register("name")} placeholder="e.g. May/June 2026 Paper 1" />
                {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Level / Tier</label>
                <select
                    {...form.register("level_id")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="">Select a level...</option>
                    {levels.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                <Textarea {...form.register("description")} placeholder="Optional details..." />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 bg-slate-50">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-purple-700" />
                        <span className="text-sm font-bold">Calculator Allowed</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Is this a calculator-based exam paper?</p>
                </div>
                <Switch
                    checked={form.watch("has_calculator")}
                    onCheckedChange={(val) => form.setValue("has_calculator", val)}
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-purple-700 hover:bg-purple-800">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update Paper" : "Create Paper"}
            </Button>
        </form>
    )
}