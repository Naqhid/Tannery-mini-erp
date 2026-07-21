import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './lib/authContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SupplierMaster from './pages/SupplierMaster';
import SupplierMasterForm from './pages/SupplierMasterForm';
import RecipeCreation from './pages/RecipeCreation';
import BOM from './pages/BOM';
import ProductMaster from './pages/ProductMaster';
import ProductMasterForm from './pages/ProductMasterForm';
import CustomerMaster from './pages/CustomerMaster';
import CustomerMasterForm from './pages/CustomerMasterForm';
import PlaceholderPage from './pages/PlaceholderPage';
// New Master Pages
import ProductCategory from './pages/ProductCategory';
import ProductCategoryForm from './pages/ProductCategoryForm';
import LeatherType from './pages/LeatherType';
import LeatherTypeForm from './pages/LeatherTypeForm';
import UOM from './pages/UOM';
import UOMForm from './pages/UOMForm';
import Thickness from './pages/Thickness';
import ThicknessForm from './pages/ThicknessForm';
import StandardSize from './pages/StandardSize';
import StandardSizeForm from './pages/StandardSizeForm';
import Color from './pages/Color';
import ColorForm from './pages/ColorForm';
import FinishType from './pages/FinishType';
import FinishTypeForm from './pages/FinishTypeForm';
import Grade from './pages/Grade';
import GradeForm from './pages/GradeForm';
import HSNCode from './pages/HSNCode';
import HSNCodeForm from './pages/HSNCodeForm';
import ProcessStage from './pages/ProcessStage';
import ProcessStageForm from './pages/ProcessStageForm';
import Machine from './pages/Machine';
import MaterialMaster from './pages/MaterialMaster';
import MaterialMasterForm from './pages/MaterialMasterForm';
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
// Production Plan Pages
import ProductionPlan from './pages/ProductionPlan';
import ProductionPlanDetail from './pages/ProductionPlanDetail';
// New Module Pages
import BatchLotTracking from './pages/BatchLotTracking';
import SupplierPricingHistory from './pages/SupplierPricingHistory';
import AddNewPrice from './pages/AddNewPrice';
import SupplierPriceApproval from './pages/SupplierPriceApproval';
import PhysicalStockEntry from './pages/PhysicalStockEntry';
import PhysicalStockEntryDetail from './pages/PhysicalStockEntryDetail';

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
            <Route path="customer-master/new" element={<CustomerMasterForm />} />
            <Route path="customer-master/:id" element={<CustomerMasterForm />} />
            <Route path="supplier-master" element={<SupplierMaster />} />
            <Route path="supplier-master/new" element={<SupplierMasterForm />} />
            <Route path="supplier-master/:id" element={<SupplierMasterForm />} />
            <Route path="product-master" element={<ProductMaster />} />
            <Route path="product-master/new" element={<ProductMasterForm />} />
            <Route path="product-master/:id" element={<ProductMasterForm />} />
            <Route path="chemical-master" element={<MaterialMaster />} />
            <Route path="chemical-master/new" element={<MaterialMasterForm />} />
            <Route path="chemical-master/:id" element={<MaterialMasterForm />} />
            {/* New Master Pages */}
            <Route path="product-category" element={<ProductCategory />} />
            <Route path="product-category/new" element={<ProductCategoryForm />} />
            <Route path="product-category/:id" element={<ProductCategoryForm />} />
            <Route path="leather-type" element={<LeatherType />} />
            <Route path="leather-type/new" element={<LeatherTypeForm />} />
            <Route path="leather-type/:id" element={<LeatherTypeForm />} />
            <Route path="uom" element={<UOM />} />
            <Route path="uom/new" element={<UOMForm />} />
            <Route path="uom/:id" element={<UOMForm />} />
            <Route path="thickness" element={<Thickness />} />
            <Route path="thickness/new" element={<ThicknessForm />} />
            <Route path="thickness/:id" element={<ThicknessForm />} />
            <Route path="standard-size" element={<StandardSize />} />
            <Route path="standard-size/new" element={<StandardSizeForm />} />
            <Route path="standard-size/:id" element={<StandardSizeForm />} />
            <Route path="color" element={<Color />} />
            <Route path="color/new" element={<ColorForm />} />
            <Route path="color/:id" element={<ColorForm />} />
            <Route path="finish-type" element={<FinishType />} />
            <Route path="finish-type/new" element={<FinishTypeForm />} />
            <Route path="finish-type/:id" element={<FinishTypeForm />} />
            <Route path="grade" element={<Grade />} />
            <Route path="grade/new" element={<GradeForm />} />
            <Route path="grade/:id" element={<GradeForm />} />
            <Route path="hsn-code" element={<HSNCode />} />
            <Route path="hsn-code/new" element={<HSNCodeForm />} />
            <Route path="hsn-code/:id" element={<HSNCodeForm />} />
            <Route path="process-stage" element={<ProcessStage />} />
            <Route path="process-stage/new" element={<ProcessStageForm />} />
            <Route path="process-stage/:id" element={<ProcessStageForm />} />
            <Route path="machine" element={<Machine />} />
            {/* BOM / Recipe - BOM first, then Recipe */}
            <Route path="bom" element={<BOM />} />
            <Route path="recipe-creation" element={<RecipeCreation />} />
            <Route path="bom-revision" element={<PlaceholderPage />} />
            <Route path="material-requirement" element={<PlaceholderPage />} />
            <Route path="physical-stock-entry" element={<PhysicalStockEntry />} />
            <Route path="physical-stock-entry/new" element={<PhysicalStockEntryDetail />} />
            <Route path="physical-stock-entry/:id" element={<PhysicalStockEntryDetail />} />
            <Route path="physical-stock-entry/:id/edit" element={<PhysicalStockEntryDetail />} />
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
            {/* Purchase */}
            <Route path="supplier-pricing-history" element={<SupplierPricingHistory />} />
            <Route path="supplier-pricing-history/new" element={<AddNewPrice />} />
            <Route path="supplier-pricing-history/:id" element={<AddNewPrice />} />
            <Route path="supplier-pricing-history/:id/edit" element={<AddNewPrice />} />
            <Route path="supplier-price-approval" element={<SupplierPriceApproval />} />
            <Route path="supplier-price-approval/:id" element={<SupplierPriceApproval />} />
            {/* Production */}
            <Route path="production-plan" element={<ProductionPlan />} />
            <Route path="production-plan/new" element={<ProductionPlanDetail />} />
            <Route path="production-plan/:id" element={<ProductionPlanDetail />} />
            <Route path="batch-process" element={<PlaceholderPage />} />
            <Route path="batch-completion" element={<PlaceholderPage />} />
            <Route path="batch-lot-tracking" element={<BatchLotTracking />} />
            <Route path="batch-lot-tracking/new" element={<BatchLotTracking />} />
            <Route path="batch-lot-tracking/:id" element={<BatchLotTracking />} />
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
