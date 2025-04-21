// scripts/migrateMediaUrls.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SUPABASE_BASE_URL =
  "https://bagjouqdnednijyoqqth.supabase.co/storage/v1/object/public/lesson-media";

async function runMigration() {
  const pages = await prisma.lessonPage.findMany();

  for (const page of pages) {
    const media = page.media || "";
    if (!media.startsWith("http")) {
      const updatedUrl = `${SUPABASE_BASE_URL}/${media.replace(
        /^\/uploads\//,
        ""
      )}`;
      await prisma.lessonPage.update({
        where: { id: page.id },
        data: { media: updatedUrl },
      });
      console.log(`✅ Updated page ${page.id} -> ${updatedUrl}`);
    }
  }

  console.log("🎉 Migration complete.");
  await prisma.$disconnect();
}

runMigration().catch((e) => {
  console.error("❌ Migration failed:", e);
  prisma.$disconnect();
});
