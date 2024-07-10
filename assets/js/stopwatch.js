const stopwatchElement = document.getElementById("stopwatch");
const worker = new Worker("assets/js/stopwatchWorker.js", { type: "module" });

const display = {
  hour: stopwatchElement.querySelector('[type="hour"]'),
  minute: stopwatchElement.querySelector('[type="minute"]'),
  second: stopwatchElement.querySelector('[type="second"]'),
  millisecond: stopwatchElement.querySelector('[type="millisecond"]'),
};

const roles = {
  play() {
    toggleButtonState("pause");
    worker.postMessage({ command: "start" });
    stopwatchElement.querySelector('[role="pause"]').focus();
  },
  pause() {
    worker.postMessage({ command: "stop" });
    toggleButtonState("play");
    stopwatchElement.querySelector('[role="play"]').focus();
  },
  reset() {
    worker.postMessage({ command: "reset" });
    toggleButtonState("play");
    stopwatchElement.querySelector('[role="play"]').focus();
  },
};

worker.onmessage = function (e) {
  if (!stopwatchElement.hasAttribute("active")) return;

  display.millisecond.textContent = e.data[3].toString().padStart(3, "0").slice(0, -1);

  display.second.textContent = e.data[2].toString().padStart(2, "0");

  display.minute.textContent =
    e.data[0] > 0 ? e.data[1].toString().padStart(2, "0") : e.data[1] > 0 ? e.data[1].toString().padStart(2, "0") : "";

  display.hour.textContent = e.data[0] ? e.data[0].toString().padStart(2, "0") : "";
};

export default function stopwatch() {
  stopwatchElement.addEventListener("click", (e) => {
    if (!e.target.closest("button") || !e.target.closest("button").hasAttribute("role")) return;

    let role = e.target.closest("button").getAttribute("role");

    if (roles[role]) roles[role]();
  });
}

function toggleButtonState(state) {
  stopwatchElement
    .querySelector('[role="play"]')
    .closest("li")
    .toggleAttribute("hidden", state === "pause");
  stopwatchElement
    .querySelector('[role="pause"]')
    .closest("li")
    .toggleAttribute("hidden", state === "play");
}
