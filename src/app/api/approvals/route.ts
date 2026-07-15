import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pending = await prisma.taskStatus.findMany({
    where: { isPendingApproval: true, isApproved: false },
    include: {
      task: { include: { program: { select: { id: true, name: true, type: true } } } },
      user: { select: { id: true, name: true, username: true } },
    },
  });

  const history = await prisma.approvalLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      task: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ pending, history });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { taskId, userId, action, note } = body;

  if (!taskId || !userId || !action) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (action === "approve") {
    await prisma.taskStatus.update({
      where: { taskId_userId: { taskId, userId } },
      data: { isApproved: true, isPendingApproval: false, rejectionNote: null },
    });
  } else if (action === "reject") {
    await prisma.taskStatus.update({
      where: { taskId_userId: { taskId, userId } },
      data: { isPendingApproval: false, isApproved: false, rejectionNote: note || "Ditolak oleh PDO." },
    });
  }

  await prisma.approvalLog.create({
    data: {
      taskId,
      userId,
      action,
      note: note || null,
      createdById: session.user.id,
      createdAt: new Date().toISOString().slice(0, 10),
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    await prisma.approvalLog.delete({ where: { id } });
  } else {
    await prisma.approvalLog.deleteMany();
  }

  return NextResponse.json({ success: true });
}