import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from '@/lib/router-shim';

/**
 * Renders a component wrapped in MemoryRouter with a :lang param.
 * Simulates the app's /:lang/* route structure.
 */
export function renderWithRouter(ui, { route = '/en', lang = 'en' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/:lang/*" element={ui} />
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}
