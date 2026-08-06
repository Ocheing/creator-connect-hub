import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, ArrowRight, Users, Building2, Mail, Lock, User, UserPlus, PartyPopper, Check, X as XIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types/database.types";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>("influencer");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    companyName: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const { activeCreators, brandPartners } = usePlatformStats();

  const isPasswordValid = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };
  const allPasswordValid = Object.values(isPasswordValid).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allPasswordValid) {
      toast({
        title: "Weak password",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check if email exists
      const { data: emailExists, error: emailError } = await supabase.rpc('check_email_exists', { p_email: formData.email });
      if (emailError) throw emailError;
      if (emailExists) {
        toast({
          title: "Email in use",
          description: "This email address is already registered. Please sign in or use a different email.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // 2. Check if username exists
      const { data: usernameExists, error: usernameError } = await supabase.rpc('check_username_exists', { p_username: formData.username });
      if (usernameError) throw usernameError;
      if (usernameExists) {
        toast({
          title: "Username taken",
          description: "This username is already taken. Please choose another one.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // 3. Proceed with sign up
      const { error } = await signUp({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        fullName: formData.name,
        role,
        companyName: role === "brand" ? formData.companyName : undefined,
      });

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: (
          <div className="flex items-center gap-2">
            Account created! <PartyPopper className="w-4 h-4" />
          </div>
        ),
        description: "Please check your email to verify your account, then sign in.",
      });
      navigate("/sign-in");
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-coral flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl">
              Micro<span className="text-coral">Match</span>
            </span>
          </Link>

          <h1 className="text-3xl font-heading font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">
            Join MicroMatch to start landing brand deals or finding creators.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label>I am a...</Label>
              <RadioGroup
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="influencer"
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${role === "influencer"
                    ? "border-coral bg-coral/5"
                    : "border-border hover:border-muted-foreground/30"
                    }`}
                >
                  <RadioGroupItem value="influencer" id="influencer" className="sr-only" />
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === "influencer" ? "bg-coral/10" : "bg-muted"
                    }`}>
                    <Users className={`w-5 h-5 ${role === "influencer" ? "text-coral" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-semibold">Creator</p>
                    <p className="text-xs text-muted-foreground">Find brand deals</p>
                  </div>
                </Label>

                <Label
                  htmlFor="brand"
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${role === "brand"
                    ? "border-coral bg-coral/5"
                    : "border-border hover:border-muted-foreground/30"
                    }`}
                >
                  <RadioGroupItem value="brand" id="brand" className="sr-only" />
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === "brand" ? "bg-coral/10" : "bg-muted"
                    }`}>
                    <Building2 className={`w-5 h-5 ${role === "brand" ? "text-coral" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-semibold">Brand</p>
                    <p className="text-xs text-muted-foreground">Find creators</p>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="choose_a_username"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            {role === "brand" && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Your company"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@email.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="pt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 text-xs text-muted-foreground">
                <div className={`flex items-center gap-1.5 ${isPasswordValid.length ? "text-green-500" : ""}`}>
                  {isPasswordValid.length ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3 opacity-50" />}
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-1.5 ${isPasswordValid.uppercase ? "text-green-500" : ""}`}>
                  {isPasswordValid.uppercase ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3 opacity-50" />}
                  One uppercase letter
                </div>
                <div className={`flex items-center gap-1.5 ${isPasswordValid.lowercase ? "text-green-500" : ""}`}>
                  {isPasswordValid.lowercase ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3 opacity-50" />}
                  One lowercase letter
                </div>
                <div className={`flex items-center gap-1.5 ${isPasswordValid.number ? "text-green-500" : ""}`}>
                  {isPasswordValid.number ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3 opacity-50" />}
                  One number
                </div>
                <div className={`flex items-center gap-1.5 ${isPasswordValid.special ? "text-green-500" : ""}`}>
                  {isPasswordValid.special ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3 opacity-50" />}
                  One special character
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="coral"
              size="lg"
              className="w-full"
              disabled={isLoading || !allPasswordValid}
            >
              {isLoading ? "Creating account..." : "Create Account"}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By signing up, you agree to our{" "}
              <Link to="#" className="text-coral hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="#" className="text-coral hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-coral font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-primary items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md text-center text-primary-foreground"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-heading font-bold mb-4">
            Join {activeCreators}+ Creators & {brandPartners}+ Brands
          </h2>
          <p className="text-primary-foreground/70">
            Start building meaningful partnerships today. Whether you're a creator looking for brand deals or a brand seeking authentic voices, we've got you covered.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
