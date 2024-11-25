document.addEventListener("DOMContentLoaded", () => {
  const settingsButton = document.getElementById("settingsButton");
  const settingsPanel = document.getElementById("settingsPanel");
  const closeSettingsButton = document.getElementById("closeSettings");
  const navbar = document.getElementById("navbar");
  const navbarButton = document.getElementById("navbarButton");

  if (settingsButton) {
    settingsButton.addEventListener("click", () => {
      settingsPanel.classList.toggle("open");
      navbar.classList.remove("open");
    });
  }

  if (closeSettingsButton) {
    closeSettingsButton.addEventListener("click", () => {
      settingsPanel.classList.remove("open");
    });
  }

  if (navbarButton) {
    navbarButton.addEventListener("click", () => {
      const isNavbarOpen = navbar.classList.toggle("open");
      navbarButton.style.left = isNavbarOpen ? "200px" : "0px";
      settingsPanel.classList.remove("open");
    });
  }

  window.openTab = function (evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");

    if (
      tabName === "settingsTab" ||
      tabName === "buttonMapping" ||
      tabName === "profileTab" ||
      tabName === "changelogs" ||
      tabName === "custom-assets" ||
      tabName === "tutorialTab" ||
      tabName === "donateTab"
    ) {
      settingsPanel.classList.add("open");
      navbar.classList.remove("open");
    } else {
      settingsPanel.classList.remove("open");
    }
  };
});

function copyURL() {
  const userId = getUserId();
  const basePath =
    "https://mortisdg.github.io/my-page/projects/InputDisplay/index.html";
  const url = `${basePath}#stream&user=${userId}`;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      alert("URL copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
}

function getUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem("userId", userId);
  }
  return userId;
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
