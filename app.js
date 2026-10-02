/* Carga el contenido editable (content/*.json, lo que se cambia desde el panel) y arranca la página. */
(async () => {
  const get = f => fetch(f + "?v=" + Date.now()).then(r => r.json());
  const [S, PR] = await Promise.all([get("/content/sitio.json"), get("/content/precios.json")]);
  const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const img = (src, lazy) => { const i = document.createElement("img"); i.src = src; i.alt = ""; if (lazy) i.loading = "lazy"; return i; };
  const fotos = l => (l || []).map(x => (typeof x === "string" ? x : x && (x.foto || x.imagen))).filter(Boolean);

  document.querySelectorAll("[data-k]").forEach(e => { if (S[e.dataset.k]) e.textContent = S[e.dataset.k]; });

  const sl = document.getElementById("slides");
  fotos(S.portada).forEach((f, i) => sl.append(img(f, i > 0)));

  document.querySelectorAll("[data-sal]").forEach(a => {
    const d = S["salon_" + a.dataset.sal] || {};
    fotos(d.fotos).forEach((f, i) => a.insertBefore(img(f, i > 0), a.querySelector(".gd")));
    if (d.direccion) a.querySelector("[data-dir]").textContent = d.direccion;
    if (d.descripcion) a.querySelector("[data-desc]").textContent = d.descripcion;
  });

  if (S.foto_propuesta) document.getElementById("foto-prop").src = S.foto_propuesta;

  const rg = document.getElementById("reels");
  (S.videos || []).map(v => (String(typeof v === "string" ? v : v && v.link).match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reel|reels|tv)\/([\w-]+)/) || [])[1])
    .filter(Boolean)
    .forEach(c => rg.insertAdjacentHTML("beforeend", `<div class="ph rv"><iframe loading="lazy" src="https://www.instagram.com/p/${c}/embed" title="Publicación de La Comarca"></iframe></div>`));
  if (!rg.children.length) document.getElementById("eventos").style.display = "none";

  const fq = (S.preguntas || []).filter(q => q && q.pregunta && q.respuesta && q.respuesta.trim());
  if (fq.length) {
    document.getElementById("faq-list").innerHTML = fq.map(q => `<details><summary>${esc(q.pregunta)}</summary><p>${esc(q.respuesta).replace(/\n/g, "<br>")}</p></details>`).join("");
    document.getElementById("faq").style.display = "";
  }

  window.__WA = PR.whatsapp;
  initA();
  initB(PR);
})();
