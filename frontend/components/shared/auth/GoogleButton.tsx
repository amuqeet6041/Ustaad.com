interface GoogleButtonProps {
  label?: string;
  onComingSoon?: (message: string) => void;
}

export default function GoogleButton({ label = "Continue with Google", onComingSoon }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onComingSoon?.("Google Sign-In is coming soon.")}
      className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08]"
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.276c0-.815-.073-1.6-.21-2.352H12v4.448h6.458a5.29 5.29 0 0 1-2.295 3.47v2.886h3.718c2.175-2.002 3.44-4.957 3.44-8.452Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.956-1.075 7.942-2.907l-3.718-2.886c-1.03.69-2.347 1.098-4.224 1.098-3.25 0-6.002-2.196-6.985-5.146H1.18v2.98A12.47 12.47 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.015 14.16a7.5 7.5 0 0 1 0-4.318V6.86H1.18a12.51 12.51 0 0 0 0 11.28l3.835-2.98Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.695c1.762 0 3.344.607 4.587 1.795l3.443-3.443A11.97 11.97 0 0 0 12 0 12.47 12.47 0 0 0 1.18 6.861l3.835 2.981C5.998 6.89 8.75 4.695 12 4.695Z"
      />
    </svg>
  );
}