import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await prisma.task.findMany({
    include: {
      pics: { include: { user: { select: { id: true, name: true, username: true } } } },
      statuses: { include: { user: { select: { id: true, name: true, username: true } } } },
      approvals: {
        include: {
          user: { select: { id: true, name: true, username: true } },
          createdBy: { select: { id: true, name: true } },
        },
      },
      statusHistory: {
        include: { user: { select: { id: true, name: true, username: true } } },
        orderBy: { createdAt: "desc" },
      },
      program: { select: { id: true, name: true, type: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { deadline: "asc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { programId, name: taskName, deadline, notes, picIds } = body;

  if (!programId || !taskName || !deadline) {
    return NextResponse.json({ error: "Nama, deadline, dan program wajib diisi." }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      programId,
      name: taskName,
      deadline,
      notes: notes || null,
      createdById: session.user.id,
      pics: picIds?.length
        ? { create: picIds.map((userId: string) => ({ userId })) }
        : undefined,
    },
    include: {
      pics: { include: { user: { select: { id: true, name: true, username: true } } } },
      statuses: true,
      approvals: {
        include: {
          user: { select: { id: true, name: true, username: true } },
          createdBy: { select: { id: true, name: true } },
        },
      },
      statusHistory: {
        include: { user: { select: { id: true, name: true, username: true } } },
        orderBy: { createdAt: "desc" },
      },
      program: { select: { id: true, name: true, type: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  // Insert "dibuat" history for each PIC
  if (picIds?.length) {
    await prisma.taskStatusHistory.createMany({
      data: picIds.map((userId: string) => ({
        taskId: task.id,
        userId,
        status: "dibuat",
        notes: null,
      })),
    });
  }

  return NextResponse.json(task, { status: 201 });
}