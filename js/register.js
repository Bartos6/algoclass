const form = document.getElementById("registerForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const password2 = document.getElementById("password2");
const message = document.getElementById("registerMessage");

const rules = {
  "rule-length": value => value.length >= 8,
  "rule-uppercase": value => /[A-Z]/.test(value),
  "rule-number": value => /\d/.test(value),
  "rule-special": value => /[^A-Za-z0-9]/.test(value)
};

function updateRules() {
  Object.entries(rules).forEach(([id, test]) => {
    const element = document.getElementById(id);
    element.className = test(password.value) ? "valid" : "invalid";
  });
}

password.addEventListener("input", updateRules);
updateRules();

form.addEventListener("submit", event => {
  event.preventDefault();

  const passwordIsValid = Object.values(rules)
    .every(test => test(password.value));

  if (!email.checkValidity()) {
    message.textContent = "Podaj poprawny adres e-mail.";
    message.className = "form-message error";
    return;
  }

  if (!passwordIsValid) {
    message.textContent = "Hasło nie spełnia wszystkich wymagań.";
    message.className = "form-message error";
    return;
  }

  if (password.value !== password2.value) {
    message.textContent = "Podane hasła nie są identyczne.";
    message.className = "form-message error";
    return;
  }

  message.textContent =
    "Dane są poprawne. Konto będzie zapisywane po podłączeniu backendu.";
  message.className = "form-message success";
});
