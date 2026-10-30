Tannery ERP mobile UI — original HTML mockup layout retained with backend API data integration.

Files: App.tsx, main.tsx, index.css, services/api.ts.

Uses existing backend routes: /api/dashboard/stats, /api/sales-orders, /api/materials, /api/production-status/orders, /api/costing-report. Configure VITE_API_BASE_URL if your API is hosted separately.

The frontend no longer uses mockup values as live data. Metrics are calculated only from API records/fields returned. Some stock valuation or stage-level measures may show no data if the backend response does not include the corresponding fields.

Replace your src folder after backing it up. Keep your existing package.json and Vite/Tailwind setup.
