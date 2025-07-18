"use client";
import { useState } from "react";
import { X } from "lucide-react";

export function WithdrawWalletModal({ walletType, walletName, balance, onClose, onSuccess }) {
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!amount || isNaN(amount)) {
            setError("Please enter a valid amount");
            return;
        }

        const numericAmount = parseFloat(amount);
        if (numericAmount <= 0) {
            setError("Amount must be greater than 0");
            return;
        }

        if (numericAmount > balance) {
            setError("Insufficient balance");
            return;
        }

        setIsSubmitting(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            onSuccess({
                walletType,
                amount: numericAmount.toFixed(2),
                action: 'withdraw'
            });
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-lg font-semibold">Withdraw from {walletName}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount (₦)
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                placeholder="Enter amount to withdraw"
                                step="0.01"
                                min="0"
                                max={balance}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Available balance: ₦{balance.toLocaleString()}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 text-red-500 text-sm">{error}</div>
                        )}

                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Processing..." : "Withdraw"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}