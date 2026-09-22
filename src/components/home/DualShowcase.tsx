/**
 * @file DualShowcase.tsx
 * @description Presentación dual interactiva de los dos creadores con animaciones fluidas y microinteracciones.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { CreatorProfile, ShowcaseData } from '../../lib/types/showcase';
import { i18n } from '../../lib/i18n/es';
import {
  SparklesIcon,
  ExternalLinkIcon,
  MapPinIcon,
  CodeIcon,
  LayersIcon,
} from '../icons/Icons';
import {
  staggerContainerVariants,
  fadeSlideUpVariants,
  cardHoverVariants,
} from '../../lib/motion';

interface DualShowcaseProps {
  data: ShowcaseData;
}

export default function DualShowcase({ data }: DualShowcaseProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const { creators, sharedTechnologies } = data;

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-(--container-max-w) mx-auto px-4 sm:px-6 lg:px-8 space-y-16"
    >
      {/* Sección Principal: Dual Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {creators.map((creator, index) => {
          const isHovered = hoveredCard === creator.id;
          return (
            <motion.article
              key={creator.id}
              variants={fadeSlideUpVariants}
              initial="rest"
              whileHover="hover"
              onHoverStart={() => setHoveredCard(creator.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-6 sm:p-8 flex flex-col justify-between shadow-[var(--shadow-card)] transition-colors overflow-hidden group hover:border-[var(--color-brand-accent)]"
            >
              {/* Resplandor ambiental de fondo reactivo */}
              <div
                className={`absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[var(--radius-xl)] bg-radial from-[var(--color-brand-accent)]/10 via-transparent to-transparent`}
                aria-hidden="true"
              />

              <div className="relative z-10 space-y-6">
                {/* Cabecera del Creador */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--color-border-default)] shrink-0 bg-[var(--color-bg-subtle)] group-hover:border-[var(--color-brand-accent)] transition-colors">
                      {creator.photoUrl ? (
                        <img
                          src={creator.photoUrl}
                          alt={creator.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xl text-[var(--color-brand-accent)]">
                          {creator.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                        {creator.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)]">
                        {creator.role}
                      </p>
                      {creator.location && (
                        <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                          <MapPinIcon size={12} />
                          <span>{creator.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {creator.statusBadge && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] text-[11px] font-semibold self-start sm:self-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      <span>{creator.statusBadge}</span>
                    </div>
                  )}
                </div>

                {/* Biografía */}
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {creator.bio}
                </p>

                {/* Habilidades Principales */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                    <CodeIcon size={14} />
                    <span>{i18n.showcase.keySkills}</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {creator.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Proyectos Insignia */}
                {creator.featuredProjects.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                      <SparklesIcon size={14} />
                      <span>{i18n.showcase.featuredProjects}</span>
                    </h4>
                    <div className="space-y-2">
                      {creator.featuredProjects.map((proj, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
                              {proj.title}
                            </h5>
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                            {proj.description}
                          </p>
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Acción Principal */}
              <div className="relative z-10 pt-6 mt-6 border-t border-[var(--color-border-subtle)]">
                <a
                  href={`/${creator.slug}`}
                  className="w-full min-h-(--size-button-height) px-6 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 shadow-[var(--shadow-card)] cursor-pointer"
                >
                  <span>{i18n.showcase.explorePortfolio}</span>
                  <ExternalLinkIcon size={14} />
                </a>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Barra de Tecnologías y Arquitectura Compartida */}
      {sharedTechnologies.length > 0 && (
        <motion.div
          variants={fadeSlideUpVariants}
          className="p-6 sm:p-8 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            <LayersIcon size={16} className="text-[var(--color-brand-accent)]" />
            <span>{i18n.showcase.collaborativeWorks}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {sharedTechnologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-default)] transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
