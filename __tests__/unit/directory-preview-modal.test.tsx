// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DirectoryPreviewModal from '../../src/components/directory/DirectoryPreviewModal';
import type { DirectoryProfileItem } from '../../src/lib/types/directory';
import { installDialogStubs } from '../setup/dialog-test-utils';

const profile: DirectoryProfileItem = {
  id: 'profile-1', name: 'Perfil Demo', slug: 'perfil-demo', profession: 'Diseñador',
  bio: 'Biografía de prueba', theme: 'dark', category: 'Diseño', skills: ['React'],
  featuredProjects: [],
};

describe('DirectoryPreviewModal', () => {
  beforeEach(() => {
    installDialogStubs();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('shows an accessible preview, scrollable body and preserved portfolio link', () => {
    render(<DirectoryPreviewModal profile={profile} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: /Vista rápida.*Perfil Demo/i })).toBeTruthy();
    expect(screen.getByTestId('directory-preview-scroll')).toBeTruthy();
    const link = screen.getByRole('link', { name: /Ver portafolio completo/i });
    expect(link.getAttribute('href')).toBe('/perfil-demo');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('closes from the close button and renders no dialog without a profile', async () => {
    const onClose = vi.fn();
    const { rerender } = render(<DirectoryPreviewModal profile={profile} onClose={onClose} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar' })[1]);
    expect(onClose).toHaveBeenCalledOnce();

    rerender(<DirectoryPreviewModal profile={null} onClose={onClose} />);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
