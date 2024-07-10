import stopwatch from "./js/stopwatch.js";
import timer from "./js/timer.js";

stopwatch();
timer();

window.timerPanel = () => panelSection("timer");
window.stopwatchPanel = () => panelSection("stopwatch");

function panelSection(section) {
  document.getElementById("timerBtn").toggleAttribute("active", section === "timer");
  document.getElementById("stopwatchBtn").toggleAttribute("active", section === "stopwatch");

  document.getElementById("timer").toggleAttribute("active", section === "timer");
  document.getElementById("stopwatch").toggleAttribute("active", section === "stopwatch");

  document.title = "TimerJS - " + (section === "timer" ? "Temporizador" : "Cronômetro");
}
