import { Geist, Geist_Mono, Roboto, Montserrat } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "IGCSE Math Portal",
  description: "Advanced learning platform for IGCSE Mathematics",
};
const montserratHeading = Montserrat({ subsets: ['latin'], variable: '--font-heading' });

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable, montserratHeading.variable)}
    >
      <body>
        {/* <ThemeProvider> */}
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster />
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}
