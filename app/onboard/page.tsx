'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const STEPS = [
  { id: 1, title: 'Your Information', subtitle: 'Tell us about yourself' },
  { id: 2, title: 'Business Details', subtitle: 'Your business context' },
  { id: 3, title: 'Investment Goals', subtitle: 'What you\'re looking for' },
  { id: 4, title: 'Package Selection', subtitle: 'Choose your entry point' },
  { id: 5, title: 'Confirmation', subtitle: 'Review and submit' },
]

const PACKAGES = [
  { id: 'explorer', name: 'Explorer', price: '$9,500', machines: '1 Machine', desc: 'Test the market' },
  { id: 'prestige', name: 'Prestige', price: '$24,900', machines: '3 Machines', desc: 'Most popular', highlight: true },
  { id: 'empire', name: 'Empire', price: 'Custom', machines: '5+ Machines', desc: 'For serious investors' },
]

export default function OnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [data, setData] = useState({
    name: '', email: '', phone: '', company: '',
    businessType: '', businessSize: '', location: '',
    budget: '', timeline: '', goals: '', howDidYouHear: '',
    selectedPackage: 'prestige',
    additionalInfo: '',
  })

  const update = (k: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setData({ ...data, [k]: e.target.value })

  async function submit() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) { setError(result.error || 'Submission failed'); return }
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">✦</div>
          <h1 className="font-serif text-3xl font-bold text-white mb-4">Welcome to Floscent!</h1>
          <p className="text-dark-400 mb-6">Your onboarding request has been received. A member of our team will reach out within 24 hours to discuss your partnership.</p>
          <div className="card mb-6">
            <p className="text-sm text-dark-400 mb-1">We&apos;ve sent a confirmation to</p>
            <p className="text-gold-500 font-medium">{data.email}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="btn-primary">Access Your Portal</Link>
            <Link href="/" className="btn-secondary">Back to Home</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-2xl font-bold text-gold-500 tracking-widest block mb-6">FLOSCENT</Link>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Partner Onboarding</h1>
          <p className="text-dark-400">Complete all steps to get your custom proposal</p>
        </div>

        {/* Progress */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                step > s.id ? 'bg-gold-500 text-dark-950' :
                step === s.id ? 'bg-gold-500/20 border-2 border-gold-500 text-gold-500' :
                'bg-dark-800 border border-dark-700 text-dark-500'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${step > s.id ? 'bg-gold-500' : 'bg-dark-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="card">
          <h2 className="font-serif text-xl font-bold text-white mb-1">{STEPS[step - 1].title}</h2>
          <p className="text-dark-400 text-sm mb-6">{STEPS[step - 1].subtitle}</p>

          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input-field" placeholder="Jane Doe" value={data.name} onChange={update('name')} required />
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input className="input-field" placeholder="+1 555-0000" value={data.phone} onChange={update('phone')} />
                </div>
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input type="email" className="input-field" placeholder="you@example.com" value={data.email} onChange={update('email')} required />
              </div>
              <div>
                <label className="label">Company / Organization</label>
                <input className="input-field" placeholder="Your company name" value={data.company} onChange={update('company')} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">Business Type *</label>
                <select className="input-field" value={data.businessType} onChange={update('businessType')}>
                  <option value="">Select type…</option>
                  <option value="hotel">Hotel / Hospitality</option>
                  <option value="airport">Airport / Travel Hub</option>
                  <option value="mall">Shopping Mall / Retail</option>
                  <option value="gym">Gym / Wellness Center</option>
                  <option value="spa">Spa / Beauty Salon</option>
                  <option value="office">Office / Corporate</option>
                  <option value="individual">Individual Investor</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Business Size</label>
                <select className="input-field" value={data.businessSize} onChange={update('businessSize')}>
                  <option value="">Select size…</option>
                  <option value="solo">Solo / Individual</option>
                  <option value="small">Small (2–10 employees)</option>
                  <option value="medium">Medium (11–50 employees)</option>
                  <option value="large">Large (50+ employees)</option>
                </select>
              </div>
              <div>
                <label className="label">Placement Location(s)</label>
                <input className="input-field" placeholder="City, State / Country" value={data.location} onChange={update('location')} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="label">Investment Budget Range</label>
                <select className="input-field" value={data.budget} onChange={update('budget')}>
                  <option value="">Select budget…</option>
                  <option value="under-10k">Under $10,000</option>
                  <option value="10k-25k">$10,000 – $25,000</option>
                  <option value="25k-50k">$25,000 – $50,000</option>
                  <option value="50k-100k">$50,000 – $100,000</option>
                  <option value="100k+">$100,000+</option>
                </select>
              </div>
              <div>
                <label className="label">Expected Timeline to Deploy</label>
                <select className="input-field" value={data.timeline} onChange={update('timeline')}>
                  <option value="">Select timeline…</option>
                  <option value="asap">As soon as possible</option>
                  <option value="1-3months">1–3 months</option>
                  <option value="3-6months">3–6 months</option>
                  <option value="6months+">6+ months</option>
                </select>
              </div>
              <div>
                <label className="label">Primary Goals</label>
                <textarea className="input-field min-h-[80px] resize-none" placeholder="What do you hope to achieve with Floscent?" value={data.goals} onChange={update('goals')} />
              </div>
              <div>
                <label className="label">How did you hear about us?</label>
                <select className="input-field" value={data.howDidYouHear} onChange={update('howDidYouHear')}>
                  <option value="">Select…</option>
                  <option value="social">Social Media</option>
                  <option value="referral">Referral / Friend</option>
                  <option value="search">Google / Search</option>
                  <option value="event">Event / Trade Show</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-dark-400 text-sm">Select your preferred entry package (can be adjusted after consultation):</p>
              {PACKAGES.map((pkg) => (
                <label key={pkg.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  data.selectedPackage === pkg.id
                    ? 'border-gold-500/60 bg-gold-500/5'
                    : 'border-dark-700 hover:border-dark-600'
                }`}>
                  <input
                    type="radio"
                    name="package"
                    value={pkg.id}
                    checked={data.selectedPackage === pkg.id}
                    onChange={update('selectedPackage')}
                    className="accent-gold-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{pkg.name}</span>
                      {pkg.highlight && <span className="text-xs bg-gold-500/20 text-gold-500 px-2 py-0.5 rounded-full">Popular</span>}
                    </div>
                    <div className="text-dark-400 text-sm">{pkg.machines} · {pkg.desc}</div>
                  </div>
                  <div className="font-serif text-xl font-bold text-gold-500">{pkg.price}</div>
                </label>
              ))}
              <div>
                <label className="label">Additional Notes or Questions</label>
                <textarea className="input-field min-h-[80px] resize-none" placeholder="Anything else you'd like us to know…" value={data.additionalInfo} onChange={update('additionalInfo')} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Name', data.name], ['Email', data.email], ['Phone', data.phone], ['Company', data.company || '—'],
                  ['Business Type', data.businessType || '—'], ['Location', data.location || '—'],
                  ['Budget', data.budget || '—'], ['Timeline', data.timeline || '—'],
                  ['Package', PACKAGES.find(p => p.id === data.selectedPackage)?.name || '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-dark-500 text-xs uppercase tracking-wider mb-0.5">{label}</div>
                    <div className="text-dark-200">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-gold-500/5 border border-gold-500/20 rounded-lg text-sm text-dark-400">
                By submitting, you agree to be contacted by our team within 24 hours. A customized proposal and quote will be prepared for you.
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="btn-secondary">← Previous</button>
          ) : (
            <Link href="/" className="btn-ghost">← Back to site</Link>
          )}
          {step < 5 ? (
            <button
              onClick={() => {
                if (step === 1 && (!data.name || !data.email)) { setError('Name and email are required'); return }
                setError('')
                setStep(s => s + 1)
              }}
              className="btn-primary"
            >
              Next →
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="btn-primary">
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
