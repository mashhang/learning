import { supabase } from "@/app/supabaseClient";

export const uploadToSupabase = async (file: File, folder = "lesson-media") => {
  const filename = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from(folder)
    .upload(`uploads/${filename}`, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(folder)
    .getPublicUrl(data.path);
  return urlData.publicUrl;
};
