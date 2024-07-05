let timestamp = 0;
let elapsedTime = 0;
let intervalClock;

const commands = {
  start() {
    timestamp = Date.now() - elapsedTime;

    intervalClock = setInterval(() => {
      const timer = new Date(Date.now() - timestamp);

      elapsedTime = Date.now() - timestamp;
      self.postMessage([timer.getUTCHours(), timer.getUTCMinutes(), timer.getUTCSeconds(), timer.getUTCMilliseconds()]);
    }, 76);
  },
  stop() {
    clearInterval(intervalClock);
  },
  reset() {
    clearInterval(intervalClock);
    elapsedTime = 0;
    self.postMessage([0, 0, 0, 0]);
  },
};

self.onmessage = function (e) {
  if (!e.data.command) return;

  const command = e.data.command;

  if (commands[command]) {
    commands[command]();
    return;
  }
};
