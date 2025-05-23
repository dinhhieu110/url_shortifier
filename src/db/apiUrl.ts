import type { IUrl } from "@/types";
import supabase, { supabaseUrl } from "./supabase";
export async function getUrls(user_id: string) {
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", user_id);
  if (error) {
    console.log(error.message);
    throw new Error("Unable to load URLs");
  }
  return data;
}

export async function deleteUrl(id: string) {
  const { data, error } = await supabase.from("urls").delete().eq("id", id);
  if (error) {
    console.log(error.message);
    throw new Error("Unable to delete this url");
  }
  return data;
}

export async function createUrl(
  { title, original_url, custom_url, user_id }: IUrl,
  qrCode: Blob
) {
  const shortUrl = Math.random().toString(36).substring(2, 6);
  const fileName = `qr-${shortUrl}`;
  const { error: storageErr } = await supabase.storage
    .from("qrs")
    .upload(fileName, qrCode);
  if (storageErr) throw new Error(storageErr.message);
  const uploadedQR = `${supabaseUrl}/storage/v1/object/public/qrs/${fileName}`;

  const { data, error } = await supabase
    .from("urls")
    .insert([
      {
        title,
        original_url,
        custom_url: custom_url || null,
        user_id,
        short_url: shortUrl,
        qr: uploadedQR,
      },
    ])
    .select();
  if (error) {
    console.log(error.message);
    throw new Error("Unable to create new url");
  }
  return data;
}

export async function getOriginalUrl(shortUrlId: { id: string }) {
  const { data, error } = await supabase
    .from("urls")
    .select("id, original_url")
    .or(`short_url.eq.${shortUrlId.id}, custom_url.eq.${shortUrlId.id}`)
    .single();
  if (error) {
    console.log(error.message);
    throw new Error("Unable to fetch original url");
  }
  return data;
}

export async function getShortUrl({
  id,
  user_id,
}: {
  id: string;
  user_id: string;
}) {
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();
  if (error) {
    console.log(error.message);
    throw new Error("Unable to fetch short url");
  }
  return data;
}
