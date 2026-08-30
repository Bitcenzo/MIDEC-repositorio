const countdownElements = {
  days: document.querySelector('#days'),
  hours: document.querySelector('#hours'),
  minutes: document.querySelector('#minutes'),
  seconds: document.querySelector('#seconds'),
};

function getNextOpeningDate() {
  const now = new Date();
  const opening = new Date(now.getFullYear(), 10, 27, 0, 0, 0); // 27 de noviembre, 00:00.

  if (opening <= now) {
    opening.setFullYear(opening.getFullYear() + 1);
  }

  return opening;
}

const openingDate = getNextOpeningDate();

function updateCountdown() {
  const remaining = Math.max(0, openingDate.getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const values = {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };

  Object.entries(values).forEach(([name, value]) => {
    countdownElements[name].textContent = String(value).padStart(2, '0');
  });
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

const accessArea = document.querySelector('.access-area');
const accessTrigger = document.querySelector('#access-trigger');
const accessForm = document.querySelector('#access-form');
const passwordInput = document.querySelector('#password');

accessTrigger.addEventListener('click', () => {
  const isOpen = accessArea.classList.toggle('is-open');
  accessTrigger.setAttribute('aria-expanded', String(isOpen));

  if (isOpen) passwordInput.focus();
});

accessForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (passwordInput.value === '12345678') {
    window.location.href = 'principal.html';
    return;
  }

  window.alert('Contraseña incorrecta. Intentá nuevamente.');
  passwordInput.select();
});