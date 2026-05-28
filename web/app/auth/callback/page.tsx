"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

// Magic-link landing. supabase-js (detectSessionInUrl) parses the token from
// the URL hash and establishes the session, then we bounce to /dashboard.
export default function AuthCallback() {
  const [err, setErr] = useState("");

  useEffect(() => {
    const sb = supabaseBrowser();
    let done = false;

    // detectSessionInUrl runs automatically; we just wait for the session.
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (session && !done) {
        done = true;
        window.location.replace("/dashboard");
      }
    });

    // Fallback: check immediately in case the event already fired.
    sb.auth.getSession().then(({ data }) => {
      if (data.session && !done) {
        done = true;
        window.location.replace("/dashboard");
      }
    });

    // If nothing after 6s, surface an error.
    const timer = setTimeout(() => {
      if (!done) setErr("Sign-in link expired or invalid. Try requesting a new one.");
    }, 6000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div className="mono" style={{ fontSize: 13, color: err ? "var(--danger, #e0726a)" : "var(--fg-2)" }}>
        {err || "Signing you in…"}
        {err && (
          <div style={{ marginTop: 12 }}>
            <a href="/login" style={{ color: "var(--accent)" }}>← back to sign in</a>
          </div>
        )}
      </div>
    </main>
  );
}
