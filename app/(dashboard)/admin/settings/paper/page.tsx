"use client"

import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit, Calculator, Plus, Trash2, RotateCcw, Archive, Loader2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { timeAgo } from "@/lib/utils/date-formatter"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import PaperForm from "@/components/form/paper-form"

// Shape of Math Paper data based on your DB schema
type MathPaper = {
    id: string
    name: string
    description?: string
    has_calculator: boolean
    level_id: string
    created_at: string
    status: 'active' | 'archived' | 'draft'
    // Joined field from math_levels table
    math_levels?: {
        name: string
    }
}

export default function MathPapersPage() {
    const router = useRouter()
    const [papers, setPapers] = useState<MathPaper[]>([])
    const [loading, setLoading] = useState(false)
    const [levels, setLevels] = useState<{ id: string, name: string }[]>([])
    const [selectedPaper, setSelectedPaper] = useState<MathPaper | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const fetchPapers = async () => {
        try {
            setLoading(true)
            // Note: This endpoint should join math_levels to get the level name
            const response = await fetch('/api/math-papers/view/all')
            if (!response.ok) throw new Error('Failed to fetch math papers')
            const data = await response.json()
            setPapers(data)
        } catch (error) {
            toast.error("Could not load math papers list")
            console.error(error)
        } finally {
            setLoading(false)
           
        }
    }

    useEffect(() => {
        fetchPapers()
    }, [])

    useEffect(() => {
        const fetchLevels = async () => {
            const res = await fetch('/api/math-levels/view')
            const data = await res.json()
            setLevels(data)
        }
        fetchLevels()
    }, [])
    const columns = React.useMemo<ColumnDef<MathPaper>[]>(() => [
        // Inside columns definition
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const paper = row.original;
                const isArchived = paper.status === "archived";
                // const isArchived = row.original.status === "archived" ? true : false

                return (
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleEdit(paper)}
                                        className="h-8 w-8 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Edit Paper Details
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Dynamic Archive/Restore Button */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleStatusToggle(paper.id, paper.status)}
                                        className={cn(
                                            "h-8 w-8 transition-all",
                                            isArchived
                                                ? "text-emerald-600 hover:bg-emerald-50 border-emerald-100 shadow-sm"
                                                : "text-amber-600 hover:bg-amber-50 border-amber-100"
                                        )}
                                    >
                                        {isArchived ? (
                                            <RotateCcw className="h-4 w-4" />
                                        ) : (
                                            <Archive className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    {isArchived ? "Restore Paper" : "Archive Paper"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;

                return (
                    <Badge
                        variant="outline"
                        className={cn(
                            "capitalize font-bold text-[10px] px-2 py-0",
                            status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                status === "archived" ? "bg-slate-100 text-slate-500 border-slate-200" :
                                    "bg-amber-50 text-amber-700 border-amber-100"
                        )}
                    >
                        {status}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Paper Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{row.getValue("name")}</span>
                    {row.original.description && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[250px]">
                            {row.original.description}
                        </span>
                    )}
                </div>
            )
        },
        {
            id: "level",
            header: "Level",
            // Accessor for the joined math_levels name
            accessorFn: (row) => row.math_levels?.name,
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                    {row.original.math_levels?.name || "Unassigned"}
                </Badge>
            )
        },
        {
            accessorKey: "has_calculator",
            header: "Calculator",
            cell: ({ row }) => {
                const hasCalc = row.getValue("has_calculator") as boolean
                return (
                    <div className={cn(
                        "flex items-center gap-2 px-2 py-1 rounded-md w-fit border",
                        hasCalc
                            ? "bg-purple-50 border-purple-100 text-purple-700"
                            : "bg-slate-50 border-slate-100 text-slate-400"
                    )}>
                        <Calculator className={cn("h-3 w-3", !hasCalc && "opacity-40")} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">
                            {hasCalc ? "Allowed" : "No Calc"}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: "created_at",
            header: "Created",
            cell: ({ row }) => {
                const rawDate = row.getValue("created_at") as string;

                if (!rawDate) return <span className="text-muted-foreground italic text-xs">N/A</span>;

                // Standardize the date for JS
                const date = new Date(rawDate.replace(" ", "T"));

                // 1. Format for the Tooltip (Full context: Sunday, May 10, 2026, 5:21 PM)
                const fullDateTime = new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                }).format(date);

                return (
                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <span className="cursor-help border-b border-dotted border-muted-foreground/50 pb-0.5 text-sm font-medium text-slate-700 hover:text-purple-700 transition-colors">
                                    {timeAgo(rawDate)}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-900 text-white border-none px-3 py-2 shadow-xl">
                                <div className="flex flex-col gap-1">
                                    {/* <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Exact Timestamp</p> */}
                                    <p className="text-xs font-medium">{fullDateTime}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: "updated_at",
            header: "Last Modified",
            cell: ({ row }) => {
                const rawDate = row.getValue("updated_at") as string;

                if (!rawDate) return <span className="text-muted-foreground italic text-xs">N/A</span>;

                // Standardize the date for JS
                const date = new Date(rawDate.replace(" ", "T"));

                // 1. Format for the Tooltip (Full context: Sunday, May 10, 2026, 5:21 PM)
                const fullDateTime = new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                }).format(date);

                return (
                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <span className="cursor-help border-b border-dotted border-muted-foreground/50 pb-0.5 text-sm font-medium text-slate-700 hover:text-purple-700 transition-colors">
                                    {timeAgo(rawDate)}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-900 text-white border-none px-3 py-2 shadow-xl">
                                <div className="flex flex-col gap-1">
                                    {/* <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Exact Timestamp</p> */}
                                    <p className="text-xs font-medium">{fullDateTime}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        }
    ], [levels]);
    const handleStatusToggle = async (id: string, currentStatus: string) => {
        const isArchived = currentStatus === 'archived';
        const newStatus = isArchived ? 'active' : 'archived';

        // UI Feedback: "Restoring..." or "Archiving..."
        const loadingToast = toast.loading(`${isArchived ? 'Restoring' : 'Archiving'} paper...`);

        try {
            const response = await fetch('/api/math-papers/update', {
                method: 'POST',
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!response.ok) throw new Error("Update failed");

            toast.success(`Paper ${isArchived ? 'restored' : 'archived'} successfully`, { id: loadingToast });
            fetchPapers(); // Refresh table
        } catch (error) {
            toast.error("Could not update status", { id: loadingToast });
        }
    };
    const handleAddNew = () => {
        setSelectedPaper(null); // Clear any previous selection
        setIsSheetOpen(true);
    };

    // Call this from your DataTable's "Edit" button
    const handleEdit = (paper: MathPaper) => {
        setSelectedPaper(paper); // Pass the row data to the state
        setIsSheetOpen(true);
    };

    return (
        <div className="container w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Math Papers</h1>
                    <p className="text-muted-foreground">Configure exam papers and their global settings.</p>
                </div>
                <Button
                    onClick={handleAddNew}
                    disabled={loading} // 🟢 Prevent clicks while refreshing
                    className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Add New Paper
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={papers}
                searchKey="name"
                title="Math Papers"
                onRefresh={fetchPapers}
                loading={loading}
            />
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{selectedPaper ? "Edit Paper" : "Add New Paper"}</SheetTitle>
                        <SheetDescription>
                            Set the exam paper details and calculator permissions.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="px-5 overflow-y-auto pb-5">

                        <PaperForm
                            initialData={selectedPaper}
                            levels={levels}
                            onSuccess={() => {
                                setIsSheetOpen(false)
                                fetchPapers() // Refresh your table
                            }}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}