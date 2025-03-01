import { RequestEquipmentFormInputs } from '@/app/types/form';
import { BUDGET_RANGES, EQUIPMENT_CATEGORIES } from '@/app/utils/constant';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form';

const RequestEquipmet = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Initialize React Hook Form
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<RequestEquipmentFormInputs>({
        defaultValues: {
            category: "",
            title: "",
            description: "",
            budgetRange: "",
            preferredPayment: "installments",
            additionalDetails: ""
        }
    });

    // Form submission handler
    const onSubmit: SubmitHandler<RequestEquipmentFormInputs> = async (data) => {
        setIsLoading(true);

        try {
            // Simulate API call to create request
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Redirect to dashboard on success
            router.push('/borrower/dashboard?requestSuccess=true');
        } catch (error) {
            console.error("Error submitting request:", error);
            setIsLoading(false);
        }
    };

    return (
        <div>

            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">Request Equipment</h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Tell us what you need
                        </p>
                    </div>

                    {/* Main form */}
                    <div className="p-6 bg-white rounded-lg shadow">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                        Equipment Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="category"
                                        {...register("category", { required: "Category is required" })}
                                        className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {EQUIPMENT_CATEGORIES.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && (
                                        <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                                    )}
                                </div>

                                {/* Equipment title */}
                                <div className="relative">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-800">
                                        Equipment Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        {...register("title", {
                                            required: "Title is required",
                                            minLength: { value: 3, message: "Title must be at least 3 characters" }
                                        })}
                                        placeholder="e.g., Dell XPS Laptop, Industrial Mixer"
                                        className="block w-full px-3 py-2 mt-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Detailed Description (optional) <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        {...register("description", {
                                            minLength: { value: 20, message: "Please provide a more detailed description (at least 20 characters)" }
                                        })}
                                        rows={4}
                                        placeholder="Please describe in detail what you need, including specifications, features, and any requirements"
                                        className="block w-full px-3 py-2 mt-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                                    )}
                                </div>

                                {/* Budget range */}
                                <div>
                                    <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700">
                                        Budget Range <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="budgetRange"
                                        {...register("budgetRange")}
                                        className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="" disabled>Select your budget range</option>
                                        {BUDGET_RANGES.map(range => (
                                            <option key={range.value} value={range.value}>
                                                {range.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.budgetRange && (
                                        <p className="mt-1 text-sm text-red-600">{errors.budgetRange.message}</p>
                                    )}
                                </div>

                                {/* Urgency */}
                                {/* <div>
                    <label className="block text-sm font-medium text-gray-700">Urgency</label>
                    <div className="mt-2 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                      {['urgent', 'normal', 'flexible'].map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            id={option}
                            type="radio"
                            value={option}
                            {...register("urgency")}
                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <label htmlFor={option} className="ml-3 text-sm font-medium text-gray-700 capitalize">
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div> */}

                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700">Payment Preference</label>
                                    <div className="mt-2 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                        {[
                                            { id: 'installments', label: 'Installments' },
                                            { id: 'full', label: 'Full Payment' },
                                            { id: 'either', label: 'Either' }
                                        ].map((option) => (
                                            <div key={option.id} className="flex items-center">
                                                <input
                                                    id={option.id}
                                                    type="radio"
                                                    value={option.id}
                                                    {...register("preferredPayment")}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                />
                                                <label htmlFor={option.id} className="ml-3 text-sm font-medium text-gray-700">
                                                    {option.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div> */}

                                {/* <div>
                                    <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700">
                                        Additional Details
                                    </label>
                                    <textarea
                                        id="additionalDetails"
                                        {...register("additionalDetails")}
                                        rows={3}
                                        placeholder="Any additional information that might help vendors understand your needs better"
                                        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div> */}

                                <div className="flex items-center justify-end space-x-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="w-5 h-5 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : 'Submit Request'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RequestEquipmet