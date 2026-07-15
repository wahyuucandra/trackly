import { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="responsive w-full max-w-[440px] bg-white/97 backdrop-blur-[20px] p-6 sm:p-10 md:p-12 rounded-[24px] shadow-[0_30px_80px_rgba(0,0,0,.3)] relative z-10 animate-float-up">
       {/* Decorative background circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/[0.03] animate-pulse" />
          <div className="absolute top-1/2 -right-16 w-48 h-48 rounded-full bg-white/[0.04] animate-pulse [animation-delay:1s]" />
          <div className="absolute -bottom-20 left-1/3 w-56 h-56 rounded-full bg-white/[0.03] animate-pulse [animation-delay:2s]" />
        </div>
      {/* Logo + Title sejajar */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <BarChart3 className="w-8 sm:w-10 h-8 sm:h-10 text-primary" strokeWidth={2.5} />
        <h1 className="text-[26px] sm:text-[32px] font-extrabold text-[#1e3a8a] tracking-tight">TRACKLY</h1>
      </div>
      <p className="text-[#64748b] text-center mb-8 text-sm">
        Monitoring Program PDO &amp; AO
      </p>
      <LoginForm />
    </div>
  );
}