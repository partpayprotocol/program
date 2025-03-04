"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { apiUrl } from "@/app/utils/constant";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEquipmentAccount } from "@/app/hooks/useEquipment";
import { useContractAccount } from "@/app/hooks/useContract";
import { PublicKey } from "@solana/web3.js";
import { addNewUser, durationOption } from "@/app/utils/lib";
import { usePartpayProgram } from "@/app/hooks/usePartpayProgram";
import * as anchor from '@coral-xyz/anchor';

interface Equipment {
  equipmentPda: string;
  name: string;
  uri: string;
  description?: string;
  uniqueId: string;
  price: number; // In USDC
  minimumDeposit: number; // In USDC
  totalQuantity: number;
  maxDuration: number; // In seconds
  paymentPreference: string;
  images: string[];
  video?: string;
  vendorPda: string;
  status: string;
}

const EquipmentIdComponent = () => {
  const router = useRouter();
  const { equipmentId } = useParams();
  const { publicKey } = useWallet();
  const { fundEquipment } = useEquipmentAccount();
  const { initializeContract } = useContractAccount();
  const { program } = usePartpayProgram();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"part" | "fund">("part");
  const [deposit, setDeposit] = useState(0); // In USDC, default to minimumDeposit or 1 if 0
  const [funderQuantity, setFunderQuantity] = useState(1);
  const [funderMinDeposit, setFunderMinDeposit] = useState(0); // In USDC
  const [funderPrice, setFunderPrice] = useState(0); // In USDC, funder's resale price
  const [funderDuration, setFunderDuration] = useState(604800);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${apiUrl}/equipment/${equipmentId}`);
      const data = response.data;
      setEquipment(data);
      const minDeposit = data.minimumDeposit || 1; // Default to 1 USDC if minimumDeposit is 0
      setDeposit(minDeposit);
      setFunderMinDeposit(minDeposit);
      setFunderPrice(data.price); // Default to equipment price
      setLoading(false);
    } catch (err) {
      console.error("Error fetching equipment:", err);
      setError("Failed to fetch equipment details");
      setLoading(false);
    }
  };

  useEffect(() => {
    const paymentType = localStorage.getItem("Payment_type") as "part" | "fund" | null;
    setView(paymentType || "part");
    fetchEquipment();
  }, [equipmentId]);

  if (loading) return <div>Loading equipment...</div>;
  if (error || !equipment) return <div>{error || "Equipment not found"}</div>;

  const remainingAmount = funderPrice * funderQuantity - deposit;

  const handleBuy = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    await addNewUser(publicKey);

    try {
      // Fetch equipment state to get minimumDeposit in micro-USDC
      const equipmentAccount = await program.account.equipment.fetch(new PublicKey(equipment.equipmentPda));
      const minimumDepositInMicroUSDC = equipmentAccount.minimumDeposit;
      const minimumDepositInUSDC = minimumDepositInMicroUSDC.div(new anchor.BN(1e6)).toNumber();
      console.log("Equipment Minimum Deposit (USDC):", minimumDepositInUSDC);

      // Validate deposit against minimum in USDC (use 1 if 0 to avoid issues)
      const effectiveMinDeposit = minimumDepositInUSDC || 1; // Ensure minimum is at least 1 USDC
      if (deposit < effectiveMinDeposit) {
        toast.error(`Deposit (${deposit} USDC) must be at least ${effectiveMinDeposit} USDC`);
        return;
      }

      // Log equipment price for debugging
      console.log("Equipment Price (USDC):", equipment.price);

      // Create contract with deposit in micro-USDC
      const signature = await initializeContract.mutateAsync({
        wallet: { publicKey },
        buyerPubkey: publicKey,
        vendorPda: new PublicKey(equipment.vendorPda),
        equipmentPda: new PublicKey(equipment.equipmentPda),
        uniqueId: new PublicKey(equipment.uniqueId),
        totalAmount: Math.round(equipment.price * 1e6), // Price in micro-USDC
        durationSeconds: equipment.maxDuration,
        installmentFrequency: { monthly: {} }, // Correct type for monthly
        customFrequencySeconds: 0,
        deposit: Math.round(deposit * 1e6), // Convert deposit from USDC to micro-USDC
        insurancePremium: undefined, // Use undefined instead of null
      });
      console.log("Contract created:", signature);
      toast.success("Contract created successfully!");
    } catch (error) {
      console.error("Error creating contract:", error);
      toast.error(`Failed to create contract: ${error}`);
    }
  };

  const handleFund = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    if (funderMinDeposit < (equipment.minimumDeposit || 1)) { // Use 1 if minimum is 0
      toast.error(`Minimum deposit must be at least $${(equipment.minimumDeposit || 1).toLocaleString()}`);
      return;
    }

    try {
      await addNewUser(publicKey);

      const signature = await fundEquipment.mutateAsync({
        wallet: { publicKey },
        equipmentPda: equipment.equipmentPda,
        vendorPda: equipment.vendorPda,
        quantity: funderQuantity,
        minimumAmount: Math.round(funderMinDeposit * 1e6),
        durationSeconds: funderDuration,
        funderPrice: Math.round(funderPrice * 1e6),
      });
      console.log("Equipment funded:", signature);
      toast.success("Equipment funded successfully!");
    } catch (error) {
      console.error("Error funding equipment:", error);
      toast.error(`Failed to fund equipment: ${error}`);
    }
  };

  return (
    <div className="bg-slate-100 p-8">
      <div className="mx-auto w-full md:w-[500px] space-y-4 rounded-3xl bg-white py-4 relative min-h-[640px]">
        <div className="mx-auto flex h-[230px] w-10/12 items-center justify-center rounded-3xl bg-white overflow-hidden">
          {equipment.images && equipment.images.length > 0 ? (
            <Image
              className="p-5 object-cover w-[230px] h-[230px]"
              src={equipment.images[0]}
              alt={equipment.name}
              width={200}
              height={100}
            />
          ) : (
            <div className="w-[230px] h-[230px] bg-gray-200 flex items-center justify-center">
              No Image
            </div>
          )}
        </div>
        {equipment.video && (
          <div className="mx-auto w-10/12">
            <video src={equipment.video} controls className="w-full h-32 object-cover rounded-3xl" />
          </div>
        )}
        <div className="w-11/12 mx-auto px-4">
          <p className="font-black text-gray-500 text-base">{equipment.name}</p>
          <p className="text-gray-500 text-xs text-justify leading-5">
            {equipment.description || "No description available"}
          </p>
          <p className="text-gray-500 text-xs pt-1">
            Payment Option: {equipment.paymentPreference}
          </p>
        </div>
        <div className="w-11/12 mx-auto flex justify-between px-4">
          <button
            className={`flex-1 py-2 text-[12px] font-bold uppercase tracking-widest ${
              view === "part" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            } rounded-l-md`}
            onClick={() => setView("part")}
          >
            Part Payment
          </button>
          <button
            className={`flex-1 py-2 text-[12px] font-bold uppercase tracking-widest ${
              view === "fund" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
            } rounded-r-md`}
            onClick={() => setView("fund")}
          >
            Fund Equipment
          </button>
        </div>
        <div className="w-11/12 mx-auto px-4">
          {view === "part" ? (
            <>
              <div className="flex justify-between items-center pt-2 font-sans text-base tracking-wider text-gray-700 mb-4">
                <div>
                  <h2 className="text-base">Min Deposit</h2>
                  <p className="font-black text-gray-500 text-base">
                    ${equipment.minimumDeposit.toLocaleString() || "1"}
                  </p>
                </div>
                <button className="rounded-lg bg-blue-500 px-3 py-2 text-xs uppercase tracking-widest text-white">
                  {durationOption.find((opt) => opt.value === equipment.maxDuration)?.label || "Custom"}
                </button>
              </div>
              <div className="flex w-full justify-between rounded-md bg-slate-100 px-4 py-3 font-sans text-[10px] tracking-wider text-gray-700">
                <div>
                  <p className="font-bold uppercase text-gray-500">Vendor Price</p>
                  <p>${equipment.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold uppercase text-gray-500">Total</p>
                  <p>${(equipment.price * funderQuantity).toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-center uppercase font-sans text-xs tracking-widest text-gray-500 font-semibold">
                  Down Payment
                </p>
                <p className="text-center text-base font-extrabold tracking-widest text-gray-400">
                  ${deposit.toLocaleString()}
                </p>
                <div className="flex justify-center pt-2">
                  <input
                    type="range"
                    min={equipment.minimumDeposit || 1} // Default to 1 USDC if 0
                    max={equipment.price}
                    step={1} // Step in whole USDC
                    value={deposit}
                    onChange={(e) => setDeposit(Math.max(Number(e.target.value), equipment.minimumDeposit || 1))} // Enforce minimum
                    className="w-64"
                  />
                </div>
                <p className="text-center text-xs text-gray-500 pt-2">
                  Remaining: ${(remainingAmount).toLocaleString()}
                </p>
              </div>
              <div className="pt-3 mt-2">
                <button
                  className="mx-auto flex h-10 w-full items-center justify-center rounded-md bg-blue-500 font-bold uppercase tracking-widest text-white"
                  onClick={handleBuy}
                >
                  Buy Plan (1 Unit)
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="pt-2">
                <p className="font-black text-gray-500 text-base">Funding Details</p>
                <p className="text-gray-500 text-xs">Fund this equipment to set your installment price</p>
                <p className="text-gray-500 text-xs pt-1">Available Units: {equipment.totalQuantity}</p>
              </div>
              <div className="pt-2">
                <label className="block text-xs text-gray-500">Quantity to Fund</label>
                <p className="text-center text-base font-extrabold tracking-widest text-gray-400">
                  {funderQuantity}
                </p>
                <input
                  type="range"
                  min={1}
                  max={equipment.totalQuantity}
                  step={1}
                  value={funderQuantity}
                  onChange={(e) => setFunderQuantity(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <label className="block text-xs text-gray-500 mt-2">Minimum Deposit (USDC)</label>
                <p className="text-center text-base font-extrabold tracking-widest text-gray-400">
                  ${funderMinDeposit.toLocaleString()}
                </p>
                <input
                  type="range"
                  min={equipment.minimumDeposit || 1} // Default to 1 USDC if 0
                  max={1000} // Adjust max as needed
                  step={1}
                  value={funderMinDeposit}
                  onChange={(e) => setFunderMinDeposit(Math.max(Number(e.target.value), equipment.minimumDeposit || 1))}
                  className="w-full mt-1"
                />
                {/* Add Funder Price Input */}
                <label className="block text-xs text-gray-500 mt-2">Your Price per Unit (USDC)</label>
                <p className="text-center text-base font-extrabold tracking-widest text-gray-400">
                  ${funderPrice.toLocaleString()}
                </p>
                <input
                  type="range"
                  min={equipment.price}
                  max={2000}
                  step={1}
                  value={funderPrice}
                  onChange={(e) => setFunderPrice(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <label className="block text-xs text-gray-500 mt-2">Duration</label>
                <select
                  className="w-full p-2 mt-1 border outline-none rounded bg-white text-gray-700"
                  value={funderDuration}
                  onChange={(e) => setFunderDuration(Number(e.target.value))}
                >
                  {durationOption.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Total Cost to You: ${(equipment.price * funderQuantity).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Potential Revenue: ${(funderPrice * funderQuantity).toLocaleString()}
                </p>
              </div>
              <div className="pt-3 mt-2">
                <button
                  className="mx-auto flex h-10 w-full items-center justify-center rounded-md bg-green-500 font-bold uppercase tracking-widest text-white"
                  onClick={handleFund}
                >
                  Fund Equipment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentIdComponent;