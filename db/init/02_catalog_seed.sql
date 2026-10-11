USE campusmobi;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- DEPARTMENTS  (Faculty of Natural Sciences, WSU Mthatha Campus)
-- ---------------------------------------------------------------------
INSERT INTO departments (department_id, department_code, name) VALUES
(1, 'BES', 'Department of Biological and Environmental Sciences'),
(2, 'MSC', 'Department of Mathematical Sciences and Computing'),
(3, 'CPS', 'Department of Chemical and Physical Sciences');

-- ---------------------------------------------------------------------
-- STAFF  (fictional lecturers, used as timetable/module owners + HODs)
-- ---------------------------------------------------------------------
INSERT INTO staff (staff_id, staff_number, title, first_name, last_name, email, department_id, role) VALUES
(1, 'WSU-ST-001', 'Prof', 'Nomvula', 'Dlamini',   'n.dlamini@wsu.ac.za',   1, 'hod'),
(2, 'WSU-ST-002', 'Dr',   'Thabo',   'Mahlangu',  't.mahlangu@wsu.ac.za', 1, 'senior_lecturer'),
(3, 'WSU-ST-003', 'Dr',   'Lindiwe', 'Nkosi',     'l.nkosi@wsu.ac.za',    1, 'lecturer'),
(4, 'WSU-ST-004', 'Prof', 'Sipho',   'Radebe',    's.radebe@wsu.ac.za',   2, 'hod'),
(5, 'WSU-ST-005', 'Dr',   'Ayanda',  'Mbeki',     'a.mbeki@wsu.ac.za',    2, 'senior_lecturer'),
(6, 'WSU-ST-006', 'Mr',   'Vuyo',    'Adeniji',   'v.adeniji@wsu.ac.za',  2, 'lecturer'),
(7, 'WSU-ST-007', 'Dr',   'Zanele',  'Mokoena',   'z.mokoena@wsu.ac.za',  2, 'lecturer'),
(8, 'WSU-ST-008', 'Prof', 'Xolani',  'Vambe',     'x.vambe@wsu.ac.za',    3, 'hod'),
(9, 'WSU-ST-009', 'Dr',   'Buhle',   'Ntuli',     'b.ntuli@wsu.ac.za',    3, 'senior_lecturer'),
(10,'WSU-ST-010', 'Dr',   'Mandla',  'Zulu',      'm.zulu@wsu.ac.za',     3, 'lecturer');

UPDATE departments SET department_id = department_id; -- no-op placeholder for readability
UPDATE qualifications SET qualification_id = qualification_id WHERE 1=0; -- table empty at this point, safe no-op

-- ---------------------------------------------------------------------
-- QUALIFICATIONS  (real names + real programme codes from the 2021
-- Faculty of Natural Sciences Prospectus, section 4)
-- ---------------------------------------------------------------------

-- 4.1 Department of Biological and Environmental Sciences
INSERT INTO qualifications
(qualification_id, qualification_code, name, department_id, degree_type, nqf_level, duration_years, is_extended, min_credits, hod_staff_id) VALUES
(1,  'WS5615', 'Bachelor of Science in Biological Sciences (Extended Programme)', 1, 'bachelor', 7, 4, TRUE,  480, 1),
(2,  'WS5616', 'Bachelor of Science in Environmental Studies (Extended Programme)', 1, 'bachelor', 7, 4, TRUE,  480, 1),
(3,  'WS5686', 'Bachelor of Science in Pest Management (Extended Programme)', 1, 'bachelor', 7, 4, TRUE,  480, 1),
(4,  'WS5609', 'Bachelor of Science in Biological Sciences', 1, 'bachelor', 7, 3, FALSE, 360, 1),
(5,  'WS5612', 'Bachelor of Science in Environmental Studies', 1, 'bachelor', 7, 3, FALSE, 360, 1),
(6,  'WS5607', 'Bachelor of Science in Pest Management', 1, 'bachelor', 7, 3, FALSE, 360, 1),
(7,  'WS5606', 'Diploma in Pest Management', 1, 'diploma', 6, 3, FALSE, 360, 1),
(8,  'WS5608', 'Bachelor of Science Honours in Botany', 1, 'honours', 8, 1, FALSE, 120, 1),
(9,  'WS5610', 'Bachelor of Science Honours in Geography', 1, 'honours', 8, 1, FALSE, 120, 1),
(10, 'WS5681', 'Bachelor of Science Honours in Zoology', 1, 'honours', 8, 1, FALSE, 120, 1),
(11, 'WS5614', 'Master of Science in Botany', 1, 'masters', 9, 2, FALSE, 180, 1),
(12, 'WS5613', 'Master of Science in Geography', 1, 'masters', 9, 2, FALSE, 180, 1),
(13, 'WS5625', 'Master of Science in Zoology', 1, 'masters', 9, 2, FALSE, 180, 1),
(14, 'WS5680', 'Doctor of Philosophy in Natural Sciences (Biological and Environmental Sciences)', 1, 'doctorate', 10, 3, FALSE, 360, 1),

-- 4.2 Department of Mathematical Sciences and Computing
(15, 'WS5619', 'Bachelor of Science in Applied Mathematics (Extended Programme)', 2, 'bachelor', 7, 4, TRUE,  480, 4),
(16, 'WS5617', 'Bachelor of Science in Applied Statistical Science (Extended Programme)', 2, 'bachelor', 7, 4, TRUE,  480, 4),
(17, 'WS5683', 'Bachelor of Science in Computer Science (Extended Programme)', 2, 'bachelor', 7, 4, TRUE,  480, 4),
(18, 'WS5618', 'Bachelor of Science in Mathematics (Extended Programme)', 2, 'bachelor', 7, 4, TRUE,  480, 4),
(19, 'WS5674', 'Bachelor of Science in Applied Mathematics', 2, 'bachelor', 7, 3, FALSE, 360, 4),
(20, 'WS5672', 'Bachelor of Science in Applied Statistical Science', 2, 'bachelor', 7, 3, FALSE, 360, 4),
(21, 'WS5675', 'Bachelor of Science in Computer Science', 2, 'bachelor', 7, 3, FALSE, 360, 4),
(22, 'WS5673', 'Bachelor of Science in Mathematics', 2, 'bachelor', 7, 3, FALSE, 360, 4),
(23, 'WS5670', 'Bachelor of Science Honours in Applied Statistical Sciences', 2, 'honours', 8, 1, FALSE, 120, 4),
(24, 'WS5669', 'Bachelor of Science Honours in Mathematics', 2, 'honours', 8, 1, FALSE, 120, 4),
(25, 'WS5671', 'Bachelor of Science Honours in Computer Science', 2, 'honours', 8, 1, FALSE, 120, 4),
(26, 'WS5685', 'Master of Science in Mathematics', 2, 'masters', 9, 2, FALSE, 180, 4),

-- 4.3 Department of Chemical and Physical Sciences
(27, 'WS5688', 'Bachelor of Science Extended (Chemistry)', 3, 'bachelor', 7, 4, TRUE,  480, 8),
(28, 'WS5689', 'Bachelor of Science Extended (Physics)', 3, 'bachelor', 7, 4, TRUE,  480, 8),
(29, 'WS5687', 'Bachelor of Science (Chemistry)', 3, 'bachelor', 7, 3, FALSE, 360, 8),
(30, 'WS5690', 'Bachelor of Science (Physics)', 3, 'bachelor', 7, 3, FALSE, 360, 8),
(31, 'WS5691', 'Bachelor of Science Honours (Chemistry)', 3, 'honours', 8, 1, FALSE, 120, 8),
(32, 'WS5692', 'Bachelor of Science Honours (Physics)', 3, 'honours', 8, 1, FALSE, 120, 8);

-- ---------------------------------------------------------------------
-- MODULES  (real module codes + credits, transcribed from the
-- programme curriculum tables in the prospectus, section 4)
-- ---------------------------------------------------------------------

INSERT INTO modules (module_id, module_code, module_name, department_id, credits, nqf_level) VALUES
-- Biological & Environmental Sciences: BSc Biological Sciences mainstream (WS5609/MT5609)
(1,  'BSP11M1', 'Intro to Plant Form & Function', 1, 8, 5),
(2,  'BSP11M2', 'Intro to Animal Form & Function', 1, 8, 5),
(3,  'CHE11M1', 'General Chemistry I', 1, 16, 5),
(4,  'BSP11M5', 'Animal Diversity', 1, 8, 5),
(5,  'CLT11M1', 'Computer Literacy I', 1, 8, 5),
(6,  'BSP12M2', 'Cell Biology, Genetics & Evolution', 1, 16, 5),
(7,  'BSP12M4', 'Plant Diversity', 1, 8, 5),
(8,  'CHE12M1', 'General Chemistry II', 1, 16, 5),
(9,  'CLT12M2', 'Computer Literacy II', 1, 8, 5),
(10, 'COK15M0', 'Communication Skills', 1, 8, 5),
(11, 'BSP21M2', 'Ecology', 1, 16, 6),
(12, 'BSP21M3', 'Higher Plant Systematics', 1, 16, 6),
(13, 'APS11M1', 'Applied Statistics I', 1, 16, 6),
(14, 'BSP22M4', 'Biochemistry', 1, 16, 6),
(15, 'BSP22M5', 'Invertebrate Form & Function', 1, 16, 6),
(16, 'BSP22M6', 'Mycology & Microbiology', 1, 16, 6),
(17, 'APS12M1', 'Applied Statistics II', 1, 16, 6),
(18, 'BSP31M1', 'Vertebrate Form & Function', 1, 16, 7),
(19, 'BSP31M2', 'Plant Physiology', 1, 16, 7),
(20, 'BSP31M3', 'Plant Pathology', 1, 16, 7),
(21, 'BSP32M5', 'Animal Behaviour & Physiology', 1, 16, 7),
(22, 'BSP32M6', 'Conservation Biology', 1, 16, 7),
(23, 'BSP32M7', 'Economic Biology', 1, 16, 7),
-- Biological Sciences electives
(24, 'PHY11M3', 'Physics for Life Sciences I', 1, 16, 5),
(25, 'MAT11M1', 'Pre-Calculus and Calculus I', 1, 16, 5),
(26, 'PHY12M4', 'Physics for Life Sciences II', 1, 16, 5),
(27, 'MAT12M1', 'Pre-Calculus and Calculus II', 1, 16, 5),
(28, 'PSY11M1', 'Understanding Human Behaviour', 1, 8, 6),
(29, 'GEO11M1', 'Intro to Environmental Techniques I', 1, 16, 6),
(30, 'PSY12M3', 'Determinants of Human Behaviour', 1, 8, 6),
(31, 'GEO12M1', 'Intro to Environmental Techniques II', 1, 16, 6),
-- Honours in Botany (WS5608 track)
(32, 'BOT48M0', 'Project (Botany)', 1, 30, 8),
(33, 'BST48M1', 'Scientific Methodology', 1, 16, 8),
(34, 'BSM48M1', 'Statistical Methods', 1, 16, 8),
(35, 'BGT48M2', 'GIS & Computer Literacy', 1, 10, 8),
(36, 'BOT48M1', 'Biotechnology', 1, 16, 8),
(37, 'BCT48M1', 'Conservation Biology (Hons)', 1, 16, 8),
(38, 'BEC48M1', 'Ecology (Hons)', 1, 16, 8),
(39, 'BET48M2', 'Ethnobotany', 1, 16, 8),
(40, 'BOT48M2', 'Plant Systematics', 1, 16, 8),
(41, 'BPT48M2', 'Plant Physiology (Hons)', 1, 16, 8),
-- Honours in Geography (MT5610 track)
(42, 'GEO40M4', 'Research Project (Geography)', 1, 32, 8),
(43, 'GEO40M1', 'Advanced GIS', 1, 24, 8),
-- Honours in Zoology (MT5681 track)
(44, 'ZOO42M5', 'Project (Zoology)', 1, 40, 8),
(45, 'ZOO41M1', 'Scientific Methodology (Zoology)', 1, 16, 8),
(46, 'ZOO41M2', 'Eco-physiology', 1, 16, 8),
(47, 'ZOO42M1', 'Terrestrial Ecology', 1, 16, 8),
(48, 'ZOO42M2', 'Marine & Coastal Ecology', 1, 16, 8),
(49, 'ZOO42M3', 'Freshwater Ecology', 1, 16, 8),
(50, 'ZOO42M4', 'Conservation Ecology', 1, 16, 8),
(51, 'ZOO42M6', 'Basic Computer & GIS Skills', 1, 16, 8),

-- Mathematical Sciences and Computing: BSc Applied Mathematics core (WS5674)
(52, 'MAT15M1', 'Precalculus & Calculus I', 2, 16, 5),
(53, 'APM15M1', 'Introduction to Linear & Vector Algebra', 2, 16, 5),
(54, 'CLT15M1', 'Computer Literacy', 2, 8, 5),
(55, 'MAT15M2', 'Precalculus & Calculus II', 2, 16, 5),
(56, 'APM15M2', 'Linear Programming & Applied Computing', 2, 16, 5),
(57, 'COK15M0A','Communication Skills (Math Sci)', 2, 8, 5),
(58, 'MTC26M1', 'Multivariate Calculus', 2, 8, 6),
(59, 'MAT26M1', 'Ordinary Differential Equations', 2, 8, 6),
(60, 'APM26M1', 'Numerical Analysis I', 2, 16, 6),
(61, 'MTC26M2', 'Real Analysis I', 2, 8, 6),
(62, 'MAT26M2', 'Linear Algebra I', 2, 8, 6),
(63, 'APM26M2', 'Eigenvalue Problems and Fourier Analysis', 2, 16, 6),
(64, 'APM31M1', 'Numerical Methods', 2, 16, 7),
(65, 'MAT32M2', 'Complex Analysis', 2, 16, 7),
(66, 'APM32M1', 'Mathematical Programming', 2, 16, 7),
(67, 'MAT31M2', 'Linear Algebra II', 2, 16, 7),
-- Applied Mathematics / Applied Statistics electives incl. Computer Science modules
(68, 'CSI15M1', 'Information Systems and Applications', 2, 8, 5),
(69, 'CSI15M2', 'Object-Oriented Programming', 2, 8, 5),
(70, 'CSP15M1', 'Problem Solving and Programming', 2, 8, 5),
(71, 'STA15M1', 'Descriptive Stats, Probability & Distribution Theory I', 2, 16, 5),
(72, 'STA15M2', 'Probability & Statistical Inference I', 2, 16, 5),
(73, 'APE26M2', 'Mechanics I', 2, 16, 6),
(74, 'CSI26M1', 'Programming in JAVA', 2, 14, 6),
(75, 'STA26M1', 'Probability & Distribution Theory II', 2, 16, 6),
(76, 'CSI26M2', 'Operating Systems', 2, 14, 6),
(77, 'STA26M2', 'Statistical Inference II', 2, 16, 6),
(78, 'CSI31M1', 'Introduction to Artificial Intelligence', 2, 14, 7),
(79, 'CSI31M2', 'Software Engineering I', 2, 14, 7),
(80, 'STA31M1', 'Linear Models & Multivariable Distribution Theory', 2, 16, 7),
(81, 'CSI32M1', 'Database Management Systems', 2, 14, 7),
(82, 'CSI32M2', 'Software Engineering II', 2, 14, 7),
(83, 'STA32M3', 'Sampling Theory & Methods', 2, 16, 7),
(84, 'STA32M2', 'Stochastic Processes & Time Series Forecasting', 2, 16, 7),
-- BSc Computer Science specific (WS5675 mainstream, borrowed elective codes above where shared)
(85, 'CSI2102', 'Data Communication & Networking', 2, 14, 6),
(86, 'CSI2202', 'Data Structures', 2, 14, 6),
(87, 'CSI3101', 'Introduction to Artificial Intelligence (CS)', 2, 14, 7),
(88, 'CSI3102', 'Software Engineering (CS)', 2, 14, 7),
(89, 'CSI3201', 'Database Management Systems (CS)', 2, 14, 7),
(90, 'CSI3202', 'Internet Applications', 2, 14, 7),

-- Chemical and Physical Sciences: BSc Chemistry mainstream (WS5687)
(91,  'ELS1105', 'English for Academic Purposes I', 3, 8, 5),
(92,  'CHE11M1B','General Chemistry I (Chem major)', 3, 16, 5),
(93,  'PHG15M1', 'General Physics I', 3, 16, 5),
(94,  'ELS1205', 'English for Academic Purposes II', 3, 8, 5),
(95,  'CHE12M1B','General Chemistry II (Chem major)', 3, 16, 5),
(96,  'PHG15M2', 'General Physics II', 3, 16, 5),
(97,  'CHE22M2', 'Analytical Chemistry II', 3, 16, 6),
(98,  'CHE21M5', 'Physical Chemistry II', 3, 16, 6),
(99,  'PHY21M1', 'Mechanics and Waves', 3, 16, 6),
(100, 'CHE22M3', 'Inorganic Chemistry II', 3, 16, 6),
(101, 'CHE21M4', 'Organic Chemistry II', 3, 16, 6),
(102, 'PHY22M2', 'Thermodynamics and Modern Physics', 3, 16, 6),
(103, 'CHE31M3', 'Inorganic Chemistry III', 3, 16, 7),
(104, 'CHE31M4', 'Organic Chemistry III', 3, 16, 7),
(105, 'CHE32M2', 'Analytical Chemistry III', 3, 16, 7),
(106, 'CHE32M5', 'Physical Chemistry III', 3, 16, 7),
(107, 'CHE31M1', 'Research, Report and Seminar', 3, 16, 7),
-- Chemistry Honours (WS5691)
(108, 'CHE42M4', 'Organic Chemistry IV', 3, 16, 8),
(109, 'CHE42M5', 'Physical Chemistry IV', 3, 16, 8),
(110, 'CHE41M3', 'Inorganic Chemistry IV', 3, 16, 8),
(111, 'CHE41M2', 'Analytical Chemistry IV', 3, 16, 8),
(112, 'CHE42M8', 'Honours Dissertation & Research', 3, 64, 8),
-- BSc Physics mainstream (WS5690)
(113, 'CSI11M1', 'Information Systems and Applications (Physics)', 3, 8, 5),
(114, 'CSI11M2', 'Problem Solving and Programming (Physics)', 3, 8, 5),
(115, 'CSI12M1', 'Introduction to Object-Oriented Programming', 3, 8, 6),
(116, 'CSI12M2', 'Computer Architecture & Organisation', 3, 8, 6),
(117, 'PHY31M1', 'Electromagnetism and Quantum Mechanics', 3, 24, 7),
(118, 'PHY32M2', 'Statistical Mechanics and Solid State Physics', 3, 24, 7),
-- Extended programme foundation modules (shared across extended qualifications)
(119, 'EBSP1M1', 'Extended Cell Biology, Genetics I', 1, 16, 5),
(120, 'ECHE1M1', 'Extended General Chemistry I', 1, 16, 5),
(121, 'EACL1M1', 'Academic Literacy I', 1, 8, 5),
(122, 'EBSP1M2', 'Extended Cell Biology, Genetics II', 1, 16, 5),
(123, 'ECHE1M2', 'Extended General Chemistry II', 1, 16, 5),
(124, 'ELSK1M2', 'Life Skills', 1, 8, 5),
(125, 'EACL1M2', 'Academic Literacy II', 1, 8, 5),
(126, 'EPHY1M1', 'Extended General Physics I', 3, 16, 5),
(127, 'EGPY1M2', 'Extended General Physics III', 3, 16, 5),
(128, 'ECHE1M3', 'Extended General Chemistry III', 3, 16, 5),
(129, 'ECHE1M4', 'Extended General Chemistry IV', 3, 16, 5),
(130, 'EGPH1M2', 'Extended General Physics IV', 3, 16, 5),
(131, 'EMAT1M1', 'Integrated Mathematics I', 2, 16, 5),
(132, 'EMAT1M2', 'Integrated Mathematics II', 2, 16, 5),
(133, 'ECSI1M1', 'Computer Science Fundamentals', 2, 8, 5),
(134, 'ECSI1M2', 'Introduction to Programming I', 2, 16, 5);

-- ---------------------------------------------------------------------
-- QUALIFICATION <-> MODULE MAPPING (year/semester/type)
-- ---------------------------------------------------------------------

-- BSc Biological Sciences (WS5609, qualification_id 4) — Year 1
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(4, 1, 1, 1, 'core'), (4, 2, 1, 1, 'core'), (4, 3, 1, 1, 'core'), (4, 4, 1, 1, 'core'), (4, 5, 1, 1, 'foundation'),
(4, 6, 1, 2, 'core'), (4, 7, 1, 2, 'core'), (4, 8, 1, 2, 'core'), (4, 9, 1, 2, 'foundation'),
(4, 24, 1, 1, 'elective'), (4, 25, 1, 1, 'elective'), (4, 26, 1, 2, 'elective'), (4, 27, 1, 2, 'elective'),
-- Year 2
(4, 10, 2, 0, 'foundation'), (4, 11, 2, 1, 'core'), (4, 12, 2, 1, 'core'), (4, 13, 2, 1, 'core'),
(4, 14, 2, 2, 'core'), (4, 15, 2, 2, 'core'), (4, 16, 2, 2, 'core'), (4, 17, 2, 2, 'core'),
(4, 28, 2, 1, 'elective'), (4, 29, 2, 1, 'elective'), (4, 30, 2, 2, 'elective'), (4, 31, 2, 2, 'elective'),
-- Year 3
(4, 18, 3, 1, 'core'), (4, 19, 3, 1, 'core'), (4, 20, 3, 1, 'core'),
(4, 21, 3, 2, 'core'), (4, 22, 3, 2, 'core'), (4, 23, 3, 2, 'core');

-- BSc Honours in Botany (qualification_id 8)
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(8, 32, 1, 0, 'core'), (8, 33, 1, 1, 'core'), (8, 34, 1, 1, 'core'), (8, 35, 1, 2, 'core'),
(8, 36, 1, 1, 'elective'), (8, 37, 1, 1, 'elective'), (8, 38, 1, 2, 'elective'),
(8, 39, 1, 2, 'elective'), (8, 40, 1, 2, 'elective'), (8, 41, 1, 2, 'elective');

-- BSc Honours in Zoology (qualification_id 10)
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(10, 44, 1, 0, 'core'), (10, 45, 1, 1, 'core'), (10, 46, 1, 1, 'core'), (10, 47, 1, 1, 'core'),
(10, 48, 1, 2, 'core'), (10, 49, 1, 2, 'core'), (10, 50, 1, 2, 'core'), (10, 51, 1, 2, 'core');

-- BSc Honours in Geography (qualification_id 9) — partial curriculum as documented
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(9, 42, 1, 0, 'core'), (9, 43, 1, 1, 'core');

-- BSc Applied Mathematics (WS5674, qualification_id 19) — Year 1
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(19, 52, 1, 1, 'core'), (19, 53, 1, 1, 'core'), (19, 54, 1, 1, 'foundation'),
(19, 55, 1, 2, 'core'), (19, 56, 1, 2, 'core'), (19, 57, 1, 2, 'foundation'),
-- Year 2
(19, 58, 2, 1, 'core'), (19, 59, 2, 1, 'core'), (19, 60, 2, 1, 'core'),
(19, 61, 2, 2, 'core'), (19, 62, 2, 2, 'core'), (19, 63, 2, 2, 'core'),
-- Year 3
(19, 64, 3, 1, 'core'), (19, 65, 3, 2, 'core'), (19, 66, 3, 2, 'core'), (19, 67, 3, 1, 'core'),
-- Electives
(19, 68, 1, 1, 'elective'), (19, 70, 1, 1, 'elective'), (19, 71, 1, 1, 'elective'),
(19, 69, 1, 2, 'elective'), (19, 72, 1, 2, 'elective'),
(19, 73, 2, 1, 'elective'), (19, 74, 2, 1, 'elective'), (19, 75, 2, 1, 'elective'),
(19, 76, 2, 2, 'elective'), (19, 77, 2, 2, 'elective'),
(19, 78, 3, 1, 'elective'), (19, 79, 3, 1, 'elective'), (19, 80, 3, 1, 'elective'),
(19, 81, 3, 2, 'elective'), (19, 82, 3, 2, 'elective'), (19, 83, 3, 2, 'elective'), (19, 84, 3, 2, 'elective');

-- BSc Applied Statistical Science (WS5672, qualification_id 20) — Year 1
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(20, 71, 1, 1, 'core'), (20, 52, 1, 1, 'core'), (20, 72, 1, 2, 'core'), (20, 55, 1, 2, 'core'),
(20, 54, 1, 1, 'foundation'), (20, 57, 1, 2, 'foundation'),
-- Year 2
(20, 75, 2, 1, 'core'), (20, 77, 2, 2, 'core'),
-- Year 3
(20, 80, 3, 1, 'core'), (20, 83, 3, 2, 'core'), (20, 84, 3, 2, 'core'),
-- Electives
(20, 68, 1, 1, 'elective'), (20, 70, 1, 1, 'elective'), (20, 53, 1, 1, 'elective'),
(20, 69, 1, 2, 'elective'), (20, 56, 1, 2, 'elective'),
(20, 60, 2, 1, 'elective'), (20, 61, 2, 1, 'elective'), (20, 62, 2, 1, 'elective'), (20, 63, 2, 1, 'elective'),
(20, 73, 2, 1, 'elective'), (20, 74, 2, 1, 'elective'), (20, 58, 2, 2, 'elective'), (20, 76, 2, 2, 'elective');

-- BSc Computer Science (WS5675, qualification_id 21) — Year 1
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(21, 93, 1, 1, 'core'), (21, 52, 1, 1, 'core'), (21, 68, 1, 1, 'foundation'), (21, 70, 1, 1, 'foundation'), (21, 10, 1, 1, 'foundation'), (21, 54, 1, 1, 'foundation'),
(21, 96, 1, 2, 'core'), (21, 27, 1, 2, 'core'), (21, 69, 1, 2, 'foundation'), (21, 116, 1, 2, 'foundation'), (21, 9, 1, 2, 'foundation'),
-- Year 2
(21, 99, 2, 1, 'core'), (21, 58, 2, 1, 'core'), (21, 59, 2, 1, 'core'),
(21, 102, 2, 2, 'core'), (21, 61, 2, 2, 'core'), (21, 62, 2, 2, 'core'),
(21, 71, 2, 1, 'elective'), (21, 53, 2, 1, 'elective'), (21, 85, 2, 1, 'elective'),
(21, 72, 2, 2, 'elective'), (21, 56, 2, 2, 'elective'), (21, 86, 2, 2, 'elective'),
-- Year 3
(21, 117, 3, 1, 'core'), (21, 67, 3, 1, 'core'),
(21, 118, 3, 2, 'core'), (21, 65, 3, 2, 'core'),
(21, 60, 3, 1, 'elective'), (21, 87, 3, 1, 'elective'), (21, 88, 3, 1, 'elective'), (21, 75, 3, 1, 'elective'), (21, 63, 3, 1, 'elective'),
(21, 66, 3, 2, 'elective'), (21, 89, 3, 2, 'elective'), (21, 90, 3, 2, 'elective'), (21, 77, 3, 2, 'elective');

-- BSc Honours in Computer Science (WS5671, qualification_id 25) — represented modules
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(25, 81, 1, 2, 'core'), (25, 79, 1, 1, 'core'), (25, 78, 1, 1, 'core'), (25, 82, 1, 2, 'core');

-- BSc Chemistry (WS5687, qualification_id 29) — Year 1
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(29, 91, 1, 1, 'foundation'), (29, 92, 1, 1, 'core'), (29, 52, 1, 1, 'core'), (29, 93, 1, 1, 'core'),
(29, 94, 1, 2, 'foundation'), (29, 95, 1, 2, 'core'), (29, 55, 1, 2, 'core'), (29, 96, 1, 2, 'core'),
-- Year 2
(29, 97, 2, 2, 'core'), (29, 98, 2, 2, 'core'), (29, 58, 2, 1, 'core'), (29, 61, 2, 1, 'core'),
(29, 99, 2, 1, 'core'), (29, 100, 2, 1, 'core'), (29, 101, 2, 1, 'core'),
(29, 59, 2, 2, 'core'), (29, 62, 2, 2, 'core'), (29, 102, 2, 2, 'core'),
-- Year 3
(29, 103, 3, 1, 'core'), (29, 104, 3, 1, 'core'), (29, 107, 3, 1, 'core'),
(29, 105, 3, 2, 'core'), (29, 106, 3, 2, 'core');

-- BSc Honours (Chemistry) (WS5691, qualification_id 31)
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(31, 108, 1, 1, 'core'), (31, 109, 1, 1, 'core'), (31, 110, 1, 1, 'core'),
(31, 111, 1, 2, 'core'), (31, 112, 1, 2, 'core');

-- BSc Physics (WS5690, qualification_id 30) — Year 1
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(30, 93, 1, 1, 'core'), (30, 52, 1, 1, 'core'), (30, 113, 1, 1, 'foundation'), (30, 114, 1, 1, 'foundation'), (30, 10, 1, 1, 'foundation'), (30, 54, 1, 1, 'foundation'),
(30, 96, 1, 2, 'core'), (30, 27, 1, 2, 'core'), (30, 115, 1, 2, 'foundation'), (30, 116, 1, 2, 'foundation'), (30, 9, 1, 2, 'foundation'),
-- Year 2
(30, 99, 2, 1, 'core'), (30, 58, 2, 1, 'core'), (30, 59, 2, 1, 'core'),
(30, 102, 2, 2, 'core'), (30, 61, 2, 2, 'core'), (30, 62, 2, 2, 'core'),
-- Year 3
(30, 117, 3, 1, 'core'), (30, 67, 3, 1, 'core'),
(30, 118, 3, 2, 'core'), (30, 65, 3, 2, 'core');

-- Extended programmes (BSc Biological Sciences Extended, WS5615, qualification_id 1) — Year 1
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(1, 119, 1, 1, 'core'), (1, 120, 1, 1, 'core'), (1, 121, 1, 1, 'foundation'),
(1, 122, 1, 2, 'core'), (1, 123, 1, 2, 'core'), (1, 124, 1, 2, 'foundation'), (1, 125, 1, 2, 'foundation'),
(1, 131, 1, 1, 'elective'), (1, 132, 1, 2, 'elective');

-- BSc Extended Chemistry (WS5688, qualification_id 27) — Year 1
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(27, 121, 1, 1, 'foundation'), (27, 54, 1, 1, 'foundation'), (27, 120, 1, 1, 'core'), (27, 131, 1, 1, 'core'),
(27, 126, 1, 1, 'core'), (27, 128, 1, 1, 'core'),
(27, 127, 1, 1, 'core'), (27, 10, 1, 1, 'foundation'), (27, 13, 1, 1, 'elective'),
(27, 123, 1, 2, 'core'), (27, 129, 1, 2, 'core'), (27, 130, 1, 2, 'core'), (27, 132, 1, 2, 'core'),
(27, 125, 1, 2, 'foundation'), (27, 9, 1, 2, 'foundation'), (27, 17, 1, 2, 'elective');

-- BSc Extended Physics (WS5689, qualification_id 28) — Year 1
INSERT INTO qualification_modules (qualification_id, module_id, year_level, semester, module_type) VALUES
(28, 126, 1, 1, 'core'), (28, 131, 1, 1, 'core'), (28, 133, 1, 1, 'foundation'), (28, 121, 1, 1, 'foundation'),
(28, 127, 1, 2, 'core'), (28, 132, 1, 2, 'core'), (28, 134, 1, 2, 'foundation'), (28, 124, 1, 2, 'foundation');

-- ---------------------------------------------------------------------
-- MODULE PREREQUISITES (a representative sample transcribed from the
-- prospectus prerequisite tables — not exhaustive)
-- ---------------------------------------------------------------------
INSERT INTO module_prerequisites (module_id, prerequisite_id) VALUES
(75, 71), (75, 72),      -- STA26M1 needs STA15M1 & STA15M2
(77, 71), (77, 72),      -- STA26M2 needs STA15M1 & STA15M2
(80, 75), (80, 77),      -- STA31M1 needs STA26M1 & STA26M2
(83, 75), (83, 77),      -- STA32M3 needs STA26M1 & STA26M2
(97, 92), (98, 92), (100, 92), (101, 92), -- Level II Chemistry needs General Chemistry I
(103, 100), (104, 101),  -- Inorganic/Organic III need their level II counterparts
(105, 97), (106, 98),    -- Analytical/Physical III need their level II counterparts
(107, 97), (107, 98), (107, 100), (107, 101); -- Research Seminar needs all level II Chemistry

-- ---------------------------------------------------------------------
-- ACADEMIC YEAR / SEMESTERS
-- ---------------------------------------------------------------------
INSERT INTO academic_years (academic_year_id, year_label, start_date, end_date, is_current) VALUES
(1, '2023', '2023-02-01', '2023-11-30', FALSE),
(2, '2024', '2024-02-01', '2024-11-30', FALSE),
(3, '2025', '2025-02-01', '2025-11-30', FALSE),
(4, '2026', '2026-02-02', '2026-11-27', TRUE);

INSERT INTO semesters (semester_id, academic_year_id, semester_number, start_date, end_date) VALUES
(1, 4, 1, '2026-02-02', '2026-06-12'),
(2, 4, 2, '2026-07-14', '2026-11-27'),
(3, 3, 1, '2025-02-03', '2025-06-13'),
(4, 3, 2, '2025-07-15', '2025-11-28');

-- ---------------------------------------------------------------------
-- FEE CATEGORIES & STRUCTURE (2026 WSU-style fee schedule)
-- ---------------------------------------------------------------------
INSERT INTO fee_categories (fee_category_id, name, description) VALUES
(1, 'Registration', 'Annual registration fee'),
(2, 'Tuition', 'Annual tuition fee'),
(3, 'Residence', 'On-campus accommodation'),
(4, 'Gym', 'Campus gym membership');

INSERT INTO fee_structure (qualification_id, fee_category_id, academic_year_id, amount) VALUES
(NULL, 1, 4, 2350.00),
(NULL, 3, 4, 18500.00),
(NULL, 4, 4, 450.00);

-- Tuition varies a little by degree type — Honours/Masters cost more per year
INSERT INTO fee_structure (qualification_id, fee_category_id, academic_year_id, amount)
SELECT qualification_id, 2, 4,
       CASE degree_type
         WHEN 'bachelor'   THEN 42500.00
         WHEN 'honours'    THEN 48900.00
         WHEN 'masters'    THEN 39500.00
         WHEN 'doctorate'  THEN 45000.00
         WHEN 'diploma'    THEN 32000.00
       END
FROM qualifications;

SET FOREIGN_KEY_CHECKS = 1;
