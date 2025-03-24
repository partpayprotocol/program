"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { CiShop } from "react-icons/ci";
import { GrMoney } from "react-icons/gr";
import { MdOutlinePerson } from "react-icons/md";

const HomeComponent = () => {
    const router = useRouter()

    const handleClick = (role: string) => {
        localStorage.setItem("user_type", role)
        router.push(`/${role}`)
    };

    const roles = [
        { id: 'requests', label: 'Vendor', description: 'Sell products or services', icon: <CiShop/> },
        { id: 'borrower', label: 'Borrower', description: 'Receive equipment or funding', icon: <MdOutlinePerson/> },
        { id: 'funder', label: 'Funder', description: 'Provide financial backing', icon: <GrMoney/> },
    ];
    return (
        <div className="bg-white h-full">
            <div className="p-4 md:hidden">
                <Image src="/darklogo.png" alt="logo" className="w-[120px]" width={100} height={100} />
            </div>
            <div className="w-full h-[91%] border-2 md:h-full flex p-4 md:p-8">
                <div className="bg-[#F0F4FD] h-full w-[400px] rounded-tl-3xl rounded-bl-3xl hidden md:flex p-6 pt-20 justify-center">
                    <div className="">
                        <Image src="/darklogo.png" alt="logo" className="w-[140px] " width={100} height={100} />
                    </div>
                </div>
                <div className="w-full flex justify-center items-center">
                    <div className="p-6 max-w-[500px] w-full">
                        <div className="mb-8">
                            <h2 className="font-medium text-[18px] text-black">Choose your account type</h2>
                            <p className="text-[14px]">Which of these profile are you?</p>
                        </div>
                        <div className="space-y-4">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => handleClick(role.id)}
                                    className={`w-full flex items-center p-4 cursor-pointer border rounded-lg transition-all duration-200 border-gray-200 hover:bg-gray-100`}
                                >
                                    <div className="pr-2 text-[28px] text-black">{role.icon}</div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-gray-900">{role.label}</p>
                                        <p className="text-sm text-gray-500">{role.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeComponent;