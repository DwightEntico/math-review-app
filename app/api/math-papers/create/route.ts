import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const body = await req.json()

        // Extracting only the fields we need to prevent malicious injections
        const { name, description, level_id, has_calculator } = body

        const { data, error } = await supabase
            .from('math_papers')
            .insert([{
                name,
                description,
                level_id,
                has_calculator
            }])
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}