import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import { PricingCard } from '../../components/PricingCard'
import { footerColumns, pricingCards, testimonials } from './config'
import { FooterColumn } from '../../components/FooterColumn'
import { TestimonialCard } from '../../components/TestimonialCard'

export function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(1)
  const [demoLinkMessage, setDemoLinkMessage] = useState<string | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  useEffect(() => {
    if (!demoLinkMessage) {
      return
    }

    const timeout = window.setTimeout(() => setDemoLinkMessage(null), 2400)
    return () => window.clearTimeout(timeout)
  }, [demoLinkMessage])

  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth >= 1024) {
        setSlidesPerView(3)
      } else if (window.innerWidth >= 768) {
        setSlidesPerView(2)
      } else {
        setSlidesPerView(1)
      }
    }

    updateSlidesPerView()
    window.addEventListener('resize', updateSlidesPerView)
    return () => window.removeEventListener('resize', updateSlidesPerView)
  }, [])

  const maxTestimonialIndex = Math.max(testimonials.length - slidesPerView, 0)
  const clampedActiveTestimonial = Math.min(activeTestimonial, maxTestimonialIndex)

  useEffect(() => {
    if (maxTestimonialIndex === 0) {
      return
    }

    const interval = window.setInterval(() => {
      setActiveTestimonial((current) => (current >= maxTestimonialIndex ? 0 : current + 1))
    }, 7000)

    return () => window.clearInterval(interval)
  }, [maxTestimonialIndex])

  const handlePrevTestimonial = () => {
    setActiveTestimonial((current) => (current <= 0 ? maxTestimonialIndex : current - 1))
  }

  const handleNextTestimonial = () => {
    setActiveTestimonial((current) => (current >= maxTestimonialIndex ? 0 : current + 1))
  }

  const handleDemoLinkClick = (label: string) => {
    setDemoLinkMessage(`"${label}" is a placeholder link in this demo app.`)
  }

  const handleTestimonialTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
    touchEndX.current = null
  }

  const handleTestimonialTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = event.touches[0]?.clientX ?? null
  }

  const handleTestimonialTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) {
      return
    }

    const deltaX = touchStartX.current - touchEndX.current
    if (Math.abs(deltaX) < 50) {
      return
    }

    if (deltaX > 0) {
      handleNextTestimonial()
    } else {
      handlePrevTestimonial()
    }
  }

  return (
    <div className="bg-background-dark text-slate-200 font-display selection:bg-primary/30">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-icons text-white text-sm">construction</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              CONTRACTOR<span className="text-primary">OS</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#features">
              Features
            </a>
            <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#solutions">
              Solutions
            </a>
            <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#pricing">
              Pricing
            </a>
            <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#enterprise">
              Enterprise
            </a>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-primary/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-20 overflow-hidden" id="features">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] glow-radial -mr-96 -mt-96 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] glow-radial -ml-72 -mb-72 opacity-50 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h1 className="font-serif text-6xl md:text-8xl text-white mb-8 leading-tight">
            Build Harder.<br />Manage <span className="italic text-primary">Smarter.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed mb-12">
            The all-in-one operating system for modern electrical, plumbing, and HVAC enterprises. Scale
            your operations without the overhead.
          </p>
          <div className="flex items-center justify-center gap-4 mb-20">
            <Link
              to="/register"
              className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:scale-105 transition-transform"
            >
              Start Your Free Trial
            </Link>
            <Link
              to="/login"
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              Book a Demo
            </Link>
          </div>
          <div className="relative max-w-5xl mx-auto perspective-1000">
            <div className="glass p-4 rounded-2xl shadow-2xl rotate-x-12 transform-gpu border border-white/10 bg-linear-to-br from-white/10 to-transparent">
              <div className="bg-background-dark rounded-xl overflow-hidden border border-white/5">
                <div className="h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="p-8 grid grid-cols-12 gap-6">
                  <div className="col-span-3 space-y-4">
                    <div className="h-8 bg-white/10 rounded-lg w-full"></div>
                    <div className="h-8 bg-white/5 rounded-lg w-3/4"></div>
                    <div className="h-8 bg-white/5 rounded-lg w-full"></div>
                    <div className="h-32 bg-primary/10 rounded-lg w-full border border-primary/20"></div>
                  </div>
                  <div className="col-span-9 space-y-6">
                    <div className="flex justify-between">
                      <div className="h-12 w-48 bg-white/10 rounded-lg"></div>
                      <div className="h-12 w-12 bg-primary rounded-lg"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-32 bg-white/5 rounded-xl border border-white/5"></div>
                      <div className="h-32 bg-white/5 rounded-xl border border-white/5"></div>
                      <div className="h-32 bg-white/5 rounded-xl border border-white/5"></div>
                    </div>
                    <div className="h-48 bg-white/5 rounded-xl border border-white/5 p-4">
                      <div className="w-full h-full rounded-lg bg-slate-800 flex items-center justify-center">
                        <img
                          className="w-full h-full object-cover rounded-lg opacity-40 mix-blend-luminosity"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmNX2fKqwHaPhKA7HNYOgD2ujEqrNixsrrKsJhyLjoPhwbB5ZmiYzZB2Dy5hP8H-2Yh9aez7iJiSp_7CDSRaL0JnxJM68bRRs1Nuq44yhuBOy2VCQo7FhEUOj35n_kf76tplUyjCAYJu2hwMAECyd3pl9tZAxPznWrQoWhyFXEYp76UFW4_4WI6DshA66kuQism4FrVL4ZyEt2sH6K566Ec2g9rMFQRfrk5O3I3PaCpQVlthw4VXFLFHMMcDuPF24aDq3RxcaSIJY"
                          alt="Dashboard preview"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 glass p-6 rounded-2xl w-64 shadow-xl border-primary/30 hidden lg:block">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="material-icons text-green-500">payments</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Invoice Paid</p>
                  <p className="text-sm font-bold text-white">+$2,450.00</p>
                </div>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-green-500"></div>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 glass p-6 rounded-2xl w-64 shadow-xl border-primary/30 hidden lg:block">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-icons text-primary">schedule</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Next Job</p>
                  <p className="text-sm font-bold text-white">14:00 • West Side</p>
                </div>
              </div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-background-dark"></div>
                <div className="w-8 h-8 rounded-full bg-slate-500 border-2 border-background-dark"></div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background-dark text-[10px] font-bold">
                  +3
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="py-20 overflow-hidden select-none pointer-events-none">
        <div className="marquee">
          <div className="marquee-track">
            <span className="marquee-item text-outline font-serif text-[120px] font-bold uppercase tracking-tighter">
              The Operating System for Trades
            </span>
            <span className="marquee-item text-outline font-serif text-[120px] font-bold uppercase tracking-tighter" aria-hidden>
              The Operating System for Trades
            </span>
            <span className="marquee-item text-outline font-serif text-[120px] font-bold uppercase tracking-tighter" aria-hidden>
              The Operating System for Trades
            </span>
            <span className="marquee-item text-outline font-serif text-[120px] font-bold uppercase tracking-tighter" aria-hidden>
              The Operating System for Trades
            </span>
          </div>
        </div>
      </div>

      <section className="py-24 max-w-7xl mx-auto px-6" id="solutions">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 group relative overflow-hidden rounded-3xl bg-slate-900 border border-white/5 p-12">
            <div className="absolute inset-0 z-0 opacity-40 group-hover:scale-105 transition-transform duration-700">
              <img
                className="w-full h-full object-cover grayscale"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDc4I3Ckh741LmvD1RfhisVjsko5x1NKh9EhFS3iXyjHOM54ASRrLbfRm-M9OLlr_mFH3NtX6agck_CoKHQTMc-a-rkJCzYbmriCkEIUo1vksqw9jKhYCAnQ8KFw7oxHPQOgj9KPje_uU5tl0jNrRuo1UD2EcUMoCQO28uNE097kOHLwsK0S_lAonieGUs4WigiFOEX8XTcHtY-teJEJjGz9CFZNOQIugOvkHRD4TKdAQO8BSrd7c5HYkOdljw_w9va7A36i6Ubh_4"
                alt="Fleet intelligence"
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-background-dark via-background-dark/80 to-transparent z-10"></div>
            <div className="relative z-20 h-full flex flex-col justify-end">
              <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4">Operations Platform</span>
              <h3 className="text-4xl font-serif text-white mb-6">Unified Pipeline Command</h3>
              <p className="text-slate-400 text-lg max-w-md mb-8">
                Track leads, estimates, jobs, and invoices in a single board. Every transition is traceable so
                the field and office stay perfectly aligned.
              </p>
              <div className="flex items-center gap-4">
                <div className="glass p-3 rounded-xl border border-white/20">
                  <span className="material-icons text-white">location_on</span>
                </div>
                <div className="glass p-3 rounded-xl border border-white/20">
                  <span className="material-icons text-white">route</span>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 space-y-8">
            <div className="bg-primary p-8 rounded-3xl h-full flex flex-col justify-between">
              <div>
                <span className="text-white/60 font-bold tracking-widest uppercase text-xs mb-4 block">Payments</span>
                <h3 className="text-3xl font-serif text-white mb-4">Instant Invoicing</h3>
                <p className="text-white/80">Collect payments on-site. Integrate directly with QuickBooks and Xero.</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl mt-8">
                <div className="flex justify-between items-center text-white mb-2">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="material-icons text-sm">trending_up</span>
                </div>
                <div className="text-2xl font-bold text-white">$142.8k</div>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 bg-slate-900 border border-white/5 p-8 rounded-3xl">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
              <span className="material-icons text-primary">inventory_2</span>
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">Smart Inventory</h3>
            <p className="text-slate-400">
              Track every parts bin across your entire fleet in real-time. Never show up to a job empty handed again.
            </p>
          </div>
          <div className="md:col-span-8 group relative overflow-hidden rounded-3xl bg-slate-900 border border-white/5 p-12">
            <div className="absolute inset-0 z-0 opacity-30 group-hover:scale-105 transition-transform duration-700">
              <img
                className="w-full h-full object-cover grayscale"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQXg1wsFnqAboMVrMLVQnFymjcubL9lQ84Ma_vUdQ8aZ8zrWFcWzbMo2h9IP6QfOUVnr1DPHsWI7ig0tNaffPxdQTcdjaZD7BLUenV1H5mSAmbKQFfQPeG6GtEZ7XC8sJDivxHsIZN1bh3l8Yy1aujzAM9Zg4Yim7YFfpznI2TItKvko6hJppal-8XM7DgVLaWg1Fywu9lDeXyZ5GDhdZsGcr0IzlU5p1H5ErjJL7Hm3H1TDd_9qi3642-79Y9NiZujt0Q_kZLRxM"
                alt="Automated CRM"
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-r from-background-dark via-background-dark/90 to-transparent z-10"></div>
            <div className="relative z-20 h-full flex flex-col justify-center max-w-md">
              <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4">Client Experience</span>
              <h3 className="text-4xl font-serif text-white mb-6">Automated CRM</h3>
              <p className="text-slate-400 text-lg mb-8">
                Nurture leads and retain customers with automated follow-ups, service reminders, and professional quote templates.
              </p>
              <button className="flex items-center gap-2 text-white font-semibold hover:gap-4 transition-all">
                Explore CRM Features <span className="material-icons">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden" id="pricing">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-serif text-white mb-4">Simplified Pricing</h2>
            <p className="text-slate-400 text-lg">Plans aligned to the contractor ops dashboard and workflow stages.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingCards.map((card) => (
              <PricingCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/1" id="enterprise">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Client Success</h2>
              <p className="text-slate-400">Hear from the tradespeople transforming their business with Contractor OS.</p>
            </div>
            <div className="hidden md:flex gap-4">
              <button
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                onClick={handlePrevTestimonial}
                aria-label="Previous testimonial"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                onClick={handleNextTestimonial}
                aria-label="Next testimonial"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
          <div
            className="overflow-hidden pb-10"
            onTouchStart={handleTestimonialTouchStart}
            onTouchMove={handleTestimonialTouchMove}
            onTouchEnd={handleTestimonialTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${clampedActiveTestimonial * (100 / slidesPerView)}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="basis-full md:basis-1/2 lg:basis-1/3 shrink-0 px-3"
                >
                  <TestimonialCard {...testimonial} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: maxTestimonialIndex + 1 }).map((_, index) => (
              <button
                key={`testimonial-dot-${index}`}
                className={`h-2 rounded-full transition-all ${index === clampedActiveTestimonial
                  ? 'w-10 bg-primary'
                  : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                onClick={() => setActiveTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-y border-white/5 bg-white/2">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-500 text-sm font-bold tracking-[0.2em] uppercase mb-12">
            Empowering the world&apos;s best service teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale contrast-125">
            <span className="text-2xl font-black text-white italic">PRO-TECH</span>
            <span className="text-2xl font-black text-white tracking-widest">METRO PLUMB</span>
            <span className="text-2xl font-black text-white italic">E-LECTRIC</span>
            <span className="text-2xl font-black text-white tracking-widest">VOLT-AMP</span>
            <span className="text-2xl font-black text-white italic">FLOW MASTER</span>
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] glow-radial pointer-events-none opacity-40"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-serif text-white mb-8">
            Ready to upgrade your infrastructure?
          </h2>
          <p className="text-xl text-slate-400 mb-12">Join 2,500+ trades businesses running on the OS of the future.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-2xl text-xl font-bold hover:shadow-[0_0_30px_rgba(19,127,236,0.4)] transition-all"
            >
              Start 14-Day Free Trial
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-white/10 transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
          <p className="mt-8 text-slate-500 text-sm italic">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 bg-background-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                  <span className="material-icons text-white text-[10px]">construction</span>
                </div>
                <span className="text-lg font-bold tracking-tight text-white uppercase">
                  Contractor<span className="text-primary">OS</span>
                </span>
              </div>
              <p className="text-slate-400 max-w-xs mb-8">
                The next-generation operating system for industrial trade management and field operations.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <span className="material-icons text-xl">facebook</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <span className="material-icons text-xl">share</span>
                </div>
              </div>
            </div>
            {footerColumns.map((column) => (
              <FooterColumn key={column.title} {...column} onLinkClick={handleDemoLinkClick} />
            ))}
          </div>
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">© 2024 Contractor OS Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Systems Operational
              </div>
            </div>
          </div>
        </div>
      </footer>
      {demoLinkMessage ? (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className="rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 text-slate-100 shadow-xl"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-white">Demo app notice</p>
            <p className="text-xs text-slate-400">{demoLinkMessage}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}




