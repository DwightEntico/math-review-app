import { NextResponse } from 'next/server';
// ❌ REMOVE THIS: import { createClient } from '@/lib/supabase/client'
// ✅ ADD THIS:
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    try {
        // 1. UPSERT TEST
        const { data: test, error: testError } = await supabase
            .from('tests')
            .upsert({
                ...(body.id ? { id: body.id } : {}),
                title: body.title,
                description: body.description,
                level: body.level,
                time_limit: body.timeLimit,
                sample_size: body.sampleSize,
                author_id: user.id,
                status: body.status || 'published'
            })
            .select().single();

        if (testError) throw testError;

        // 2. SECTIONS
        for (const sectionData of body.sections) {
            const { data: section, error: secError } = await supabase
                .from('test_sections')
                .upsert({
                    id: sectionData.id,
                    test_id: test.id,
                    title: sectionData.title,
                    description: sectionData.description
                })
                .select().single();

            if (secError) throw secError;

            // 3. QUESTIONS
            for (const qData of sectionData.questions) {
                const { data: question, error: qError } = await supabase
                    .from('test_questions')
                    .upsert({
                        id: qData.id,
                        section_id: section.id,
                        type: qData.type,
                        content_type: qData.contentType,
                        text: qData.text,
                        image_url: qData.imageUrl,
                        tier: qData.tier,
                        points: qData.points,
                        has_calculator: qData.hasCalculator,
                        ai_explanation: qData.aiExplanation,
                        ai_tutor_prompt: qData.aiTutorPrompt,
                        correct_answer_text: qData.correctAnswerText, // Capture short answer
                        math_level_id: qData.mathLevelId,
                        math_paper_id: qData.mathPaperId,
                        topic_id: qData.topicId,
                        subtopic_id: qData.subtopicId
                    })
                    .select().single();

                if (qError) throw qError;

                // 4. OPTIONS (Only for multiple_choice)
                if (qData.type === 'multiple_choice' && qData.options?.length > 0) {
                    const optionsToInsert = qData.options.map((opt: any) => ({
                        id: opt.id,
                        question_id: question.id,
                        text: opt.text,
                        is_correct: opt.is_correct
                    }));

                    const { error: optError } = await supabase
                        .from('question_options')
                        .upsert(optionsToInsert);

                    if (optError) throw optError;
                }
            }
        }

        return NextResponse.json({ success: true, testId: test.id });

    } catch (err: any) {
        console.error("❌ Database Save Failure:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// export async function POST(req: Request) {
//     try {
//         // This helper (server-side) knows how to read cookies!
//         const supabase = await createClient();

//         // Now this will actually find the user
//         const { data: { user }, error: authError } = await supabase.auth.getUser()

//         if (authError || !user) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//         }

//         const body = await req.json();
//         console.log("👁️", JSON.stringify(body))
//         // console.log("DAT TO BE SAVED>>>", body)
//         return true

//         // ... rest of your insert logic ...
//         const { data, error } = await supabase
//             .from('tests')
//             .upsert({
//                 ...(body.id ? { id: body.id } : {}), // ✅ Only include ID if it exists
//                 title: body.title,
//                 description: body.description,
//                 level: body.level,
//                 time_limit: body.timeLimit,
//                 sample_size: body.sampleSize,
//                 sections: body.sections,
//                 author_id: user.id,
//                 status: body.status,
//                 updated_at: new Date().toISOString(), // Good practice for updates
//             }, {
//                 onConflict: 'id' // ✅ Tells Supabase to update if ID matches
//             })
//             // .insert([
//             //     {
//             //         title: body.title,
//             //         description: body.description,
//             //         level: body.level,
//             //         time_limit: body.timeLimit,
//             //         sample_size: body.sampleSize,
//             //         sections: body.sections,
//             //         author_id: user.id,
//             //         status: body.status || 'draft',
//             //     },
//             // ])
//             .select()
//             .single();

//         if (error) throw error;

//         return NextResponse.json({ success: true, testId: data.id });
//     } catch (error: any) {
//         // ... error handling
//     }
// }