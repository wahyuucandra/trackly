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

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      area: true,
      permissions: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { username: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { username, name, password, role, area, permissions } = body;

  if (!username || !name || !password) {
    return NextResponse.json({ error: "Username, nama, dan password wajib diisi." }, { status: 400 });
  }

  const pwError = validatePassword(password);
  if (pwError) {
    return NextResponse.json({ error: pwError }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Username sudah ada." }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username: username.toLowerCase(),
      name,
      passwordHash,
      role: role || "AO",
      area: area || [],
      permissions: permissions || {},
    },
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

  return NextResponse.json(user, { status: 201 });
}