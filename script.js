// Participants constants
const PARTICIPANTS = [
  "GrandPa",
  "GrandMa",
  "Arnaud",
  "Julie",
  "Valérie",
  "Maxime",
  "Fanny",
  "Corentin"
];

// Clé de stockage dans localStorage
const STORAGE_KEY = "cacahuete_secret_santa_v1";

// Code secret pour le reset via URL
const SECRET_RESET_CODE = "MON_CODE_SECRET_2025";

// Date limite exclusive : après cette date, l'app est expirée
// (Date.UTC(year, monthIndex, day) -> mois 0 = janvier, donc 11 = décembre)
const EXPIRATION_TIMESTAMP = Date.UTC(2025, 11, 27, 0, 0, 0);

// Récupère l'état depuis localStorage ou initialise
function getState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      assignments: {}, // { giverName: receiverName }
      taken: {},       // { receiverName: true }
      completedCount: 0
    };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      assignments: parsed.assignments || {},
      taken: parsed.taken || {},
      completedCount: parsed.completedCount || 0
    };
  } catch (e) {
    // En cas de corruption, on repart de zéro
    return {
      assignments: {},
      taken: {},
      completedCount: 0
    };
  }
}

// Sauvegarde l'état dans localStorage
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Efface toutes les données locales
function clearAllData() {
  // Utilisation de localStorage.clear() pour tout supprimer si souhaité,
  // mais ici on préfère supprimer notre clé seulement.
  // localStorage.clear(); // viderait tout pour ce domaine [web:6][web:12][web:15]
  localStorage.removeItem(STORAGE_KEY);
}

// Gestion URLSearchParams pour le reset secret [web:1][web:3][web:8]
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Vérifie la date d'expiration à chaque chargement
function checkExpiration() {
  const now = new Date();
  const nowUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );

  if (nowUtc >= EXPIRATION_TIMESTAMP) {
    // Gestion de l’expiration : on efface les données et on affiche l'écran d'expiration
    clearAllData();
    renderExpiredScreen();
    return true;
  }
  return false;
}

// Gestion du reset secret via ?reset=CODE
function checkSecretReset() {
  const resetParam = getUrlParam("reset");
  if (resetParam && resetParam === SECRET_RESET_CODE) {
    // Gestion du reset secret : tout vider et informer l'utilisateur
    clearAllData();
    renderResetDoneScreen();
    return true;
  }
  return false;
}

// Utilité pour créer un élément
function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.text) el.textContent = options.text;
  if (options.html) el.innerHTML = options.html;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => {
      el.setAttribute(k, v);
    });
  }
  return el;
}

// Affiche le compteur type "X / 8 participants ont déjà encodé…"
function createCounterElement(state) {
  const counter = createElement("div", { className: "counter" });
  const X = state.completedCount || 0;
  counter.innerHTML =
    `<span><strong>${X}</strong> / ${PARTICIPANTS.length} participants ont déjà encodé leur cacahuète.</span>`;
  return counter;
}

/* ---------- RENDUS D'ÉCRANS ---------- */

// Écran : application expirée
function renderExpiredScreen() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const card = createElement("div", { className: "card" });

  const header = createElement("div", { className: "card-header" });
  const title = createElement("h1", {
    className: "final-title",
    text: "🎄 Cacahuète expirée"
  });
  const text = createElement("p", {
    className: "final-text",
    text:
      "Cette application est expirée depuis le 26/12/2025. Toutes les données locales ont été supprimées. Merci d'avoir participé !"
  });

  header.appendChild(title);
  header.appendChild(text);
  card.appendChild(header);
  app.appendChild(card);
}

// Écran : reset effectué (accès via URL secrète)
function renderResetDoneScreen() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const card = createElement("div", { className: "card" });

  const header = createElement("div", { className: "card-header" });
  const title = createElement("h1", {
    className: "final-title",
    text: "🔄 Réinitialisation effectuée"
  });
  const text = createElement("p", {
    className: "final-text",
    text:
      "Toutes les données locales ont été supprimées pour cette cacahuète. Vous pouvez recharger la page pour recommencer les tests."
  });

  header.appendChild(title);
  header.appendChild(text);
  card.appendChild(header);

  const actions = createElement("div");
  const reloadBtn = createElement("button", {
    className: "button button-primary",
    text: "Recharger la page"
  });
  reloadBtn.addEventListener("click", () => {
    location.href = window.location.pathname; // recharge sans les paramètres
  });
  actions.appendChild(reloadBtn);
  card.appendChild(actions);

  const note = createElement("p", {
    className: "footer-note",
    text: "Cette fonction de reset est réservée au créateur de la cacahuète."
  });
  card.appendChild(note);

  app.appendChild(card);
}

// Écran d’accueil : choisir son prénom
function renderHomeScreen() {
  const state = getState();
  const app = document.getElementById("app");
  app.innerHTML = "";

  const card = createElement("div", { className: "card" });

  const header = createElement("div", { className: "card-header" });
  const title = createElement("h1", {
    className: "card-title",
    html: '<span class="emoji">🎁</span><span>Cacahuète de Noël</span>'
  });
  const subtitle = createElement("p", {
    className: "card-subtitle",
    text: "Clique sur ton prénom pour réaliser ton tirage."
  });

  header.appendChild(title);
  header.appendChild(subtitle);
  card.appendChild(header);

  card.appendChild(createCounterElement(state));

  const section = createElement("div", { className: "section" });
  const sectionTitle = createElement("h2", {
    className: "section-title",
    text: "Qui es-tu ?"
  });
  const sectionText = createElement("p", {
    className: "section-text",
    text: "Chaque membre de la famille réalise son tirage une seule fois sur cet appareil."
  });

  section.appendChild(sectionTitle);
  section.appendChild(sectionText);
  card.appendChild(section);

  const grid = createElement("div", { className: "grid" });

  PARTICIPANTS.forEach((name) => {
    const btn = createElement("button", {
      className: "button",
      text: name
    });

    btn.addEventListener("click", () => {
      const st = getState();
      // Si ce participant a déjà encodé sur cet appareil,
      // on ignore complètement le clic (aucun message, aucun écran).
      if (st.assignments[name]) {
        return;
      }
      // Sinon, on passe à l'écran de sélection de la personne tirée.
      renderSelectionScreen(name);
    });

    grid.appendChild(btn);
  });

  card.appendChild(grid);

  const note = createElement("p", {
    className: "footer-note",
    text: "Les informations restent uniquement sur cet appareil et ne peuvent pas être consultées ensuite."
  });
  card.appendChild(note);

  app.appendChild(card);
}

// Écran de sélection de la personne tirée
function renderSelectionScreen(currentParticipant) {
  const state = getState();
  const app = document.getElementById("app");
  app.innerHTML = "";

  const card = createElement("div", { className: "card" });

  const header = createElement("div", { className: "card-header" });
  const title = createElement("h1", {
    className: "card-title",
    html: '<span class="emoji">✨</span><span>Ton tirage</span>'
  });
  const subtitle = createElement("p", {
    className: "card-subtitle",
    text: `Tu es : ${currentParticipant}`
  });

  header.appendChild(title);
  header.appendChild(subtitle);
  card.appendChild(header);

  card.appendChild(createCounterElement(state));

  const section = createElement("div", { className: "section" });
  const sectionTitle = createElement("h2", {
    className: "section-title",
    text: "Choisis une personne à gâter 🎄"
  });
  const sectionText = createElement("p", {
    className: "section-text",
    text: "Tu ne peux pas te tirer toi-même, ni quelqu'un déjà attribué sur cet appareil."
  });

  section.appendChild(sectionTitle);
  section.appendChild(sectionText);
  card.appendChild(section);

  const errorBox = createElement("div", {
    className: "message message-error",
    text: "Ce choix n’est pas possible. Merci de choisir une autre personne."
  });
  errorBox.style.display = "none";
  card.appendChild(errorBox);

  const grid = createElement("div", { className: "grid" });

  PARTICIPANTS.forEach((name) => {
    const btn = createElement("button", {
      className: "button",
      text: name
    });

    btn.addEventListener("click", () => {
      // Contrôle "pas soi-même"
      if (name === currentParticipant) {
        errorBox.style.display = "block";
        return;
      }

      const st = getState();
      // Contrôle "pas quelqu’un déjà attribué" sur ce navigateur
      if (st.taken[name]) {
        errorBox.style.display = "block";
        return;
      }

      // Si tout va bien, passer à l'écran de confirmation
      errorBox.style.display = "none";
      renderConfirmationScreen(currentParticipant, name);
    });

    grid.appendChild(btn);
  });

  card.appendChild(grid);

  app.appendChild(card);
}

// Écran de confirmation
function renderConfirmationScreen(currentParticipant, selectedPerson) {
  const state = getState();
  const app = document.getElementById("app");
  app.innerHTML = "";

  const card = createElement("div", { className: "card" });

  const header = createElement("div", { className: "card-header" });
  const title = createElement("h1", {
    className: "card-title",
    html: '<span class="emoji">✅</span><span>Confirmation</span>'
  });
  const subtitle = createElement("p", {
    className: "card-subtitle",
    text: "Vérifie ton tirage avant de valider."
  });

  header.appendChild(title);
  header.appendChild(subtitle);
  card.appendChild(header);

  card.appendChild(createCounterElement(state));

  const details = createElement("div", { className: "section" });
  const p1 = createElement("p", {
    className: "section-text",
    text: `Tu es : ${currentParticipant}`
  });
  const p2 = createElement("p", {
    className: "section-text",
    text: `Tu as sélectionné : ${selectedPerson}`
  });

  details.appendChild(p1);
  details.appendChild(p2);
  card.appendChild(details);

  const actions = createElement("div", { className: "grid" });

  const confirmBtn = createElement("button", {
    className: "button button-primary",
    text: "Confirmer"
  });
  confirmBtn.addEventListener("click", () => {
    const st = getState();

    // Double-check des règles métier au moment de confirmer
    if (selectedPerson === currentParticipant) {
      // ne devrait jamais arriver, mais on sécurise
      renderSelectionScreen(currentParticipant);
      return;
    }
    if (st.taken[selectedPerson]) {
      // la personne vient d'être prise entre temps sur ce même appareil
      renderSelectionScreen(currentParticipant);
      return;
    }

    // Enregistrer le tirage
    // Gestion du comptage : si c'est la première fois pour ce participant,
    // on incrémente completedCount.
    const alreadyAssigned = Boolean(st.assignments[currentParticipant]);
    st.assignments[currentParticipant] = selectedPerson;
    st.taken[selectedPerson] = true;
    if (!alreadyAssigned) {
      st.completedCount = (st.completedCount || 0) + 1;
    }

    saveState(st);

    // Afficher l’écran final sans possibilité de retour
    renderThankYouScreen();
  });

  const cancelBtn = createElement("button", {
    className: "button button-secondary",
    text: "Annuler"
  });
  cancelBtn.addEventListener("click", () => {
    renderSelectionScreen(currentParticipant);
  });

  actions.appendChild(confirmBtn);
  actions.appendChild(cancelBtn);
  card.appendChild(actions);

  const note = createElement("p", {
    className: "footer-note",
    text: "Une fois confirmé, ton tirage ne pourra plus être revu ou modifié."
  });
  card.appendChild(note);

  app.appendChild(card);
}

// Écran final après confirmation
function renderThankYouScreen() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const card = createElement("div", { className: "card" });

  const header = createElement("div", { className: "card-header" });
  const title = createElement("h1", {
    className: "final-title",
    text: "🎅 Merci !"
  });
  const text = createElement("p", {
    className: "final-text",
    text:
      "Ton tirage a été enregistré sur cet appareil. Tu peux maintenant fermer cette page et garder le secret jusqu’au réveillon."
  });

  header.appendChild(title);
  header.appendChild(text);
  card.appendChild(header);

  const note = createElement("p", {
    className: "footer-note",
    text: "Il n’est pas possible de consulter ou modifier les tirages par la suite."
  });
  card.appendChild(note);

  app.appendChild(card);
}

/* ---------- INITIALISATION ---------- */

window.addEventListener("DOMContentLoaded", () => {
  // 1. Vérifier l’expiration : si expirée, on affiche uniquement cet écran.
  if (checkExpiration()) {
    return;
  }

  // 2. Vérifier le paramètre secret de reset : si présent et correct, on affiche l'écran de reset.
  if (checkSecretReset()) {
    return;
  }

  // 3. Comportement normal : afficher l’écran d’accueil.
  renderHomeScreen();
});
