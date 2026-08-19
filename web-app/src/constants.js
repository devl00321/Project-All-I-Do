export const B = {
  mint:     "#51d09f",
  mintDark: "#3ebd8b",
  mintDeep: "#2da374",
  mintLight:"#e6f9f2",
  mintFog:  "#f3fdf9",
  teal:     "#0D9488",
  white:    "#FFFFFF",
  bg:       "#F8F9FA",
  surface:  "#FFFFFF",
  brd:      "#E2E8F0",
  brdMid:   "#CBD5E1",
  ink:      "#242e47",
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
  { id:"plumber",      label:"Plumber",       image:"/images/plumber.png", icon:"Wrench", color:"#3B82F6", eta:"30–45 min", basePrice: 250, placeholder: "e.g. Bathroom tap is leaking continuously, water dripping from the joint...", desc:"Leak fixes, pipe work, faucet replacement" },
  { id:"electrician",  label:"Electrician",   image:"/images/electrician.png", icon:"Zap", color:"#F59E0B", eta:"25–40 min", basePrice: 200, placeholder: "e.g. Wall socket is sparking when turning on AC, or ceiling fan is not working...", desc:"Wiring, switches, MCB, fan installation" },
  { id:"carpenter",    label:"Carpenter",     image:"/images/carpenter.png", icon:"Hammer", color:"#8B5CF6", eta:"45–60 min", basePrice: 300, placeholder: "e.g. Wooden wardrobe door hinge is broken and needs to be replaced...", desc:"Furniture repair, door fitting, shelves" },
  { id:"ac_repair",    label:"AC Repair",     image:"/images/ac_repair.png", icon:"Wind", color:"#0EA5E9", eta:"40–55 min", basePrice: 400, placeholder: "e.g. AC is running but not cooling, or water is dripping from indoor unit...", desc:"Gas refill, servicing, installation" },
  { id:"cleaning",     label:"Cleaning",      image:"/images/cleaning.png", icon:"Sparkles", color:"#10B981", eta:"60–90 min", basePrice: 500, placeholder: "e.g. Deep cleaning of kitchen cabinets and tiles, bathroom deep clean...", desc:"Deep clean, sofa, bathroom, kitchen" },
  { id:"car_rental",   label:"Car/Bike Rental",image:"/images/car_rental.png", icon:"Car", color:"#F97316", eta:"20–30 min", basePrice: 0, placeholder: "", desc:"Self-drive or with driver, hourly/daily" },
  { id:"driver",       label:"Driver",        image:"/images/driver.png", icon:"Compass", color:"#EC4899", eta:"15–25 min", basePrice: 0, placeholder: "", desc:"Personal driver on demand, trained & verified" },
  { id:"laundry",      label:"Laundry",       image:"/images/laundry.png", icon:"Shirt", color:"#6366F1", eta:"Same day",  basePrice: 150, placeholder: "e.g. Need 5 shirts washed and ironed, and 2 winter jackets dry cleaned...",  desc:"Wash, iron, dry clean, pickup & delivery" },
  { id:"pest_control", label:"Pest Control",  image:"/images/pest_control.png", icon:"Bug", color:"#14B8A6", eta:"60–90 min", basePrice: 650, placeholder: "e.g. Termite control needed in master bedroom wooden cupboards...", desc:"Cockroaches, termites, mosquitoes, rats" },
  { id:"mechanic",     label:"Mechanic",      image:"/images/mechanic.png", icon:"Wrench", color:"#4F46E5", eta:"30–50 min", basePrice: 350, placeholder: "e.g. Bike engine making a rattling noise, or car starter motor not turning over...", desc:"Car & bike repair, general servicing" },
  { id:"emergency_fuel", label:"Emergency Fuel",image:"/images/emergency_fuel.png", icon:"Fuel", color:"#EF4444", eta:"15–25 min", basePrice: 180, placeholder: "e.g. Ran out of fuel near Lal Bazar, need 5 liters of Petrol delivered...", desc:"Fuel delivery (Petrol/Diesel) anywhere" },
  { id:"porter",       label:"Porter",        image:"/images/porter.png", icon:"Truck", color:"#10B981", eta:"20–40 min", basePrice: 280, placeholder: "e.g. Moving 3 heavy cardboard boxes and a single mattress to 2nd floor...", desc:"Local goods shifting, heavy packing" }
];

export const STATS = [
  { val:"12,400+", label:"Happy Customers", icon:"Smile", color:"#10B981" },
  { val:"850+",    label:"Verified Workers", icon:"ShieldCheck", color:"#3B82F6" },
  { val:"4.8★",    label:"Avg. Rating",      icon:"Star", color:"#F59E0B" },
  { val:"< 45min", label:"Avg. Response",    icon:"Zap", color:"#8B5CF6" },
];

export const STEPS = [
  { n:"01", title:"Choose a Service",   desc:"Browse 12+ categories and tap the service you need." },
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
