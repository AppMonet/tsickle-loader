export declare interface PublicAPI {
  start: () => void;
  stop: () => void;
}

class Timer {
  private intervalHandle: number | null;

  constructor(private interval: number, private callback: () => void) {}

  public cancel() {
    if (this.intervalHandle != null) {
      clearInterval(this.intervalHandle);
    }
  }

  public start() {
    this.cancel();
    this.intervalHandle = window.setInterval(() => this.run(), this.interval);
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
    instance.start();
  },
  stop() {
    instance.cancel();
  }
};
