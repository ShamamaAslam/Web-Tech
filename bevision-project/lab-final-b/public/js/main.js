document.addEventListener("DOMContentLoaded", function () {
  const viewMoreBtn = document.getElementById("viewMoreBtn");
  const moreTestimonials = document.querySelector(".more-testimonials");

  // If page doesn't have these elements, do nothing (prevents errors on other pages)
  if (!viewMoreBtn || !moreTestimonials) return;

  viewMoreBtn.addEventListener("click", function () {
    moreTestimonials.classList.toggle("show");
    viewMoreBtn.textContent = moreTestimonials.classList.contains("show")
      ? "View Less"
      : "View More";
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("accountBtn");
  const menu = document.getElementById("accountMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
  });

  document.addEventListener("click", () => {
    menu.style.display = "none";
  });
});
