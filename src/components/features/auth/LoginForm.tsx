"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");

    try {
      const result = await signIn("credentials", {
        username: data.username.toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Username atau password salah. Silakan periksa kembali.");
        } else {
          toast.error("Gagal masuk", {
            description: "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
          });
        }
        return;
      }

      toast.success("Berhasil masuk!", {
        description: "Mengarahkan ke dashboard...",
      });

      window.location.href = "/";
    } catch {
      toast.error("Koneksi gagal", {
        description: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-[13px] font-bold text-slate-600">
          Username
        </Label>
        <Input
          id="username"
          placeholder="username"
          {...register("username")}
          className="h-12 rounded-[14px] border-[#dbe3ef] focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
        {errors.username && <p className="text-[13px] text-red-500">{errors.username.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[13px] font-bold text-slate-600">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="password"
          {...register("password")}
          className="h-12 rounded-[14px] border-[#dbe3ef] focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
        {errors.password && <p className="text-[13px] text-red-500">{errors.password.message}</p>}
      </div>

      {error && <p className="text-[13px] text-red-500 font-medium">{error}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-[14px] bg-gradient-to-r from-primary to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-primary text-white font-bold gap-2 transition-all"
      >
        {isSubmitting ? (
          "Memproses..."
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            Masuk
          </>
        )}
      </Button>
    </form>
  );
}