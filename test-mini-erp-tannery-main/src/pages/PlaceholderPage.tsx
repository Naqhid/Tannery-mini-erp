import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';
import Card from '../components/ui/Card';

const pageNames: Record<string, string> = {
  '/sales-orders': 'Sales Orders',
  '/customer-master': 'Customer Master',
  '/chemical-master': 'Chemical / Material Master',
  '/bom-revision': 'BOM Revision',
  '/material-requirement': 'Material Requirement',
  '/inventory': 'Inventory',
  '/production': 'Production',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function PlaceholderPage() {
  const location = useLocation();
  const name = pageNames[location.pathname] || 'Page';

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="p-12 text-center max-w-md">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Construction size={28} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
        <p className="text-sm text-gray-500 mt-2">This page is under development. Check back soon!</p>
      </Card>
    </div>
  );
}
