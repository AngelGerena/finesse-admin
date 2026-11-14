/* JA Paint Pro - Finesse OS admin demo data (seeded, in-memory).
   Shapes mirror the planned Supabase tables:
   business_settings, contacts, booking_requests, quote_requests, quotes, jobs,
   leads, blog_posts, media, agent_runs, setup_checklist. */
(function () {
  "use strict";
  function day(offset, h, m) {
    var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + offset);
    if (h !== undefined) d.setHours(h, m || 0);
    return d.toISOString();
  }

  window.JA_DATA = {
    businessSettings: {
      businessName: "JA Paint Pro",
      legalName: "JA Paint Pro LLC",
      logoUrl: "",
      ownerName: "Javier",
      phone: "(407) 301-7117",
      email: "info@japaintpro.com",
      instagram: "@japaintpro",
      facebook: "@japaintpro",
      serviceArea: "Central Florida",
      licenseNumber: "",
      depositPct: 30,
      hours: [
        { day: "Mon - Fri", open: "7:00 AM", close: "6:00 PM", closed: false },
        { day: "Saturday", open: "8:00 AM", close: "2:00 PM", closed: false },
        { day: "Sunday", open: "", close: "", closed: true }
      ]
    },

    services: [
      { id: "svc1", nameEn: "Interior Painting", nameEs: "Pintura Interior", priceNote: "Free estimate", active: true },
      { id: "svc2", nameEn: "Exterior Painting", nameEs: "Pintura Exterior", priceNote: "Free estimate", active: true },
      { id: "svc3", nameEn: "Commercial Painting", nameEs: "Pintura Comercial", priceNote: "Free estimate", active: true },
      { id: "svc4", nameEn: "Pressure Washing", nameEs: "Lavado a Presión", priceNote: "Free estimate", active: true },
      { id: "svc5", nameEn: "Epoxy Floor - 1 car garage", nameEs: "Piso de Epoxy - 1 carro", price: 1250, active: true },
      { id: "svc6", nameEn: "Epoxy Floor - 2 car garage", nameEs: "Piso de Epoxy - 2 carros", price: 2250, active: true },
      { id: "svc7", nameEn: "Epoxy Floor - 3 car garage", nameEs: "Piso de Epoxy - 3 carros", price: 3250, active: true }
    ],

    contacts: [
      { id: "c1", name: "Maria Rivera", phone: "(407) 555-0142", email: "maria.r@example.com", city: "Deltona", lang: "es", source: "Website", isDemo: true },
      { id: "c2", name: "Kevin Brooks", phone: "(321) 555-0188", email: "kbrooks@example.com", city: "Sanford", lang: "en", source: "Website", isDemo: true },
      { id: "c3", name: "Luis Ortega", phone: "(407) 555-0119", email: "lortega@example.com", city: "Kissimmee", lang: "es", source: "Referral", isDemo: true },
      { id: "c4", name: "Sunrise Plaza HOA", phone: "(407) 555-0170", email: "board@example.com", city: "Orlando", lang: "en", source: "Lead Finder", isDemo: true },
      { id: "c5", name: "Dana Whitfield", phone: "(386) 555-0133", email: "dana.w@example.com", city: "DeLand", lang: "en", source: "Instagram", isDemo: true }
    ],

    bookingRequests: [
      { id: "b1", contactId: "c1", service: "Exterior Painting", when: day(1, 9, 30), address: "Deltona, FL", status: "new", notes: "Two-story stucco, wants gray with white trim.", isDemo: true },
      { id: "b2", contactId: "c2", service: "Epoxy Floor - 2 car garage", when: day(2, 11, 0), address: "Sanford, FL", status: "confirmed", notes: "Oil stains near the door.", isDemo: true },
      { id: "b3", contactId: "c5", service: "Interior Painting", when: day(3, 13, 0), address: "DeLand, FL", status: "new", notes: "3 bedrooms and a hallway.", isDemo: true },
      { id: "b4", contactId: "c3", service: "Pressure Washing", when: day(-2, 8, 0), address: "Kissimmee, FL", status: "done", notes: "Driveway and pool deck.", isDemo: true }
    ],

    quoteRequests: [
      { id: "q1", contactId: "c4", service: "Commercial Painting", when: day(-1, 16, 20), timeline: "Within a month", description: "Repaint 4 buildings, exterior only. Board meets on the 20th.", photos: 6, status: "new", isDemo: true },
      { id: "q2", contactId: "c3", service: "Epoxy Floor - 3 car garage", when: day(-3, 10, 5), timeline: "Within 2 weeks", description: "Shop floor, wants blue and gray flake.", photos: 3, status: "quoted", isDemo: true }
    ],

    quotes: [
      { id: "Q-260014", contactId: "c3", status: "sent", issued: day(-2), items: [{ desc: "Epoxy Floor - 3 car garage (polyaspartic topcoat)", qty: 1, price: 3250 }], isDemo: true },
      { id: "Q-260013", contactId: "c2", status: "accepted", issued: day(-6), items: [{ desc: "Epoxy Floor - 2 car garage", qty: 1, price: 2250 }, { desc: "Crack repair", qty: 1, price: 150 }], isDemo: true },
      { id: "Q-260012", contactId: "c1", status: "draft", issued: day(0), items: [{ desc: "Exterior repaint, two-story stucco", qty: 1, price: 6800 }], isDemo: true }
    ],

    jobs: [
      { id: "j1", title: "Brooks garage floor", contactId: "c2", stage: "scheduled", value: 2400, start: day(5, 8, 0), isDemo: true },
      { id: "j2", title: "Rivera exterior repaint", contactId: "c1", stage: "estimate", value: 6800, start: day(1, 9, 30), isDemo: true },
      { id: "j3", title: "Ortega shop floor", contactId: "c3", stage: "quoted", value: 3250, start: null, isDemo: true },
      { id: "j4", title: "Whitfield interior", contactId: "c5", stage: "estimate", value: 3400, start: day(3, 13, 0), isDemo: true },
      { id: "j5", title: "Lake Mary office repaint", contactId: "c4", stage: "progress", value: 9200, start: day(-1, 7, 0), isDemo: true },
      { id: "j6", title: "Ortega driveway wash", contactId: "c3", stage: "done", value: 350, start: day(-2, 8, 0), isDemo: true }
    ],

    leads: [
      { id: "l1", name: "Sunrise Plaza HOA", type: "HOA / Commercial", city: "Orlando", signal: "Community repaint vote on the next board agenda", signalEs: "Votación para pintar la comunidad en la próxima reunión de la junta", score: 92, status: "new", lang: "en", isDemo: true },
      { id: "l2", name: "Iglesia Nueva Vida", type: "Church", city: "Kissimmee", signal: "New building, interior unfinished per their Facebook", signalEs: "Edificio nuevo, el interior sin terminar según su Facebook", score: 84, status: "new", lang: "es", isDemo: true },
      { id: "l3", name: "Lakeside Auto Detail", type: "Commercial / Epoxy", city: "Sanford", signal: "Opening a second bay, concrete floor", signalEs: "Abriendo un segundo local, piso de concreto", score: 81, status: "contacted", lang: "en", isDemo: true },
      { id: "l4", name: "Recently sold home, Deltona", type: "Residential", city: "Deltona", signal: "Sold 3 weeks ago, built 2004, original paint", signalEs: "Vendida hace 3 semanas, construida en 2004, pintura original", score: 74, status: "new", lang: "en", isDemo: true },
      { id: "l5", name: "Property manager, Altamonte", type: "Rental turnover", city: "Altamonte Springs", signal: "12 units, ongoing turnover repaints", signalEs: "12 unidades, pintura constante entre inquilinos", score: 88, status: "new", lang: "en", isDemo: true }
    ],

    blogPosts: [
      { id: "p1", titleEn: "Why Florida stucco peels (and how we stop it)", titleEs: "Por qué se pela el estuco en Florida (y cómo lo evitamos)", city: "Deltona", status: "published", date: day(-9), source: "Agent draft, approved", isDemo: true },
      { id: "p2", titleEn: "Polyaspartic vs epoxy: what a Sanford garage taught us", titleEs: "Poliaspártico vs epoxy: lo que aprendimos en un garaje de Sanford", city: "Sanford", status: "draft", date: day(0), source: "SEO agent draft", isDemo: true }
    ],

    media: [
      { id: "m1", src: "images/gallery/exterior-01.jpg", cat: "exterior", published: true },
      { id: "m2", src: "images/gallery/floor-02.jpg", cat: "floors", published: true },
      { id: "m3", src: "images/gallery/exterior-02.jpg", cat: "exterior", published: true },
      { id: "m4", src: "images/gallery/floor-03.jpg", cat: "commercial", published: true },
      { id: "m5", src: "images/gallery/exterior-04.jpg", cat: "exterior", published: false },
      { id: "m6", src: "images/gallery/floor-01.jpg", cat: "floors", published: true }
    ],

    agents: {
      seo: {
        name: "SEO Agent", on: true, lastRun: day(0, 6, 0),
        stats: { pagesIndexed: 14, pagesTotal: 16, avgPosition: 7.4, clicks30: 212 },
        keywords: [
          { kw: "epoxy garage floor Sanford", pos: 3, change: 2 },
          { kw: "exterior painting Deltona", pos: 5, change: 1 },
          { kw: "pintor de casas Kissimmee", pos: 4, change: 3 },
          { kw: "commercial painter Orlando", pos: 18, change: -2 },
          { kw: "polyaspartic floor coating Central Florida", pos: 6, change: 4 }
        ],
        tasks: [
          "Sitemap resubmitted to Google and Bing",
          "Drafted blog post: Polyaspartic vs epoxy (Sanford)",
          "2 photos missing alt text on the gallery page",
          "Google Business Profile: post a new job photo this week"
        ]
      },
      marketing: {
        name: "Marketing Coach", on: true, lastRun: day(-1, 8, 0), sendDay: "Monday", sendTime: "8:00 AM",
        emails: [
          { week: 1, subject: "Semana 1: Tu perfil de Google es tu vitrina", status: "sent" },
          { week: 2, subject: "Semana 2: Cómo grabar un reel de antes y después en 30 segundos", status: "sent" },
          { week: 3, subject: "Semana 3: El video testimonio que te consigue referidos", status: "scheduled" },
          { week: 4, subject: "Semana 4: 5 ideas de videos detrás de cámara (BTS) para esta semana", status: "queued" }
        ]
      },
      leads: { name: "Lead Finder", on: true, lastRun: day(0, 5, 30), found7: 23, pitched7: 6 }
    },

    setupChecklist: [
      { id: "s1", label: "Upload your logo", done: false },
      { id: "s2", label: "Confirm business hours", done: true },
      { id: "s3", label: "Add your contractor license number", done: false },
      { id: "s4", label: "Add your Google review link", done: false },
      { id: "s5", label: "Clear the demo data", done: false }
    ]
  };
})();
