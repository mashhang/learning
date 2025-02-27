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

export async function PUT(req: NextRequest) {
  // Extract 'id' from the request's URL path
  const { pathname } = req.nextUrl;
  const id = pathname.split("/").pop()!; // Extracting the 'id' from the URL

  try {
    // Extract title and content from the request body
    const { title, content } = await req.json();

    // Check if the lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Update the lesson
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
