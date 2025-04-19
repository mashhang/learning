import fs from "fs";
import path from "path";
export const deleteFile = (relativePath) => {
    const filePath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted file: ${filePath}`);
    }
    else {
        console.warn(`⚠️ File not found: ${filePath}`);
    }
};
