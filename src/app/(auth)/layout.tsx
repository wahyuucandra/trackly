export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh flex items-center justify-center p-4 md:p-10 relative bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] via-[#1e40af] to-[#0f172a] animate-gradient-shift overflow-hidden">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orbs — soft & minimal */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.12)_0%,transparent_70%)] -top-[100px] -right-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,.10)_0%,transparent_70%)] -bottom-[80px] -left-[80px] pointer-events-none animate-pulse-glow [animation-delay:-4s]" />

      {children}
    </div>
  );
}