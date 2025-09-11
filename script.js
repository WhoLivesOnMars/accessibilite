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