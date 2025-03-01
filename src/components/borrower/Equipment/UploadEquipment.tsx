"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Keypair } from "@solana/web3.js";
import axios from "axios";
import { useEquipmentAccount } from "@/app/hooks/useEquipment";
import { EquipmentUploadValues } from "@/app/types/form";
import { apiUrl } from "@/app/utils/constant";
import { FaEdit } from "react-icons/fa";
import { useVendorAccount } from "@/app/hooks/useVendor";

const UploadEquipment = () => {
  const [image, setImage] = useState<File | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [vendorPda, setVendorPda] = useState<string | null>(null);
  const [vendorCollectionPda, setVendorCollectionPda] = useState<string | null>(null);
  const [uniqueId] = useState(Keypair.generate().publicKey.toBase58());

  const { publicKey, connected } = useWallet();
  const { initializeEquipment } = useEquipmentAccount();
  const { initializeVendor, getVendor } = useVendorAccount();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<EquipmentUploadValues>({
    defaultValues: {
      name: "",
      description: "",
      pricePerUnit: "",
      minimumDeposit: "",
      totalQuantity: "",
      maxDuration: "",
      paymentPreference: "Both",
    },
  });

  const durationOptions = [
    { label: "1 Week", value: 7 },
    { label: "2 Weeks", value: 14 },
    { label: "1 Month", value: 30 },
    { label: "3 Months", value: 90 },
    { label: "5 Months", value: 150 },
    { label: "6 Months", value: 180 },
    { label: "8 Months", value: 240 },
    { label: "1 Year", value: 365 },
    { label: "1 Year 6 Months", value: 540 },
    { label: "2 Years", value: 730 },
  ];

  const paymentPreferenceOptions = [
    { label: "Installment Only", value: "Part" },
    { label: "Full Payment Only", value: "Full" },
    { label: "Both", value: "Both" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  const onSubmitPreview = async (data: EquipmentUploadValues) => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!image) {
      toast.error("Please upload an image");
      return;
    }

    try {
      // Check if vendor exists
      let vendorData = await getVendor.data;
      if (!vendorData) {
        // Vendor doesn't exist, create one
        const vendorResponse = await initializeVendor.mutateAsync({
          publicKey,
          metadata: { name: `${publicKey.toBase58()}'s Vendor Profile` },
        });
        // Wait for vendor creation to complete
        vendorData = await getVendor.refetch().then((res) => res.data);
        if (!vendorData) throw new Error("Failed to create vendor");
      }

      setVendorPda(vendorData.vendorPda);
      setVendorCollectionPda(vendorData.collectionPda);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("image", image);
      formData.append("minimumDeposit", data.minimumDeposit);
      formData.append("pricePerUnit", data.pricePerUnit);
      formData.append("totalQuantity", data.totalQuantity);
      formData.append("maxDuration", data.maxDuration);
      formData.append("paymentPreference", data.paymentPreference);
      formData.append("owner", publicKey.toBase58());

      const metadataResponse = await axios.post(`${apiUrl}/metadata/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uri = metadataResponse.data.uri;

      if (!uri) throw new Error("Failed to get URI");
      setPreviewUri(uri);
      setIsPreviewing(true);
    } catch (error) {
      console.error("Error previewing equipment:", error);
      toast.error(`Failed to preview equipment: ${error.message}`);
    }
  };

  const handleEdit = () => {
    setIsPreviewing(false);
    setPreviewUri(null);
  };

  const handleFinalSubmit = async () => {
    if (!connected || !publicKey || !previewUri || !vendorPda || !vendorCollectionPda) {
      toast.error("Cannot submit: Missing data");
      return;
    }

    const formValues = getValues();

    try {
      await initializeEquipment.mutateAsync({
        wallet: { publicKey },
        vendorPda: new PublicKey(vendorPda),
        vendorCollectionPda: new PublicKey(vendorCollectionPda),
        name: formValues.name,
        uri: previewUri,
        minimumAmount: Number(formValues.minimumDeposit),
        totalAmount: Number(formValues.pricePerUnit),
        quantity: Number(formValues.totalQuantity),
        maxDuration: Number(formValues.maxDuration) * 24 * 60 * 60,
        paymentPreference: formValues.paymentPreference as "Part" | "Full" | "Both",
      });

      reset();
      setImage(null);
      setPreviewUri(null);
      setIsPreviewing(false);
      setVendorPda(null);
      setVendorCollectionPda(null);
      toast.success("Equipment created successfully!");
    } catch (error) {
      console.error("Error creating equipment:", error);
      toast.error(`Failed to create equipment: ${error.message}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-indigo-800 text-center">Add New Equipment</h1>
      <form onSubmit={handleSubmit(onSubmitPreview)} className="space-y-5 bg-white">
        <div className="grid grid-cols-1 gap-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
              Equipment Name
            </label>
            <input
              id="name"
              className={`w-full px-4 py-2 bg-white text-zinc-800 outline-none rounded-lg border ${errors.name ? "border-red-500" : "border-gray-200"} focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition`}
              placeholder="What's your equipment called?"
              disabled={initializeEquipment.isPending}
              {...register("name", { required: "Equipment name is required" })}
            />
            {errors.name && <p className="mt-1 text-red-500 text-xs">{errors.name.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">
            Equipment Description
          </label>
          <textarea
            id="description"
            className={`w-full px-4 py-2 bg-white text-zinc-800 outline-none rounded-lg border ${errors.description ? "border-red-500" : "border-gray-200"} focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition`}
            placeholder="Describe your equipment in detail..."
            rows={3}
            disabled={initializeEquipment.isPending}
            {...register("description", { required: "Description is required" })}
          />
          {errors.description && <p className="mt-1 text-red-500 text-xs">{errors.description.message}</p>}
        </div>

        <div className="relative flex items-center justify-center space-x-3">
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={initializeEquipment.isPending}
          />
          {image && (
            <div>
              <Image
                src={URL.createObjectURL(image)}
                alt="Equipment preview"
                className="object-cover rounded-lg shadow-sm w-[200px] h-[200px]"
                width={200}
                height={200}
              />
            </div>
          )}
          {!image ? (
            <label
              htmlFor="image"
              className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100 transition duration-200"
            >
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
          ) : (
            <label
              htmlFor="image"
              className={`flex items-center justify-center w-fit px-4 py-2 rounded-lg border border-dashed ${!image ? "border-red-300 bg-red-50 text-red-600" : "border-indigo-300 bg-indigo-50 text-indigo-600"} cursor-pointer hover:bg-indigo-100 transition`}
            >
              <FaEdit />
            </label>
          )}
          {!image && <p className="absolute -bottom-5 left-0 text-red-500 text-xs">Image is required</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="minimumDeposit" className="block text-sm font-medium text-gray-600 mb-1">
              Minimum Deposit (USDC)
            </label>
            <div className="relative">
              <input
                id="minimumDeposit"
                className={`w-full pl-8 pr-4 py-2 bg-white text-zinc-800 rounded-lg border ${errors.minimumDeposit ? "border-red-500" : "border-gray-200"} focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition`}
                placeholder="58000"
                type="number"
                step="1000"
                disabled={initializeEquipment.isPending}
                {...register("minimumDeposit", {
                  required: "Minimum deposit is required",
                  min: { value: 1000, message: "Minimum deposit must be at least 1000 USDC" },
                })}
              />
              <span className="absolute left-3 top-2 text-gray-500">$</span>
            </div>
            {errors.minimumDeposit && <p className="mt-1 text-red-500 text-xs">{errors.minimumDeposit.message}</p>}
          </div>

          <div>
            <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-600 mb-1">
              Price per Unit (USDC)
            </label>
            <div className="relative">
              <input
                id="pricePerUnit"
                className={`w-full pl-8 pr-4 py-2 bg-white text-zinc-800 rounded-lg border ${errors.pricePerUnit ? "border-red-500" : "border-gray-200"} focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition`}
                placeholder="348000"
                type="number"
                step="1000"
                disabled={initializeEquipment.isPending}
                {...register("pricePerUnit", {
                  required: "Price per unit is required",
                  min: { value: 1000, message: "Price must be at least 1000 USDC" },
                })}
              />
              <span className="absolute left-3 top-2 text-gray-500">$</span>
            </div>
            {errors.pricePerUnit && <p className="mt-1 text-red-500 text-xs">{errors.pricePerUnit.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="totalQuantity" className="block text-sm font-medium text-gray-600 mb-1">
              Total Quantity
            </label>
            <input
              id="totalQuantity"
              className={`w-full px-4 py-2 bg-white text-zinc-800 outline-none rounded-lg border ${errors.totalQuantity ? "border-red-500" : "border-gray-200"} focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition`}
              placeholder="10"
              type="number"
              step="1"
              disabled={initializeEquipment.isPending}
              {...register("totalQuantity", {
                required: "Quantity is required",
                min: { value: 1, message: "Quantity must be at least 1" },
              })}
            />
            {errors.totalQuantity && <p className="mt-1 text-red-500 text-xs">{errors.totalQuantity.message}</p>}
          </div>

          <div>
            <label htmlFor="maxDuration" className="block text-sm font-medium text-gray-600 mb-1">
              Max Duration
            </label>
            <select
              id="maxDuration"
              className={`w-full p-2 border rounded text-gray-700 ${errors.maxDuration ? "border-red-500" : "border-gray-200"}`}
              disabled={initializeEquipment.isPending}
              {...register("maxDuration", { required: "Max duration is required" })}
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.maxDuration && <p className="mt-1 text-red-500 text-xs">{errors.maxDuration.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="paymentPreference" className="block text-sm font-medium text-gray-600 mb-1">
            Payment Preference
          </label>
          <select
            id="paymentPreference"
            className={`w-full p-2 border rounded text-gray-700 ${errors.paymentPreference ? "border-red-500" : "border-gray-200"}`}
            disabled={initializeEquipment.isPending}
            {...register("paymentPreference", { required: "Payment preference is required" })}
          >
            {paymentPreferenceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.paymentPreference && <p className="mt-1 text-red-500 text-xs">{errors.paymentPreference.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-4"
          disabled={initializeEquipment.isPending || !connected}
        >
          {initializeEquipment.isPending ? "Processing..." : "Preview Equipment Details"}
        </button>
      </form>
    </div>
  );
};

export default UploadEquipment;