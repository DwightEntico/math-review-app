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
import Cookies from 'js-cookie'

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

        try {
            // 1. Sign In
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            })

            if (authError) throw authError
            const user = authData.user
            if (!user) return

            // 2. Sync Profile
            // We use upsert so if they exist, nothing breaks. If they don't, they get created.
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    // We only set 'student' if it's a brand new record (ignore if exists)
                    // Note: Better handled via DB Trigger, but this is safe:
                }, { onConflict: 'id' })
                .select()
                .single()

            if (profileError) throw new Error("Could not sync user profile.")

            // 🚀 STEP 4: SET THE ONBOARDING COOKIE
            // This allows the Middleware to check the status without a DB call
            const isComplete = Boolean(profile.last_name && profile.first_name)

            Cookies.set('onboarding_status', isComplete ? 'complete' : 'incomplete', {
                expires: 7, // 7 days
                secure: true,
                sameSite: 'strict'
            })

            // 3. Unified Redirect Logic
            const role = profile.role || 'student'
            if (!isComplete) {
                toast.info("Almost there! Please complete your profile.")
                router.push(`/${role}/settings/profile`)
            } else {
                router.push(`/${role}/dashboard`)
            }
            // if (!profile.last_name) {
            //     toast.info("Almost there! Please complete your profile.")
            //     router.push(`/${role}/settings/profile`)
            // } else {
            //     router.push(`/${role}/dashboard`)
            // }

        } catch (error: any) {
            const isUnconfirmed = error.message?.toLowerCase().includes('email not confirmed')
            toast.error(isUnconfirmed ? 'Please verify your email.' : error.message)
        } finally {
            setLoading(false)
        }
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