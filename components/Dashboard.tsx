
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Student, FeeCategory, FeeConfig } from '../types';

interface DashboardProps {
  students: Student[];
  dueDate: string;
  feeConfig: FeeConfig;
  activeCategory: FeeCategory;
  isAdmin?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ students, dueDate, feeConfig, activeCategory, isAdmin }) => {
  // Filter students by active category
  const categoryStudents = students.filter(s => s.category === activeCategory);
  
  const total = categoryStudents.length;
  const paidCount = categoryStudents.filter(s => s.status === 'Paid').length;
  const unpaidCount = total - paidCount;
  const paidPercentage = total > 0 ? Math.round((paidCount / total) * 100) : 0;

  const chartData = [
    { name: 'Paid', value: paidCount },
    { name: 'Unpaid', value: unpaidCount },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  const calculateDaysLeft = () => {
    if (!dueDate) return "Not set";
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days < 0 ? "Overdue" : `${days} days left`;
  };

  // Financials per active category
  const feeAmount = activeCategory === 'Registration' 
    ? feeConfig.registration 
    : activeCategory === 'Admission' 
      ? feeConfig.admission 
      : feeConfig.monthly;

  const alreadyPaidAmount = paidCount * feeAmount;
  const remainingAmount = unpaidCount * feeAmount;
  const totalExpectedAmount = total * feeAmount;

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Student Count Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">{activeCategory} Students</h3>
          <div className="flex flex-col">
            <p className="text-3xl font-black text-slate-800">{total}</p>
            <div className="flex justify-between text-xs mt-3 font-bold">
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Paid: {paidCount}</span>
              <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-md">Pending: {unpaidCount}</span>
            </div>
          </div>
        </div>

        {/* Financial Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">(1) Total Amount</h3>
          <p className="text-2xl font-black text-slate-800">₹{totalExpectedAmount.toLocaleString()}</p>
          <div className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">Total {activeCategory} Expected</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">(2) Already Paid</h3>
          <p className="text-2xl font-black text-emerald-600">₹{alreadyPaidAmount.toLocaleString()}</p>
          <div className="mt-4 text-[10px] text-emerald-500 font-bold uppercase tracking-tighter italic">Collected from {paidCount} students</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">(3) Remaining to Paid</h3>
          <p className="text-2xl font-black text-red-600">₹{remainingAmount.toLocaleString()}</p>
          <div className="mt-4 text-[10px] text-red-400 font-bold uppercase tracking-tighter italic">Due from {unpaidCount} students</div>
        </div>
      </div>

      {/* Progress & Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-12">
        <div className="w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-grow w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-800 font-black text-lg uppercase tracking-tight">Time Frame Status</h3>
            <span className={`font-black px-4 py-1 rounded-full text-xs uppercase tracking-widest ${calculateDaysLeft().includes('Overdue') ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'}`}>
              {calculateDaysLeft()}
            </span>
          </div>
          <div className="space-y-4 w-full">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Collection Target: <span className="text-slate-800">{dueDate || 'Date Not Set'}</span></span>
              <span>{paidPercentage}% Done</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
              <div 
                className="bg-indigo-600 h-full transition-all duration-1000 ease-in-out"
                style={{ width: `${paidPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
