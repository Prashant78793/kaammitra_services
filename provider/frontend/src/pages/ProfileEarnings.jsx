import React, { useState, useEffect } from "react";
import { 
    Briefcase, 
    Download, 
    CreditCard, 
    User,
    Sun,
    Moon,
    CheckCircle,
    Bell,
    X, // Modal close
    Mail,
    Phone,
    MapPin
} from "lucide-react";

// --- New Modal Components ---

// Invoice Details Modal Component
const InvoiceModal = ({ isOpen, onClose, transaction }) => {
    if (!isOpen || !transaction) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-gray-200 dark:border-gray-700">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Details: {transaction.jobId}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Invoice Content */}
                <div className="p-6 text-sm">
                    <div className="flex justify-between items-start mb-6">
                        {/* Company Details */}
                        <div>
                            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-2">
                                <Briefcase className="w-5 h-5" /> 
                                <span className="font-extrabold text-lg">Kaam Mitra</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">**Kaammitra.co**</p>
                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span>123,mall road, patna,india</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                <Phone className="w-3 h-3 mr-1" />
                                <span>9754368885</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                <Mail className="w-3 h-3 mr-1" />
                                <span>Kaammitra@gmail.com</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">GSTIN NO. **9ER**</p>
                        </div>

                        {/* Invoice Details */}
                        <div className="text-right">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Invoice Details</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Invoice number: **{transaction.jobId.replace('FGYT', '2025-00')}12**</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Date: **{transaction.date}**</p>
                            <p className="text-xs text-red-500 dark:text-red-400">Due Date: **10 Nov 2025**</p>
                        </div>
                    </div>

                    {/* Bill To Section */}
                    <div className="border p-4 rounded-lg bg-gray-50 dark:bg-gray-700 mb-6 grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="col-span-2">
                            <h4 className="font-bold text-gray-800 dark:text-white">Bill to:</h4>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Service Provider ID: <span className="font-medium text-gray-800 dark:text-white">SP-{transaction.jobId}</span></p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Service Provider Name: <span className="font-medium text-gray-800 dark:text-white">Provider Name</span></p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Service Provider Phone: <span className="font-medium text-gray-800 dark:text-white">975XXXX885</span></p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Customer Name: <span className="font-medium text-gray-800 dark:text-white">**{transaction.clientName}**</span></p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Customer Address: <span className="font-medium text-gray-800 dark:text-white">Patna, India</span></p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Customer Phone No.: <span className="font-medium text-gray-800 dark:text-white">99XXXXX001</span></p>
                        </div>
                        <div className="col-span-2 space-y-1 mt-2 border-t pt-2 border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Payment ID: <span className="font-medium text-gray-800 dark:text-white">PAY-1234567</span></p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Payment Mode: <span className="font-medium text-gray-800 dark:text-white">UPI</span></p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Amount Paid: <span className="font-bold text-green-600 dark:text-green-400">{transaction.payment}</span></p>
                        </div>
                    </div>

                    {/* Service Table */}
                    <table className="w-full text-left table-fixed border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 uppercase">
                                <th className="p-2 w-[10%]">S.No</th>
                                <th className="p-2 w-[40%]">Service Category (Sub-service)</th>
                                <th className="p-2 w-[30%]">Date</th>
                                <th className="p-2 w-[20%] text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-xs text-gray-900 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700">
                                <td className="p-2">1</td>
                                <td className="p-2">{transaction.serviceType}</td>
                                <td className="p-2">{transaction.date}</td>
                                <td className="p-2 text-right">{transaction.payment}</td>
                            </tr>
                            <tr className="text-xs text-red-600 dark:text-red-400">
                                <td className="p-2"></td>
                                <td className="p-2 font-medium">Platform Fee/Token Deduction</td>
                                <td className="p-2"></td>
                                <td className="p-2 text-right">({transaction.token})</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="text-sm font-bold bg-blue-50 dark:bg-gray-700">
                                <td colSpan="3" className="p-2 text-right">Net Payout:</td>
                                <td className="p-2 text-right">
                                    Rs {parseInt(transaction.payment.replace('Rs ', '')) - parseInt(transaction.token.replace('Rs ', ''))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button 
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150"
                        onClick={() => alert(`Downloading Invoice ${transaction.jobId}`)}
                    >
                        <Download className="w-5 h-5" />
                        <span>Download Invoice</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Manage Payment Methods Modal Component
const ManagePaymentMethodsModal = ({ isOpen, onClose, paymentMethods, setPaymentMethods }) => {
    const [newMethodType, setNewMethodType] = useState('Bank');
    const [newMethodName, setNewMethodName] = useState('');
    const [newMethodId, setNewMethodId] = useState('');

    if (!isOpen) return null;

    const handleAddMethod = () => {
        if (!newMethodName || !newMethodId) return;
        const newMethod = { type: newMethodType, name: newMethodName, details: newMethodId, default: false };
        const updated = [...paymentMethods, newMethod];
        setPaymentMethods(updated);
        localStorage.setItem('paymentMethods', JSON.stringify(updated));
        setNewMethodName('');
        setNewMethodId('');
    };

    const handleRemoveMethod = (index) => {
        const updated = paymentMethods.filter((_, i) => i !== index);
        setPaymentMethods(updated);
        localStorage.setItem('paymentMethods', JSON.stringify(updated));
    };

    const handleSetDefault = (index) => {
        const updated = paymentMethods.map((method, i) => ({ ...method, default: i === index }));
        setPaymentMethods(updated);
        localStorage.setItem('paymentMethods', JSON.stringify(updated));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-gray-700">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage Payment Methods</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Modal Content */}
                <div className="p-6">
                    <h4 className="font-semibold text-lg text-gray-800 dark:text-white mb-3">Current Methods</h4>
                    <div className="space-y-3 mb-6">
                        {paymentMethods.map((method, index) => (
                            <div key={index} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{method.name} ({method.type}) {method.default && <span className="text-green-600">(Default)</span>}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{method.details}</p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => handleRemoveMethod(index)} className="text-red-500 hover:text-red-600 text-xs font-medium">Remove</button>
                                    <button onClick={() => handleSetDefault(index)} className="text-blue-600 hover:text-blue-700 text-xs font-medium">Set Default</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h4 className="font-semibold text-lg text-gray-800 dark:text-white mb-3">Add New Method</h4>
                    <div className="space-y-2 mb-4">
                        <select value={newMethodType} onChange={(e) => setNewMethodType(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                            <option>Bank</option>
                            <option>UPI</option>
                        </select>
                        <input type="text" placeholder="Bank/UPI Name" value={newMethodName} onChange={(e) => setNewMethodName(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                        <input type="text" placeholder="Account/UPI ID" value={newMethodId} onChange={(e) => setNewMethodId(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                        <button onClick={handleAddMethod} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 flex items-center justify-center space-x-2">
                            <CreditCard className="w-5 h-5" />
                            <span>Add Method</span>
                        </button>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-md transition duration-150">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

// Mini Graph
const MiniEarningsGraph = () => (
    <div className="w-full h-16 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
            <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points="20,80 120,55 220,70 320,35 420,25" />
            {['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'].map((label, index) => (
                <text key={label} x={30 + (index * 100)} y="95" className="text-[10px] fill-gray-500 dark:fill-gray-400 text-center">{label}</text>
            ))}
        </svg>
    </div>
);

const PaymentMethod = ({ name, id, isUPI = false, onClickManage }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
        <div>
            <p className="font-semibold text-gray-800 dark:text-white">{isUPI ? 'UPI ID' : 'Bank name'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{id}</p>
        </div>
        <button onClick={onClickManage} className="text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-1 rounded-md border border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 transition">
            Manage
        </button>
    </div>
);

const PayoutHistoryTable = () => {
    const historyData = [
        { date: '10 Nov,2025', method: 'UPI(Gpay)', status: 'SUCCESS' },
        { date: '10 Nov,2025', method: 'Bank(SBI)', status: 'SUCCESS' },
        { date: '10 Nov,2025', method: 'Bank(SBI)', status: 'SUCCESS' },
        { date: '10 Nov,2025', method: 'Bank(SBI)', status: 'SUCCESS' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payout History</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <th className="py-3 pr-4">Date</th>
                            <th className="py-3 pr-4">Method</th>
                            <th className="py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        {historyData.map((item, index) => (
                            <tr key={index} className="text-sm text-gray-900 dark:text-gray-200">
                                <td className="py-2 pr-4 whitespace-nowrap">{item.date}</td>
                                <td className="py-2 pr-4 whitespace-nowrap">{item.method}</td>
                                <td className="py-2 whitespace-nowrap">
                                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                        item.status === 'SUCCESS' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Main Component ---
const ProfileEarnings = () => {
    const transactionHistory = [
        { date: '10 Nov,2025', jobId: 'FGYT56', clientName: 'Meera', serviceType: 'AC Repair', token: 'Rs 300', payment: 'Rs 1200' },
        { date: '11 Nov,2025', jobId: 'FGYT57', clientName: 'Rajesh', serviceType: 'Plumbing', token: 'Rs 150', payment: 'Rs 600' },
        { date: '12 Nov,2025', jobId: 'FGYT58', clientName: 'Priya', serviceType: 'Electrician', token: 'Rs 400', payment: 'Rs 1600' },
    ];
    
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const availableBalance = 18500;

    // --- Modals ---
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const [paymentMethods, setPaymentMethods] = useState(() => {
        const saved = localStorage.getItem('paymentMethods');
        return saved ? JSON.parse(saved) : [];
    });

    const handleOpenInvoice = (transaction) => {
        setSelectedTransaction(transaction);
        setIsInvoiceModalOpen(true);
    };

    return (
        <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Provider name</h2>
                    <span className="text-green-500">✓</span>
                    <span className="bg-gray-300 dark:bg-gray-600 text-xs text-gray-800 dark:text-gray-200 py-1 px-3 rounded-full font-medium">
                        complete profile
                    </span>
                </div>
                
                <div className="flex space-x-4 items-center">
                    <button className="text-gray-600 dark:text-gray-300 hover:text-blue-600 focus:outline-none">
                        <Bell className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your Earnings(all time)</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">Rs 2,15,000</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Earnings This Month</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Rs 18,500</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending Payments</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">Rs 3,200</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    <MiniEarningsGraph />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mb-8">
                <button onClick={() => setIsPaymentModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Withdraw now</span>
                </button>
                <button onClick={() => setIsPaymentModalOpen(true)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Add pay mode</span>
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                </button>
            </div>

            {/* Transaction History Table */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Transaction History</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <th className="py-3 pr-4">Date</th>
                                <th className="py-3 pr-4">Job ID</th>
                                <th className="py-3 pr-4">Client name</th>
                                <th className="py-3 pr-4">Service type</th>
                                <th className="py-3 pr-4">Token</th>
                                <th className="py-3">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {transactionHistory.map((item, index) => (
                                <tr key={index} className="text-sm text-gray-900 dark:text-gray-200">
                                    <td className="py-2 pr-4 whitespace-nowrap">{item.date}</td>
                                    <td className="py-2 pr-4 whitespace-nowrap text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => handleOpenInvoice(item)}>{item.jobId}</td>
                                    <td className="py-2 pr-4 whitespace-nowrap">{item.clientName}</td>
                                    <td className="py-2 pr-4 whitespace-nowrap">{item.serviceType}</td>
                                    <td className="py-2 pr-4 whitespace-nowrap">{item.token}</td>
                                    <td className="py-2 whitespace-nowrap">{item.payment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
                    {paymentMethods.map((method, index) => (
                        <PaymentMethod key={index} name={method.name} id={method.details} isUPI={method.type === 'UPI'} onClickManage={() => setIsPaymentModalOpen(true)} />
                    ))}
                </div>

                <PayoutHistoryTable />

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">Withdrawal</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Available balance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Rs {availableBalance.toLocaleString('en-IN')}</p>

                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                    <input type="number" id="amount" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(e.target.value)} placeholder="Enter amount" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 mb-4" />

                    <label htmlFor="via" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Withdraw via</label>
                    <select id="via" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 mb-6">
                        <option>Select Payment Method</option>
                        {paymentMethods.map((method, index) => (
                            <option key={index}>{method.name} ({method.type})</option>
                        ))}
                    </select>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-lg transition duration-150">
                        Confirm
                    </button>
                </div>
            </div>

            {/* Modals */}
            <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} transaction={selectedTransaction} />
            <ManagePaymentMethodsModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} paymentMethods={paymentMethods} setPaymentMethods={setPaymentMethods} />
        </div>
    );
};

export default ProfileEarnings;
