import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "../../../lib/cn";
import styles from "./GoogleSignIn.module.css";

export const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

interface GoogleIdentity {
  initialize(config: { client_id: string; callback: (response: { credential?: string }) => void }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: "outline" | "filled_black";
      size: "large";
      text: "signin_with" | "signup_with" | "continue_with";
      shape: "rectangular";
      logo_alignment: "center";
      width: number;
    },
  ): void;
}

type GoogleWindow = Window & { google?: { accounts?: { id?: GoogleIdentity } } };

let loading: Promise<GoogleIdentity> | null = null;
let initializedFor: string | null = null;
let deliver: ((credential: string) => void) | null = null;

function loadGoogleIdentity(): Promise<GoogleIdentity> {
  const ready = () => (window as GoogleWindow).google?.accounts?.id;
  const loaded = ready();
  if (loaded) return Promise.resolve(loaded);
  loading ??= new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      const id = ready();
      if (id) resolve(id);
      else reject(new Error("Google's sign-in script loaded without google.accounts.id"));
    };
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Google's sign-in script did not load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const documentTheme = () => (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
const serverTheme = () => "light" as const;

export interface GoogleSignInProps {
  /** The OAuth client ID. Its authorised JavaScript origins must list this page's origin. */
  clientId: string;
  /** Receives Google's ID token, for user-svc's POST /user/oauth as id_token. */
  onCredential: (credential: string) => void;
  /** Google's wording on the button. */
  text?: "signin" | "signup" | "continue";
  /** Called when Google's script cannot load, as when a blocker stops it; the button is then not shown. */
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * Google's own sign-in button, drawn by Google's script in light or dark to follow `<html data-theme>`.
 * Google keeps one callback per page, so render one at a time.
 */
export function GoogleSignIn({ clientId, onCredential, text = "signin", onError, className }: GoogleSignInProps) {
  const slot = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onCredential, onError });
  const theme = useSyncExternalStore(subscribeTheme, documentTheme, serverTheme);
  const [width, setWidth] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    handlers.current = { onCredential, onError };
  });

  useEffect(() => {
    const el = slot.current;
    if (!el) return;
    const measure = () => setWidth(Math.round(el.clientWidth));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const own = (credential: string) => handlers.current.onCredential(credential);
    deliver = own;
    return () => {
      if (deliver === own) deliver = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadGoogleIdentity().then(
      (id) => {
        const el = slot.current;
        if (cancelled || !el) return;
        if (initializedFor !== clientId) {
          id.initialize({ client_id: clientId, callback: (response) => response.credential && deliver?.(response.credential) });
          initializedFor = clientId;
        }
        el.replaceChildren();
        id.renderButton(el, {
          type: "standard",
          theme: theme === "dark" ? "filled_black" : "outline",
          size: "large",
          text: `${text}_with`,
          shape: "rectangular",
          logo_alignment: "center",
          // Google draws 200 to 400px wide; jsdom and a hidden parent measure 0.
          width: Math.min(400, Math.max(200, width || 400)),
        });
      },
      (error: Error) => {
        if (cancelled) return;
        setFailed(true);
        handlers.current.onError?.(error);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [clientId, text, theme, width]);

  if (failed) return null;
  return <div ref={slot} className={cn(styles.slot, className)} />;
}
