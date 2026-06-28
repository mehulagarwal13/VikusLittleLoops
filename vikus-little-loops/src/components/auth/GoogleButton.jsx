import { useEffect, useRef } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Renders the official Google Identity Services button.
// Hidden gracefully if VITE_GOOGLE_CLIENT_ID isn't configured yet.
export default function GoogleButton({ onCredential }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (resp) => onCredential(resp.credential),
    });
    if (ref.current) {
      window.google.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 300,
        text: "continue_with",
      });
    }
  }, [onCredential]);

  if (!CLIENT_ID) {
    return (
      <p className="text-center text-xs text-warmgray">
        Google sign-in not configured yet — set <code>VITE_GOOGLE_CLIENT_ID</code>.
      </p>
    );
  }

  return <div ref={ref} className="flex justify-center" />;
}
