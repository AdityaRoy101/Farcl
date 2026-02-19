import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { useAuthStore } from "../../../stores/auth";
import { GOOGLE_SIGNUP_LOGIN_MUTATION } from "../../../lib/graphql/mutations/GoogleSignupLogin/GoogleSignupLogin";

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;
const DEFAULT_TID = import.meta.env.VITE_DEFAULT_TENANT_ID;

interface DecodedToken {
  tid?: string;
  exp: number;
}

/**
 * GoogleOAuthCallback - Handles Google Implicit Flow callback
 */
export default function GoogleOAuthCallback() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Finishing Google login…");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      const idToken = hashParams.get("id_token");
      const err = hashParams.get("error") || queryParams.get("error");
      const errorDescription = hashParams.get("error_description") || queryParams.get("error_description");

      if (idToken || err) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (err) {
        setError(errorDescription || err);
        setTimeout(() => navigate("/auth", { replace: true }), 2000);
        return;
      }

      if (!idToken) {
        setError("Missing ID token from Google");
        setTimeout(() => navigate("/auth", { replace: true }), 2000);
        return;
      }

      try {
        setStatus("Authenticating with server...");

        const res = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: GOOGLE_SIGNUP_LOGIN_MUTATION,
            variables: { idToken },
          }),
        });

        const json = await res.json();
        const errors = json.body?.singleResult?.errors || json.errors;
        
        if (errors && errors.length > 0) {
          throw new Error(errors[0].message || "Google login failed");
        }

        const raw = json.body?.singleResult?.data?.googleSignupOrLogin || json.data?.googleSignupOrLogin;
        
        if (!raw) {
          throw new Error("Google login failed: no response from server");
        }

        const loginResult = typeof raw === "string" ? JSON.parse(raw) : raw;
        
        if (loginResult.success === false) {
          throw new Error(loginResult.error || "Google login failed");
        }

        const accessToken = loginResult.data?.accessToken || loginResult.accessToken;
        const refreshToken = loginResult.data?.refreshToken || loginResult.refreshToken;

        if (!accessToken || typeof accessToken !== "string") {
          throw new Error("Google login failed: token missing");
        }

        const decoded: DecodedToken = jwtDecode(accessToken);
        const userFromApi = loginResult.data?.user || loginResult.user;

        const userData = {
          id: userFromApi?.id || "",
          name: userFromApi?.name || "",
          email: userFromApi?.email || "",
          is_super_admin: false,
          orgName: null,
          profileCompleted: false,
          profileImage: userFromApi?.profileImage || "", // ✅
        };

        login(accessToken, userData, refreshToken);
        navigate(decoded.tid === DEFAULT_TID ? "/onboarding" : "/explore", { replace: true });
        
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Google login failed";
        setError(errorMessage);
        setTimeout(() => navigate("/auth", { replace: true }), 3000);
      }
    };

    run();
  }, [login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-500 text-sm text-center max-w-md">{error}</p>
        <p className="text-xs text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
    
    {/* Loader */}
    <div
      className="loader text-primary"
      role="status"
      aria-label="Loading"
    />

    {/* Status message */}
    <p className="text-sm text-muted-foreground text-center">
      {status}
    </p>
  </div>
);
}