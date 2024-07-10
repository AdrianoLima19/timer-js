let intervalId, timestamp, timerDuration;

timestamp = timerDuration = 300000;

const commands = {
  start() {
    setTimeout(
      () => {
        const endTime = Date.now() + timerDuration;

        if (!intervalId) {
          intervalId = setInterval(() => {
            const currentTime = Date.now();
            const remainingTime = endTime - currentTime;

            timerDuration = remainingTime;

            if (remainingTime <= 700) {
              clearInterval(intervalId);
              intervalId = null;
              self.postMessage({ remainingTime: 0 });
            } else {
              self.postMessage({ remainingTime });
            }
          }, 250);
        }
      },
      timerDuration < 900 ? 0 : 1000,
    );
  },
  stop() {
    clearInterval(intervalId);

    intervalId = null;
  },
  reset() {
    clearInterval(intervalId);

    intervalId = null;
    timerDuration = timestamp;

    self.postMessage({ remainingTime: timestamp });
  },
  display() {
    self.postMessage({ remainingTime: timerDuration });
  },
  replay() {
    commands.reset();
    commands.display();
    commands.start();
  },
  setTimer(newTimestamp) {
    timestamp = timerDuration = newTimestamp > 900 ? newTimestamp : 900;
  },
};

self.onmessage = function (e) {
  if (!e.data.command) return;

  const command = e.data.command;

  if (commands[command]) {
    commands[command](!e.data.newTimestamp ? "" : e.data.newTimestamp);
    return;
  }
};
