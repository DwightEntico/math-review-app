"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns" // Or use your native Intl formatter

export type Topic = {
  id: string
  name: string
  ai_model_type: string
  created_at: string
}

export const columns = (
  onEdit: (topic: Topic) => void,
  onDelete: (id: string) => void
): ColumnDef<Topic>[] => [
  {
    accessorKey: "name",
    header: "Topic Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold text-sm">{row.original.name}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          IGCSE Mathematics
        </span>
      </div>
    ),
  },
  {
    accessorKey: "ai_model_type",
    header: "AI Logic Model",
    cell: ({ row }) => {
      const type = row.original.ai_model_type
      return (
        <Badge 
          variant="outline" 
          className="font-mono text-[10px] bg-primary/5 text-primary border-primary/20"
        >
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Date Created",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at)
      return (
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Calendar className="h-3 w-3" />
          {date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const topic = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(topic)}>
              <Pencil className="mr-2 h-4 w-4 text-blue-500" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(topic.id)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Topic
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]