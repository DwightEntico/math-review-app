import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { id } = await req.json()

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        // Instead of deleting, we perform an update
        const { error } = await supabase
            .from('math_papers')
            .update({
                status: 'archived',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true, message: "Paper moved to archive" })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}