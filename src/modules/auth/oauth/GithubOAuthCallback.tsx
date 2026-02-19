import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 

import { useAuthStore } from "../../../stores/auth";
import { GITHUB_SIGNUP_LOGIN_MUTATION } from "../../../lib/graphql/mutations/GithubSignupLogin/GithubSignupLogin";

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;
const DEFAULT_TID = import.meta.env.VITE_DEFAULT_TENANT_ID;

interface DecodedToken {
  tid?: string;
  exp: number;
}

/**
 * GitHubOAuthCallback - Handles GitHub Authorization Code Flow callback
 */
export default function GitHubOAuthCallback() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Finishing GitHub login…");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
       const rawState = params.get("state")
      const err = params.get("error");
      const errorDescription = params.get("error_description");

            let parsedState: any = null;

      if (rawState) {
        try {
          parsedState = JSON.parse(decodeURIComponent(rawState));
        } catch {
          parsedState = null;
        }
      }

      console.log("GitHub OAuth State:", parsedState);

      if (code || err) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }

      if (err) {
        setError(errorDescription || err);
        setTimeout(() => navigate("/auth", { replace: true }), 2000);
        return;
      }

      if (!code) {
        setError("Missing authorization code from GitHub");
        setTimeout(() => navigate("/auth", { replace: true }), 2000);
        return;
      }

       if (
        parsedState?.flow === "github_connect" &&
        parsedState?.redirectTo === "/deploy"
      ) {
        console.log("Forwarding GitHub connect flow to /deploy");

        navigate(
          `/deploy?code=${code}&state=${encodeURIComponent(rawState!)}`,
          { replace: true }
        );
        return;
      }

      try {
        setStatus("Authenticating with server...");

        const res = await fetch(GRAPHQL_URL, {method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: GITHUB_SIGNUP_LOGIN_MUTATION,
            variables: { code },
          }),
        });

        const json = await res.json();
        const errors = json.body?.singleResult?.errors || json.errors;
        
        if (errors?.length) {
          throw new Error(errors[0].message || "GitHub login failed");
        }

        const raw =
          json.body?.singleResult?.data?.githubSignupOrLogin ||
          json.data?.githubSignupOrLogin;
        
        if (!raw) {
          throw new Error("GitHub login failed: no response from server");
        }

        const loginResult = typeof raw === "string" ? JSON.parse(raw) : raw;
        
        if (loginResult.success === false) {
          throw new Error(loginResult.error || "GitHub login failed");
        }

        const accessToken =
          loginResult.data?.accessToken || loginResult.accessToken;
        const refreshToken =
          loginResult.data?.refreshToken || loginResult.refreshToken;

        if (!accessToken) {
          throw new Error("GitHub login failed: token missing");
        }

        const decoded: DecodedToken = jwtDecode(accessToken);
        const userFromApi = loginResult.data?.user || loginResult.user;

        login(
          accessToken,
          {
            id: userFromApi?.id || "",
            name: userFromApi?.name || "",
            email: userFromApi?.email || "",
            is_super_admin: false,
            orgName: null,
            profileCompleted: false,
            profileImage: userFromApi?.profileImage || "", // ✅
          },
          refreshToken
        );

        navigate(decoded.tid === DEFAULT_TID ? "/onboarding" : "/explore", {
          replace: true,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "GitHub login failed";
        setError(msg);
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