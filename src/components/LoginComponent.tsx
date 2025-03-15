"use client";
import React from "react";
import toast from "react-hot-toast";
// import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

interface LoginComponentProps {
  onLogin: () => void;
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginComponent = ({ onLogin, setShowLogin }: LoginComponentProps) => {
//   const login = useGoogleLogin({
//     onSuccess: async (tokenResponse) => {
//       try {
//         // Fetch user info from Google
//         const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
//           headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
//         });
//         // In a real app, you would handle the user data and set auth state
//         console.log("User Info:", response.data);
//         onLogin(); // Close popup and update auth state in parent
//       } catch (error) {
//         console.error("Login failed:", error);
//         toast.error("Login failed. Please try again.");
//       }
//     },
//     onError: () => toast.error("Login failed. Please try again."),
//     flow: "implicit", // Adjust based on your needs
//   });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Login Required</h2>
        <p className="mb-4">You must log in to submit your request.</p>
        <button
          onClick={() => {}}
            // login()
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Log in with Google
        </button>
        <button
          onClick={() => setShowLogin(false)}
          className="ml-4 text-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoginComponent;