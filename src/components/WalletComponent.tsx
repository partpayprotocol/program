import React from 'react'

const WalletComponent = () => {
  return (
    <div className="fixed w-full h-screen bg-transparent z-50 left-0 top-0">
                    <div className="w-full h-full relative flex justify-center items-center">
                        <div
                            className="bg-black w-full h-full absolute top-0 left-0 opacity-70"
                            onClick={() => setShowConfirmationModal(false)} // Close modal on background click
                        />
                        <div className="bg-white p-6 rounded-lg shadow-lg z-50 max-w-sm mx-auto">
                            <h2 className="text-xl font-semibold mb-4">Confirm Challenge Creation</h2>
                            <p className="text-gray-700 mb-4">Are you sure you want to create this challenge?</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowConfirmationModal(false)} // Cancel action
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        handleSubmit();
                                        setShowConfirmationModal(false);
                                    }}
                                    className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
  )
}

export default WalletComponent