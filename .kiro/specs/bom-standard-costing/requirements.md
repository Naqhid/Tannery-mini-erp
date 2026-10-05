# Requirements Document

## Introduction

This document defines the requirements for the BOM & Standard Costing enhancements to the Tannery ERP system. The feature encompasses BOM page improvements (restricted BOM types, import-only versioning, auto-generated codes), a new Standard Cost module under the BOM/Recipe menu, cost calculation with BOM cost summary and additional cost components, variance analysis against previous cost sheet versions, permission-based status management, and the supporting MySQL 8 database schema and backend APIs.

## Glossary

- **BOM**: Bill of Materials — a structured list of components (chemicals, materials, machines) required to produce a leather product through a specific process stage.
- **BOM_Type**: A classification of the BOM by tannery process stage. Restricted to: Wet End, Finishing, Packing.
- **BOM_Version**: A sequential integer tracking the import-based revision of a BOM for a given Product + BOM Type combination. Increments only through the Import BOM process.
- **Standard_Cost_Sheet**: A costing document that combines BOM material costs with other cost components to calculate total production cost per unit for a product.
- **Cost_Sheet_Version**: A sequential integer tracking revisions of a Standard Cost Sheet, incremented through the import/revision process.
- **Cost_Component**: An additional cost item not derived from the BOM (e.g., Packing, Freight, Overheads) sourced from master data.
- **Cost_Component_Group**: A grouping classification for cost components derived from the Group Master.
- **Product_Category**: A categorization of products used to filter applicable cost components.
- **BOM_Cost_Summary**: The total cost calculated from all BOM item quantities multiplied by their unit costs for a selected BOM version.
- **Basis_Unit**: The unit of measure used for cost calculations, defaulting to Sq.Ft.
- **Admin_User**: A user with role_id = 1 who has elevated permissions including the ability to change document statuses.
- **Normal_User**: A user with role_id > 1 who can view and edit documents but cannot change status fields.
- **Import_BOM_Process**: The process of creating a new BOM version by importing/duplicating an existing BOM for the same Product + BOM Type combination.
- **Variance**: The difference between the current Standard Cost and the previous Standard Cost version for the same Product/BOM.
- **ERP_System**: The Tannery Mini ERP application encompassing frontend (React/Vite), backend (Node.js/Express), and database (MySQL 8).

## Requirements

### Requirement 1: BOM Type Restriction

**User Story:** As a production manager, I want the BOM Type dropdown limited to three tannery process stages, so that BOMs are consistently categorized.

#### Acceptance Criteria

1. WHEN a user opens the BOM creation or edit form, THE ERP_System SHALL display a BOM Type dropdown containing exactly three values: "Wet End", "Finishing", and "Packing", listed in that order.
2. IF a BOM creation or update request contains a BOM_Type value other than "Wet End", "Finishing", or "Packing", THEN THE ERP_System SHALL reject the request, display an error message indicating the invalid BOM Type, and preserve all other user-entered form data without saving the record.
3. WHEN displaying an existing BOM whose BOM_Type value is not one of "Wet End", "Finishing", or "Packing", THE ERP_System SHALL display that BOM_Type value as read-only text instead of a dropdown, preventing selection of that value for new or other records.
4. WHEN a user edits an existing BOM that has a BOM_Type value not in "Wet End", "Finishing", or "Packing", THE ERP_System SHALL allow the user to change the BOM_Type to one of the three permitted values but SHALL NOT allow saving the record with the original non-permitted value reselected.

### Requirement 2: BOM Version Logic (Import-Only Versioning)

**User Story:** As a production planner, I want BOM versions to change only through the Import BOM process, so that normal edits do not create confusing version histories.

#### Acceptance Criteria

1. WHEN a user edits and saves an existing BOM record or its line items (adding, updating, or removing components), THE ERP_System SHALL retain the current BOM_Version number without incrementing it.
2. WHEN a user imports a BOM for a Product + BOM_Type combination that already has at least one existing BOM, THE ERP_System SHALL create a new BOM record with a BOM_Version equal to the highest existing version for that Product + BOM_Type plus one.
3. WHEN a user imports a BOM for a Product + BOM_Type combination that has no existing BOM, THE ERP_System SHALL create the new BOM record with BOM_Version set to 1.
4. THE ERP_System SHALL enforce a unique constraint on the combination of Product, BOM_Type, and BOM_Version in the database.
5. IF an import operation would result in a duplicate combination of Product, BOM_Type, and BOM_Version, THEN THE ERP_System SHALL reject the import, preserve the existing BOM data unchanged, and return an error message indicating the version conflict.

### Requirement 3: BOM List Display

**User Story:** As a user, I want to see the BOM version in the list view, so that I can quickly identify which version of each BOM I am looking at.

#### Acceptance Criteria

1. WHEN the BOM list page is displayed, THE ERP_System SHALL show a "Version" column positioned immediately after the "BOM Name" column.
2. THE ERP_System SHALL display columns in this order: Code, BOM Name, Version, Product, Leather Type, Thickness, Status, and Actions.
3. WHEN a BOM record has a version number with a value between 1 and 99 inclusive, THE ERP_System SHALL display it as a zero-padded two-digit number (e.g., "01", "02", "03").
4. IF a BOM record has no version number assigned, THEN THE ERP_System SHALL display "01" as the default value in the Version column.

### Requirement 4: Auto-Generated BOM Code

**User Story:** As a user, I want BOM codes to be generated automatically and displayed consistently, so that code formatting is uniform and free from manual error.

#### Acceptance Criteria

1. WHEN a new BOM is created, THE ERP_System SHALL auto-generate the BOM code using the format: [3-character uppercase customer prefix][MMYY][2-digit zero-padded sequential serial number].
2. THE ERP_System SHALL display the auto-generated BOM code consistently on the BOM list page, BOM detail page, and BOM form page.
3. THE ERP_System SHALL prevent users from manually modifying the auto-generated BOM code field on all forms by rendering it as read-only.

### Requirement 5: Import BOM Filter and Selection

**User Story:** As a user, I want to filter BOMs by Product when importing, so that I can quickly find the correct source BOM.

#### Acceptance Criteria

1. WHEN the Import BOM screen is displayed, THE ERP_System SHALL show a Product dropdown populated from the product master and a BOM Name dropdown, replacing the separate Product and BOM Name tabs.
2. WHEN the user selects a Product from the Product dropdown, THE ERP_System SHALL filter the BOM Name dropdown to display only the latest version of each BOM belonging to the selected Product.
3. WHEN no Product is selected, THE ERP_System SHALL disable the BOM Name dropdown and display placeholder text indicating that a Product must be selected first.
4. WHEN the user selects a BOM from the BOM Name dropdown, THE ERP_System SHALL display the BOM details including item count, version number, BOM type, and status before the user confirms the import.
5. IF the selected Product has no associated BOMs, THEN THE ERP_System SHALL display the BOM Name dropdown as empty with a message indicating no BOMs are available for the selected Product.
6. IF the BOM details fail to load after a BOM is selected, THEN THE ERP_System SHALL display an error message indicating the details could not be retrieved and SHALL disable the import confirmation action until a valid BOM is successfully loaded.

### Requirement 6: Import BOM Action

**User Story:** As a production planner, I want a dedicated Import BOM button that creates a new version without modifying the source, so that I have a clear audit trail.

#### Acceptance Criteria

1. THE ERP_System SHALL display an "Import BOM" button on the Import BOM screen.
2. WHEN the user clicks "Import BOM" and selects a source BOM, THE ERP_System SHALL create a new BOM record that copies all item fields (material, type, UOM, quantity, unit cost, amount, scrap percent, supplier, and remarks) from the source BOM and assigns the new record a status of "Draft".
3. WHEN the user clicks "Import BOM", THE ERP_System SHALL assign the new BOM record a version number equal to the highest existing version for the same Product + BOM_Type combination plus one.
4. WHEN the user clicks "Import BOM", THE ERP_System SHALL leave the source BOM record and all its items unchanged.
5. IF the calculated next version number already exists due to a concurrent import, THEN THE ERP_System SHALL retry up to 3 times with the next available version number, and if all retries fail, return an error indicating a version conflict without creating a partial record.
6. IF the source BOM contains zero items, THEN THE ERP_System SHALL create the new BOM record with an empty item list and status "Draft".

### Requirement 7: Standard Costing Menu and Page

**User Story:** As a cost accountant, I want a Standard Cost page under the BOM/Recipe menu, so that I can manage product costing from one location.

#### Acceptance Criteria

1. THE ERP_System SHALL display a "Costing" sub-menu item under the "BOM / Recipe" menu section in the navigation.
2. WHEN the user clicks the "Costing" menu item, THE ERP_System SHALL navigate to the Standard Cost list page.
3. THE Standard Cost list page SHALL include a page header, a data table with sortable columns, a search input, status filter dropdown, pagination controls, and action buttons consistent with the existing ERP list pages.
4. IF the Standard Cost list page fails to load data from the server, THEN THE ERP_System SHALL display an error notification indicating the failure and show an empty state with a retry option.
5. WHEN the Standard Cost list page loads and no records exist, THE ERP_System SHALL display an empty state indicator with a message that no standard cost records are available.

### Requirement 8: Standard Cost Header — Product and BOM Selection

**User Story:** As a cost accountant, I want the system to auto-populate the latest BOM version when I select a product, so that I always cost against current materials.

#### Acceptance Criteria

1. WHEN the user selects a Product on the Standard Cost form, THE ERP_System SHALL automatically populate the BOM/Recipe field with the BOM record having the highest BOM_Version number with status "Active" for that Product, selecting from all BOM_Type values available for that Product.
2. IF no BOM with status "Active" exists for the selected Product, THEN THE ERP_System SHALL display a message indicating no BOM is available and SHALL disable the Save/Create action for the cost sheet.
3. THE ERP_System SHALL allow the user to override the auto-selected BOM by choosing a different BOM version from a dropdown that lists all BOM versions for the selected Product, displaying each entry as BOM_Type + Version number (e.g., "Wet End - V02").
4. IF the user changes the selected Product after a BOM version has already been populated, THEN THE ERP_System SHALL clear the current BOM/Recipe selection and re-populate with the latest active BOM version for the newly selected Product.

### Requirement 9: Standard Cost Header — Cost Sheet Number

**User Story:** As a cost accountant, I want cost sheet numbers auto-generated with the same prefix as BOM codes, so that documents are easily traceable.

#### Acceptance Criteria

1. WHEN a new Standard Cost Sheet is created, THE ERP_System SHALL auto-generate a Cost Sheet Number using the format: [3-character uppercase customer prefix][MMYY][2-digit zero-padded sequential serial number], where the customer prefix is derived from the first 3 alphabetic characters of the associated customer name, MMYY is the current month and year, and the serial number increments from 01 within each unique prefix + MMYY combination.
2. THE ERP_System SHALL prevent users from manually editing the generated Cost Sheet Number by rendering the field as read-only on all create and edit forms.
3. THE ERP_System SHALL ensure uniqueness of the Cost Sheet Number across all Standard Cost Sheet records by enforcing a unique database constraint and rejecting any creation attempt that would produce a duplicate.
4. IF the associated Product has no linked customer or the customer name contains fewer than 3 alphabetic characters, THEN THE ERP_System SHALL display an error message indicating that a valid customer association is required and prevent cost sheet creation.

### Requirement 10: Standard Cost Header — Cost Sheet Version

**User Story:** As a cost accountant, I want cost sheet versions to track revisions, so that I can compare costs over time.

#### Acceptance Criteria

1. WHEN the first Standard Cost Sheet is created for a given Product + BOM_Type combination, THE ERP_System SHALL assign Cost_Sheet_Version equal to 1.
2. WHEN a Standard Cost Sheet is revised through the import/revision process for a Product + BOM_Type combination that already has at least one version, THE ERP_System SHALL assign the new record a Cost_Sheet_Version equal to the highest existing version for that Product + BOM_Type plus one.
3. WHEN a Standard Cost Sheet is edited normally (not through import/revision), THE ERP_System SHALL retain the current Cost_Sheet_Version without incrementing.
4. THE ERP_System SHALL preserve all previous Cost Sheet versions as read-only historical records, retrievable by selecting a Product and BOM_Type and listed in descending version order.
5. IF a user attempts to edit a Cost Sheet version that is not the latest version for its Product + BOM_Type combination, THEN THE ERP_System SHALL prevent the edit and display a message indicating that only the latest version may be modified.

### Requirement 11: Standard Cost Header — Currency and Basis Unit

**User Story:** As a cost accountant, I want default currency and basis unit pre-filled, so that I can start costing quickly.

#### Acceptance Criteria

1. WHEN a new Standard Cost Sheet is created, THE ERP_System SHALL set the Currency field to "INR" as the default value.
2. WHEN a new Standard Cost Sheet is created, THE ERP_System SHALL set the Basis Unit field to "Sq.Ft." as the default value.
3. THE ERP_System SHALL display the Currency field as a dropdown populated from the currency master data.
4. THE ERP_System SHALL display the Basis Unit field as a dropdown populated from the UOM master data.
5. THE ERP_System SHALL require both Currency and Basis Unit to have a non-empty value before saving a Standard Cost Sheet.
6. IF the user attempts to save a Standard Cost Sheet with Currency or Basis Unit empty, THEN THE ERP_System SHALL prevent the save and display a validation error indicating the missing field.

### Requirement 12: Standard Cost Header — Prepared By and Status

**User Story:** As a manager, I want only Admin users to change the cost sheet status, so that approvals are controlled.

#### Acceptance Criteria

1. WHEN a new Standard Cost Sheet is created, THE ERP_System SHALL auto-populate the "Prepared By" field with the full display name of the currently logged-in user and set the field to read-only for all users.
2. WHEN a new Standard Cost Sheet is created, THE ERP_System SHALL set the Status to "Draft" as the default value.
3. THE ERP_System SHALL display Status as a dropdown with the following values: Draft, Approved, and Posted.
4. IF a Normal_User attempts to change the Status field, THEN THE ERP_System SHALL prevent the change and display a message indicating insufficient permissions.
5. WHEN an Admin_User changes the Status field, THE ERP_System SHALL accept and save the new status value.
6. THE ERP_System SHALL enforce the Admin-only status restriction on the backend API, not relying solely on frontend UI hiding.
7. THE ERP_System SHALL NOT display an "Approved By" field on the Standard Cost form.
8. IF a non-authenticated or Normal_User request to change the Status is received by the backend API, THEN THE ERP_System SHALL reject the request and return an error response indicating insufficient permissions without modifying the existing status value.
9. WHEN an Admin_User changes the Status field, THE ERP_System SHALL only allow transitions from Draft to Approved, and from Approved to Posted.

### Requirement 13: Standard Cost Header — Post Button

**User Story:** As a cost accountant, I want a Post button on the cost sheet, so that I can finalize and post the standard cost.

#### Acceptance Criteria

1. THE ERP_System SHALL display a "Post" button on the Standard Cost Sheet detail/form page when the cost sheet status is "Draft".
2. WHEN the user clicks "Post", THE ERP_System SHALL display a confirmation dialog requiring the user to confirm before proceeding with the post action.
3. WHEN the user confirms the post action, THE ERP_System SHALL update the cost sheet status from "Draft" to "Posted" and prevent further edits to that version.
4. IF the post operation fails due to a server or network error, THEN THE ERP_System SHALL retain the cost sheet in "Draft" status with all data preserved and display an error message indicating the reason for failure.
5. IF the cost sheet status is "Posted", THEN THE ERP_System SHALL disable the Post button, all editable fields, and the delete action for that cost sheet.
6. IF the cost sheet contains no line items, THEN THE ERP_System SHALL disable the Post button and not allow posting.

### Requirement 14: BOM Cost Summary Calculation

**User Story:** As a cost accountant, I want BOM cost calculated from the selected BOM version's components, so that costs reflect actual material requirements.

#### Acceptance Criteria

1. WHEN a BOM version is selected on the Standard Cost Sheet, THE ERP_System SHALL calculate the BOM Cost Summary by summing (quantity × (1 + scrap_percent / 100) × unit_cost) for each BOM item stored in that version, rounded to 2 decimal places.
2. THE ERP_System SHALL display the BOM Cost Summary labeled as "Total BOM Cost (Per [Basis_Unit])" where [Basis_Unit] is the Basis Unit selected on the cost sheet header.
3. WHEN the selected BOM version changes, THE ERP_System SHALL recalculate and update the BOM Cost Summary.
4. IF a BOM item in the selected version has a null or zero unit_cost, THEN THE ERP_System SHALL treat that item's cost contribution as zero and still include it in the sum.
5. THE ERP_System SHALL retrieve BOM item costs from the database and not use hardcoded values.

### Requirement 15: Cost Components (Other Than BOM)

**User Story:** As a cost accountant, I want to add additional cost components like Packing, Freight, and Overheads, so that the total cost captures all production expenses.

#### Acceptance Criteria

1. THE ERP_System SHALL display a "Cost Components (Other Than BOM)" section on the Standard Cost Sheet page, containing a table of cost component line items with columns: Cost Component, Cost Component Group, Cost INR, and a delete action.
2. THE ERP_System SHALL provide a Cost Component dropdown per line item, populated from the materials master data where the material is associated with the applicable Product_Category.
3. THE ERP_System SHALL provide a Cost Component Group dropdown per line item, populated from the Group Master data filtered by the selected Cost Component's group association.
4. WHEN a Product Category is set on the Standard Cost Sheet, THE ERP_System SHALL pre-filter the Cost Component dropdown to display only materials belonging to that Product_Category.
5. THE ERP_System SHALL NOT display a "Rate" field in the cost component section.
6. THE ERP_System SHALL label the cost value column as "Cost INR" (replacing "Amount INR").
7. THE ERP_System SHALL allow the user to add one or more cost component line items and remove any existing line item, with a minimum of zero line items permitted.
8. THE ERP_System SHALL provide a "Cost INR" input field per line item that accepts a user-entered numeric value in the range 0.01 to 99,999,999.99 with up to two decimal places.
9. IF no materials are available for the selected Product_Category filter, THEN THE ERP_System SHALL display the Cost Component dropdown as empty with an indication that no components are available for the current category.

### Requirement 16: Cost Percentage Calculation

**User Story:** As a cost accountant, I want each cost component's percentage of total cost displayed, so that I can identify cost drivers at a glance.

#### Acceptance Criteria

1. THE ERP_System SHALL calculate and display a percentage for each cost component line in the "Cost Components (Other Than BOM)" section using the formula: (Cost Component Cost / Standard Cost) × 100, where Standard Cost is defined as Total BOM Cost + Total Other Cost Components.
2. WHEN any cost component value or the Total Standard Cost changes, THE ERP_System SHALL recalculate all cost component percentages.
3. THE ERP_System SHALL display each percentage value rounded to two decimal places followed by the "%" symbol (e.g., "12.34%").
4. IF the Standard Cost is zero at the time of percentage calculation, THEN THE ERP_System SHALL display "0.00%" for all cost component percentage fields instead of performing the division.

### Requirement 17: Standard Cost Total Calculation

**User Story:** As a cost accountant, I want the Standard Cost to be the sum of BOM cost and other cost components, so that I have one consolidated production cost per unit.

#### Acceptance Criteria

1. THE ERP_System SHALL calculate Standard Cost as: Total BOM Cost + Total Other Cost Components, rounded to 2 decimal places.
2. THE ERP_System SHALL display the cost breakdown as three distinct values: "Total BOM Cost", "Cost Components Summary" (sum of all other cost components), and "Standard Cost" (the total), each displayed to 2 decimal places.
3. WHEN any cost component is added, modified, or removed, THE ERP_System SHALL recalculate the Cost Components Summary and the Standard Cost.
4. WHEN the user saves the Standard Cost Sheet, THE ERP_System SHALL recalculate the Standard Cost on the backend and verify that the stored total equals Total BOM Cost + Total Other Cost Components (within a tolerance of 0.01 due to rounding) before persisting.
5. IF the backend validation detects a mismatch between the submitted Standard Cost and the recalculated value, THEN THE ERP_System SHALL reject the save and return an error message indicating a cost calculation mismatch.

### Requirement 18: Summary Section Terminology

**User Story:** As a user, I want consistent and clear terminology in the cost summary, so that there is no confusion about what each total represents.

#### Acceptance Criteria

1. THE ERP_System SHALL label the BOM-derived cost total as "Total BOM Cost" (not "BOM Summary") in the Standard Cost Sheet summary section, donut chart legend, and any other view where this value is displayed.
2. THE ERP_System SHALL label the additional cost components total as "Cost Components Summary" (not "Other Cost") in the Standard Cost Sheet summary section, donut chart legend, and any other view where this value is displayed.
3. THE ERP_System SHALL label the combined total as "Standard Cost" and display the formula relationship as: Standard Cost = Total BOM Cost + Cost Components Summary.
4. THE ERP_System SHALL use the labels "Total BOM Cost", "Cost Components Summary", and "Standard Cost" consistently across all pages, sections, and components that reference these values without abbreviation or variation.

### Requirement 19: Donut Chart Visualization

**User Story:** As a manager, I want a donut chart showing the proportional breakdown of BOM vs. other costs, so that I can quickly understand cost composition.

#### Acceptance Criteria

1. THE ERP_System SHALL display a donut chart on the Standard Cost Sheet page showing cost composition, with each segment labeled as "Total BOM Cost" and "Cost Components Summary" and displaying its corresponding percentage value.
2. THE ERP_System SHALL calculate the BOM Cost segment percentage as: (Total BOM Cost / Standard Cost) × 100, rounded to two decimal places.
3. THE ERP_System SHALL calculate the Other Cost segment percentage as: (Cost Components Summary / Standard Cost) × 100, rounded to two decimal places.
4. THE ERP_System SHALL ensure the two donut chart segment percentages sum to 100% by applying any rounding remainder to the larger segment.
5. THE ERP_System SHALL render the donut chart using the existing Tailwind CSS utility classes and component patterns consistent with the application design conventions.
6. IF the Standard Cost is zero, THEN THE ERP_System SHALL display the donut chart in an empty or neutral state without performing the percentage calculation and shall indicate that no cost data is available.

### Requirement 20: Previous Standard Cost and Variance

**User Story:** As a cost accountant, I want to see the variance between current and previous standard costs, so that I can identify and investigate cost changes.

#### Acceptance Criteria

1. WHEN displaying a Standard Cost Sheet with Cost_Sheet_Version greater than 1, THE ERP_System SHALL retrieve the Standard Cost value from the immediately preceding Cost_Sheet_Version (current version minus one) for the same Product and BOM_Type.
2. IF a previous version exists, THEN THE ERP_System SHALL display the Previous Standard Cost value rounded to 2 decimal places in the selected currency.
3. IF a previous version exists, THEN THE ERP_System SHALL calculate and display Variance as: Current Standard Cost − Previous Standard Cost, rounded to 2 decimal places.
4. IF a previous version exists and the Previous Standard Cost is greater than zero, THEN THE ERP_System SHALL calculate and display Variance Percentage as: (Variance / Previous Standard Cost) × 100, rounded to 2 decimal places.
5. IF a previous version exists and the Previous Standard Cost equals zero, THEN THE ERP_System SHALL display the Variance value and SHALL display the Variance Percentage as "N/A".
6. IF no previous version exists (Cost_Sheet_Version equals 1), THEN THE ERP_System SHALL display a message indicating no previous standard cost is available and SHALL NOT display variance or variance percentage values.

### Requirement 21: Standard Cost Import/Revision

**User Story:** As a cost accountant, I want to import/revise a standard cost to create a new version, so that historical costs are preserved for audit and comparison.

#### Acceptance Criteria

1. THE ERP_System SHALL display an "Import/Revise" button on the Standard Cost Sheet detail page.
2. WHEN the user triggers a Standard Cost import/revision, THE ERP_System SHALL create a new Cost Sheet record with the next sequential Cost_Sheet_Version for that Product + BOM_Type, copying all data from the source version including BOM reference, currency, basis unit, cost component line items, and their values.
3. WHEN the user triggers a Standard Cost import/revision, THE ERP_System SHALL set the new version's status to "Draft" regardless of the source version's status.
4. WHEN the user triggers a Standard Cost import/revision, THE ERP_System SHALL leave the source version unchanged and enforce it as read-only by rejecting any subsequent edit or status-change API requests to that version with an error message indicating the version is historical.
5. THE ERP_System SHALL NOT overwrite or modify any previously saved Standard Cost Sheet version.
6. THE ERP_System SHALL identify the latest version as the record with the highest Cost_Sheet_Version number for a given Product + BOM_Type combination.
7. IF the calculated next Cost_Sheet_Version already exists due to a concurrent revision, THEN THE ERP_System SHALL retry with the correct next available version or return an error message indicating a version conflict.

### Requirement 22: Dynamic Data (No Hardcoding)

**User Story:** As a developer, I want all costing values sourced from the database, so that the system reflects real-time master data changes.

#### Acceptance Criteria

1. WHEN calculating BOM costs for a Standard Cost Sheet, THE ERP_System SHALL retrieve quantity and unit_cost values from the bom_items table for the selected BOM version at the time of calculation, without using cached or pre-computed values from a prior session.
2. WHEN populating cost component dropdowns or computing cost component totals, THE ERP_System SHALL retrieve cost component names, group names, and category values from the corresponding master data tables (materials, groups, product_categories) at the time of page load or recalculation.
3. WHEN displaying or applying currency information on a Standard Cost Sheet, THE ERP_System SHALL retrieve available currency options and exchange-related values from the currency master data table.
4. WHEN displaying previous standard cost or calculating variance, THE ERP_System SHALL retrieve the previous cost sheet values from the standard_cost_sheets table filtered by the same Product and BOM_Type with the immediately preceding Cost_Sheet_Version.
5. THE ERP_System SHALL NOT contain hardcoded cost values, product names, chemical names, group names, currency codes, or category values in application code; static UI labels (e.g., column headers, section titles) and system-defined default identifiers (e.g., default currency code "INR", default basis unit "Sq.Ft.") specified in other requirements are excluded from this prohibition.
6. IF a referenced master data record (material, group, category, or currency) has been deleted or deactivated at the time of retrieval, THEN THE ERP_System SHALL display an indication that the referenced data is unavailable rather than failing silently or showing a blank value.
7. THE ERP_System SHALL ensure that any update to a master data value (e.g., a material unit_cost change) is reflected in subsequent Standard Cost Sheet calculations without requiring an application restart or cache purge.

### Requirement 23: Database Schema (MySQL 8 Migrations)

**User Story:** As a developer, I want safe incremental migrations that support standard costing without destroying existing data, so that the system can be upgraded in production.

#### Acceptance Criteria

1. THE ERP_System SHALL provide MySQL 8 compatible migration scripts for all new and altered tables, numbered sequentially after the existing migration set (starting from 023).
2. THE ERP_System SHALL reuse existing tables (boms, bom_items, bom_versions, products, materials, groups) where the required data already exists.
3. THE ERP_System SHALL add a standard_cost_sheets table with columns for: id (INT AUTO_INCREMENT PRIMARY KEY), product_id (INT NOT NULL), bom_id (INT NOT NULL), bom_version (INT NOT NULL), cost_sheet_no (VARCHAR(50) NOT NULL), cost_sheet_version (INT NOT NULL DEFAULT 1), currency (VARCHAR(10) NOT NULL), basis_unit (VARCHAR(20) NOT NULL), total_bom_cost (DECIMAL(15,4) NOT NULL DEFAULT 0), total_other_cost (DECIMAL(15,4) NOT NULL DEFAULT 0), standard_cost (DECIMAL(15,4) NOT NULL DEFAULT 0), status (ENUM('Draft','Approved','Posted') NOT NULL DEFAULT 'Draft'), prepared_by (INT NULL), created_by (INT NULL), updated_by (INT NULL), created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP), updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP).
4. THE ERP_System SHALL add a standard_cost_items table for individual cost component line items with columns for: id (INT AUTO_INCREMENT PRIMARY KEY), cost_sheet_id (INT NOT NULL), cost_component_id (INT NOT NULL), cost_component_group_id (INT NULL), cost_value (DECIMAL(15,4) NOT NULL DEFAULT 0), cost_percentage (DECIMAL(7,4) NOT NULL DEFAULT 0), created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP), updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP).
5. THE ERP_System SHALL enforce a unique constraint on (product_id, bom_id, cost_sheet_version) within the standard_cost_sheets table to prevent duplicate cost sheet versions for the same product and BOM combination.
6. THE ERP_System SHALL add foreign keys from standard_cost_sheets.product_id to products(id), standard_cost_sheets.bom_id to boms(id), standard_cost_items.cost_sheet_id to standard_cost_sheets(id) with ON DELETE CASCADE, and indexes on all foreign key columns.
7. THE ERP_System SHALL ensure migration scripts are safe for existing production data by using CREATE TABLE IF NOT EXISTS for new tables and conditional column-existence checks (via information_schema queries) before any ALTER TABLE statements.
8. IF a migration script fails partway through execution, THEN THE ERP_System SHALL leave existing tables and data unmodified by the failed statements.
9. IF the standard_cost_sheets or standard_cost_items tables already exist when the migration runs, THEN THE ERP_System SHALL skip table creation without returning an error.

### Requirement 24: Backend API Endpoints

**User Story:** As a frontend developer, I want comprehensive REST API endpoints for all BOM and Standard Costing operations, so that the UI can perform all required actions.

#### Acceptance Criteria

1. THE ERP_System SHALL provide API endpoints for: BOM list (with filtering by product and BOM type, paginated with a default of 10 and a maximum of 100 results per page), BOM detail, BOM version list, and BOM import (creating new version).
2. THE ERP_System SHALL provide API endpoints for: Standard Cost Sheet list (paginated with a default of 10 and a maximum of 100 results per page), Standard Cost Sheet detail, Standard Cost Sheet creation, Standard Cost Sheet revision/import, and Standard Cost Sheet status update.
3. THE ERP_System SHALL provide API endpoints for: latest BOM lookup by product, cost calculation (BOM cost summary), cost component lookup (filtered by product category and group), previous standard cost lookup, and variance calculation.
4. WHEN the frontend submits a Standard Cost Sheet creation or revision request, THE ERP_System SHALL validate that all required fields are present and all numeric cost values are non-negative, perform cost calculations on the backend, and return the calculated values in the response body.
5. IF a user without the Admin role (role_id = 1) calls a Standard Cost Sheet status change endpoint, THEN THE ERP_System SHALL reject the request with HTTP 403 and a response body containing an error message indicating insufficient permissions.
6. IF a requested BOM or Standard Cost Sheet resource does not exist, THEN THE ERP_System SHALL return HTTP 404 with a response body containing an error message indicating the resource was not found.
7. THE ERP_System SHALL return all API success responses in a consistent JSON structure containing a "data" field with the result payload, and all error responses in a consistent JSON structure containing an "error" field with a descriptive message.

### Requirement 25: Permission Enforcement

**User Story:** As an administrator, I want status changes restricted to admin users at the API level, so that authorization cannot be bypassed by a modified frontend.

#### Acceptance Criteria

1. WHEN a user with role_id other than 1 sends a request to change a Standard Cost Sheet status, THE ERP_System SHALL respond with HTTP 403 and an error message indicating insufficient permissions, without modifying the Standard Cost Sheet status.
2. WHEN a user with role_id equal to 1 sends a request to change a Standard Cost Sheet status, THE ERP_System SHALL apply the requested status transition and respond with HTTP 200 and the updated status value.
3. IF a request to change a Standard Cost Sheet status is received without a valid authentication token, THEN THE ERP_System SHALL respond with HTTP 401 and an error message indicating authentication is required, without modifying the Standard Cost Sheet status.
4. THE ERP_System SHALL enforce the role_id check on the status-change endpoint regardless of the request origin, such that bypassing the frontend UI does not circumvent the permission rule.
5. WHILE a user with role_id other than 1 is viewing the Standard Cost Sheet, THE ERP_System SHALL render the Status dropdown as read-only.

### Requirement 26: UI/UX Consistency

**User Story:** As a user, I want the new Standard Costing pages to look and feel like the rest of the ERP, so that the experience is seamless.

#### Acceptance Criteria

1. THE ERP_System SHALL render the Standard Cost pages using the shared UI components from the application component library (Card, Table, Button, Select, Input, SearchableSelect, SkeletonLoader, EmptyState, ConfirmDialog, Tabs) and SHALL NOT introduce new component patterns, CSS frameworks, or design libraries.
2. THE ERP_System SHALL ensure the Standard Cost pages are fully functional and display without horizontal overflow at viewport widths of 768px (tablet) and above, using the application's existing Tailwind CSS responsive breakpoints.
3. THE ERP_System SHALL use the existing Tailwind CSS utility classes and component patterns found in the current codebase, matching the established styling conventions for cards, tables, and spacing.
4. THE ERP_System SHALL display the donut chart and cost summary sections (Total BOM Cost, Cost Components Summary, Standard Cost) side by side on viewports at or above 1024px, and stacked vertically on viewports below 1024px.
5. IF a Standard Cost page is rendered at any supported viewport width (768px or above), THEN THE ERP_System SHALL ensure all form fields, buttons, and table columns remain visible and operable without requiring horizontal scrolling.
