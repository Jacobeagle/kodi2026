// URL Google Apps Script
const GAS_URL = "https://script.google.com/macros/s/AKfycbxH3hMPb60Rud30KwcajxWL8RrMwBc69_c8IZigHFY6ho9f850arq0DFvCV3R7O_DM/exec";

document.addEventListener("DOMContentLoaded", function () {
  console.log("🐛 [DEBUG]: Inicjalizacja skryptu kampanii...");

  // Inicjalizacja ikonek Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // Przełączanie zdjęć w galerii
  const gallerySlides = [
    [document.querySelector('[data-template-id="gallery-photo-1"]'), document.querySelector('[data-template-id="gallery-photo-1-alt"]')],
    [document.querySelector('[data-template-id="gallery-photo-2"]'), document.querySelector('[data-template-id="gallery-photo-3"]')],
    [document.querySelector('[data-template-id="gallery-photo-4"]'), document.querySelector('[data-template-id="gallery-photo-5"]')]
  ];
  let galleryIndex = 0;
  setInterval(function () {
    galleryIndex = (galleryIndex + 1) % 2;
    gallerySlides.forEach(function (slides) {
      slides.forEach(function (image, index) {
        if (image) image.classList.toggle("hidden", index !== galleryIndex);
      });
    });
  }, 4000);

  // Podgląd i pobieranie plakatu
  const posterImages = Array.from(document.querySelectorAll(".poster-image"));
  const randomPosterButton = document.getElementById("random-poster-button");
  const downloadPoster = document.getElementById("download-poster");
  const posterStatus = document.querySelector("[data-template-id=poster-status]");
  let activePoster = 0;

  function showPoster(index) {
    posterImages.forEach((image, imageIndex) => image.classList.toggle("hidden", imageIndex !== index));
    activePoster = index;
    if (downloadPoster && posterImages[index]) {
      downloadPoster.href = posterImages[index].src;
    }
    if (posterStatus) {
      posterStatus.textContent = "Plakat " + (index + 1) + " z " + posterImages.length + " — gotowy do pobrania.";
    }
  }

  if (randomPosterButton) {
    randomPosterButton.addEventListener("click", function () {
      let next = Math.floor(Math.random() * posterImages.length);
      if (posterImages.length > 1 && next === activePoster) next = (next + 1) % posterImages.length;
      showPoster(next);
    });
  }
  
  if (posterImages.length > 0) {
    showPoster(0);
  }

  // Licznik wsparcia
  const button = document.getElementById("support-button");
  const count = document.getElementById("support-count");
  const feedback = document.getElementById("vote-feedback");
  let signals = 0;

  if (button) {
    button.addEventListener("click", function () {
      signals += 1;
      if (count) count.textContent = signals;
      if (feedback) {
        feedback.textContent = signals === 1
          ? "SYGNAŁ ODEBRANY. TRYB HYPER: AKTYWNY."
          : "ENERGIA DODANA. SZKOŁA WCHODZI NA WYŻSZY POZIOM.";
      }
    });
  }

  // Wysyłanie propozycji do Google Apps Script
  const proposalForm = document.getElementById("proposal-form");
  const proposalInput = document.getElementById("proposal-input");
  const proposalFeedback = document.getElementById("proposal-feedback");
  const proposalSubmit = document.getElementById("proposal-submit");

  if (proposalForm) {
    proposalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      const text = proposalInput.value.trim();

      if (!text) return;

      if (!GAS_URL) {
        proposalFeedback.style.color = "var(--pink)";
        proposalFeedback.textContent = "❌ BŁĄD: Brak adresu URL usługi Google Apps Script!";
        return;
      }

      proposalSubmit.disabled = true;
      proposalFeedback.style.color = "var(--cyan)";
      proposalFeedback.textContent = "⏳ Wysyłanie...";

      const payload = { text: text };

      fetch(GAS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === "success") {
          proposalFeedback.style.color = "var(--lime)";
          proposalFeedback.textContent = "DZIĘKI! Twoja propozycja trafiła do mojego sztabu!";
          proposalInput.value = "";
        } else {
          throw new Error(data.message || "Błąd przetwarzania");
        }
      })
      .catch((error) => {
        proposalFeedback.style.color = "var(--pink)";
        proposalFeedback.textContent = `❌ Błąd wysyłania!: ${error.message}`;
      })
      .finally(() => {
        proposalSubmit.disabled = false;
      });
    });
  }
});