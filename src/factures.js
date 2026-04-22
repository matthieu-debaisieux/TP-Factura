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

  if (!localStorage.getItem("factures")) {
    const factures = [
      {
        numero: "FAC-001",
        clientId: 1,
        clientNom: "Alice Martin",
        montantHT: 1200.0,
        montantTTC: 1440.0,
        date: "2024-03-01",
        statut: "Payée",
      },
      {
        numero: "FAC-002",
        clientId: 2,
        clientNom: "Marc Dupont",
        montantHT: 850.0,
        montantTTC: 1020.0,
        date: "2024-03-15",
        statut: "En attente",
      },
      {
        numero: "FAC-003",
        clientId: 3,
        clientNom: "Sophie Bernard",
        montantHT: 400.0,
        montantTTC: 480.0,
        date: "2024-04-01",
        statut: "En retard",
      },
      {
        numero: "FAC-004",
        clientId: 1,
        clientNom: "Alice Martin",
        montantHT: 2400.0,
        montantTTC: 2880.0,
        date: "2024-04-10",
        statut: "Payée",
      },
      {
        numero: "FAC-005",
        clientId: 4,
        clientNom: "Thomas Lefebvre",
        montantHT: 600.0,
        montantTTC: 720.0,
        date: "2024-04-20",
        statut: "En attente",
      },
      {
        numero: "FAC-006",
        clientId: 5,
        clientNom: "Julie Moreau",
        montantHT: 700.0,
        montantTTC: 840.0,
        date: "2024-05-01",
        statut: "Payée",
      },
    ];
    localStorage.setItem("factures", JSON.stringify(factures));
  }
}

// ============================================================
// UTILITAIRES
// ============================================================

function getClients() {
  return JSON.parse(localStorage.getItem("clients")) || [];
}

function getFactures() {
  return JSON.parse(localStorage.getItem("factures")) || [];
}

function getMontantHTFromForm() {
  const montantHT = document.getElementById("montantHT").value;
  return parseFloat(montantHT) || 0;
}

function saveFactures(factures) {
  localStorage.setItem("factures", JSON.stringify(factures));
}

function getNextNumero() {
  const factures = getFactures();
  if (factures.length === 0) return "FAC-001";
  const dernierNumero = factures
    .map((f) => parseInt(f.numero.split("-")[1]))
    .sort((a, b) => b - a)[0];
  return "FAC-" + String(dernierNumero + 1).padStart(3, "0");
}

// ============================================================
// BADGE STATUT
// ============================================================

function badgeStatut(statut) {
  const classes = {
    Payée: "badge badge-soft badge-success",
    "En attente": "badge badge-soft badge-warning",
    "En retard": "badge badge-soft badge-error",
  };
  return `<span class="${classes[statut] || "badge"}">${statut}</span>`;
}

// Formate une date ISO (2024-03-01) en JJ/MM/AAAA
function formatDate(dateISO) {
  const [y, m, d] = dateISO.split("-");
  return `${d}/${m}/${y}`;
}

// Formate un montant en "1 440,00€"
function formatMontant(montant) {
  return montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + "€";
}

// ============================================================
// AJOUT D'UNE LIGNE DANS LE TABLEAU
// ============================================================

function ajouterLigneTableau(facture) {
  const tbody = document.getElementById("facturesTableau");
  if (!tbody) return;

  const tr = document.createElement("tr");
  tr.setAttribute("data-numero", facture.numero);
  tr.innerHTML = `
    <th>${facture.numero}</th>
    <td>${facture.clientNom}</td>
    <td>${formatMontant(facture.montantHT)}</td>
    <td>${formatMontant(facture.montantTTC)}</td>
    <td>${formatDate(facture.date)}</td>
    <td>${badgeStatut(facture.statut)}</td>
    <td>
        <button class="btn btn-ghost btn-error"  onclick="supprimerFacture('FAC-001', this)">
            <span>Supprimer</span>
        </button>
    </td>
  `;
  tbody.appendChild(tr);
}

// ============================================================
// SUPPRESSION D'UNE LIGNE
// ============================================================

function supprimerFacture(numero, btn) {
  // Supprime du localStorage
  const factures = getFactures().filter((f) => f.numero !== numero);
  saveFactures(factures);

  // Supprime la ligne du tableau avec une animation
  const tr = btn.closest("tr");
  tr.classList.add("opacity-0", "transition-opacity", "duration-300");
  setTimeout(() => tr.remove(), 300);
}

// ============================================================
// SELECT CLIENT & CALCUL TTC
// ============================================================

function peuplerSelectClient() {
  const select = document.getElementById("selectClient");
  if (!select) return;
  const clients = getClients();
  select.innerHTML =
    '<option disabled selected value="">Sélectionner un client</option>';
  clients.forEach((client) => {
    const option = document.createElement("option");
    option.value = client.id;
    option.textContent = client.nom;
    select.appendChild(option);
  });
}

function calcTTC() {
  const ht = getMontantHTFromForm();
  const el = document.getElementById("montantTTC");
  if (!isNaN(ht) && ht > 0) {
    const ttc = (ht * 1.2).toFixed(2);
    el.textContent =
      "Montant TTC : " +
      parseFloat(ttc).toLocaleString("fr-FR", { minimumFractionDigits: 2 }) +
      " €";
  } else {
    el.textContent = "Montant TTC : —";
  }
}

// ============================================================
// VALIDATION & ALERTES
// ============================================================

function validerFormulaire() {
  const clientId = document.getElementById("selectClient").value;
  const date = document.getElementById("dateFacture").value;
  const montantHT = document.getElementById("montantHT").value;
  const errors = [];

  if (!clientId) errors.push("Veuillez sélectionner un client.");
  if (!date) errors.push("Veuillez renseigner une date.");
  if (!montantHT || parseFloat(montantHT) <= 0)
    errors.push("Veuillez renseigner un montant HT valide.");

  return errors;
}

function afficherAlerte(type, html) {
  let alertBox = document.getElementById("formAlerte");
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "formAlerte";
    document.getElementById("factureForm").prepend(alertBox);
  }
  alertBox.className = type ? `alert alert-${type} mb-4` : "";
  alertBox.innerHTML = html;
}

// ============================================================
// SOUMISSION — ajoute la facture ET la ligne du tableau
// ============================================================

function soumettreFormulaire(e) {
  e.preventDefault();

  const errors = validerFormulaire();
  if (errors.length > 0) {
    afficherAlerte(
      "error",
      errors.map((err) => `<span>${err}</span>`).join(""),
    );
    return;
  }

  const clientId = parseInt(document.getElementById("selectClient").value);
  const date = document.getElementById("dateFacture").value;
  const montantHT = getMontantHTFromForm();
  const statut = document.getElementById("selectStatut").value;
  const clients = getClients();
  const factures = getFactures();
  const numero = getNextNumero();

  const nouvelleFacture = {
    numero,
    clientId,
    clientNom: clients.find((c) => c.id === clientId)?.nom || "",
    montantHT: parseFloat(montantHT.toFixed(2)),
    montantTTC: parseFloat((montantHT * 1.2).toFixed(2)),
    date,
    statut,
  };

  // 1. Sauvegarde dans le localStorage
  factures.push(nouvelleFacture);
  saveFactures(factures);

  // 2. Ajoute directement la ligne dans le tableau
  ajouterLigneTableau(nouvelleFacture);

  // 3. Feedback & reset
  afficherAlerte(
    "success",
    `<span>Facture <strong>${numero}</strong> créée avec succès !</span>`,
  );
  reinitialiserFormulaire();
}

// ============================================================
// RÉINITIALISATION
// ============================================================

function reinitialiserFormulaire() {
  document.getElementById("selectClient").value = "";
  document.getElementById("dateFacture").value = "";
  document.getElementById("montantHT").value = "";
  document.getElementById("selectStatut").value = "En attente";
  document.getElementById("montantTTC").textContent = "Montant TTC : —";
}

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initLocalStorage();
  peuplerSelectClient();

  document.getElementById("montantHT").addEventListener("input", calcTTC);

  document
    .getElementById("factureForm")
    .addEventListener("submit", soumettreFormulaire);

  document.getElementById("btnAnnuler").addEventListener("click", () => {
    reinitialiserFormulaire();
    afficherAlerte("", "");
  });
});
