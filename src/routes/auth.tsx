import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Bike, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { auth, googleAuthProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — MotoLog Vehicle Tracker" },
      { name: "description", content: "Sign in to MotoLog to track your motorcycle maintenance, fuel and running costs." },
      { property: "og:title", content: "Sign in — MotoLog Vehicle Tracker" },
      { property: "og:description", content: "Sign in to track motorcycle maintenance, fuel and costs." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      // If user doesn't exist yet, try creating the account seamlessly
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        const signupRes = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signupRes.error) {
          setBusy(false);
          return toast.error(error.message);
        }

        if (signupRes.data.session) {
          setBusy(false);
          toast.success("New account created and signed in!");
          navigate({ to: "/garage" });
          return;
        } else {
          setBusy(false);
          toast.info("Account created. Please check your email to confirm if required, or try Instant Demo.");
          return;
        }
      }
      setBusy(false);
      return toast.error(error.message);
    }

    setBusy(false);
    toast.success("Welcome back!");
    navigate({ to: "/garage" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/garage` },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data.session) {
      toast.success("Account created! Welcome to MotoLog.");
      navigate({ to: "/garage" });
    } else {
      toast.success("Account created! Please check your inbox or sign in.");
      navigate({ to: "/garage" });
    }
  };

  const instantGuestLogin = async () => {
    setBusy(true);
    try {
      // Try signing in anonymously or with demo credentials
      const res = await supabase.auth.signInAnonymously();
      if (!res.error && res.data.session) {
        setBusy(false);
        toast.success("Signed in as Guest!");
        navigate({ to: "/garage" });
        return;
      }

      // Fallback demo account
      const demoEmail = "demo.rider@motolog.app";
      const demoPass = "MotoLog2026!";
      const demoRes = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass,
      });

      if (demoRes.error) {
        const createDemo = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPass,
        });
        if (createDemo.data.session) {
          setBusy(false);
          toast.success("Signed in as Demo Rider!");
          navigate({ to: "/garage" });
          return;
        }
      } else {
        setBusy(false);
        toast.success("Signed in as Demo Rider!");
        navigate({ to: "/garage" });
        return;
      }

      // If Supabase guest auth is restricted, fill email and password for the user
      setEmail("rider@example.com");
      setPassword("password123");
      setBusy(false);
      toast.info("Demo credentials loaded. Click 'Sign in' or 'Create account'.");
    } catch (err: any) {
      setBusy(false);
      toast.error(err.message || "Could not start guest session");
    }
  };

  const googleSignIn = async () => {
    setBusy(true);
    try {
      // Firebase Google Sign In popup
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        toast.success(`Signed in as ${result.user.displayName || result.user.email}`);
        setBusy(false);
        navigate({ to: "/garage" });
        return;
      }
    } catch (err: any) {
      console.warn("Firebase popup failed, trying fallback:", err);
      // Fallback info
      toast.info("Google Sign-In popup closed or requires popup permission.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bike className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold">MotoLog</span>
        </Link>

        <div className="panel p-6">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-3 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-3 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email2">Email</Label>
                  <Input
                    id="email2"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password2">Password</Label>
                  <Input
                    id="password2"
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full font-medium"
              disabled={busy}
              onClick={instantGuestLogin}
            >
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
              Instant Rider Login
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={googleSignIn}
            >
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
