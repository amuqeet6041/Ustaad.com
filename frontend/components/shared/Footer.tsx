import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">

        {/* Main Footer */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div className="max-w-sm">

            <Link
              href="/"
              className="inline-flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-bold text-navy">
                U
              </div>

              <span className="text-2xl font-extrabold tracking-tight">
                Ustaad<span className="text-ochre">.</span>
              </span>
            </Link>

            <p className="mt-5 text-sm leading-6 text-white/65">
              A marketplace where students find the right expertise and
              Ustaads turn their knowledge into opportunity.
            </p>

            {/* Social */}
            <div className="mt-6 flex gap-3">

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                f
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                ◎
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                in
              </a>

            </div>

          </div>

          {/* For Students */}
          <div>
            <h3 className="text-sm font-bold text-white">
              For Students
            </h3>

            <ul className="mt-5 space-y-3">

              <li>
                <Link
                  href="/tutors"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  Find an Ustaad
                </Link>
              </li>

              <li>
                <Link
                  href="/browse"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  Browse Marketplace
                </Link>
              </li>

              <li>
                <Link
                  href="/register"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  Create Account
                </Link>
              </li>

              <li>
                <Link
                  href="/student-dashboard/overview"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  Student Dashboard
                </Link>
              </li>

            </ul>
          </div>

          {/* For Ustaads */}
          <div>
            <h3 className="text-sm font-bold text-white">
              For Ustaads
            </h3>

            <ul className="mt-5 space-y-3">

              <li>
                <Link
                  href="/register/teacher"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  Become a Ustaad
                </Link>
              </li>

              <li>
                <Link
                  href="/register/teacher"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  Create Your Profile
                </Link>
              </li>

              <li>
                <Link
                  href="/register/teacher"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  Publish a Gig
                </Link>
              </li>

              <li>
                <Link
                  href="/teacher-dashboard/overview"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  Ustaad Dashboard
                </Link>
              </li>

            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-bold text-white">
              Platform
            </h3>

            <ul className="mt-5 space-y-3">

              <li>
                <a
                  href="/#features"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="/#how-it-works"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  How It Works
                </a>
              </li>

              <li>
                <Link
                  href="/login"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  Log In
                </Link>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  Contact
                </a>
              </li>

            </ul>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-white/5 px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-lg font-bold">
                Ready to get started?
              </p>

              <p className="mt-1 text-sm text-white/60">
                Find your next Ustaad or start teaching what you know.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <Link
                href="/register/student"
                className="rounded-lg bg-white px-5 py-2.5 text-center text-sm font-bold text-navy transition hover:bg-white/90"
              >
                Find a Tutor
              </Link>

              <Link
                href="/register/teacher"
                className="rounded-lg border border-white/20 px-5 py-2.5 text-center text-sm font-bold text-white transition hover:bg-white/10"
              >
                Become a Ustaad
              </Link>

            </div>

          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-7 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © 2026 Ustaad.com. All rights reserved.
          </p>

          <div className="flex gap-5">
            <a
              href="#"
              className="transition hover:text-white"
            >
              Privacy
            </a>

            <a
              href="#"
              className="transition hover:text-white"
            >
              Terms
            </a>

            <a
              href="#"
              className="transition hover:text-white"
            >
              Help
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
}