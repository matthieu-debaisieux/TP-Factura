// ============================================================
// DONNÉES INITIALES
// ============================================================

function initLocalStorage() {
  if (!localStorage.getItem("clients")) {
    const clients = [
      { id: 1, nom: "Alice Martin" },
      { id: 2, nom: "Marc Dupont" },
      { id: 3, nom: "Sophie Bernard" },
      { id: 4, nom: "Thomas Lefebvre" },
      { id: 5, nom: "Julie Moreau" },
    ];
    localStorage.setItem("clients", JSON.stringify(clients));
  }

  if (!localStorage.getItem("devis")) {
    const devis = [
      { numero: "DEV-001", clientId: 2, clientNom: "Marc Dupont",    montant: 2400.00, emission: "2024-03-20", validite: "2024-04-20", statut: "Envoyé" },
      { numero: "DEV-002", clientId: 3, clientNom: "Sophie Bernard", montant: 900.00,  emission: "2024-04-05", validite: "2024-05-05", statut: "Accepté" },
      { numero: "DEV-003", clientId: 5, clientNom: "Julie Moreau",   montant: 1500.00, emission: "2024-04-15", validite: "2024-05-15", statut: "Brouillon" },
      { numero: "DEV-004", clientId: 1, clientNom: "Alice Martin",   montant: 3200.00, emission: "2024-05-01", validite: "2024-06-01", statut: "Refusé" },
    ];
    localStorage.setItem("devis", JSON.stringify(devis));
  }
}

// ============================================================
// UTILITAIRES
// ============================================================

function getClients() {
  return JSON.parse(localStorage.getItem("clients")) || [];
}

function getDevis() {
  return JSON.parse(localStorage.getItem("devis")) || [];
}

function saveDevis(devis) {
  localStorage.setItem("devis", JSON.stringify(devis));
}

function getNextNumero() {
  const devis = getDevis();
  if (devis.length === 0) return "DEV-001";
  const dernier = devis
    .map((d) => parseInt(d.numero.split("-")[1]))
    .sort((a, b) => b - a)[0];
  return "DEV-" + String(dernier + 1).padStart(3, "0");
}

// ============================================================
// BADGE STATUT
// ============================================================

function badgeStatut(statut) {
  const classes = {
    "Envoyé":    "badge badge-soft badge-info",
    "Accepté":   "badge badge-soft badge-success",
    "Brouillon": "badge badge-soft badge-warning",
    "Refusé":    "badge badge-soft badge-error",
  };
  return `<span class="${classes[statut] || "badge"}">${statut}</span>`;
}

function formatDate(dateISO) {
  const [y, m, d] = dateISO.split("-");
  return `${d}/${m}/${y}`;
}

function formatMontant(montant) {
  return montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €";
}

// ============================================================
// CHARGER LE TABLEAU AU DÉMARRAGE
// ============================================================

function chargerTableau() {
  const tbody = document.getElementById("devisTableau");
  if (!tbody) return;
  tbody.innerHTML = "";
  getDevis().forEach((d) => ajouterLigneTableau(d));
}

// ============================================================
// AJOUT D'UNE LIGNE DANS LE TABLEAU
// ============================================================

function ajouterLigneTableau(devis) {
  const tbody = document.getElementById("devisTableau");
  if (!tbody) return;

  const tr = document.createElement("tr");
  tr.setAttribute("data-numero", devis.numero);
  tr.innerHTML = `
    <th>${devis.numero}</th>
    <td>${devis.clientNom}</td>
    <td>${formatMontant(devis.montant)}</td>
    <td>${formatDate(devis.emission)}</td>
    <td>${formatDate(devis.validite)}</td>
    <td>${badgeStatut(devis.statut)}</td>
    <td>
      <button class="btn btn-ghost btn-error" onclick="supprimerDevis('${devis.numero}', this)">
        <span>Supprimer</span>
      </button>
    </td>
  `;
  tbody.appendChild(tr);
}

// ============================================================
// SUPPRESSION D'UNE LIGNE
// ============================================================

function supprimerDevis(numero, btn) {
  const devis = getDevis().filter((d) => d.numero !== numero);
  saveDevis(devis);

  const tr = btn.closest("tr");
  tr.classList.add("opacity-0", "transition-opacity", "duration-300");
  setTimeout(() => tr.remove(), 300);
}

// ============================================================
// SELECT CLIENT
// ============================================================

function peuplerSelectClient() {
  const select = document.getElementById("devisClient");
  if (!select) return;
  const clients = getClients();
  select.innerHTML = '<option disabled selected value="">Sélectionner un client</option>';
  clients.forEach((client) => {
    const option = document.createElement("option");
    option.value = client.id;
    option.textContent = client.nom;
    select.appendChild(option);
  });
}

// ============================================================
// VALIDATION & ALERTES
// ============================================================

function validerFormulaire() {
  const clientId  = document.getElementById("devisClient").value;
  const montant   = document.getElementById("devisMontant").value;
  const emission  = document.getElementById("devisEmission").value;
  const validite  = document.getElementById("devisValidite").value;
  const errors    = [];

  if (!clientId)                              errors.push("Veuillez sélectionner un client.");
  if (!montant || parseFloat(montant) <= 0)   errors.push("Veuillez renseigner un montant valide.");
  if (!emission)                              errors.push("Veuillez renseigner une date d'émission.");
  if (!validite)                              errors.push("Veuillez renseigner une date de validité.");

  return errors;
}

function afficherAlerte(type, html) {
  let alertBox = document.getElementById("devisAlerte");
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "devisAlerte";
    document.getElementById("devisForm").prepend(alertBox);
  }
  alertBox.className = type ? `alert alert-${type} mb-4` : "";
  alertBox.innerHTML = html;
}

// ============================================================
// SOUMISSION
// ============================================================

function soumettreFormulaire(e) {
  e.preventDefault();

  const errors = validerFormulaire();
  if (errors.length > 0) {
    afficherAlerte("error", errors.map((err) => `<span>${err}</span>`).join(""));
    return;
  }

  const clientId = parseInt(document.getElementById("devisClient").value);
  const montant  = parseFloat(document.getElementById("devisMontant").value);
  const emission = document.getElementById("devisEmission").value;
  const validite = document.getElementById("devisValidite").value;
  const statut   = document.getElementById("devisStatut").value;
  const clients  = getClients();
  const numero   = getNextNumero();

  const nouveauDevis = {
    numero,
    clientId,
    clientNom: clients.find((c) => c.id === clientId)?.nom || "",
    montant:   parseFloat(montant.toFixed(2)),
    emission,
    validite,
    statut,
  };

  const devis = getDevis();
  devis.push(nouveauDevis);
  saveDevis(devis);

  ajouterLigneTableau(nouveauDevis);
  afficherAlerte("success", `<span>Devis <strong>${numero}</strong> créé avec succès !</span>`);
  reinitialiserFormulaire();
}

// ============================================================
// RÉINITIALISATION
// ============================================================

function reinitialiserFormulaire() {
  document.getElementById("devisClient").value   = "";
  document.getElementById("devisMontant").value  = "";
  document.getElementById("devisEmission").value = "";
  document.getElementById("devisValidite").value = "";
  document.getElementById("devisStatut").value   = "Brouillon";
}

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initLocalStorage();
  chargerTableau();
  peuplerSelectClient();

  document.getElementById("devisForm")
    .addEventListener("submit", soumettreFormulaire);

  document.getElementById("btnAnnulerDevis")
    .addEventListener("click", () => {
      reinitialiserFormulaire();
      afficherAlerte("", "");
    });
});