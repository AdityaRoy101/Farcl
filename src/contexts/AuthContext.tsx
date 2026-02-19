// "use client";

// import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
// import { jwtDecode } from "jwt-decode";
// import { REFRESH_TOKEN_MUTATION } from "../lib/graphql/mutations/RefreshToken/RefreshToken";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   is_super_admin: boolean;
//   orgName: string | null;
//   profileCompleted: boolean;
// }

// interface DecodedToken {
//   userId?: string;
//   name?: string;
//   email?: string;
//   isAdmin?: boolean;
//   tid?: string;
//   exp: number;
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   decodedTid: string | null;
//   login: (token: string, user: User, refreshToken?: string) => void;
//   logout: () => void;
//   isLoading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;

// /**
//  * AuthProvider - Manages authentication state, token refresh, and user session
//  * Handles automatic token refresh, visibility changes, and initialization
//  */
// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [decodedTid, setDecodedTid] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   /**
//    * Refreshes access token using refresh token via GraphQL mutation
//    * Updates localStorage and returns new access token
//    */
//   const refreshAccessToken = useCallback(async (): Promise<string | null> => {
//     const refreshToken = localStorage.getItem("refreshToken");
//     if (!refreshToken) return null;
//     try {
//       const res = await fetch(GRAPHQL_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           query: REFRESH_TOKEN_MUTATION,
//           variables: { refreshToken },
//         }),
//       });

//       const json = await res.json();
//       const raw = json.body?.singleResult?.data?.refreshToken || json.data?.refreshToken;

//       if (!raw) return null;

//       const result = typeof raw === "string" ? JSON.parse(raw) : raw;

//       if (result.success && result.data?.accessToken) {
//         localStorage.setItem("accessToken", result.data.accessToken);
//         if (result.data.refreshToken) {
//           localStorage.setItem("refreshToken", result.data.refreshToken);
//         }
//         return result.data.accessToken;
//       }

//       return null;
//     } catch {
//       return null;
//     }
//   }, []);

//   /**
//    * Checks if token expires within 5 minutes
//    */
//   const isTokenExpiringSoon = (token: string): boolean => {
//     try {
//       const decoded: DecodedToken = jwtDecode(token);
//       const expiresIn = decoded.exp * 1000 - Date.now();
//       return expiresIn < 5 * 60 * 1000;
//     } catch {
//       return true;
//     }
//   };

//   /**
//    * Checks if token is fully expired
//    */
//   const isTokenExpired = (token: string): boolean => {
//     try {
//       const decoded: DecodedToken = jwtDecode(token);
//       return decoded.exp * 1000 <= Date.now();
//     } catch {
//       return true;
//     }
//   };

//   /**
//    * Initializes auth state on app load
//    * Loads saved token, attempts refresh if expired
//    */
//   useEffect(() => {
//     const initAuth = async () => {
//       const savedToken = localStorage.getItem("accessToken");

//       if (!savedToken) {
//         setIsLoading(false);
//         return;
//       }

//       let activeToken = savedToken;

//       if (isTokenExpired(savedToken)) {
//         const newToken = await refreshAccessToken();
//         if (!newToken) {
//           localStorage.removeItem("accessToken");
//           localStorage.removeItem("refreshToken");
//           setIsLoading(false);
//           return;
//         }
//         activeToken = newToken;
//       }

//       try {
//         const decoded: DecodedToken = jwtDecode(activeToken);
//         setToken(activeToken);
//         setDecodedTid(decoded.tid || null);

//         setUser({
//           id: decoded.userId || "",
//           name: decoded.name || "",
//           email: decoded.email || "",
//           is_super_admin: decoded.isAdmin ?? false,
//           orgName: null,
//           profileCompleted: false,
//         });
//       } catch {
//         localStorage.removeItem("accessToken");
//         localStorage.removeItem("refreshToken");
//       }

//       setIsLoading(false);
//     };

//     initAuth();
//   }, [refreshAccessToken]);

//   /**
//    * Auto-refreshes token every minute if expiring soon
//    */
//   useEffect(() => {
//     if (!token) return;

//     const checkAndRefresh = async () => {
//       if (isTokenExpiringSoon(token)) {
//         const newToken = await refreshAccessToken();
//         if (newToken) {
//           setToken(newToken);
//           try {
//             const decoded: DecodedToken = jwtDecode(newToken);
//             setDecodedTid(decoded.tid || null);
//           } catch { }
//         }
//       }
//     };

//     const interval = setInterval(checkAndRefresh, 60 * 1000);
//     return () => clearInterval(interval);
//   }, [token, refreshAccessToken]);

//   /**
//    * Handles tab visibility changes - refreshes expired tokens when tab becomes active
//    */
//   useEffect(() => {
//     const handleVisibilityChange = async () => {
//       if (document.visibilityState === "visible" && token) {
//         if (isTokenExpired(token)) {
//           const newToken = await refreshAccessToken();
//           if (!newToken) {
//             logout();
//             return;
//           }
//           setToken(newToken);
//           try {
//             const decoded: DecodedToken = jwtDecode(newToken);
//             setDecodedTid(decoded.tid || null);
//           } catch { }
//         }
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, [token, refreshAccessToken]);

//   /**
//    * Login - sets auth state and persists tokens
//    */
//   const login = (token: string, userData: User, refreshToken?: string) => {
//     setToken(token);
//     setUser(userData);

//     localStorage.setItem("accessToken", token);
//     if (refreshToken) {
//       localStorage.setItem("refreshToken", refreshToken);
//     }

//     try {
//       const decoded: DecodedToken = jwtDecode(token);
//       setDecodedTid(decoded.tid || null);
//     } catch {
//       setDecodedTid(null);
//     }
//   };

//   /**
//    * Logout - clears all auth state and tokens
//    */
//   const logout = async () => {
//     try {
//       await fetch("/api/auth/logout", {
//         method: "POST",
//         credentials: "include",
//       });
//     } catch { }

//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");

//     setUser(null);
//     setToken(null);
//     setDecodedTid(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, decodedTid, login, logout, isLoading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// /**
//  * Custom hook to access auth context
//  * Throws error if used outside AuthProvider
//  */
// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return ctx;
// }