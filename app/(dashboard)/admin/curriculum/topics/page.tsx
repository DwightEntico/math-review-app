"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/data-table"
import { columns, Topic } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet"
import { TopicForm } from "./topic-form"

export default function AdminCurriculumTopicsPage() {
    const [data, setData] = useState<Topic[]>([])
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

    const supabase = createClient()

    const fetchTopics = useCallback(async () => {
        try {
            const response = await fetch('/api/curriculum/topics/view')

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to fetch topics")
            }

            const topics = await response.json()
            console.log("Fetched topics:", topics)
            setData(topics)
        } catch (error: any) {
            console.error("API Error:", error.message)
            toast.error(error.message)
        }
    }, [])

    useEffect(() => {
        fetchTopics()
    }, [fetchTopics])

    const handleEdit = (topic: Topic) => {
        setSelectedTopic(topic)
        setIsSheetOpen(true)
    }

    const handleAdd = () => {
        setSelectedTopic(null)
        setIsSheetOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will remove this topic from all paper mappings.")) return

        const { error } = await supabase.from("math_topics").delete().eq("id", id)
        if (error) toast.error(error.message)
        else {
            toast.success("Topic deleted")
            fetchTopics()
        }
    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Topic Bank</h1>
                    <p className="text-muted-foreground">Master categories for IGCSE problem generation.</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" /> New Topic
                </Button>
            </div>

            <DataTable
                title="Topics"
                columns={columns(handleEdit, handleDelete)}
                data={data}
                searchKey="name"
                onRefresh={fetchTopics} // Your custom refresh logic
            />

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-[400px]">
                    <SheetHeader>
                        <SheetTitle>{selectedTopic ? "Edit Topic" : "Add New Topic"}</SheetTitle>
                        <SheetDescription>
                            Define the topic name and the AI model used to generate its problems.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-6">
                        <TopicForm
                            initialData={selectedTopic}
                            onSuccess={() => {
                                setIsSheetOpen(false)
                                fetchTopics()
                            }}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}