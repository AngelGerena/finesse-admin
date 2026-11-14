/* Proposal preview only: feedback buttons in the top strip follow the admin language. */
(function () {
  "use strict";
  var ANGEL = "14079609004";
  function set(lang) {
    var msg = lang === "es"
      ? "¡Hola Angel! Vi la vista previa del sitio web y el panel de JA Paint Pro. Esto es lo que pienso: "
      : "Hi Angel! I checked out the JA Paint Pro website and admin preview. Here are my thoughts: ";
    var wa = document.getElementById("pvWa"), sms = document.getElementById("pvSms");
    if (wa) wa.href = "https://wa.me/" + ANGEL + "?text=" + encodeURIComponent(msg);
    if (sms) sms.href = "sms:+" + ANGEL + "?&body=" + encodeURIComponent(msg);
  }
  document.addEventListener("ja:render", function (e) { set(e.detail.lang); });
  set(document.documentElement.lang === "es" ? "es" : "en");
})();
