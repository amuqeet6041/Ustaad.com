"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate/10 bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-xl font-bold text-white">
            U
          </div>

          <span className="text-2xl font-extrabold tracking-tight text-ink">
            Ustaad<span className="text-ochre">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/browse"
            className="text-sm font-medium text-slate transition hover:text-navy"
          >
            Find a Tutor
          </Link>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate transition hover:text-navy"
          >
            How It Works
          </a>

          <a
            href="#features"
            className="text-sm font-medium text-slate transition hover:text-navy"
          >
            Features
          </a>

          <a
            href="#become-ustaad"
            className="text-sm font-medium text-slate transition hover:text-navy"
          >
            Become a Ustaad
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy/5"
          >
            Log In
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate/20 text-navy transition hover:bg-navy/5 md:hidden"
        >
          {isOpen ? (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M6 18L18 6"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-slate/10 bg-paper md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-5 sm:px-8">

            <Link
              href="/browse"
              onClick={() => setIsOpen(false)}
              className="border-b border-slate/10 py-3.5 text-sm font-semibold text-ink"
            >
              Find a Tutor
            </Link>

            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="border-b border-slate/10 py-3.5 text-sm font-semibold text-ink"
            >
              How It Works
            </a>

            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="border-b border-slate/10 py-3.5 text-sm font-semibold text-ink"
            >
              Features
            </a>

            <a
              href="#become-ustaad"
              onClick={() => setIsOpen(false)}
              className="border-b border-slate/10 py-3.5 text-sm font-semibold text-ink"
            >
              Become a Ustaad
            </a>

            <div className="flex gap-3 pt-5">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg border border-navy px-4 py-3 text-center text-sm font-bold text-navy"
              >
                Log In
              </Link>

              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg bg-navy px-4 py-3 text-center text-sm font-bold text-white"
              >
                Get Started
              </Link>
            </div>

          </nav>
        </div>
      )}
    </header>
  );
}