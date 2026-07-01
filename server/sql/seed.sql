USE tannery_mini_erp;

-- ============================================================
-- Seed Data
-- ============================================================

-- Customers
INSERT INTO customers (code, name, contact_person, phone, email, city, state, status, category, currency, billing_address, shipping_address, pin_code, gstin, pan, payment_terms, credit_limit, notes) VALUES
('CUST-00045','ABC Leather Exports','Mr. Rajesh Kumar','+91 98400 12345','rajesh@abcleather.com','Vellore','tamilnadu','Active','export','inr','No.12, Industrial Estate, Vellore - 632001, Tamil Nadu, India','No.12, Industrial Estate, Vellore - 632001, Tamil Nadu, India','632001','33AAACA1234A1Z5','AAACA1234A','30','5,00,000','Regular customer. High quality finishing required.'),
('CUST-00044','Global Leathers','Mr. Suresh Babu','+91 97900 56789','suresh@globalleathers.com','Chennai','tamilnadu','Active','domestic','inr','45, Anna Salai, Chennai - 600002',NULL,NULL,'33BBBCA5678B2Z3','BBBCA5678B','45','3,00,000',NULL),
('CUST-00043','Metro Footwear Pvt Ltd','Mr. Prakash M.','+91 97100 11122','prakash@metrofootwear.com','Ambur','tamilnadu','Active','export','usd','78, Leather Complex, Ambur',NULL,NULL,'33CCCDA9012C3Z4','CCCDA9012C','60','8,00,000',NULL),
('CUST-00042','Premium Leathers','Mr. Karthik R.','+91 94400 54321','karthik@premiumleathers.com','Ranipet','tamilnadu','Active','wholesale','inr','22, Industrial Area, Ranipet',NULL,NULL,NULL,NULL,'30','4,00,000',NULL),
('CUST-00041','Style Shoes Co.','Mr. Imran Khan','+91 98800 22233','imran@styleshoes.com','Mumbai','maharashtra','Inactive','domestic','inr','15, Dharavi Leather Market, Mumbai',NULL,NULL,NULL,NULL,'15','2,00,000',NULL),
('CUST-00040','Star Exports','Mr. Mohan Raj','+91 96000 33344','mohan@starexports.com','Bangalore','karnataka','Active','export','eur','99, Peenya Industrial Area, Bangalore',NULL,NULL,NULL,NULL,'45','6,00,000',NULL),
('CUST-00039','Royal Footwears','Mr. Vignesh','+91 97500 44455','vignesh@royalfootwears.com','Vellore','tamilnadu','Active','domestic','inr','34, Sathuvachari, Vellore',NULL,NULL,NULL,NULL,'30','3,50,000',NULL),
('CUST-00038','Classic Leathers','Mr. Arvind','+91 97890 55566','arvind@classicleathers.com','Chennai','tamilnadu','Active','export','usd','56, Chromepet, Chennai',NULL,NULL,NULL,NULL,'60','7,00,000',NULL),
('CUST-00037','Leather World','Mr. Naveen','+91 97901 66677','naveen@leatherworld.com','Ambur','tamilnadu','Active','wholesale','inr','11, Main Road, Ambur',NULL,NULL,NULL,NULL,'30','2,50,000',NULL),
('CUST-00036','National Exports','Mr. Ramesh','+91 98420 77788','ramesh@nationalexports.com','Ranipet','tamilnadu','Active','export','inr','67, SIPCOT, Ranipet',NULL,NULL,NULL,NULL,'45','5,50,000',NULL);

-- Products
INSERT INTO products (code, name, category, leather_type, uom, thickness, color, finish_type, description, standard_size, grade, sales_price, hsn_code, status) VALUES
('PRD-00018','Finished Leather - Black','Finished Leather','cow','Sq. Ft.','1.2 - 1.4 mm','Black','semi-aniline','Semi aniline finished leather, Black color','As per Customer Requirement','a',125.00,'4107','Active'),
('PRD-00017','Finished Leather - Brown','Finished Leather','cow','Sq. Ft.','1.2 - 1.4 mm','Brown','full-grain',NULL,NULL,'a',130.00,'4107','Active'),
('PRD-00016','Finished Leather - Tan','Finished Leather','cow','Sq. Ft.','1.0 - 1.2 mm','Tan','nappa',NULL,NULL,'a',140.00,'4107','Active'),
('PRD-00015','Suede Leather - Grey','Finished Leather','goat','Sq. Ft.','1.0 - 1.2 mm','Grey','suede',NULL,NULL,'b',110.00,'4107','Active'),
('PRD-00014','Nubuck Leather - Brown','Finished Leather','buffalo','Sq. Ft.','1.2 - 1.4 mm','Brown','full-grain',NULL,NULL,'a',150.00,'4107','Active'),
('PRD-00013','Patent Leather - Black','Finished Leather','cow','Sq. Ft.','1.0 - 1.2 mm','Black','full-grain',NULL,NULL,'a',160.00,'4107','Inactive'),
('PRD-00012','Pull Up Leather - Dark Brown','Finished Leather','cow','Sq. Ft.','1.2 - 1.4 mm','Dark Brown','pull-up',NULL,NULL,'a',135.00,'4107','Active'),
('PRD-00011','Crust Leather','Semi Finished','cow','Sq. Ft.','1.4 - 1.6 mm','Natural','semi-aniline',NULL,NULL,'b',85.00,'4104','Active'),
('PRD-00010','Wet Blue','Semi Finished','cow','Sq. Ft.','1.4 - 1.6 mm','Blue',NULL,NULL,NULL,'b',60.00,'4104','Active'),
('PRD-00009','Split Leather','Semi Finished','buffalo','Sq. Ft.','1.0 - 1.2 mm','Natural',NULL,NULL,NULL,'c',45.00,'4104','Active');

-- Suppliers
INSERT INTO suppliers (code, name, contact_person, phone, email, city, state, address, pincode, website, category, supply_type, gstin, pan, payment_terms, bank_name, bank_account, ifsc_code, notes, status) VALUES
('SUP-00021','Indian Chemical Co.','Mr. Suresh','+91 98410 54321','suresh@indchem.com','Chennai','Tamil Nadu','No.45, Chemical Complex, Chennai','600001','www.indchem.com','chemical','chemical','33AAACI2345C1Z1','AAACI2345C','30','HDFC Bank','50200012345678','HDFC0001234','Preferred supplier for chemicals.','Active'),
('SUP-00020','Sri Traders','Mr. Ravi','+91 97900 11223','ravi@sritraders.com','Coimbatore','Tamil Nadu','12, Industrial Area, Coimbatore','641001',NULL,'raw','raw','33BBBST5678D2Z2','BBBST5678D','45',NULL,NULL,NULL,NULL,'Active'),
('SUP-00019','Global Suppliers','Mr. Vignesh','+91 96000 33445','vignesh@globalsup.com','Mumbai','Maharashtra','78, Andheri East, Mumbai','400069',NULL,'finishing','finishing','27CCCGS9012E3Z3','CCCGS9012E','30',NULL,NULL,NULL,NULL,'Active'),
('SUP-00018','Value Chemicals','Mr. Karthik','+91 94400 66778','karthik@valuechem.com','Chennai','Tamil Nadu','34, Ambattur Ind. Estate, Chennai','600058',NULL,'chemical','chemical','33DDDVC3456F4Z4','DDDVC3456F','15',NULL,NULL,NULL,NULL,'Inactive'),
('SUP-00017','Star Enterprises','Mr. Mohan','+91 96000 77554','mohan@starent.com','Erode','Tamil Nadu','56, Textile Park, Erode','638001',NULL,'dye','dye','33EEESE7890G5Z5','EEESE7890G','30',NULL,NULL,NULL,NULL,'Active'),
('SUP-00016','Ambur Hides Corp','Mr. Arjun','+91 97500 88991','arjun@amburhides.com','Ambur','Tamil Nadu','23, Leather Complex, Ambur','635802',NULL,'raw','raw','33FFFAH1234H6Z6','FFFAH1234H','45',NULL,NULL,NULL,NULL,'Active'),
('SUP-00015','Ranipet Chemicals','Mr. Dinesh','+91 98420 22334','dinesh@ranipetchem.com','Ranipet','Tamil Nadu','99, SIPCOT, Ranipet','632401',NULL,'chemical','chemical','33GGGRC5678I7Z7','GGGRC5678I','30',NULL,NULL,NULL,NULL,'Active'),
('SUP-00014','Vellore Dye Works','Mr. Kumar','+91 94400 55667','kumar@velloredye.com','Vellore','Tamil Nadu','67, Sathuvachari, Vellore','632009',NULL,'dye','dye','33HHHVD9012J8Z8','HHHVD9012J','30',NULL,NULL,NULL,NULL,'Active');

-- Materials
INSERT INTO materials (code, name, uom, type) VALUES
('MAT-00052','Chrome Powder 33%','Kg','Chemical'),
('MAT-00051','Sodium Sulphide (60%)','Kg','Chemical'),
('MAT-00050','Formic Acid','Ltr','Chemical'),
('MAT-00049','Syntan A 10%','Kg','Chemical'),
('MAT-00047','Fatliquor DP','Ltr','Chemical'),
('MAT-00046','Acrylic Finishing Resin','Kg','Chemical'),
('MAT-00007','Dye - Black','Kg','Dye');

-- Supplier Pricing
INSERT INTO supplier_pricing (supplier_id, material_id, uom, price, valid_from, valid_to, status) VALUES
(1,1,'Kg',76.00,'2024-05-01','2024-05-31','Approved'),
(1,2,'Kg',62.00,'2024-05-01','2024-05-31','Approved'),
(1,3,'Ltr',28.00,'2024-05-01','2024-05-31','Approved'),
(1,4,'Kg',85.00,'2024-05-01','2024-05-31','Pending'),
(1,5,'Ltr',140.00,'2024-04-15','2024-04-30','Approved'),
(1,6,'Kg',120.00,'2024-04-15','2024-04-30','Approved');

-- Recipes
INSERT INTO recipes (code, name, leather_type, thickness, process_type, color, finish_type, uom, status, valid_from, valid_to, version, description) VALUES
('RC-00037','Black Finish - Cow (1.2-1.4mm)','cow','1.2-1.4','finishing','Black','semi-aniline','sqft','active','2024-05-01','2024-12-31',1,'Standard black finishing recipe for cow leather (1.2-1.4 mm). Provides even color, soft handle and good fastness.');

-- Recipe Items
INSERT INTO recipe_items (recipe_id, material_id, qty) VALUES
(1,1,0.110),
(1,2,0.075),
(1,3,0.050),
(1,4,0.100),
(1,5,0.140),
(1,7,0.020),
(1,6,0.030);

-- Recipe Process Stages
INSERT INTO recipe_process_stages (recipe_id, seq, process_stage, machine, duration, temperature, speed, qc_check, remarks) VALUES
(1,1,'Leather Inspection','Inspection Table',10,'Ambient','-','Visual Check','Check defects'),
(1,2,'Spray Base Coat','Spray Booth',15,'30','Medium','Coverage','Even coat'),
(1,3,'Drying','Tunnel Dryer',20,'65','-','Dryness','Until required dryness'),
(1,4,'Ironing','Ironing Machine',10,'95','Medium','Surface Finish','Smooth finish'),
(1,5,'Top Coat','Spray Booth',15,'30','Medium','Colour Match','Match sample'),
(1,6,'Final Drying','Dryer',25,'70','-','Moisture','Final dry'),
(1,7,'Final Inspection','QC Table',10,'Ambient','-','Final Approval','Ready for packing');

-- BOMs
INSERT INTO boms (code, name, product_id, recipe_id, leather_type, process_type, thickness, uom, valid_from, valid_to, status, description, version) VALUES
('BOM-00037','Black Finish - Cow (1.2-1.4mm)',1,1,'cow','finishing','1.2-1.4','sqft','2024-05-01','2024-12-31','Active','Standard finishing recipe for black finished leather. Suitable for cow leather thickness 1.2-1.4 mm. Provides smooth finish and good color fastness.',1);

-- BOM Items
INSERT INTO bom_items (bom_id, material_id, type, uom, qty, unit_cost, amount, remarks) VALUES
(1,1,'Chemical','Kg',0.110,76.00,8.36,'High quality chrome'),
(1,2,'Chemical','Kg',0.075,62.00,4.65,'--'),
(1,3,'Chemical','Ltr',0.050,28.00,1.40,'--'),
(1,4,'Chemical','Kg',0.100,95.00,9.50,'--'),
(1,5,'Chemical','Ltr',0.140,140.00,19.60,'--'),
(1,7,'Chemical','Kg',0.020,120.00,2.40,'--'),
(1,6,'Chemical','Kg',0.030,110.00,3.30,'Gloss & finish');
