import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0D172B] text-white">
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

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-8 sm:px-8 lg:py-12">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2.5 self-start lg:hidden"
          aria-label="Ustaad home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213D] text-xl font-bold text-white ring-1 ring-white/10">
            U
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            Ustaad<span className="text-[#D18A4A]">.</span>
          </span>
        </Link>

        <div className="grid flex-1 items-start gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative hidden lg:block">
            <div className="absolute -inset-8 -z-10 rounded-full bg-[#B5651D]/10 blur-[90px]" />

            <Link href="/" className="flex items-center gap-2.5" aria-label="Ustaad home">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14213D] text-xl font-bold text-white ring-1 ring-white/10">
                U
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                Ustaad<span className="text-[#D18A4A]">.</span>
              </span>
            </Link>

            <h1 className="mt-10 text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl">
              Learn with{" "}
              <span className="text-[#D18A4A]">confidence.</span>
              <br />
              Teach with purpose.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-white/60">
              Ustaad brings students and tutors together in one marketplace
              built around skills, expertise, and meaningful learning.
            </p>

            <div className="mt-10 flex flex-col gap-3 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[#D18A4A]">
                  ✓
                </div>
                Verified tutors
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[#D18A4A]">
                  ✓
                </div>
                Trusted marketplace
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[#D18A4A]">
                  ✓
                </div>
                Flexible learning
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ustaad.com. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="transition hover:text-white/80">
              Privacy
            </a>
            <a href="#" className="transition hover:text-white/80">
              Terms
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}