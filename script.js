  // Hamburger
  const toggle = document.querySelector('.menu-toggle');
  const menubar = document.querySelector('.menubar');

  toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      menubar.classList.toggle('show');
  });

  // Accessible submenu
  document.querySelectorAll('.menu-button').forEach(btn => {
      const submenu = document.getElementById(btn.getAttribute('aria-controls'));
      const items = Array.from(submenu.querySelectorAll('[role="menuitem"]'));
      
      items.forEach(mi => mi.setAttribute('tabindex','-1'));
      submenu.setAttribute('aria-hidden','true');

      const closeMenu = () => {
          submenu.hidden = true;
          submenu.setAttribute('aria-hidden','true');
          btn.setAttribute('aria-expanded','false');
      };

      btn.addEventListener('click', () => {
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          document.querySelectorAll('.menu-button').forEach(b => {
              if(b !== btn){
                  const s = document.getElementById(b.getAttribute('aria-controls'));
                  s.hidden = true;
                  b.setAttribute('aria-expanded','false');
              }
          });
          if(expanded) closeMenu();
          else {
              submenu.hidden = false;
              submenu.setAttribute('aria-hidden','false');
              btn.setAttribute('aria-expanded','true');
              items[0]?.focus();
          }
      });

      // navigation
      btn.addEventListener('keydown', e => {
          if(e.key === 'ArrowDown') {
              e.preventDefault();
              if(submenu.hidden) btn.click();
              items[0].focus();
          } else if(e.key === 'Escape') {
              e.preventDefault();
              closeMenu();
              btn.focus();
          } else if(e.key === 'Tab') {
              setTimeout(() => {
                  if(!submenu.contains(document.activeElement) && document.activeElement !== btn){
                      closeMenu();
                  }
              }, 0);
          }
      });

      // navigation inside submenu
      submenu.addEventListener('keydown', e => {
          const idx = items.indexOf(document.activeElement);
          if(e.key === 'ArrowDown'){
              e.preventDefault();
              items[(idx+1)%items.length].focus();
          } else if(e.key === 'ArrowUp'){
              e.preventDefault();
              items[(idx-1+items.length)%items.length].focus();
          } else if(e.key === 'Escape'){
              e.preventDefault();
              closeMenu();
              btn.focus();
          } else if(e.key === 'Tab') {
              setTimeout(() => {
                  if(!submenu.contains(document.activeElement) && document.activeElement !== btn){
                      closeMenu();
                  }
              },0);
          }
      });

      // Close menu 
      submenu.addEventListener('focusout', () => {
          setTimeout(() => {
              if(!submenu.contains(document.activeElement) && document.activeElement !== btn){
                  closeMenu();
              }
          }, 10);
      });
  });


    // ======= VALIDATION FORMULAIRE (accessible) ANJA =======
    (function () {
    const form = document.getElementById('form-contact');
    const errorSummary = document.getElementById('error-summary');
    const errorList = document.getElementById('error-list');
    const $ = (id) => document.getElementById(id);

    function setFieldError(fieldId, message) {
        const field = $(fieldId);
        const err = $(fieldId + '-err');
        if (!field || !err) return;
        err.textContent = message || '';
        if (message) field.setAttribute('aria-invalid', 'true');
        else field.removeAttribute('aria-invalid');
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
        return /\S+@\S+\.\S+/.test(value) ? '' : 'Veuillez entrer une adresse e-mail valide.';
    }
    function validateTel(value) {
        if (!value.trim()) return ''; // optionnel
        return /^[0-9]{10}$/.test(value) ? '' : 'Le numéro doit contenir exactement 10 chiffres, sans espaces.';
    }
    const req = (v, label) => v.trim() ? '' : `Veuillez entrer votre ${label}.`;
    const valSujet = (v) => v ? '' : 'Veuillez sélectionner un sujet.';
    const valMsg = (v) => !v.trim() ? 'Veuillez saisir votre message.' : (v.length <= 500 ? '' : 'Votre message dépasse 500 caractères.');
    const valConsent = (b) => b ? '' : 'Vous devez accepter l’utilisation de vos données.';

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
        ['prenom', req(prenom,'prénom')],
        ['nom', req(nom,'nom')],
        ['email', validateEmail(email)],
        ['tel', validateTel(tel)],
        ['sujet', valSujet(sujet)],
        ['message', valMsg(message)],
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
        }
    }

    form.addEventListener('submit', runValidation);

    // Validation “au fil de l’eau”
    [
        ['prenom', (v)=>req(v,'prénom')],
        ['nom', (v)=>req(v,'nom')],
        ['email', validateEmail],
        ['tel', validateTel],
        ['sujet', valSujet],
        ['message', valMsg]
    ].forEach(([id, fn]) => {
        const field = $(id);
        if (!field) return;
        const ev = field.tagName === 'SELECT' ? 'change' : 'input';
        field.addEventListener(ev, () => setFieldError(id, fn(field.value)));
        field.addEventListener('blur', () => setFieldError(id, fn(field.value)));
    });

    })();