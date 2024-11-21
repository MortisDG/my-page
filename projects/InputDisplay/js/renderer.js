document.addEventListener("DOMContentLoaded", () => {
  const positionsFilePath = "./button-positions.json";
  const mappingsFilePath = "./button-mappings.json";

  const ds4Buttons = {
    0: "cross",
    1: "circle",
    2: "square",
    3: "triangle",
    4: "l1",
    5: "r1",
    6: "l2",
    7: "r2",
    8: "select",
    9: "start",
    10: "left_thumb",
    11: "right_thumb",
    12: "dpad_up",
    13: "dpad_down",
    14: "dpad_left",
    15: "dpad_right",
    16: "ps",
  };

  const buttonMappings = {
    triangle: "triangle",
    cross: "cross",
    circle: "circle",
    square: "square",
    l1: "l1",
    r1: "r1",
    l2: "l2",
    r2: "r2",
    select: "select",
    start: "start",
    left_thumb: "left_thumb",
    right_thumb: "right_thumb",
    dpad_up: "dpad_up",
    dpad_down: "dpad_down",
    dpad_left: "dpad_left",
    dpad_right: "dpad_right",
    ps: "ps",
  };

  const previousButtonStates = new Array(17).fill(false);
  const deadzone = 0.2;

  // Fetch JSON file helper
  async function fetchJSON(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok)
        throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${filePath}:`, error);
      return {};
    }
  }

  // Load and merge mappings
  async function loadMappings() {
    const mappings = await fetchJSON(mappingsFilePath);
    Object.assign(buttonMappings, mappings);
  }

  // Save mappings to localStorage
  function saveMappings() {
    const mappingElements = document.querySelectorAll(".button-map");
    mappingElements.forEach((element) => {
      const buttonId = element.id.replace("map", "").toLowerCase();
      buttonMappings[buttonId] = element.value;
    });
    localStorage.setItem("buttonMappings", JSON.stringify(buttonMappings));
  }

  document
    .getElementById("saveMapping")
    .addEventListener("click", saveMappings);

  // Handle gamepad input
  window.addEventListener("gamepadconnected", (event) => {
    console.log(
      `Gamepad connected at index ${event.gamepad.index}: ${event.gamepad.id}.`
    );
    requestAnimationFrame(updateStatus);
  });

  function updateStatus() {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];
    const ledElement = document.querySelector(".led");

    if (!gp) {
      ledElement?.classList.remove("connected");
      return;
    }

    ledElement?.classList.add("connected");

    const leftStick = {
      x: applyDeadzone(gp.axes[0], deadzone),
      y: applyDeadzone(gp.axes[1], deadzone),
    };

    const rightStick = {
      x: applyDeadzone(gp.axes[2], deadzone),
      y: applyDeadzone(gp.axes[3], deadzone),
    };

    updateJoystick("left_thumb", leftStick);
    updateJoystick("right_thumb", rightStick);

    gp.buttons.forEach((button, index) => {
      const buttonName = ds4Buttons[index];
      if (!buttonName) return;

      const mappedButtonName = buttonMappings[buttonName];
      const buttonElement = document.getElementById(mappedButtonName);

      buttonElement?.classList.toggle("pressed", button.pressed);

      if (button.pressed !== previousButtonStates[index]) {
        logButtonPress(index, button.pressed);
        previousButtonStates[index] = button.pressed;
      }
    });

    requestAnimationFrame(updateStatus);
  }

  function applyDeadzone(value, threshold) {
    return Math.abs(value) < threshold ? 0 : value;
  }

  function updateJoystick(joystickId, position) {
    const joystickElement = document.getElementById(joystickId);
    if (joystickElement) {
      joystickElement.style.transform = `translate(${position.x * 25}%, ${
        position.y * 25
      }%)`;
    }
  }

  // Load positions and render
  async function loadPositions() {
    const positions = await fetchJSON(positionsFilePath);
    Object.entries(positions).forEach(([button, pos]) => {
      const buttonElement = document.getElementById(button);
      if (buttonElement) {
        buttonElement.style.left = pos.left;
        buttonElement.style.top = pos.top;
      }
    });
  }

  function savePositions() {
    const positions = {};
    document
      .querySelectorAll(".button, .dpad, .thumb, .shoulder, .led")
      .forEach((button) => {
        positions[button.id] = {
          left: button.style.left,
          top: button.style.top,
        };
      });
    localStorage.setItem("buttonPositions", JSON.stringify(positions));
  }

  function enableDrag(button) {
    let offsetX,
      offsetY,
      dragging = false;

    button.addEventListener("mousedown", (e) => {
      if (lockLayoutCheckbox.checked) return;
      dragging = true;
      offsetX = e.clientX - button.getBoundingClientRect().left;
      offsetY = e.clientY - button.getBoundingClientRect().top;
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      button.style.left = `${e.clientX - offsetX}px`;
      button.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
      if (dragging) {
        dragging = false;
        savePositions();
      }
    });
  }

  const buttons = document.querySelectorAll(
    ".button, .dpad, .thumb, .shoulder, .led"
  );
  const lockLayoutCheckbox = document.getElementById("lockLayout");

  const savedLockLayoutState =
    localStorage.getItem("lockLayoutState") === "true";
  lockLayoutCheckbox.checked = savedLockLayoutState;

  lockLayoutCheckbox.addEventListener("change", () => {
    localStorage.setItem("lockLayoutState", lockLayoutCheckbox.checked);
  });

  buttons.forEach((button) => {
    enableDrag(button);
  });

  function logButtonPress(index, pressed) {
    const buttonName = ds4Buttons[index];
    if (buttonName) {
      console.log(`Button: ${buttonName}, Pressed: ${pressed}`);
    }
  }

  // Load data and initialize
  (async function initialize() {
    await loadMappings();
    await loadPositions();
  })();
});