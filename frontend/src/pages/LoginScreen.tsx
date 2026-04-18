import { useState, useCallback } from "react";
import { GoogleLogin } from "@react-oauth/google";

import { useAppStore } from "../store/useAppStore";
import { loginWithGoogle } from "../lib/api";

type GoogleCredentialResponse = {
  credential?: string;
};

export default function LoginScreen() {
  const { setAuth } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = useCallback(
    async (credentialResponse: GoogleCredentialResponse) => {
      if (!credentialResponse?.credential || isLoading) return;

      try {
        setError(null);
        setIsLoading(true);

        const { token, user } = await loginWithGoogle(
          credentialResponse.credential,
        );
        setAuth(token, user);
      } catch (err) {
        console.error("Google login failed:", err);
        setError("Login failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, setAuth],
  );

  const handleError = useCallback(() => {
    setError("Google authentication was cancelled or failed.");
  }, []);

  return (
    <div className="min-h-dvh dot-bg flex flex-col px-6 py-10 max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 mb-5">
           <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
        </div>

        <h1 className="text-3xl font-bold text-[var(--ink)] leading-tight">
          Lakshmi Didi
        </h1>

        <p className="mt-4 text-sm text-[var(--ink-soft)] max-w-[260px] leading-relaxed">
          Secure access to your personal finance companion
        </p>

        <div className="w-full mt-10 flex flex-col items-center">
          <div className="min-h-[44px] flex items-center justify-center">
            {!isLoading ? (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap={false}
                shape="pill"
                theme="outline"
                text="continue_with"
                size="large"
              />
            ) : (
              <div className="text-sm text-[var(--ink-soft)]">
                Signing you in...
              </div>
            )}
          </div>

          {error && (
            <p className="mt-4 text-sm text-center text-red-600 max-w-[280px]">
              {error}
            </p>
          )}
        </div>
      </div>

      <p className="text-[10px] text-[var(--ink-soft)] text-center opacity-60">
        Finance advice for educational purposes only
      </p>
    </div>
  );
}
