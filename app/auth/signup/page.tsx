'use client'

import { GalleryVerticalEnd } from "lucide-react"

import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
 
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Learning Management System
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <SignupForm />
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    src="/sign-up-bg.jpg"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}

// 'use client'

// import { useState } from 'react'
// import { createClient } from '@/lib/supabase/client'

// export default function SignupPage() {
//     const supabase = createClient()

//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('')

//     const handleSignup = async () => {
//         const { data, error } = await supabase.auth.signUp({
//             email,
//             password,
//         })

//         if (error) {
//             alert(error.message)
//         } else {
//             alert('Check your email for confirmation!')
//         }
//     }

//     return (
//         <div className="flex flex-col gap-3 max-w-sm mx-auto mt-20">
//             <h1 className="text-xl font-bold">Sign Up</h1>

//             <input
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="border p-2"
//             />

//             <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="border p-2"
//             />

//             <button onClick={handleSignup} className="bg-black text-white p-2">
//                 Sign Up
//             </button>
//         </div>
//     )
// }