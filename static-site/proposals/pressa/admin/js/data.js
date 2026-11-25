/* Pressa back office: sample data for the preview.
   Every sample record has isDemo: true so "Clear sample data" removes them in one tap.
   Field names match the tables of the live build (Supabase): inbox_messages, orders, store_settings,
   business_settings, site_content, media. */
window.PRESSA_DATA = (function () {
  var now = Date.now(), H = 3600000, D = 24 * H;
  function iso(ms) { return new Date(ms).toISOString(); }
  return {
    inbox: [
      { id: "d1", type: "contact", isDemo: true, status: "new", at: iso(now - 2 * H), lang: "es", name: "Carlos Rivera", email: "carlos.rivera@example.com", phone: "(407) 555-0142",
        message: "Buenas, tengo un taller de puertas en Kissimmee. ¿Pueden enviar 3 soportes? ¿Hay descuento por cantidad?" },
      { id: "d2", type: "contact", isDemo: true, status: "new", at: iso(now - 9 * H), lang: "en", name: "Mike Thompson", email: "mike@thompsonpainting.example.com", phone: "(321) 555-0187",
        message: "Hi, I run a painting crew in Melbourne. Does the stand work with solid-core exterior doors? They're about 80 lbs." },
      { id: "d3", type: "contact", isDemo: true, status: "answered", at: iso(now - 2 * D), lang: "es", name: "Luis Ortega", email: "lortega@example.com", phone: "",
        message: "¿Cuándo empiezan a enviar? Me interesa el de color negro." },
      { id: "d4", type: "waitlist", isDemo: true, status: "new", at: iso(now - 5 * H), lang: "en", email: "jen.carpentry@example.com" },
      { id: "d5", type: "waitlist", isDemo: true, status: "new", at: iso(now - 1 * D), lang: "es", email: "puertas.delsur@example.com" },
      { id: "d6", type: "waitlist", isDemo: true, status: "new", at: iso(now - 3 * D), lang: "es", email: "rafael.m@example.com" }
    ],
    orders: [
      { id: "P-260004", isDemo: true, status: "paid", at: iso(now - 6 * H), name: "Ana Morales", phone: "(787) 555-0110", email: "ana.morales@example.com", city: "Orlando, FL", qty: 1, color: "orange", total: 1497 },
      { id: "P-260003", isDemo: true, status: "paid", at: iso(now - 1 * D), name: "Derek Hall", phone: "(352) 555-0164", email: "dhall@example.com", city: "Ocala, FL", qty: 2, color: "black", total: 2994 },
      { id: "P-260002", isDemo: true, status: "shipped", at: iso(now - 4 * D), name: "José Vega", phone: "(407) 555-0175", email: "jvega@example.com", city: "Kissimmee, FL", qty: 1, color: "black", total: 1497, tracking: "1Z999AA10123456784" },
      { id: "P-260001", isDemo: true, status: "shipped", at: iso(now - 7 * D), name: "Mark Ellis", phone: "(904) 555-0131", email: "mark.ellis@example.com", city: "Jacksonville, FL", qty: 1, color: "orange", total: 1497, tracking: "1Z999AA10123456791" }
    ]
  };
})();
