# Tannery Mini-ERP - Test Cases: UI/UX & Backend Improvements

**Version:** 1.0
**Date:** July 2026
**Scope:** New improvement features applied across all CRUD master pages
**Applies to:** UOM, Color, Grade, HSN Code, Product Category, Leather Type, Thickness, Standard Size, Finish Type, Process Stage, Machine, Roles, Company, Business Units

---

## Table of Contents

1. [Test Environment](#test-environment)
2. [Search Improvements](#1-search-improvements)
3. [Filtering](#2-filtering)
4. [Tables - Row Selection & Bulk Actions](#3-tables---row-selection--bulk-actions)
5. [Tables - Row Actions](#4-tables---row-actions)
6. [Tables - Sorting & Pagination Persistence](#5-tables---sorting--pagination-persistence)
7. [Forms / Slide-over Panels - Validation](#6-forms--slide-over-panels---validation)
8. [Forms / Slide-over Panels - UX](#7-forms--slide-over-panels---ux)
9. [Data Integrity](#8-data-integrity)
10. [Audit Information](#9-audit-information)
11. [Soft Delete / Archive](#10-soft-delete--archive)
12. [User Experience](#11-user-experience)
13. [Accessibility](#12-accessibility)
14. [Backend APIs](#13-backend-apis)
15. [Database Migration](#14-database-migration)
16. [Regression Checklist](#15-regression-checklist)

---

## Test Environment

| Item | Details |
|------|---------|
| Browser | Chrome, Firefox, Edge (latest versions) |
| Resolution | Desktop (1920x1080), Tablet (768px), Mobile (375px) |
| Test Credentials | Username: `admin` / Password: `admin@123` |
| Backend | Node.js/Express server running on port 3001 |
| Database | MySQL with migration 004 applied |

### Pages Covered

All master pages that use the shared `MasterPage` component:

| # | Page | Route | API Endpoint |
|---|------|-------|-------------|
| 1 | Product Category | /product-category | /api/product-categories |
| 2 | Leather Type | /leather-type | /api/leather-types |
| 3 | UOM | /uom | /api/uom |
| 4 | Thickness | /thickness | /api/thickness |
| 5 | Standard Size | /standard-size | /api/standard-sizes |
| 6 | Color | /color | /api/colors |
| 7 | Finish Type | /finish-type | /api/finish-types |
| 8 | Grade | /grade | /api/grades |
| 9 | HSN Code | /hsn-code | /api/hsn-codes |
| 10 | Process Stage | /process-stage | /api/process-stages |
| 11 | Machine | /machine | /api/machines |
| 12 | Roles | /roles | /api/roles |
| 13 | Company | /company | /api/companies |
| 14 | Business Units | /business-units | /api/business-units |

> **Note:** Each test case below should be repeated on at least 3 different master pages to verify consistency.

---

## 1. Search Improvements

#### TC-SEARCH-001: Search Debounce
| Field | Value |
|-------|-------|
| **Test ID** | TC-SEARCH-001 |
| **Test Scenario** | Verify API requests are debounced (350ms) during typing |
| **Pre-conditions** | User is logged in, on any master page with existing records |
| **Test Steps** | 1. Open browser DevTools Network tab<br>2. Type "test" in the search field rapidly (one character at a time)<br>3. Observe network requests while typing<br>4. Stop typing and wait |
| **Expected Result** | No API request is sent while the user is actively typing. Only one request is sent ~350ms after the user stops typing. Not one request per keystroke. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SEARCH-002: Clear Search Button
| Field | Value |
|-------|-------|
| **Test ID** | TC-SEARCH-002 |
| **Test Scenario** | Verify the X button appears and clears the search field instantly |
| **Pre-conditions** | User is on any master page |
| **Test Steps** | 1. Type a search query in the search field<br>2. Observe the X (clear) button appears inside the search field<br>3. Click the X button |
| **Expected Result** | Search field is cleared immediately, the full unfiltered list is restored, pagination resets to page 1 |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SEARCH-003: Search Loading Indicator
| Field | Value |
|-------|-------|
| **Test ID** | TC-SEARCH-003 |
| **Test Scenario** | Verify a spinner appears while the debounced search is pending |
| **Pre-conditions** | User is on any master page |
| **Test Steps** | 1. Type a search query<br>2. Observe the search field while waiting for debounce to complete |
| **Expected Result** | A small spinner appears to the right of the search field indicating the search is pending. Spinner disappears once results are loaded. |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SEARCH-004: Reset Pagination on New Search
| Field | Value |
|-------|-------|
| **Test ID** | TC-SEARCH-004 |
| **Test Scenario** | Verify pagination resets to page 1 when a new search is performed |
| **Pre-conditions** | Master page has more than 10 records, user is on page 2 or later |
| **Test Steps** | 1. Navigate to page 2 or beyond using pagination controls<br>2. Type a search query in the search field<br>3. Wait for debounced search to execute |
| **Expected Result** | Pagination resets to page 1 with the filtered search results |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SEARCH-005: Search with No Results
| Field | Value |
|-------|-------|
| **Test ID** | TC-SEARCH-005 |
| **Test Scenario** | Verify empty state is displayed when search returns no results |
| **Pre-conditions** | User is on any master page |
| **Test Steps** | 1. Type a search query that does not match any record (e.g., "zzznonexistent")<br>2. Wait for search to execute |
| **Expected Result** | Empty state illustration is displayed with "No records found" message. No table rows are shown. |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

## 2. Filtering

#### TC-FILTER-001: Open Filter Panel
| Field | Value |
|-------|-------|
| **Test ID** | TC-FILTER-001 |
| **Test Scenario** | Verify the Filter button opens a filter dropdown panel |
| **Pre-conditions** | User is on a master page that has filterOptions configured (e.g., Company with city/state/country filters) |
| **Test Steps** | 1. Click the Filter button in the toolbar |
| **Expected Result** | A filter panel dropdown opens showing available filter options relevant to the module |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-FILTER-002: Apply a Filter
| Field | Value |
|-------|-------|
| **Test ID** | TC-FILTER-002 |
| **Test Scenario** | Verify selecting a filter value narrows the displayed records |
| **Pre-conditions** | Filter panel is open, records with varying filter values exist |
| **Test Steps** | 1. Select a value from a filter dropdown (e.g., City = "Mumbai")<br>2. Observe the table updates |
| **Expected Result** | Only records matching the selected filter value are displayed. Filter panel closes. Pagination resets to page 1. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-FILTER-003: Active Filter Chips Display
| Field | Value |
|-------|-------|
| **Test ID** | TC-FILTER-003 |
| **Test Scenario** | Verify active filters are shown as chips below the toolbar |
| **Pre-conditions** | At least one filter is applied |
| **Test Steps** | 1. Apply one or more filters<br>2. Observe the area below the toolbar |
| **Expected Result** | Each active filter is displayed as a chip showing the filter label and selected value (e.g., "City: Mumbai") |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-FILTER-004: Remove Individual Filter Chip
| Field | Value |
|-------|-------|
| **Test ID** | TC-FILTER-004 |
| **Test Scenario** | Verify clicking the X on a filter chip removes only that filter |
| **Pre-conditions** | Two or more filters are active |
| **Test Steps** | 1. Click the X button on one filter chip<br>2. Observe the table and remaining chips |
| **Expected Result** | Only the clicked filter is removed. Other filters remain active. Table updates to reflect the remaining filters. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-FILTER-005: Clear All Filters
| Field | Value |
|-------|-------|
| **Test ID** | TC-FILTER-005 |
| **Test Scenario** | Verify Clear All Filters removes all active filters |
| **Pre-conditions** | One or more filters are active |
| **Test Steps** | 1. Click "Clear All" link next to filter chips<br>2. Observe the table and filter chips |
| **Expected Result** | All filter chips are removed. Table shows all unfiltered records. Filter button badge count disappears. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-FILTER-006: Filter Badge Count
| Field | Value |
|-------|-------|
| **Test ID** | TC-FILTER-006 |
| **Test Scenario** | Verify the Filter button shows a badge with the count of active filters |
| **Pre-conditions** | User is on a master page with filter support |
| **Test Steps** | 1. Apply 2 filters<br>2. Observe the Filter button |
| **Expected Result** | The Filter button displays a blue badge with the number "2" indicating 2 active filters |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-FILTER-007: Filter Combined with Search
| Field | Value |
|-------|-------|
| **Test ID** | TC-FILTER-007 |
| **Test Scenario** | Verify search and filters work together |
| **Pre-conditions** | Records exist with varying filter values and searchable text |
| **Test Steps** | 1. Apply a filter (e.g., Status = Active)<br>2. Type a search query<br>3. Wait for debounce |
| **Expected Result** | Results are filtered by both the selected filter AND the search query simultaneously |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

---

## 3. Tables - Row Selection & Bulk Actions

#### TC-BULK-001: Select Individual Row
| Field | Value |
|-------|-------|
| **Test ID** | TC-BULK-001 |
| **Test Scenario** | Verify a single row can be selected via checkbox |
| **Pre-conditions** | At least one record exists in the table |
| **Test Steps** | 1. Click the checkbox in the first column of any row |
| **Expected Result** | The checkbox is checked. The row is highlighted with a blue tint. The bulk action bar appears showing "1 selected". |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-BULK-002: Deselect Individual Row
| Field | Value |
|-------|-------|
| **Test ID** | TC-BULK-002 |
| **Test Scenario** | Verify a selected row can be deselected |
| **Pre-conditions** | A row is already selected |
| **Test Steps** | 1. Click the checkbox of the selected row again |
| **Expected Result** | The checkbox is unchecked. Row highlight is removed. If no other rows are selected, the bulk action bar disappears. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-BULK-003: Select All Rows
| Field | Value |
|-------|-------|
| **Test ID** | TC-BULK-003 |
| **Test Scenario** | Verify the Select All checkbox selects all rows on the current page |
| **Pre-conditions** | Multiple records exist on the current page |
| **Test Steps** | 1. Click the checkbox in the table header (first column) |
| **Expected Result** | All rows on the current page are selected. All row checkboxes are checked. Bulk action bar shows the total count selected. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-BULK-004: Deselect All Rows
| Field | Value |
|-------|-------|
| **Test ID** | TC-BULK-004 |
| **Test Scenario** | Verify clicking Select All again deselects all rows |
| **Pre-conditions** | All rows on the current page are selected |
| **Test Steps** | 1. Click the header checkbox again |
| **Expected Result** | All rows are deselected. Bulk action bar disappears. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-BULK-005: Clear Selection Button
| Field | Value |
|-------|-------|
| **Test ID** | TC-BULK-005 |
| **Test Scenario** | Verify the "Clear" link in the bulk action bar clears all selections |
| **Pre-conditions** | One or more rows are selected |
| **Test Steps** | 1. Click the "Clear" link in the bulk action bar |
| **Expected Result** | All selections are cleared. Bulk action bar disappears. |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-BULK-006: Bulk Delete (Archive)
| Field | Value |
|-------|-------|
| **Test ID** | TC-BULK-006 |
| **Test Scenario** | Verify bulk archive deletes selected records (soft delete) |
| **Pre-conditions** | 2 or more rows are selected |
| **Test Steps** | 1. Click "Bulk Actions" button<br>2. Click "Delete Selected"<br>3. Confirm in the confirmation dialog |
| **Expected Result** | Confirmation dialog appears with count. After confirming, selected records are archived (soft deleted). Success toast shows count archived. Table refreshes. Selections cleared. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-BULK-007: Bulk Set Active
| Field | Value |
|-------|-------|
| **Test ID** | TC-BULK-007 |
| **Test Scenario** | Verify bulk status change to Active |
| **Pre-conditions** | 2 or more rows with Inactive status are selected |
| **Test Steps** | 1. Click "Bulk Actions"<br>2. Click "Set Active"<br>3. Confirm in dialog |
| **Expected Result** | All selected records have their status changed to Active. Success toast displays count. Table refreshes. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-BULK-008: Bulk Set Inactive
| Field | Value |
|-------|-------|
| **Test ID** | TC-BULK-008 |
| **Test Scenario** | Verify bulk status change to Inactive |
| **Pre-conditions** | 2 or more rows with Active status are selected |
| **Test Steps** | 1. Click "Bulk Actions"<br>2. Click "Set Inactive"<br>3. Confirm in dialog |
| **Expected Result** | All selected records have their status changed to Inactive. Success toast displays count. Table refreshes. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-BULK-009: Bulk Archive
| Field | Value |
|-------|-------|
| **Test ID** | TC-BULK-009 |
| **Test Scenario** | Verify bulk archive action soft-deletes selected records |
| **Pre-conditions** | 2 or more rows are selected |
| **Test Steps** | 1. Click "Bulk Actions"<br>2. Click "Archive Selected"<br>3. Confirm in dialog |
| **Expected Result** | Selected records are archived (soft deleted). Success toast displays count. Table refreshes. Archived count in header increases. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-BULK-010: Bulk Action with No Selection
| Field | Value |
|-------|-------|
| **Test ID** | TC-BULK-010 |
| **Test Scenario** | Verify bulk action shows error when no rows are selected |
| **Pre-conditions** | No rows are selected |
| **Test Steps** | 1. Attempt to trigger a bulk action (if accessible) |
| **Expected Result** | Error toast "No rows selected" is displayed |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-BULK-011: Bulk Actions Dropdown Closes on Outside Click
| Field | Value |
|-------|-------|
| **Test ID** | TC-BULK-011 |
| **Test Scenario** | Verify the bulk actions dropdown closes when clicking outside |
| **Pre-conditions** | Rows are selected, bulk actions dropdown is open |
| **Test Steps** | 1. Open the bulk actions dropdown<br>2. Click anywhere outside the dropdown |
| **Expected Result** | The dropdown closes |
| **Priority** | Low |
| **Status** | [ ] Pass [ ] Fail |

---

## 4. Tables - Row Actions

#### TC-ROW-001: Quick Status Toggle in Table
| Field | Value |
|-------|-------|
| **Test ID** | TC-ROW-001 |
| **Test Scenario** | Verify status can be toggled directly from the table without opening the edit panel |
| **Pre-conditions** | A record with Active status exists in the table |
| **Test Steps** | 1. Find the status indicator dot in the Actions column of a row<br>2. Click the status dot |
| **Expected Result** | Record status toggles between Active and Inactive. The dot color changes (green for Active, gray for Inactive). Success toast confirms status change. No edit panel opens. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ROW-002: Duplicate Record
| Field | Value |
|-------|-------|
| **Test ID** | TC-ROW-002 |
| **Test Scenario** | Verify the duplicate action creates a copy of the record |
| **Pre-conditions** | At least one record exists |
| **Test Steps** | 1. Click the duplicate icon (copy icon) in the Actions column of a row |
| **Expected Result** | A new record is created with "(Copy)" appended to the name and a new auto-generated code. Success toast is displayed. New record appears in the list. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ROW-003: Edit from Row Action
| Field | Value |
|-------|-------|
| **Test ID** | TC-ROW-003 |
| **Test Scenario** | Verify clicking the edit icon opens the slide-over panel |
| **Pre-conditions** | At least one record exists |
| **Test Steps** | 1. Click the edit (pencil) icon in the Actions column |
| **Expected Result** | The slide-over panel opens with the record's data pre-filled in the form |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ROW-004: Archive from Row Action
| Field | Value |
|-------|-------|
| **Test ID** | TC-ROW-004 |
| **Test Scenario** | Verify clicking the trash icon archives the record (soft delete) |
| **Pre-conditions** | At least one record exists |
| **Test Steps** | 1. Click the trash icon in the Actions column<br>2. Confirm in the confirmation dialog |
| **Expected Result** | Confirmation dialog appears with "Archive" title. After confirming, record is soft-deleted. Success toast shows "archived successfully". Record disappears from active list. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ROW-005: Row Click Opens Edit Panel
| Field | Value |
|-------|-------|
| **Test ID** | TC-ROW-005 |
| **Test Scenario** | Verify clicking anywhere on a row (except checkboxes/actions) opens the edit panel |
| **Pre-conditions** | At least one record exists |
| **Test Steps** | 1. Click on any cell in a row (not the checkbox or action buttons) |
| **Expected Result** | The slide-over panel opens with the record's data pre-filled |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

## 5. Tables - Sorting & Pagination Persistence

#### TC-SORT-001: Sort by Column (Ascending)
| Field | Value |
|-------|-------|
| **Test ID** | TC-SORT-001 |
| **Test Scenario** | Verify clicking a sortable column header sorts ascending |
| **Pre-conditions** | Multiple records exist in the table |
| **Test Steps** | 1. Click on the "Name" column header |
| **Expected Result** | Records are sorted alphabetically by Name (A-Z). An up-arrow icon appears next to the column header. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SORT-002: Sort by Column (Descending)
| Field | Value |
|-------|-------|
| **Test ID** | TC-SORT-002 |
| **Test Scenario** | Verify clicking the same column header again sorts descending |
| **Pre-conditions** | A column is already sorted ascending |
| **Test Steps** | 1. Click the same column header again |
| **Expected Result** | Records are sorted in reverse order (Z-A). A down-arrow icon appears next to the column header. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-SORT-003: Sort Indicator on Unsorted Column
| Field | Value |
|-------|-------|
| **Test ID** | TC-SORT-003 |
| **Test Scenario** | Verify unsorted columns show a neutral sort icon |
| **Pre-conditions** | No sort is applied or a different column is sorted |
| **Test Steps** | 1. Observe column headers that are not currently sorted |
| **Expected Result** | Unsorted columns show a neutral up-down arrow icon that becomes more visible on hover |
| **Priority** | Low |
| **Status** | [ ] Pass [ ] Fail |

#### TC-PAGE-001: Pagination Maintained After Edit
| Field | Value |
|-------|-------|
| **Test ID** | TC-PAGE-001 |
| **Test Scenario** | Verify current page is maintained after editing a record |
| **Pre-conditions** | User is on page 2 or later |
| **Test Steps** | 1. Navigate to page 2<br>2. Click a record to edit<br>3. Modify and save<br>4. Observe the current page after save |
| **Expected Result** | After saving, the user remains on the same page (page 2). The updated record is reflected. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-PAGE-002: Pagination Maintained After Status Toggle
| Field | Value |
|-------|-------|
| **Test ID** | TC-PAGE-002 |
| **Test Scenario** | Verify current page is maintained after toggling a record's status |
| **Pre-conditions** | User is on page 2 or later |
| **Test Steps** | 1. Navigate to page 2<br>2. Click the status toggle on a row<br>3. Observe the current page |
| **Expected Result** | After the status toggle, the user remains on page 2 |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-PAGE-003: Page Size Change
| Field | Value |
|-------|-------|
| **Test ID** | TC-PAGE-003 |
| **Test Scenario** | Verify changing page size updates the table and resets to page 1 |
| **Pre-conditions** | More than 10 records exist |
| **Test Steps** | 1. Change the page size selector from "10 / page" to "25 / page" |
| **Expected Result** | Table reloads showing up to 25 records per page. Pagination resets to page 1. Total page count updates. |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

## 6. Forms / Slide-over Panels - Validation

#### TC-VAL-001: Required Field Validation on Save
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-001 |
| **Test Scenario** | Verify saving a form with empty required fields shows inline errors |
| **Pre-conditions** | User has opened the "Add New" slide-over panel |
| **Test Steps** | 1. Leave the "Name" field empty (Name is required on all master pages)<br>2. Click Save |
| **Expected Result** | Form is not submitted. Red error message "Name is required" appears below the Name field. Error toast "Please fix the errors before saving" is displayed. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-VAL-002: Mandatory Field Highlighting
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-002 |
| **Test Scenario** | Verify mandatory fields are visually marked when the form opens |
| **Pre-conditions** | User opens the Add New or Edit panel |
| **Test Steps** | 1. Open the "Add New" panel<br>2. Observe the form field labels |
| **Expected Result** | Required fields display a red asterisk (*) next to the label. Non-required fields do not have the asterisk. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-VAL-003: Inline Validation Error Display
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-003 |
| **Test Scenario** | Verify validation errors appear directly below the relevant field |
| **Pre-conditions** | User is in the form panel |
| **Test Steps** | 1. Leave a required field empty<br>2. Click Save<br>3. Observe where the error appears |
| **Expected Result** | The error message appears directly below the invalid field in red text. The field border turns red. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-VAL-004: Error Clears on Field Edit
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-004 |
| **Test Scenario** | Verify the validation error for a field disappears when the user starts editing it |
| **Pre-conditions** | A validation error is displayed for a field |
| **Test Steps** | 1. Trigger a validation error (e.g., leave Name empty and save)<br>2. Start typing in the Name field |
| **Expected Result** | The error message below the field disappears as soon as the user types. The field border returns to normal. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-VAL-005: Form Values Retained After Validation Error
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-005 |
| **Test Scenario** | Verify entered values are kept after a validation error prevents saving |
| **Pre-conditions** | User is in the Add New panel |
| **Test Steps** | 1. Fill in multiple fields (some valid, some invalid)<br>2. Click Save (validation fails)<br>3. Observe all field values |
| **Expected Result** | All previously entered values remain in their respective fields. Only the invalid fields show errors. User does not need to re-enter data. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-VAL-006: GSTIN Format Validation
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-006 |
| **Test Scenario** | Verify GSTIN format is validated in real time |
| **Pre-conditions** | User is on a page with GSTIN field (Company page) |
| **Test Steps** | 1. Open Add New panel<br>2. Enter an invalid GSTIN: "12345"<br>3. Click Save |
| **Expected Result** | Validation error "Invalid GSTIN format" is displayed below the GSTIN field. Form is not saved. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-VAL-007: GSTIN Valid Format Accepted
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-007 |
| **Test Scenario** | Verify a valid GSTIN is accepted without errors |
| **Pre-conditions** | User is on a page with GSTIN field |
| **Test Steps** | 1. Enter a valid GSTIN: "27ABCDE1234F1Z5"<br>2. Fill all other required fields<br>3. Click Save |
| **Expected Result** | No GSTIN validation error. Form saves successfully. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-VAL-008: PAN Format Validation
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-008 |
| **Test Scenario** | Verify PAN format is validated in real time |
| **Pre-conditions** | User is on a page with PAN field |
| **Test Steps** | 1. Enter an invalid PAN: "ABCDE12345"<br>2. Click Save |
| **Expected Result** | Validation error "Invalid PAN format" is displayed below the PAN field. Form is not saved. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-VAL-009: PAN Valid Format Accepted
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-009 |
| **Test Scenario** | Verify a valid PAN is accepted without errors |
| **Pre-conditions** | User is on a page with PAN field |
| **Test Steps** | 1. Enter a valid PAN: "ABCDE1234F"<br>2. Fill all other required fields<br>3. Click Save |
| **Expected Result** | No PAN validation error. Form saves successfully. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

---

## 7. Forms / Slide-over Panels - UX

#### TC-FORM-001: Unsaved Changes Warning
| Field | Value |
|-------|-------|
| **Test ID** | TC-FORM-001 |
| **Test Scenario** | Verify a warning dialog appears when closing the panel with unsaved changes |
| **Pre-conditions** | User is in the Add New or Edit panel |
| **Test Steps** | 1. Modify any field (e.g., type in the Name field)<br>2. Click the X button or click outside the panel |
| **Expected Result** | A confirmation dialog appears: "Unsaved Changes - You have unsaved changes. Are you sure you want to close the panel?" with "Discard & Close" and "Keep Editing" buttons. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-FORM-002: Keep Editing (Unsaved Warning)
| Field | Value |
|-------|-------|
| **Test ID** | TC-FORM-002 |
| **Test Scenario** | Verify "Keep Editing" keeps the panel open with data intact |
| **Pre-conditions** | Unsaved changes warning dialog is showing |
| **Test Steps** | 1. Click "Keep Editing" button on the unsaved changes dialog |
| **Expected Result** | The warning dialog closes. The form panel remains open. All entered data is preserved. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-FORM-003: Discard and Close (Unsaved Warning)
| Field | Value |
|-------|-------|
| **Test ID** | TC-FORM-003 |
| **Test Scenario** | Verify "Discard & Close" closes the panel and discards changes |
| **Pre-conditions** | Unsaved changes warning dialog is showing |
| **Test Steps** | 1. Click "Discard & Close" button on the unsaved changes dialog |
| **Expected Result** | Both the warning dialog and the form panel close. Changes are discarded. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-FORM-004: Reset Form Button
| Field | Value |
|-------|-------|
| **Test ID** | TC-FORM-004 |
| **Test Scenario** | Verify the Reset button restores the form to its original state |
| **Pre-conditions** | User is in the Edit panel with a record loaded |
| **Test Steps** | 1. Modify several fields<br>2. Click the "Reset" button |
| **Expected Result** | All fields revert to their original values (the values when the panel was opened). Form errors are cleared. Dirty state is reset. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-FORM-005: Reset Form in Add New Mode
| Field | Value |
|-------|-------|
| **Test ID** | TC-FORM-005 |
| **Test Scenario** | Verify Reset in Add New mode clears all fields to empty defaults |
| **Pre-conditions** | User is in the Add New panel |
| **Test Steps** | 1. Fill in several fields<br>2. Click "Reset" |
| **Expected Result** | All fields are cleared to their empty/default values. Form errors are cleared. |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-FORM-006: Status Toggle in Form
| Field | Value |
|-------|-------|
| **Test ID** | TC-FORM-006 |
| **Test Scenario** | Verify the status toggle switch works in the form panel |
| **Pre-conditions** | User is in the Add New or Edit panel |
| **Test Steps** | 1. Click the status toggle switch |
| **Expected Result** | Toggle switches between Active (green) and Inactive (gray). The label text updates accordingly. |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-FORM-007: Form Save Success and Panel Close
| Field | Value |
|-------|-------|
| **Test ID** | TC-FORM-007 |
| **Test Scenario** | Verify successful save closes the panel and refreshes the list |
| **Pre-conditions** | User is in the form with valid data |
| **Test Steps** | 1. Fill all required fields with valid data<br>2. Click Save |
| **Expected Result** | Save button shows "Saving..." briefly. Success toast is displayed. Panel closes. Table refreshes with the new/updated record. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

---

## 8. Data Integrity

#### TC-DATA-001: Duplicate Record Detection on Create
| Field | Value |
|-------|-------|
| **Test ID** | TC-DATA-001 |
| **Test Scenario** | Verify creating a record with a duplicate name is blocked |
| **Pre-conditions** | A record with name "Test Item" exists |
| **Test Steps** | 1. Open Add New panel<br>2. Enter "Test Item" as the name (same as existing)<br>3. Fill other required fields<br>4. Click Save |
| **Expected Result** | Save is blocked. Error toast displays "A [Entity] with this name already exists". Record is not created. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-DATA-002: Duplicate Record Detection on Update
| Field | Value |
|-------|-------|
| **Test ID** | TC-DATA-002 |
| **Test Scenario** | Verify updating a record to match another record's name is blocked |
| **Pre-conditions** | Two records exist: "Item A" and "Item B" |
| **Test Steps** | 1. Edit "Item B"<br>2. Change its name to "Item A"<br>3. Click Save |
| **Expected Result** | Save is blocked. Error toast displays duplicate message. Original record is not modified. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-DATA-003: Same Record Update Allowed
| Field | Value |
|-------|-------|
| **Test ID** | TC-DATA-003 |
| **Test Scenario** | Verify saving a record with its own name is allowed (not treated as duplicate) |
| **Pre-conditions** | A record named "Item A" exists |
| **Test Steps** | 1. Edit "Item A"<br>2. Keep the name as "Item A" (or modify other fields)<br>3. Click Save |
| **Expected Result** | Save succeeds. No duplicate error. Record is updated. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-DATA-004: Backend Duplicate Check Endpoint
| Field | Value |
|-------|-------|
| **Test ID** | TC-DATA-004 |
| **Test Scenario** | Verify the /check-duplicate API endpoint correctly detects duplicates |
| **Pre-conditions** | Backend server is running, a record exists |
| **Test Steps** | 1. Send POST to `/api/{endpoint}/check-duplicate` with body matching an existing record |
| **Expected Result** | Response: `{ "isDuplicate": true, "message": "A [Entity] with this name already exists", "existing": { ... } }` |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-DATA-005: Backend Returns Proper Validation Errors
| Field | Value |
|-------|-------|
| **Test ID** | TC-DATA-005 |
| **Test Scenario** | Verify backend returns meaningful validation messages with correct HTTP status codes |
| **Pre-conditions** | Backend server is running |
| **Test Steps** | 1. Send POST to create a record without a name<br>2. Observe the response |
| **Expected Result** | HTTP 400 with `{ "error": "[Entity] name is required" }` |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-DATA-006: Backend Returns 409 for Duplicates
| Field | Value |
|-------|-------|
| **Test ID** | TC-DATA-006 |
| **Test Scenario** | Verify backend returns HTTP 409 Conflict for duplicate entries |
| **Pre-conditions** | Backend server is running, a record exists |
| **Test Steps** | 1. Send POST to create a record with a name that already exists |
| **Expected Result** | HTTP 409 with `{ "error": "A [Entity] with this name already exists" }` |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

---

## 9. Audit Information

#### TC-AUDIT-001: Audit Section in Edit Panel
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUDIT-001 |
| **Test Scenario** | Verify the Audit Information section is available in the edit panel |
| **Pre-conditions** | At least one record exists |
| **Test Steps** | 1. Open a record in the edit panel<br>2. Scroll to the bottom of the form<br>3. Observe the "Audit Information" toggle |
| **Expected Result** | An "Audit Information" collapsible section is visible at the bottom of the form (edit mode only) |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-AUDIT-002: Expand Audit Information
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUDIT-002 |
| **Test Scenario** | Verify clicking Audit Information expands to show audit details |
| **Pre-conditions** | User is in edit panel, audit section is collapsed |
| **Test Steps** | 1. Click "Audit Information" toggle |
| **Expected Result** | Section expands showing: Created By, Created Date, Updated By, Updated Date in a grid layout |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-AUDIT-003: Audit Created Date Display
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUDIT-003 |
| **Test Scenario** | Verify the Created Date is displayed in readable format |
| **Pre-conditions** | A record with a created_at timestamp exists |
| **Test Steps** | 1. Open the record in edit mode<br>2. Expand Audit Information |
| **Expected Result** | Created Date is displayed in a human-readable format (e.g., "7/11/2026, 3:30:00 PM") |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-AUDIT-004: Audit Updated After Edit
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUDIT-004 |
| **Test Scenario** | Verify the Updated Date changes after a record is edited |
| **Pre-conditions** | A record exists with a known updated date |
| **Test Steps** | 1. Note the current Updated Date in audit info<br>2. Save a change to the record<br>3. Reopen the record and check audit info |
| **Expected Result** | The Updated Date reflects the timestamp of the recent edit (later than the previous value) |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-AUDIT-005: Audit Not Shown in Add New Mode
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUDIT-005 |
| **Test Scenario** | Verify audit information is not displayed when creating a new record |
| **Pre-conditions** | User opens the Add New panel |
| **Test Steps** | 1. Open Add New panel<br>2. Scroll to the bottom of the form |
| **Expected Result** | No Audit Information section is shown (it only appears in edit mode for existing records) |
| **Priority** | Low |
| **Status** | [ ] Pass [ ] Fail |

#### TC-AUDIT-006: Audit API Endpoint
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUDIT-006 |
| **Test Scenario** | Verify the /audit API endpoint returns audit data |
| **Pre-conditions** | Backend server is running, a record exists |
| **Test Steps** | 1. Send GET to `/api/{endpoint}/{id}/audit` |
| **Expected Result** | Response: `{ "data": { "id": ..., "code": ..., "name": ..., "created_by": ..., "created_at": ..., "updated_by": ..., "updated_at": ..., "deleted_at": ... } }` |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

## 10. Soft Delete / Archive

#### TC-ARCHIVE-001: Soft Delete (Archive) Record
| Field | Value |
|-------|-------|
| **Test ID** | TC-ARCHIVE-001 |
| **Test Scenario** | verify deleting a record archives it (soft delete) instead of permanent deletion |
| **Pre-conditions** | At least one record exists |
| **Test Steps** | 1. Click the trash icon on a row<br>2. Confirm in the dialog |
| **Expected Result** | Record is archived (soft deleted). Success toast shows "archived successfully". Record disappears from the active list. Archived count in header increases. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ARCHIVE-002: View Archived Toggle
| Field | Value |
|-------|-------|
| **Test ID** | TC-ARCHIVE-002 |
| **Test Scenario** | Verify the archived toggle button shows archived records |
| **Pre-conditions** | At least one archived record exists |
| **Test Steps** | 1. Click the "Archived: N" button in the header area |
| **Expected Result** | Button changes to active state (amber color, "Viewing Archived" text). Table shows archived records instead of active ones. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ARCHIVE-003: Restore Archived Record
| Field | Value |
|-------|-------|
| **Test ID** | TC-ARCHIVE-003 |
| **Test Scenario** | Verify an archived record can be restored |
| **Pre-conditions** | User is viewing archived records |
| **Test Steps** | 1. Click the restore icon (circular arrow) on an archived row<br>2. Observe the result |
| **Expected Result** | Record is restored to active status. Success toast shows "restored successfully". Record disappears from archived list. Archived count decreases. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ARCHIVE-004: Archived Records Show Different Actions
| Field | Value |
|-------|-------|
| **Test ID** | TC-ARCHIVE-004 |
| **Test Scenario** | Verify archived records show Restore instead of Delete in the actions column |
| **Pre-conditions** | User is viewing archived records |
| **Test Steps** | 1. Observe the action buttons for rows in archived view |
| **Expected Result** | Each row shows a restore icon (circular arrow) instead of the trash icon. No delete button is shown. |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ARCHIVE-005: Toggle Back to Active View
| Field | Value |
|-------|-------|
| **Test ID** | TC-ARCHIVE-005 |
| **Test Scenario** | Verify clicking the archived toggle again returns to the active view |
| **Pre-conditions** | User is currently viewing archived records |
| **Test Steps** | 1. Click the "Viewing Archived" button |
| **Expected Result** | Button returns to normal state. Table shows active (non-archived) records again. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ARCHIVE-006: Archived Count in Header
| Field | Value |
|-------|-------|
| **Test ID** | TC-ARCHIVE-006 |
| **Test Scenario** | Verify the archived count is displayed in the header area |
| **Pre-conditions** | At least one archived record exists |
| **Test Steps** | 1. Navigate to a master page<br>2. Observe the header area next to the total count |
| **Expected Result** | An "Archived: N" button is displayed showing the count of archived records (where N is the number of soft-deleted records) |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ARCHIVE-007: Archived Button Hidden When No Archives
| Field | Value |
|-------|-------|
| **Test ID** | TC-ARCHIVE-007 |
| **Test Scenario** | Verify the archived toggle button is not shown when there are no archived records |
| **Pre-conditions** | No records have been archived |
| **Test Steps** | 1. Navigate to a master page with no archived records |
| **Expected Result** | The "Archived" toggle button is not displayed in the header area |
| **Priority** | Low |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ARCHIVE-008: Soft Delete API Sets deleted_at
| Field | Value |
|-------|-------|
| **Test ID** | TC-ARCHIVE-008 |
| **Test Scenario** | Verify the DELETE API sets deleted_at instead of removing the row |
| **Pre-conditions** | Backend server running, record exists in database |
| **Test Steps** | 1. Send DELETE to `/api/{endpoint}/{id}`<br>2. Query the database directly: `SELECT * FROM {table} WHERE id = {id}` |
| **Expected Result** | HTTP 200 success response. Database row still exists with `deleted_at` set to current timestamp and `status` set to 'Inactive'. Row is NOT permanently deleted. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-ARCHIVE-009: Restore API Clears deleted_at
| Field | Value |
|-------|-------|
| **Test ID** | TC-ARCHIVE-009 |
| **Test Scenario** | Verify the restore API clears deleted_at and sets status to Active |
| **Pre-conditions** | A record is archived (deleted_at is set) |
| **Test Steps** | 1. Send POST to `/api/{endpoint}/{id}/restore`<br>2. Query the database: `SELECT * FROM {table} WHERE id = {id}` |
| **Expected Result** | HTTP 200 success. Database row has `deleted_at` set to NULL and `status` set to 'Active'. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

---

## 11. User Experience

#### TC-UX-001: Empty State Illustration
| Field | Value |
|-------|-------|
| **Test ID** | TC-UX-001 |
| **Test Scenario** | Verify an attractive empty state is shown when no data exists |
| **Pre-conditions** | Master page has no records (fresh table or all archived) |
| **Test Steps** | 1. Navigate to a master page with no records |
| **Expected Result** | An empty state illustration is displayed with an icon, "No records found" title, "Add a new [entity] to get started" message, and an "Add [Entity]" button |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-UX-002: Empty State Add Action
| Field | Value |
|-------|-------|
| **Test ID** | TC-UX-002 |
| **Test Scenario** | Verify the empty state's Add button opens the form panel |
| **Pre-conditions** | Empty state is displayed |
| **Test Steps** | 1. Click the "Add [Entity]" button in the empty state |
| **Expected Result** | The Add New slide-over panel opens |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-UX-003: Refresh Button
| Field | Value |
|-------|-------|
| **Test ID** | TC-UX-003 |
| **Test Scenario** | Verify the refresh button reloads the latest data |
| **Pre-conditions** | User is on any master page |
| **Test Steps** | 1. Click the refresh icon in the toolbar |
| **Expected Result** | Data is reloaded from the server. A "Data refreshed" info toast appears briefly. The refresh icon spins during loading. |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-UX-004: Ctrl+N Keyboard Shortcut
| Field | Value |
|-------|-------|
| **Test ID** | TC-UX-004 |
| **Test Scenario** | Verify Ctrl+N opens the Add New panel |
| **Pre-conditions** | User is on any master page, no panel is open |
| **Test Steps** | 1. Press Ctrl+N (or Cmd+N on Mac) |
| **Expected Result** | The Add New slide-over panel opens. The default browser "new window" action is prevented. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-UX-005: Ctrl+N Does Not Open When Panel Is Open
| Field | Value |
|-------|-------|
| **Test ID** | TC-UX-005 |
| **Test Scenario** | Verify Ctrl+N does not open a second panel when one is already open |
| **Pre-conditions** | A form panel is already open |
| **Test Steps** | 1. With the panel open, press Ctrl+N |
| **Expected Result** | No new panel opens. The existing panel remains unaffected. |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-UX-006: Loading Skeletons
| Field | Value |
|-------|-------|
| **Test ID** | TC-UX-006 |
| **Test Scenario** | Verify skeleton loaders are displayed while fetching data |
| **Pre-conditions** | User is on a master page |
| **Test Steps** | 1. Navigate to a master page or click Refresh<br>2. Observe the table during data loading |
| **Expected Result** | Animated skeleton rows (gray pulsing placeholders) are shown in the table body while data is being fetched. Real data replaces skeletons once loaded. |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-UX-007: Total Record Count Display
| Field | Value |
|-------|-------|
| **Test ID** | TC-UX-007 |
| **Test Scenario** | Verify the total record count is displayed in the header |
| **Pre-conditions** | Records exist on a master page |
| **Test Steps** | 1. Navigate to a master page<br>2. Observe the header area |
| **Expected Result** | A "Total: N" badge is displayed showing the total count of active records |
| **Priority** | Low |
| **Status** | [ ] Pass [ ] Fail |

#### TC-UX-008: Pagination Info Text
| Field | Value |
|-------|-------|
| **Test ID** | TC-UX-008 |
| **Test Scenario** | Verify the pagination section shows the correct range info |
| **Pre-conditions** | More than 10 records exist, user is on page 1 with 10 per page |
| **Test Steps** | 1. Observe the bottom-left of the table |
| **Expected Result** | Text shows "Showing 1-10 of N" where N is the total record count. When on page 2, it shows "Showing 11-20 of N". |
| **Priority** | Low |
| **Status** | [ ] Pass [ ] Fail |

#### TC-UX-009: Responsive Mobile Card View
| Field | Value |
|-------|-------|
| **Test ID** | TC-UX-009 |
| **Test Scenario** | Verify the table switches to card view on mobile screens |
| **Pre-conditions** | User is on a mobile viewport (375px width) |
| **Test Steps** | 1. Resize browser to mobile width<br>2. Navigate to a master page with records |
| **Expected Result** | Records are displayed as cards (not a table) with key fields visible. Each card has edit, duplicate, and delete/restore actions. |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

## 12. Accessibility

#### TC-A11Y-001: Keyboard Navigation - Arrow Keys in Table
| Field | Value |
|-------|-------|
| **Test ID** | TC-A11Y-001 |
| **Test Scenario** | Verify arrow keys navigate through table rows |
| **Pre-conditions** | Table has multiple rows, user is focused on the table |
| **Test Steps** | 1. Click on the table to focus it<br>2. Press Arrow Down key<br>3. Press Arrow Down again<br>4. Press Arrow Up |
| **Expected Result** | Down arrow moves focus to the next row (highlighted with blue ring). Up arrow moves to the previous row. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-A11Y-002: Keyboard Navigation - Enter Opens Edit
| Field | Value |
|-------|-------|
| **Test ID** | TC-A11Y-002 |
| **Test Scenario** | Verify pressing Enter on a focused row opens the edit panel |
| **Pre-conditions** | A row is highlighted via keyboard navigation |
| **Test Steps** | 1. Use arrow keys to highlight a row<br>2. Press Enter |
| **Expected Result** | The edit slide-over panel opens with the focused row's data |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-A11Y-003: ARIA Labels on Action Buttons
| Field | Value |
|-------|-------|
| **Test ID** | TC-A11Y-003 |
| **Test Scenario** | Verify all action buttons have proper ARIA labels |
| **Pre-conditions** | User is on a master page |
| **Test Steps** | 1. Inspect the edit, duplicate, delete, and status toggle buttons in the Actions column<br>2. Check for aria-label attributes |
| **Expected Result** | Each button has a descriptive aria-label (e.g., "Edit UOM", "Duplicate UOM", "Toggle status: Active", "Archive") |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-A11Y-004: ARIA Label on Search Clear Button
| Field | Value |
|-------|-------|
| **Test ID** | TC-A11Y-004 |
| **Test Scenario** | Verify the search clear (X) button has an ARIA label |
| **Pre-conditions** | User has typed text in the search field |
| **Test Steps** | 1. Type in the search field<br>2. Inspect the X button that appears |
| **Expected Result** | The X button has `aria-label="Clear search"` |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-A11Y-005: ARIA Label on Checkboxes
| Field | Value |
|-------|-------|
| **Test ID** | TC-A11Y-005 |
| **Test Scenario** | Verify row and header checkboxes have ARIA labels |
| **Pre-conditions** | User is on a master page with records |
| **Test Steps** | 1. Inspect the header checkbox and any row checkbox |
| **Expected Result** | Header checkbox has `aria-label="Select all rows"`. Row checkboxes have `aria-label="Select row N"` (where N is the row number). |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-A11Y-006: Focus Trapping in Slide-over Panel
| Field | Value |
|-------|-------|
| **Test ID** | TC-A11Y-006 |
| **Test Scenario** Verify Tab key cycles within the slide-over panel | |
| **Pre-conditions** | The slide-over form panel is open |
| **Test Steps** | 1. Open the Add New panel<br>2. Press Tab repeatedly to cycle through focusable elements<br>3. Press Shift+Tab to cycle backwards |
| **Expected Result** | Focus remains trapped inside the panel. Tabbing from the last focusable element moves focus to the first. Shift+Tab from the first element moves to the last. Focus does not leave the panel. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-A11Y-007: Auto-Focus First Field in Panel
| Field | Value |
|-------|-------|
| **Test ID** | TC-A11Y-007 |
| **Test Scenario** | Verify the first input field is auto-focused when the panel opens |
| **Pre-conditions** | User is on a master page |
| **Test Steps** | 1. Click "Add [Entity]" to open the panel<br>2. Observe which element has focus |
| **Expected Result** | The first input field in the form is automatically focused within ~100ms of the panel opening |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-A11Y-008: Status Toggle ARIA
| Field | Value |
|-------|-------|
| **Test ID** | TC-A11Y-008 |
| **Test Scenario** | Verify the status toggle switch has proper ARIA attributes |
| **Pre-conditions** | User is in the form panel |
| **Test Steps** | 1. Inspect the status toggle switch element |
| **Expected Result** | The toggle has `role="switch"`, `aria-checked` reflecting current state, and `aria-label="Toggle status"` |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-A11Y-009: Dialog ARIA Attributes
| Field | Value |
|-------|-------|
| **Test ID** | TC-A11Y-009 |
| **Test Scenario** | Verify the slide-over panel has proper dialog ARIA attributes |
| **Pre-conditions** | User opens the form panel |
| **Test Steps** | 1. Inspect the slide-over panel container element |
| **Expected Result** | The panel has `role="dialog"`, `aria-modal="true"`, and `aria-label` describing the dialog (e.g., "New UOM" or "Edit UOM") |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

## 13. Backend APIs

#### TC-API-001: List with Search and Pagination
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-001 |
| **Test Scenario** | Verify the list API supports search, pagination, and sorting |
| **Pre-conditions** | Backend server is running with data |
| **Test Steps** | 1. Send GET to `/api/{endpoint}?search=test&page=1&limit=10&sortBy=name&sortOrder=asc` |
| **Expected Result** | Response: `{ "data": [...], "total": N, "page": 1, "limit": 10, "totalPages": M }`. Results are filtered by search, sorted by name ascending, paginated to 10 per page. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-002: List Excludes Archived by Default
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-002 |
| **Test Scenario** | Verify the list API excludes soft-deleted records by default |
| **Pre-conditions** | At least one archived record exists |
| **Test Steps** | 1. Send GET to `/api/{endpoint}` without includeArchived param |
| **Expected Result** | Response data does not include records where `deleted_at` is not null |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-003: List with includeArchived Param
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-003 |
| **Test Scenario** | Verify includeArchived=true returns all records including archived |
| **Pre-conditions** | At least one archived record exists |
| **Test Steps** | 1. Send GET to `/api/{endpoint}?includeArchived=true` |
| **Expected Result** | Response data includes both active and archived records |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-004: Create with Audit Fields
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-004 |
| **Test Scenario** | Verify creating a record sets the created_by field |
| **Pre-conditions** | Authenticated user, backend running |
| **Test Steps** | 1. Send POST to `/api/{endpoint}` with valid data and auth token<br>2. Query the created record |
| **Expected Result** | Record is created with `created_by` set to the authenticated user's ID |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-005: Update with Audit Fields
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-005 |
| **Test Scenario** | Verify updating a record sets the updated_by field |
| **Pre-conditions** | Authenticated user, record exists |
| **Test Steps** | 1. Send PUT to `/api/{endpoint}/{id}` with modified data and auth token<br>2. Query the record |
| **Expected Result** | Record is updated with `updated_by` set to the authenticated user's ID and `updated_at` set to current timestamp |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-006: Bulk Delete API
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-006 |
| **Test Scenario** | Verify the bulk-delete endpoint soft-deletes multiple records |
| **Pre-conditions** | Multiple records exist |
| **Test Steps** | 1. Send POST to `/api/{endpoint}/bulk-delete` with `{ "ids": [1, 2, 3] }` |
| **Expected Result** | HTTP 200 with `{ "data": { "count": 3 }, "message": "3 [Entity](s) archived successfully!" }`. All 3 records have `deleted_at` set in the database. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-007: Bulk Status Update API
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-007 |
| **Test Scenario** | Verify the bulk-status endpoint updates status for multiple records |
| **Pre-conditions** | Multiple records exist |
| **Test Steps** | 1. Send POST to `/api/{endpoint}/bulk-status` with `{ "ids": [1, 2], "status": "Inactive" }` |
| **Expected Result** | HTTP 200 with count of updated records. Both records have status set to 'Inactive' in the database. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-008: Bulk Status Invalid Value
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-008 |
| **Test Scenario** | Verify bulk-status rejects invalid status values |
| **Pre-conditions** | Backend running |
| **Test Steps** | 1. Send POST to `/api/{endpoint}/bulk-status` with `{ "ids": [1], "status": "Deleted" }` |
| **Expected Result** | HTTP 400 with `{ "error": "status must be Active or Inactive" }` |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-009: Duplicate Record API
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-009 |
| **Test Scenario** | Verify the duplicate endpoint creates a copy of a record |
| **Pre-conditions** | A record exists |
| **Test Steps** | 1. Send POST to `/api/{endpoint}/{id}/duplicate` |
| **Expected Result** | HTTP 201 with new record ID and code. New record has "(Copy)" appended to name. Original record is unchanged. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-010: Duplicate Non-Existent Record
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-010 |
| **Test Scenario** | Verify duplicating a non-existent record returns 404 |
| **Pre-conditions** | Backend running |
| **Test Steps** | 1. Send POST to `/api/{endpoint}/99999/duplicate` |
| **Expected Result** | HTTP 404 with `{ "error": "[Entity] not found" }` |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-011: Stats Endpoint
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-011 |
| **Test Scenario** | Verify the stats endpoint returns correct counts |
| **Pre-conditions** | Records exist (some active, some inactive, some archived) |
| **Test Steps** | 1. Send GET to `/api/{endpoint}/stats` |
| **Expected Result** | Response: `{ "data": { "total": N, "active": A, "inactive": I, "archived": R } }` where counts are accurate |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-012: Dropdown Endpoint
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-012 |
| **Test Scenario** | Verify the dropdown endpoint returns active records for dropdowns |
| **Pre-conditions** | Active and inactive records exist |
| **Test Steps** | 1. Send GET to `/api/{endpoint}/dropdown` |
| **Expected Result** | Response contains only active (non-archived) records, sorted by name ascending |
| **Priority** | Low |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-013: Delete Referenced Record
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-013 |
| **Test Scenario** | Verify deleting a record referenced by another table returns a meaningful error |
| **Pre-conditions** | A record is referenced by another table (e.g., UOM is used by a Product) |
| **Test Steps** | 1. Send DELETE to `/api/{endpoint}/{id}` for the referenced record |
| **Expected Result** | HTTP 400 with `{ "error": "Cannot delete this [Entity]. It is being referenced in [ReferencingTable]." }` |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-014: Backward Compatibility - Existing Endpoints
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-014 |
| **Test Scenario** | Verify existing API endpoints still work with the same response shapes |
| **Pre-conditions** | Backend running |
| **Test Steps** | 1. GET `/api/{endpoint}` - list works<br>2. GET `/api/{endpoint}/{id}` - get one works<br>3. POST `/api/{endpoint}` - create works<br>4. PUT `/api/{endpoint}/{id}` - update works<br>5. DELETE `/api/{endpoint}/{id}` - delete works (now soft delete) |
| **Expected Result** | All existing endpoints respond with the same response structure as before. No breaking changes to response shapes. |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-015: Invalid ID Returns 400
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-015 |
| **Test Scenario** | Verify invalid ID parameter returns 400 |
| **Pre-conditions** | Backend running |
| **Test Steps** | 1. Send GET to `/api/{endpoint}/abc` (non-numeric ID) |
| **Expected Result** | HTTP 400 with `{ "error": "Invalid ID parameter" }` |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

#### TC-API-016: Empty IDs Array in Bulk Operation
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-016 |
| **Test Scenario** | Verify bulk operations reject empty or missing ids array |
| **Pre-conditions** | Backend running |
| **Test Steps** | 1. Send POST to `/api/{endpoint}/bulk-delete` with `{ }` (no ids) |
| **Expected Result** | HTTP 400 with `{ "error": "ids array is required" }` |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

## 14. Database Migration

#### TC-DB-001: Migration 004 Applies Successfully
| Field | Value |
|-------|-------|
| **Test ID** | TC-DB-001 |
| **Test Scenario** | Verify migration 004 adds audit and soft-delete columns to all master tables |
| **Pre-conditions** | Database exists with tables from original schema |
| **Test Steps** | 1. Run migration `004_audit_softdelete_bulk.sql` against the database<br>2. Check table structures |
| **Expected Result** | All master tables (product_categories, leather_types, uom, thickness, standard_sizes, colors, finish_types, grades, hsn_codes, process_stages, machines, roles, companies, business_units, customers, suppliers, products, materials) now have `created_by`, `updated_by`, and `deleted_at` columns |
| **Priority** | Critical |
| **Status** | [ ] Pass [ ] Fail |

#### TC-DB-002: Migration Is Idempotent
| Field | Value |
|-------|-------|
| **Test ID** | TC-DB-002 |
| **Test Scenario** | Verify migration 004 can be run multiple times without errors |
| **Pre-conditions** | Migration 004 has already been applied once |
| **Test Steps** | 1. Run migration `004_audit_softdelete_bulk.sql` a second time |
| **Expected Result** | Migration completes without errors. No duplicate columns are created. Existing data is preserved. |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-DB-003: Materials Table Gets Status Column
| Field | Value |
|-------|-------|
| **Test ID** | TC-DB-003 |
| **Test Scenario** | Verify the materials table receives a status column (it previously lacked one) |
| **Pre-conditions** | Migration 004 applied |
| **Test Steps** | 1. Check the materials table structure |
| **Expected Result** | Materials table now has a `status` ENUM('Active','Inactive') column with default 'Active' |
| **Priority** | High |
| **Status** | [ ] Pass [ ] Fail |

#### TC-DB-004: Deleted_at Indexes Created
| Field | Value |
|-------|-------|
| **Test ID** | TC-DB-004 |
| **Test Scenario** | Verify index on deleted_at column exists for query optimization |
| **Pre-conditions** | Migration 004 applied |
| **Test Steps** | 1. Check indexes on master tables (e.g., `SHOW INDEX FROM uom`) |
| **Expected Result** | Each master table has an index on the `deleted_at` column (e.g., `idx_uom_deleted`) |
| **Priority** | Medium |
| **Status** | [ ] Pass [ ] Fail |

---

## 15. Regression Checklist

Verify that existing functionality is not broken after the improvements. Run these on at least 3 master pages (e.g., UOM, Color, HSN Code).

| # | Check | Status |
|---|-------|--------|
| 1 | Page loads without JavaScript errors in console | [ ] Pass [ ] Fail |
| 2 | Existing records display correctly in the table | [ ] Pass [ ] Fail |
| 3 | Create new record works as before | [ ] Pass [ ] Fail |
| 4 | Edit existing record works as before | [ ] Pass [ ] Fail |
| 5 | Delete (now archive) still removes record from active view | [ ] Pass [ ] Fail |
| 6 | Export to Excel produces correct file | [ ] Pass [ ] Fail |
| 7 | Export PDF preview opens in new tab | [ ] Pass [ ] Fail |
| 8 | Export PDF download saves file correctly | [ ] Pass [ ] Fail |
| 9 | Status field displays correctly (Active/Inactive) | [ ] Pass [ ] Fail |
| 10 | Navigation between pages works (sidebar menu) | [ ] Pass [ ] Fail |
| 11 | Pagination navigation (next/previous/page numbers) works | [ ] Pass [ ] Fail |
| 12 | Form fields display correct types (text, textarea, select, date) | [ ] Pass [ ] Fail |
| 13 | Auto-generated codes work for new records | [ ] Pass [ ] Fail |
| 14 | Existing API endpoints return same response structure | [ ] Pass [ ] Fail |
| 15 | No TypeScript build errors introduced | [ ] Pass [ ] Fail |
| 16 | No new runtime errors in browser console | [ ] Pass [ ] Fail |
| 17 | Mobile responsive layout works | [ ] Pass [ ] Fail |
| 18 | Authentication still works (login/logout) | [ ] Pass [ ] Fail |
| 19 | Sidebar navigation still functions | [ ] Pass [ ] Fail |
| 20 | Toast notifications appear for all actions | [ ] Pass [ ] Fail |

---

## Defect Severity Definitions

| Severity | Description | Examples |
|----------|-------------|----------|
| **Critical** | Blocks core functionality, no workaround | Create/Save fails, data loss, crash |
| **High** | Major feature broken, workaround exists | Search not working, validation fails incorrectly |
| **Medium** | Minor feature or UI issue | Misaligned element, missing tooltip |
| **Low** | Cosmetic or non-functional | Color mismatch, spacing issue |

---

## Test Execution Summary

| Category | Total | Passed | Failed | Blocked |
|----------|-------|--------|--------|---------|
| Search Improvements | 5 | | | |
| Filtering | 7 | | | |
| Row Selection & Bulk Actions | 11 | | | |
| Row Actions | 5 | | | |
| Sorting & Pagination | 6 | | | |
| Form Validation | 9 | | | |
| Form UX | 7 | | | |
| Data Integrity | 6 | | | |
| Audit Information | 6 | | | |
| Soft Delete / Archive | 9 | | | |
| User Experience | 9 | | | |
| Accessibility | 9 | | | |
| Backend APIs | 16 | | | |
| Database Migration | 4 | | | |
| Regression Checklist | 20 | | | |
| **TOTAL** | **129** | | | |

---

**End of Document**
