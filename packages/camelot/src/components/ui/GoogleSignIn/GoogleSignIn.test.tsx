import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleSignIn } from "./GoogleSignIn";

type Callback = (response: { credential?: string }) => void;

let id: { initialize: ReturnType<typeof vi.fn>; renderButton: ReturnType<typeof vi.fn> };

beforeEach(() => {
  id = { initialize: vi.fn(), renderButton: vi.fn() };
  (window as unknown as { google: unknown }).google = { accounts: { id } };
});

afterEach(() => {
  delete (window as unknown as { google?: unknown }).google;
  document.documentElement.removeAttribute("data-theme");
});

const lastButton = () => id.renderButton.mock.lastCall?.[1] as { theme: string; text: string; width: number };

describe("GoogleSignIn", () => {
  it("initialises Google once per client and draws the button in the light theme", async () => {
    render(<GoogleSignIn clientId="client-a.apps.googleusercontent.com" onCredential={() => {}} text="signup" />);
    await waitFor(() => expect(id.renderButton).toHaveBeenCalled());
    expect(id.initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: "client-a.apps.googleusercontent.com" }));
    expect(lastButton()).toMatchObject({ theme: "outline", text: "signup_with", width: 400 });
  });

  it("hands Google's credential to the mounted button", async () => {
    const onCredential = vi.fn();
    render(<GoogleSignIn clientId="client-b.apps.googleusercontent.com" onCredential={onCredential} />);
    await waitFor(() => expect(id.initialize).toHaveBeenCalled());
    const callback = id.initialize.mock.lastCall?.[0].callback as Callback;
    callback({ credential: "eyJhbGciOiJSUzI1NiJ9.e30.sig" });
    callback({});
    expect(onCredential).toHaveBeenCalledTimes(1);
    expect(onCredential).toHaveBeenCalledWith("eyJhbGciOiJSUzI1NiJ9.e30.sig");
  });

  it("redraws the button dark when the page turns dark", async () => {
    render(<GoogleSignIn clientId="client-c.apps.googleusercontent.com" onCredential={() => {}} />);
    await waitFor(() => expect(lastButton()?.theme).toBe("outline"));
    await act(async () => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await waitFor(() => expect(lastButton().theme).toBe("filled_black"));
  });

  it("reports a script that never loads and shows nothing", async () => {
    delete (window as unknown as { google?: unknown }).google;
    const onError = vi.fn();
    const { container } = render(<GoogleSignIn clientId="client-d.apps.googleusercontent.com" onCredential={() => {}} onError={onError} />);
    const script = document.head.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    expect(script).toBeTruthy();
    await act(async () => {
      script?.dispatchEvent(new Event("error"));
    });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(container.firstChild).toBeNull();
    expect(document.head.querySelector('script[src="https://accounts.google.com/gsi/client"]')).toBeNull();
  });
});
