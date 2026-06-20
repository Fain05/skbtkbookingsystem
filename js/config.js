/* ====================================================================
   booking configuration
   ==================================================================== */

const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxeE4j-YSu-pI7VhI6YPKIsrZEkec8QhgEUtiQHamjQEk34EmKl55mCwDo0XgvT0UviWw/exec",

  ADMIN_USERNAME: "skbtkadmin",
  ADMIN_DEMO_PASSWORD: "admin123",

  ROOMS: [
    { id: "smart-classroom", nama: "Smart Classroom" },
    { id: "bilik-pak21", nama: "Bilik PAK21" },
    { id: "makmal-komputer", nama: "Makmal Komputer" }
  ],

  // time lists
  TIME_SLOTS: [
    "7:40 - 8:10",
    "8:10 - 8:40",
    "8:40 - 9:10",
    "9:10 - 9:40",
    "9:40 - 10:10",
    "10:10 - 10:40",
    "10:40 - 11:10",
    "11:10 - 11:40",
    "11:40 - 12:10",
    "12:10 - 12:40",
    "12:40 - 1:10",
    "1:10 - 1:40",
    "1:40 - 2:10"
  ],

  // teacher name lists
  FALLBACK_TEACHERS: [
    "FAZLIYATON BINTI AHMAD SUHAIMI",
    "MOHD ASRI BIN ISHAK",
    "OSMAN BIN SAID",
    "HASRUL HAWARDY BIN MAT RADZI",
    "A'RIF FADZIL BIN MAHIZAN",
    "HALIZA BINTI HASSENI",
    "HASNAH BINTI YAHAYA",
    "MOHD ADAM AKMAL BIN CHE MANSOR",
    "MUHAMMAD HAMIZAN BIN MOHD ZAINUDDIN",
    "UMMIL KAROMAH BINTI SHUIB",
    "NUR ASYIQIN BINTI ZAHARI",
    "MASLIA BINTI OMAR",
    "NUR SAKINAH BINTI ISHAK",
    "NURUL SYUHADAK BINTI ABDUL RAHMAN",
    "OOI SWEE KHIM",
    "ROSLIANI BINTI MUSTAPHA",
    "ROSMAWATI BINTI OTHMAN",
    "SARAVANAN A/L ANAMAILI",
    "SITI NURKAMILAH BINTI YAHAYA",
    "SUHAIMI BIN MAT SAID",
    "VASUGI A/P VENUGOPAL",
    "NURUL HANA BINTI ABDUL HADI",
    "KHAIRUN NISA' BINTI SABRI",
    "ARIQAH BINTI AHMAD KHUSAIRI",
    "SARAH BINTI SUBKI"
  ],

  // class name lists
  FALLBACK_CLASSES: [
    "PPKI Nilam",
    "PPKI Zamrud",
    "PPKI Delima",
    "1 Zamrud",
    "2 Zamrud",
    "3 Zamrud",
    "4 Zamrud",
    "5 Zamrud",
    "6 Zamrud",
    "Prasekolah Idaman (PPKI)",
    "Prasekolah Bestari"
  ]
};
