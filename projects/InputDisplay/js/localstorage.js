document.addEventListener("DOMContentLoaded", () => {
  loadDefaultSettings();
  loadSettings();

  const savePositionsButton = document.getElementById("savePositions");
  const uploadSettingsButton = document.getElementById("uploadSettings");
  const fileInput = document.getElementById("fileInput");

  savePositionsButton.addEventListener("click", handleSavePositions);
  uploadSettingsButton.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", loadSettingsFromFile);
});

function loadDefaultSettings() {
  fetch("button-positions.json")
    .then((response) => response.json())
    .then((defaultPositions) => {
      applyPositions(defaultPositions);
      console.log("Default positions loaded:", defaultPositions);
    })
    .catch((error) => console.error("Error loading default positions:", error));
}

function getButtonPositions() {
  const buttons = document.querySelectorAll(".button");
  const positions = {};

  buttons.forEach((button) => {
    const buttonId = button.id;
    const computedStyle = window.getComputedStyle(button);
    positions[buttonId] = {
      left: computedStyle.left || `${button.offsetLeft}px`,
      top: computedStyle.top || `${button.offsetTop}px`,
    };
  });

  return positions;
}

function saveSettingsToLocalStorage(settings) {
  localStorage.setItem("buttonPositions", JSON.stringify(settings));
  console.log("Settings saved to LocalStorage!", settings);
}

function downloadSettingsAsFile(settings) {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(settings));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "button-positions.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function handleSavePositions() {
  const buttonPositions = getButtonPositions();
  if (Object.keys(buttonPositions).length === 0) {
    alert(
      "No button positions found! Ensure elements have the correct IDs and class."
    );
    return;
  }
  saveSettingsToLocalStorage(buttonPositions);
  downloadSettingsAsFile(buttonPositions);
  alert("Positions saved and downloaded!");
}

function loadSettings() {
  const savedPositions = JSON.parse(
    localStorage.getItem("buttonPositions") || "{}"
  );
  applyPositions(savedPositions);
}

function loadSettingsFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const uploadedSettings = JSON.parse(e.target.result);

      localStorage.setItem("buttonPositions", JSON.stringify(uploadedSettings));
      loadSettings();
      alert("Settings loaded from file!");
      console.log("Settings loaded:", uploadedSettings);
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

function applyPositions(positions) {
  Object.entries(positions).forEach(([buttonId, pos]) => {
    const buttonElement = document.getElementById(buttonId);
    if (buttonElement) {
      buttonElement.style.left = pos.left;
      buttonElement.style.top = pos.top;
    }
  });
}

// Optional: Clear the stored positions if needed
function clearStoredPositions() {
  localStorage.removeItem("buttonPositions");
  console.log("Stored positions cleared!");
}
