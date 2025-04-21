import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service key for upload scripts
);

const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "uploads");
const BUCKET_NAME = "lesson-media";

async function migrateFiles() {
  const files = fs.readdirSync(LOCAL_UPLOADS_DIR);

  for (const filename of files) {
    const filePath = path.join(LOCAL_UPLOADS_DIR, filename);
    const fileBuffer = fs.readFileSync(filePath);

    // 👇 Add your custom prefix logic here
    const customPrefix = "uploads/"; // You can change this
    const customFilename = `${customPrefix}${filename}`; // e.g. lesson-page-abc123.png

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`uploads/${customFilename}`, fileBuffer, {
        upsert: true,
        contentType: "image/jpeg", // or detect based on file ext
      });

    if (error) {
      console.error(`❌ Failed to upload ${filename}:`, error.message);
    } else {
      console.log(`✅ Uploaded ${filename}`);
    }
  }
}

migrateFiles();
