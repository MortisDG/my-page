const SHEET_ID = "1Fvs9U7sGzVMKvYq3p9lNBBQDW9UeVdSMqf9L9nTximU"; // Replace with your Google Sheet ID
const API_KEY = "AIzaSyCARKI3g7q5mFojRi2fesI5YoPl6fQ8-2g"; // Replace with your API Key
const RANGE = "Sheet1!A2:D12"; // Replace with your desired range (e.g., columns A-D, rows 1-11)

async function fetchSheetData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    populateTable(data.values); // Populate table with data from the sheet
  } catch (error) {
    console.error("Error fetching sheet data:", error);
  }
}

function populateTable(data) {
  const tableBody = document.getElementById("progress-table");
  tableBody.innerHTML = ""; // Clear existing rows

  let totalProgress = 0;
  let rowCount = 0;
  let totalTime = 0;

  data.forEach((row) => {
    const tableRow = document.createElement("tr");
    row.forEach((cell, index) => {
      const tableCell = document.createElement("td");
      tableCell.innerText = cell;

      // Handle progress column
      if (index === 1) {
        const progressValue = parseFloat(cell.replace("%", "")) || 0;
        totalProgress += progressValue;
        rowCount++;
      }

      // Handle time column
      if (index === 3 && cell !== "???") {
        const timeValue = parseFloat(cell);
        totalTime += timeValue;
      }

      tableRow.appendChild(tableCell);
    });
    tableBody.appendChild(tableRow);
  });

  // Calculate average progress
  const averageProgress = (totalProgress / rowCount).toFixed(2);
  document.getElementById("total-percentage").innerText = `${averageProgress}%`;

  // Update progress bar width
  const progressFill = document.querySelector(".progress-fill");
  progressFill.style.width = `${averageProgress}%`;

  // Update final time
  document.querySelector(
    ".finalTime p"
  ).innerText = `Final Time: ${totalTime.toFixed(2)}`;
}

// Fetch and populate data on page load
fetchSheetData();
