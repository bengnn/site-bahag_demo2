document.documentElement.classList.remove("no-js");

// --- CONFIGURATION SANITY ---
// ⚠️ REMPLACE 'TON_PROJECT_ID_ICI' PAR TON VRAI ID SANITY !
const SANITY_PROJECT_ID = "xnhbgvxu"; 
const SANITY_DATASET = "production";
const SANITY_VERSION = "v2023-08-01";

// Requête GROQ pour récupérer les données et extraire proprement les URL des images
const GROQ_QUERY = encodeURIComponent(`{
  "settings": *[_type == "siteSettings"][0],
  "home": *[_type == "homePage"][0]{
    ...,
    "heroImageUrl": heroImage.asset->url,
    "visionImageUrl": visionImage.asset->url,
    directors[]{
      ...,
      "avatarUrl": avatar.asset->url
    }
  },
  "gallery": *[_type == "galleryItem"] | order(date desc){
    ...,
    "imageUrl": image.asset->url
  }
}`);

const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_VERSION}/data/query/${SANITY_DATASET}?query=${GROQ_QUERY}`;

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

  // --- 2. ANIMATION AU SCROLL (Déclaration de l'Observer) ---
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


  // --- INTERCONNEXION SANITY (INJECTION DES DONNÉES) ---
  fetch(SANITY_URL)
    .then(response => response.json())
    .then(json => {
      const data = json.result;
      if (!data) return;

      // Récupération du bandeau d'alerte global
      if (data.settings && data.settings.bannerText) {
        const bannerP = document.querySelector('.top-banner p');
        if (bannerP) {
          bannerP.innerHTML = `🚨 ${data.settings.bannerText} <a href="#apply">${data.settings.bannerLinkText || 'Apply now'}</a>`;
        }
      }

      // Partie ACCUEIL (index.html)
      if (data.home && document.getElementById('home')) {
        const home = data.home;

        if (home.heroTitle) document.querySelector('.hero-content h1').innerText = home.heroTitle;
        if (home.heroSubtitle) document.querySelector('.value-proposition').innerText = home.heroSubtitle;
        if (home.heroReassurance) document.querySelector('.hero-content .reassurance').innerText = `✔ ${home.heroReassurance}`;
        if (home.heroImageUrl) {
          document.querySelector('.hero').style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${home.heroImageUrl}')`;
        }

        if (home.visionTitle) document.querySelector('#vision h2').innerText = home.visionTitle;
        if (home.visionText) document.querySelector('#vision .text-block p').innerText = home.visionText;
        if (home.visionImageUrl) {
          const imgBlock = document.querySelector('#vision .image-block');
          if (imgBlock) {
            imgBlock.innerHTML = `<img src="${home.visionImageUrl}" alt="Vision" style="width:100%; height:400px; object-fit:cover; border-radius:8px;">`;
          }
        }

        // Injection dynamique des directeurs
        const teamGrid = document.querySelector('#team .cards-grid');
        if (teamGrid && home.directors) {
          teamGrid.innerHTML = home.directors.map(dir => `
            <div class="card profile-card reveal">
              <div style="width:120px; height:120px; margin:0 auto 20px;">
                <img src="${dir.avatarUrl || ''}" alt="${dir.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">
              </div>
              <h3>${dir.name}</h3>
              <p class="role">${dir.role}</p>
              <p class="desc">${dir.description}</p>
            </div>
          `).join('');
        }

        // Injection dynamique des rôles recherchés
        const rolesGrid = document.querySelector('#roles .cards-grid');
        if (rolesGrid && home.neededRoles) {
          rolesGrid.innerHTML = home.neededRoles.map(role => `
            <div class="card icon-card reveal">
              <div class="icon-placeholder">${role.icon || '📐'}</div>
              <h3>${role.title}</h3>
              <p>${role.description}</p>
            </div>
          `).join('');
        }

        // Aperçu de la Galerie (4 dernières photos)
        const galleryGrid = document.querySelector('#gallery .gallery-grid');
        if (galleryGrid && data.gallery) {
          const recentPhotos = data.gallery.slice(0, 4);
          galleryGrid.innerHTML = recentPhotos.map(photo => `
            <div class="gallery-item" style="background: url('${photo.imageUrl}') center/cover no-repeat; height:200px; border-radius:4px;" title="${photo.title || ''}"></div>
          `).join('');
        }
      }

      // Partie GALERIE CHRONOLOGIQUE (gallery.html)
      const galleryMain = document.querySelector('main.container');
      if (galleryMain && !document.getElementById('home') && data.gallery) {
        const monthlyGroups = {};
        data.gallery.forEach(item => {
          const key = item.date ? item.date.substring(0, 7) : 'ongoing';
          if (!monthlyGroups[key]) monthlyGroups[key] = [];
          monthlyGroups[key].push(item);
        });

        const translateMonth = (str) => {
          if (str === 'ongoing') return "En cours";
          const [year, month] = str.split('-');
          const monthsFr = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
          return `${monthsFr[parseInt(month) - 1]} ${year}`;
        };

        galleryMain.innerHTML = Object.keys(monthlyGroups).sort().reverse().map(monthKey => `
          <section class="month-section">
            <h2 class="month-title">${translateMonth(monthKey)}</h2>
            <div class="grid-4x4 mt-3">
              ${monthlyGroups[monthKey].map(photo => `
                <div class="photo-card reveal">
                  <div class="photo-img" style="background: url('${photo.imageUrl}') center/cover no-repeat; height:200px;"></div>
                  <div class="photo-caption">${photo.title || ''}</div>
                </div>
              `).join('')}
            </div>
          </section>
        `).join('');
      }

      // On active l'Observer sur TOUS les éléments ".reveal" (les anciens + les nouveaux injectés par Sanity)
      document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
    })
    .catch(err => console.error("Erreur Sanity :", err));


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

  // La sécurité "if (form)" évite que le script ne plante sur gallery.html où le formulaire n'existe pas
  if (form) {
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
  }

  // Fermer le modal
  if (closeSuccess) {
    closeSuccess.addEventListener("click", () => {
      successModal.style.display = "none";
    });
  }

  // Fermer le modal si on clique en dehors
  window.addEventListener("click", (e) => {
    if (e.target == successModal) {
      successModal.style.display = "none";
    }
  });

});