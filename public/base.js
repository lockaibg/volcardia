// Sélection des éléments du DOM
const searchForm = document.getElementById('search-form');
const searchName = document.getElementById('search-name');
const searchEffet = document.getElementById('search-effet');
const searchType = document.getElementById('search-type');
const searchEnergie = document.getElementById('search-energie');
const searchAttaque = document.getElementById('search-attaque');
const searchDefense = document.getElementById('search-defense');
const searchFond = document.getElementById('search-fond');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
// Fonction pour charger les cartes depuis le JSON
async function loadCards() {
    try {
        const response = await fetch('/cards.json');
        if (!response.ok) {
            console.error("Impossible de charger cards.json");
            return [];
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur lors du chargement du JSON :", error);
        return [];
    }
}

// Fonction de filtrage
function filterCards(cards) {
    const nameVal = searchName.value.trim().toLowerCase();
    const effetVal = searchEffet.value.trim().toLowerCase();
    const typeVal = searchType.value.trim().toLowerCase();
    const energieVal = searchEnergie.value ? parseInt(searchEnergie.value) : null;
    const attaqueVal = searchAttaque.value ? parseInt(searchAttaque.value) : null;
    const defenseVal = searchDefense.value ? parseInt(searchDefense.value) : null;
    const fondVal = searchFond.value.trim().toLowerCase();

    return cards.filter(card => {
        const cardAttaque = (typeof card.attaque === 'number') ? card.attaque : null;
        const cardDefense = (typeof card.defense === 'number') ? card.defense : null;

        if (nameVal && !card.nom.toLowerCase().includes(nameVal)) return false;
        if (effetVal && !card.effet.toLowerCase().includes(effetVal)) return false;
        if (typeVal && !card.type.toLowerCase().includes(typeVal)) return false;
        if (energieVal !== null && card.energie !== energieVal) return false;
        if (attaqueVal !== null && cardAttaque !== attaqueVal) return false;
        if (defenseVal !== null && cardDefense !== defenseVal) return false;
        if (fondVal && (!card.fond || !card.fond.toLowerCase().includes(fondVal))) return false;

        return true;
    });
}

// Fonction d'affichage des résultats
function displayResults(cards) {
    const resultsTable = document.getElementById('search-results');
    const tbody = resultsTable.querySelector('tbody');
    tbody.innerHTML = ''; // On vide le tbody

    if (cards.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.textContent = "Aucune carte trouvée.";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    cards.forEach(card => {
        const tr = document.createElement('tr');

        // Nom (avec lien)
        const tdNom = document.createElement('td');
        tdNom.innerHTML = `<a href="index.html?nom=${encodeURIComponent(card.nom)}&effet=${encodeURIComponent(card.effet)}&illustration=${encodeURIComponent(card.source_illustration)}&type=${encodeURIComponent(card.type)}&energie=${encodeURIComponent(card.energie)}${card.attaque !== undefined ? '&attaque=' + encodeURIComponent(card.attaque) : ''}${card.defense !== undefined ? '&defense=' + encodeURIComponent(card.defense) : ''}${card.fond ? '&fond=' + encodeURIComponent(card.fond) : ''}${card.source_illustration ? '&illustration=' + encodeURIComponent(card.source_illustration) : ''}">
    ${card.nom}
</a>`;
        tr.appendChild(tdNom);

        // Type
        const tdType = document.createElement('td');
        tdType.textContent = card.type;
        tr.appendChild(tdType);

        // Énergie
        const tdEnergie = document.createElement('td');
        tdEnergie.textContent = card.energie;
        tr.appendChild(tdEnergie);

        tbody.appendChild(tr);
    });
}

// Listener sur le bouton Rechercher
searchBtn.addEventListener('click', async () => {
    const cards = await loadCards();
    const filtered = filterCards(cards);
    displayResults(filtered);
});