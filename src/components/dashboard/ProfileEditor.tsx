import React, { useState, useEffect } from 'react';
import { ExternalLinkIcon, CircleDotIcon, CircleIcon } from '../icons/Icons';

export default function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
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
        setLoading(true);
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
        }
      } catch {
        setError('Error al cargar datos del perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSaving(true);

    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          profession,
          bio,
          location,
          website: website || null,
          theme,
          isPublished,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Error al guardar cambios.');
        return;
      }

      setSuccessMsg('Perfil guardado con éxito.');
    } catch {
      setError('Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-xs text-[var(--color-text-muted)]">Cargando perfil...</p>;
  }

  return (
    <div className="p-6 sm:p-8 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <h2 className="text-lg font-bold">Editar información personal</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Tu portafolio está disponible en:{' '}
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

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isPublished
                ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success)]'
                : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
            }`}
          >
            {isPublished ? (
              <>
                <CircleDotIcon size={10} className="w-2.5 h-2.5" />
                <span>Publicado</span>
              </>
            ) : (
              <>
                <CircleIcon size={10} className="w-2.5 h-2.5" />
                <span>Borrador</span>
              </>
            )}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-status-error-bg)] border border-[var(--color-status-error)] text-[var(--color-status-error)] text-xs">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-status-success-bg)] border border-[var(--color-status-success)] text-[var(--color-status-success)] text-xs">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-(--size-input-height) px-3 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm focus:outline-none focus:border-[var(--color-brand-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
              Profesión / Título
            </label>
            <input
              type="text"
              value={profession}
              placeholder="Ingeniero de software"
              onChange={(e) => setProfession(e.target.value)}
              className="w-full min-h-(--size-input-height) px-3 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm focus:outline-none focus:border-[var(--color-brand-accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
            Biografía / Resumen
          </label>
          <textarea
            rows={3}
            value={bio}
            placeholder="Breve descripción sobre tu experiencia y pasión..."
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm focus:outline-none focus:border-[var(--color-brand-accent)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
              Ubicación
            </label>
            <input
              type="text"
              value={location}
              placeholder="México / Remoto"
              onChange={(e) => setLocation(e.target.value)}
              className="w-full min-h-(--size-input-height) px-3 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm focus:outline-none focus:border-[var(--color-brand-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
              Tema visual
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full min-h-(--size-input-height) px-3 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm focus:outline-none focus:border-[var(--color-brand-accent)]"
            >
              <option value="minimal">Minimal</option>
              <option value="professional">Professional</option>
              <option value="creative">Creative</option>
              <option value="developer">Developer (Dark)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[var(--color-border-subtle)]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--color-brand-accent)]"
            />
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              Publicar portafolio en la web
            </span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="min-h-(--size-button-height) px-6 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
