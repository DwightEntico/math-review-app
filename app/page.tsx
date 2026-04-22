"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowUp } from "lucide-react"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"

import Image from "next/image"

// ================= NAVBAR =================
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-white/30 shadow">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              MG
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="hidden md:flex gap-6">
          <a href="#home">Home</a>
          <a href="#topics">Math Topics</a>
          <a href="#about">About</a>
          <a href="/auth/login">Sign In</a>
        </div>
      </div>
    </nav >
  )
}
// ================= HERO CAROUSEL =================
function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const images = [
    "/placeholder1.jpg",
    "/placeholder2.jpg",
    "/placeholder3.jpg",
  ]

  // autoplay
  useEffect(() => {
    if (paused) return

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [paused, images.length])

  return (
    <section
      id="home"
      className="mt-20 relative w-full h-[300px] md:h-[500px] overflow-hidden scroll-mt-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* SLIDER TRACK */}
      <motion.div
        className="flex h-full"
        animate={{ x: `-${index * 100}%` }}
        transition={{ type: "spring", stiffness: 70, damping: 18 }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </motion.div>

      {/* CONTROLS */}
      <div className="absolute inset-0 flex justify-between items-center px-4">
        <button
          onClick={() =>
            setIndex((prev) => (prev - 1 + images.length) % images.length)
          }
          className="bg-black/50 text-white p-2 rounded-full"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={() => setIndex((prev) => (prev + 1) % images.length)}
          className="bg-black/50 text-white p-2 rounded-full"
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  )
}
// ================= TOPIC CARD =================
function TopicCard({ topic, reverse }: any) {
  return (
    <div
      className={`flex flex-col md:flex-row items-center gap-6 mb-12 ${reverse ? "md:flex-row-reverse" : ""
        }`}
    >
      <img src={topic.img} className="w-full md:w-1/2 rounded-2xl" />
      <div className="md:w-1/2">
        <h2 className="text-2xl font-bold mb-2">{topic.title}</h2>
        <p className="mb-2">{topic.desc}</p>
        <button className="text-blue-500">Read more</button>
      </div>
    </div>
  )
}

// ================= TOPICS SECTION =================
function TopicsSection() {
  const topics = [
    {
      title: "Algebra",
      desc: "Learn equations, expressions, and problem-solving techniques.",
      img: "/topic1.jpg",
    },
    {
      title: "Geometry",
      desc: "Explore shapes, theorems, and spatial reasoning.",
      img: "/topic2.jpg",
    },
    {
      title: "Statistics",
      desc: "Understand data, probability, and interpretation.",
      img: "/topic3.jpg",
    },
  ]

  return (
    <section id="topics" className="max-w-7xl mx-auto py-12 px-4 scroll-mt-20">
      {topics.map((t, i) => (
        <TopicCard key={i} topic={t} reverse={i % 2 !== 0} />
      ))}
    </section>
  )
}

// ================= ABOUT SECTION =================
function AboutSection() {
  return (
    <section id="about" className="max-w-7xl mx-auto py-16 px-4 scroll-mt-20">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <img
          src="/about.jpg"
          className="w-full rounded-2xl object-cover"
        />
        <div>
          <h2 className="text-3xl font-bold mb-4">About the Platform</h2>
          <p className="mb-4 text-gray-600">
            This math review platform is designed for Grade 9–10 students to
            master core and extended topics through structured practice and
            interactive assessments.
          </p>
          <p className="mb-4 text-gray-600">
            Create tests, review concepts, and track your progress—all in one
            place. Built to make learning math more engaging and effective.
          </p>
          <button className="bg-black text-white px-5 py-2 rounded-lg">
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}

// ================= TESTIMONIALS =================
function Testimonials() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const data = [
    { name: "Student A", comment: "This app made math so much easier!" },
    { name: "Student B", comment: "I improved my grades quickly." },
    { name: "Student C", comment: "Highly recommended for review!" },
  ]

  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % data.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [paused, data.length])

  return (
    <section
      className="bg-gray-100 py-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          {/* Avatar */}
          <Avatar className="w-16 h-16 mb-4">
            <AvatarImage src={`/avatars/${index + 1}.jpg`} />
            <AvatarFallback>
              {data[index].name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <h3 className="font-semibold text-lg">
            {data[index].name}
          </h3>

          {/* Comment */}
          <p className="mt-2 text-gray-600 max-w-md">
            “{data[index].comment}”
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ================= FOOTER =================
function Footer() {
  return (
    <footer className="bg-black text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6 pb-6">
        <div className="flex items-center gap-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              MG
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col gap-2">
          <a href="#home">Home</a>
          <a href="#topics">Math Topics</a>
          <a href="#about">About</a>
          <a href="/auth/login">Sign In</a>
        </div>

        <div className="text-sm">Built for students.</div>
      </div>

      <div className="border-t border-white/20 text-center text-sm py-4 w-full">
        © {new Date().getFullYear()} Your App. All rights reserved.
      </div>
    </footer>
  )
}

// ================= SCROLL TO TOP =================
function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 bg-black text-white p-3 rounded-full shadow-lg"
    >
      <ArrowUp />
    </button>
  )
}

// ================= MAIN PAGE =================
export default function LandingPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth"
  }, [])

  return (
    <div className="w-full">
      <Navbar />
      <HeroCarousel />
      <TopicsSection />
      <AboutSection />
      <Testimonials />
      <Footer />
      <ScrollToTop />
    </div>
  )
}
