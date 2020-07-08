export default class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, fn) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(fn);
    return this;
  }

  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(fn => {
        fn.apply(this, args);
      });
    }
  }

  unlisten(event, fn) {
    if (this.events.has(event)) {
      this.events.get(event).delete(fn);
    }
  }
}
