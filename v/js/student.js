const navButtons = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll(".view");

function showView(name) {
  views.forEach(view => view.classList.toggle("active", view.id === `view-${name}`));
  navButtons.forEach(button => button.classList.toggle("active", button.dataset.view === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
document.getElementById("openClass").addEventListener("click", () => showView("tasks"));

document.querySelectorAll(".accordion > .accordion-header").forEach(header => {
  header.addEventListener("click", () => {
    const accordion = header.parentElement;
    const isOpen = accordion.classList.toggle("open");
    header.setAttribute("aria-expanded", String(isOpen));
  });
});

document.getElementById("joinForm").addEventListener("submit", event => {
  event.preventDefault();
  const code = document.getElementById("classCode").value.trim();
  const message = document.getElementById("joinMessage");
  if (code.length < 4) {
    message.textContent = "Wpisz poprawny kod klasy.";
    message.className = "form-message error";
    return;
  }
  message.textContent = "Kod przyjęty demonstracyjnie. Dołączanie podłączymy do backendu.";
  message.className = "form-message info";
});

document.querySelectorAll("[data-task]").forEach(button => {
  button.addEventListener("click", () => {
    window.location.href = `task.html?task=${encodeURIComponent(button.dataset.task)}`;
  });
});


const requestedView = new URLSearchParams(window.location.search).get("view");
if (requestedView && document.getElementById(`view-${requestedView}`)) {
  showView(requestedView);
}
