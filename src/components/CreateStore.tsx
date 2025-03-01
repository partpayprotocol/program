"use client"
import { useVendorAccount } from '@/app/hooks/useVendor';
import { uploadBlobToCloudinary } from '@/app/utils/uploader';
import { useWallet } from '@solana/wallet-adapter-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { FormValues } from '@/app/types/form';
import { FaEdit } from 'react-icons/fa';

const CreateStore = () => {
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isPreviewing, setIsPreviewing] = useState(false);

    const { publicKey, connected } = useWallet();
    const { initializeVendor, getVendor } = useVendorAccount();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        defaultValues: {
            name: '',
            description: '',
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            // Create a preview URL
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: FormValues) => {
        if (!connected || !publicKey) {
            toast.error("Please connect your wallet first");
            return;
        }

        try {
            let imageUrl = '';

            if (image) {
                toast.loading("Uploading image...", { id: "image-upload" });
                const imageUrlResult = await uploadBlobToCloudinary(image);
                if (!imageUrlResult) {
                    toast.error("Image upload failed", { id: "image-upload" });
                    throw new Error("Image upload failed");
                }
                toast.success("Image uploaded successfully", { id: "image-upload" });
                imageUrl = imageUrlResult;
            }

            toast.loading("Creating your store...", { id: "store-creation" });

            const metadata = {
                name: data.name,
                description: data.description,
                image: imageUrl,
            };

            await initializeVendor.mutateAsync({
                publicKey,
                metadata
            });

            toast.success("Store created successfully!", { id: "store-creation" });
            reset();
            setImage(null);
            setImagePreview(null);
            setIsPreviewing(true);

        } catch (error) {
            console.error("Error creating store:", error);
            toast.error("Failed to create store");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen py-10 px-4">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-indigo-800 mb-6">Create Your Shop</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Shop Name
                        </label>
                        <input
                            id="name"
                            {...register("name", {
                                required: "Shop name is required",
                                minLength: {
                                    value: 3,
                                    message: "Name must be at least 3 characters"
                                }
                            })}
                            className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'} focus:border-transparent focus:outline-none focus:ring-2 transition duration-200`}
                            placeholder="Awesome Shop Name"
                            disabled={initializeVendor.isPending}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Shop Description
                        </label>
                        <textarea
                            id="description"
                            {...register("description", {
                                required: "Description is required",
                                minLength: {
                                    value: 10,
                                    message: "Description must be at least 10 characters"
                                }
                            })}
                            className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'} focus:border-transparent focus:outline-none focus:ring-2 transition duration-200`}
                            placeholder="Tell customers what makes your shop special..."
                            rows={4}
                            disabled={initializeVendor.isPending}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    <div>
                        <div className="relative flex items-center justify-center space-x-3">
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                disabled={initializeVendor.isPending}
                            />
                            {image &&
                                <div>
                                    <Image
                                        src={URL.createObjectURL(image)}
                                        alt="Equipment preview"
                                        className="object-cover rounded-lg shadow-sm w-[200px] h-[200px]"
                                        width={200}
                                        height={200}
                                    />
                                </div>
                            }
                            {!image ?
                                <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100 transition duration-200">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                        <p className="text-sm text-gray-500">
                                            <span className="font-medium">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                </label>
                                :
                                <label
                                    htmlFor="image"
                                    className={`flex items-center justify-center w-fit px-4 py-2 rounded-lg border border-dashed ${!image ? 'border-red-300 bg-red-50 text-red-600' : 'border-indigo-300 bg-indigo-50 text-indigo-600'} cursor-pointer hover:bg-indigo-100 transition`}
                                >
                                    <FaEdit />
                                </label>
                            }
                            {!image && <p className="absolute -bottom-5 left-0 text-red-500 text-xs">Image is required</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={initializeVendor.isPending}
                    >
                        {initializeVendor.isPending ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating your shop...
                            </div>
                        ) : 'Create My Shop'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateStore;