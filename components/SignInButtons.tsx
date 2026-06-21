"use client";

/**
 * Sign-in UI for Candor.
 *
 * IMPORTANT — this component renders the BUTTONS and the expected click
 * handlers, but does not ship a working OAuth flow by itself. Wiring real
 * Google / GitHub sign-in requires NextAuth.js (or a similar library) plus
 * registered OAuth apps. See `docs/AUTH_SETUP.md` for the exact steps and
 * the three lines you'll change once you have your own credentials.
 *
 * Until then, `onGoogleSignIn` / `onGithubSignIn` fall back to a console
 * warning so the buttons are visibly wired up but won't silently no-op.
 */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.55-1.84.87-3.06.87-2.36 0-4.36-1.59-5.07-3.73H.92v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.93 10.7a5.4 5.4 0 0 1 0-3.4V4.97H.92a9 9 0 0 0 0 8.06l3-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.64 8.64 0 0 0 9 0 9 9 0 0 0 .92 4.97l3 2.33C4.64 5.17 6.64 3.58 9 3.58z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55v-2.17c-3.2.7-3.87-1.39-3.87-1.39-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.74.4-1.26.72-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.46.12-3.05 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.83 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.35.78 1.04.78 2.1v3.12c0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

export function SignInButtons({ context = "in" }: { context?: "in" | "up" }) {
  const onGoogleSignIn = () => {
    // TODO(member-1 or member-2): replace with `signIn("google")` from next-auth/react
    console.warn(
      "[Candor] Google sign-in is not wired to a real provider yet. See docs/AUTH_SETUP.md."
    );
  };

  const onGithubSignIn = () => {
    // TODO(member-1 or member-2): replace with `signIn("github")` from next-auth/react
    console.warn(
      "[Candor] GitHub sign-in is not wired to a real provider yet. See docs/AUTH_SETUP.md."
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={onGoogleSignIn}
        className="flex items-center justify-center gap-3 w-full py-3 rounded-[10px] bg-paper text-text-on-paper font-medium text-sm hover:bg-paper-dim transition-colors border border-transparent"
      >
        <GoogleIcon />
        Continue with Google
      </button>
      <button
        onClick={onGithubSignIn}
        className="flex items-center justify-center gap-3 w-full py-3 rounded-[10px] bg-ink-raised text-text-primary font-medium text-sm hover:bg-graphite transition-colors border border-graphite"
      >
        <GithubIcon />
        Continue with GitHub
      </button>
      <p className="text-text-muted text-xs text-center mt-1">
        By signing {context === "up" ? "up" : "in"}, you agree this is practice —
        Candor never shares your answers with real recruiters.
      </p>
    </div>
  );
}
