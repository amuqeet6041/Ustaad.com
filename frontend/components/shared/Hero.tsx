import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0D172B] text-white">
      {/* Premium background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#B5651D]/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-[#14213D] blur-[100px]" />
        <div className="absolute -bottom-60 left-1/3 h-[450px] w-[450px] rounded-full bg-[#B5651D]/5 blur-[120px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* LEFT CONTENT */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#B5651D]" />
              Learn. Teach. Grow.
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Find the right{" "}
              <span className="text-[#D18A4A]">Ustaad.</span>
              <br />
              Learn with confidence.
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
              Connect with skilled tutors, discover the right learning
              opportunities, and build skills that actually move you forward.
            </p>

            {/* CTA Buttons */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center rounded-lg bg-[#B5651D] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-[#9E581C] hover:-translate-y-0.5"
              >
                Find a Tutor
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.05] px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Become a Ustaad
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/55">
              <div className="flex items-center gap-2">
                <span className="text-[#D18A4A]">✓</span>
                Verified Tutors
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#D18A4A]">✓</span>
                Flexible Learning
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#D18A4A]">✓</span>
                Secure Marketplace
              </div>
            </div>
          </div>

          {/* RIGHT MARKETPLACE PREVIEW */}
          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            {/* Glow behind card */}
            <div className="absolute inset-10 rounded-full bg-[#B5651D]/10 blur-[80px]" />

            {/* Main dashboard card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              {/* Card header */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/45">
                    Recommended for you
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white">
                    Top Ustaads
                  </h3>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/60">
                  View all
                </div>
              </div>

              {/* Tutor 1 */}
              <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.09]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#14213D] text-sm font-bold text-white">
                    AK
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-sm font-bold text-white">
                        Ahmed Khan
                      </h4>
                      <span className="rounded-full bg-[#3A5A40]/30 px-2 py-0.5 text-[10px] font-semibold text-green-300">
                        Verified
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-white/45">
                      Mathematics • Python • Data Science
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-white">Rs. 1,500</p>
                    <p className="text-[10px] text-white/40">/ session</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-[#D18A4A]">★★★★★ 4.9</span>
                  <span className="text-white/40">120+ sessions</span>
                </div>
              </div>

              {/* Tutor 2 */}
              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B5651D] text-sm font-bold text-white">
                    SA
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-sm font-bold text-white">
                        Sara Ahmed
                      </h4>
                      <span className="rounded-full bg-[#3A5A40]/30 px-2 py-0.5 text-[10px] font-semibold text-green-300">
                        Verified
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-white/45">
                      English • IELTS • Communication
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-white">Rs. 1,200</p>
                    <p className="text-[10px] text-white/40">/ session</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-[#D18A4A]">★★★★★ 4.8</span>
                  <span className="text-white/40">85+ sessions</span>
                </div>
              </div>

              {/* Bottom card status */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#B5651D]/20 bg-[#B5651D]/10 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-white">
                    Find your perfect match
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/45">
                    Based on your skills & goals
                  </p>
                </div>

                <span className="text-[#D18A4A]">✦</span>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-white/10 bg-[#18243A]/90 px-4 py-3 shadow-xl backdrop-blur-md sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3A5A40]/30 text-green-300">
                  ✓
                </div>

                <div>
                  <p className="text-xs font-bold text-white">
                    Verified learning
                  </p>
                  <p className="text-[10px] text-white/40">
                    Trusted Ustaads
                  </p>
                </div>
              </div>
            </div>

            {/* Floating match badge */}
            <div className="absolute -right-4 top-12 hidden rounded-xl border border-white/10 bg-[#18243A]/90 px-4 py-3 shadow-xl backdrop-blur-md sm:block">
              <p className="text-[10px] text-white/40">Match score</p>
              <p className="mt-0.5 text-lg font-bold text-[#D18A4A]">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade into light sections */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F8FAFC]/20 to-transparent pointer-events-none" />
    </section>
  );
}