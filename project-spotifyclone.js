const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const caption = document.getElementById("caption");
const closeBtn = document.getElementsByClassName("close")[0];
const screenshots = document.querySelectorAll(".screenshot");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let currentIndex = 0;

// Open modal with clicked image
screenshots.forEach((img, index) => {
  img.addEventListener("click", () => {
    currentIndex = index;
    showModal();
  });
});

function showModal() {
  modal.style.display = "block";
  modalImg.src = screenshots[currentIndex].src;
  caption.innerHTML = screenshots[currentIndex].alt;
}

// Close modal
closeBtn.onclick = () => {
  modal.style.display = "none";
};

// Close modal when clicking outside the image
modal.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// Show previous image
prevBtn.onclick = (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + screenshots.length) % screenshots.length;
  showModal();
};

// Show next image
nextBtn.onclick = (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % screenshots.length;
  showModal();
};
