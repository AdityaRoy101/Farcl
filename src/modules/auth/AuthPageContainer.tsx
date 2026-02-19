import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Cloud, Zap, Shield } from "lucide-react";

import { useAuthStore, selectUser } from "../../stores/auth";
import AuthForm from "./AuthForm";
import { BrandingPanel } from "./BrandingPanel";

// Constants
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;
const DEFAULT_TID = import.meta.env.VITE_DEFAULT_TENANT_ID;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

// Types
interface DecodedToken {
  exp: number;
  sub?: string;
  userId?: string;
  name?: string;
  email?: string;
  isAdmin?: boolean;
  type?: string;
  tid?: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  bio: string;
  location: string;
}

// Static Data
const FEATURES = [
  { icon: Cloud, title: "Cloud Native", description: "Deploy anywhere with our cloud-native infrastructure" },
  { icon: Zap, title: "Lightning Fast", description: "Experience blazing fast deployments and performance" },
  { icon: Shield, title: "Secure & Reliable", description: "Enterprise-grade security with 99.9% uptime guarantee" },
];

const STATS = [
  { value: "10K+", label: "Deployments" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  },
  item: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  },
  stats: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  },
};

const INITIAL_FORM_DATA: FormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  bio: "",
  location: "",
};

// Helper Functions
const buildGoogleAuthUrl = (): string => {
  const redirectUri = encodeURIComponent(`${import.meta.env.VITE_APP_URL}/oauth/google/callback`);
  const scope = encodeURIComponent("openid email profile");
  const nonce = crypto.randomUUID();
  const state = crypto.randomUUID();

  return (
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=id_token` +
    `&scope=${scope}` +
    `&nonce=${nonce}` +
    `&state=${state}` +
    `&prompt=select_account`
  );
};

const buildGitHubAuthUrl = (redirectTo: string): string => {
  const redirectUri = encodeURIComponent(
    `${import.meta.env.VITE_APP_URL}/oauth/github/callback`
  );

  const scope = encodeURIComponent("read:user user:email");

  const statePayload = {
    redirectTo,
    flow: "github_connect",
    nonce: crypto.randomUUID(),
  };

  const state = encodeURIComponent(JSON.stringify(statePayload));

  return (
    `https://github.com/login/oauth/authorize` +
    `?client_id=${GITHUB_CLIENT_ID}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=${scope}` +
    `&state=${state}`
  );
};

const shouldNavigateToDashboard = (tenantId: string | undefined): boolean => {
  return Boolean(tenantId && DEFAULT_TID && tenantId !== DEFAULT_TID);
};

const buildUserData = (userId: string, name: string, email: string) => ({
  id: userId,
  name,
  email,
  is_super_admin: false,
  orgName: null,
  profileCompleted: false,
});

// Component
export default function AuthPageContainer() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  // Zustand store
  const user = useAuthStore(selectUser);
  const login = useAuthStore((state) => state.login);

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/explore", { replace: true });
    }
  }, [user, navigate]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError("");
    },
    []
  );

  const handleSocialLogin = useCallback((provider: string) => {
    const providerLower = provider.toLowerCase();

    if (providerLower === "google") {
      window.location.href = buildGoogleAuthUrl();
      return;
    }

    if (providerLower === "github") {
      window.location.href = buildGitHubAuthUrl("/explore");
      return;
    }

    setError(`${provider} login coming soon!`);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setError("");
  }, []);

  const toggleMode = useCallback(() => {
    setIsSignUp((prev) => !prev);
    resetForm();
  }, [resetForm]);

  const handleSignup = async (): Promise<void> => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation UserSignup($email: String!, $password: String!, $name: String!) {
            userSignup(email: $email, password: $password, name: $name)
          }
        `,
        variables: {
          email: formData.email,
          password: formData.password,
          name: formData.name,
        },
      }),
    });

    const json = await response.json();
    const signupData = json.body?.singleResult?.data?.userSignup || json.data?.userSignup;

    if (!signupData) {
      throw new Error("Signup failed: no response from server");
    }

    if (!signupData.success) {
      throw new Error(signupData.error || "Signup failed");
    }

    const accessToken: string | undefined = signupData.data?.accessToken;
    const refreshToken: string | undefined = signupData.data?.refreshToken;

    if (!accessToken) {
      throw new Error("Signup failed: token missing");
    }

    const decoded = jwtDecode<DecodedToken>(accessToken);
    const userId = decoded.sub || decoded.userId || "";
    const userData = buildUserData(userId, formData.name, formData.email);

    login(accessToken, userData, refreshToken);

    const destination = shouldNavigateToDashboard(decoded.tid) ? "/explore" : "/onboarding";
    navigate(destination, { replace: true });
  };

  const handleLogin = async (): Promise<void> => {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation UserLogin($email: String!, $password: String!) {
            userLogin(email: $email, password: $password)
          }
        `,
        variables: {
          email: formData.email,
          password: formData.password,
        },
      }),
    });

    const json = await response.json();
    const loginData = json.body?.singleResult?.data?.userLogin || json.data?.userLogin;

    if (!loginData || loginData.success === false) {
      throw new Error(loginData?.error || "Login failed");
    }

    const accessToken: string | undefined = loginData.data?.accessToken;
    const refreshToken: string | undefined = loginData.data?.refreshToken;

    if (!accessToken) {
      throw new Error("Login failed: token missing");
    }

    const decoded = jwtDecode<DecodedToken>(accessToken);
    const userId = decoded.sub || decoded.userId || "";
    const userName = decoded.name || "";
    const userEmail = decoded.email || formData.email;
    const userData = buildUserData(userId, userName, userEmail);

    login(accessToken, userData, refreshToken);

    const destination = shouldNavigateToDashboard(decoded.tid) ? "/explore" : "/onboarding";
    navigate(destination, { replace: true });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");

      try {
        if (isSignUp) {
          await handleSignup();
        } else {
          await handleLogin();
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isSignUp, formData, login, navigate]
  );

  return (
    <div className="min-h-screen flex overflow-hidden">
      <AuthForm
        isSignUp={isSignUp}
        isLoading={isLoading}
        error={error}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        handleSocialLogin={handleSocialLogin}
        toggleMode={toggleMode}
      />
      <BrandingPanel
        features={FEATURES}
        stats={STATS}
        containerVariants={ANIMATION_VARIANTS.container}
        itemVariants={ANIMATION_VARIANTS.item}
        statsVariants={ANIMATION_VARIANTS.stats}
      />
    </div>
  );
}