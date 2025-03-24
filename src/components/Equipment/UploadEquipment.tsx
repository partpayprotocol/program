"use client";
import Image from "next/image";
import React, { useCallback, useRef, useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { useEquipmentAccount } from "@/app/hooks/useEquipment";
import { useVendorAccount } from "@/app/hooks/useVendor";
import { EquipmentUploadValues } from "@/app/types/form";
import Loading from "@/components/Loading";
import { BiCamera, BiCheckCircle, BiCreditCard, BiEdit, BiPackage, BiSave, BiUpload, BiX } from "react-icons/bi";
import { CiClock1 } from "react-icons/ci";
import { FaDollarSign, FaCamera } from "react-icons/fa";
import { FiFilm } from "react-icons/fi";
import { BiPlayCircle, BiStopCircle } from "react-icons/bi";
import { BsPauseCircle } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { AcceptedRequest } from "@/app/types/request";
import { uploadBlobToCloudinary } from "@/utils/uploader";
import { addNewUser, durationOptions, paymentPreferenceOptions } from "@/utils/lib";
import { apiUrl } from "@/utils/constant";

const UploadEquipment = () => {
  const [images, setImages] = useState<File[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewImageUris, setPreviewImageUris] = useState<string[]>([]);
  const [previewVideoUri, setPreviewVideoUri] = useState<string | null>(null);
  const [metadataUri, setMetadataUri] = useState<string | null>(null);
  const [vendorPda, setVendorPda] = useState<string | null>(null);
  const [vendorCollectionPda, setVendorCollectionPda] = useState<string | null>(null);
  const [isVendorLoading, setIsVendorLoading] = useState(false);
  const [paymentPreference, setPaymentPreference] = useState('both');
  const [acceptedRequests, setAcceptedRequests] = useState<AcceptedRequest[]>([
    {
      id: 1,
      title: "Dance Tutorial Equipment",
      description: "Equipment for a beginner-friendly jazz dance tutorial",
      category: "Dance",
      videoUrl: "https://example.com/video1.mp4",
    },
    {
      id: 2,
      title: "Photography Gear",
      description: "Professional camera and lighting for photography sessions",
      category: "Photography",
      videoUrl: "https://example.com/video2.mp4",
    },
  ]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [liveUrl, setLiveUrl] = useState<string>("");
  const [recordingTime, setRecordingTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const { publicKey, connected } = useWallet();
  const { initializeEquipment } = useEquipmentAccount();
  const { initializeVendor, getVendor } = useVendorAccount();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
    setValue,
  } = useForm<EquipmentUploadValues>({
    defaultValues: {
      name: "",
      description: "",
      pricePerUnit: "",
      minimumDeposit: "",
      totalQuantity: "",
      maxDuration: "",
      paymentPreference: "both",
    },
  });

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (!videoRef.current) {
      console.error("Video ref is not initialized after mount.");
      toast.error("Video element failed to initialize. Please refresh the page.");
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!videoRef.current) {
      console.error("Video ref is not available.");
      toast.error("Video element not found. Please refresh the page.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
        toast.error("Failed to play video stream. Check camera permissions.");
      });
      videoRef.current.muted = true;

      setMediaStream(stream);
      const recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const finalBlob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType,
        });

        if (finalBlob.size === 0) {
          toast.error("Recording failed. Please try again.");
          return;
        }

        setIsUploading(true);
        const url = await uploadBlobToCloudinary(finalBlob, "video");
        if (url && typeof url === "string") {
          setLiveUrl(url);
          setPreviewVideoUri(url);
          setIsUploading(false);
          toast.success("Recording uploaded successfully!");
        } else {
          toast.error("Failed to upload video. No URL returned.");
          setIsUploading(false);
        }

        recordedChunksRef.current = [];
      };

      setMediaRecorder(recorder);
      recorder.start();
      setRecording(true);
      setPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      toast.error("Error accessing camera. Please allow camera access and try again.");
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      setPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [mediaRecorder]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      setPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  }, [mediaRecorder]);

  const stopRecording = useCallback(async () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaStream?.getTracks().forEach((track) => track.stop());

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.muted = false;
      }

      if (timerRef.current) clearInterval(timerRef.current);

      setRecording(false);
      setPaused(false);
      setRecordingTime(0);
    }
  }, [mediaRecorder, mediaStream]);

  const retakeVideo = () => {
    setLiveUrl("");
    setPreviewVideoUri(null);
    recordedChunksRef.current = [];
    setRecording(false);
    setPaused(false);
    setRecordingTime(0);
  };

  const handleRequestSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const requestId = Number(e.target.value);
    if (requestId === 0) {
      setValue("name", "");
      setValue("description", "");
      return;
    }
    const selectedRequest = acceptedRequests.find((req) => req.id === requestId);
    if (selectedRequest) {
      setValue("name", selectedRequest.title);
      setValue("description", selectedRequest.description);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - images.length);
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmitPreview: SubmitHandler<EquipmentUploadValues> = async (data) => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    if (!previewVideoUri) {
      toast.error("Video recording is required");
      return;
    }

    setIsVendorLoading(true);
    await addNewUser(publicKey);
    try {
      let vendorData = await getVendor.data;
      if (!vendorData) {
        await initializeVendor.mutateAsync({
          publicKey,
          metadata: { name: `Vendor Profile` },
        });
        vendorData = await getVendor.refetch().then((res) => res.data);
        if (!vendorData) throw new Error("Failed to create vendor");
      }

      setVendorPda(vendorData.vendorPda);
      setVendorCollectionPda(vendorData.collectionPda);

      const imageUploadPromises = images.map((image) => uploadBlobToCloudinary(image));
      const imageUris = await Promise.all(imageUploadPromises);
      const validImageUris = imageUris.filter((uri): uri is string => uri !== null);
      if (validImageUris.length !== images.length) throw new Error("Some images failed to upload");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      validImageUris.forEach((uri, index) => formData.append(`images[${index}]`, uri));
      formData.append("video", previewVideoUri);
      formData.append("image", validImageUris[0]);
      data.minimumDeposit && formData.append("minimumDeposit", data.minimumDeposit);
      formData.append("pricePerUnit", data.pricePerUnit);
      formData.append("totalQuantity", data.totalQuantity);
      formData.append("maxDuration", data.maxDuration);
      formData.append("paymentPreference", data.paymentPreference);
      formData.append("owner", publicKey.toBase58());

      const metadataResponse = await axios.post(`${apiUrl}/metadata/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const metadataUriResult = metadataResponse.data.uri;
      if (!metadataUriResult) throw new Error("Failed to get metadata URI");

      setPreviewImageUris(validImageUris);
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
    setPreviewVideoUri(liveUrl);
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
      case "part":
        paymentPreferenceObj = { part: {} };
        break;
      case "full":
        paymentPreferenceObj = { full: {} };
        break;
      case "both":
        paymentPreferenceObj = { both: {} };
        break;
      default:
        throw new Error("Invalid payment preference");
    }

    const metadata = {
      name: formValues.name,
      uri: metadataUri,
      description: formValues.description,
    };

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
      setPreviewImageUris([]);
      setPreviewVideoUri(null);
      setLiveUrl("");
      setMetadataUri(null);
      setIsPreviewing(false);
      setVendorPda(null);
      setVendorCollectionPda(null);
      toast.success("Equipment created successfully!");
      router.push("/equipments");
    } catch (error) {
      console.error("Error creating equipment:", error);
      toast.error(`Failed to create equipment.`);
    }
  };

  return (
    <>
      {(isVendorLoading || initializeEquipment.isPending) && <Loading />}
      <div className="max-w-4xl mx-auto overflow-hidden mb-10 bg-white">
        <div className="px-4 md:px-8 pb-10">
          {!isPreviewing ? (
            <form onSubmit={handleSubmit(onSubmitPreview)} className="space-y-4 bg-gray-100 p-4">
              <div className=" rounded-xl">
              </div>
              <div>
                <label htmlFor="acceptedRequest" className="block text-sm font-medium text-gray-700 mb-1">
                  Select an Accepted Request (Optional)
                </label>
                <select
                  id="acceptedRequest"
                  onChange={handleRequestSelect}
                  className="w-full p-2 bg-white text-gray-800 rounded-lg border border-gray-200 outline-none"
                >
                  <option value="0">Choose from accepted requests</option>
                  {acceptedRequests.map((request) => (
                    <option key={request.id} value={request.id}>
                      {request.title} ({request.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Name
                </label>
                <input
                  id="name"
                  className="w-full bg-white p-2 text-gray-800 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
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
                  className="w-full bg-white p-2 text-gray-800 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                  placeholder="Describe your equipment in detail..."
                  rows={4}
                  disabled={initializeEquipment.isPending}
                  {...register("description", { required: "Description is required" })}
                />
                {errors.description && <p className="mt-1 text-red-500 text-xs">{errors.description.message}</p>}
              </div>

              <div className="">
                {/* <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-4">
                  <BiPackage className="mr-2 text-gray-500" size={20} />
                  Equipment Details
                </h2> */}
                <div className="space-y-6">

                </div>
              </div>

              {/* <div className="bg-gray-50 px-6 "> */}
              {/* <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-4">
                  <FiFilm className="mr-2 text-gray-500" size={20} />
                  Record Video (Required)
                </h2> */}
              <div className="flex justify-between">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Video
                </label>
                <div className="text-sm font-semibold text-gray-600">
                  {formatTime(recordingTime)}
                </div>
              </div>
              <div className="space-y-6 w-full">
                <div>
                  {liveUrl && (
                    <div className="mt-4">
                      <video src={liveUrl} controls className="w-full bg-white mt-2 rounded-lg max-h-[300px]" />
                      <button
                        type="button"
                        onClick={retakeVideo}
                        className="mt-2 text-blue-500 w-full border-dotted border-2 p-1 rounded-md border-gray-400"
                      >
                        Re-take Video
                      </button>
                    </div>
                  )}
                  <div
                    className={`${liveUrl || isUploading || recording
                      ? "bg-transparent border-2 border-gray-300 rounded-lg min-h-[200px] flex flex-col items-center justify-center text-center p-4 relative"
                      : "bg-[#F9FAFB] border-2 border-gray-300 rounded-lg min-h-[200px] flex flex-col items-center justify-center text-center p-4 relative"
                      }`}
                  >
                    <video
                      ref={videoRef}
                      className="w-full bg-white h-full rounded-lg"
                      style={{
                        maxHeight: "300px",
                        objectFit: "contain",
                        display: recording && !isUploading ? "block" : "none",
                      }}
                    />

                    {isUploading && (
                      <div className="text-center">
                        <p className="text-gray-600">Uploading video...</p>
                      </div>
                    )}

                    {!recording && !isUploading && !liveUrl && (
                      <div className="flex flex-col items-center space-y-4">
                        <FaCamera className="text-gray-400 text-6xl mb-4" />
                        <p className="text-gray-500 text-sm max-w-xs">
                          Record a video showcasing your equipment. Ensure your equipment and background are visible
                          enough.
                        </p>
                        <button
                          disabled={isUploading}
                          type="button"
                          onClick={startRecording}
                          className="bg-blue-500 text-white px-6 mt-10 py-1 rounded-lg hover:bg-blue-600 transition text-lg font-semibold w-full sm:w-auto"
                        >
                          Record
                        </button>
                      </div>
                    )}

                    {recording && !isUploading && !paused && (
                      <div className="flex justify-center space-x-4 absolute bottom-5 w-full">
                        <button
                          type="button"
                          onClick={pauseRecording}
                          className="bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 transition"
                        >
                          <BsPauseCircle size={24} />
                        </button>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 transition"
                        >
                          <BiStopCircle size={24} />
                        </button>
                      </div>
                    )}
                    {recording && paused && !isUploading && (
                      <div className="flex justify-center space-x-4 absolute bottom-5 w-full">
                        <button
                          type="button"
                          onClick={resumeRecording}
                          className="bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 transition"
                        >
                          <BiPlayCircle size={24} />
                        </button>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 transition"
                        >
                          <BiStopCircle size={24} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* </div> */}

              {/* <div className="bg-gray-50 px-6"> */}
              {/* <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-4">
                  <BiCamera className="mr-2 text-gray-500" size={20} />
                  Upload Images
                </h2> */}
              <div className="space-y-6 w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Images</label>
                  <div className="flex flex-wrap justify-center gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group w-[200px]">
                        <Image
                          src={URL.createObjectURL(image)}
                          alt={`Uploaded image ${index + 1}`}
                          className="h-[200px] w-full object-cover rounded-lg border border-gray-200"
                          width={200}
                          height={200}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <BiX size={16} />
                        </button>
                      </div>
                    ))}
                    <label className="relative group w-full">
                      <div className="h-24 w-full bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-500 transition cursor-pointer">
                        <BiUpload className="text-gray-400 group-hover:text-blue-500 transition" size={24} />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer outline-none"
                        disabled={initializeEquipment.isPending}
                      />
                    </label>
                  </div>
                </div>
              </div>
              {/* </div> */}

              {/* <div className="bg-gray-50 p-6"> */}
              {/* <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-4">
                  <FaDollarSign className="mr-2 text-gray-500" size={20} />
                  Pricing & Availability
                </h2> */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paymentPreference !== "full" &&
                    <div>
                      <label htmlFor="minimumDeposit" className="block text-sm font-medium text-gray-700 mb-1">
                        Min Deposit (USDC)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <input
                          id="minimumDeposit"
                          className="w-full bg-white pl-6 pr-4 py-2 text-gray-800 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                          placeholder="58000"
                          type="number"
                          step="1"
                          disabled={initializeEquipment.isPending}
                          {...register("minimumDeposit", {
                            required: "Deposit is required",
                            min: { value: 1, message: "Deposit must be at least 1 USDC" },
                          })}
                        />
                        {errors.minimumDeposit && <p className="mt-1 text-red-500 text-xs">{errors.minimumDeposit.message}</p>}
                      </div>
                    </div>
                  }

                  <div>
                    <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Unit (USDC)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        id="pricePerUnit"
                        className="w-full bg-white pl-6 pr-2 py-2 text-gray-800 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
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
                      className="w-full bg-white p-2 text-gray-800 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
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
                      className="w-full bg-white p-2 text-gray-800 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                      disabled={initializeEquipment.isPending}
                      {...register("maxDuration", { required: "Max duration is required" })}

                    >
                      <option value="0" className="text-gray-700">Choose duration you want for your payment</option>
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
                      <div key={option.value} className="relative ">
                        <input
                          type="radio"
                          id={`payment-${option.value.toLowerCase()}`}
                          value={option.value}
                          className="sr-only peer outline-none"
                          disabled={initializeEquipment.isPending}
                          {...register("paymentPreference", { required: "Payment preference is required" })}
                          defaultChecked={option.value === "Both"}
                        />
                        <label
                          htmlFor={`payment-${option.value.toLowerCase()}`}
                          className="flex flex-col items-center justify-center p-4 bg-white border rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:bg-gray-50 transition h-[70px]"
                        >
                          <span className="text-sm font-medium text-gray-900">{option.label.split(" ")[0]}</span>
                          <span className="text-xs text-gray-500">{option.label.split(" ").slice(1).join(" ")}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.paymentPreference && <p className="mt-1 text-red-500 text-xs">{errors.paymentPreference.message}</p>}
                </div>
                {/* </div> */}
              </div>

              <div className="py-6">
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-6 rounded font-medium hover:bg-blue-600 transition-colors flex items-center justify-center text-lg"
                  disabled={initializeEquipment.isPending || !connected}
                >
                  <BiCheckCircle className="mr-2" size={20} />
                  Preview Equipment Details
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Preview Your Listing</h2>
                <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-sm font-medium">Ready to Submit</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    {previewImageUris.length > 0 && (
                      <Image
                        src={previewImageUris[0]}
                        alt="Equipment preview"
                        className="w-full bg-white h-full object-cover"
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
                          className="w-full bg-white h-full object-cover"
                          width={64}
                          height={64}
                        />
                      </div>
                    ))}
                    {previewVideoUri && (
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                        <video src={previewVideoUri} className="w-full bg-white h-full object-cover" />
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
                      className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition flex items-center"
                    >
                      <BiEdit className="mr-1" size={16} />
                      Edit
                    </button>

                    <button
                      onClick={handleFinalSubmit}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
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