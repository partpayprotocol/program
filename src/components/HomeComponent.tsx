"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { CheckmarkIcon } from "react-hot-toast";

const HomeComponent = () => {
    const router = useRouter()

    const handleClick = (role: string) => {
        localStorage.setItem("user_type", role)
        router.push(`/${role}`)
    };

    const roles = [
        { id: 'upload-equipment', label: 'Vendor', description: 'Sell products or services' },
        { id: 'funder', label: 'Funder', description: 'Provide financial backing' },
        { id: 'equipments', label: 'Borrower', description: 'Receive funding' }
    ];
    return (
        <div className="bg-white h-full">
            <div className="w-full h-screen bg-gray-50 flex justify-center items-center p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        <div className="space-y-4">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => handleClick(role.id)}
                                    className={`w-full flex items-center p-4 border rounded-lg transition-all duration-200 border-gray-200 hover:bg-gray-50`}
                                >
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-gray-900">{role.label}</p>
                                        <p className="text-sm text-gray-500">{role.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeComponent;