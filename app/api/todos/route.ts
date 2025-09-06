import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 5;
  const skip = (page - 1) * limit;

  const [todos, total] = await Promise.all([
    prisma.todo.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.todo.count(),
  ]);

  return NextResponse.json({ todos, total, page });
}

export async function POST(req: NextRequest) {
  const { title } = await req.json();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const todo = await prisma.todo.create({ data: { title } });
  return NextResponse.json(todo, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { id, title, done } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const data: any = {};
  if (title !== undefined) data.title = title;
  if (done !== undefined) data.done = done;

  const updated = await prisma.todo.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.todo.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted successfully" });
}
