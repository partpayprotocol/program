import axios from "axios";
import toast from "react-hot-toast";

export const uploadBlobToCloudinary = async (blob: Blob, mediaType: string): Promise<string | null> => {
    const presetKey = process.env.NEXT_PUBLIC_PRESET_KEY;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;

    if (!presetKey || !cloudName) {
        toast.error("Missing Cloudinary configuration.");
        return null;
    }

    if (!blob || blob.size === 0) {
        console.error("No valid file to upload.");
        toast.error("Recording is empty or invalid.");
        return null;
    }

    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", presetKey);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/${mediaType === "image" ? "image" : mediaType}/upload`,
            formData
        );
        return response.data.secure_url;
    } catch (error: any) {
        console.error("Error uploading to Cloudinary:", error);
        toast.error(error.response?.data?.error?.message || "Error uploading file.");
        return null;
    }
};
