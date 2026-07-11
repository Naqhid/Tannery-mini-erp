import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './lib/authContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SupplierMaster from './pages/SupplierMaster';
import RecipeCreation from './pages/RecipeCreation';
import BOM from './pages/BOM';
import ProductMaster from './pages/ProductMaster';
import CustomerMaster from './pages/CustomerMaster';
import PlaceholderPage from './pages/PlaceholderPage';
// New Master Pages
import ProductCategory from './pages/ProductCategory';
import LeatherType from './pages/LeatherType';
import UOM from './pages/UOM';
import Thickness from './pages/Thickness';
import StandardSize from './pages/StandardSize';
import Color from './pages/Color';
import FinishType from './pages/FinishType';
import Grade from './pages/Grade';
import HSNCode from './pages/HSNCode';
import ProcessStage from './pages/ProcessStage';
import Machine from './pages/Machine';
import MaterialMaster from './pages/MaterialMaster';
// Sales Order Pages
import SalesOrder from './pages/SalesOrder';
import SalesOrderDetail from './pages/SalesOrderDetail';
// Settings Pages
import UsersPage from './pages/UsersPage';
import Roles from './pages/Roles';
import Company from './pages/Company';
import BusinessUnits from './pages/BusinessUnits';
// Inventory Pages
import WarehouseMaster from './pages/WarehouseMaster';
import WarehouseMasterForm from './pages/WarehouseMasterForm';
import StockOpeningEntry from './pages/StockOpeningEntry';
import StockOpeningEntryDetail from './pages/StockOpeningEntryDetail';
import MaterialReceiptEntry from './pages/MaterialReceiptEntry';
import MaterialReceiptEntryDetail from './pages/MaterialReceiptEntryDetail';
import StockTransferEntry from './pages/StockTransferEntry';
import StockTransferEntryDetail from './pages/StockTransferEntryDetail';
import MaterialIssueToBatch from './pages/MaterialIssueToBatch';
import MaterialIssueToBatchDetail from './pages/MaterialIssueToBatchDetail';

const basename = import.meta.env.BASE_URL;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          {/* Login route - outside Layout */}
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sales-orders" element={<SalesOrder />} />
            <Route path="sales-orders/new" element={<SalesOrderDetail />} />
            <Route path="sales-orders/:id" element={<SalesOrderDetail />} />
            <Route path="customer-master" element={<CustomerMaster />} />
            <Route path="supplier-master" element={<SupplierMaster />} />
            <Route path="product-master" element={<ProductMaster />} />
            <Route path="chemical-master" element={<MaterialMaster />} />
            {/* New Master Pages */}
            <Route path="product-category" element={<ProductCategory />} />
            <Route path="leather-type" element={<LeatherType />} />
            <Route path="uom" element={<UOM />} />
            <Route path="thickness" element={<Thickness />} />
            <Route path="standard-size" element={<StandardSize />} />
            <Route path="color" element={<Color />} />
            <Route path="finish-type" element={<FinishType />} />
            <Route path="grade" element={<Grade />} />
            <Route path="hsn-code" element={<HSNCode />} />
            <Route path="process-stage" element={<ProcessStage />} />
            <Route path="machine" element={<Machine />} />
            {/* BOM / Recipe - BOM first, then Recipe */}
            <Route path="bom" element={<BOM />} />
            <Route path="recipe-creation" element={<RecipeCreation />} />
            <Route path="bom-revision" element={<PlaceholderPage />} />
            <Route path="material-requirement" element={<PlaceholderPage />} />
            {/* Inventory */}
            <Route path="warehouse-master" element={<WarehouseMaster />} />
            <Route path="warehouse-master/new" element={<WarehouseMasterForm />} />
            <Route path="warehouse-master/:id" element={<WarehouseMasterForm />} />
            <Route path="stock-opening-entry" element={<StockOpeningEntry />} />
            <Route path="stock-opening-entry/new" element={<StockOpeningEntryDetail />} />
            <Route path="stock-opening-entry/:id" element={<StockOpeningEntryDetail />} />
            <Route path="material-receipt" element={<MaterialReceiptEntry />} />
            <Route path="material-receipt/new" element={<MaterialReceiptEntryDetail />} />
            <Route path="material-receipt/:id" element={<MaterialReceiptEntryDetail />} />
            <Route path="stock-transfer" element={<StockTransferEntry />} />
            <Route path="stock-transfer/new" element={<StockTransferEntryDetail />} />
            <Route path="stock-transfer/:id" element={<StockTransferEntryDetail />} />
            <Route path="material-issue" element={<MaterialIssueToBatch />} />
            <Route path="material-issue/new" element={<MaterialIssueToBatchDetail />} />
            <Route path="material-issue/:id" element={<MaterialIssueToBatchDetail />} />
            <Route path="inventory" element={<PlaceholderPage />} />
            <Route path="stock-in" element={<PlaceholderPage />} />
            <Route path="stock-out" element={<PlaceholderPage />} />
            {/* Production */}
            <Route path="production" element={<PlaceholderPage />} />
            <Route path="work-orders" element={<PlaceholderPage />} />
            <Route path="batch-tracking" element={<PlaceholderPage />} />
            {/* Reports */}
            <Route path="reports" element={<PlaceholderPage />} />
            <Route path="inventory-reports" element={<PlaceholderPage />} />
            <Route path="cost-analysis" element={<PlaceholderPage />} />
            {/* Settings */}
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<Roles />} />
            <Route path="company" element={<Company />} />
            <Route path="business-units" element={<BusinessUnits />} />
            <Route path="notifications" element={<PlaceholderPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
