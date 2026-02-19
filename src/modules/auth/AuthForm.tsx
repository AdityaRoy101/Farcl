import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Separator } from "../../components/ui/separator";
import { Card, CardContent, CardHeader, CardFooter, CardDescription, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Github } from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";

export interface AuthFormProps {
  isSignUp: boolean;
  isLoading: boolean;
  error: string;
  formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    bio: string;
    location: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleSocialLogin: (provider: string) => void;
  toggleMode: () => void;
}

/**
 * AuthForm - Reusable form component for sign-in and sign-up
 * Features animated transitions, social login, and responsive design
 */
const AuthForm: React.FC<AuthFormProps> = ({
  isSignUp,
  isLoading,
  error,
  formData,
  handleInputChange,
  handleSubmit,
  handleSocialLogin,
  toggleMode,
}) => {
  return (
    <motion.div
      className="relative flex-1 flex items-center justify-center p-8 lg:p-12"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Subtle grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: [
            "linear-gradient(to right, color-mix(in oklch, var(--foreground) 8%, transparent) 1px, transparent 1px)",
            "linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 8%, transparent) 1px, transparent 1px)",
            "radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--primary) 5%, transparent) 0, transparent 60%)",
            "linear-gradient(135deg, color-mix(in oklch, var(--foreground) 3%, transparent), transparent 40%)",
          ].join(', '),
          backgroundSize: "52px 52px, 52px 52px, 52px 52px, 52px 52px",
        }}
      />

      {/* Radial glow overlays */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(600px 300px at 15% 0%, rgba(99,102,241,0.06), transparent 60%), radial-gradient(700px 400px at 95% 50%, rgba(14,165,233,0.05), transparent 60%)",
        }}
      />

      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="relative pt-4">
            <Card className="w-full rounded-3xl shadow-2xl border bg-card min-h-[640px] flex flex-col">

              {/* Header with animated logo and title */}
              <CardHeader className="space-y-4 px-6 md:px-8 pt-8 text-center">
                <div className="flex justify-center">
                  <motion.div
                    className="relative"
                    initial={{ y: 0 }}
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
                  >
                    <div className="absolute inset-0 -z-10 blur-xl opacity-50 bg-gradient-to-br from-primary/40 to-primary/10 rounded-2xl" />
                    <div className="rounded-2xl p-[2px] bg-gradient-to-br from-primary via-primary/80 to-primary/60 shadow-xl">
                      <div className="w-14 h-14 rounded-[inherit] bg-foreground text-background grid place-items-center ring-1 ring-black/10">
                        <span className="text-lg font-extrabold tracking-wide">I</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  key={isSignUp ? "signup" : "signin"}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardTitle className="text-2xl">
                    {isSignUp ? "Create an account" : "Welcome back"}
                  </CardTitle>
                  <CardDescription>
                    {isSignUp
                      ? "Enter your details to create your account"
                      : "Enter your credentials to access your account"
                    }
                  </CardDescription>
                </motion.div>
              </CardHeader>

              {/* Form Content */}
              <CardContent className="px-6 md:px-8 pb-8 flex-1">
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  {/* Email Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-11 transition-all duration-200 focus:scale-[1.02]"
                    />
                  </motion.div>

                  {/* Name Field - Sign Up only */}
                  {isSignUp && (
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.45 }}
                    >
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="h-11 transition-all duration-200 focus:scale-[1.02]"
                      />
                    </motion.div>
                  )}

                  {/* Password Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="h-11 transition-all duration-200 focus:scale-[1.02]"
                    />
                  </motion.div>

                  {/* Confirm Password - Sign Up only */}
                  <AnimatePresence mode="wait">
                    {isSignUp && (
                      <motion.div
                        key="confirm-password-field"
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="h-11 transition-all duration-200 focus:scale-[1.02]"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Remember Me & Forgot Password - Sign In only */}
                  <AnimatePresence mode="wait">
                    {!isSignUp && (
                      <motion.div
                        key="remember-forgot"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between"
                      >
                        <div className="group flex items-center gap-2 rounded-md border border-transparent bg-muted/30 px-2.5 py-1.5 ring-1 ring-border/40 backdrop-blur-sm transition-colors hover:bg-muted/50 hover:ring-primary/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                          <Checkbox id="remember" className="h-4 w-4 border-muted-foreground/30 shadow-sm ring-1 ring-transparent transition-all duration-200 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:ring-primary/40 group-hover:ring-muted-foreground/20" />
                          <Label htmlFor="remember" className="text-sm cursor-pointer select-none text-foreground/90 group-hover:text-foreground">
                            Remember me
                          </Label>
                        </div>
                        <button
                          type="button"
                          className="text-sm underline hover:no-underline transition-all duration-200 hover:text-primary"
                        >
                          Forgot password?
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Display */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="w-full h-11 transition-all duration-200" disabled={isLoading}>
                      {isLoading ? <LoadingSpinner size="sm" /> : isSignUp ? "Create Account" : "Sign In"}
                    </Button>
                  </motion.div>

                  {/* Separator */}
                  <motion.div
                    className="relative mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-3 text-muted-foreground">or continue with</span>
                    </div>
                  </motion.div>

                  {/* Social Login Buttons */}
                  <motion.div
                    className="space-y-3 mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        className="w-full h-11 transition-all duration-200"
                        type="button"
                        onClick={() => handleSocialLogin("Google")}
                      >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        className="w-full h-11 transition-all duration-200"
                        type="button"
                        onClick={() => handleSocialLogin("GitHub")}
                      >
                        <Github className="w-5 h-5 mr-3" />
                        Continue with GitHub
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.form>
              </CardContent>

              {/* Footer with mode toggle */}
              <CardFooter className="px-6 md:px-8 pb-8">
                <motion.p
                  className="text-center w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  {isSignUp ? "Already have an account?" : "Don't have an account?"} {" "}
                  <motion.button
                    type="button"
                    onClick={toggleMode}
                    className="underline hover:no-underline transition-all duration-200 hover:text-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </motion.button>
                </motion.p>
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthForm;

