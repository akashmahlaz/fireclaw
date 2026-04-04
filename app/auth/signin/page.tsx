"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

type Mode = "signin" | "signup" | "verify-email" | "forgot" | "forgot-otp" | "reset-password"

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <Loader2 className="size-6 animate-spin text-neutral-400" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const error = searchParams.get("error")

  const [mode, setMode] = useState<Mode>("signin")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(
    error === "CredentialsSignin" ? "Invalid email or password" : null,
  )
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const clearMessages = () => {
    setFormError(null)
    setSuccessMsg(null)
  }

  const resetOtp = () => setOtp(["", "", "", "", "", ""])

  // ─── OTP Input handler ────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!text) return
    const next = [...otp]
    for (let i = 0; i < 6; i++) next[i] = text[i] || ""
    setOtp(next)
    const focusIdx = Math.min(text.length, 5)
    otpRefs.current[focusIdx]?.focus()
  }

  const otpCode = otp.join("")

  // ─── Signup ───────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      // Move to OTP verification
      resetOtp()
      setResendCooldown(60)
      setMode("verify-email")
      setSuccessMsg("We sent a 6-digit code to your email")
    } catch {
      setFormError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ─── Verify email OTP ─────────────────────────────────────────
  const handleVerifyEmail = async () => {
    if (otpCode.length !== 6) return
    setLoading(true)
    clearMessages()

    try {
      const res = await fetch("/api/auth/otp/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || "Verification failed")
        setLoading(false)
        return
      }

      // Verified — now auto sign in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setFormError("Email verified! Please sign in.")
        setMode("signin")
        setLoading(false)
        return
      }

      router.push(callbackUrl)
    } catch {
      setFormError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  // ─── Resend OTP ───────────────────────────────────────────────
  const handleResendOtp = async (purpose: "email-verify" | "password-reset") => {
    if (resendCooldown > 0) return
    clearMessages()

    const endpoint =
      purpose === "email-verify"
        ? "/api/auth/otp/send-verification"
        : "/api/auth/forgot/send"

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setResendCooldown(60)
      setSuccessMsg("New code sent!")
      resetOtp()
    } catch {
      setFormError("Failed to resend code")
    }
  }

  // ─── Sign in ──────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setFormError("Invalid email or password, or email not verified")
        setLoading(false)
        return
      }

      router.push(callbackUrl)
    } catch {
      setFormError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  // ─── Forgot password: send OTP ────────────────────────────────
  const handleForgotSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()

    try {
      await fetch("/api/auth/forgot/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      resetOtp()
      setResendCooldown(60)
      setMode("forgot-otp")
      setSuccessMsg("If an account exists, we sent a reset code")
    } catch {
      setFormError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ─── Forgot password: verify OTP ──────────────────────────────
  const handleForgotVerify = async () => {
    if (otpCode.length !== 6) return
    clearMessages()
    setMode("reset-password")
  }

  // ─── Reset password ───────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()

    try {
      const res = await fetch("/api/auth/forgot/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode, newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || "Reset failed")
        setLoading(false)
        return
      }

      setSuccessMsg("Password reset! You can now sign in.")
      setPassword("")
      setNewPassword("")
      resetOtp()
      setMode("signin")
    } catch {
      setFormError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setGoogleLoading(true)
    signIn("google", { callbackUrl })
  }

  // ─── Heading text ─────────────────────────────────────────────
  const headings: Record<Mode, { title: string; subtitle: string }> = {
    signin: { title: "Welcome back", subtitle: "Sign in to your FireClaw account" },
    signup: { title: "Create account", subtitle: "Get started with FireClaw" },
    "verify-email": { title: "Verify your email", subtitle: `Enter the code sent to ${email}` },
    forgot: { title: "Forgot password", subtitle: "Enter your email to get a reset code" },
    "forgot-otp": { title: "Check your email", subtitle: `Enter the code sent to ${email}` },
    "reset-password": { title: "New password", subtitle: "Choose a new password for your account" },
  }

  const { title, subtitle } = headings[mode]

  // ─── OTP input UI ─────────────────────────────────────────────
  const OtpInputRow = () => (
    <div className="flex justify-center gap-2">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { otpRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleOtpChange(i, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(i, e)}
          onPaste={i === 0 ? handleOtpPaste : undefined}
          className="size-12 rounded-xl border border-neutral-200 bg-white text-center text-[18px] font-bold text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
        />
      ))}
    </div>
  )

  // ─── Back button (for sub-flows) ──────────────────────────────
  const showBack = !["signin", "signup"].includes(mode)

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-100">
        {/* Back button */}
        {showBack && (
          <button
            onClick={() => {
              clearMessages()
              resetOtp()
              setMode("signin")
            }}
            className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </button>
        )}

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-black tracking-[-0.03em] text-neutral-900">
            {title}
          </h1>
          <p className="mt-1 text-[14px] text-neutral-500">{subtitle}</p>
        </div>

        {/* Success message */}
        {successMsg && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-center text-[13px] font-medium text-emerald-600">
            {successMsg}
          </p>
        )}

        {/* Error message */}
        {formError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-[13px] font-medium text-red-600">
            {formError}
          </p>
        )}

        {/* ─── SIGNIN MODE ─────────────────────────────────────── */}
        {mode === "signin" && (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

            <Divider />

            <form onSubmit={handleSignIn} className="space-y-4">
              <EmailInput value={email} onChange={setEmail} />
              <PasswordInput
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                placeholder="Your password"
              />
              <SubmitButton loading={loading} disabled={googleLoading}>
                Sign in
              </SubmitButton>
            </form>

            <div className="mt-3 text-center">
              <button
                onClick={() => {
                  clearMessages()
                  setMode("forgot")
                }}
                className="text-[13px] font-medium text-neutral-400 transition-colors hover:text-neutral-700"
              >
                Forgot password?
              </button>
            </div>

            <p className="mt-6 text-center text-[13px] text-neutral-500">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => {
                  clearMessages()
                  setMode("signup")
                }}
                className="font-semibold text-neutral-900 hover:underline"
              >
                Sign up
              </button>
            </p>
          </>
        )}

        {/* ─── SIGNUP MODE ─────────────────────────────────────── */}
        {mode === "signup" && (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

            <Divider />

            <form onSubmit={handleSignup} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">Name</span>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    minLength={2}
                    className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                  />
                </div>
              </label>
              <EmailInput value={email} onChange={setEmail} />
              <PasswordInput
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                placeholder="Min 8 characters"
                minLength={8}
              />
              <SubmitButton loading={loading} disabled={googleLoading}>
                Create account
              </SubmitButton>
            </form>

            <p className="mt-6 text-center text-[13px] text-neutral-500">
              Already have an account?{" "}
              <button
                onClick={() => {
                  clearMessages()
                  setMode("signin")
                }}
                className="font-semibold text-neutral-900 hover:underline"
              >
                Sign in
              </button>
            </p>
          </>
        )}

        {/* ─── VERIFY EMAIL OTP ────────────────────────────────── */}
        {mode === "verify-email" && (
          <div className="space-y-6">
            <OtpInputRow />

            <SubmitButton
              loading={loading}
              disabled={otpCode.length !== 6}
              onClick={handleVerifyEmail}
            >
              Verify email
            </SubmitButton>

            <ResendButton
              cooldown={resendCooldown}
              onClick={() => handleResendOtp("email-verify")}
            />
          </div>
        )}

        {/* ─── FORGOT: ENTER EMAIL ─────────────────────────────── */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotSend} className="space-y-4">
            <EmailInput value={email} onChange={setEmail} />
            <SubmitButton loading={loading}>
              Send reset code
            </SubmitButton>
          </form>
        )}

        {/* ─── FORGOT: ENTER OTP ───────────────────────────────── */}
        {mode === "forgot-otp" && (
          <div className="space-y-6">
            <OtpInputRow />

            <SubmitButton
              loading={loading}
              disabled={otpCode.length !== 6}
              onClick={handleForgotVerify}
            >
              Verify code
            </SubmitButton>

            <ResendButton
              cooldown={resendCooldown}
              onClick={() => handleResendOtp("password-reset")}
            />
          </div>
        )}

        {/* ─── RESET PASSWORD ──────────────────────────────────── */}
        {mode === "reset-password" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              placeholder="Min 8 characters"
              label="New password"
              minLength={8}
            />
            <SubmitButton loading={loading}>
              Reset password
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Shared components ────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-neutral-200" />
      <span className="text-[12px] font-medium text-neutral-400">OR</span>
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  )
}

function EmailInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">Email</span>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
        />
      </div>
    </label>
  )
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  label = "Password",
  minLength,
}: {
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  placeholder: string
  label?: string
  minLength?: number
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">{label}</span>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          minLength={minLength}
          className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-10 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </label>
  )
}

function SubmitButton({
  loading,
  disabled,
  children,
  onClick,
}: {
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14px] font-semibold transition-all",
        "bg-neutral-900 text-white hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50",
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

function ResendButton({ cooldown, onClick }: { cooldown: number; onClick: () => void }) {
  return (
    <p className="text-center text-[13px] text-neutral-500">
      Didn&apos;t get a code?{" "}
      {cooldown > 0 ? (
        <span className="font-medium text-neutral-400">Resend in {cooldown}s</span>
      ) : (
        <button
          onClick={onClick}
          className="font-semibold text-neutral-900 hover:underline"
        >
          Resend code
        </button>
      )}
    </p>
  )
}
