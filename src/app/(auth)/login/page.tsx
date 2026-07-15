import { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-[440px] bg-white/97 backdrop-blur-[20px] p-6 sm:p-10 md:p-12 rounded-[24px] shadow-[0_30px_80px_rgba(0,0,0,.3)] relative z-10 animate-float-up">
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