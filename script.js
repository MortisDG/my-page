const clockSection = document.querySelectorAll(".clock")[0];
const dateTime = document.getElementById("date");

let sideClock = () => {
  let d = new Date();

  let date = `${d.getDate()} ${d.toLocaleString("default", {
    month: "long",
  })} ${d.getFullYear()}`;

  let hours = d.getHours();
  let minutes = d.getMinutes();
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  let time = `${hours}:${minutes} ${ampm}`;

  dateTime.innerText = `${date} - ${time}`;

  setTimeout(sideClock, 1000);
};

sideClock();
