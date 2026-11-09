/* =========================================================================
   FILTRI DI "TUTTO L'ARCHIVIO" (usato solo da archivio.html)
   -------------------------------------------------------------------------
   I filtri si costruiscono da soli leggendo le righe dell'elenco.
   Ogni opera in archivio.html ha tre attributi:

     <div class="risultato" data-sezione="Scritti" data-categoria="Poesia"
          data-tag="famiglia; Lecce">

   Per aggiungere un'opera basta copiare una riga e cambiare questi valori
   (più tag si separano con il punto e virgola): i filtri e i numeri si
   aggiornano da soli, questo file non va toccato.

   I filtri scelti restano nell'indirizzo, es. archivio.html?tag=Lecce
   Senza JavaScript la pagina mostra comunque l'elenco completo, con i link
   alle pagine delle sezioni e dei tag.
   ========================================================================= */

// I gruppi di filtri, nell'ordine in cui compaiono: [titolo, attributo]
const GRUPPI = [
  ["Sezione", "sezione"],
  ["Categoria", "categoria"],
  ["Tag", "tag"]
];

const righe = [...document.querySelectorAll(".risultato")];
// i filtri già scelti nell'indirizzo (solo quelli dei GRUPPI)
const scelti = Object.fromEntries([...new URLSearchParams(location.search)]
  .filter(([nome]) => GRUPPI.some(([, n]) => n === nome)));

// I valori di un'opera per un attributo (i tag possono essere più di uno)
function valori(riga, nome) {
  return (riga.dataset[nome] || "").split(";").map(v => v.trim()).filter(Boolean);
}

// Un'opera resta visibile se rispetta tutti i filtri scelti
function passa(riga) {
  return GRUPPI.every(([, nome]) => !scelti[nome] || valori(riga, nome).includes(scelti[nome]));
}

function aggiorna() {
  const visibili = righe.filter(passa);
  // (style.display e non hidden: nel CSS .risultato ha display: grid)
  righe.forEach(riga => riga.style.display = visibili.includes(riga) ? "" : "none");

  // i filtri: per ogni valore, quante opere visibili lo hanno
  const filtri = document.querySelector(".filtri");
  filtri.innerHTML = "";
  for (const [titolo, nome] of GRUPPI) {
    const tutti = [...new Set(righe.flatMap(r => valori(r, nome)))];
    if (nome === "tag") tutti.sort((a, b) => a.localeCompare(b, "it"));
    const voci = document.createElement("div");
    for (const valore of tutti) {
      const quante = visibili.filter(r => valori(r, nome).includes(valore)).length;
      if (!quante && scelti[nome] !== valore) continue;
      const voce = document.createElement("a");
      voce.href = "#";
      voce.className = scelti[nome] === valore ? "attivo" : "";
      voce.append(valore + " ");
      const conta = document.createElement("span");
      conta.className = "conta";
      conta.textContent = quante;
      voce.append(conta);
      voce.onclick = evento => {
        evento.preventDefault();
        // cliccare di nuovo un filtro attivo lo toglie
        if (scelti[nome] === valore) delete scelti[nome]; else scelti[nome] = valore;
        aggiorna();
      };
      voci.append(voce);
    }
    if (!voci.children.length) continue;
    const riga = document.createElement("div");
    riga.className = "riga-filtri";
    riga.innerHTML = '<span class="nome-filtro"></span>';
    riga.firstChild.textContent = titolo;
    riga.append(voci);
    filtri.append(riga);
  }

  // titolo, "togli tutti i filtri", avviso se non resta niente
  const attivi = Object.keys(scelti).length > 0;
  document.querySelector(".risultati-testa h1").textContent = attivi
    ? visibili.length + (visibili.length === 1 ? " opera trovata" : " opere trovate")
    : "Tutto l'archivio: " + righe.length + " opere";
  document.getElementById("azzera").hidden = !attivi;
  document.getElementById("nessuna").hidden = visibili.length > 0;

  // i filtri scelti nell'indirizzo, così la pagina si può salvare o condividere
  history.replaceState(null, "", "archivio.html" + (attivi ? "?" + new URLSearchParams(scelti) : ""));
}

document.getElementById("azzera").onclick = evento => {
  evento.preventDefault();
  for (const nome in scelti) delete scelti[nome];
  aggiorna();
};

aggiorna();
