const features = [
  {
    number: "01",
    title: "Find the Right Tutor",
    description:
      "Browse tutors by subject, expertise, ratings, availability, and learning needs. Find someone who matches the way you want to learn.",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="11" cy="11" r="7" />
        <path
          strokeLinecap="round"
          d="m20 20-4-4"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Learn Your Way",
    description:
      "Choose the tutoring service that fits your goals. Connect with your tutor, discuss your requirements, and get personalized learning support.",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Teach & Earn",
    description:
      "Are you an expert? Create your profile, publish tutoring gigs, connect with students, and turn your knowledge into an opportunity.",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v18"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 7.5c0-1.5-2-2.5-5-2.5s-5 1-5 3 2 3 5 3 5 1 5 3-2 3-5 3-5-1-5-2.5"
        />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="border-t border-slate/10 bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24 lg:px-10">

        {/* Section Heading */}
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-ochre" />

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-ochre">
              Why Ustaad
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Everything you need to
            <span className="text-navy"> learn and grow.</span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate sm:text-lg">
            Ustaad brings students and tutors together in one simple
            marketplace built around skills, expertise, and meaningful
            learning.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">

          {features.map((feature) => (
            <div
              key={feature.number}
              className="group relative overflow-hidden rounded-2xl border border-slate/10 bg-paper p-7 transition duration-300 hover:-translate-y-1 hover:border-navy/20 hover:shadow-xl hover:shadow-navy/5"
            >
              {/* Number */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ochre">
                  {feature.number}
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white transition duration-300 group-hover:scale-105">
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="mt-8 text-xl font-bold text-ink">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate">
                {feature.description}
              </p>

              {/* Bottom Accent */}
              <div className="mt-7 flex items-center gap-2 text-sm font-bold text-navy">
                Learn more

                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </div>

              {/* Decorative Number */}
              <span className="pointer-events-none absolute -bottom-8 -right-2 text-8xl font-black text-navy/[0.03]">
                {feature.number}
              </span>
            </div>
          ))}

        </div>

        {/* Bottom Marketplace Statement */}
        <div className="mt-16 overflow-hidden rounded-2xl bg-navy">
          <div className="grid items-center gap-8 px-7 py-9 sm:px-10 md:grid-cols-[1fr_auto] md:py-10">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ochre">
                One marketplace
              </p>

              <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Skills meet opportunity.
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Whether you are looking for someone to teach you or you have
                something valuable to teach, Ustaad gives both sides a place
                to connect.
              </p>
            </div>

            <div className="flex items-center gap-2">

              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg font-bold text-white">
                S
              </div>

              <div className="-ml-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-ochre text-lg font-bold text-navy">
                U
              </div>

              <div className="-ml-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-green text-lg font-bold text-white">
                +
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}