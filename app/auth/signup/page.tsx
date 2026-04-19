'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSignup = async () => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            alert(error.message)
        } else {
            alert('Check your email for confirmation!')
        }
    }

    return (
        <div className="flex flex-col gap-3 max-w-sm mx-auto mt-20">
            <h1 className="text-xl font-bold">Sign Up</h1>

            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2"
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2"
            />

            <button onClick={handleSignup} className="bg-black text-white p-2">
                Sign Up
            </button>
        </div>
    )
}