import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password minimal 8 karakter";
  if (!/[a-z]/.test(password)) return "Password harus mengandung huruf kecil";
  if (!/[A-Z]/.test(password)) return "Password harus mengandung huruf besar";
  if (!/[0-9]/.test(password)) return "Password harus mengandung angka";
  if (!/[^a-zA-Z0-9]/.test(password)) return "Password harus mengandung karakter khusus";
  return null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, password, role, area, permissions } = body;

  const data: Record<string, unknown> = { name, role: role || "AO", area: area || [], permissions: permissions || {} };
  if (password) {
    const pwError = validatePassword(password);
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 });
    }
    data.passwordHash = await hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      area: true,
      permissions: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (user?.username === "admin") {
    return NextResponse.json({ error: "Admin utama tidak bisa dihapus." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}