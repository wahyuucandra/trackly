import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const page = parseInt(searchParams.get("page") || "");
  const limit = parseInt(searchParams.get("limit") || "");

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (type) where.type = type;

  const include = {
    jadwal: true,
    aos: { include: { user: { select: { id: true, name: true, username: true } } } },
    tasks: {
      include: {
        pics: { include: { user: { select: { id: true, name: true, username: true } } } },
        statuses: { include: { user: { select: { id: true, name: true, username: true } } } },
      },
    },
    createdBy: { select: { id: true, name: true } },
  };

  // Paginated response
  if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
    const [total, programs] = await Promise.all([
      prisma.program.count({ where }),
      prisma.program.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: programs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  // Backward-compatible: return plain array
  const programs = await prisma.program.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(programs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, type, notes, jadwal, aoIds } = body;

  if (!name || !jadwal?.length) {
    return NextResponse.json({ error: "Nama program dan minimal satu area wajib diisi." }, { status: 400 });
  }

  const program = await prisma.program.create({
    data: {
      name,
      type: type || "Program Development",
      notes: notes || null,
      createdById: session.user.id,
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

  return NextResponse.json(program, { status: 201 });
}