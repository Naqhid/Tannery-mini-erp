import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
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
  LogOut,
  Building2,
  Warehouse,
  ArrowLeftRight,
  Receipt,
  Plus,
  CheckCircle,
  HardDrive,
  FileSpreadsheet,
} from 'lucide-react';

export interface ChildItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: ChildItem[];
}

export const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
  { label: 'Sales Orders', icon: <FileText size={20} />, path: '/sales-orders' },
  {
    label: 'Masters',
    icon: <FolderOpen size={20} />,
    children: [
      { label: 'Customer Master', icon: <Users size={16} />, path: '/customer-master' },
      { label: 'Supplier Master', icon: <Truck size={16} />, path: '/supplier-master' },
      { label: 'Product Master', icon: <Box size={16} />, path: '/product-master' },
      { label: 'Product Category', icon: <Layers size={16} />, path: '/product-category' },
      { label: 'Group Master', icon: <Layers size={16} />, path: '/group-master' },
      { label: 'Leather Type', icon: <Layers size={16} />, path: '/leather-type' },
      { label: 'UOM', icon: <Layers size={16} />, path: '/uom' },
      { label: 'Thickness', icon: <Layers size={16} />, path: '/thickness' },
      { label: 'Standard Size', icon: <Layers size={16} />, path: '/standard-size' },
      { label: 'Color', icon: <Layers size={16} />, path: '/color' },
      { label: 'Finish Type', icon: <Layers size={16} />, path: '/finish-type' },
      { label: 'Grade', icon: <Layers size={16} />, path: '/grade' },
      { label: 'Process Stage', icon: <ListChecks size={16} />, path: '/process-stage' },
      { label: 'Machine / Equipment', icon: <Factory size={16} />, path: '/machine' },
      { label: 'Warehouse / Store Master', icon: <Warehouse size={16} />, path: '/warehouse-master' },
    ],
  },
  {
    label: 'BOM / Recipe',
    icon: <ClipboardList size={20} />,
    children: [
      { label: 'BOM (Bill of Materials)', icon: <Layers size={16} />, path: '/bom' },
      { label: 'Recipe Creation', icon: <PenTool size={16} />, path: '/recipe-creation' },
      { label: 'Standard Cost', icon: <FileText size={16} />, path: '/standard-costing' },
      { label: 'BOM Revision', icon: <GitBranch size={16} />, path: '/bom-revision' },
      { label: 'Material Requirement', icon: <ListChecks size={16} />, path: '/material-requirement' },
    ],
  },
  {
    label: 'Purchase',
    icon: <Truck size={20} />,
    children: [
      { label: 'Chemical / Material Master', icon: <FlaskConical size={16} />, path: '/chemical-master' },
      { label: 'Supplier Pricing History', icon: <Receipt size={16} />, path: '/supplier-pricing-history' },
      { label: 'Supplier Price Approval', icon: <CheckCircle size={16} />, path: '/supplier-price-approval' },
    ],
  },
  { label: 'Inventory', icon: <Package size={20} />, children: [
      { label: 'Material Receipt Entry', icon: <Truck size={16} />, path: '/material-receipt' },
      { label: 'Physical Stock Entry', icon: <ClipboardList size={16} />, path: '/physical-stock-entry' },
      { label: 'Stock Transfer Entry', icon: <ArrowLeftRight size={16} />, path: '/stock-transfer' },
      { label: 'Material Issue to Production', icon: <Factory size={16} />, path: '/material-issue' },
    ],
  },
  { label: 'Production', icon: <Factory size={20} />, children: [
      { label: 'Production Plan', icon: <ClipboardList size={16} />, path: '/production-plan' },
      { label: 'Batch Creation', icon: <ListChecks size={16} />, path: '/production-plan/new' },
      { label: 'Material Requisition Note', icon: <Layers size={16} />, path: '/batch-process' },
      { label: 'Batch / Lot Tracking', icon: <Package size={16} />, path: '/batch-lot-tracking' },
    ],
  },
  { label: 'Reports', icon: <FileBarChart size={20} />, children: [
      { label: 'Production Reports', icon: <FileText size={16} />, path: '/reports' },
      { label: 'Inventory Reports', icon: <FileBarChart size={16} />, path: '/inventory-reports' },
      { label: 'Cost Analysis', icon: <FileText size={16} />, path: '/cost-analysis' },
    ],
  },
  { label: 'Settings', icon: <Settings size={20} />, children: [
      { label: 'Users', icon: <Users size={16} />, path: '/users' },
      { label: 'Roles', icon: <Users size={16} />, path: '/roles' },
      { label: 'Company', icon: <Building2 size={16} />, path: '/company' },
      { label: 'Business Units', icon: <Factory size={16} />, path: '/business-units' },
      { label: 'Database Backups', icon: <HardDrive size={16} />, path: '/database-backups' },
      { label: 'Data Templates', icon: <FileSpreadsheet size={16} />, path: '/data-templates' },
    ],
  },
];

export default function Sidebar({ mobileOpen, setMobileOpen, collapsed, setCollapsed }: { mobileOpen: boolean; setMobileOpen: (open: boolean) => void; collapsed: boolean; setCollapsed: (collapsed: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const navRef = useRef<HTMLElement>(null);

  // Determine which parent groups should be expanded based on current path
  const getInitialExpanded = (): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (c) => location.pathname === c.path || location.pathname.startsWith(c.path + '/')
        );
        result[item.label] = hasActiveChild;
      }
    });
    return result;
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>(getInitialExpanded);

  // On route change, auto-expand the parent and scroll active item into view
  useEffect(() => {
    // Auto-expand parent of active child
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (c) => location.pathname === c.path || location.pathname.startsWith(c.path + '/')
        );
        if (hasActiveChild) {
          setExpanded((prev) => ({ ...prev, [item.label]: true }));
        }
      }
    });

    // Scroll active item into view after a short delay (to allow expand animation)
    const timer = setTimeout(() => {
      const activeEl = navRef.current?.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const toggleExpand = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some((c) => location.pathname === c.path);
  };

  // Filter menu items based on user's menu_access
  // If menu_access is empty/undefined, show all (backward compatible for admin)
  const userMenuAccess = user?.menu_access;
  const hasMenuRestrictions = Array.isArray(userMenuAccess) && userMenuAccess.length > 0;

  const filteredMenuItems = hasMenuRestrictions
    ? menuItems.map((item) => {
        if (item.path) {
          return userMenuAccess.includes(item.path) ? item : null;
        }
        if (item.children) {
          const filteredChildren = item.children.filter((c) => userMenuAccess.includes(c.path));
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }
        return item;
      }).filter(Boolean) as MenuItem[]
    : menuItems;

  return (
    <>
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-[#0b1a30] via-[#0a1628] to-[#071020] text-white z-50 transition-all duration-300 flex flex-col shadow-2xl shadow-black/50 w-64 ${
          collapsed ? 'lg:w-16' : 'lg:w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Header with Logo */}
        <div className={`flex items-center ${collapsed ? 'lg:flex-col lg:gap-2 lg:py-4 lg:px-2 justify-between px-4 py-5' : 'justify-between px-4 py-5'} border-b border-white/[0.06]`}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}images/product-logo-white.png`}
                alt="Corix"
                className="h-12 w-12 object-contain shrink-0 brightness-[5] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              />
              <div className="min-w-0">
                <div className="text-base font-bold leading-tight text-white tracking-wide">Corix</div>
                <div className="text-[10px] leading-tight text-blue-300/80 font-medium tracking-wider uppercase mt-0.5">
                  Powering Modern Tanneries
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <>
              {/* On mobile show full, on lg show collapsed */}
              <div className="flex items-center gap-3 lg:hidden">
                <img
                  src={`${import.meta.env.BASE_URL}images/product-logo-white.png`}
                  alt="Corix"
                  className="h-10 w-10 object-contain shrink-0 brightness-[5] drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold leading-tight text-white tracking-wide">Corix</div>
                  <div className="text-[9px] leading-tight text-blue-300/80 font-medium tracking-wider uppercase mt-0.5">
                    Powering Modern Tanneries
                  </div>
                </div>
              </div>
              <img
                src={`${import.meta.env.BASE_URL}images/product-logo-white.png`}
                alt="Corix"
                className="hidden lg:block h-8 w-8 object-contain brightness-[5] drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
              />
            </>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-slate-400 hover:text-white transition-colors"
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Menu */}
        <nav ref={navRef} className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {filteredMenuItems.map((item) => {
            const hasChildren = !!item.children;
            const active = isActive(item.path);
            const parentActive = isParentActive(item);
            const isExpanded = expanded[item.label];

            if (hasChildren) {
              return (
                <div key={item.label} className="mb-0.5">
                  {/* Parent group button */}
                  <button
                    onClick={() => collapsed ? (item.children?.[0] && navigate(item.children[0].path)) : toggleExpand(item.label)}
                    className={`group w-full flex items-center ${collapsed ? 'gap-3 lg:justify-center lg:gap-0' : 'gap-3'} px-3 py-2.5 text-[13px] rounded-lg transition-all duration-200 ${
                      parentActive
                        ? 'text-white bg-white/[0.04]'
                        : 'text-white hover:bg-white/[0.06]'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className={`shrink-0 transition-colors duration-200 ${parentActive ? 'text-blue-400' : 'text-white/70 group-hover:text-white'}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                    )}
                    {collapsed && (
                      <span className="flex-1 text-left font-medium lg:hidden">{item.label}</span>
                    )}
                    {!collapsed && (
                      <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={14} className="text-slate-500" />
                      </span>
                    )}
                    {collapsed && (
                      <span className={`transition-transform duration-200 lg:hidden ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={14} className="text-slate-500" />
                      </span>
                    )}
                  </button>

                  {/* Children with animated expand */}
                  {(!collapsed || true) && isExpanded && (
                    <div className={`mt-1 ml-4 pl-3 border-l border-white/[0.06] space-y-0.5 ${collapsed ? 'lg:hidden' : ''}`}>
                      {item.children!.map((child) => (
                        <button
                          key={child.label}
                          data-active={isActive(child.path) ? 'true' : undefined}
                          onClick={() => {
                            navigate(child.path);
                            setMobileOpen(false);
                          }}
                          className={`group w-full flex items-center gap-3 text-left px-3 py-2 text-[13px] rounded-lg transition-all duration-200 ${
                            isActive(child.path)
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg shadow-blue-600/25'
                              : 'text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <span className={`shrink-0 transition-colors ${isActive(child.path) ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                            {child.icon}
                          </span>
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
                data-active={active ? 'true' : undefined}
                onClick={() => {
                  if (item.path) {
                    navigate(item.path);
                    setMobileOpen(false);
                  }
                }}
                className={`group w-full flex items-center ${collapsed ? 'gap-3 lg:justify-center lg:gap-0' : 'gap-3'} px-3 py-2.5 text-[13px] rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg shadow-blue-600/25'
                    : 'text-white hover:bg-white/[0.06]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className={`shrink-0 transition-colors duration-200 ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="text-left">{item.label}</span>}
                {collapsed && <span className="text-left lg:hidden">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/[0.06] p-3">
          <div className={`flex items-center ${collapsed ? 'gap-3 lg:justify-center lg:gap-0' : 'gap-3'} group`}>
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-blue-500/20 ring-2 ring-white/10">
                {user?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AU'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0a1628] rounded-full shadow-sm shadow-emerald-400/50"></span>
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-white/90">{user?.full_name || 'Admin User'}</div>
                  <div className="text-[11px] text-slate-400/80 truncate">{user?.username || 'Administrator'}</div>
                </div>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
            {collapsed && (
              <div className="flex-1 min-w-0 lg:hidden flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-white/90">{user?.full_name || 'Admin User'}</div>
                  <div className="text-[11px] text-slate-400/80 truncate">{user?.username || 'Administrator'}</div>
                </div>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
