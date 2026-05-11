class ToastEmitter {
  constructor() {
    this._listeners = new Set();
    this._recentKeys = new Set();
  }

  emit(toast) {
    const key = `${toast.title}||${toast.message}`;
    if (this._recentKeys.has(key)) return;

    this._recentKeys.add(key);
    setTimeout(() => this._recentKeys.delete(key), 2000);

    this._listeners.forEach((fn) => fn(toast));
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }
}

// Force recreate — ensures _recentKeys exists after updates
window.__toastEmitter = new ToastEmitter();

export const toastEmitter = window.__toastEmitter;