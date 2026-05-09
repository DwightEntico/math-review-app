"use client"

import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit, FileText, MoreHorizontal, Trash2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { timeAgo } from "@/lib/utils/date-formatter"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

// Define the shape of the Test data based on your schema
type Test = {
    id: string
    title: string
    description?: string
    level: string
    time_limit: number
    sample_size: number
    status: "published" | "draft" | "archived"
    created_at: string
}

export default function TestBankPage() {
    const router = useRouter()
    const [tests, setTests] = useState<Test[]>([])
    const [loading, setLoading] = useState(false)

    const fetchTests = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/tests/view/by_teacher_id')
            if (!response.ok) throw new Error('Failed to fetch tests')
            const data = await response.json()
            setTests(data)
        } catch (error) {
            toast.error("Could not load test bank")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTests()
    }, [])

    const columns: ColumnDef<Test>[] = [
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => router.push(`/dashboard/tests/edit/${row.original.id}`)}
                                    className="h-8 w-8 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Edit Test Bank</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Test Title <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{row.getValue("title")}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                        {row.original.description || "No description provided"}
                    </span>
                </div>
            )
        },
        {
            accessorKey: "level",
            header: "Syllabus",
            cell: ({ row }) => <Badge variant="secondary" className="uppercase font-black text-[10px]">{row.getValue("level")}</Badge>
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge
                        className={cn(
                            "capitalize text-[10px] font-bold",
                            status === "published" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-slate-100 text-slate-600"
                        )}
                    >
                        {status}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "time_limit",
            header: "Limit",
            cell: ({ row }) => <span className="text-sm font-medium">{row.getValue("time_limit")} mins</span>
        },
        {
            accessorKey: "sample_size",
            header: "Draw Size",
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-slate-400" />
                    <span className="text-sm">{row.getValue("sample_size")} qns</span>
                </div>
            )
        },
        {
            accessorKey: "created_at",
            header: "Created",
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"))
                return (
                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <span className="cursor-help text-sm text-muted-foreground">
                                    {timeAgo(date)}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {date.toLocaleDateString(undefined, { dateStyle: 'full' })}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            }
        }
    ]

    return (
        <div className="container py-10 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Test Bank</h1>
                    <p className="text-muted-foreground">Manage your curriculum-aligned exam papers and question pools.</p>
                </div>
                <Button
                    onClick={() => router.push("/teacher/tests/new")}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
                >
                    + Create New Test
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={tests}
                searchKey="title"
                title="Test Bank"
                onRefresh={fetchTests}
            />
        </div>
    )
}