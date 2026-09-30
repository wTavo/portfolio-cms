import { vi } from 'vitest';

/** Adds only the missing HTMLDialogElement methods in jsdom; real browser behavior is verified manually. */
export function installDialogStubs(): void {
  const prototype = HTMLDialogElement.prototype;

  Object.defineProperty(prototype, 'showModal', {
    configurable: true,
    writable: true,
    value: vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
      this.focus();
    }),
  });

  Object.defineProperty(prototype, 'close', {
    configurable: true,
    writable: true,
    value: vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    }),
  });
}
