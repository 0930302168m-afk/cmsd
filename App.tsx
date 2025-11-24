import React, { useState, useEffect } from 'react';
import { Screen, Assignment, Subject, NotificationItem } from './types';
import BottomNav from './components/BottomNav';
import { 
    LayoutDashboard, 
    ChevronLeft, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Sparkles,
    Calendar as CalendarIcon,
    ArrowRight,
    Bell,
    User,
    MoreVertical,
    Check
} from 'lucide-react';
import { suggestTaskBreakdown } from './services/geminiService';
import { BarChart, Bar, XAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';

// --- Helper Components ---

// --- 1. Dashboard ---
const Dashboard = ({ subjects, assignments, onSubjectClick }: { subjects: Subject[], assignments: Assignment[], onSubjectClick: (s: Subject) => void }) => {
    const totalProgress = Math.round(assignments.reduce((acc, curr) => acc + curr.progress, 0) / (assignments.length || 1));
    const pendingTasks = assignments.filter(a => a.progress < 100).length;

    return (
        <div className="p-6 space-y-8 pb-24 animate-fade-in bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 text-sm font-medium">จัดการการเรียนอย่างมืออาชีพ</p>
                </div>
                <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border border-white shadow-sm">
                   <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Overall Progress Card - Elegant Dark Style */}
            <div className="bg-slate-800 rounded-xl p-6 text-white shadow-elegant relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h2 className="font-semibold text-lg tracking-wide">ภาพรวมความคืบหน้า</h2>
                        <p className="text-slate-400 text-xs mt-1">คุณมี {pendingTasks} งานที่ต้องดำเนินการ</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                        <LayoutDashboard size={18} className="text-white" />
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-2">
                         <span className="text-sm text-slate-300">ความสำเร็จโดยรวม</span>
                         <span className="text-3xl font-bold font-mono">{totalProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${totalProgress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Subject List - Semi-formal List Style */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">รายวิชาเรียน</h3>
                    <button className="text-xs font-semibold text-slate-500 hover:text-slate-800">ดูทั้งหมด</button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {subjects.map(subject => {
                        const subjectAssignments = assignments.filter(a => a.subjectId === subject.id);
                        const pendingCount = subjectAssignments.filter(a => a.progress < 100).length;
                        
                        return (
                            <div 
                                key={subject.id} 
                                onClick={() => onSubjectClick(subject)}
                                className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 active:scale-[0.99] transition-all hover:shadow-md flex items-center gap-4 group"
                            >
                                {/* Icon Box */}
                                <div className={`w-12 h-12 rounded-lg ${subject.color} bg-opacity-10 flex items-center justify-center text-xl shrink-0`}>
                                    {subject.icon}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-800 truncate">{subject.name}</h4>
                                        {pendingCount > 0 && (
                                            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
                                                {pendingCount} งานค้าง
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Teacher Info */}
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <img src={subject.teacherImage} alt={subject.teacherName} className="w-5 h-5 rounded-full object-cover border border-slate-100" />
                                        <p className="text-xs text-slate-500 font-medium truncate">{subject.teacherName}</p>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- 2. Assignment List ---
const AssignmentList = ({ subject, assignments, onBack, onUpdateClick }: { subject: Subject, assignments: Assignment[], onBack: () => void, onUpdateClick: (a: Assignment) => void }) => {
    const getProgressStatus = (p: number) => {
        if (p === 0) return { label: 'ยังไม่เริ่ม', color: 'bg-slate-100 text-slate-500' };
        if (p === 100) return { label: 'เสร็จสิ้น', color: 'bg-emerald-50 text-emerald-600' };
        return { label: 'กำลังดำเนินการ', color: 'bg-amber-50 text-amber-600' };
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-24 animate-fade-in">
            {/* Elegant Header */}
            <div className="bg-slate-900 text-white p-6 pb-12 rounded-b-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={onBack} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition backdrop-blur-md">
                            <ChevronLeft className="text-white" size={20} />
                        </button>
                        <span className="text-sm font-medium text-slate-300 tracking-wider uppercase">รายละเอียดวิชา</span>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-xl ${subject.color} bg-opacity-20 flex items-center justify-center text-3xl backdrop-blur-sm border border-white/10`}>
                            {subject.icon}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold leading-tight">{subject.name}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <img src={subject.teacherImage} alt={subject.teacherName} className="w-6 h-6 rounded-full border border-slate-600" />
                                <span className="text-sm text-slate-300 font-light">อ. {subject.teacherName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="px-6 -mt-6 relative z-20">
                {assignments.length === 0 ? (
                     <div className="bg-white rounded-xl p-10 text-center shadow-elegant border border-slate-100">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Check size={24} />
                        </div>
                        <p className="text-slate-500 font-medium">ไม่มีงานค้างในขณะนี้</p>
                     </div>
                ) : (
                    <div className="space-y-3">
                        {assignments.map(assign => {
                            const status = getProgressStatus(assign.progress);
                            return (
                                <div key={assign.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-slate-800 text-base">{assign.title}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon size={14} />
                                            <span>{assign.dueDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                             <div className={`w-2 h-2 rounded-full ${assign.priority === 'High' ? 'bg-red-500' : assign.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                                             <span>{assign.priority === 'High' ? 'ด่วน' : assign.priority === 'Medium' ? 'ปานกลาง' : 'ทั่วไป'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-800 rounded-full" style={{ width: `${assign.progress}%` }}></div>
                                        </div>
                                        <button 
                                            onClick={() => onUpdateClick(assign)}
                                            className="text-xs font-semibold text-slate-700 hover:text-indigo-600 transition"
                                        >
                                            อัปเดต
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 3. Progress Update Screen ---
const ProgressUpdate = ({ assignment, onSave, onCancel }: { assignment: Assignment, onSave: (id: string, progress: any, note: string) => void, onCancel: () => void }) => {
    const [currentProgress, setCurrentProgress] = useState(assignment.progress);
    const [note, setNote] = useState(assignment.notes);

    const levels = [0, 25, 50, 75, 100];
    const labels = ["Not Started", "In Progress", "Halfway", "Almost Done", "Completed"];

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
            <div className="p-4 flex justify-between items-center border-b border-slate-100">
                <button onClick={onCancel} className="p-2 hover:bg-slate-50 rounded-full text-slate-600">
                    <span className="text-sm font-medium">ยกเลิก</span>
                </button>
                <h2 className="font-bold text-slate-800">Update Progress</h2>
                <button 
                    onClick={() => onSave(assignment.id, currentProgress, note)}
                    className="p-2 text-indigo-600 font-bold text-sm"
                >
                    บันทึก
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-8 text-center">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{assignment.title}</h3>
                    <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                        {currentProgress}% - {labels[levels.indexOf(currentProgress)]}
                    </div>
                </div>

                {/* Vertical Step Slider for Professional Look */}
                <div className="max-w-xs mx-auto mb-10 relative pl-4">
                     <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-slate-100"></div>
                     {levels.map((level) => (
                         <div 
                            key={level}
                            onClick={() => setCurrentProgress(level as any)}
                            className="relative flex items-center gap-4 mb-6 cursor-pointer group"
                         >
                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white z-10 transition-all ${
                                currentProgress === level ? 'border-indigo-600 text-indigo-600 scale-110 shadow-lg' : 'border-slate-200 text-slate-300 group-hover:border-slate-400'
                            }`}>
                                {currentProgress === level && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                            </div>
                            <span className={`text-sm font-medium transition-colors ${currentProgress === level ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                {level}% &nbsp;&mdash;&nbsp; {labels[levels.indexOf(level)]}
                            </span>
                         </div>
                     ))}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">หมายเหตุ / Note</label>
                    <textarea 
                        className="w-full bg-transparent border-none p-0 text-slate-700 text-sm focus:ring-0 outline-none resize-none placeholder-slate-300"
                        rows={4}
                        placeholder="บันทึกรายละเอียดความคืบหน้า..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

// --- 4. New Assignment ---
const NewAssignment = ({ subjects, onSave, onCancel }: { subjects: Subject[], onSave: (a: Omit<Assignment, 'id'>) => void, onCancel: () => void }) => {
    const [title, setTitle] = useState('');
    const [subjectId, setSubjectId] = useState(subjects[0].id);
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<'Low'|'Medium'|'High'>('Medium');
    const [isTracked, setIsTracked] = useState(true);
    
    // AI State
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const handleSuggest = async () => {
        if (!title) return;
        setIsSuggesting(true);
        const subjName = subjects.find(s => s.id === subjectId)?.name || 'General';
        const result = await suggestTaskBreakdown(title, subjName);
        setSuggestions(result);
        setIsSuggesting(false);
    };

    const handleSubmit = () => {
        if(!title || !dueDate) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        onSave({
            title,
            subjectId,
            dueDate: new Date(dueDate),
            priority,
            progress: 0,
            notes: suggestions.length > 0 ? `AI Plan:\n- ${suggestions.join('\n- ')}` : '',
            isTracked
        });
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-24 p-6 animate-fade-in">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={onCancel} className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm"><ChevronLeft size={20} className="text-slate-600"/></button>
                <h1 className="text-xl font-bold text-slate-800">สร้างงานใหม่</h1>
             </div>

             <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่องาน</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                            placeholder="ระบุชื่องาน..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">รายวิชา</label>
                        <div className="grid grid-cols-2 gap-2">
                            {subjects.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSubjectId(s.id)}
                                    className={`px-3 py-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                                        subjectId === s.id 
                                        ? `bg-slate-800 text-white border-slate-800` 
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className="text-lg">{s.icon}</span>
                                    <span className="text-xs font-medium truncate">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">กำหนดส่ง</label>
                        <input 
                            type="date" 
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none text-xs text-slate-700"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ความสำคัญ</label>
                        <select 
                            value={priority}
                            onChange={(e: any) => setPriority(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none text-xs text-slate-700"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>

                {/* AI Feature - Professional Look */}
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-5 border border-indigo-100">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                            <Sparkles size={16} />
                            <span>AI Assistant</span>
                        </div>
                        <button 
                            onClick={handleSuggest}
                            disabled={isSuggesting || !title}
                            className="text-[10px] font-bold bg-white text-indigo-600 px-3 py-1.5 rounded-md border border-indigo-200 shadow-sm disabled:opacity-50 hover:bg-indigo-50"
                        >
                            {isSuggesting ? 'กำลังวิเคราะห์...' : 'ขอคำแนะนำ'}
                        </button>
                    </div>
                    {suggestions.length > 0 ? (
                        <div className="bg-white/80 p-3 rounded-lg border border-indigo-50">
                             <ul className="text-xs text-slate-600 list-decimal list-inside space-y-1.5 font-medium">
                                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    ) : (
                         <p className="text-xs text-slate-400 italic">ให้ AI ช่วยวางแผนขั้นตอนการทำงานย่อยสำหรับ "{title || '...'}"</p>
                    )}
                </div>

                <div className="flex items-center justify-between px-2">
                     <span className="text-sm font-medium text-slate-700">เปิดใช้งานการติดตาม (Tracking)</span>
                     <button 
                        onClick={() => setIsTracked(!isTracked)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${isTracked ? 'bg-slate-800' : 'bg-slate-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${isTracked ? 'left-6' : 'left-1'}`}></div>
                    </button>
                </div>

                <button 
                    onClick={handleSubmit}
                    className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all hover:bg-slate-900"
                >
                    ยืนยันการสร้างงาน
                </button>
             </div>
        </div>
    );
};

// --- 5. Calendar View ---
const CalendarView = ({ assignments }: { assignments: Assignment[] }) => {
    const grouped = assignments.reduce((acc, curr) => {
        const d = curr.dueDate.toLocaleDateString('th-TH');
        if (!acc[d]) acc[d] = [];
        acc[d].push(curr);
        return acc;
    }, {} as Record<string, Assignment[]>);

    const sortedDates = Object.keys(grouped).sort((a,b) => a.localeCompare(b));

    return (
        <div className="p-6 pb-24 animate-fade-in bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <CalendarIcon className="text-indigo-600" /> ตารางงาน
            </h1>
            
            <div className="space-y-8 relative">
                {/* Timeline Line */}
                <div className="absolute left-3.5 top-2 bottom-0 w-0.5 bg-slate-200"></div>

                {sortedDates.map(date => (
                    <div key={date} className="relative pl-10">
                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-1 w-7 h-7 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center z-10">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        </div>

                        <h3 className="text-sm font-bold text-slate-500 mb-3 bg-slate-50 inline-block pr-2">{date}</h3>
                        <div className="space-y-3">
                            {grouped[date].map(task => (
                                <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
                                        <div className="flex gap-2 mt-1.5">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500`}>
                                                {task.priority} Priority
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-indigo-600 font-mono font-bold text-sm">
                                        {task.progress}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 6. Weekly Summary ---
const WeeklySummary = ({ assignments, subjects }: { assignments: Assignment[], subjects: Subject[] }) => {
    // Elegant colors for chart
    const data = subjects.map(s => {
        const subAssigns = assignments.filter(a => a.subjectId === s.id);
        const avg = subAssigns.length ? subAssigns.reduce((a,b) => a + b.progress, 0) / subAssigns.length : 0;
        return {
            name: s.name,
            progress: Math.round(avg),
            // Use colors from tailwind extended config manually
            color: '#475569' // Slate 600
        };
    });

    const pending = assignments.filter(a => a.progress < 100).length;
    const done = assignments.filter(a => a.progress === 100).length;

    return (
        <div className="p-6 pb-24 animate-fade-in bg-slate-50 min-h-screen">
             <h1 className="text-2xl font-bold text-slate-800 mb-6">สรุปผลการเรียน</h1>
             
             {/* Stats Row */}
             <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <p className="text-slate-400 text-xs font-bold uppercase">เสร็จสิ้น</p>
                    </div>
                    <p className="text-4xl font-light text-slate-800">{done}</p>
                </div>
                <div className="flex-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <p className="text-slate-400 text-xs font-bold uppercase">คงเหลือ</p>
                    </div>
                    <p className="text-4xl font-light text-slate-800">{pending}</p>
                </div>
             </div>

             {/* Chart */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                <h3 className="font-bold text-slate-700 mb-6 text-sm">ประสิทธิภาพรายวิชา</h3>
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis 
                                dataKey="name" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                interval={0} 
                                tick={{fill: '#94a3b8'}}
                            />
                            <Tooltip 
                                cursor={{fill: '#f1f5f9'}} 
                                contentStyle={{
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    backgroundColor: '#1e293b',
                                    color: '#fff'
                                }} 
                                itemStyle={{color: '#fff'}}
                            />
                            <Bar dataKey="progress" radius={[4, 4, 0, 0]} barSize={30}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1e293b' : '#64748b'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </div>
        </div>
    );
};

// --- 7. Notifications ---
const Notifications = ({ notifications }: { notifications: NotificationItem[] }) => {
    return (
        <div className="p-6 pb-24 animate-fade-in bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">แจ้งเตือน</h1>
            <div className="space-y-3">
                {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-xl border flex gap-4 transition-colors ${n.type === 'urgent' ? 'bg-white border-red-200 shadow-sm' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'urgent' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'}`}>
                            {n.type === 'urgent' ? <AlertCircle size={20} /> : <Bell size={20} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-800 text-sm font-medium leading-relaxed">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1.5 font-light">
                                {n.timestamp.toLocaleDateString('th-TH')} &bull; {n.timestamp.getHours()}:{n.timestamp.getMinutes().toString().padStart(2, '0')}
                            </p>
                        </div>
                        {n.type === 'urgent' && <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main App Container ---
const App: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.DASHBOARD);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [notifications, setNotifications] = useState<NotificationItem[]>([
        { id: '1', message: 'เหลือเวลาอีก 2 วันในการส่งงานวิทยาศาสตร์', type: 'urgent', timestamp: new Date() },
        { id: '2', message: 'กรุณาอัปเดตความคืบหน้าวิชาศิลปะ', type: 'reminder', timestamp: new Date() }
    ]);

    // Data with Teachers and Elegant Styling Keys
    const [subjects] = useState<Subject[]>([
        { 
            id: 's1', 
            name: 'Advanced Mathematics', 
            teacherName: 'Dr. Somchai P.', 
            teacherImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Somchai',
            color: 'text-indigo-600', 
            icon: '∑' 
        },
        { 
            id: 's2', 
            name: 'Physics Laboratory', 
            teacherName: 'Prof. Varunee', 
            teacherImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Varunee',
            color: 'text-emerald-600', 
            icon: '⚡' 
        },
        { 
            id: 's3', 
            name: 'Thai Literature', 
            teacherName: 'Ajarn Mana', 
            teacherImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mana',
            color: 'text-amber-600', 
            icon: '✒️' 
        },
        { 
            id: 's4', 
            name: 'Visual Arts', 
            teacherName: 'Ms. Pranee', 
            teacherImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pranee',
            color: 'text-rose-500', 
            icon: '🎨' 
        },
    ]);

    const [assignments, setAssignments] = useState<Assignment[]>([
        { id: 'a1', title: 'Calculus Chapter 4', subjectId: 's1', dueDate: new Date(Date.now() + 86400000 * 2), progress: 50, priority: 'High', notes: '', isTracked: true },
        { id: 'a2', title: 'Lab Report: Pendulum', subjectId: 's2', dueDate: new Date(Date.now() + 86400000 * 5), progress: 25, priority: 'Medium', notes: 'Drafting introduction', isTracked: true },
        { id: 'a3', title: 'Perspective Drawing', subjectId: 's4', dueDate: new Date(Date.now() + 86400000 * 1), progress: 75, priority: 'Low', notes: '', isTracked: false },
    ]);

    const handleSubjectClick = (sub: Subject) => {
        setSelectedSubject(sub);
        setCurrentScreen(Screen.ASSIGNMENT_LIST);
    };

    const handleUpdateClick = (assign: Assignment) => {
        setSelectedAssignment(assign);
        setCurrentScreen(Screen.PROGRESS_UPDATE);
    };

    const handleProgressSave = (id: string, progress: any, note: string) => {
        setAssignments(prev => prev.map(a => a.id === id ? { ...a, progress, notes: note } : a));
        setCurrentScreen(selectedSubject ? Screen.ASSIGNMENT_LIST : Screen.DASHBOARD);
        setSelectedAssignment(null);
    };

    const handleNewAssignment = (newA: Omit<Assignment, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setAssignments([...assignments, { ...newA, id } as Assignment]);
        setCurrentScreen(Screen.DASHBOARD);
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case Screen.DASHBOARD:
                return <Dashboard subjects={subjects} assignments={assignments} onSubjectClick={handleSubjectClick} />;
            case Screen.ASSIGNMENT_LIST:
                return selectedSubject ? (
                    <AssignmentList 
                        subject={selectedSubject} 
                        assignments={assignments.filter(a => a.subjectId === selectedSubject.id)} 
                        onBack={() => setCurrentScreen(Screen.DASHBOARD)}
                        onUpdateClick={handleUpdateClick}
                    />
                ) : <Dashboard subjects={subjects} assignments={assignments} onSubjectClick={handleSubjectClick} />;
            case Screen.PROGRESS_UPDATE:
                return selectedAssignment ? (
                    <ProgressUpdate 
                        assignment={selectedAssignment} 
                        onSave={handleProgressSave} 
                        onCancel={() => setCurrentScreen(selectedSubject ? Screen.ASSIGNMENT_LIST : Screen.DASHBOARD)} 
                    />
                ) : null;
            case Screen.NEW_ASSIGNMENT:
                return <NewAssignment subjects={subjects} onSave={handleNewAssignment} onCancel={() => setCurrentScreen(Screen.DASHBOARD)} />;
            case Screen.CALENDAR:
                return <CalendarView assignments={assignments} />;
            case Screen.SUMMARY:
                return <WeeklySummary assignments={assignments} subjects={subjects} />;
            case Screen.NOTIFICATIONS:
                return <Notifications notifications={notifications} />;
            default:
                return <Dashboard subjects={subjects} assignments={assignments} onSubjectClick={handleSubjectClick} />;
        }
    };

    return (
        <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden font-sans border-x border-slate-200">
            {renderScreen()}
            {currentScreen !== Screen.PROGRESS_UPDATE && currentScreen !== Screen.NEW_ASSIGNMENT && (
                <BottomNav 
                    currentScreen={currentScreen} 
                    setScreen={setCurrentScreen} 
                    notificationCount={notifications.length}
                />
            )}
        </div>
    );
};

export default App;