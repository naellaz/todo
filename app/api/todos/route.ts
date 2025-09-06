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
  const { id, title, done } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const data: any = {};
  if (title !== undefined) data.title = title; // update title
  if (done !== undefined) data.done = done;   // toggle done

  const updated = await prisma.todo.update({ where: { id }, data });
  return NextResponse.json(updated, { status: 200 });
}


export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.todo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
