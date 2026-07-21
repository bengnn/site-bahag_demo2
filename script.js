document.documentElement.classList.remove("no-js");

// --- CONFIGURATION SANITY ---
const SANITY_PROJECT_ID = "xnhbgvxu"; 
const SANITY_DATASET = "production";
const SANITY_VERSION = "v2023-08-01";

// Requête GROQ
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

// --- FIX RETOUR À L'ACCUEIL AU RAFRAÎCHISSEMENT ---
if (window.history && history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);

if (window.location.hash && window.location.hash !== '#home') {
  window.history.replaceState(null, null, window.location.pathname + window.location.search);
}

document.addEventListener("DOMContentLoaded", () => {
  
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 10);

  // --- 1. GESTION DU MENU MOBILE ---
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768 && sidebar) {
        sidebar.classList.remove('active');
      }
    });
  });

  // --- 2. ANIMATION AU SCROLL ---
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { 
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });

  // --- INTERCONNEXION SANITY (INJECTION DES DONNÉES) ---
  fetch(SANITY_URL)
    .then(response => response.json())
    .then(json => {
      const data = json.result;
      if (!data) return;

      // Bandeau d'alerte global
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

        // Directeurs
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

        // Rôles
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
          if (!item.imageUrl) return;
          const key = (item.date && item.date.length >= 7) ? item.date.substring(0, 7) : 'ongoing';
          if (!monthlyGroups[key]) monthlyGroups[key] = [];
          monthlyGroups[key].push(item);
        });

        const translateMonth = (str) => {
          if (str === 'ongoing') return "En cours / Photos récentes";
          const [year, month] = str.split('-');
          const monthsFr = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
          const monthIndex = parseInt(month, 10) - 1;
          return `${monthsFr[monthIndex] || ''} ${year}`;
        };

        const sortedKeys = Object.keys(monthlyGroups).sort().reverse();

        if (sortedKeys.length > 0) {
          galleryMain.innerHTML = sortedKeys.map(monthKey => `
            <section class="month-section" style="margin-bottom: 40px;">
              <h2 class="month-title" style="margin-bottom: 20px;">${translateMonth(monthKey)}</h2>
              <div class="grid-4x4 mt-3">
                ${monthlyGroups[monthKey].map(photo => `
                  <div class="photo-card visible" style="border-radius: 8px; overflow: hidden;">
                    <div class="photo-img" style="background: url('${photo.imageUrl}') center/cover no-repeat; height:200px;"></div>
                    ${photo.title ? `<div class="photo-caption" style="padding: 10px;">${photo.title}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </section>
          `).join('');
        }
      }

      // Activer l'observer sur tous les éléments reveal
      document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
    })
    .catch(err => console.error("Erreur Sanity :", err));

  // --- 3. SCROLL SPY (Mise en gras de l'onglet actif au scroll) ---
  const sections = document.querySelectorAll(".section-anchor");

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove("active"));
        const id = entry.target.getAttribute("id");
        const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
        if (activeLink && !activeLink.classList.contains('highlight')) {
          activeLink.classList.add("active");
        }
      }
    });
  }, { 
    rootMargin: "-20% 0px -70% 0px"
  });

  sections.forEach(section => sectionObserver.observe(section));

  // --- 4. GESTION DU FORMULAIRE DE CANDIDATURE ---
  const form = document.getElementById("applicationForm");
  const successModal = document.getElementById("successModal");
  const closeSuccess = document.getElementById("closeSuccess");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const applicant = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        role: document.getElementById("role").value,
        message: document.getElementById("message").value,
      };
      console.log("Nouvelle candidature reçue :", applicant);
      if (successModal) successModal.style.display = "block";
      form.reset();
    });
  }

  if (closeSuccess) {
    closeSuccess.addEventListener("click", () => {
      if (successModal) successModal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target == successModal) {
      if (successModal) successModal.style.display = "none";
    }
  });

});