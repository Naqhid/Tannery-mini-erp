import { useState, useRef, useEffect, useMemo } from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, ChevronRight, Menu, LogOut } from 'lucide-react';
import Sidebar, { menuItems } from './Sidebar';
import { useAuth } from '../lib/authContext';

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
  '/batch-lot-tracking': 'Batch / Lot Tracking',
  '/supplier-pricing-history': 'Supplier Pricing History',
  '/supplier-pricing-history/new': 'Add New Price',
  '/supplier-price-approval': 'Supplier Price Approval',
  '/physical-stock-entry': 'Physical Stock Entry',
  '/physical-stock-entry/new': 'Physical Stock Entry',
};

const parentMap: Record<string, string> = {
  '/customer-master': 'Masters',
  '/product-master': 'Masters',
  '/chemical-master': 'Masters',
  '/supplier-master': 'Purchase',
  '/recipe-creation': 'BOM / Recipe',
  '/bom': 'BOM / Recipe',
  '/bom-revision': 'BOM / Recipe',
  '/material-requirement': 'BOM / Recipe',
  '/batch-lot-tracking': 'Production',
  '/supplier-pricing-history': 'Purchase',
  '/supplier-pricing-history/new': 'Purchase',
  '/supplier-price-approval': 'Purchase',
  '/physical-stock-entry': 'Inventory',
  '/physical-stock-entry/new': 'Inventory',
};

export default function Layout() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Flatten menu items for search
  const searchableItems = useMemo(() => {
    const items: { label: string; path: string; parent?: string }[] = [];
    for (const item of menuItems) {
      if (item.path) {
        items.push({ label: item.label, path: item.path });
      }
      if (item.children) {
        for (const child of item.children) {
          items.push({ label: child.label, path: child.path, parent: item.label });
        }
      }
    }
    return items;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return searchableItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      (item.parent && item.parent.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [searchQuery, searchableItems]);

  const showSearchResults = searchFocused && searchQuery.trim().length > 0;

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Wait for auth state to be resolved before deciding
  if (loading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const getBreadcrumbs = () => {
    const crumbs: { label: string }[] = [];
    const parent = parentMap[path];
    if (parent) crumbs.push({ label: parent });
    crumbs.push({ label: breadcrumbMap[path] || 'Page' });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen bg-[#f0f4f8]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 min-w-0 transition-all duration-300 overflow-y-auto ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200/60 shadow-sm">
          {/* First row - Title, Logo, Actions */}
          <div className="h-14 sm:h-16 flex items-center justify-between px-2 sm:px-4 lg:px-6">
            {/* Left section - Hamburger + Logo */}
            <div className="flex items-center gap-1 sm:gap-3 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ml-1 text-gray-600 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 active:scale-95"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center shrink-0">
                <img src={`${import.meta.env.BASE_URL}images/company-logo.png`} alt="AKM Leather" className="h-[100px] sm:h-[120px] lg:h-[140px] object-contain" />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
            {/* Search */}
            <div ref={searchRef} className={`hidden md:flex items-center relative rounded-xl px-3 py-2 transition-all duration-300 ${
              searchFocused
                ? 'bg-white border border-blue-400 shadow-md shadow-blue-100/50 w-64'
                : 'bg-gray-50 border border-gray-200 w-48 hover:border-gray-300'
            }`}>
              <Search size={15} className={`shrink-0 transition-colors ${searchFocused ? 'text-blue-500' : 'text-gray-400'}`} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400 ml-2"
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => { setSearchQuery(e.target.value); setHighlightedIndex(-1); setSearchFocused(true); }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedIndex(prev => Math.max(prev - 1, 0));
                  } else if (e.key === 'Enter' && highlightedIndex >= 0 && searchResults[highlightedIndex]) {
                    e.preventDefault();
                    navigate(searchResults[highlightedIndex].path);
                    setSearchQuery('');
                    setSearchFocused(false);
                    searchInputRef.current?.blur();
                  } else if (e.key === 'Escape') {
                    setSearchQuery('');
                    setSearchFocused(false);
                    searchInputRef.current?.blur();
                  }
                }}
              />
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">No results found</div>
                  ) : (
                    searchResults.map((item, idx) => (
                      <button
                        key={item.path}
                        onMouseDown={(e) => { e.preventDefault(); navigate(item.path); setSearchQuery(''); setSearchFocused(false); }}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          idx === highlightedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Search size={13} className="text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{item.label}</div>
                          {item.parent && <div className="text-[11px] text-gray-400">{item.parent}</div>}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Mobile search button */}
            <button className="md:hidden p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <Search size={18} />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200 active:scale-95">
              <Bell size={19} />
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold leading-none ring-2 ring-white px-1 animate-pulse">
                4
              </span>
            </button>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-gray-200 mx-1"></div>

            {/* User profile */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:pl-2 sm:pr-3 rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
              >
                <div className="relative">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-md shadow-blue-200/50 ring-2 ring-white">
                    {user?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AU'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-800 leading-tight">{user?.full_name || 'Admin User'}</div>
                  <div className="text-[11px] text-gray-400 leading-tight">{user?.username || 'Administrator'}</div>
                </div>
                <ChevronDown size={13} className={`hidden sm:block text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
                    <p className="text-[11px] text-gray-400">{user?.username}</p>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 mb-4 text-xs sm:text-sm">
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-medium">
              🏠
            </span>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight size={12} className="text-indigo-300" />
                <span className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  i === breadcrumbs.length - 1
                    ? 'bg-indigo-100 text-indigo-700 font-semibold'
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer'
                }`}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
