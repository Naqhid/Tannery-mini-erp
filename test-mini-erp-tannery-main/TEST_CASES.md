# Tannery Mini-ERP - Test Case Document

**Version:** 1.0  
**Date:** July 2026 
**Prepared by:**  Naqhid

---

## Table of Contents

1. [Introduction](#introduction)
2. [Test Environment](#test-environment)
3. [Active Pages Overview](#active-pages-overview)
4. [Test Cases by Module](#test-cases-by-module)
5. [Test Checklists](#test-checklists)
6. [Defect Reporting Guidelines](#defect-reporting-guidelines)

---

## Introduction

This document contains comprehensive test cases for the Tannery Mini-ERP system. It covers all **25 active pages** implemented in the feature branch. QA personnel should use this document to systematically test the application functionality.

### Test Objectives
- Verify all CRUD operations work correctly
- Validate data integrity and error handling
- Ensure UI/UX consistency across all pages
- Test user authentication and authorization
- Verify search, filter, and pagination functionality
- Validate export functionality (PDF, Excel)

---

## Test Environment

| Item | Details |
|------|---------|
| Browser | Chrome, Firefox, Edge (latest versions) |
| Resolution | Desktop (1920x1080), Tablet (768px), Mobile (375px) |
| Test Credentials | Username: `admin` / Password: `admin@123` |

---

## Active Pages Overview

| # | Module | Page | Status |
|---|--------|------|--------|
| 1 | Authentication | Login | Active |
| 2 | Dashboard | Dashboard | Active |
| 3 | Master Data | CustomerMaster | Active |
| 4 | Master Data | SupplierMaster | Active |
| 5 | Master Data | ProductMaster | Active |
| 6 | Master Data | MaterialMaster | Active |
| 7 | Product Attributes | ProductCategory | Active |
| 8 | Product Attributes | LeatherType | Active |
| 9 | Product Attributes | UOM | Active |
| 10 | Product Attributes | Thickness | Active |
| 11 | Product Attributes | StandardSize | Active |
| 12 | Product Attributes | Color | Active |
| 13 | Product Attributes | FinishType | Active |
| 14 | Product Attributes | Grade | Active |
| 15 | Product Attributes | HSNCode | Active |
| 16 | Product Attributes | ProcessStage | Active |
| 17 | Product Attributes | Machine | Active |
| 18 | BOM/Recipe | BOM | Active |
| 19 | BOM/Recipe | RecipeCreation | Active |
| 20 | Sales | SalesOrder | Active |
| 21 | Sales | SalesOrderDetail | Active |
| 22 | Settings | UsersPage | Active |
| 23 | Settings | Roles | Active |
| 24 | Settings | Company | Active |
| 25 | Settings | BusinessUnits | Active |

---

## Test Cases by Module

---

### 1. LOGIN MODULE

#### TC-AUTH-001: Successful Login
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-001 |
| **Test Scenario** | Verify user can login with valid credentials |
| **Pre-conditions** | Application is running, user account exists |
| **Test Steps** | 1. Navigate to login page<br>2. Enter username: `admin`<br>3. Enter password: `admin@123`<br>4. Click Sign In button |
| **Expected Result** | User is redirected to Dashboard page |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-AUTH-002: Login with Invalid Username
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-002 |
| **Test Scenario** | Verify error message for invalid username |
| **Pre-conditions** | Application is running |
| **Test Steps** | 1. Navigate to login page<br>2. Enter username: `invaliduser`<br>3. Enter password: `admin@123`<br>4. Click Sign In button |
| **Expected Result** | Error message "Invalid credentials" is displayed |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-AUTH-003: Login with Invalid Password
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-003 |
| **Test Scenario** | Verify error message for invalid password |
| **Pre-conditions** | Application is running |
| **Test Steps** | 1. Navigate to login page<br>2. Enter username: `admin`<br>3. Enter password: `wrongpassword`<br>4. Click Sign In button |
| **Expected Result** | Error message "Invalid credentials" is displayed |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-AUTH-004: Login with Empty Fields
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-004 |
| **Test Scenario** | Verify validation for empty fields |
| **Pre-conditions** | Application is running |
| **Test Steps** | 1. Navigate to login page<br>2. Leave username empty<br>3. Leave password empty<br>4. Click Sign In button |
| **Expected Result** | Form validation prevents submission, shows required field messages |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-AUTH-005: Password Visibility Toggle
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-005 |
| **Test Scenario** | Verify password show/hide functionality |
| **Pre-conditions** | Application is running |
| **Test Steps** | 1. Enter password in password field<br>2. Click eye icon to show password<br>3. Click eye icon to hide password |
| **Expected Result** | Password toggles between visible (text) and hidden (dots) |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

### 2. DASHBOARD MODULE

#### TC-DASH-001: Dashboard Load
| Field | Value |
|-------|-------|
| **Test ID** | TC-DASH-001 |
| **Test Scenario** | Verify dashboard loads with statistics |
| **Pre-conditions** | User is logged in |
| **Test Steps** | 1. Login successfully<br>2. Observe dashboard |
| **Expected Result** | Dashboard displays sales summary, top customers, recent orders |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-DASH-002: Navigation from Dashboard
| Field | Value |
|-------|-------|
| **Test ID** | TC-DASH-002 |
| **Test Scenario** | Verify navigation links work |
| **Pre-conditions** | User is on dashboard |
| **Test Steps** | 1. Click on sidebar menu items<br>2. Verify each page loads correctly |
| **Expected Result** | All menu items navigate to correct pages |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

---

### 3. MASTER DATA MODULE (CRUD Operations)

**Note:** The following test cases apply to: CustomerMaster, SupplierMaster, ProductMaster, MaterialMaster

#### TC-MASTER-001: Create New Record
| Field | Value |
|-------|-------|
| **Test ID** | TC-MASTER-001 |
| **Test Scenario** | Verify user can create new master record |
| **Pre-conditions** | User is logged in, on master page |
| **Test Steps** | 1. Click "Add [Entity]" button<br>2. Fill required fields (Name is mandatory)<br>3. Click Save |
| **Expected Result** | Record created, success toast displayed, record appears in list |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-MASTER-002: Edit Existing Record
| Field | Value |
|-------|-------|
| **Test ID** | TC-MASTER-002 |
| **Test Scenario** | Verify user can edit existing record |
| **Pre-conditions** | At least one record exists |
| **Test Steps** | 1. Click on record in list<br>2. Modify fields in modal<br>3. Click Update |
| **Expected Result** | Record updated, success toast displayed, changes reflected in list |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-MASTER-003: Delete Record
| Field | Value |
|-------|-------|
| **Test ID** | TC-MASTER-003 |
| **Test Scenario** | Verify user can delete record |
| **Pre-conditions** | At least one record exists that can be deleted |
| **Test Steps** | 1. Click on record<br>2. Click Delete button in modal<br>3. Confirm deletion in dialog |
| **Expected Result** | Record deleted, success toast displayed, record removed from list |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-MASTER-004: Required Field Validation
| Field | Value |
|-------|-------|
| **Test ID** | TC-MASTER-004 |
| **Test Scenario** | Verify validation for required fields |
| **Pre-conditions** | User is on create modal |
| **Test Steps** | 1. Leave Name field empty<br>2. Click Save |
| **Expected Result** | Error toast "Name is required" displayed |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-MASTER-005: Search Functionality
| Field | Value |
|-------|-------|
| **Test ID** | TC-MASTER-005 |
| **Test Scenario** | Verify search works correctly |
| **Pre-conditions** | Multiple records exist |
| **Test Steps** | 1. Type search term in search box<br>2. Observe filtered results |
| **Expected Result** | List filters to show matching records |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-MASTER-006: Pagination
| Field | Value |
|-------|-------|
| **Test ID** | TC-MASTER-006 |
| **Test Scenario** | Verify pagination controls work |
| **Pre-conditions** | More than 10 records exist |
| **Test Steps** | 1. Click next page<br>2. Change items per page<br>3. Navigate to different pages |
| **Expected Result** | Pagination updates correctly, records refresh |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-MASTER-007: Status Toggle
| Field | Value |
|-------|-------|
| **Test ID** | TC-MASTER-007 |
| **Test Scenario** | Verify active/inactive status toggle |
| **Pre-conditions** | User is editing a record |
| **Test Steps** | 1. Open record for editing<br>2. Toggle status switch<br>3. Save |
| **Expected Result** | Status changes between Active/Inactive |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-MASTER-008: Export to Excel
| Field | Value |
|-------|-------|
| **Test ID** | TC-MASTER-008 |
| **Test Scenario** | Verify Excel export functionality |
| **Pre-conditions** | Records exist in list |
| **Test Steps** | 1. Click Export dropdown<br>2. Select "Export to Excel" |
| **Expected Result** | Excel file downloads with all visible records |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-MASTER-009: Export PDF Preview
| Field | Value |
|-------|-------|
| **Test ID** | TC-MASTER-009 |
| **Test Scenario** | Verify PDF preview functionality |
| **Pre-conditions** | Records exist in list |
| **Test Steps** | 1. Click Export dropdown<br>2. Select "Preview PDF" |
| **Expected Result** | PDF opens in new tab/window for preview |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-MASTER-010: Export PDF Download
| Field | Value |
|-------|-------|
| **Test ID** | TC-MASTER-010 |
| **Test Scenario** | Verify PDF download functionality |
| **Pre-conditions** | Records exist in list |
| **Test Steps** | 1. Click Export dropdown<br>2. Select "Download PDF" |
| **Expected Result** | PDF file downloads to local machine |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

### 4. PRODUCT ATTRIBUTE MODULES

**Applies to:** ProductCategory, LeatherType, UOM, Thickness, StandardSize, Color, FinishType, Grade, HSNCode, ProcessStage, Machine

#### TC-ATTR-001: Create Attribute Record
| Field | Value |
|-------|-------|
| **Test ID** | TC-ATTR-001 |
| **Test Scenario** | Verify creation of product attribute |
| **Pre-conditions** | User is logged in |
| **Test Steps** | 1. Navigate to attribute page<br>2. Click Add button<br>3. Enter Name (required)<br>4. Enter other fields as applicable<br>5. Save |
| **Expected Result** | Attribute created successfully |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ATTR-002: Color Hex Code Validation
| Field | Value |
|-------|-------|
| **Test ID** | TC-ATTR-002 |
| **Test Scenario** | Verify hex code field in Color page |
| **Pre-conditions** | User is on Color page |
| **Test Steps** | 1. Create new color<br>2. Enter hex code (e.g., #FF5733) |
| **Expected Result** | Hex code saved correctly |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ATTR-003: Thickness Value Validation
| Field | Value |
|-------|-------|
| **Test ID** | TC-ATTR-003 |
| **Test Scenario** | Verify thickness value in mm field |
| **Pre-conditions** | User is on Thickness page |
| **Test Steps** | 1. Create thickness<br>2. Enter value in mm (e.g., 1.2) |
| **Expected Result** | Numeric value saved correctly |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ATTR-004: HSN Code GST Rate Validation
| Field | Value |
|-------|-------|
| **Test ID** | TC-ATTR-004 |
| **Test Scenario** | Verify GST rate field for HSN Code |
| **Pre-conditions** | User is on HSN Code page |
| **Test Steps** | 1. Create HSN code<br>2. Enter GST rate (e.g., 18) |
| **Expected Result** | GST percentage saved correctly |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ATTR-005: Grade Rank Validation
| Field | Value |
|-------|-------|
| **Test ID** | TC-ATTR-005 |
| **Test Scenario** | Verify rank field in Grade page |
| **Pre-conditions** | User is on Grade page |
| **Test Steps** | 1. Create grade<br>2. Enter rank (1-4) |
| **Expected Result** | Rank saved and displayed correctly |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ATTR-006: Process Stage Sequence
| Field | Value |
|-------|-------|
| **Test ID** | TC-ATTR-006 |
| **Test Scenario** | Verify sequence field in Process Stage |
| **Pre-conditions** | User is on Process Stage page |
| **Test Steps** | 1. Create process stage<br>2. Enter sequence number |
| **Expected Result** | Sequence saved and shown in list |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ATTR-007: Machine Type and Capacity
| Field | Value |
|-------|-------|
| **Test ID** | TC-ATTR-007 |
| **Test Scenario** | Verify machine fields |
| **Pre-conditions** | User is on Machine page |
| **Test Steps** | 1. Create machine<br>2. Enter machine type and capacity |
| **Expected Result** | Machine details saved correctly |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

### 5. SALES ORDER MODULE

#### TC-SALES-001: Create New Sales Order
| Field | Value |
|-------|-------|
| **Test ID** | TC-SALES-001 |
| **Test Scenario** | Verify creation of new sales order |
| **Pre-conditions** | Customer exists, user is logged in |
| **Test Steps** | 1. Navigate to Sales Orders<br>2. Click "New Sales Order"<br>3. Select Customer (required)<br>4. Enter Order Date (required)<br>5. Click Save Order |
| **Expected Result** | Sales order created with auto-generated order number |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SALES-002: Add Items to Sales Order
| Field | Value |
|-------|-------|
| **Test ID** | TC-SALES-002 |
| **Test Scenario** | Verify adding items to order |
| **Pre-conditions** | Sales order exists |
| **Test Steps** | 1. Open sales order<br>2. Click "Add Item"<br>3. Enter item details (description, qty, rate required)<br>4. Save |
| **Expected Result** | Item added, amount calculated, total updated |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SALES-003: Calculate Order Totals
| Field | Value |
|-------|-------|
| **Test ID** | TC-SALES-003 |
| **Test Scenario** | Verify automatic calculation of totals |
| **Pre-conditions** | Sales order with items exists |
| **Test Steps** | 1. Add multiple items<br>2. Modify discount, freight<br>3. Observe calculations |
| **Expected Result** | Sub-total, tax, grand total calculated correctly |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SALES-004: Sales Order Status Transition
| Field | Value |
|-------|-------|
| **Test ID** | TC-SALES-004 |
| **Test Scenario** | Verify status changes |
| **Pre-conditions** | Sales order exists |
| **Test Steps** | 1. Open order<br>2. Change status from Draft to Confirmed<br>3. Save |
| **Expected Result** | Status updated, history maintained |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SALES-005: Add Delivery Note
| Field | Value |
|-------|-------|
| **Test ID** | TC-SALES-005 |
| **Test Scenario** | Verify delivery note creation |
| **Pre-conditions** | Saved sales order exists |
| **Test Steps** | 1. Open order<br>2. Go to Delivery tab<br>3. Click "Create Delivery Note"<br>4. Fill delivery details<br>5. Save |
| **Expected Result** | Delivery note created with auto-generated number |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SALES-006: Add Payment Receipt
| Field | Value |
|-------|-------|
| **Test ID** | TC-SALES-006 |
| **Test Scenario** | Verify payment receipt creation |
| **Pre-conditions** | Saved sales order exists |
| **Test Steps** | 1. Open order<br>2. Go to Payment tab<br>3. Click "Add Receipt"<br>4. Enter amount and date<br>5. Save |
| **Expected Result** | Payment receipt recorded, balance updated |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SALES-007: Create Invoice
| Field | Value |
|-------|-------|
| **Test ID** | TC-SALES-007 |
| **Test Scenario** | Verify invoice creation |
| **Pre-conditions** | Saved sales order exists |
| **Test Steps** | 1. Open order<br>2. Go to Payment tab<br>3. Click "Create Invoice"<br>4. Enter invoice amount<br>5. Save |
| **Expected Result** | Invoice created with status tracking |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SALES-008: Upload Attachment
| Field | Value |
|-------|-------|
| **Test ID** | TC-SALES-008 |
| **Test Scenario** | Verify file attachment upload |
| **Pre-conditions** | Saved sales order exists |
| **Test Steps** | 1. Open order<br>2. Go to Attachments tab<br>3. Upload a file (PDF, DOC, XLS, or image)<br>4. Select category<br>5. Save |
| **Expected Result** | File uploaded and displayed in attachments list |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SALES-009: Duplicate Sales Order
| Field | Value |
|-------|-------|
| **Test ID** | TC-SALES-009 |
| **Test Scenario** | Verify order duplication |
| **Pre-conditions** | Sales order with items exists |
| **Test Steps** | 1. Open existing order<br>2. Click "Duplicate" button |
| **Expected Result** | New order created as copy with Draft status |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SALES-010: Filter Sales Orders by Status
| Field | Value |
|-------|-------|
| **Test ID** | TC-SALES-010 |
| **Test Scenario** | Verify status filter |
| **Pre-conditions** | Multiple orders with different statuses exist |
| **Test Steps** | 1. Go to Sales Orders list<br>2. Select status from dropdown<br>3. Observe filtered results |
| **Expected Result** | List shows only orders with selected status |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

### 6. BOM / RECIPE MODULE

#### TC-BOM-001: Create BOM
| Field | Value |
|-------|-------|
| **Test ID** | TC-BOM-001 |
| **Test Scenario** | Verify BOM creation |
| **Pre-conditions** | Products and materials exist |
| **Test Steps** | 1. Navigate to BOM<br>2. Create new BOM record<br>3. Add components |
| **Expected Result** | BOM created with components |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-RECIPE-001: Create Recipe
| Field | Value |
|-------|-------|
| **Test ID** | TC-RECIPE-001 |
| **Test Scenario** | Verify recipe creation |
| **Pre-conditions** | User is logged in |
| **Test Steps** | 1. Navigate to Recipe Creation<br>2. Select product<br>3. Add ingredients/chemicals<br>4. Save |
| **Expected Result** | Recipe created with all components |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

---

### 7. SETTINGS MODULE

#### TC-USER-001: Create User
| Field | Value |
|-------|-------|
| **Test ID** | TC-USER-001 |
| **Test Scenario** | Verify user creation |
| **Pre-conditions** | Admin user logged in |
| **Test Steps** | 1. Navigate to Users<br>2. Click Add User<br>3. Fill user details<br>4. Assign role<br>5. Save |
| **Expected Result** | User created with assigned role |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ROLE-001: Create Role
| Field | Value |
|-------|-------|
| **Test ID** | TC-ROLE-001 |
| **Test Scenario** | Verify role creation |
| **Pre-conditions** | Admin user logged in |
| **Test Steps** | 1. Navigate to Roles<br>2. Create new role<br>3. Assign permissions |
| **Expected Result** | Role created with permissions |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-COMPANY-001: Update Company Settings
| Field | Value |
|-------|-------|
| **Test ID** | TC-COMPANY-001 |
| **Test Scenario** | Verify company settings |
| **Pre-conditions** | Admin user logged in |
| **Test Steps** | 1. Navigate to Company<br>2. Update company details<br>3. Save |
| **Expected Result** | Company settings updated |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-BU-001: Manage Business Units
| Field | Value |
|-------|-------|
| **Test ID** | TC-BU-001 |
| **Test Scenario** | Verify business unit management |
| **Pre-conditions** | Admin user logged in |
| **Test Steps** | 1. Navigate to Business Units<br>2. Create/Edit/Delete business unit |
| **Expected Result** | Business unit operations work correctly |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

## Test Checklists

### Pre-Test Checklist
- [ ] Test environment is accessible
- [ ] Database is properly seeded with test data
- [ ] Test user credentials are working
- [ ] Browser cache cleared
- [ ] Network connectivity verified

### Daily Testing Checklist
- [ ] Login/Logout functionality works
- [ ] Dashboard loads correctly
- [ ] All menu items navigate properly
- [ ] Create operations work on all active pages
- [ ] Edit operations work on all active pages
- [ ] Delete operations work on all active pages
- [ ] Search functionality works
- [ ] Pagination works correctly
- [ ] Export to Excel works
- [ ] Export to PDF works
- [ ] Status toggle works

### UI/UX Checklist
- [ ] All pages render without layout issues
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Forms validate required fields
- [ ] Error messages are clear and helpful
- [ ] Success messages display correctly
- [ ] Loading indicators show during operations
- [ ] Colors and fonts are consistent
- [ ] Buttons have proper hover/active states
- [ ] Tables display data correctly
- [ ] Modals open and close properly

### Data Validation Checklist
- [ ] Required fields are validated
- [ ] Numeric fields accept only numbers
- [ ] Date fields accept valid dates only
- [ ] Dropdown values are populated correctly
- [ ] Duplicate entries are handled
- [ ] Invalid data shows appropriate errors

### Security Checklist
- [ ] Cannot access protected pages without login
- [ ] Session expires after inactivity
- [ ] Sensitive data is not exposed
- [ ] XSS attempts are prevented
- [ ] SQL injection is prevented

---

## Defect Reporting Guidelines

When reporting defects, include:

| Field | Description |
|-------|-------------|
| **Defect ID** | Auto-generated |
| **Title** | Brief description of the issue |
| **Severity** | Critical / High / Medium / Low |
| **Priority** | P1 / P2 / P3 / P4 |
| **Steps to Reproduce** | Detailed steps |
| **Expected Result** | What should happen |
| **Actual Result** | What actually happened |
| **Screenshots** | Attach if applicable |
| **Environment** | Browser, OS, Screen size |
| **Related Test Case** | Reference TC ID if applicable |

### Severity Definitions

| Severity | Definition |
|----------|------------|
| **Critical** | Application crash, data loss, security breach |
| **High** | Major feature not working, workaround not available |
| **Medium** | Feature partially working, workaround available |
| **Low** | Minor issues, cosmetic defects |

---

## Test Execution Summary Template

| Module | Total TCs | Passed | Failed | Blocked | Pass Rate |
|--------|-----------|--------|--------|---------|-----------|
| Authentication | 5 | | | | |
| Dashboard | 2 | | | | |
| Master Data | 40 | | | | |
| Product Attributes | 70 | | | | |
| Sales Orders | 10 | | | | |
| BOM/Recipe | 2 | | | | |
| Settings | 4 | | | | |
| **TOTAL** | **133** | | | | |

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| QA Tester | | | |
| Developer | | | |
| Product Owner | | | |

---

*Document End*
