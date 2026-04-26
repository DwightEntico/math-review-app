"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Props {
  paperId: string | null
  paperName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  currentlyAssignedIds: string[]
}

export function TopicAssignmentModal({ 
  paperId, 
  paperName, 
  isOpen, 
  onClose, 
  onSuccess, 
  currentlyAssignedIds 
}: Props) {
  const [allTopics, setAllTopics] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchAllTopics()
      setSelectedIds(currentlyAssignedIds)
    }
  }, [isOpen, currentlyAssignedIds])

  const fetchAllTopics = async () => {
    setLoading(true)
    const { data } = await supabase.from("math_topics").select("*").order("name")
    setAllTopics(data || [])
    setLoading(false)
  }

  const toggleTopic = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (!paperId) return
    setSaving(true)

    try {
      // 1. Delete existing mappings for this paper
      await supabase.from("paper_topic_config").delete().eq("paper_id", paperId)

      // 2. Insert new mappings
      if (selectedIds.length > 0) {
        const insertData = selectedIds.map(topicId => ({
          paper_id: paperId,
          topic_id: topicId
        }))
        const { error } = await supabase.from("paper_topic_config").insert(insertData)
        if (error) throw error
      }

      toast.success(`Updated topics for ${paperName}`)
      onSuccess()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredTopics = allTopics.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Manage Topics: {paperName}</DialogTitle>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search topics..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="space-y-3">
              {filteredTopics.map((topic) => (
                <div key={topic.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md transition-colors">
                  <Checkbox 
                    id={topic.id} 
                    checked={selectedIds.includes(topic.id)}
                    onCheckedChange={() => toggleTopic(topic.id)}
                  />
                  <label htmlFor={topic.id} className="text-sm font-medium leading-none cursor-pointer flex-1">
                    {topic.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}