import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-ochre/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-green/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-2 lg:px-10 lg:py-24">

        {/* Left Content */}
        <div className="max-w-2xl">

          {/* Small Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ochre/20 bg-ochre/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-ochre" />
            <span className="text-xs font-bold uppercase tracking-wider text-navy">
              Learn. Teach. Grow.
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Find the right
            <span className="block text-navy">Ustaad.</span>
            Learn with
            <span className="block text-ochre">confidence.</span>
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-xl text-base leading-7 text-slate sm:text-lg">
            Ustaad.com connects students with skilled tutors who can help them
            learn, improve, and achieve their goals. Find the right expertise,
            choose what works for you, and start learning.
          </p>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">

            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy/10 transition duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              Find a Tutor

              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M13 6l6 6-6 6"
                />
              </svg>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-navy/20 bg-white px-6 py-3.5 text-sm font-bold text-navy transition duration-200 hover:-translate-y-0.5 hover:border-navy/40 hover:bg-navy/5"
            >
              Become a Ustaad
            </Link>

          </div>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 text-sm text-slate">

            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green/15 text-green">
                ✓
              </span>
              Verified Tutors
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green/15 text-green">
                ✓
              </span>
              Flexible Learning
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green/15 text-green">
                ✓
              </span>
              Secure Marketplace
            </div>

          </div>
        </div>

        {/* Right Visual */}
        <div className="relative mx-auto w-full max-w-xl lg:ml-auto">

          {/* Main Card */}
          <div className="relative rounded-3xl border border-slate/10 bg-white p-5 shadow-2xl shadow-navy/10 sm:p-7">

            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate/10 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                  Find your Ustaad
                </p>
                <h2 className="mt-1 text-lg font-bold text-ink">
                  Popular tutors
                </h2>
              </div>

              <div className="rounded-lg bg-green/10 px-3 py-2 text-xs font-bold text-green">
                1,000+ Tutors
              </div>
            </div>

            {/* Tutor Card 1 */}
            <div className="mt-5 rounded-2xl border border-slate/10 p-4 transition hover:shadow-md">
              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
                  AK
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-bold text-ink">
                      Ahmed Khan
                    </h3>

                    <span className="text-green">✓</span>
                  </div>

                  <p className="mt-1 text-sm text-slate">
                    Mathematics • Physics
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="font-bold text-ochre">★ 4.9</span>
                    <span className="text-slate">•</span>
                    <span className="text-slate">120+ students</span>
                  </div>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-xs text-slate">Starting from</p>
                  <p className="font-bold text-navy">
                    Rs. 1,500
                  </p>
                </div>

              </div>
            </div>

            {/* Tutor Card 2 */}
            <div className="mt-3 rounded-2xl border border-slate/10 p-4 transition hover:shadow-md">
              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ochre/20 text-lg font-bold text-navy">
                  SA
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-bold text-ink">
                      Sara Ahmed
                    </h3>

                    <span className="text-green">✓</span>
                  </div>

                  <p className="mt-1 text-sm text-slate">
                    English • IELTS
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="font-bold text-ochre">★ 4.8</span>
                    <span className="text-slate">•</span>
                    <span className="text-slate">85+ students</span>
                  </div>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-xs text-slate">Starting from</p>
                  <p className="font-bold text-navy">
                    Rs. 1,200
                  </p>
                </div>

              </div>
            </div>

            {/* Search CTA */}
            <Link
              href="/browse"
              className="mt-5 flex items-center justify-between rounded-xl bg-paper px-4 py-3.5 transition hover:bg-navy/5"
            >
              <span className="text-sm font-semibold text-navy">
                Explore all tutors
              </span>

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-white">
                →
              </span>
            </Link>

          </div>

          {/* Floating Stat */}
          <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-slate/10 bg-white p-4 shadow-xl sm:block lg:-left-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green/10 text-lg text-green">
                ✓
              </div>

              <div>
                <p className="text-xs text-slate">
                  Learning made simple
                </p>
                <p className="font-bold text-ink">
                  One platform. Two sides.
                </p>
              </div>
            </div>
          </div>

          {/* Floating Badge */}
          <div className="absolute -right-3 -top-5 hidden rounded-2xl border border-slate/10 bg-white px-4 py-3 shadow-xl sm:block lg:-right-6">
            <p className="text-xs text-slate">
              Trusted marketplace
            </p>
            <p className="mt-1 text-sm font-bold text-navy">
              Learn & Teach
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}