import Link from "next/link";

const studentSteps = [
  {
    number: "01",
    title: "Find a Tutor",
    description:
      "Search and browse tutors based on subject, expertise, ratings, and your learning needs.",
  },
  {
    number: "02",
    title: "Choose a Gig",
    description:
      "Explore tutoring services, compare offerings, and select the gig that fits your requirements.",
  },
  {
    number: "03",
    title: "Start Learning",
    description:
      "Connect with your tutor, discuss your requirements, and get personalized learning support.",
  },
];

const teacherSteps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Showcase your expertise, qualifications, subjects, experience, and teaching style.",
  },
  {
    number: "02",
    title: "Publish a Gig",
    description:
      "Create tutoring services with your pricing, description, delivery details, and requirements.",
  },
  {
    number: "03",
    title: "Teach & Earn",
    description:
      "Connect with students, complete orders, build your reputation, and earn from your expertise.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-slate/10 bg-paper"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24 lg:px-10">

        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">

          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-ochre" />

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-ochre">
              How It Works
            </span>

            <span className="h-px w-8 bg-ochre" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Simple for everyone.
            <span className="block text-navy">
              Powerful for learning.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate sm:text-lg">
            Ustaad makes it simple for students to find expertise and for
            teachers to turn their knowledge into opportunities.
          </p>

        </div>

        {/* Student Side */}
        <div className="mt-16">

          <div className="mb-7 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-lg font-bold text-white">
              S
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ochre">
                For Students
              </p>

              <h3 className="text-xl font-bold text-ink">
                Your learning journey
              </h3>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {studentSteps.map((step, index) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-slate/10 bg-white p-6"
              >
                {/* Connector */}
                {index < studentSteps.length - 1 && (
                  <div className="absolute right-[-20px] top-12 z-10 hidden w-10 items-center justify-center md:flex">
                    <span className="text-lg text-ochre">→</span>
                  </div>
                )}

                <span className="text-sm font-bold text-ochre">
                  {step.number}
                </span>

                <h4 className="mt-6 text-lg font-bold text-ink">
                  {step.title}
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* Teacher Side */}
        <div
          id="become-ustaad"
          className="mt-16 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate/10 sm:p-8 lg:p-10"
        >

          <div className="mb-7 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ochre text-lg font-bold text-navy">
              U
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ochre">
                For Ustaads
              </p>

              <h3 className="text-xl font-bold text-ink">
                Turn your knowledge into opportunity
              </h3>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {teacherSteps.map((step, index) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-slate/10 bg-paper p-6"
              >
                {/* Connector */}
                {index < teacherSteps.length - 1 && (
                  <div className="absolute right-[-20px] top-12 z-10 hidden w-10 items-center justify-center md:flex">
                    <span className="text-lg text-ochre">→</span>
                  </div>
                )}

                <span className="text-sm font-bold text-ochre">
                  {step.number}
                </span>

                <h4 className="mt-6 text-lg font-bold text-ink">
                  {step.title}
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-start justify-between gap-5 border-t border-slate/10 pt-7 sm:flex-row sm:items-center">

            <div>
              <p className="font-bold text-ink">
                Ready to share what you know?
              </p>

              <p className="mt-1 text-sm text-slate">
                Create your Ustaad profile and start connecting with students.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Become a Ustaad
              <span>→</span>
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}