import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 5;
  const skip = (page - 1) * limit;

  const [todos, total] = await Promise.all([
    prisma.todo.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.todo.count(),
  ]);

  return new Response(JSON.stringify({ todos, total, page }));
}

export async function POST(req: Request) {
  const { title } = await req.json();
  if (!title) return new Response(JSON.stringify({ error: "Title required" }), { status: 400 });

  const todo = await prisma.todo.create({ data: { title } });
  return new Response(JSON.stringify(todo), { status: 201 });
}

export async function PUT(req: Request) {
  const { id, title, done } = await req.json();
  if (!id) return new Response(JSON.stringify({ error: "ID required" }), { status: 400 });

  const data: any = {};
  if (title !== undefined) data.title = title;
  if (done !== undefined) data.done = done;

  const updated = await prisma.todo.update({ where: { id }, data });
  return new Response(JSON.stringify(updated), { status: 200 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return new Response(JSON.stringify({ error: "ID required" }), { status: 400 });

  await prisma.todo.delete({ where: { id } });
  return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
}
