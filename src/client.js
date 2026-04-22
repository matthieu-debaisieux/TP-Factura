// ============================================================
// DONNÉES INITIALES
// ============================================================

function initLocalStorage() {
  if (!localStorage.getItem("clients")) {
    const clients = [
      { id: 1, nom: "Martin", prenom: "Alice", email: "alice.martin@gmail.com", tel: "06 12 34 56 78", ville: "Lyon" },
      { id: 2, nom: "Dupont", prenom: "Marc", email: "marc.dupont@gmail.com", tel: "06 98 76 54 32", ville: "Paris" },
      { id: 3, nom: "Bernard", prenom: "Sophie", email: "sophie.b@outlook.com", tel: "07 11 22 33 44", ville: "Lyon" },
      { id: 4, nom: "Lefebvre", prenom: "Thomas", email: "thomas.lef@gmail.com", tel: "06 55 66 77 88", ville: "Bordeaux" },
      { id: 5, nom: "Moreau", prenom: "Julie", email: "julie.moreau@yahoo.fr", tel: "07 44 55 66 77", ville: "Nantes" },
    ];
    localStorage.setItem("clients", JSON.stringify(clients));
  }
}

// ============================================================
// UTILITAIRES
// ============================================================

function getClients() {
  return JSON.parse(localStorage.getItem("clients")) || [];
}

function saveClients(clients) {
  localStorage.setItem("clients", JSON.stringify(clients));
}

// ============================================================
// AJOUT D'UNE LIGNE DANS LE TABLEAU
// ============================================================

function ajouterLigneTableau(client) {
  const tbody = document.getElementById("clientsTableau");
  if (!tbody) return;

  const tr = document.createElement("tr");
  tr.setAttribute("data-id", client.id);
  tr.innerHTML = `
    <th class="font-bold">${client.nom}</th>
    <td>${client.prenom}</td>
    <td>${client.email}</td>
    <td>${client.tel}</td>
    <td>${client.ville}</td>
    <td>
        <button class="btn btn-ghost btn-error p-0 min-h-0 h-auto lowercase" onclick="supprimerClient(${client.id}, this)">
            <span>Supprimer</span>
        </button>
    </td>
  `;
  tbody.appendChild(tr);
}

function rafraichirTableau() {
  const tbody = document.getElementById("clientsTableau");
  if (!tbody) return;
  tbody.innerHTML = "";
  const clients = getClients();
  clients.forEach(client => ajouterLigneTableau(client));
}

// ============================================================
// SUPPRESSION D'UN CLIENT
// ============================================================

function supprimerClient(id, btn) {
  // Supprime du localStorage
  const clients = getClients().filter((c) => c.id !== id);
  saveClients(clients);

  // Supprime la ligne du tableau avec une animation
  const tr = btn.closest("tr");
  tr.classList.add("opacity-0", "transition-opacity", "duration-300");
  setTimeout(() => tr.remove(), 300);
}

// ============================================================
// VALIDATION & ALERTES
// ============================================================

function validerFormulaire() {
  const nom = document.getElementById("nomClient").value;
  const prenom = document.getElementById("prenomClient").value;
  const email = document.getElementById("emailClient").value;
  const errors = [];

  if (!nom) errors.push("Le nom est obligatoire.");
  if (!prenom) errors.push("Le prénom est obligatoire.");
  if (!email || !email.includes("@")) errors.push("Un email valide est obligatoire.");

  return errors;
}

function afficherAlerte(type, html) {
  let alertBox = document.getElementById("formAlerte");
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "formAlerte";
    document.getElementById("clientForm").prepend(alertBox);
  }
  alertBox.className = type ? `alert alert-${type} mb-4` : "";
  alertBox.innerHTML = html;
}

// ============================================================
// SOUMISSION — ajoute le client ET la ligne du tableau
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

  const clients = getClients();
  const nouveauClient = {
    id: Date.now(), // Génère un ID unique basé sur le timestamp
    nom: document.getElementById("nomClient").value,
    prenom: document.getElementById("prenomClient").value,
    email: document.getElementById("emailClient").value,
    tel: document.getElementById("telClient").value,
    ville: document.getElementById("villeClient").value,
    adresse: document.getElementById("adresseClient").value,
  };

  // 1. Sauvegarde dans le localStorage
  clients.push(nouveauClient);
  saveClients(clients);

  // 2. Ajoute directement la ligne dans le tableau
  ajouterLigneTableau(nouveauClient);

  // 3. Feedback & reset
  afficherAlerte(
    "success",
    `<span>Client <strong>${nouveauClient.nom} ${nouveauClient.prenom}</strong> ajouté avec succès !</span>`,
  );
  reinitialiserFormulaire();
}

// ============================================================
// RÉINITIALISATION
// ============================================================

function reinitialiserFormulaire() {
  document.getElementById("clientForm").reset();
  afficherAlerte("", "");
}

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initLocalStorage();
  rafraichirTableau();

  const form = document.getElementById("clientForm");
  if (form) {
    form.addEventListener("submit", soumettreFormulaire);
  }

  const btnAnnuler = document.getElementById("btnAnnuler");
  if (btnAnnuler) {
    btnAnnuler.addEventListener("click", () => {
      reinitialiserFormulaire();
    });
  }
});