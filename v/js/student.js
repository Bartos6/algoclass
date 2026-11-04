const navButtons = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll(".view");

function showView(name) {
  views.forEach(view => view.classList.toggle("active", view.id === `view-${name}`));
  navButtons.forEach(button => button.classList.toggle("active", button.dataset.view === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));


document.querySelectorAll(".accordion > .accordion-header").forEach(header => {
  header.addEventListener("click", () => {
    const accordion = header.parentElement;
    const isOpen = accordion.classList.toggle("open");
    header.setAttribute("aria-expanded", String(isOpen));
  });
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
