/**
 * @file DirectoryExplorer.tsx
 * @description Explorador interactivo de portafolios con filtrado por categoría, búsqueda y vista previa rápida.
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { DirectoryProfileItem } from '../../lib/types/directory';
import { DIRECTORY_CATEGORIES } from '../../lib/services/directory.service';
import { i18n } from '../../lib/i18n/es';
import {
  SearchIcon,
  XIcon,
  ExternalLinkIcon,
  MapPinIcon,
  EyeIcon,
  CodeIcon,
  SparklesIcon,
} from '../icons/Icons';

interface DirectoryExplorerProps {
  initialProfiles?: DirectoryProfileItem[];
}

export default function DirectoryExplorer({ initialProfiles = [] }: DirectoryExplorerProps) {
  const [profiles, setProfiles] = useState<DirectoryProfileItem[]>(initialProfiles);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewProfile, setPreviewProfile] = useState<DirectoryProfileItem | null>(null);

  // Si no se pasaron perfiles iniciales, cargarlos desde la API pública
  useEffect(() => {
    if (initialProfiles.length === 0) {
      fetch('/api/public/directory')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setProfiles(json.data);
          }
        })
        .catch(() => {});
    }
  }, [initialProfiles]);

  // Manejador para cerrar modal con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewProfile) {
        setPreviewProfile(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewProfile]);

  // Filtrado de perfiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const matchesCategory =
        selectedCategory === 'Todos' || profile.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        profile.name.toLowerCase().includes(q) ||
        profile.profession.toLowerCase().includes(q) ||
        profile.bio.toLowerCase().includes(q) ||
        profile.skills.some((s) => s.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [profiles, selectedCategory, searchQuery]);

  return (
    <div className="w-full max-w-(--container-max-w) mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Controles de Búsqueda y Filtros de Categoría */}
      <div className="space-y-6">
        {/* Barra de Búsqueda */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-text-muted)]">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={i18n.directory.searchPlaceholder}
            className="w-full min-h-(--size-input-height) pl-11 pr-10 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-card)] focus:border-[var(--color-brand-accent)] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>

        {/* Chips de Categoría */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {DIRECTORY_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-(--size-touch-target) px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] border-[var(--color-brand-primary)] shadow-[var(--shadow-card)]'
                    : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cuadrícula de Portafolios */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] max-w-lg mx-auto">
          <CodeIcon size={32} className="mx-auto text-[var(--color-text-muted)] mb-3" />
          <h3 className="text-lg font-bold mb-1">{i18n.directory.noResultsTitle}</h3>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {i18n.directory.noResultsDesc}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col justify-between p-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] hover:border-[var(--color-brand-accent)] transition-all hover:-translate-y-0.5"
            >
              <div>
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-base text-[var(--color-brand-accent)]">
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-base font-bold truncate text-[var(--color-text-primary)]">
                        {item.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-brand-accent)] shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)] truncate">
                      {item.profession}
                    </p>
                    {item.location && (
                      <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                        <MapPinIcon size={10} />
                        <span>{item.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Biografía corta */}
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-3 mb-4">
                  {item.bio}
                </p>

                {/* Badges de Habilidades */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {item.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
                    >
                      {skill}
                    </span>
                  ))}
                  {item.skills.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] text-[var(--color-text-muted)]">
                      +{item.skills.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Acciones de la Tarjeta */}
              <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewProfile(item)}
                  className="min-h-(--size-touch-target) px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] text-xs font-semibold hover:bg-[var(--color-bg-muted)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <EyeIcon size={14} />
                  <span>{i18n.directory.quickPreview}</span>
                </button>

                <a
                  href={`/${item.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-(--size-touch-target) px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>/{item.slug}</span>
                  <ExternalLinkIcon size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal de Vista Previa Rápida (Directiva 12) */}
      {previewProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
        >
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-modal)] overflow-hidden">
            {/* Cabecera Fija del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)] shrink-0">
              <div className="flex items-center gap-2">
                <SparklesIcon size={16} className="text-[var(--color-brand-accent)]" />
                <h2 id="preview-modal-title" className="text-sm font-bold text-[var(--color-text-primary)]">
                  {i18n.directory.quickPreview} — {previewProfile.name}
                </h2>
              </div>
              <button
                onClick={() => setPreviewProfile(null)}
                className="min-h-(--size-touch-target) min-w-(--size-touch-target) inline-flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
                aria-label={i18n.common.close}
              >
                <XIcon size={18} />
              </button>
            </div>

            {/* Cuerpo Scrolleable del Modal */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Información Personal */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left pb-6 border-b border-[var(--color-border-subtle)]">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--color-border-default)] shrink-0 bg-[var(--color-bg-subtle)]">
                  {previewProfile.photoUrl ? (
                    <img
                      src={previewProfile.photoUrl}
                      alt={previewProfile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-[var(--color-brand-accent)]">
                      {previewProfile.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl font-bold">{previewProfile.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-brand-accent)]">
                      {previewProfile.category}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    {previewProfile.profession}
                  </p>
                  {previewProfile.location && (
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center justify-center sm:justify-start gap-1">
                      <MapPinIcon size={12} />
                      <span>{previewProfile.location}</span>
                    </p>
                  )}
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pt-2">
                    {previewProfile.bio}
                  </p>
                </div>
              </div>

              {/* Habilidades Principales */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                  {i18n.directory.skills}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {previewProfile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-[var(--radius-md)] text-xs font-semibold bg-[var(--color-bg-base)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Proyectos Destacados */}
              {previewProfile.featuredProjects.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                    {i18n.directory.projects} destacados
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {previewProfile.featuredProjects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-2"
                      >
                        <h5 className="text-sm font-bold text-[var(--color-text-primary)]">
                          {proj.title}
                        </h5>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                          {proj.description}
                        </p>
                        {proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pie Fijo del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shrink-0">
              <button
                onClick={() => setPreviewProfile(null)}
                className="min-h-(--size-touch-target) px-4 py-2 rounded-[var(--radius-md)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
              >
                {i18n.common.close}
              </button>

              <a
                href={`/${previewProfile.slug}`}
                target="_blank"
                rel="noreferrer"
                className="min-h-(--size-touch-target) px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-[var(--shadow-card)]"
              >
                <span>{i18n.directory.viewFullPortfolio}</span>
                <ExternalLinkIcon size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
