// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

describe('entorno DOM de pruebas React', () => {
  it('renderiza un control y resuelve su etiqueta accesible', () => {
    render(
      <label htmlFor="email">
        Correo electrónico
        <input id="email" type="email" />
      </label>,
    );

    const input = screen.getByLabelText('Correo electrónico');
    expect(input).toBe(screen.getByRole('textbox'));
  });
});
