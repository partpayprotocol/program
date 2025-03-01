"use client";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

const EquipmentIdComponent = () => {
  const [view, setView] = useState<"part" | "fund">("part");
  const [deposit, setDeposit] = useState(58000);
  const [funderQuantity, setFunderQuantity] = useState(1);
  const [funderMinDeposit, setFunderMinDeposit] = useState(200000);
  const [funderDuration, setFunderDuration] = useState(604800);

  const equipment = {
    price: 297000,
    total: 348000,
    minDeposit: 58000,
    maxDuration: "6 Months",
    insurance: 51000,
    availableQuantity: 10,
    paymentPreference: "Both",
    isFunded: false,
  };

  const durationOptions = [
    { label: "1 Week", value: 604800 },
    { label: "2 Weeks", value: 1209600 },
    { label: "3 Weeks", value: 1814400 },
    { label: "4 Weeks", value: 2419200 },
    { label: "1 Month", value: 2592000 },
    { label: "3 Months", value: 7776000 },
    { label: "5 Months", value: 12960000 },
    { label: "6 Months", value: 15552000 },
    { label: "8 Months", value: 20736000 },
    { label: "1 Year", value: 31104000 },
    { label: "1 Year 6 Months", value: 46656000 },
    { label: "2 Years", value: 62208000 },
  ];

  const remainingAmount = equipment.total - deposit;

  const handleBuy = async () => {
    console.log("Buying with deposit:", deposit, "Quantity: 1");
  };

  const handleFund = async () => {
    if (funderMinDeposit < equipment.minDeposit) {
      toast.error(`Minimum deposit must be at least ₦${equipment.minDeposit.toLocaleString()}`);
      return;
    }
    console.log("Funding:", { quantity: funderQuantity, funderMinDeposit, funderDuration });
  };

  return (
    <div className="bg-slate-100 p-8">
      <div className="mx-auto w-full md:w-[500px] space-y-4 rounded-3xl bg-white py-4 relative min-h-[640px]">
        <div className="mx-auto flex h-[230px] w-10/12 items-center justify-center rounded-3xl bg-white overflow-hidden">
          <Image
            className="p-5 object-cover w-[230px] h-[230px]"
            src="https://www-konga-com-res.cloudinary.com/w_auto,f_auto,fl_lossy,dpr_auto,q_auto/media/catalog/product/E/D/182152_1637623897.jpg"
            alt="Ninja Air Fryer"
            width={200}
            height={100}
          />
        </div>
        <div className="w-11/12 mx-auto px-4">
          <p className="font-black text-gray-500 text-base">Ninja Air Fryer</p>
          <p className="text-gray-500 text-xs text-justify leading-5">
            This Air fryer can make 25 chicken breasts in one load. Power corded and leaves minimal oil stains. Perfect for small DIY grills business.
          </p>
          <p className="text-gray-500 text-xs pt-1">
            Payment Option: {equipment.isFunded ? "Installment Only" : equipment.paymentPreference}
          </p>
        </div>
        <div className="w-11/12 mx-auto flex justify-between px-4">
          <button
            className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest ${
              view === "part" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            } rounded-l-md`}
            onClick={() => setView("part")}
            disabled={equipment.isFunded}
          >
            Part Payment
          </button>
          <button
            className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest ${
              view === "fund" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
            } rounded-r-md`}
            onClick={() => setView("fund")}
          >
            Fund Equipment
          </button>
        </div>
        <div className="w-11/12 mx-auto px-4">
          {view === "part" ? (
            // Borrower View (Part Payment)
            <>
              <div className="flex justify-between items-center pt-2 font-sans text-base tracking-wider text-gray-700 mb-4">
                <div>
                  <h2 className="text-base">Min Deposit</h2>
                  <p className="font-black text-gray-500 text-base">₦{equipment.minDeposit.toLocaleString()}</p>
                </div>
                <button className="rounded-lg bg-blue-500 px-3 py-2 text-xs uppercase tracking-widest text-white">
                  {equipment.maxDuration}
                </button>
              </div>
              <div className="flex w-full justify-between rounded-md bg-slate-100 px-4 py-3 font-sans text-[10px] tracking-wider text-gray-700">
                <div>
                  <p className="font-bold uppercase text-gray-500">Equipment Price</p>
                  <p>₦{equipment.price.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold uppercase text-gray-500">Insurance</p>
                  <p>₦{equipment.insurance.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold uppercase text-gray-500">Total</p>
                  <p>₦{equipment.total.toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-center uppercase font-sans text-xs tracking-widest text-gray-500 font-semibold">
                  Down Payment
                </p>
                <p className="text-center text-base font-extrabold tracking-widest text-gray-400">
                  ₦{deposit.toLocaleString()}
                </p>
                <div className="flex justify-center pt-2">
                  <input
                    type="range"
                    min={equipment.minDeposit}
                    max={equipment.total}
                    step={5000}
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-64"
                  />
                </div>
                <p className="text-center text-xs text-gray-500 pt-2">
                  Remaining: ₦{remainingAmount.toLocaleString()}
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
            // Funder View
            <>
              <div className="pt-2">
                <p className="font-black text-gray-500 text-base">Funding Details</p>
                <p className="text-gray-500 text-xs">Fund this equipment to enable installment sales</p>
                <p className="text-gray-500 text-xs pt-1">Available Units: {equipment.availableQuantity}</p>
              </div>
              <div className="pt-2">
                <label className="block text-xs text-gray-500">Quantity to Fund</label>
                <p className="text-center text-base font-extrabold tracking-widest text-gray-400">
                  {funderQuantity}
                </p>
                <input
                  type="range"
                  min={1}
                  max={equipment.availableQuantity}
                  step={1}
                  value={funderQuantity}
                  onChange={(e) => setFunderQuantity(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <label className="block text-xs text-gray-500 mt-2">Minimum Deposit (₦)</label>
                <p className="text-center text-base font-extrabold tracking-widest text-gray-400">
                  ₦{funderMinDeposit.toLocaleString()}
                </p>
                <input
                  type="range"
                  min={0}
                  max={1000000}
                  step={10000}
                  value={funderMinDeposit}
                  onChange={(e) => setFunderMinDeposit(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <label className="block text-xs text-gray-500 mt-2">Duration</label>
                <select
                  className="w-full p-2 mt-1 border outline-none rounded bg-white text-gray-700"
                  value={funderDuration}
                  onChange={(e) => setFunderDuration(Number(e.target.value))}
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Total Cost: ₦{(equipment.price * funderQuantity).toLocaleString()}
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