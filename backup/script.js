// TUTAJ WKLEJ TWÓJ URL Z GOOGLE APPS SCRIPT (zamiast webhooka Discorda):
const GAS_URL = "https://script.google.com/macros/s/AKfycbxH3hMPb60Rud30KwcajxWL8RrMwBc69_c8IZigHFY6ho9f850arq0DFvCV3R7O_DM/exec";

document.addEventListener("DOMContentLoaded", function () {
  console.log("🐛 [DEBUG]: Inicjalizacja skryptu kampanii...");

  // Inicjalizacja ikonek Lucide
  if (window.lucide) {
    lucide.createIcons();
    console.log("🐛 [DEBUG]: Ikonki Lucide zainicjowane.");
  } else {
    console.warn("⚠️ [DEBUG]: Brak biblioteki Lucide.");
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

  // Wysyłanie propozycji przez Google Apps Script (GAS)
  const proposalForm = document.getElementById("proposal-form");
  const proposalInput = document.getElementById("proposal-input");
  const proposalFeedback = document.getElementById("proposal-feedback");
  const proposalSubmit = document.getElementById("proposal-submit");

  if (proposalForm) {
    proposalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      const text = proposalInput.value.trim();
      console.log("🐛 [DEBUG]: Próba wysłania propozycji:", text);

      if (!text) {
        console.warn("⚠️ [DEBUG]: Pole wiadomości jest puste.");
        return;
      }

      if (!GAS_URL || GAS_URL.includes("TWÓJ_WYGENEROWANY_ID_Z_GAS")) {
        console.error("❌ [DEBUG]: Brak wklejonego URL z Google Apps Script w script.js!");
        proposalFeedback.style.color = "var(--pink)";
        proposalFeedback.textContent = "❌ BŁĄD: Wklej prawidłowy URL z Google Apps Script w script.js!";
        return;
      }

      proposalSubmit.disabled = true;
      proposalFeedback.style.color = "var(--cyan)";
      proposalFeedback.textContent = "⏳ Wysyłanie do Discorda...";

      const payload = { text: text };
      console.log("🐛 [DEBUG]: Wysyłanie pakietu danych do GAS:", payload);

      // Zapytanie POST do Google Apps Script (użycie text/plain omija zapytania OPTIONS/preflight)
      fetch(GAS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
        console.log("🐛 [DEBUG]: Odpowiedź z Google Apps Script:", data);
        
        if (data.status === "success") {
          console.log("✅ [DEBUG]: Wiadomość pomyślnie wysłana przez GAS na Discorda!");
          proposalFeedback.style.color = "var(--lime)";
          proposalFeedback.textContent = "DZIĘKI! Twoja propozycja trafiła na nasz sztabowy kanał!";
          proposalInput.value = "";
        } else {
          console.error("❌ [DEBUG]: GAS zwrócił błąd:", data.message);
          throw new Error(data.message || "Błąd przetwarzania w Google Apps Script");
        }
      })
      .catch((error) => {
        console.error("❌ [DEBUG]: Szczegóły błędu wysyłania:", error);
        proposalFeedback.style.color = "var(--pink)";
        proposalFeedback.textContent = `❌ Błąd wysyłania: ${error.message}. Sprawdź konsolę (F12).`;
      })
      .finally(() => {
        proposalSubmit.disabled = false;
      });
    });
  } else {
    console.error("❌ [DEBUG]: Nie znaleziono formularza #proposal-form w HTML!");
  }
});