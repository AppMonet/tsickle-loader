export declare interface PublicAPI {
  start: () => void;
  stop: () => void;
}

class Timer {
  private intervalHandle: number | null;

  constructor(private timeInterval: number, private callback: () => void) {}

  cancelHandle() {
    if (this.intervalHandle != null) {
      clearInterval(this.intervalHandle);
    }
  }

  startHandle() {
    this.cancelHandle();
    this.intervalHandle = window.setInterval(
      () => this.run(),
      this.timeInterval
    );
  }

  private run() {
    try {
      this.callback();
    } catch (e) {
      // do nothing
    }
  }
}

const instance = new Timer(1e3, () => console.info("doing something"));

(window as any)["mySDK"] = {
  start() {
    instance.startHandle();
  },
  stop() {
    instance.cancelHandle();
  }
};
