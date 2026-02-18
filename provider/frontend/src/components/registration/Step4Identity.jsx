import React, { useState, useRef } from "react";
import { Upload, Check } from "lucide-react";

const Step4Identity = ({ nextStep, data }) => {
  const [profileFile, setProfileFile] = useState(data.profilePhoto || null);
  const [govFile, setGovFile] = useState(data.governmentIDProof || null);
  const [addrFile, setAddrFile] = useState(data.addressProof || null);
  const [skillFile, setSkillFile] = useState(data.skillCertificate || null);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const profileRef = useRef();
  const govRef = useRef();
  const addrRef = useRef();
  const skillRef = useRef();

  const handleFileSelect = (e, setter) => {
    const f = e.target.files?.[0];
    if (f) setter(f);
  };

  const isAllUploaded = profileFile && govFile && addrFile && skillFile;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!isAllUploaded) {
      setError("Please upload all required documents.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the terms.");
      return;
    }

    // pass File objects to parent; parent Register will assemble FormData
    nextStep({
      profilePhoto: profileFile,
      governmentIDProof: govFile,
      addressProof: addrFile,
      skillCertificate: skillFile,
      agreedToTerms: agreed,
    });
  };

  const getButtonClass = (val) => (val ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500");

  const UploadField = ({ label, file, setter, refInput }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700/50">
      <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
      <div>
        <input type="file" ref={refInput} style={{ display: "none" }} accept="image/*,.pdf" onChange={(e) => handleFileSelect(e, setter)} />
        <button type="button" onClick={() => refInput.current.click()} className={`flex items-center text-sm font-medium text-white px-3 py-1 rounded-md ${getButtonClass(file)}`}>
          {file ? <Check className="w-4 h-4 mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
          {file ? "Uploaded" : "Upload"}
        </button>
        {file && <span className="ml-2 text-xs text-green-700">{file.name}</span>}
      </div>
    </div>
  );

  return (
    <div className="p-4 rounded-xl">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6 text-center">Step 4: Identity & Verification</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <UploadField label="Profile Photo" file={profileFile} setter={setProfileFile} refInput={profileRef} />
        <UploadField label="Government ID Proof (Aadhar/Voter ID)" file={govFile} setter={setGovFile} refInput={govRef} />
        <UploadField label="Address Proof (Electricity Bill/Rental Agmt)" file={addrFile} setter={setAddrFile} refInput={addrRef} />
        <UploadField label="Skill Certificate (Optional but Recommended)" file={skillFile} setter={setSkillFile} refInput={skillRef} />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex items-start pt-4">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">I agree that my details are accurate and comply with terms.</label>
        </div>

        <button type="submit" className={`w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white ${isAllUploaded && agreed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`} disabled={!isAllUploaded || !agreed}>
          NEXT
        </button>
      </form>
    </div>
  );
};

export default Step4Identity;