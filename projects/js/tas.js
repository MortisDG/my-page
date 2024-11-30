window.onload = () => {
  updateProgressBar();
  updateFinalTime();
};

function updateProgressBar() {
  const rows = document.querySelectorAll("#progress-table tr");
  let totalProgress = 0;
  let rowCount = 0;

  rows.forEach((row) => {
    const progressCell = row.children[1];
    const progressValue = parseFloat(progressCell.innerText.replace("%", ""));

    if (!isNaN(progressValue)) {
      totalProgress += progressValue;
      rowCount++;
    }
  });

  const averageProgress = (totalProgress / rowCount).toFixed(2);
  const totalPercentageSpan = document.getElementById("total-percentage");
  totalPercentageSpan.innerText = `${averageProgress}%`;

  const progressFill = document.querySelector(".progress-fill");
  progressFill.style.width = `${averageProgress}%`;
}

function updateFinalTime() {
  const rows = document.querySelectorAll("#progress-table tr");
  let totalSeconds = 0;

  rows.forEach((row) => {
    const timeCell = row.children[3];
    const timeText = timeCell.innerText;

    if (timeText !== "00:00.00") {
      const [minutes, seconds] = timeText.split(":").map(parseFloat);
      totalSeconds += minutes * 60 + seconds;
    }
  });

  const finalMinutes = Math.floor(totalSeconds / 60);
  const finalSeconds = (totalSeconds % 60).toFixed(2);

  const finalTimeLabel = document.querySelector(".finalTime label");
  finalTimeLabel.innerText = `Final Time: ${finalMinutes
    .toString()
    .padStart(2, "0")}:${finalSeconds.padStart(5, "0")}`;
}
