"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { BookOpen, Settings2, Plus, Loader2, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/client" // Ensure this path is correct

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TopicAssignmentModal } from "./topic-assignment-modal"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet"
import { PaperForm } from "./paper-form"

// --- Types ---
interface TopicConfig {
  topic_id: string
  math_topics: {
    id: string
    name: string
  }
}

interface Paper {
  id: string
  name: string
  description: string
  paper_topic_config: TopicConfig[]
}

interface Level {
  id: string
  name: string
  slug: string
  math_papers: Paper[]
}

export default function PaperMappingPage() {
  const supabase = createClient()
  const [curriculum, setCurriculum] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [activePaper, setActivePaper] = useState<{ id: string; name: string; topics: string[] } | null>(null)
  const [paperSheetOpen, setPaperSheetOpen] = useState(false)
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null)
  // 🔄 Replace the old handleAddNewPaper with this:
  const handleOpenPaperSheet = (levelId: string) => {
    setSelectedLevelId(levelId)
    setPaperSheetOpen(true)
  }
  const handlePaperSuccess = () => {
    setPaperSheetOpen(false)
    fetchMapping()
  }
  // 1. Fetch Data
  const fetchMapping = useCallback(async () => {
    try {
      const res = await fetch('/api/curriculum/mapping/view')
      if (!res.ok) throw new Error("Failed to load mapping data")
      const data = await res.json()
      setCurriculum(data)
    } catch (error: any) {
      toast.error(error.message || "Failed to load mapping")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMapping()
  }, [fetchMapping])

  // 2. Handlers
  const handleOpenModal = (paper: Paper) => {
    setActivePaper({
      id: paper.id,
      name: paper.name,
      topics: paper.paper_topic_config?.map((t) => t.topic_id) || []
    })
    setModalOpen(true)
  }

  const handleSuccess = () => {
    setModalOpen(false)
    fetchMapping()
  }

  const handleAddNewPaper = async (levelId: string) => {
    const name = window.prompt("Enter Paper Name (e.g., Paper 1)");
    if (!name) return;

    const description = window.prompt("Enter Description (e.g., Without Calculator)");

    try {
      const { error } = await supabase
        .from('math_papers')
        .insert([{
          level_id: levelId,
          name,
          description: description || "",
          has_calculator: description?.toLowerCase().includes('with calculator') || false
        }]);

      if (error) throw error
      toast.success("Paper created successfully!")
      fetchMapping()
    } catch (error: any) {
      toast.error("Error creating paper: " + error.message)
    }
  };

  // --- Render States ---
  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing curriculum structure...</p>
      </div>
    )
  }

  if (curriculum.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-6 text-center border-2 border-dashed rounded-xl m-6">
        <div className="p-4 bg-muted rounded-full mb-4"><Info className="h-8 w-8 text-muted-foreground" /></div>
        <h2 className="text-xl font-semibold">No levels found</h2>
        <p className="text-muted-foreground max-w-xs">Check your database for math_levels records to get started.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Paper Mapping</h1>
        <p className="text-muted-foreground">
          Bridge the Global Topic Bank to specific IGCSE Exam Papers.
        </p>
      </div>

      <Tabs defaultValue={curriculum[0]?.slug} className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full max-w-md mb-4">
          {curriculum.map((level) => (
            <TabsTrigger
              key={level.id}
              value={level.slug}
              className="px-8 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              {level.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {curriculum.map((level) => (
          <TabsContent key={level.id} value={level.slug} className="mt-0 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-lg font-semibold">{level.name} Structure</h3>
              <Button size="sm" onClick={() => handleOpenPaperSheet(level.id)}>
                <Plus className="mr-2 h-4 w-4" /> Add Paper
              </Button>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3">
              {level.math_papers && level.math_papers.length > 0 ? (
                level.math_papers.map((paper) => (
                  <AccordionItem
                    key={paper.id}
                    value={paper.id}
                    className="border rounded-xl px-5 bg-card hover:border-primary/20 transition-colors shadow-sm overflow-hidden"
                  >
                    <AccordionTrigger className="py-5 hover:no-underline">
                      <div className="flex items-center gap-5 text-left">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold leading-none">{paper.name}</p>
                          <p className="text-sm text-muted-foreground">{paper.description}</p>
                        </div>
                        <Badge variant="outline" className="ml-2 bg-muted/50 font-mono text-[10px]">
                          {paper.paper_topic_config?.length || 0} TOPICS
                        </Badge>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-6">
                      <div className="rounded-lg bg-muted/30 p-4 border border-muted/50">
                        <div className="flex items-center justify-between border-b border-muted pb-3 mb-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Assigned Syllabus Topics</h4>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenModal(paper)}
                            className="h-8 gap-1 shadow-sm"
                          >
                            <Plus className="h-3.5 w-3.5" /> Manage Topics
                          </Button>
                        </div>

                        {paper.paper_topic_config?.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {paper.paper_topic_config.map((config) => (
                              <div
                                key={config.topic_id}
                                className="group flex items-center justify-between p-3 rounded-lg border bg-background hover:shadow-md hover:border-primary/30 transition-all"
                              >
                                <span className="text-sm font-semibold truncate">{config.math_topics.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                                >
                                  <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 border-2 border-dotted rounded-lg bg-background/50">
                            <p className="text-sm text-muted-foreground italic mb-3">No topics mapped to this paper yet.</p>
                            <Button
                              variant="link"
                              className="text-primary h-auto p-0 text-xs font-bold"
                              onClick={() => handleOpenModal(paper)}
                            >
                              Assign Topics Now
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
                  <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground font-medium">No papers defined for {level.name} yet.</p>
                  <Button
                    variant="link"
                    onClick={() => handleAddNewPaper(level.id)}
                    className="text-primary font-bold"
                  >
                    Create the first paper
                  </Button>
                </div>
              )}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>

      {/* 🆕 ADD THIS SHEET COMPONENT AT THE BOTTOM */}
      <Sheet open={paperSheetOpen} onOpenChange={setPaperSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Exam Paper</SheetTitle>
            <SheetDescription>
              Create a new exam paper for this curriculum level.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            {selectedLevelId && (
              <PaperForm
                levelId={selectedLevelId}
                onSuccess={handlePaperSuccess}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <TopicAssignmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        paperId={activePaper?.id || null}
        paperName={activePaper?.name || ""}
        currentlyAssignedIds={activePaper?.topics || []}
        onSuccess={handleSuccess}
      />
    </div>
  )
}