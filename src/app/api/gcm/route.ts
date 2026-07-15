import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.mstGcm.findMany({
    select: {
      id: true,
      condition: true,
      cd_value: true,
      desc_value: true,
      flag_active: true,
      createdAt: true,
    },
    orderBy: { cd_value: "asc" },
  });

  return NextResponse.json(data);
}