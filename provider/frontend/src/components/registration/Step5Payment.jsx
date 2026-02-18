import React, { useState } from "react";
import { CreditCard } from "lucide-react";

const Step5Payment = ({ handleSubmit, data }) => {
  const [bankAccountNumber, setBankAccountNumber] = useState(data.bankAccountNumber || "");
  const [ifscCode, setIfscCode] = useState(data.ifscCode || "");
  const [accountHolderName, setAccountHolderName] = useState(data.accountHolderName || "");
  const [upiId, setUpiId] = useState(data.upiId || "");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    console.log("Step5Payment: submit clicked, data=", { bankAccountNumber, ifscCode, accountHolderName, upiId, agreed });
    setError("");

    if (!bankAccountNumber || !ifscCode || !accountHolderName || !upiId) {
      setError("All payment details are mandatory.");
      return;
    }
    
    if (!agreed) {
      setError("You must confirm the bank details are correct.");
      return;
    }

    handleSubmit({
      bankAccountNumber,
      ifscCode,
      accountHolderName,
      upiId,
    });
  };

  return (
    <div className="p-4 rounded-xl">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6 text-center">
        Step 5: Financial Details (For Payout)
      </h2>
      <form onSubmit={handleFinalSubmit} className="space-y-4">
        <input
            type="text" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)}
            placeholder="Account Holder Name (Mandatory)" required
            className="w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
        />
        <input
            type="text" inputMode="numeric" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)}
            placeholder="Bank Account Number (Mandatory)" required
            className="w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
        />
        <input
            type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            placeholder="IFSC Code (Mandatory)" required
            className="w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
        />
        <input
            type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)}
            placeholder="UPI ID (Mandatory)" required
            className="w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
        />

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <div className="flex items-start pt-4">
          <input
            type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            I confirm all bank details are correct for payment transfer.
          </label>
        </div>

        <button
          type="submit"
          className={`w-full flex justify-center items-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${agreed && bankAccountNumber ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={!agreed || !bankAccountNumber || !ifscCode || !accountHolderName || !upiId}
        >
          <CreditCard className="w-4 h-4 mr-2" /> Submit Registration
        </button>
      </form>
    </div>
  );
};

export default Step5Payment;