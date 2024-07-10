const timerElement = document.getElementById("timer");
const worker = new Worker("assets/js/timerWorker.js", { type: "module" });
const audio = new Audio("assets/sounds/Alarm Clock Beep.mp3");

const timerDisplay = {
  hour: timerElement.querySelector('[type="hour"]'),
  minute: timerElement.querySelector('[type="minute"]'),
  second: timerElement.querySelector('[type="second"]'),
  counter: "000000",
};

let playAudio = true;
let notification = false;
let timerNotification;

const roles = {
  play() {
    worker.postMessage({ command: "start" });
    togglePlayState("pause");
  },
  pause() {
    worker.postMessage({ command: "stop" });
    togglePlayState("play");
  },
  reset() {
    worker.postMessage({ command: "reset" });
    togglePlayState("play");
  },
  finish() {
    toggleAudioSound("off");
    pushNotification("close");
    togglePlayState("play");
    timerElement.querySelector("#panel").toggleAttribute("active", true);
    timerElement.querySelector("#timerFinish").toggleAttribute("active", false);
  },
  restart() {
    toggleAudioSound("off");
    pushNotification("close");
    timerElement.querySelector("#panel").toggleAttribute("active", true);
    timerElement.querySelector("#timerFinish").toggleAttribute("active", false);

    worker.postMessage({ command: "replay" });
  },
  turnVolumeOff() {
    playAudio = false;
    toggleAudioState("off");
  },
  turnVolumeOn() {
    playAudio = true;
    toggleAudioState("on");
  },
  turnNotificationsOff() {
    toggleNotificationState("off");
    notification = false;
    localStorage.setItem("OMTJS-Notification", false);
  },
  turnNotificationsOn() {
    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          toggleNotificationState("on");
          notification = true;
          localStorage.setItem("OMTJS-Notification", true);
        } else if (permission === "denied") {
          toggleNotificationState("off");
          notification = false;
          localStorage.setItem("OMTJS-Notification", false);
        }
      });
    } else if (Notification.permission === "granted") {
      toggleNotificationState("on");
      notification = true;
      localStorage.setItem("OMTJS-Notification", true);
    } else if (Notification.permission === "denied") {
      toggleNotificationState("off");
      notification = false;
      localStorage.setItem("OMTJS-Notification", false);

      let btn = timerElement.querySelector('[role="turnNotificationsOn"]');

      btn.classList.add("shake");
      btn.addEventListener(
        "animationend",
        () => {
          btn.classList.remove("shake");
        },
        { once: true },
      );
    }
  },
  edit() {
    worker.postMessage({ command: "stop" });
    togglePlayState("play");
    formatTimerDisplay(0);

    document.getElementById("panel").toggleAttribute("active", false);
    document.getElementById("edit").toggleAttribute("active", true);
    document.querySelector(".input-wrapper").style.display = "inline";
  },
  close() {
    document.getElementById("panel").toggleAttribute("active", true);
    document.getElementById("edit").toggleAttribute("active", false);
    document.querySelector(".input-wrapper").style.display = "none";

    worker.postMessage({ command: "display" });
    timerDisplay.counter = "000000";
  },
  save() {
    document.getElementById("panel").toggleAttribute("active", true);
    document.getElementById("edit").toggleAttribute("active", false);
    document.querySelector(".input-wrapper").style.display = "none";

    let hours = parseInt(timerDisplay.counter.slice(0, 2), 10);
    let minutes = parseInt(timerDisplay.counter.slice(2, 4), 10);
    let seconds = parseInt(timerDisplay.counter.slice(4, 6), 10);

    worker.postMessage({ command: "setTimer", newTimestamp: (hours * 60 * 60 + minutes * 60 + seconds) * 1000 });
    timerDisplay.counter = "000000";
  },
};

worker.onmessage = function (e) {
  const remainingTime = e.data.remainingTime;

  if (remainingTime > 0) {
    console.log(remainingTime);
    formatTimerDisplay(remainingTime);

    return;
  }

  toggleAudioSound("on");
  pushNotification("push");
  timerElement.querySelector("#panel").toggleAttribute("active", false);
  timerElement.querySelector("#timerFinish").toggleAttribute("active", true);
};

export default function timer() {
  timerElement.addEventListener("click", (e) => {
    if (!e.target.closest("button") || !e.target.closest("button").hasAttribute("role")) return;

    let role = e.target.closest("button").getAttribute("role");

    if (roles[role]) roles[role]();
  });

  timerElement.querySelector("input").addEventListener("input", (e) => {
    if (!isNaN(e.target.value)) {
      timerDisplay.counter = (timerDisplay.counter + e.target.value).slice(-6);

      timerDisplay.hour.textContent = timerDisplay.counter.slice(0, 2);
      timerDisplay.minute.textContent = timerDisplay.counter.slice(2, 4);
      timerDisplay.second.textContent = timerDisplay.counter.slice(4, 6);
    }

    e.target.value = "";
  });

  if (Notification.permission === "granted") {
    notification = JSON.parse(localStorage.getItem("OMTJS-Notification")) ?? true;
    notification ? toggleNotificationState("on") : toggleNotificationState("off");
  } else {
    toggleNotificationState("off");
  }
}

function togglePlayState(state) {
  timerElement
    .querySelector('[role="play"]')
    .closest("li")
    .toggleAttribute("hidden", state === "pause");
  timerElement
    .querySelector('[role="pause"]')
    .closest("li")
    .toggleAttribute("hidden", state === "play");
}

function formatTimerDisplay(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  timerElement.querySelector('[type="hour"]').textContent = String(hours).padStart(2, "0");
  timerElement.querySelector('[type="minute"]').textContent = String(minutes).padStart(2, "0");
  timerElement.querySelector('[type="second"]').textContent = String(seconds).padStart(2, "0");
}

function toggleAudioState(state) {
  timerElement
    .querySelector('[role="turnVolumeOff"]')
    .closest("li")
    .toggleAttribute("hidden", state === "off");
  timerElement
    .querySelector('[role="turnVolumeOn"]')
    .closest("li")
    .toggleAttribute("hidden", state === "on");
}

function toggleAudioSound(state) {
  if (!playAudio) return;

  if (state === "on") {
    audio.play();
  } else {
    audio.pause();
    audio.currentTime = 0;
  }
}

function toggleNotificationState(state) {
  timerElement
    .querySelector('[role="turnNotificationsOff"]')
    .closest("li")
    .toggleAttribute("hidden", state === "off");
  timerElement
    .querySelector('[role="turnNotificationsOn"]')
    .closest("li")
    .toggleAttribute("hidden", state === "on");
}

function pushNotification(state) {
  if (!notification) return;

  if (state === "push") {
    timerNotification = new Notification("TimerJS", {
      body: "Temporizador Finalizado!",
      icon: "assets/images/stopwatch.svg",
    });
    // timerNotification.show();
  } else {
    timerNotification.close();
  }
}
