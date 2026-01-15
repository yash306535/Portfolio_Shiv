// // Navbar active link highlight
// window.addEventListener("scroll", () => {
//     const sections = document.querySelectorAll("section");
//     const navLinks = document.querySelectorAll(".nav-links a");
  
//     let current = "";
//     sections.forEach(section => {
//       const sectionTop = section.offsetTop - 70;
//       if (scrollY >= sectionTop) {
//         current = section.getAttribute("id");
//       }
//     });
  
//     navLinks.forEach(link => {
//       link.classList.remove("active");
//       if (link.getAttribute("href").includes(current)) {
//         link.classList.add("active");
//       }
//     });
//   });
// // Fade-in effect for education items on scroll
document.addEventListener("scroll", function () {
    const items = document.querySelectorAll(".edu-item");
    items.forEach(item => {
      const itemPosition = item.getBoundingClientRect().top;
      const screenHeight = window.innerHeight;
  
      if (itemPosition < screenHeight - 100) {
        item.classList.add("visible");
      }
    });
  });
    