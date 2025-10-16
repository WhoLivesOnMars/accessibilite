const toggle = document.querySelector('.menu-toggle');
const menubar = document.querySelector('.menubar');

toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !expanded);
    menubar.classList.toggle('show');
});

const mainButtons = Array.from(document.querySelectorAll('.menu-button, .top-link'));

mainButtons.forEach((btn, index) => {
    const submenu = document.getElementById(btn.getAttribute('aria-controls'));
    const items = submenu ? Array.from(submenu.querySelectorAll('[role="menuitem"]')) : [];

    if (submenu) {
        items.forEach(mi => mi.setAttribute('tabindex', '-1'));
        submenu.setAttribute('aria-hidden', 'true');
    }

    const closeMenu = () => {
        if (!submenu) return;
        submenu.hidden = true;
        submenu.setAttribute('aria-hidden', 'true');
        btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', () => {
        if (!submenu) return;
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        document.querySelectorAll('.menu-button').forEach(b => {
            if (b !== btn) {
                const s = document.getElementById(b.getAttribute('aria-controls'));
                s.hidden = true;
                b.setAttribute('aria-expanded', 'false');
            }
        });
        if (expanded) closeMenu();
        else {
            submenu.hidden = false;
            submenu.setAttribute('aria-hidden', 'false');
            btn.setAttribute('aria-expanded', 'true');
            items[0]?.focus();
        }
    });

    btn.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (submenu && submenu.hidden) btn.click();
            items[0]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (submenu && submenu.hidden) btn.click();
            items[items.length - 1]?.focus();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            const next = mainButtons[(index + 1) % mainButtons.length];
            next.focus();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const prev = mainButtons[(index - 1 + mainButtons.length) % mainButtons.length];
            prev.focus();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeMenu();
            btn.focus();
        } else if (e.key === 'Tab') {
            setTimeout(() => {
                if (!submenu || (!submenu.contains(document.activeElement) && document.activeElement !== btn)) {
                    closeMenu();
                }
            }, 0);
        }
    });

if (submenu) {
    submenu.addEventListener('keydown', e => {
        const idx = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            items[(idx + 1) % items.length].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            items[(idx - 1 + items.length) % items.length].focus();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            closeMenu();
            btn.focus();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            closeMenu();
            const mainButtons = Array.from(document.querySelectorAll('.menu-button, .top-link'));
            const btnIndex = mainButtons.indexOf(btn);
            const nextBtn = mainButtons[(btnIndex + 1) % mainButtons.length];
            nextBtn.focus();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeMenu();
            btn.focus();
        } else if (e.key === 'Tab') {
            setTimeout(() => {
                if (!submenu.contains(document.activeElement) && document.activeElement !== btn) {
                    closeMenu();
                }
            }, 0);
        }
    });


        submenu.addEventListener('focusout', () => {
            setTimeout(() => {
                if (!submenu.contains(document.activeElement) && document.activeElement !== btn) {
                    closeMenu();
                }
            }, 10);
        });
    }
});



    // ======= VALIDATION FORMULAIRE (accessible) ANJA =======
(function () {
  const form = document.getElementById('contact-form');
  const errorSummary = document.getElementById('error-summary');
  const errorList = document.getElementById('error-list');
  const $ = (id) => document.getElementById(id);

  // --- Helpers
  function setFieldError(fieldId, message) {
    const field = $(fieldId);
    const err = $(fieldId + '-err');
    if (!field || !err) return;

    err.textContent = message || '';
    if (message) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }
  }

  function addSummaryError(fieldId, message) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + fieldId;
    a.textContent = message;
    a.addEventListener('click', () => $(fieldId)?.focus());
    li.appendChild(a);
    errorList.appendChild(li);
  }

  function validateEmail(value) {
    if (!value.trim()) return 'Veuillez entrer votre adresse e-mail.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? ''
      : 'Veuillez entrer une adresse e-mail valide (ex. nom@domaine.fr).';
  }

  // Téléphone : autorise +, espaces, tirets, parenthèses ; 9 à 15 chiffres au total.
  function validateTel(value) {
    const v = value.trim();
    if (!v) return ''; // optionnel
    const re = /^\+?\d(?:[ \-]?\d|\(\d+\)|\d){8,14}$/;
    return re.test(v)
      ? ''
      : 'Format invalide. Exemple : +33 6 12 34 56 78 ou 06 12 34 56 78.';
  }

  // --- Nouveaux validateurs pour prénom/nom : min 2 caractères
  function validateMinLen(v, label, min) {
    const t = v.trim();
    if (!t) return `Veuillez entrer votre ${label}.`;
    if (t.length < min) return `Votre ${label} doit contenir au moins ${min} caractères.`;
    return '';
  }
  const valPrenom = (v) => validateMinLen(v, 'prénom', 2);
  const valNom    = (v) => validateMinLen(v, 'nom', 2);

  const valSujet = (v) => v ? '' : 'Veuillez sélectionner un objet.';
  const valMsg = (v) => {
    const t = v.trim();
    if (!t) return 'Veuillez saisir votre message.';
    if (t.length > 500) return 'Votre message dépasse 500 caractères.';
    return '';
  };
  const valConsent = (b) => b ? '' : 'Vous devez accepter l’utilisation de vos données.';

  // --- Compteur message live
  const msg = $('message');
  const msgCount = $('message-count');
  if (msg && msgCount) {
    const updateCount = () => { msgCount.textContent = `${msg.value.length} / 500`; };
    msg.addEventListener('input', updateCount);
    updateCount();
  }

  // --- Validation au submit
  function runValidation(e) {
    errorList.innerHTML = '';
    errorSummary.hidden = true;

    const prenom = $('prenom')?.value || '';
    const nom = $('nom')?.value || '';
    const email = $('email')?.value || '';
    const tel = $('tel')?.value || '';
    const sujet = $('sujet')?.value || '';
    const message = $('message')?.value || '';
    const consent = $('consentement')?.checked || false;

    ['prenom','nom','email','tel','sujet','message','consentement'].forEach(id => setFieldError(id, ''));

    const errors = [
      ['prenom', valPrenom(prenom)],
      ['nom',    valNom(nom)],
      ['email',  validateEmail(email)],
      ['tel',    validateTel(tel)],
      ['sujet',  valSujet(sujet)],
      ['message',valMsg(message)],
      ['consentement', valConsent(consent)]
    ].filter(([, msg]) => !!msg);

    if (errors.length) {
      e.preventDefault();
      errors.forEach(([id, msg]) => {
        setFieldError(id, msg);
        addSummaryError(id, msg);
      });
      errorSummary.hidden = false;
      errorSummary.setAttribute('tabindex', '-1');
      errorSummary.focus();
      return;
    }

    // Si tout est OK : stocker, rediriger vers la page de confirmation
    e.preventDefault(); // retirer si traitement côté serveur
    const payload = {
      prenom: prenom.trim(),
      nom: nom.trim(),
      email: email.trim(),
      tel: tel.trim(),
      sujet,
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    try { sessionStorage.setItem('contactPayload', JSON.stringify(payload)); } catch (_) {}
    window.location.href = 'confirmation.html';
  }

  form.addEventListener('submit', runValidation);

  // --- Validation “au fil de l’eau”
  [
    ['prenom', valPrenom],
    ['nom',    valNom],
    ['email',  validateEmail],
    ['tel',    validateTel],
    ['sujet',  valSujet],
    ['message',valMsg]
  ].forEach(([id, fn]) => {
    const field = $(id);
    if (!field) return;
    const ev = field.tagName === 'SELECT' ? 'change' : 'input';
    const check = () => setFieldError(id, fn(field.value));
    field.addEventListener(ev, check);
    field.addEventListener('blur', check);
  });
})();
// ======= FIN VALIDATION FORMULAIRE (accessible) ANJA =======
