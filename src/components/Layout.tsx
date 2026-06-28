import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, ChevronRight, Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/sales-orders': 'Sales Orders',
  '/customer-master': 'Customer Master',
  '/product-master': 'Product Master',
  '/chemical-master': 'Chemical / Material Master',
  '/supplier-master': 'Supplier Master',
  '/recipe-creation': 'Recipe Creation',
  '/bom': 'BOM',
  '/bom-revision': 'BOM Revision',
  '/material-requirement': 'Material Requirement',
  '/inventory': 'Inventory',
  '/production': 'Production',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const parentMap: Record<string, string> = {
  '/customer-master': 'Masters',
  '/product-master': 'Masters',
  '/chemical-master': 'Masters',
  '/supplier-master': 'Masters',
  '/recipe-creation': 'BOM / Recipe',
  '/bom': 'BOM / Recipe',
  '/bom-revision': 'BOM / Recipe',
  '/material-requirement': 'BOM / Recipe',
};

export default function Layout() {
  const location = useLocation();
  const path = location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const getBreadcrumbs = () => {
    const crumbs: { label: string }[] = [];
    const parent = parentMap[path];
    if (parent) crumbs.push({ label: parent });
    crumbs.push({ label: breadcrumbMap[path] || 'Page' });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const pageTitle = breadcrumbMap[path] || 'Page';

  return (
    <div className="flex h-screen bg-[#f0f4f8]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 min-w-0 transition-all duration-300 overflow-y-auto ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/60 flex items-center justify-between px-3 sm:px-5 lg:px-6 shadow-sm">
          {/* Left section */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-1 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">{pageTitle}</h1>
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-400">
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight size={10} className="text-gray-300" />}
                    <span className={`truncate ${i === breadcrumbs.length - 1 ? 'text-gray-600 font-medium' : 'hover:text-gray-600 cursor-pointer transition-colors'}`}>
                      {crumb.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Company Logo */}
          <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
            <img src="/images/company-logo.png" alt="AKM Leather" className="h-[140px] object-contain opacity-90" />
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
            {/* Search */}
            <div className={`hidden md:flex items-center rounded-xl px-3 py-2 transition-all duration-300 ${
              searchFocused
                ? 'bg-white border border-blue-300 shadow-md shadow-blue-100 w-64'
                : 'bg-gray-50 border border-gray-200/80 w-48 hover:border-gray-300'
            }`}>
              <Search size={15} className={`shrink-0 transition-colors ${searchFocused ? 'text-blue-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400 ml-2"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>

            {/* Mobile search button */}
            <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
              <Search size={18} />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95">
              <Bell size={19} />
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold leading-none ring-2 ring-white px-1 animate-pulse">
                4
              </span>
            </button>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-gray-200/80 mx-1"></div>

            {/* User profile */}
            <button className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:pl-2 sm:pr-3 rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]">
              <div className="relative">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-md shadow-blue-200/50 ring-2 ring-white">
                  AU
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-800 leading-tight">Admin User</div>
                <div className="text-[11px] text-gray-400 leading-tight">Administrator</div>
              </div>
              <ChevronDown size={13} className="hidden sm:block text-gray-400" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
