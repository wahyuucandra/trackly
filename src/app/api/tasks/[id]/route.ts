import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name: taskName, deadline, notes, picIds, status, aoNote, evidenceUrl, submitForApproval } = body;

  // Admin edit
  if (session.user.role === "Admin") {
    // Delete existing PICs
    if (picIds !== undefined) {
      await prisma.taskPIC.deleteMany({ where: { taskId: id } });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        name: taskName,
        deadline,
        notes: notes ?? null,
        pics: picIds?.length
          ? { create: picIds.map((userId: string) => ({ userId })) }
          : undefined,
      },
      include: {
        pics: { include: { user: { select: { id: true, name: true, username: true } } } },
        statuses: true,
        program: { select: { id: true, name: true, type: true } },
      },
    });
    return NextResponse.json(task);
  }

  // AO update
  if (status) {
    await prisma.taskStatus.upsert({
      where: { taskId_userId: { taskId: id, userId: session.user.id } },
      create: {
        taskId: id,
        userId: session.user.id,
        status,
        notes: aoNote || null,
        isPendingApproval: submitForApproval || false,
        isApproved: false,
      },
      update: {
        status,
        notes: aoNote || null,
        isPendingApproval: submitForApproval || false,
        isApproved: false,
        rejectionNote: null,
      },
    });

    // Always insert history
    await prisma.taskStatusHistory.create({
      data: {
        taskId: id,
        userId: session.user.id,
        status,
        notes: aoNote || null,
        evidenceUrl: evidenceUrl || null,
      },
    });

    // Update task evidenceUrl
    if (evidenceUrl !== undefined) {
      await prisma.task.update({
        where: { id },
        data: { evidenceUrl: evidenceUrl || null, updatedAt: new Date().toISOString().slice(0, 10) },
      });
    }
  }

  const task = await prisma.task.findUnique({
    where: { id },
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
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}