/**
 * catalogData.js
 * ---------------------------------------------------------------------------
 * The "content" of the app: branding, campus locations, service tiles,
 * announcements, etc. This is plain data with no logic — it's the backend
 * equivalent of the original project's js/data.js.
 *
 * Want to rename the app, add a building, or add a service? This is the
 * only file you should need to touch.
 */

const APP_INFO = {
  appName: "campusMobi",
  university: "Walter Sisulu University",
  domain: "CampusMobi.ac.za",
  version: "1.0.0",
};

const FEATURES = {
  enableGuestMode: true,
};

// Schematic campus locations shown on the Map page.
// `id` must match a key in MAP_PIN_POSITIONS on the frontend (campus-map.js).
const CAMPUS_LOCATIONS = [
  { id: "lib", name: "Library", category: "Academic", info: "Main campus library — open 07:00–22:00." },
  { id: "hall-a", name: "Lecture Hall A", category: "Academic", info: "Ground floor, Block A. Capacity 220." },
  { id: "hall-b", name: "Lecture Hall B", category: "Academic", info: "First floor, Block B. Capacity 150." },
  { id: "admin", name: "Administration Office", category: "Admin", info: "Student records, registration & fees." },
  { id: "cafeteria", name: "Cafeteria", category: "Food", info: "Open 07:00–18:00. Card & wallet accepted." },
  { id: "residence", name: "Residence Block C", category: "Residence", info: "Student housing, security desk 24/7." },
  { id: "gym", name: "Campus Gym", category: "Wellness", info: "Open 06:00–20:00. Subscription required." },
  { id: "study-centre", name: "Study Centre", category: "Academic", info: "Quiet study pods, bookable in advance." },
];

// Tiles shown on the Services page. `route` is where tapping the tile goes
// on the frontend (a hash path) — leave it null if there's no page yet.
const SERVICES = [
  { id: "gym", title: "Gym subscription", description: "Manage or renew your campus gym membership.", icon: "🏋️", category: "Campus life", route: null },
  { id: "calendar", title: "Calendar", description: "Your academic schedule and events.", icon: "📅", category: "Academic", route: "/calendar" },
  { id: "printing", title: "Printing", description: "Send documents to campus print stations.", icon: "🖨️", category: "Academic", route: null },
  { id: "library", title: "Library", description: "Search the catalogue, renew or reserve books.", icon: "📚", category: "Academic", route: null },
  { id: "wallet", title: "Wallet", description: "Top up and pay across campus facilities.", icon: "👛", category: "Finance", route: "/wallet" },
  { id: "map", title: "Campus Map", description: "Find your way around campus.", icon: "🗺️", category: "Campus life", route: "/map" },
];

const SERVICE_CATEGORIES = ["All", "Academic", "Campus life", "Finance"];

const ANNOUNCEMENTS = [
  { title: "WSU re-branding to UEC", date: "15 March 2026" },
  { title: "Library extended hours during exams", date: "10 March 2026" },
  { title: "Gym subscription renewals open", date: "02 March 2026" },
];

const TODAY_SCHEDULE = [
  { time: "09:00", title: "Computer Science — Lecture Hall A" },
  { time: "11:00", title: "Mathematics — Lecture Hall B" },
  { time: "14:00", title: "Study group — Library, Room 3" },
];

const NOTIFICATIONS = [
  { id: 1, title: "Class starting soon", body: "Computer Science begins at 09:00 in Lecture Hall A.", time: "8 min ago", unread: true },
  { id: 2, title: "Wallet top-up successful", body: "R200.00 was added to your wallet.", time: "3 hours ago", unread: true },
  { id: 3, title: "WSU re-branding to UEC", body: "Read the announcement on the dashboard.", time: "Yesterday", unread: false },
  { id: 4, title: "Gym subscription renewal", body: "Your gym subscription renews in 5 days.", time: "2 days ago", unread: false },
];

module.exports = {
  APP_INFO,
  FEATURES,
  CAMPUS_LOCATIONS,
  SERVICES,
  SERVICE_CATEGORIES,
  ANNOUNCEMENTS,
  TODAY_SCHEDULE,
  NOTIFICATIONS,
};
