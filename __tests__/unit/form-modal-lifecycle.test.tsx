// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoginModal from '../../src/components/home/LoginModal';
import ContactModal from '../../src/components/home/ContactModal';
import { installDialogStubs } from '../setup/dialog-test-utils';

describe('form modal reset lifecycle', () => {
  beforeEach(() => {
    installDialogStubs();
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('does not clear login values after a close followed by quick reopen', () => {
    const onClose = vi.fn();
    const { rerender } = render(<LoginModal isOpen onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'anterior@example.com' } });
    rerender(<LoginModal isOpen={false} onClose={onClose} />);
    rerender(<LoginModal isOpen onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'nuevo@example.com' } });
    act(() => { vi.advanceTimersByTime(300); });
    expect((screen.getByLabelText(/correo electrónico/i) as HTMLInputElement).value).toBe('nuevo@example.com');

    rerender(<LoginModal isOpen={false} onClose={onClose} />);
    act(() => { vi.advanceTimersByTime(251); });
    rerender(<LoginModal isOpen onClose={onClose} />);
    expect((screen.getByLabelText(/correo electrónico/i) as HTMLInputElement).value).toBe('');
  });

  it('does not clear contact values after a close followed by quick reopen', () => {
    const onClose = vi.fn();
    const { rerender } = render(<ContactModal isOpen onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Antes' } });
    rerender(<ContactModal isOpen={false} onClose={onClose} />);
    rerender(<ContactModal isOpen onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Nuevo' } });
    act(() => { vi.advanceTimersByTime(400); });
    expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('Nuevo');

    rerender(<ContactModal isOpen={false} onClose={onClose} />);
    act(() => { vi.advanceTimersByTime(301); });
    rerender(<ContactModal isOpen onClose={onClose} />);
    expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('');
  });
});
