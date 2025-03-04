"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Keypair } from "@solana/web3.js";
import axios from "axios";
import { useEquipmentAccount } from "@/app/hooks/useEquipment";
import { useVendorAccount } from "@/app/hooks/useVendor";
import { EquipmentUploadValues } from "@/app/types/form";
import { apiUrl } from "@/app/utils/constant";
import { uploadBlobToCloudinary } from "@/app/utils/uploader";
import Loading from "@/components/Loading";
import { BiCamera, BiCheckCircle, BiCreditCard, BiEdit, BiPackage, BiSave, BiUpload, BiX } from "react-icons/bi";
import { CiClock1 } from "react-icons/ci";
import { FaDollarSign } from "react-icons/fa";
import { FiFilm } from "react-icons/fi";
import { addNewUser, durationOptions, paymentPreferenceOptions } from "@/app/utils/lib";
import { useRouter } from "next/navigation";

const UploadEquipment = () => {
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewImageUris, setPreviewImageUris] = useState<string[]>([]);
  const [previewVideoUri, setPreviewVideoUri] = useState<string | null>(null);
  const [metadataUri, setMetadataUri] = useState<string | null>(null);
  const [vendorPda, setVendorPda] = useState<string | null>(null);
  const [vendorCollectionPda, setVendorCollectionPda] = useState<string | null>(null);
  const [isVendorLoading, setIsVendorLoading] = useState(false);

  const { publicKey, connected } = useWallet();
  const { initializeEquipment } = useEquipmentAccount();
  const { initializeVendor, getVendor } = useVendorAccount();
  const router = useRouter()

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - images.length);
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideo(file);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const onSubmitPreview = async (data: EquipmentUploadValues) => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (images.length === 0 && !video) {
      toast.error("Please upload at least one image or a video");
      return;
    }

    setIsVendorLoading(true);
    await addNewUser(publicKey)
    try {
      let vendorData = await getVendor.data;
      console.log("vendorData: ", vendorData)
      if (!vendorData) {
        console.log("calling creation")
        await initializeVendor.mutateAsync({
          publicKey,
          metadata: { name: `Vendor Profile` },
        });
        vendorData = await getVendor.refetch().then((res) => res.data);
        if (!vendorData) throw new Error("Failed to create vendor");
      }

      console.log("vendorData: ", vendorData)
      setVendorPda(vendorData.vendorPda);
      setVendorCollectionPda(vendorData.collectionPda);

      const imageUploadPromises = images.map((image) => uploadBlobToCloudinary(image));
      const imageUris = await Promise.all(imageUploadPromises);
      const validImageUris = imageUris.filter((uri): uri is string => uri !== null);
      if (validImageUris.length !== images.length) throw new Error("Some images failed to upload");

      let videoUri: string | null = null;
      if (video) {
        videoUri = await uploadBlobToCloudinary(video);
        if (!videoUri) throw new Error("Video failed to upload");
      }

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      validImageUris.forEach((uri, index) => formData.append(`images[${index}]`, uri));
      if (videoUri) formData.append("video", videoUri);
      formData.append("image", validImageUris[0]);
      formData.append("minimumDeposit", data.minimumDeposit);
      formData.append("pricePerUnit", data.pricePerUnit);
      formData.append("totalQuantity", data.totalQuantity);
      formData.append("maxDuration", data.maxDuration);
      formData.append("paymentPreference", data.paymentPreference);
      formData.append("owner", publicKey.toBase58());

      console.log("formData: ", formData)

      const metadataResponse = await axios.post(`${apiUrl}/metadata/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const metadataUriResult = metadataResponse.data.uri;
      if (!metadataUriResult) throw new Error("Failed to get metadata URI");

      setPreviewImageUris(validImageUris);
      setPreviewVideoUri(videoUri);
      setMetadataUri(metadataUriResult);
      setIsPreviewing(true);
    } catch (error) {
      console.error("Error previewing equipment:", error);
      toast.error(`Failed to preview equipment.`);
    } finally {
      setIsVendorLoading(false);
    }
  };

  const handleEdit = () => {
    setIsPreviewing(false);
    setPreviewImageUris([]);
    setPreviewVideoUri(null);
    setMetadataUri(null);
  };

  const handleFinalSubmit = async () => {
    if (!connected || !publicKey || !metadataUri || !vendorPda || !vendorCollectionPda) {
      toast.error("Cannot submit: Missing data");
      return;
    }

    const formValues = getValues();

    let paymentPreferenceObj;
    switch (formValues.paymentPreference) {
      case "Part":
        paymentPreferenceObj = { part: {} };
        break;
      case "Full":
        paymentPreferenceObj = { full: {} };
        break;
      case "Both":
        paymentPreferenceObj = { both: {} };
        break;
      default:
        throw new Error("Invalid payment preference");
    }

    const metadata = {
      name: formValues.name,
      uri: metadataUri,
      description: formValues.description
    }

    try {
      await initializeEquipment.mutateAsync({
        publicKey,
        vendorPda: new PublicKey(vendorPda),
        vendorCollectionPda: new PublicKey(vendorCollectionPda),
        metadata,
        minimumDeposit: Number(formValues.minimumDeposit),
        price: Number(formValues.pricePerUnit),
        quantity: Number(formValues.totalQuantity),
        maxDuration: Number(formValues.maxDuration) * 24 * 60 * 60,
        paymentPreference: paymentPreferenceObj,
        images: previewImageUris,
        video: previewVideoUri, 
      });

      reset();
      setImages([]);
      setVideo(null);
      setPreviewImageUris([]);
      setPreviewVideoUri(null);
      setMetadataUri(null);
      setIsPreviewing(false);
      setVendorPda(null);
      setVendorCollectionPda(null);
      toast.success("Equipment created successfully!");

      router.push("/equipments")
    } catch (error) {
      console.error("Error creating equipment:", error);
      toast.error(`Failed to create equipment.`);
    }
  };

  return (
    <>
      {(isVendorLoading || initializeEquipment.isPending) && <Loading />}
      <div className="max-w-4xl mx-auto rounded-2xl shadow-lg overflow-hidden my-4 mb-10">
        <div className="px-8 pb-10">
        {!isPreviewing ? (
            <form onSubmit={handleSubmit(onSubmitPreview)} className="space-y-8">
            {/* Equipment Basics Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-indigo-800 flex items-center mb-4">
                <BiPackage className="mr-2 text-indigo-600" size={20} />
                Equipment Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Name
                  </label>
                  <input
                    id="name"
                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="What's your equipment called?"
                    disabled={initializeEquipment.isPending}
                    {...register("name", { required: "Equipment name is required" })}
                  />
                  {errors.name && <p className="mt-1 text-red-500 text-xs">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Description
                  </label>
                  <textarea
                    id="description"
                    className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Describe your equipment in detail..."
                    rows={4}
                    disabled={initializeEquipment.isPending}
                    {...register("description", { required: "Description is required" })}
                  />
                  {errors.description && <p className="mt-1 text-red-500 text-xs">{errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* Media Files Section */}
            <div className="bg-white px-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-indigo-800 flex items-center mb-4">
                <BiCamera className="mr-2 text-indigo-600" size={20} />
                Media Files
              </h2>

              <div className="space-y-6 w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Images</label>
                  <div className="flex flex-wrap justify-center gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group w-[200px]">
                        <Image
                          src={URL.createObjectURL(image)}
                          alt={`Uploaded image ${index + 1}`}
                          className="h-24 w-full object-cover rounded-lg border border-gray-200"
                          width={200}
                          height={200}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <BiX size={16} />
                        </button>
                      </div>
                    ))}
                    <label className="relative group w-full">
                      <div className="h-24 w-full bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-indigo-400 transition cursor-pointer">
                        <BiUpload className="text-gray-400 group-hover:text-indigo-500 transition" size={24} />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={initializeEquipment.isPending}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Video (Optional)</label>
                  {video ? (
                    <div className="relative group">
                      <video
                        src={URL.createObjectURL(video)}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        controls
                      />
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <BiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-indigo-400 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiFilm className="text-gray-400 mb-2" size={28} />
                        <p className="text-sm text-gray-500">Upload a video showcasing your equipment</p>
                        <p className="text-xs text-gray-400 mt-1">MP4, MOV or AVI</p>
                      </div>
                      <input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                        disabled={initializeEquipment.isPending}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-indigo-800 flex items-center mb-4">
                <FaDollarSign className="mr-2 text-indigo-600" size={20} />
                Pricing & Availability
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="minimumDeposit" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Deposit (USDC)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        id="minimumDeposit"
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        placeholder="58000"
                        type="number"
                        step="1"
                        disabled={initializeEquipment.isPending}
                        {...register("minimumDeposit", {
                          required: "Minimum deposit is required",
                          min: { value: 1, message: "Minimum deposit must be at least 1 USDC" },
                        })}
                      />
                      {errors.minimumDeposit && <p className="mt-1 text-red-500 text-xs">{errors.minimumDeposit.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Unit (USDC)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        id="pricePerUnit"
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        placeholder="348000"
                        type="number"
                        step="1"
                        disabled={initializeEquipment.isPending}
                        {...register("pricePerUnit", {
                          required: "Price per unit is required",
                          min: { value: 1, message: "Price must be at least 1 USDC" },
                        })}
                      />
                      {errors.pricePerUnit && <p className="mt-1 text-red-500 text-xs">{errors.pricePerUnit.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="totalQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Total Quantity
                    </label>
                    <input
                      id="totalQuantity"
                      className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
                    <label htmlFor="maxDuration" className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center">
                        <CiClock1 size={16} className="mr-1 text-gray-500" />
                        Max Duration
                      </div>
                    </label>
                    <select
                      id="maxDuration"
                      className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <BiCreditCard size={16} className="mr-1 text-gray-500" />
                      Payment Preference
                    </div>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {paymentPreferenceOptions.map((option) => (
                      <div key={option.value} className="relative">
                        <input
                          type="radio"
                          id={`payment-${option.value.toLowerCase()}`}
                          name="paymentPreference"
                          value={option.value}
                          className="sr-only peer"
                          disabled={initializeEquipment.isPending}
                          {...register("paymentPreference", { required: "Payment preference is required" })}
                          defaultChecked={option.value === "Both"}
                        />
                        <label
                          htmlFor={`payment-${option.value.toLowerCase()}`}
                          className="flex flex-col items-center justify-center p-4 bg-white border rounded-lg cursor-pointer peer-checked:border-indigo-600 peer-checked:bg-indigo-50 hover:bg-gray-50 transition"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {option.label.split(" ")[0]}
                          </span>
                          <span className="text-xs text-gray-500">{option.label.split(" ").slice(1).join(" ")}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.paymentPreference && <p className="mt-1 text-red-500 text-xs">{errors.paymentPreference.message}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center text-lg"
              disabled={initializeEquipment.isPending || !connected}
            >
              <BiCheckCircle className="mr-2" size={20} />
              Preview Equipment Details
            </button>
          </form>
          )
          :(
            <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-indigo-800">Preview Your Listing</h2>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">Ready to Submit</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    {previewImageUris.length > 0 && (
                      <Image
                        src={previewImageUris[0]}
                        alt="Equipment preview"
                        className="w-full h-full object-cover"
                        width={400}
                        height={320}
                      />
                    )}
                  </div>

                  <div className="flex space-x-2 mb-4">
                    {previewImageUris.map((uri, index) => (
                      <div key={index} className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                        <Image
                          src={uri}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          width={64}
                          height={64}
                        />
                      </div>
                    ))}
                    {previewVideoUri && (
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                        <video src={previewVideoUri} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{getValues("name")}</h3>
                    <p className="text-sm text-gray-500 line-clamp-3">{getValues("description")}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-lg font-bold text-gray-800">${Number(getValues("pricePerUnit")).toLocaleString()}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Deposit</p>
                      <p className="text-lg font-bold text-gray-800">${Number(getValues("minimumDeposit")).toLocaleString()}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="text-lg font-bold text-gray-800">{getValues("totalQuantity")} units</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Max Duration</p>
                      <p className="text-lg font-bold text-gray-800">
                        {durationOptions.find((opt) => opt.value === Number(getValues("maxDuration")))?.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition flex items-center"
                    >
                      <BiEdit className="mr-1" size={16} />
                      Edit
                    </button>

                    <button
                      onClick={handleFinalSubmit}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                      disabled={initializeEquipment.isPending}
                    >
                      <BiSave className="mr-1" size={16} />
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadEquipment;