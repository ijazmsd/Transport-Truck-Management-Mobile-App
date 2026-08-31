import React from 'react';
import {
  LayoutDashboard,
  Navigation,
  Truck as TruckIcon,
  CreditCard,
  MoreHorizontal,
  Code2,
} from 'lucide-react';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeTripsCount: number;
}

export const BottomNavBar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  activeTripsCount,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trips', label: 'Trips', icon: Navigation, badge: activeTripsCount > 0 ? activeTripsCount : undefined },
    { id: 'fleet', label: 'Fleet', icon: TruckIcon },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    { id: 'more', label: 'Settings', icon: MoreHorizontal },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 flex justify-around items-center z-40 shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
