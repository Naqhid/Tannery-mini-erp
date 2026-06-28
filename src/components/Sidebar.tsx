import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  FolderOpen,
  ClipboardList,
  Package,
  Factory,
  FileBarChart,
  Settings,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Users,
  Box,
  FlaskConical,
  Truck,
  PenTool,
  Layers,
  GitBranch,
  ListChecks,
} from 'lucide-react';

interface ChildItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: ChildItem[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
  { label: 'Sales Orders', icon: <FileText size={20} />, path: '/sales-orders' },
  {
    label: 'Masters',
    icon: <FolderOpen size={20} />,
    children: [
      { label: 'Customer Master', icon: <Users size={16} />, path: '/customer-master' },
      { label: 'Product Master', icon: <Box size={16} />, path: '/product-master' },
      { label: 'Chemical / Material Master', icon: <FlaskConical size={16} />, path: '/chemical-master' },
      { label: 'Suppliers Master', icon: <Truck size={16} />, path: '/supplier-master' },
    ],
  },
  {
    label: 'BOM / Recipe',
    icon: <ClipboardList size={20} />,
    children: [
      { label: 'Recipe Creation', icon: <PenTool size={16} />, path: '/recipe-creation' },
      { label: 'BOM (Bill of Materials)', icon: <Layers size={16} />, path: '/bom' },
      { label: 'BOM Revision', icon: <GitBranch size={16} />, path: '/bom-revision' },
      { label: 'Material Requirement', icon: <ListChecks size={16} />, path: '/material-requirement' },
    ],
  },
  { label: 'Inventory', icon: <Package size={20} />, children: [
      { label: 'Stock Overview', icon: <Box size={16} />, path: '/inventory' },
      { label: 'Stock In', icon: <Package size={16} />, path: '/stock-in' },
      { label: 'Stock Out', icon: <Package size={16} />, path: '/stock-out' },
    ],
  },
  { label: 'Production', icon: <Factory size={20} />, children: [
      { label: 'Production Orders', icon: <ClipboardList size={16} />, path: '/production' },
      { label: 'Work Orders', icon: <ListChecks size={16} />, path: '/work-orders' },
      { label: 'Batch Tracking', icon: <Layers size={16} />, path: '/batch-tracking' },
    ],
  },
  { label: 'Reports', icon: <FileBarChart size={20} />, children: [
      { label: 'Production Reports', icon: <FileText size={16} />, path: '/reports' },
      { label: 'Inventory Reports', icon: <FileBarChart size={16} />, path: '/inventory-reports' },
      { label: 'Cost Analysis', icon: <FileText size={16} />, path: '/cost-analysis' },
    ],
  },
  { label: 'Settings', icon: <Settings size={20} />, children: [
      { label: 'General', icon: <Settings size={16} />, path: '/settings' },
      { label: 'Users & Roles', icon: <Users size={16} />, path: '/users' },
      { label: 'Notifications', icon: <FileText size={16} />, path: '/notifications' },
    ],
  },
];

// Leather hide SVG icon component - organic animal skin shape
function LeatherIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Animal hide/skin outline shape */}
      <path
        d="M24 3C20 3 17 5 15 7C12 5 9 4 7 6C5 8 5 11 6 14C4 16 3 19 3 22C3 25 4 28 6 30C5 33 5 36 7 38C9 40 12 40 15 39C17 41 20 43 24 43C28 43 31 41 33 39C36 40 39 40 41 38C43 36 43 33 42 30C44 28 45 25 45 22C45 19 44 16 42 14C43 11 43 8 41 6C39 4 36 5 33 7C31 5 28 3 24 3Z"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Small leaf/plant detail inside */}
      <path
        d="M24 18C24 18 20 22 20 26C20 29 22 31 24 31C26 31 28 29 28 26C28 22 24 18 24 18Z"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 18V31"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (open: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Masters: true,
    'BOM / Recipe': true,
  });

  const toggleExpand = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isParentActive = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some((c) => location.pathname === c.path);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#0a1628] text-white z-40 transition-all duration-300 flex flex-col w-64 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Header with Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <LeatherIcon />
            <div className="min-w-0">
              <div className="text-sm font-bold leading-tight text-white">Leather Finishing</div>
              <div className="text-sm font-bold leading-tight text-white">Tannery</div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
          <button className="hidden lg:block text-slate-400 hover:text-white">
            <Menu size={18} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const hasChildren = !!item.children;
            const active = isActive(item.path);
            const parentActive = isParentActive(item);
            const isExpanded = expanded[item.label];

            if (hasChildren) {
              return (
                <div key={item.label}>
                  {/* Parent group button */}
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-lg transition-colors ${
                      parentActive
                        ? 'text-white'
                        : 'text-white/90 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="shrink-0 text-white/80">{item.icon}</span>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {isExpanded ? (
                      <ChevronUp size={14} className="text-slate-500" />
                    ) : (
                      <ChevronDown size={14} className="text-slate-500" />
                    )}
                  </button>

                  {/* Children */}
                  {isExpanded && (
                    <div className="mt-1 ml-5 space-y-0.5">
                      {item.children!.map((child) => (
                        <button
                          key={child.label}
                          onClick={() => {
                            navigate(child.path);
                            setMobileOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 text-left px-3 py-2 text-[13px] rounded-lg transition-colors ${
                            isActive(child.path)
                              ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/20'
                              : 'text-white/90 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className="shrink-0">{child.icon}</span>
                          <span className="truncate">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Regular menu item (no children)
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.path) {
                    navigate(item.path);
                    setMobileOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/20'
                    : 'text-white/90 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white">
                AU
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0a1628] rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-white">Admin User</div>
              <div className="text-xs text-slate-400 truncate">Administrator</div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>
      </aside>
    </>
  );
}
