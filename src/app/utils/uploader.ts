import axios from "axios";
import toast from "react-hot-toast";

export const uploadBlobToCloudinary = async (blob: Blob, type: "image" | "video" = "image"): Promise<string | null> => {
  const presetKey = process.env.NEXT_PUBLIC_PRESET_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;

  if (!presetKey || !cloudName) {
    toast.error("An error occurred...");
    return null;
  }

  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", presetKey);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error: any) {
    console.error(`Error uploading ${type} to Cloudinary:`, error);
    toast.error(`Error uploading ${type}.`);
    return null;
  }
};