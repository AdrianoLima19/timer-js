const stopwatchElement = document.getElementById("stopwatch");
const worker = new Worker("assets/js/stopwatchWorker.js", { type: "module" });

const roles = {
  play() {
    toggleButtonState("pause");
    worker.postMessage({ command: "start" });
  },
  pause() {
    toggleButtonState("play");
    worker.postMessage({ command: "stop" });
  },
  reset() {
    worker.postMessage({ command: "reset" });
    toggleButtonState("play");
  },
};

worker.onmessage = function (e) {
  if (!stopwatchElement.hasAttribute("active")) return;

  stopwatchElement.querySelector('[type="millisecond"]').textContent = e.data[3]
    .toString()
    .padStart(3, "0")
    .slice(0, -1);

  stopwatchElement.querySelector('[type="second"]').textContent = e.data[2].toString().padStart(2, "0");

  stopwatchElement.querySelector('[type="minute"]').textContent =
    e.data[0] > 0 ? e.data[1].toString().padStart(2, "0") : e.data[1] > 0 ? e.data[1].toString().padStart(2, "0") : "";

  stopwatchElement.querySelector('[type="hour"]').textContent = e.data[0] ? e.data[0].toString().padStart(2, "0") : "";
};

export default function stopwatch() {
  stopwatchElement.addEventListener("click", (e) => {
    if (!e.target.hasAttribute("role")) return;

    let role = e.target.getAttribute("role");

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
