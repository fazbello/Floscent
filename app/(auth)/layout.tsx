import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gold-600/8 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-serif text-2xl font-bold text-gold-500 tracking-widest">FLOSCENT</span>
          </Link>
          <div>
            <blockquote className="font-serif text-3xl text-white font-medium leading-relaxed mb-6">
              &ldquo;The world&apos;s first luxury perfume vending machine. Passive income, elevated.&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-serif font-bold">F</div>
              <div>
                <div className="text-white font-medium text-sm">Floscent Partner Portal</div>
                <div className="text-dark-500 text-xs">Developed in Europe</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[['$2,400+', 'Avg Monthly Revenue'], ['78%', 'Profit Margin'], ['18mo', 'Avg ROI']].map(([v, l]) => (
              <div key={l} className="bg-dark-800/50 rounded-lg p-4">
                <div className="font-serif text-xl font-bold text-gold-500">{v}</div>
                <div className="text-dark-500 text-xs mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="font-serif text-2xl font-bold text-gold-500 tracking-widest">FLOSCENT</Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
