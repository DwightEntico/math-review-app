"use client"
export default function StudentPage() {
    return (
        <div className="flex min-h-screen">
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
                    <h1 className="mb-6 text-2xl font-bold">Student Dashboard</h1>
                    <p>Welcome to your dashboard! Here you can view your courses, assignments, and more.</p>
                </div>
            </div>
        </div>
    )
}