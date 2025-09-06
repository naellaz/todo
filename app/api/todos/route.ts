import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 5;
  const skip = (page - 1) * limit;

  const todos = await prisma.todo.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.todo.count();
  return NextResponse.json({ todos, total, page, limit });
}

export async function POST(req: NextRequest) {
  const { title } = await req.json();
  await prisma.todo.create({ data: { title } });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { id, done } = await req.json();
  await prisma.todo.update({ where: { id }, data: { done } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.todo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
