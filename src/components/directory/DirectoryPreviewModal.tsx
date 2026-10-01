import AdaptiveModal from '../ui/AdaptiveModal';
import type { DirectoryProfileItem } from '../../lib/types/directory';
import { i18n } from '../../lib/i18n/es';
import { ExternalLinkIcon, MapPinIcon, SparklesIcon } from '../icons/Icons';

export interface DirectoryPreviewModalProps {
  profile: DirectoryProfileItem | null;
  onClose: () => void;
}

export default function DirectoryPreviewModal({ profile, onClose }: DirectoryPreviewModalProps) {
  return (
    <AdaptiveModal
      isOpen={profile !== null}
      onClose={onClose}
      title={profile ? `${i18n.directory.quickPreview} — ${profile.name}` : ''}
      icon={<SparklesIcon size={16} className="text-[var(--color-brand-accent)]" />}
      ariaLabelledBy="preview-modal-title"
      maxWidthClass="max-w-2xl"
      contentClassName="p-6 sm:p-8 space-y-6"
      footer={
        profile ? (
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={onClose}
              className="min-h-(--size-touch-target) px-4 py-2 rounded-[var(--radius-md)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
            >
              {i18n.common.close}
            </button>
            <a
              href={`/${profile.slug}`}
              target="_blank"
              rel="noreferrer"
              className="min-h-(--size-touch-target) px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-[var(--shadow-card)]"
            >
              <span>{i18n.directory.viewFullPortfolio}</span>
              <ExternalLinkIcon size={14} />
            </a>
          </div>
        ) : null
      }
    >
      {profile && (
        <div data-testid="directory-preview-scroll" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left pb-6 border-b border-[var(--color-border-subtle)]">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--color-border-default)] shrink-0 bg-[var(--color-bg-subtle)]">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-[var(--color-brand-accent)]">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-bold">{profile.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-brand-accent)]">
                  {profile.category}
                </span>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">{profile.profession}</p>
              {profile.location && (
                <p className="text-xs text-[var(--color-text-muted)] flex items-center justify-center sm:justify-start gap-1">
                  <MapPinIcon size={12} /><span>{profile.location}</span>
                </p>
              )}
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pt-2">{profile.bio}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              {i18n.directory.skills}
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 rounded-[var(--radius-md)] text-xs font-semibold bg-[var(--color-bg-base)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {profile.featuredProjects.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                {i18n.directory.projects} destacados
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.featuredProjects.map((project) => (
                  <article key={project.title} className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-2">
                    <h5 className="text-sm font-bold text-[var(--color-text-primary)]">{project.title}</h5>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {project.technologies.map((technology) => (
                          <span key={technology} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]">
                            {technology}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AdaptiveModal>
  );
}
