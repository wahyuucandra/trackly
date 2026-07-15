import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#224394] p-8">
      <div className="bg-white p-10 rounded-[24px] border border-border text-center max-w-md shadow-lg">
        <FileQuestion className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-extrabold mb-2">404 — Halaman Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link href="/">
          <Button className="gap-2">
            <Home className="w-4 h-6" />
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}