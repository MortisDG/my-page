let userData = null;

function showSpinner() {
  const spinner = document.getElementById("spinner");
  spinner.classList.remove("hidden");
}

function hideSpinner() {
  const spinner = document.getElementById("spinner");
  spinner.classList.add("hidden");
}

// Fetch Data from speedrun.com
async function fetchSpeedrunData() {
  const username = document.getElementById("username").value.trim();
  const outputDiv = document.getElementById("wrapped");

  if (!username) {
    alert("Enter a valid username!");
    return;
  }

  showSpinner();

  // API Requests
  try {
    const response = await fetch(
      `https://www.speedrun.com/api/v1/users/${username}` // Fetch username
    );
    const data = await response.json();
    if (data.data) {
      const userId = data.data.id;
      userData = await fetchRuns(userId); // Save runs globally for later use
    } else {
      alert("User not found!");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
  hideSpinner();
}

// Fetch runs data
async function fetchRuns(userId) {
  const year = parseInt(document.getElementById("year").value.trim());
  if (!year || isNaN(year)) {
    alert("Please enter a valid year.");
    return null;
  }

  let allRuns = []; // Fetch ALL runs from specified user
  let offset = 0; // Offset for pagination
  const limit = 156;
  // Maximum requests per page (256 = max limit for API request).
  //Change to lower number if the API fails to return data for specified year.
  // Using 256 on older accounts with multiple runs submitted on 2020 for example returns an error.
  //Changing it to 100 fixes it.

  // API Requests with pagination
  try {
    while (true) {
      const response = await fetch(
        `https://www.speedrun.com/api/v1/runs?user=${userId}&orderby=submitted&direction=desc&max=${limit}&offset=${offset}`
      );
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        break;
      }

      allRuns = allRuns.concat(data.data);

      if (
        !data.pagination ||
        !data.pagination.size ||
        data.data.length < limit
      ) {
        break;
      }

      offset += limit;
    }
    // Filter runs for the specified year
    const filteredRuns = allRuns.filter((run) => {
      const dateString = run.submitted || run.date;
      if (!dateString) return false;

      const runDate = new Date(dateString);
      if (isNaN(runDate.getTime())) return false;
      return runDate.getFullYear() === year && !run.level;
    });

    // DEBUG FOR TESTING
    // allRuns.forEach((run) => {
    //   console.log(
    //     "Run ID:",
    //     run.id,
    //     "Submitted Date:",
    //     run.submitted,
    //     "Date:",
    //     run.date
    //   );
    // });

    // Check if any runs were found, if not return an error
    if (filteredRuns.length === 0) {
      alert(`No runs found for ${year}!`);
      return null;
    }

    // Process the runs data, and return an error if failed
    return await processRunsData(filteredRuns);
  } catch (error) {
    console.error("Error fetching runs:", error);
    alert("Error fetching runs data. Please try again.");
    return null;
  }
}

// Fetch game and category names
async function fetchNames(ids, type) {
  const uniqueIds = [...new Set(ids)];
  const names = {};

  for (const id of uniqueIds) {
    try {
      const response = await fetch(
        `https://www.speedrun.com/api/v1/${type}/${id}` // Fetch game or category via ID
      );
      const data = await response.json();
      if (type === "games" && data.data.names) {
        names[id] = data.data.names.international; // Use international names to prevent errors
      } else if (type === "categories" && data.data.name) {
        names[id] = data.data.name; // Fetch category names
      }
    } catch (error) {
      console.error(`Error fetching ${type} data for ID ${id}:`, error);
    }
  }

  return names;
}

// Process runs data and return top games and categories
async function processRunsData(runs) {
  const gameIds = runs.map((run) => run.game);
  const categoryIds = runs.map((run) => run.category);

  const [gameNames, categoryNames] = await Promise.all([
    fetchNames(gameIds, "games"),
    fetchNames(categoryIds, "categories"),
  ]);

  const gameCounts = {};
  const categoryCounts = {};
  let totalTime = 0;

  // Process runs data and update counts
  runs.forEach((run) => {
    const gameId = run.game;
    const categoryId = run.category;
    const runTime = run.times?.primary_t || 0;

    // Calculate total time for each game/category
    totalTime += runTime;
    gameCounts[gameNames[gameId] || gameId] =
      (gameCounts[gameNames[gameId] || gameId] || 0) + 1;
    categoryCounts[categoryNames[categoryId] || categoryId] =
      (categoryCounts[categoryNames[categoryId] || categoryId] || 0) + 1;
  });

  // Return top games and categories total time
  return {
    topGames: Object.entries(gameCounts)
      .map(([name, runs]) => ({ name, runs }))
      .sort((a, b) => b.runs - a.runs),
    topCategories: Object.entries(categoryCounts)
      .map(([name, runs]) => ({ name, runs }))
      .sort((a, b) => b.runs - a.runs),
    totalTime: `${Math.floor(totalTime / 3600)} hours, ${Math.floor(
      (totalTime % 3600) / 60
    )} minutes, ${Math.round(totalTime % 60)} seconds`, // Had to use Math.round, otherwise we'd get "20.0000004783 seconds" or similar which is really annoying lol
  };
}

// Generate wrapped from all data previously collected
function generateWrappedFromData() {
  // Check if userData is available or not
  if (!userData) {
    alert("Please submit a username first!");
    return;
  }

  const outputDiv = document.getElementById("wrapped");
  outputDiv.classList.remove("hidden");
  renderWrapped(userData);
}

// Render wrapped from data
function renderWrapped(data) {
  const topGamesDiv = document.getElementById("topGames");
  const topCategoryDiv = document.getElementById("topCategory");
  const minutesSpentDiv = document.getElementById("minutesSpent");

  // Reset content of divs
  topGamesDiv.innerHTML = "";
  topCategoryDiv.innerHTML = "";
  minutesSpentDiv.innerHTML = "";

  // Top Games Rendering
  topGamesDiv.innerHTML = `<h3>Top Games:</h3>`;
  data.topGames.slice(0, 5).forEach((game, index) => {
    const gameName = game.name || "Unknown Game";
    const gameId = game.id || game.game_id || null;

    if (index === 0 && gameId) {
      // Top game with cover image (Still need to fix this bs)
      topGamesDiv.innerHTML += `
        <div>
          <img src="https://www.speedrun.com/themes/${gameId}/cover.png" alt="${gameName}" />
          <p>${gameName} - ${game.runs} runs</p>
        </div>`;
    } else {
      topGamesDiv.innerHTML += `<p>${gameName} - ${game.runs} runs</p>`;
    }
  });

  // Top Categories Rendering
  topCategoryDiv.innerHTML = `<h3>Top Categories:</h3>`;
  data.topCategories.slice(0, 5).forEach((category) => {
    const categoryName = category.name || "Unknown Category";
    topCategoryDiv.innerHTML += `<p>${categoryName} - ${category.runs} runs</p>`;
  });

  // Time Spent Rendering
  minutesSpentDiv.innerHTML = `<h3>Time Spent PBing:</h3><p>${data.totalTime}</p>`;
}

// Event listeners for buttons
document.getElementById("submit").addEventListener("click", fetchSpeedrunData);
document
  .getElementById("fetchData")
  .addEventListener("click", generateWrappedFromData);
