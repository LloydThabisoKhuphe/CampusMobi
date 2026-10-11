/**
 * Static institutional content for CampusMobi (Walter Sisulu University).
 * Presentation data only — no business logic here.
 */

// Real, public facts about Walter Sisulu University (from wsu.ac.za), used on
// the dashboard homepage instead of invented "campus news".
export const CAMPUS_STATS = [
  { label: "Students", value: "~30 000" },
  { label: "Staff", value: "~1 800" },
  { label: "Campuses", value: "4" },
  { label: "Faculties", value: "7" },
];

export const FACULTIES = [
  "Engineering, Built Environment & Information Technology",
  "Management & Public Administration Sciences",
  "Economic and Financial Sciences",
  "Law, Humanities and Social Sciences",
  "Medicine & Health Sciences",
  "Natural Sciences",
  "Education",
];

export type Campus = { name: string; town: string; phone?: string };

export const CAMPUSES: Campus[] = [
  { name: "Mthatha Campus", town: "Mthatha, Eastern Cape", phone: "047 502 2100" },
  { name: "Butterworth Campus", town: "Butterworth, Eastern Cape", phone: "047 401 6000" },
  { name: "Buffalo City Campus", town: "East London, Eastern Cape", phone: "043 702 9200" },
  { name: "Komani Campus", town: "Komani (Queenstown), Eastern Cape" },
];

// Real WSU systems that require your actual institutional login — CampusMobi
// links out to them rather than embedding or replicating them, since that
// would mean asking for real WSU credentials this app has no way to verify.
export type ExternalService = { name: string; description: string; url: string };

export const EXTERNAL_SERVICES: ExternalService[] = [
  {
    name: "iEnabler",
    description: "Registration, results and student self-service",
    url: "https://ie.wsu.ac.za/pls/prodi41/w99pkg.mi_login",
  },
  {
    name: "WiSeUp",
    description: "Student information and services portal",
    url: "https://wiseup.wsu.ac.za/",
  },
  {
    name: "Library",
    description: "Search the library catalogue (PRIMO)",
    url: "https://seals-wsu.primo.exlibrisgroup.com/nde/home",
  },
  {
    name: "Transport",
    description: "Campus shuttle schedules and tracking",
    url: "https://transport.wsu.ac.za/transport_management/",
  },
  {
    name: "ICT Service Desk",
    description: "Report an IT issue or reset a password",
    url: "https://ictservicedesk.wsu.ac.za/",
  },
  {
    name: "Student Email",
    description: "Outlook webmail",
    url: "https://outlook.office.com/",
  },
  {
    name: "Applications Portal",
    description: "Apply or check an application status",
    url: "https://applications.wsu.ac.za/",
  },
];
