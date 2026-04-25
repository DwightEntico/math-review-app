"use client"
export default function ProfilePage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <div className="relative h-64 w-full rounded-lg overflow-hidden">
                <img
                    src="/profile-bg.jpg"
                    alt="Profile Background"
                    className="absolute inset-0 h-full w-full object-cover grayscale dark:grayscale-0"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h2 className="text-3xl font-bold text-white">John Doe</h2>
                </div>
            </div>
        </div>
    )
}