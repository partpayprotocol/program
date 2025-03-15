// RequestItem.tsx
"use client";
import { uploadBlobToCloudinary } from "@/utils/uploader";
import React, { useCallback, useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { BiPlayCircle, BiStopCircle } from "react-icons/bi";
import { BsPauseCircle } from "react-icons/bs";
import { FaCamera } from "react-icons/fa"; // Added for the camera icon
import { useForm, SubmitHandler } from "react-hook-form";
import { getGeolocation } from "@/utils/getLocation";
import axios from "axios";
import { apiUrl } from "@/app/utils/constant";
import LoginComponent from "../LoginComponent";

interface FormData {
    equipmentCategory: string;
    equipmentTitle: string;
    description: string;
}

const RequestItem = () => {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);
    const [recording, setRecording] = useState(false);
    const [paused, setPaused] = useState(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [liveUrl, setLiveUrl] = useState<string>("");
    const [recordingTime, setRecordingTime] = useState(0);
    const [geolocation, setGeolocation] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Mock auth state
    const [showLogin, setShowLogin] = useState(false); // State to control login popup

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const formatTime = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }, []);

    // Effect to check if videoRef is available after mount
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
                const location = await getGeolocation();
                setGeolocation(location);

                uploadBlobToCloudinary(finalBlob, "video").then((url) => {
                    if (typeof url === "string") {
                        setLiveUrl(url);
                        setIsUploading(false);
                        toast.success("Recording uploaded successfully!");
                    } else {
                        toast.error("Failed to upload video. No URL returned.");
                        setIsUploading(false);
                    }
                });

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

            const finalBlob = new Blob(recordedChunksRef.current, {
                type: mediaRecorder.mimeType,
            });

            if (finalBlob.size === 0) return;

            setIsUploading(true);
            try {
                const location = await getGeolocation();
                setGeolocation(location);
                const url = await uploadBlobToCloudinary(finalBlob, "video");
                if (url && typeof url === "string") {
                    setLiveUrl(url);
                    toast.success("Recording uploaded successfully!");
                } else {
                    toast.error("Failed to upload recording: No URL returned.");
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to upload recording.");
            } finally {
                setIsUploading(false);
            }
            recordedChunksRef.current = [];
        }
    }, [mediaRecorder, mediaStream]);

    const retakeVideo = () => {
        setLiveUrl("");
        setGeolocation(null);
        setMediaBlobUrl(null);
        recordedChunksRef.current = [];
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<FormData>({
        defaultValues: {
            equipmentCategory: "",
            equipmentTitle: "",
            description: "",
        },
    });

    // Store data in localStorage before login
    const saveFormData = () => {
        const formData = watch();
        localStorage.setItem(
            "savedFormData",
            JSON.stringify({
                equipmentCategory: formData.equipmentCategory,
                equipmentTitle: formData.equipmentTitle,
                description: formData.description,
                liveUrl,
                geolocation,
            })
        );
    };

    // Restore data after login
    useEffect(() => {
        const savedData = localStorage.getItem("savedFormData");
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setValue("equipmentCategory", parsedData.equipmentCategory || "");
            setValue("equipmentTitle", parsedData.equipmentTitle || "");
            setValue("description", parsedData.description || "");
            setLiveUrl(parsedData.liveUrl || "");
            setGeolocation(parsedData.geolocation || null);
            localStorage.removeItem("savedFormData"); // Clear after restoring
        }
    }, [setValue]);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        if (!isAuthenticated) {
            toast.error("You are not logged in. Please log in to submit.");
            saveFormData();
            setShowLogin(true);
            return;
        }

        if (!geolocation || geolocation === "Location unavailable") {
            toast.error("Geolocation is required to submit the request.");
            return;
        }

        const requestData = {
            title: data.equipmentTitle,
            video: liveUrl,
            description: data.description,
            category: data.equipmentCategory,
            // userPubkey (to be added after auth implementation)
        };

        try {
            await axios.post(`${apiUrl}/requests`, requestData, {
                headers: { "Content-Type": "application/json" },
            });
            toast.success("Request submitted successfully!");
            reset(); // Clear form after successful submission
            setLiveUrl("");
            setGeolocation(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit request.");
        }
    };

    const isGeolocationValid = !geolocation || geolocation === "Location unavailable";

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full space-y-6 max-h-full overflow-y-auto">
            <div>
                <h2 className="text-lg font-semibold text-gray-700">Request Equipment</h2>
                <p className="text-sm text-gray-500">What would you like to request for?</p>
            </div>

            <div>
                {liveUrl && (
                    <div className="mt-4">
                        <video src={liveUrl} controls className="w-full mt-2 rounded-lg max-h-[300px]" />
                        {geolocation && (
                            <p className="text-sm text-gray-600 mt-2">Recorded at: {geolocation}</p>
                        )}
                        <button
                            type="button"
                            onClick={retakeVideo}
                            className="mt-2 text-blue-500 w-full border-dotted border-2 p-1 rounded-md border-gray-400"
                        >
                            Re-take Video
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-600">
                        {formatTime(recordingTime)}
                    </div>
                </div>

                <div
                    className={`${liveUrl || isUploading || recording
                            ? "bg-transparent"
                            : "bg-[#F9FAFB] border-2 border-gray-300 rounded-lg min-h-[200px] flex flex-col items-center justify-center text-center p-4 relative"
                        }`}
                >
                    <video
                        ref={videoRef}
                        className="w-full h-full rounded-lg"
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
                                Make a video stating your request. Ensure your face and background are visible
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

                    {/* Recording controls */}
                    {recording && !isUploading && !paused && (
                        <div className="flex justify-center space-x-4 absolute bottom-5 w-full">
                            <button
                                type="button"
                                onClick={pauseRecording}
                                className="bg-yellow-500 text-white p-4 rounded-full hover:bg-yellow-600 transition"
                            >
                                <BsPauseCircle size={24} />
                            </button>
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition"
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
                                className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition"
                            >
                                <BiStopCircle size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {liveUrl && (
                <div className="mt-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Equipment Category *
                                </label>
                                <select
                                    {...register("equipmentCategory", { required: "Category is required" })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white outline-none border-2 p-1"
                                >
                                    <option value="">Select a category</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="tools">Tools</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.equipmentCategory && (
                                    <p className="text-red-500 text-sm">
                                        {errors.equipmentCategory.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Equipment Title *
                                </label>
                                <input
                                    {...register("equipmentTitle", { required: "Title is required" })}
                                    type="text"
                                    placeholder="e.g., sewing machine, HP laptop"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white outline-none border-2 p-1"
                                />
                                {errors.equipmentTitle && (
                                    <p className="text-red-500 text-sm">
                                        {errors.equipmentTitle.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Description (optional) *
                            </label>
                            <textarea
                                {...register("description")}
                                placeholder="Please describe what you need in detail (specifications or requirements)"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white outline-none border-2 p-2"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                type="submit"
                                disabled={isGeolocationValid}
                                className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition ${isGeolocationValid ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                title={isGeolocationValid ? "Geolocation is required" : ""}
                            >
                                Submit Request
                            </button>
                            <button
                                type="button"
                                onClick={retakeVideo}
                                className="text-blue-500 underline"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showLogin && (
                <LoginComponent
                    onLogin={() => {
                        setShowLogin(false);
                        setIsAuthenticated(true);
                    }}
                    setShowLogin={setShowLogin}
                />
            )}
        </div>
    );
};

export default RequestItem;