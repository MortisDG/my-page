document.addEventListener("DOMContentLoaded", () => {
  const BackgroundColor = document.getElementById("BackgroundColor");
  const dropShadowColor = document.getElementById("dropShadowColor");
  const dropShadowOpacity = document.getElementById("dropShadowOpacity");
  const lockLayoutCheckbox = document.getElementById("lockLayout");
  const savePositionsButton = document.getElementById("savePositions");
  const uploadSettingsButton = document.getElementById("uploadSettings");
  const fileInput = document.getElementById("fileInput");
  const toggleBackgroundCheckbox = document.getElementById("toggleBackground");
  const inputDisplay = document.getElementById("inputDisplay");

  function applySavedSettings() {
    const savedBackgroundColor = localStorage.getItem("BackgroundColor");
    if (savedBackgroundColor) {
      document.body.style.backgroundColor = savedBackgroundColor;
      BackgroundColor.value = savedBackgroundColor;
    }
    const savedDropShadowColor = localStorage.getItem("dropShadowColor");
    if (savedDropShadowColor) {
      dropShadowColor.value = savedDropShadowColor;
      const rgbColor = hexToRgb(savedDropShadowColor);
      document.documentElement.style.setProperty(
        "--drop-shadow-color",
        rgbColor
      );
    }
    const savedDropShadowOpacity = localStorage.getItem("dropShadowOpacity");
    if (savedDropShadowOpacity) {
      dropShadowOpacity.value = savedDropShadowOpacity;
      document.documentElement.style.setProperty(
        "--drop-shadow-opacity",
        savedDropShadowOpacity
      );
    }
    const savedLockLayout = localStorage.getItem("lockLayout") === "true";
    lockLayoutCheckbox.checked = savedLockLayout;
  }

  applySavedSettings();

  // Event Listeners
  BackgroundColor.addEventListener("input", (event) => {
    const newColor = event.target.value;
    document.body.style.backgroundColor = newColor;
    localStorage.setItem("BackgroundColor", newColor);
  });

  dropShadowColor.addEventListener("input", () => {
    const color = dropShadowColor.value;
    const rgbColor = hexToRgb(color);
    document.documentElement.style.setProperty("--drop-shadow-color", rgbColor);
    localStorage.setItem("dropShadowColor", color);
  });

  dropShadowOpacity.addEventListener("input", () => {
    const opacity = dropShadowOpacity.value;
    document.documentElement.style.setProperty(
      "--drop-shadow-opacity",
      opacity
    );
    localStorage.setItem("dropShadowOpacity", opacity);
  });

  lockLayoutCheckbox.addEventListener("change", () => {
    const isChecked = lockLayoutCheckbox.checked;
    localStorage.setItem("lockLayout", isChecked);
  });

  savePositionsButton.addEventListener("click", () => {
    const settings = collectSettings();
    localStorage.setItem("userSettings", JSON.stringify(settings));
    alert("Positions saved!");
  });

  uploadSettingsButton.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", loadSettingsFromFile);

  toggleBackgroundCheckbox.addEventListener("change", () => {
    const isChecked = toggleBackgroundCheckbox.checked;
    localStorage.setItem("backgroundEnabled", isChecked);
    updateBackgroundImage(isChecked);
  });

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }

  function collectSettings() {
    return {
      BackgroundColor: localStorage.getItem("BackgroundColor"),
      dropShadowColor: localStorage.getItem("dropShadowColor"),
      dropShadowOpacity: localStorage.getItem("dropShadowOpacity"),
      lockLayout: localStorage.getItem("lockLayout") === "true",
    };
  }

  function loadSettingsFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const uploadedSettings = JSON.parse(e.target.result);
        Object.keys(uploadedSettings).forEach((key) => {
          localStorage.setItem(key, uploadedSettings[key]);
        });
        alert("Settings loaded!");
        applySavedSettings();
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  }

  function updateBackgroundImage(isEnabled) {
    inputDisplay.style.backgroundImage = isEnabled
      ? "url('assets/Shell.png')"
      : "none";
  }
});
