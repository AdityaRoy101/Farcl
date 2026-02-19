import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore, selectToken } from "../../stores/auth";
import Galaxy from "../../components/background/Galaxy/Galaxy";
import { USER_ONBOARDING_COMPLETE_MUTATION } from "../../lib/graphql/mutations/UserOnboardingComplete/UserOnboardingComplete";
import { REFRESH_MUTATION } from "../../lib/graphql/mutations/Refresh/Refresh";

type OrgType = "STUDENT" | "PERSONAL" | "BUSINESS";

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;

const ORG_TYPE_LABELS: Record<OrgType, string> = {
  STUDENT: "Student",
  PERSONAL: "Personal",
  BUSINESS: "Business",
};

/**
 * OnboardingCard - Completes user onboarding for default tenant
 */
export default function OnboardingCard() {
  const [orgType, setOrgType] = useState<OrgType>("STUDENT");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Zustand store
  const token = useAuthStore(selectToken);
  const logout = useAuthStore((state) => state.logout);
  const updateTokens = useAuthStore((state) => state.updateTokens);

  const handleContinue = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      // Step 1: Complete onboarding
      const onboardingRes = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: USER_ONBOARDING_COMPLETE_MUTATION,
          variables: {
            tenantName: name.trim(),
            tenantType: orgType,
          },
        }),
      });

      const onboardingJson = await onboardingRes.json();
      const onboardingErrors = onboardingJson.body?.singleResult?.errors || onboardingJson.errors;

      if (onboardingErrors && onboardingErrors.length > 0) {
        throw new Error(onboardingErrors[0].message || "Onboarding failed");
      }

      const onboardingRaw = onboardingJson.body?.singleResult?.data?.userOnboardingComplete
        || onboardingJson.data?.userOnboardingComplete;

      if (!onboardingRaw || (typeof onboardingRaw === "string" && !onboardingRaw.toLowerCase().includes("success"))) {
        throw new Error("Onboarding failed: no response from server");
      }

      // Step 2: Refresh tokens
      const currentRefreshToken = localStorage.getItem("refreshToken");

      if (!currentRefreshToken) {
        throw new Error("No refresh token found. Please login again.");
      }

      const refreshRes = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentRefreshToken}`,
        },
        body: JSON.stringify({
          query: REFRESH_MUTATION,
        }),
      });

      const refreshJson = await refreshRes.json();
      const refreshErrors = refreshJson.body?.singleResult?.errors || refreshJson.errors;

      if (refreshErrors && refreshErrors.length > 0) {
        throw new Error(refreshErrors[0].message || "Token refresh failed");
      }

      const refreshData = refreshJson.body?.singleResult?.data?.refresh || refreshJson.data?.refresh;

      if (!refreshData?.success || !refreshData?.data) {
        throw new Error("Token refresh failed");
      }

      const { accessToken, refreshToken: newRefreshToken } = refreshData.data;

      if (!accessToken || !newRefreshToken) {
        throw new Error("Token refresh failed: tokens missing");
      }

      // Step 3: Update tokens in store
      updateTokens(accessToken, newRefreshToken);

      // Step 4: Navigate to dashboard
      navigate("/explore", { replace: true });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during onboarding";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  const label = orgType === "BUSINESS"
    ? "What's your organisation name?"
    : "What's your project name?";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Galaxy
          density={1.2}
          glowIntensity={0.4}
          saturation={0.6}
          hueShift={200}
          mouseInteraction={true}
          transparent={true}
        />
      </div>

      <div className="w-full max-w-xl bg-white/100 backdrop-blur-sm rounded-3xl shadow-2xl border p-8 md:p-10 relative z-10">
        <h1 className="text-xl md:text-2xl font-semibold mb-2">Complete your profile</h1>
        <p className="text-sm text-muted-foreground mb-6">You can change these later in settings.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-md font-medium mb-2">What's your organisation type?</label>
          <div className="inline-flex rounded-full border bg-muted/50 p-1 gap-1">
            {(["STUDENT", "PERSONAL", "BUSINESS"] as OrgType[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setOrgType(opt)}
                disabled={isLoading}
                className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 ${orgType === opt
                    ? "bg-black text-white shadow-md"
                    : "bg-transparent text-muted-foreground hover:bg-white hover:shadow-sm"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {ORG_TYPE_LABELS[opt]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">{label}</label>
          <input
            type="text"
            className="w-full h-11 rounded-xl border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            placeholder={orgType === "BUSINESS" ? "Ex: Acme Inc" : "Ex: My Cool Project"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!name.trim() || isLoading}
            className="flex-1 h-11 rounded-full bg-black text-white text-sm font-medium hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              "Continue"
            )}
          </button>
          <button
            type="button"
            onClick={handleGoBack}
            disabled={isLoading}
            className="flex-1 h-11 rounded-full border text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}