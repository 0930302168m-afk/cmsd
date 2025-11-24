import React from 'react';
import { Home, Calendar, PieChart, Bell, Plus } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
  notificationCount: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, setScreen, notificationCount }) => {
  const navItemClass = (screen: Screen) => 
    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
      currentScreen === screen ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
    }`;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-lg h-[72px] px-6 z-50">
      <div className="flex justify-between items-center h-full max-w-md mx-auto">
        <button className={navItemClass(Screen.DASHBOARD)} onClick={() => setScreen(Screen.DASHBOARD)}>
          <Home size={22} strokeWidth={currentScreen === Screen.DASHBOARD ? 2.5 : 2} />
          <span className="text-[10px] font-medium tracking-wide mt-1">หน้าหลัก</span>
        </button>

        <button className={navItemClass(Screen.CALENDAR)} onClick={() => setScreen(Screen.CALENDAR)}>
          <Calendar size={22} strokeWidth={currentScreen === Screen.CALENDAR ? 2.5 : 2} />
          <span className="text-[10px] font-medium tracking-wide mt-1">ปฏิทิน</span>
        </button>

        <button 
            className="flex flex-col items-center justify-center -mt-8 group" 
            onClick={() => setScreen(Screen.NEW_ASSIGNMENT)}
        >
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shadow-xl shadow-slate-300 ring-4 ring-white group-active:scale-95 transition-transform">
            <Plus size={24} color="white" />
          </div>
          <span className="text-[10px] font-medium text-slate-500 mt-2">เพิ่มงาน</span>
        </button>

        <button className={navItemClass(Screen.SUMMARY)} onClick={() => setScreen(Screen.SUMMARY)}>
          <PieChart size={22} strokeWidth={currentScreen === Screen.SUMMARY ? 2.5 : 2} />
          <span className="text-[10px] font-medium tracking-wide mt-1">สรุปผล</span>
        </button>

        <button className={navItemClass(Screen.NOTIFICATIONS)} onClick={() => setScreen(Screen.NOTIFICATIONS)}>
            <div className="relative">
                <Bell size={22} strokeWidth={currentScreen === Screen.NOTIFICATIONS ? 2.5 : 2} />
                {notificationCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {notificationCount}
                    </span>
                )}
            </div>
          <span className="text-[10px] font-medium tracking-wide mt-1">แจ้งเตือน</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;