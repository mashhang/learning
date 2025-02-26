import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;
//     const { title, content } = await req.json();

//     const existingLesson = await prisma.lesson.findUnique({
//       where: { id },
//     });

//     if (!existingLesson) {
//       return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
//     }

//     const updatedLesson = await prisma.lesson.update({
//       where: { id },
//       data: { title, content },
//     });

//     return NextResponse.json(updatedLesson);
//   } catch (error) {
//     console.error("Update Lesson Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // id is directly available in params
    const { title, content } = await req.json(); // assuming you're sending these fields in the request body

    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: { title, content },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error("Update Lesson Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
