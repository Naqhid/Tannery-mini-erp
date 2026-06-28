import { Outlet, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
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
    <div className="flex h-screen bg-[#f1f5f9]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-gray-300">›</span>}
                  <span className={i === breadcrumbs.length - 1 ? 'text-gray-700' : ''}>
                    {crumb.label}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-56">
              <input
                type="text"
                placeholder="Search here..."
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
              />
              <Search size={16} className="text-gray-400 shrink-0" />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                4
              </span>
            </button>

            {/* User */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white">
                AU
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
