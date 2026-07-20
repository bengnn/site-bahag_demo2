document.documentElement.classList.remove("no-js");

// --- FIX ABSOLU DU RETOUR À L'ACCUEIL AU RAFRAÎCHISSEMENT ---
// On le place en dehors du DOMContentLoaded pour couper la mémoire du navigateur INSTANTANÉMENT
if (window.history && history.scrollRestoration) {
  history.scrollRestoration = 'manual'; // Empêche le navigateur de restaurer le scroll
}

// On force le retour en haut de page immédiat
window.scrollTo(0, 0);

// Si l'URL contient une ancre, on la nettoie proprement sans faire sursauter l'écran
if (window.location.hash && window.location.hash !== '#home') {
  window.history.replaceState(null, null, window.location.pathname + window.location.search);
}


document.addEventListener("DOMContentLoaded", () => {
  
  // Petite sécurité supplémentaire après le chargement du DOM pour consolider le retour en haut
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 10);

  // --- 1. GESTION DU MENU MOBILE ---
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const navLinks = document.querySelectorAll('.nav-link');

  // Ouvrir/Fermer le menu au clic sur l'icône
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  // Fermer le menu mobile quand on clique sur un lien
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        sidebar.classList.remove('active');
      }
    });
  });

  // --- 2. ANIMATION AU SCROLL (Micro-interactions & Storytelling) ---
  const reveals = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { 
    threshold: 0.15, // Se déclenche quand 15% de l'élément est visible
    rootMargin: "0px 0px -50px 0px"
  });

  reveals.forEach(el => revealObserver.observe(el));

  // --- 3. SCROLL SPY (Mise à jour du menu actif selon la section) ---
  const sections = document.querySelectorAll(".section-anchor");

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Enlever la classe active de tous les liens
        navLinks.forEach(link => link.classList.remove("active"));
        
        // Ajouter la classe active au lien correspondant à la section visible
        const id = entry.target.getAttribute("id");
        const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
        
        // On ne met pas en "active" le bouton Apply qui a déjà son propre style (highlight)
        if (activeLink && !activeLink.classList.contains('highlight')) {
          activeLink.classList.add("active");
        }
      }
    });
  }, { 
    rootMargin: "-20% 0px -70% 0px" // Ajustement pour détecter la section au milieu de l'écran
  });

  sections.forEach(section => sectionObserver.observe(section));

  // --- 4. GESTION DU FORMULAIRE DE CANDIDATURE ---
  const form = document.getElementById("applicationForm");
  const successModal = document.getElementById("successModal");
  const closeSuccess = document.getElementById("closeSuccess");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Simulation d'envoi de données
    const applicant = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      role: document.getElementById("role").value,
      message: document.getElementById("message").value,
    };

    console.log("Nouvelle candidature reçue :", applicant);

    // Affichage du modal de succès
    successModal.style.display = "block";
    form.reset(); // Vider le formulaire
  });

  // Fermer le modal
  closeSuccess.addEventListener("click", () => {
    successModal.style.display = "none";
  });

  // Fermer le modal si on clique en dehors
  window.addEventListener("click", (e) => {
    if (e.target == successModal) {
      successModal.style.display = "none";
    }
  });

});