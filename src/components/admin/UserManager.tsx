/**
 * @file UserManager.tsx
 * @description Gestión reactiva de usuarios del Superadmin con unión discriminada y componentes reutilizables (Directivas 2, 5, 10, 17, 20).
 */

import React, { useState, useEffect } from 'react';
import { ExternalLinkIcon } from '../icons/Icons';
import { i18n } from '../../lib/i18n/es';
import type { UiState } from '../../lib/types/ui';
import FormField from './ui/FormField';
import LoadingButton from './ui/LoadingButton';
import AdminButton from './ui/AdminButton';

interface UserItem {
  id: string;
  email: string;
  role: string;
  displayName: string;
  isActive: boolean;
  slug?: string;
  createdAt: string;
}

export default function UserManager() {
  const [listState, setListState] = useState<UiState<UserItem[]>>({ status: 'loading' });
  const [submitState, setSubmitState] = useState<UiState<void>>({ status: 'idle' });
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados controlados del formulario de alta
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');

  const fetchUsers = async () => {
    try {
      setListState({ status: 'loading' });
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        if (json.data.length === 0) {
          setListState({ status: 'empty' });
        } else {
          setListState({ status: 'success', data: json.data });
        }
      } else {
        setListState({ status: 'error', message: json.error?.message || i18n.admin.loadError });
      }
    } catch {
      setListState({ status: 'error', message: i18n.admin.loadError });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitState({ status: 'loading' });
    setActionMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
          slug: slug.toLowerCase().trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json.error?.message || i18n.admin.createError;
        setSubmitState({ status: 'error', message: errorMsg });
        return;
      }

      setSubmitState({ status: 'success', data: undefined, message: i18n.admin.createSuccess });
      setEmail('');
      setPassword('');
      setDisplayName('');
      setSlug('');
      fetchUsers();
    } catch {
      setSubmitState({ status: 'error', message: i18n.admin.createError });
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      setActionMessage(null);
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: 'success', text: i18n.admin.statusUpdateSuccess });
        fetchUsers();
      } else {
        setActionMessage({ type: 'error', text: json.error?.message || i18n.admin.statusUpdateError });
      }
    } catch {
      setActionMessage({ type: 'error', text: i18n.admin.statusUpdateError });
    }
  };

  const isSubmitting = submitState.status === 'loading';

  return (
    <div className="space-y-10">
      {/* Formulario de Alta con FormField y LoadingButton */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-bold mb-1">{i18n.admin.createUserHeading}</h2>
        <p className="text-xs text-[var(--color-text-secondary)] mb-6">
          {i18n.admin.subtitle}
        </p>

        {submitState.status === 'error' && (
          <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-status-error-bg)] border border-[var(--color-status-error)]/30 text-[var(--color-status-error)] text-xs font-medium">
            {submitState.message}
          </div>
        )}

        {submitState.status === 'success' && submitState.message && (
          <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-status-success-bg)] border border-[var(--color-status-success)]/30 text-[var(--color-status-success)] text-xs font-medium">
            {submitState.message}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            id="user-display-name"
            label={i18n.admin.displayName}
            type="text"
            required
            autoComplete="name"
            placeholder="Gustavo Morales"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isSubmitting}
          />

          <FormField
            id="user-email"
            label={i18n.auth.emailLabel}
            type="email"
            inputMode="email"
            required
            autoComplete="email"
            placeholder="gustavo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />

          <FormField
            id="user-password"
            label={i18n.admin.initialPassword}
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />

          <FormField
            id="user-slug"
            label={i18n.admin.portfolioSlug}
            type="text"
            required
            autoComplete="off"
            prefix="/"
            placeholder="gustavo"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            disabled={isSubmitting}
          />

          <div className="sm:col-span-2 lg:col-span-4 pt-2">
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText={i18n.admin.saving}
            >
              {i18n.admin.createUser}
            </LoadingButton>
          </div>
        </form>
      </div>

      {/* Tabla de Usuarios Registrados */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-bold mb-4">{i18n.admin.registeredUsers}</h2>

        {actionMessage && (
          <div
            className={`mb-4 p-3 rounded-[var(--radius-md)] text-xs font-medium border ${
              actionMessage.type === 'success'
                ? 'bg-[var(--color-status-success-bg)] border-[var(--color-status-success)]/30 text-[var(--color-status-success)]'
                : 'bg-[var(--color-status-error-bg)] border-[var(--color-status-error)]/30 text-[var(--color-status-error)]'
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        {listState.status === 'loading' && (
          <p className="text-xs text-[var(--color-text-muted)]">{i18n.common.loading}</p>
        )}

        {listState.status === 'empty' && (
          <p className="text-xs text-[var(--color-text-muted)]">{i18n.admin.noUsers}</p>
        )}

        {listState.status === 'error' && (
          <p className="text-xs text-[var(--color-status-error)]">{listState.message}</p>
        )}

        {listState.status === 'success' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                  <th className="py-3 px-2">Usuario</th>
                  <th className="py-3 px-2">{i18n.admin.role}</th>
                  <th className="py-3 px-2">Portafolio</th>
                  <th className="py-3 px-2">{i18n.admin.status}</th>
                  <th className="py-3 px-2 text-right">{i18n.admin.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {listState.data.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-2">
                      <span className="font-semibold block">{u.displayName}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{u.email}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase bg-[var(--color-bg-subtle)]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {u.slug ? (
                        <a
                          href={`/${u.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[var(--color-brand-accent)] hover:underline"
                        >
                          <span>/{u.slug}</span>
                          <ExternalLinkIcon size={12} className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.isActive
                            ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success)]'
                            : 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error)]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {u.isActive ? i18n.common.active : i18n.common.suspended}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {u.role !== 'superadmin' && (
                        <AdminButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                        >
                          {u.isActive ? i18n.admin.suspendUser : i18n.admin.activateUser}
                        </AdminButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
