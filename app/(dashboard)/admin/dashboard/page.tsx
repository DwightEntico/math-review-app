"use client"
import { TailChase } from 'ldrs/react'
// import 'ldrs/react/TailChase.css'
export default function DashboardPage() {

    // Default values shown
    return (
        <div className="flex flex-col gap-6">
            <TailChase
                size="40"
                speed="1.75"
                color="black"
            />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p>Welcome to your dashboard! Here you can access your courses, view your progress, and manage your settings.</p>
        </div>
    )
}