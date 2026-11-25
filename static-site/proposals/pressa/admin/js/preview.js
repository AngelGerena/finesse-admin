/* Proposal preview only: feedback buttons in the top strip follow the back office language. */
(function () {
  "use strict";
  var ANGEL = "14079609004";
  function set(lang) {
    var msg = lang === "es"
      ? "¡Hola Angel! Vi la vista previa del sitio web y el panel de Pressa. Esto es lo que pienso: "
      : "Hi Angel! I checked out the Pressa website and back office preview. Here are my thoughts: ";
    var wa = document.getElementById("pvWa"), sms = document.getElementById("pvSms");
    if (wa) wa.href = "https://wa.me/" + ANGEL + "?text=" + encodeURIComponent(msg);
    if (sms) sms.href = "sms:+" + ANGEL + "?&body=" + encodeURIComponent(msg);
  }
  document.addEventListener("pressa:render", function (e) { set(e.detail.lang); });
  set(document.documentElement.lang === "en" ? "en" : "es");
})();
