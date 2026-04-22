'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'

// ✅ Zod schema
const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {

    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (values: LoginFormValues) => {
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        })

        if (error) {
            // 🔥 handle email not verified nicely
            if (error.message.toLowerCase().includes('email not confirmed')) {

                toast.error('Please verify your email before logging in.')
            } else {
                toast.error(error.message)
            }
            setLoading(false)
            return
        }
        // ✅ get user
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            toast.error("Something went wrong. Please try again.")
            setLoading(false)
            return
        }

        // ✅ get profile
        const { data: profileCheck, error: profileErrorCheck } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

        if (!profileCheck) {
            await supabase.from('profiles').insert({
                id: user.id,
                role: 'student',
            })
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()


        if (profileError) {
            toast.error("Failed to load profile.")
            setLoading(false)
            return
        }

        // 🔥 CASE 1: no profile → onboarding
        if (!profile) {
            router.push('/onboarding')
            return
        }

        if (profile.role === 'student') {
            router.push('/student/dashboard')
        } else if (profile.role === 'teacher') {
            router.push('/teacher/dashboard')
        } else if (profile.role === 'admin') {
            router.push('/admin/dashboard')
        }
        // 🔥 CASE 2: profile exists → redirect by role (basic for now)
        // router.push('/dashboard')
        // ✅ temporary redirect (we’ll improve this later)
        // router.push('/dashboard')
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={cn("flex flex-col gap-6", className)}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Login to your account</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email below to login to your account
                    </p>
                </div>

                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...register("email")}
                    />
                    {errors.email && (
                        <FieldDescription className="text-red-500">
                            {errors.email.message}
                        </FieldDescription>
                    )}
                </Field>

                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </a>
                    </div>

                    <Input
                        id="password"
                        type="password"
                        {...register("password")}
                    />

                    {errors.password && (
                        <FieldDescription className="text-red-500">
                            {errors.password.message}
                        </FieldDescription>
                    )}
                </Field>

                <Field>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </Field>

                {/* <FieldSeparator>Or continue with</FieldSeparator> */}

                <Field>
                    {/* <Button variant="outline" type="button">
                        Login with GitHub
                    </Button> */}

                    <FieldDescription className="text-center">
                        Don&apos;t have an account?{" "}
                        <a href="../auth/signup/" className="underline underline-offset-4">
                            Sign up
                        </a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}