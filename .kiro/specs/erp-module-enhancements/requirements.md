# Requirements Document

## Introduction

This document defines the requirements for enhancements across three modules of the Tannery Mini ERP system: Sale Order, Chemical/Material Master, and Material Receipt. The enhancements focus on improving usability by streamlining the Sale Order form, adding dual-UOM and currency support to the Chemical/Material module, and implementing multi-currency calculations with GST breakdown in the Material Receipt module.

## Glossary

- **Sale_Order_Module**: The frontend and backend components responsible for creating, editing, and managing sales orders, including line items, delivery notes, payments, and invoices.
- **Material_Master_Module**: The frontend and backend components responsible for creating and managing chemical/material master records.
- **Material_Receipt_Module**: The frontend and backend components responsible for recording incoming material receipts with item details, charges, and totals.
- **Group_Master**: A master table that stores material/product groups, each associated with a category, an HSN code, and a GST rate.
- **HSN_Code**: Harmonized System of Nomenclature code used to classify goods for taxation.
- **Primary_UOM**: The primary unit of measurement for a material (e.g., Kg, Litre).
- **Secondary_UOM**: An alternate unit of measurement for a material (e.g., Drum, Bag). A value of "NA" indicates no secondary UOM.
- **FC**: Foreign Currency – the currency selected for the transaction.
- **INR**: Indian Rupee – the local base currency.
- **Exchange_Rate**: The conversion factor from the foreign currency to INR.
- **CGST**: Central Goods and Services Tax – one half of the total GST, levied by the central government.
- **SGST**: State Goods and Services Tax – one half of the total GST, levied by the state government.
- **Grand_Total**: The final total amount of a Material Receipt, calculated as total amount(INR) + GST amount + total other charges.
- **Article**: The product/item description in a Sale Order line item (replacing the previous "description" label).
- **Article_Code**: The product/item code in a Sale Order line item (replacing the previous "item code" label).

## Requirements

### Requirement 1: Sale Order Auto-Increment Number

**User Story:** As a sales user, I want the sale order number to be automatically generated as an incrementing sequence, so that I do not need to manually enter order numbers and uniqueness is guaranteed.

#### Acceptance Criteria

1. WHEN a new sale order is created, THE Sale_Order_Module SHALL auto-generate the next sequential order number in the format "SO-XXXXX" (zero-padded, e.g., SO-00001, SO-00002).
2. THE Sale_Order_Module SHALL display the auto-generated order number as a read-only field in the sale order header.
3. WHEN the sale order is saved, THE Sale_Order_Module SHALL persist the auto-generated order number without allowing user modification.

### Requirement 2: Remove Delivery Date and Price List from Sale Order Header

**User Story:** As a sales user, I want the sale order header to be simplified by removing the delivery date and price list fields, so that the form is less cluttered and only shows relevant fields.

#### Acceptance Criteria

1. THE Sale_Order_Module SHALL remove the "Delivery Date" field from the sale order header form.
2. THE Sale_Order_Module SHALL remove the "Price List" dropdown from the sale order header form.
3. THE Sale_Order_Module SHALL exclude delivery_date and price_list from the sale order create and update payloads when these fields are not provided.

### Requirement 3: Remove Sales Person from Sale Order Header

**User Story:** As a sales user, I want the sales person field removed from the sale order header, so that the form is streamlined.

#### Acceptance Criteria

1. THE Sale_Order_Module SHALL remove the "Sales Person" input field from the sale order header form.
2. THE Sale_Order_Module SHALL exclude sales_person from the sale order create and update payloads when not provided.

### Requirement 4: Inline Line Item Addition in Sale Order

**User Story:** As a sales user, I want to add new line items directly within the grid table, so that I can enter items faster without a popup modal.

#### Acceptance Criteria

1. WHEN the user clicks "Add New" in the items section, THE Sale_Order_Module SHALL insert a new editable row directly in the line items grid.
2. THE Sale_Order_Module SHALL allow inline editing of all line item fields (article code, article, leather type, finish color, thickness, UOM, quantity, unit price, discount %) within the grid row.
3. THE Sale_Order_Module SHALL remove the popup/modal dialog previously used for adding or editing line items.

### Requirement 5: Rename Description to Article in Sale Order Line Items

**User Story:** As a sales user, I want the "Description" column in line items to be labeled "Article", so that the terminology matches industry convention.

#### Acceptance Criteria

1. THE Sale_Order_Module SHALL display the line item description column header as "Article" instead of "Description".
2. THE Sale_Order_Module SHALL use the label "Article" in any inline editing input or placeholder text for that field.

### Requirement 6: Rename Item Code to Article Code in Sale Order Line Items

**User Story:** As a sales user, I want the "Item Code" column in line items to be labeled "Article Code", so that the terminology matches industry convention.

#### Acceptance Criteria

1. THE Sale_Order_Module SHALL display the line item code column header as "Article Code" instead of "Item Code".
2. THE Sale_Order_Module SHALL use the label "Article Code" in any inline editing input or placeholder text for that field.

### Requirement 7: Currency-Aware Rate and Amount Headings in Sale Order

**User Story:** As a sales user, I want the Rate and Amount column headers to reflect the selected currency, so that I can clearly see which currency the values are in.

#### Acceptance Criteria

1. WHEN a currency is selected in the sale order header, THE Sale_Order_Module SHALL display the Rate column header as "Rate ({currency_code})" (e.g., "Rate (USD)", "Rate (INR)").
2. WHEN a currency is selected in the sale order header, THE Sale_Order_Module SHALL display the Amount column header as "Amount ({currency_code})" (e.g., "Amount (USD)", "Amount (INR)").
3. WHEN the currency selection changes, THE Sale_Order_Module SHALL update the Rate and Amount column headers immediately without page reload.

### Requirement 8: Remove Popup Screen for Adding Items in Sale Order

**User Story:** As a sales user, I want the item add/edit popup modal removed entirely, so that all item entry happens inline in the grid.

#### Acceptance Criteria

1. THE Sale_Order_Module SHALL remove the item add/edit modal component from the sale order detail page.
2. THE Sale_Order_Module SHALL provide all item entry and editing functionality inline within the items grid table.

### Requirement 9: Tax Auto-Population from Group Master Based on HSN Code

**User Story:** As a sales user, I want the tax percentage to be automatically populated based on the HSN code associated with the Group Master, so that I do not need to manually enter tax rates.

#### Acceptance Criteria

1. WHEN a line item's article code or article is selected and the item belongs to a group in the Group_Master, THE Sale_Order_Module SHALL auto-populate the tax percentage from the GST rate defined in the Group_Master for that item's HSN code.
2. THE Sale_Order_Module SHALL display the auto-populated tax percentage in the order summary section.
3. IF an item does not have an associated Group_Master entry, THEN THE Sale_Order_Module SHALL default the tax percentage to 0 and allow manual entry.

### Requirement 10: Add Primary and Secondary UOM to Chemical/Material Master

**User Story:** As a materials manager, I want to define both a primary and secondary unit of measurement for each chemical/material, so that I can track materials in dual units similar to the Product Master.

#### Acceptance Criteria

1. THE Material_Master_Module SHALL display a "Primary UOM" dropdown in the material information section, populated from the UOM master.
2. THE Material_Master_Module SHALL display a "Secondary UOM" dropdown in the material information section, populated from the UOM master with an additional "NA" option.
3. WHEN a material is saved, THE Material_Master_Module SHALL persist both the primary_uom_id and secondary_uom_id to the database.
4. WHEN an existing material is loaded, THE Material_Master_Module SHALL display the previously saved Primary UOM and Secondary UOM values.

### Requirement 11: Restrict Material Type Dropdown to Wet-end and Finishing

**User Story:** As a materials manager, I want the Material Type dropdown to only show "Wet-end" and "Finishing" options, so that the dropdown values are relevant to the tannery chemical classification.

#### Acceptance Criteria

1. THE Material_Master_Module SHALL display only two options in the Material Type dropdown: "Wet-end" and "Finishing".
2. THE Material_Master_Module SHALL remove the previously available options ("Chemical", "Auxiliary", "Packing Material") from the Material Type dropdown.

### Requirement 12: Add Currency Dropdown to Chemical/Material Master

**User Story:** As a materials manager, I want to assign a default currency to each chemical/material, so that when a material receipt is created the currency is pre-populated.

#### Acceptance Criteria

1. THE Material_Master_Module SHALL display a "Currency" dropdown in the material information section with options including INR, USD, EUR, and GBP.
2. WHEN a material is saved, THE Material_Master_Module SHALL persist the selected currency to the database.
3. WHEN an existing material is loaded, THE Material_Master_Module SHALL display the previously saved currency value.

### Requirement 13: Populate UOM Fields in Material Receipt from Material Master

**User Story:** As a stores user, I want the Primary UOM and Secondary UOM to be automatically populated in the material receipt line item when I select an item, so that I do not need to manually look up UOM values.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL display "Primary UOM" and "Secondary UOM" columns in the item details grid.
2. WHEN an item is selected in a material receipt line, THE Material_Receipt_Module SHALL auto-populate the Primary UOM and Secondary UOM from the corresponding Chemical/Material master record.
3. THE Material_Receipt_Module SHALL display the populated UOM values as read-only fields.

### Requirement 14: Remove Received Qty Column from Material Receipt

**User Story:** As a stores user, I want the "Received Qty" column removed from the material receipt item grid, so that the grid is cleaner and replaced by the new dual-UOM quantity fields.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL remove the "Received Qty" column from the item details grid.
2. THE Material_Receipt_Module SHALL exclude received_qty from the material receipt item save payload.

### Requirement 15: Add Secondary UOM Qty and Primary UOM Qty Columns in Material Receipt

**User Story:** As a stores user, I want to enter quantities in both secondary and primary UOM, so that I can record material receipts in the appropriate measurement units.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL display a "Secondary UOM Qty" input column in the item details grid.
2. THE Material_Receipt_Module SHALL display a "Primary UOM Qty" input column in the item details grid.
3. WHILE the Secondary UOM of the selected material is "NA", THE Material_Receipt_Module SHALL disable the "Secondary UOM Qty" input field.
4. WHILE the Secondary UOM of the selected material is not "NA", THE Material_Receipt_Module SHALL enable the "Secondary UOM Qty" input field for data entry.

### Requirement 16: Add Currency Column in Material Receipt from Material Master

**User Story:** As a stores user, I want the currency to be automatically populated in each material receipt line item based on the material master, so that multi-currency receipts are handled correctly.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL display a "Currency" column in the item details grid.
2. WHEN an item is selected in a material receipt line, THE Material_Receipt_Module SHALL auto-populate the Currency from the corresponding Chemical/Material master record.
3. THE Material_Receipt_Module SHALL display the populated currency as a read-only field.

### Requirement 17: Add Exchange Rate Column in Material Receipt

**User Story:** As a stores user, I want to enter the exchange rate for foreign currency materials, so that the system can calculate the INR equivalent.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL display an "Exchange Rate" input column in the item details grid.
2. WHEN the populated currency is "INR", THE Material_Receipt_Module SHALL default the exchange rate to 1.00 and display it as read-only.
3. WHEN the populated currency is not "INR", THE Material_Receipt_Module SHALL allow the user to enter the exchange rate value.

### Requirement 18: Remove Batch No Column from Material Receipt

**User Story:** As a stores user, I want the "Batch No" column removed from the material receipt item grid, so that the grid is simplified.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL remove the "Batch No" column from the item details grid.
2. THE Material_Receipt_Module SHALL exclude batch_no from the material receipt item save payload.

### Requirement 19: Rename Rate to Rate(FC) in Material Receipt

**User Story:** As a stores user, I want the rate column labeled as "Rate(FC)" to clearly indicate it is in the foreign currency, so that there is no ambiguity about the currency of the rate.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL display the rate column header as "Rate(FC)" instead of "Rate (₹)".
2. THE Material_Receipt_Module SHALL allow the user to enter the rate value in the foreign currency.

### Requirement 20: Add Rate(INR) Column in Material Receipt

**User Story:** As a stores user, I want an auto-calculated Rate(INR) column, so that I can see the INR-equivalent rate without manual calculation.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL display a "Rate(INR)" column in the item details grid.
2. THE Material_Receipt_Module SHALL calculate Rate(INR) as: Rate(FC) × Exchange_Rate.
3. THE Material_Receipt_Module SHALL display Rate(INR) as a read-only computed field.
4. WHEN Rate(FC) or Exchange_Rate changes, THE Material_Receipt_Module SHALL recalculate Rate(INR) immediately.

### Requirement 21: Change Amount to Amount(FC) in Material Receipt

**User Story:** As a stores user, I want the amount column labeled as "Amount(FC)" and calculated using primary UOM qty and Rate(FC), so that it clearly represents the foreign currency amount.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL display the amount column header as "Amount(FC)" instead of "Amount (₹)".
2. THE Material_Receipt_Module SHALL calculate Amount(FC) as: Primary_UOM_Qty × Rate(FC).
3. THE Material_Receipt_Module SHALL display Amount(FC) as a read-only computed field.
4. WHEN Primary_UOM_Qty or Rate(FC) changes, THE Material_Receipt_Module SHALL recalculate Amount(FC) immediately.

### Requirement 22: Add Amount(INR) Column in Material Receipt

**User Story:** As a stores user, I want an auto-calculated Amount(INR) column, so that I can see the INR-equivalent line amount without manual calculation.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL display an "Amount(INR)" column in the item details grid.
2. THE Material_Receipt_Module SHALL calculate Amount(INR) as: Amount(FC) × Exchange_Rate.
3. THE Material_Receipt_Module SHALL display Amount(INR) as a read-only computed field.
4. WHEN Amount(FC) or Exchange_Rate changes, THE Material_Receipt_Module SHALL recalculate Amount(INR) immediately.

### Requirement 23: Remove Total Qty from Material Receipt Summary

**User Story:** As a stores user, I want the "Total Qty" removed from the summary section, so that the summary focuses on financial totals.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL remove the "Total Qty" line from the summary section.

### Requirement 24: Add GST Calculation Below Total Amount in Material Receipt Summary

**User Story:** As a stores user, I want GST to be calculated and displayed below the total amount in the summary section, so that I can see the tax breakdown clearly.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL display a "GST %" input field in the summary section below the Total Amount(INR).
2. THE Material_Receipt_Module SHALL calculate the total GST amount as: Total_Amount(INR) × GST%.
3. THE Material_Receipt_Module SHALL display CGST and SGST separately, each at half the GST rate (e.g., if GST is 18%, CGST is 9% and SGST is 9%).
4. THE Material_Receipt_Module SHALL display CGST amount as: Total_Amount(INR) × (GST% / 2).
5. THE Material_Receipt_Module SHALL display SGST amount as: Total_Amount(INR) × (GST% / 2).
6. WHEN the GST% value changes, THE Material_Receipt_Module SHALL recalculate CGST amount, SGST amount, and total GST amount immediately.

### Requirement 25: Add Other Charges and Grand Total in Material Receipt Summary

**User Story:** As a stores user, I want to capture freight, loading/unloading, and other charges and see a grand total that includes all amounts, so that the receipt reflects the true landed cost.

#### Acceptance Criteria

1. THE Material_Receipt_Module SHALL display input fields for Freight, Loading/Unloading charges, and Other Charges in the summary section.
2. THE Material_Receipt_Module SHALL calculate Total Other Charges as: Freight + Loading/Unloading + Other_Charges.
3. THE Material_Receipt_Module SHALL calculate Grand_Total as: Total_Amount(INR) + Total_GST_Amount + Total_Other_Charges.
4. WHEN any charge value or GST% changes, THE Material_Receipt_Module SHALL recalculate Total Other Charges and Grand_Total immediately.
5. THE Material_Receipt_Module SHALL display the Grand_Total prominently in the summary section.
