/**
 * @file ProfileEditor.tsx
 * @description Editor de perfil del usuario con estado discriminado, componentes reutilizables y exportación JSON (Directivas 2, 5, 10, 17, 20, 29).
 */

import React, { useState, useEffect } from 'react';
import { ExternalLinkIcon, CircleDotIcon, CircleIcon } from '../icons/Icons';
import { i18n } from '../../lib/i18n/es';
import type { UiState } from '../../lib/types/ui';
import FormField from '../admin/ui/FormField';
import LoadingButton from '../admin/ui/LoadingButton';
import AdminButton from '../admin/ui/AdminButton';

interface ProfileData {
  name: string;
  profession: string;
  bio: string;
  location: string;
  website: string;
  theme: string;
  isPublished: boolean;
  slug: string;
}

export default function ProfileEditor() {
  const [loadState, setLoadState] = useState<UiState<ProfileData>>({ status: 'loading' });
  const [saveState, setSaveState] = useState<UiState<void>>({ status: 'idle' });
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Campos del formulario
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [theme, setTheme] = useState('minimal');
  const [isPublished, setIsPublished] = useState(false);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadState({ status: 'loading' });
        const res = await fetch('/api/dashboard/profile');
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setName(d.name || '');
          setProfession(d.profession || '');
          setBio(d.bio || '');
          setLocation(d.location || '');
          setWebsite(d.website || '');
          setTheme(d.theme || 'minimal');
          setIsPublished(d.is_published || false);
          setSlug(d.slug || '');
          setLoadState({ status: 'success', data: d });
        } else {
          setLoadState({ status: 'error', message: json.error?.message || i18n.dashboard.loadError });
        }
      } catch {
        setLoadState({ status: 'error', message: i18n.dashboard.loadError });
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveState({ status: 'loading' });

    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          profession: profession.trim(),
          bio: bio.trim(),
          location: location.trim(),
          website: website.trim() || null,
          theme,
          isPublished,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setSaveState({ status: 'error', message: json.error?.message || i18n.dashboard.saveError });
        return;
      }

      setSaveState({ status: 'success', data: undefined, message: i18n.dashboard.saveSuccess });
    } catch {
      setSaveState({ status: 'error', message: i18n.dashboard.saveError });
    }
  };

  /** Exportación de datos a JSON del portafolio del usuario (Directiva 29) */
  const handleExportJson = () => {
    try {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        profile: { name, profession, bio, location, website, theme, isPublished, slug },
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portafolio-${slug || 'backup'}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportMessage(i18n.dashboard.exportSuccess);
      setTimeout(() => setExportMessage(null), 3000);
    } catch {
      setExportMessage(i18n.dashboard.exportError);
    }
  };

  const isSaving = saveState.status === 'loading';

  if (loadState.status === 'loading') {
    return <p className="text-xs text-[var(--color-text-muted)]">{i18n.dashboard.loadingProfile}</p>;
  }

  if (loadState.status === 'error') {
    return (
      <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-status-error-bg)] border border-[var(--color-status-error)]/30 text-[var(--color-status-error)] text-xs font-medium">
        {loadState.message}
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <h2 className="text-lg font-bold">{i18n.dashboard.editPersonalInfo}</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {i18n.dashboard.portfolioAvailableAt}{' '}
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[var(--color-brand-accent)] font-semibold hover:underline"
            >
              <span>/{slug}</span>
              <ExternalLinkIcon size={12} className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Botón de Exportación JSON (Directiva 29) */}
        <AdminButton variant="secondary" size="sm" type="button" onClick={handleExportJson}>
          {i18n.common.exportData}
        </AdminButton>
      </div>

      {exportMessage && (
        <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-status-success-bg)] border border-[var(--color-status-success)]/30 text-[var(--color-status-success)] text-xs font-medium">
          {exportMessage}
        </div>
      )}

      {saveState.status === 'error' && (
        <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-status-error-bg)] border border-[var(--color-status-error)]/30 text-[var(--color-status-error)] text-xs font-medium">
          {saveState.message}
        </div>
      )}

      {saveState.status === 'success' && saveState.message && (
        <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-status-success-bg)] border border-[var(--color-status-success)]/30 text-[var(--color-status-success)] text-xs font-medium">
          {saveState.message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="profile-name"
            label={i18n.dashboard.nameLabel}
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSaving}
          />

          <FormField
            id="profile-profession"
            label={i18n.dashboard.professionLabel}
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-1 text-left">
          <label
            htmlFor="profile-bio"
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]"
          >
            {i18n.dashboard.bioLabel}
          </label>
          <textarea
            id="profile-bio"
            name="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={isSaving}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm focus:border-[var(--color-brand-accent)] focus:outline-none transition-colors resize-none disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="profile-location"
            label={i18n.dashboard.locationLabel}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isSaving}
          />

          <FormField
            id="profile-website"
            label={i18n.dashboard.websiteLabel}
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* Selección de Tema */}
        <div className="space-y-1 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            {i18n.dashboard.themeLabel}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {['minimal', 'professional', 'creative', 'developer'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                disabled={isSaving}
                className={`p-3 rounded-[var(--radius-md)] border text-xs font-semibold capitalize flex items-center justify-between transition-all cursor-pointer ${
                  theme === t
                    ? 'border-[var(--color-brand-accent)] bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)]'
                    : 'border-[var(--color-border-default)] hover:border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]'
                }`}
              >
                <span>{t}</span>
                {theme === t ? <CircleDotIcon size={14} /> : <CircleIcon size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Visibilidad / Publicación */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              disabled={isSaving}
              className="w-4 h-4 rounded text-[var(--color-brand-accent)] focus:ring-[var(--color-brand-accent)]"
            />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              {i18n.dashboard.visibilityLabel} ({isPublished ? i18n.common.published : i18n.common.draft})
            </span>
          </label>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 ml-7">
            {i18n.dashboard.publishHelp}
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--color-border-subtle)] flex justify-end">
          <LoadingButton type="submit" loading={isSaving}>
            {i18n.common.saveChanges}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
