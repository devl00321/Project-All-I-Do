export const B = {
  mint:     "#10B981",
  mintDark: "#059669",
  mintDeep: "#064E3B",
  mintLight:"#D1FAE5",
  mintFog:  "#ECFDF5",
  teal:     "#0D9488",
  white:    "#FFFFFF",
  bg:       "#F8F9FA",
  surface:  "#FFFFFF",
  brd:      "#E2E8F0",
  brdMid:   "#CBD5E1",
  ink:      "#1E293B",
  inkMid:   "#334155",
  inkLight: "#475569",
  muted:    "#64748B",
  faint:    "#94A3B8",
  err:      "#EF4444",
  errBg:    "#FEE2E2",
  warn:     "#F59E0B",
  warnBg:   "#FEF3C7",
  ok:       "#10B981",
};

export const SERVICES = [
  { id:"plumber",      label:"Plumber",       emoji:"🔧", color:"#3B82F6", eta:"30–45 min", desc:"Leak fixes, pipe work, faucet replacement" },
  { id:"electrician",  label:"Electrician",   emoji:"⚡", color:"#F59E0B", eta:"25–40 min", desc:"Wiring, switches, MCB, fan installation" },
  { id:"carpenter",    label:"Carpenter",     emoji:"🪚", color:"#8B5CF6", eta:"45–60 min", desc:"Furniture repair, door fitting, shelves" },
  { id:"ac_repair",    label:"AC Repair",     emoji:"❄️", color:"#0EA5E9", eta:"40–55 min", desc:"Gas refill, servicing, installation" },
  { id:"cleaning",     label:"Cleaning",      emoji:"🧹", color:"#10B981", eta:"60–90 min", desc:"Deep clean, sofa, bathroom, kitchen" },
  { id:"car_rental",   label:"Car/Bike Rental",emoji:"🚗", color:"#F97316", eta:"20–30 min", desc:"Self-drive or with driver, hourly/daily" },
  { id:"driver",       label:"Driver",        emoji:"🚐", color:"#EC4899", eta:"15–25 min", desc:"Personal driver on demand, trained & verified" },
  { id:"laundry",      label:"Laundry",       emoji:"👕", color:"#6366F1", eta:"Same day",  desc:"Wash, iron, dry clean, pickup & delivery" },
  { id:"pest_control", label:"Pest Control",  emoji:"🦟", color:"#14B8A6", eta:"60–90 min", desc:"Cockroaches, termites, mosquitoes, rats" },
];

export const STATS = [
  { val:"12,400+", label:"Happy Customers", icon:"😊" },
  { val:"850+",    label:"Verified Workers", icon:"👷" },
  { val:"4.8★",    label:"Avg. Rating",      icon:"⭐" },
  { val:"< 45min", label:"Avg. Response",    icon:"⚡" },
];

export const STEPS = [
  { n:"01", title:"Choose a Service",   desc:"Browse 9+ categories and tap the service you need." },
  { n:"02", title:"Describe Your Need", desc:"Add a description and photos for a quick diagnosis." },
  { n:"03", title:"Pick a Time Slot",   desc:"Choose a convenient window — today or tomorrow." },
  { n:"04", title:"Worker Arrives",     desc:"Your verified local expert arrives and gets to work." },
];

export const TIME_SLOTS = [
  "8:00 – 10:00 AM","10:00 AM – 12:00 PM",
  "12:00 – 2:00 PM","2:00 – 4:00 PM",
  "4:00 – 6:00 PM","6:00 – 8:00 PM",
];

export const BOOKING_STATUSES = [
  { key:"confirmed",   label:"Confirmed",      icon:"✅", desc:"Your booking is confirmed" },
  { key:"assigned",    label:"Worker Assigned", icon:"👷", desc:"Rajesh Kumar has been assigned" },
  { key:"en_route",    label:"En Route",        icon:"🚴", desc:"Worker is 12 min away from your address" },
  { key:"in_progress", label:"In Progress",     icon:"🔨", desc:"Work started at 10:32 AM" },
  { key:"completed",   label:"Completed",       icon:"🎉", desc:"Service completed successfully" },
];

export const PAST_BOOKINGS = [
  { id:"BK-2847", service:"Plumber",     date:"May 24, 2026", amount:"₹350", rating:5, worker:"Rajesh K." },
  { id:"BK-2631", service:"Electrician", date:"May 18, 2026", amount:"₹480", rating:4, worker:"Sunil P." },
  { id:"BK-2290", service:"Cleaning",    date:"May 10, 2026", amount:"₹600", rating:5, worker:"Meena S." },
];

export const REVIEWS = [
  { name:"Priya Mondal",  loc:"Suri",    text:"Booked a plumber at 9 AM, he arrived by 10:15 AM. Fixed the leaking pipe in 30 minutes. Very professional and clean.", rating:5, svc:"Plumber" },
  { name:"Arnab Ghosh",   loc:"Bolpur",  text:"The AC technician was extremely knowledgeable. Diagnosed the problem right away. Will definitely use again.", rating:5, svc:"AC Repair" },
  { name:"Sumita Dey",    loc:"Rampurhat",text:"Cleaning team did an amazing job on my kitchen. Never expected such thoroughness at this price point!", rating:5, svc:"Cleaning" },
];
