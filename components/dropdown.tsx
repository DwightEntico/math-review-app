"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DataItem {
    id: string
    name: string
}

interface ReusableDropdownProps {
    data: DataItem[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function ReusableDropdown({
    data,
    value,
    onChange,
    placeholder = "Select item...",
    disabled = false,
    className,
}: ReusableDropdownProps) {
    const [open, setOpen] = React.useState(false)

    // Find the label for the current value
    const selectedLabel = data.find((item) => item.id === value)?.name

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-[140px] h-8 justify-between text-[10px] font-bold border-slate-200 bg-white text-slate-700 uppercase rounded-full shadow-sm px-3",
                        className
                    )}
                >
                    <span className="truncate">
                        {selectedLabel ? selectedLabel.toUpperCase() : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} className="h-8 text-xs" />
                    <CommandList>
                        <CommandEmpty className="text-[10px] p-2 text-center text-muted-foreground">
                            No results found.
                        </CommandEmpty>
                        <CommandGroup>
                            {data.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    value={item.name}
                                    onSelect={() => {
                                        onChange(item.id === value ? "" : item.id)
                                        setOpen(false)
                                    }}
                                    className="text-[10px] uppercase font-medium"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-3 w-3 text-purple-600",
                                            value === item.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}