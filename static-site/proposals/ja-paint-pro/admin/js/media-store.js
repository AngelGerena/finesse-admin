/* JA Paint Pro preview: shared store for gallery uploads and photo settings.
   Uploads (photos and videos) live in this browser's IndexedDB; settings for the
   built-in photos live in localStorage. The real build swaps this for Supabase
   Storage + the media table, with the same fields. */
window.JA_MEDIA = (function () {
  var DB = "ja-preview", ST = "media", dbp = null;
  function db() {
    if (!dbp) dbp = new Promise(function (res, rej) {
      if (!window.indexedDB) { rej(new Error("no-idb")); return; }
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { if (!r.result.objectStoreNames.contains(ST)) r.result.createObjectStore(ST, { keyPath: "id" }); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
    return dbp;
  }
  function run(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction(ST, mode), q = fn(t.objectStore(ST)), out;
        if (q) q.onsuccess = function () { out = q.result; };
        t.oncomplete = function () { res(out); };
        t.onerror = t.onabort = function () { rej(t.error || new Error("idb")); };
      });
    });
  }
  function readJSON(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  return {
    all: function () { return run("readonly", function (s) { return s.getAll(); }).then(function (l) { return l || []; }).catch(function () { return []; }); },
    put: function (rec) { return run("readwrite", function (s) { return s.put(rec); }); },
    del: function (id) { return run("readwrite", function (s) { return s.delete(id); }); },
    meta: function () { return readJSON("ja-media-meta", {}); },
    setMeta: function (m) { return writeJSON("ja-media-meta", m); },
    /* tells an open copy of the website to refresh its gallery */
    ping: function () { try { localStorage.setItem("ja-media-rev", String(Date.now())); } catch (e) {} },
    idFor: function (src) { return "b-" + String(src).split("/").pop().replace(/\.[a-z0-9]+$/i, ""); }
  };
})();
