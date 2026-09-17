import Link from "next/link";

const roles = [
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="m20 20-4-4" />
      </svg>
    ),
    label: "Join as a Student",
    description:
      "Find skilled Ustaads and learn the skills that matter to you.",
    href: "/register/student",
    cta: "Create Student Account",
  },
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </svg>
    ),
    label: "Join as a Ustaad",
    description:
      "Share your expertise, create gigs, and earn from your skills.",
    href: "/register/teacher",
    cta: "Create Ustaad Account",
  },
];

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0D172B] px-5 py-12 text-white sm:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#B5651D]/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-[#14213D] blur-[110px]" />
        <div className="absolute -bottom-60 left-1/3 h-[450px] w-[450px] rounded-full bg-[#B5651D]/5 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <Link href="/" className="flex items-center gap-2.5 self-start" aria-label="Ustaad home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213D] text-xl font-bold text-white ring-1 ring-white/10">
            U
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            Ustaad<span className="text-[#D18A4A]">.</span>
          </span>
        </Link>

        <div className="flex flex-1 flex-col items-center justify-center py-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#B5651D]" />
            Get started
          </div>

          <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Create your Ustaad account
          </h1>
          <p className="mt-4 text-center text-base text-white/60">
            Choose how you want to use Ustaad.
          </p>

          <div className="mt-10 grid w-full gap-5 sm:grid-cols-2">
            {roles.map((role) => (
              <div
                key={role.label}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#B5651D]/30 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-black/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14213D] p-3 text-[#D18A4A]">
                  {role.icon}
                </div>

                <h2 className="mt-5 text-xl font-bold text-white">
                  {role.label}
                </h2>

                <p className="mt-2 flex-1 text-sm leading-6 text-white/60">
                  {role.description}
                </p>

                <Link
                  href={role.href}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#B5651D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#9E581C] group-hover:-translate-y-0.5"
                >
                  {role.cta}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-9 text-sm text-white/60">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#D18A4A] transition hover:text-[#E5A15F]">
              Login
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ustaad.com. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="transition hover:text-white/80">Privacy</a>
            <a href="#" className="transition hover:text-white/80">Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
}