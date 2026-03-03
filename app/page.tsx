import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Floscent – The World's First Luxury Perfume Vending Machine",
  description:
    "Generate high-margin passive income with Floscent's luxury perfume vending machines, developed in Europe. Partner with us today.",
}

const features = [
  {
    icon: '✦',
    title: 'European Luxury Engineering',
    desc: 'Each machine is precision-crafted in Europe with cutting-edge fragrance dispensing technology that preserves scent integrity.',
  },
  {
    icon: '◈',
    title: 'High-Margin Passive Income',
    desc: 'Earn 60–80% profit margins on every transaction. Your machine works 24/7 so you don\'t have to.',
  },
  {
    icon: '⬡',
    title: 'Premium Fragrance Collection',
    desc: 'Over 50 exclusive luxury fragrances, including custom-blended scents unavailable anywhere else.',
  },
  {
    icon: '◉',
    title: 'Smart Analytics Dashboard',
    desc: 'Real-time sales data, inventory tracking, and revenue reports accessible from anywhere.',
  },
  {
    icon: '✧',
    title: 'White-Glove Support',
    desc: 'Full installation, maintenance, and restocking services. We handle operations, you collect revenue.',
  },
  {
    icon: '⬢',
    title: 'Custom Branding Options',
    desc: 'Co-brand the machine with your venue or business identity for maximum brand synergy.',
  },
]

const packages = [
  {
    name: 'Explorer',
    price: '9,500',
    desc: 'Perfect for testing the market',
    features: ['1 Floscent Machine', '20 Fragrance SKUs', 'Monthly Analytics', '12-month warranty', 'Remote monitoring'],
    highlight: false,
  },
  {
    name: 'Prestige',
    price: '24,900',
    desc: 'Our most popular package',
    features: ['3 Floscent Machines', '35 Fragrance SKUs', 'Weekly Analytics', 'Lifetime warranty', 'Priority support', 'Custom branding', 'Location consulting'],
    highlight: true,
  },
  {
    name: 'Empire',
    price: 'Custom',
    desc: 'Built for serious investors',
    features: ['5+ Floscent Machines', 'Full fragrance catalog', 'Real-time dashboard', 'Lifetime warranty', 'Dedicated manager', 'Revenue guarantee', 'International placement'],
    highlight: false,
  },
]

const stats = [
  { value: '$2,400+', label: 'Avg Monthly Revenue Per Machine' },
  { value: '78%', label: 'Profit Margin' },
  { value: '18 Months', label: 'Average ROI Timeline' },
  { value: '50+', label: 'Luxury Fragrance SKUs' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-950">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-dark-950/80 backdrop-blur-md border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl font-bold text-gold-500 tracking-widest">FLOSCENT</span>
            <span className="hidden sm:block text-xs text-dark-500 tracking-[0.2em] uppercase pt-0.5">Luxury Fragrance</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#packages" className="text-dark-300 hover:text-white text-sm transition-colors hidden md:block">
              Packages
            </Link>
            <Link href="#features" className="text-dark-300 hover:text-white text-sm transition-colors hidden md:block">
              Features
            </Link>
            <Link href="/login" className="text-dark-300 hover:text-gold-500 text-sm transition-colors">
              Sign In
            </Link>
            <Link href="/onboard" className="btn-primary text-sm py-2 px-4">
              Partner With Us
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-gold-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/3 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
              <span className="text-gold-400 text-xs font-medium tracking-wide uppercase">Developed in Europe · Now Available Worldwide</span>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              The World&apos;s First<br />
              <span className="text-gold-500">Luxury Perfume</span><br />
              Vending Machine
            </h1>
            <p className="text-xl text-dark-300 max-w-2xl mb-10 leading-relaxed">
              Generate high-margin passive income starting today. Place a Floscent machine in premium locations and watch revenue flow automatically — 24 hours a day, 7 days a week.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/onboard" className="btn-primary text-base px-8 py-3.5">
                Get Started Today
              </Link>
              <Link href="#packages" className="btn-secondary text-base px-8 py-3.5">
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-dark-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-serif text-4xl font-bold text-gold-500 mb-2">{stat.value}</div>
              <div className="text-dark-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-white mb-4">Why Choose Floscent</h2>
            <p className="text-dark-400 max-w-xl mx-auto">Everything you need to generate consistent, passive income through the luxury fragrance market.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-gold-500/30 transition-all duration-300 group">
                <div className="text-2xl text-gold-500 mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-dark-400">From onboarding to passive income in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Partner & Onboard', desc: 'Complete our simple onboarding, select your package, and we\'ll finalize your partnership agreement with a custom proposal.' },
              { step: '02', title: 'Deploy & Place', desc: 'We handle delivery, installation, and configuration at your chosen premium locations — hotels, airports, malls, and more.' },
              { step: '03', title: 'Earn Passively', desc: 'Your machine operates automatically. Track real-time revenue in your dashboard and receive monthly payouts.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-serif font-bold text-dark-800 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-dark-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-white mb-4">Investment Packages</h2>
            <p className="text-dark-400">Choose the package that fits your investment goals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`card flex flex-col ${
                  pkg.highlight
                    ? 'border-gold-500/60 bg-gold-500/5 relative'
                    : ''
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-dark-950 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-gold-500 font-semibold uppercase tracking-wider text-sm mb-1">{pkg.name}</div>
                  <div className="font-serif text-4xl font-bold text-white">
                    {pkg.price === 'Custom' ? 'Custom' : `$${pkg.price}`}
                  </div>
                  <div className="text-dark-400 text-sm mt-1">{pkg.desc}</div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-dark-300">
                      <span className="text-gold-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/onboard" className={pkg.highlight ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-dark-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-dark-400 mb-8 text-lg">
            Join hundreds of partners already generating passive income with Floscent luxury perfume vending machines.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/onboard" className="btn-primary text-base px-10 py-4">
              Begin Onboarding
            </Link>
            <Link href="/login" className="btn-secondary text-base px-10 py-4">
              Partner Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-serif text-2xl font-bold text-gold-500 tracking-widest mb-1">FLOSCENT</div>
              <div className="text-dark-500 text-xs tracking-[0.2em] uppercase">The World&apos;s First Luxury Perfume Vending Machine</div>
            </div>
            <div className="flex gap-6 text-sm text-dark-500">
              <Link href="/onboard" className="hover:text-gold-500 transition-colors">Partner With Us</Link>
              <Link href="/login" className="hover:text-gold-500 transition-colors">Sign In</Link>
              <a href="mailto:hello@floscent.com" className="hover:text-gold-500 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-dark-900 text-center text-dark-600 text-xs">
            © {new Date().getFullYear()} Floscent. All rights reserved. Luxury Fragrance Technology Developed in Europe.
          </div>
        </div>
      </footer>
    </div>
  )
}
