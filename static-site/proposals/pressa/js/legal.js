(function () {
  var root = document.documentElement, btn = document.getElementById("lgLang");
  function setLang(l) {
    root.lang = l; btn.textContent = l === "en" ? "ES" : "EN";
    try { localStorage.setItem("pressa-lang", l); } catch (e) {}
  }
  var saved = "es";
  try { saved = localStorage.getItem("pressa-lang") || "es"; } catch (e) {}
  setLang(saved === "en" ? "en" : "es");
  btn.addEventListener("click", function () { setLang(root.lang === "en" ? "es" : "en"); });
})();
