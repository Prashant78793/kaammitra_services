// src/pages/Finance.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const socket = io("http://localhost:5000");

const Finance = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);

  // ✅ Fetch all transactions
  const fetchTransactions = async () => {
    const res = await axios.get("http://localhost:5000/api/finance");
    setTransactions(res.data);
  };

  // ✅ Fetch total revenue
  const fetchTotalRevenue = async () => {
    const res = await axios.get("http://localhost:5000/api/finance/total");
    setTotalRevenue(res.data.total);
  };

  useEffect(() => {
    fetchTransactions();
    fetchTotalRevenue();

    // ✅ Socket realtime listener
    socket.on("newTransaction", (data) => {
      setTransactions((prev) => [data, ...prev]);
      fetchTotalRevenue();
    });

    return () => socket.disconnect();
  }, []);

  // ✅ Monthly revenue chart
  useEffect(() => {
    const grouped = {};
    transactions.forEach((t) => {
      const month = new Date(t.date).toLocaleString("default", {
        month: "short",
      });
      if (!grouped[month]) grouped[month] = 0;
      if (t.status === "Completed") grouped[month] += t.amount;
    });

    setMonthlyData(
      Object.entries(grouped).map(([month, revenue]) => ({
        month,
        revenue,
      }))
    );
  }, [transactions]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Finance Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-4 shadow">
          <DollarSign className="text-green-600" size={30} />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              ₹ {totalRevenue.toLocaleString()}
            </h2>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-4 shadow">
          <CheckCircle className="text-blue-600" size={30} />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            <h2 className="text-xl font-semibold">
              {transactions.filter((t) => t.status === "Completed").length}
            </h2>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-4 shadow">
          <Clock className="text-yellow-500" size={30} />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            <h2 className="text-xl font-semibold">
              {transactions.filter((t) => t.status === "Pending").length}
            </h2>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Revenue Growth</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v) => `₹${v}`} />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-blue-700">All Transactions</h2>
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm">
            <tr>
              <th className="px-4 py-3">Transaction ID</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Job Category</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr
                key={t._id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="px-4 py-3">{t.transactionId}</td>
                <td className="px-4 py-3">{t.providerName}</td>
                <td className="px-4 py-3">{t.jobCategory}</td>
                <td className="px-4 py-3">₹ {t.amount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      t.status === "Completed"
                        ? "bg-green-500 text-white"
                        : t.status === "Pending"
                        ? "bg-yellow-400 text-black"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(t.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Finance;
