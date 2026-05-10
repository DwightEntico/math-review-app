import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const body = await req.json()

        // 1. Validate ID
        const { id, ...updateFields } = body

        if (!id) {
            return NextResponse.json({ error: 'ID is required for updates' }, { status: 400 })
        }

        // 2. Perform the update
        // Using 'updateFields' allows us to send { status: 'archived' } 
        // OR the full form { name, description, level_id, etc. }
        const { data, error } = await supabase
            .from('math_papers')
            .update({
                ...updateFields,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select(`
                *,
                math_levels (
                    name
                )
            `) // Joining math_levels so the UI updates correctly
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("❌ Update Error:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}