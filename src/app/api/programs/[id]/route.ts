import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, type, notes, jadwal, aoIds } = body;

  if (!name || !jadwal?.length) {
    return NextResponse.json({ error: "Nama program dan minimal satu area wajib diisi." }, { status: 400 });
  }

  // Delete existing relations
  await prisma.jadwal.deleteMany({ where: { programId: id } });
  await prisma.programAO.deleteMany({ where: { programId: id } });

  const program = await prisma.program.update({
    where: { id },
    data: {
      name,
      type: type || "Program Development",
      notes: notes || null,
      jadwal: {
        create: jadwal.map((j: { area: string; startDate: string; endDate: string }) => ({
          area: j.area,
          startDate: j.startDate || null,
          endDate: j.endDate || null,
        })),
      },
      aos: aoIds?.length
        ? { create: aoIds.map((userId: string) => ({ userId })) }
        : undefined,
    },
    include: {
      jadwal: true,
      aos: { include: { user: { select: { id: true, name: true, username: true } } } },
      tasks: {
        include: {
          pics: { include: { user: { select: { id: true, name: true, username: true } } } },
          statuses: true,
        },
      },
    },
  });

  return NextResponse.json(program);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.program.delete({ where: { id } });
  return NextResponse.json({ success: true });
}