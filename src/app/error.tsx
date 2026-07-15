"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb] p-8">
          <div className="bg-white p-10 rounded-[24px] border border-border text-center max-w-md shadow-lg">
            <h1 className="text-2xl font-extrabold mb-2 text-danger">Kesalahan Sistem</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              Terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary2 text-white font-bold rounded-[14px]"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}