import { BarChart3 } from "lucide-react";

export default function Loading() {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#224394] text-white overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/[0.03] animate-pulse" />
          <div className="absolute top-1/2 -right-16 w-48 h-48 rounded-full bg-white/[0.04] animate-pulse [animation-delay:1s]" />
          <div className="absolute -bottom-20 left-1/3 w-56 h-56 rounded-full bg-white/[0.03] animate-pulse [animation-delay:2s]" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Top line */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-px w-10 bg-white/20" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-medium">monitoring</span>
            <div className="h-px w-10 bg-white/20" />
          </div>

          {/* Welcome text */}
          <p className="text-sm font-medium tracking-widest uppercase text-white/50 mb-4">Welcome to</p>

          {/* Logo + brand */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-white/10 animate-ping [animation-duration:3s]" />
              <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 backdrop-blur">
                <BarChart3 className="w-6 sm:w-7 h-6 sm:h-7 text-white animate-bounce" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-[28px] sm:text-[34px] font-extrabold tracking-tight text-white">
              TRACKLY
            </h1>
          </div>

          {/* Loading spinner + text */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 backdrop-blur border border-white/10">
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <p className="text-sm text-white/70 font-medium">
              Mohon Tunggu
              <span className="inline-flex ml-0.5">
                <span className="animate-bounce [animation-delay:0ms]">.</span>
                <span className="animate-bounce [animation-delay:150ms]">.</span>
                <span className="animate-bounce [animation-delay:300ms]">.</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    );
}
