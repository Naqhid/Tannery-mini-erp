import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SupplierMaster from './pages/SupplierMaster';
import RecipeCreation from './pages/RecipeCreation';
import BOM from './pages/BOM';
import ProductMaster from './pages/ProductMaster';
import CustomerMaster from './pages/CustomerMaster';
import PlaceholderPage from './pages/PlaceholderPage';

const basename = import.meta.env.BASE_URL;

function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sales-orders" element={<PlaceholderPage />} />
          <Route path="customer-master" element={<CustomerMaster />} />
          <Route path="product-master" element={<ProductMaster />} />
          <Route path="chemical-master" element={<PlaceholderPage />} />
          <Route path="supplier-master" element={<SupplierMaster />} />
          <Route path="recipe-creation" element={<RecipeCreation />} />
          <Route path="bom" element={<BOM />} />
          <Route path="bom-revision" element={<PlaceholderPage />} />
          <Route path="material-requirement" element={<PlaceholderPage />} />
          <Route path="inventory" element={<PlaceholderPage />} />
          <Route path="production" element={<PlaceholderPage />} />
          <Route path="reports" element={<PlaceholderPage />} />
          <Route path="settings" element={<PlaceholderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
