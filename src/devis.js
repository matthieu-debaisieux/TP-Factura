// ============================================================
// UTILITAIRES LOCALSTORAGE
// ============================================================

function getClients() {
  return JSON.parse(localStorage.getItem('clients')) || [
    { id: 1, nom: 'Alice Martin' },
    { id: 2, nom: 'Marc Dupont' },
    { id: 3, nom: 'Sophie Bernard' },
    { id: 4, nom: 'Thomas Lefebvre' },
    { id: 5, nom: 'Julie Moreau' },
  ];
}

function getDevis() {
  return JSON.parse(localStorage.getItem('devis')) || [
    { numero: 'DEV-001', clientId: 2, clientNom: 'Marc Dupont',     montant: 2400.00, emission: '2024-03-20', validite: '2024-04-20', statut: 'Envoyé' },
    { numero: 'DEV-002', clientId: 3, clientNom: 'Sophie Bernard',  montant: 900.00,  emission: '2024-04-05', validite: '2024-05-05', statut: 'Accepté' },
    { numero: 'DEV-003', clientId: 5, clientNom: 'Julie Moreau',    montant: 1500.00, emission: '2024-04-15', validite: '2024-05-15', statut: 'Brouillon' },
    { numero: 'DEV-004', clientId: 1, clientNom: 'Alice Martin',    montant: 3200.00, emission: '2024-05-01', validite: '2024-06-01', statut: 'Refusé' },
  ];
}

function saveDevis(devis) {
  localStorage.setItem('devis', JSON.stringify(devis));
}

function getNextNumero() {
  const devis = getDevis();
  if (devis.length === 0) return 'DEV-001';
  const dernier = devis
    .map(d => parseInt(d.numero.split('-')[1]))
    .sort((a, b) => b - a)[0];
  return 'DEV-' + String(dernier + 1).padStart(3, '0');
}

// ============================================================
// UTILITAIRES AFFICHAGE
// ============================================================

function formatDate(dateISO) {
  const [y, m, d] = dateISO.split('-');
  return `${d}/${m}/${y}`;
}

function formatMontant(montant) {
  return montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
}

function badgeStatut(statut) {
  const classes = {
    'Envoyé':    'badge badge-soft badge-info',
    'Accepté':   'badge badge-soft badge-success',
    'Brouillon': 'badge badge-soft badge-warning',
    'Refusé':    'badge badge-soft badge-error',
  };
  return `<span class="${classes[statut] || 'badge'}">${statut}</span>`;
}

function majCompteur() {
  const compteur = document.getElementById('compteurDevis');
  if (compteur) {
    const n = getDevis().length;
    compteur.textContent = n + ' devis';
  }
}

// ============================================================
// PEUPLER SELECT CLIENT
// ============================================================

function peuplerSelectClient() {
  const select = document.getElementById('devisClient');
  const clients = getClients();
  select.innerHTML = '<option disabled selected value="">Sélectionner un client</option>';
  clients.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nom;
    select.appendChild(opt);
  });
}

// ============================================================
// ALERTE FORMULAIRE
// ============================================================

function afficherAlerte(type, html) {
  const el = document.getElementById('devisAlerte');
  el.className = type ? `alert alert-${type} mb-4` : '';
  el.innerHTML = html;
}

// ============================================================
// AJOUTER UNE LIGNE AU TABLEAU
// ============================================================

function ajouterLigneTableau(devis) {
  const tbody = document.getElementById('devisTableau');
  const tr = document.createElement('tr');
  tr.setAttribute('data-numero', devis.numero);
  tr.innerHTML = `
    <th>${devis.numero}</th>
    <td>${devis.clientNom}</td>
    <td>${formatMontant(devis.montant)}</td>
    <td>${formatDate(devis.emission)}</td>
    <td>${formatDate(devis.validite)}</td>
    <td>${badgeStatut(devis.statut)}</td>
    <td>
      <button class="btn btn-xs btn-error btn-soft" onclick="supprimerDevis('${devis.numero}', this)">
        Supprimer
      </button>
    </td>
  `;
  tbody.appendChild(tr);
}

// ============================================================
// SUPPRIMER UN DEVIS
// ============================================================

function supprimerDevis(numero, btn) {
  const devis = getDevis().filter(d => d.numero !== numero);
  saveDevis(devis);
  const tr = btn.closest('tr');
  tr.classList.add('opacity-0', 'transition-opacity', 'duration-300');
  setTimeout(() => {
    tr.remove();
    majCompteur();
  }, 300);
}

// ============================================================
// VALIDATION
// ============================================================

function validerFormulaire() {
  const errors = [];
  if (!document.getElementById('devisClient').value)
    errors.push('Veuillez sélectionner un client.');
  if (!document.getElementById('devisMontant').value || parseFloat(document.getElementById('devisMontant').value) <= 0)
    errors.push('Veuillez renseigner un montant valide.');
  if (!document.getElementById('devisEmission').value)
    errors.push("Veuillez renseigner une date d'émission.");
  if (!document.getElementById('devisValidite').value)
    errors.push('Veuillez renseigner une date de validité.');
  return errors;
}

// ============================================================
// SOUMISSION
// ============================================================

function soumettreFormulaire(e) {
  e.preventDefault();

  const errors = validerFormulaire();
  if (errors.length > 0) {
    afficherAlerte('error', errors.map(err => `<span>${err}</span>`).join(''));
    return;
  }

  const clientId = parseInt(document.getElementById('devisClient').value);
  const montant  = parseFloat(document.getElementById('devisMontant').value);
  const emission = document.getElementById('devisEmission').value;
  const validite = document.getElementById('devisValidite').value;
  const statut   = document.getElementById('devisStatut').value;
  const clients  = getClients();
  const numero   = getNextNumero();

  const nouveauDevis = {
    numero,
    clientId,
    clientNom: clients.find(c => c.id === clientId)?.nom || '',
    montant:   parseFloat(montant.toFixed(2)),
    emission,
    validite,
    statut,
  };

  const devis = getDevis();
  devis.push(nouveauDevis);
  saveDevis(devis);

  ajouterLigneTableau(nouveauDevis);
  majCompteur();
  afficherAlerte('success', `<span>Devis <strong>${numero}</strong> créé avec succès !</span>`);
  reinitialiserFormulaire();
}

// ============================================================
// RÉINITIALISATION
// ============================================================

function reinitialiserFormulaire() {
  document.getElementById('devisClient').value   = '';
  document.getElementById('devisMontant').value  = '';
  document.getElementById('devisEmission').value = '';
  document.getElementById('devisValidite').value = '';
  document.getElementById('devisStatut').value   = 'Brouillon';
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('devis'))   saveDevis(getDevis());
  if (!localStorage.getItem('clients')) localStorage.setItem('clients', JSON.stringify(getClients()));

  peuplerSelectClient();
  majCompteur();

  document.getElementById('btnNouveauDevis')
    .addEventListener('click', () => {
      document.getElementById('sectionFormulaireDevis')
        .scrollIntoView({ behavior: 'smooth' });
    });

  document.getElementById('btnAnnulerDevis')
    .addEventListener('click', () => {
      reinitialiserFormulaire();
      afficherAlerte('', '');
    });

  document.getElementById('devisForm')
    .addEventListener('submit', soumettreFormulaire);
});