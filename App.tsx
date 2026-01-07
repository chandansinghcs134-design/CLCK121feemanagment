
import React, { useState, useEffect } from 'react';
import { GlobalState, Role, Student, FeeConfig, FeeCategory } from './types';
import { ADMIN_PASSWORD, STAFF_PASSWORD, DEFAULT_FEE_CONFIG, Icons } from './constants';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [state, setState] = useState<GlobalState>(() => {
    const saved = localStorage.getItem('sumit_fee_tracker_state_v3');
    return saved ? JSON.parse(saved) : {
      students: [],
      feeConfig: DEFAULT_FEE_CONFIG,
      dueDate: '',
      activeCategory: 'Registration',
    };
  });

  useEffect(() => {
    localStorage.setItem('sumit_fee_tracker_state_v3', JSON.stringify(state));
  }, [state]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'admin' && password === ADMIN_PASSWORD) {
      setError('');
      setIsLoggedIn(true);
    } else if (role === 'staff' && password === STAFF_PASSWORD) {
      setError('');
      setIsLoggedIn(true);
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  const addStudent = (name: string, phone: string) => {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      serialNumber: `SN-${state.students.length + 1}`,
      name,
      phone,
      status: 'Unpaid',
      category: state.activeCategory,
    };
    setState(prev => ({ ...prev, students: [...prev.students, newStudent] }));
  };

  const deleteStudent = (id: string) => {
    setState(prev => ({ ...prev, students: prev.students.filter(s => s.id !== id) }));
  };

  const updateFeeStatus = (id: string, date: string, remark: string) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => 
        s.id === id ? { ...s, status: 'Paid', paymentDate: date, remarks: remark } : s
      )
    }));
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newStudents: Student[] = lines.slice(1).filter(line => line.trim()).map((line, index) => {
        const [name, phone] = line.split(',').map(s => s.trim());
        return {
          id: crypto.randomUUID(),
          serialNumber: `SN-${state.students.length + index + 1}`,
          name: name || 'Unknown',
          phone: phone || 'N/A',
          status: 'Unpaid',
          category: state.activeCategory,
        };
      });
      setState(prev => ({ ...prev, students: [...prev.students, ...newStudents] }));
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const setCategory = (category: FeeCategory) => {
    setState(prev => ({ ...prev, activeCategory: category }));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-indigo-600 p-8 text-center text-white">
            <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter italic">CLCK Fees Management System</h1>
            <p className="text-indigo-100 opacity-90 font-bold uppercase text-[10px] tracking-widest">Financial Management Portal</p>
          </div>
          
          <div className="p-8">
            {!role ? (
              <div className="space-y-4">
                <button 
                  onClick={() => setRole('admin')}
                  className="w-full py-4 px-6 bg-slate-50 border-2 border-slate-100 hover:border-indigo-600 hover:bg-white text-slate-800 rounded-2xl font-bold flex items-center justify-between transition-all group shadow-sm"
                >
                  <span className="flex items-center gap-3">
                    <Icons.Settings />
                    ADMIN PANEL
                  </span>
                  <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
                <button 
                  onClick={() => setRole('staff')}
                  className="w-full py-4 px-6 bg-slate-50 border-2 border-slate-100 hover:border-indigo-600 hover:bg-white text-slate-800 rounded-2xl font-bold flex items-center justify-between transition-all group shadow-sm"
                >
                  <span className="flex items-center gap-3">
                    <Icons.Users />
                    TEACHING STAFF
                  </span>
                  <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <button onClick={() => setRole(null)} className="text-indigo-600 text-xs font-black mb-6 flex items-center gap-1 hover:underline uppercase tracking-widest">
                    ← Change Role
                  </button>
                  <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Authentication</h2>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Private Key"
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
                    required
                  />
                  {error && <p className="mt-2 text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest"
                >
                  Confirm Login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Dynamic Sidebar */}
      <aside className="w-72 bg-slate-900 text-white hidden lg:flex flex-col flex-shrink-0">
        <div className="p-8 bg-slate-950 border-b border-slate-800">
          <h1 className="text-xl font-black italic uppercase">CLCK COLLECTIONS</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">{role} SECURE</p>
          </div>
        </div>
        <nav className="flex-grow p-6 space-y-4">
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4">Active Modules</p>
            <div className="space-y-2">
              {(['Registration', 'Admission', 'Monthly'] as FeeCategory[]).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all border-2 ${state.activeCategory === cat ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/40 text-white' : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <div className="flex justify-between items-center">
                    <span>{cat} Fee</span>
                    {state.activeCategory === cat && <span className="text-[10px]">ACTIVE</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>
        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={() => { setIsLoggedIn(false); setRole(null); setPassword(''); }}
            className="w-full px-5 py-3 bg-red-600/10 hover:bg-red-600 border border-red-600/20 text-red-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Logout Portal
          </button>
        </div>
      </aside>

      <main className="flex-grow overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-10 shadow-sm gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="text-indigo-600">{state.activeCategory}</span> 
              <span className="text-slate-300 font-light">/</span> 
              <span>{role === 'admin' ? 'ADMIN PANEL' : 'STAFF PANEL'}</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right border-l border-slate-200 pl-4">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">System Time</p>
              <p className="text-sm font-black text-indigo-600">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          {role === 'admin' ? (
            <Dashboard 
              students={state.students} 
              dueDate={state.dueDate} 
              feeConfig={state.feeConfig}
              activeCategory={state.activeCategory}
              isAdmin={true}
            />
          ) : (
            <StaffDashboard 
              students={state.students} 
              dueDate={state.dueDate} 
            />
          )}

          {role === 'admin' && (
            <AdminPanel 
              state={state} 
              addStudent={addStudent} 
              deleteStudent={deleteStudent}
              onCsvUpload={handleCsvUpload}
              onUpdateConfig={(config) => setState(prev => ({ ...prev, feeConfig: config }))}
              onUpdateDueDate={(date) => setState(prev => ({ ...prev, dueDate: date }))}
            />
          )}

          {role === 'staff' && (
            <StaffPanel 
              students={state.students} 
              activeCategory={state.activeCategory}
              onPay={updateFeeStatus}
            />
          )}
        </div>
      </main>
    </div>
  );
};

// --- Specialized Staff Components ---

const StaffDashboard: React.FC<{ students: Student[], dueDate: string }> = ({ students, dueDate }) => {
  const categories: FeeCategory[] = ['Registration', 'Admission', 'Monthly'];
  
  const getPendingCount = (cat: FeeCategory) => 
    students.filter(s => s.category === cat && s.status === 'Unpaid').length;

  const calculateDaysLeft = () => {
    if (!dueDate) return "N/A";
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days < 0 ? "OVERDUE" : days;
  };

  const daysLeft = calculateDaysLeft();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {categories.map(cat => (
        <div key={cat} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col justify-center">
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{cat} Pending</h3>
          <p className="text-6xl font-black text-red-600 tracking-tighter">{getPendingCount(cat)}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Students</p>
        </div>
      ))}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col justify-center ring-2 ring-red-500/20">
        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Time Remaining</h3>
        <p className="text-6xl font-black text-red-600 tracking-tighter">{daysLeft}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Days to Deadline</p>
      </div>
    </div>
  );
};

const AdminPanel: React.FC<{ 
  state: GlobalState, 
  addStudent: (n: string, p: string) => void,
  deleteStudent: (id: string) => void,
  onCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onUpdateConfig: (c: FeeConfig) => void,
  onUpdateDueDate: (d: string) => void
}> = ({ state, addStudent, deleteStudent, onCsvUpload, onUpdateConfig, onUpdateDueDate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  const filteredStudents = state.students.filter(s => s.category === state.activeCategory);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border-2 shadow-sm ${showConfig ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <Icons.Settings />
            (4) Fees Setup
          </button>
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Target Deadline</span>
            <input 
              type="date" 
              value={state.dueDate}
              onChange={(e) => onUpdateDueDate(e.target.value)}
              className="bg-transparent text-sm font-black text-indigo-600 outline-none cursor-pointer"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-100">
            <Icons.Upload />
            Import {state.activeCategory} List
            <input type="file" accept=".csv" onChange={onCsvUpload} className="hidden" />
          </label>
        </div>
      </div>

      {showConfig && (
        <div className="bg-white p-8 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-8 shadow-xl border border-indigo-100 animate-slideDown">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registration Fee (₹)</label>
            <input 
              type="number" 
              value={state.feeConfig.registration} 
              onChange={(e) => onUpdateConfig({ ...state.feeConfig, registration: +e.target.value })}
              className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-black focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Admission Fee (₹)</label>
            <input 
              type="number" 
              value={state.feeConfig.admission} 
              onChange={(e) => onUpdateConfig({ ...state.feeConfig, admission: +e.target.value })}
              className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-black focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monthly Fee (₹)</label>
            <input 
              type="number" 
              value={state.feeConfig.monthly} 
              onChange={(e) => onUpdateConfig({ ...state.feeConfig, monthly: +e.target.value })}
              className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-black focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none"
            />
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Icons.Plus /></div>
          <h3 className="text-slate-800 font-black uppercase text-sm tracking-widest italic">Manual {state.activeCategory} Entry</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <input 
            type="text" 
            placeholder="Student Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-grow min-w-[250px] px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-bold placeholder:font-normal placeholder:italic"
          />
          <input 
            type="text" 
            placeholder="Primary Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-grow min-w-[250px] px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-bold placeholder:font-normal placeholder:italic"
          />
          <button 
            onClick={() => { if(name && phone) { addStudent(name, phone); setName(''); setPhone(''); } }}
            className="bg-indigo-600 text-white px-10 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-slate-900 font-black text-base uppercase tracking-tight flex items-center gap-2">
            Master {state.activeCategory} Database
          </h3>
          <span className="bg-indigo-600 px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest">{filteredStudents.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-200">
              <tr>
                <th className="px-6 py-5">Serial ID</th>
                <th className="px-6 py-5">Student Name</th>
                <th className="px-6 py-5">Phone Number</th>
                <th className="px-6 py-5">Current Status</th>
                <th className="px-6 py-5">Collection Date</th>
                <th className="px-6 py-5">System Remarks</th>
                <th className="px-6 py-5 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-bold">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-6 py-4 font-mono text-slate-400 text-xs">{student.serialNumber}</td>
                  <td className="px-6 py-4 text-slate-900 uppercase">{student.name}</td>
                  <td className="px-6 py-4 text-slate-600">{student.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      student.status === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-indigo-600">{student.paymentDate || '—'}</td>
                  <td className="px-6 py-4 text-slate-400 italic max-w-xs truncate">{student.remarks || 'No notes'}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteStudent(student.id)}
                      className="text-slate-300 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Icons.Trash />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-slate-200"><Icons.Users /></div>
                      <span className="text-slate-300 font-black uppercase tracking-[0.3em] italic">Database Empty</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StaffPanel: React.FC<{ 
  students: Student[], 
  activeCategory: FeeCategory,
  onPay: (id: string, date: string, remark: string) => void,
}> = ({ students, activeCategory, onPay }) => {
  const [paymentDates, setPaymentDates] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  const unpaidStudents = students.filter(s => s.status === 'Unpaid' && s.category === activeCategory);

  const handlePay = (id: string) => {
    const date = paymentDates[id] || new Date().toISOString().split('T')[0];
    const remark = remarks[id] || '';
    onPay(id, date, remark);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* List Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-slate-800 font-black text-sm uppercase tracking-widest italic">Pending Registration Queue: {activeCategory}</h3>
          <div className="flex gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Serial</th>
                <th className="px-8 py-5">Full Name</th>
                <th className="px-8 py-5">Phone</th>
                <th className="px-8 py-5">Collection Date</th>
                <th className="px-8 py-5">Internal Remarks</th>
                <th className="px-8 py-5 text-right">Finalize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-bold">
              {unpaidStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 font-mono text-slate-400 text-xs">{student.serialNumber}</td>
                  <td className="px-8 py-6 text-slate-900 uppercase">{student.name}</td>
                  <td className="px-8 py-6 text-slate-600">{student.phone}</td>
                  <td className="px-8 py-6">
                    <input 
                      type="date"
                      value={paymentDates[student.id] || ''}
                      onChange={(e) => setPaymentDates({ ...paymentDates, [student.id]: e.target.value })}
                      className="px-5 py-3 border border-slate-200 rounded-xl text-sm font-black bg-white text-black focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none w-44 shadow-sm"
                    />
                  </td>
                  <td className="px-8 py-6">
                    <input 
                      type="text"
                      placeholder="Enter specific details..."
                      value={remarks[student.id] || ''}
                      onChange={(e) => setRemarks({ ...remarks, [student.id]: e.target.value })}
                      className="w-full px-5 py-3 border border-slate-200 rounded-xl text-sm font-black bg-white text-black placeholder:text-slate-300 placeholder:italic focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none shadow-sm"
                    />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handlePay(student.id)}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center gap-2 ml-auto group-hover:scale-105"
                    >
                      <Icons.Check />
                      Confirm Paid
                    </button>
                  </td>
                </tr>
              ))}
              {unpaidStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="bg-emerald-100 text-emerald-600 p-6 rounded-full shadow-inner animate-bounce">
                        <Icons.Check />
                      </div>
                      <div className="space-y-1">
                        <p className="text-emerald-600 font-black uppercase tracking-[0.2em] text-lg italic">Work Cycle Complete</p>
                        <p className="text-slate-400 font-bold text-sm">No pending {activeCategory} payments found.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
