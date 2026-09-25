/**
 * @file Icons.tsx
 * @description Componentes React de iconos y diseños SVG reutilizables para paneles interactivos.
 */

import React from 'react';
import type { IconName, IconProps } from './types';

export interface BaseSvgProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Logotipo oficial de la plataforma: Monograma abstracto minimalista «Dual Facet».
 * Representa la unión entre Ingeniería de Software (pilar de código) y Diseño Creativo (bucle cian).
 * 100% original, geométrico y libre de derechos de terceros.
 */
export function BrandLogoIcon({ size = 24, className = 'w-6 h-6', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      {/* Pilar Izquierdo (Arquitectura, Código y Estructura) */}
      <rect x="6" y="5" width="5.5" height="22" rx="2.75" fill="currentColor" />
      {/* Bucle Superior Flotante (Diseño Creativo y Experiencia Digital) */}
      <path
        d="M14.5 5H19.5C23.6421 5 27 8.35786 27 12.5C27 16.6421 23.6421 20 19.5 20H14.5C13.6716 20 13 19.3284 13 18.5V6.5C13 5.67157 13.6716 5 14.5 5Z"
        fill="var(--color-brand-accent, #38bdf8)"
      />
      {/* Núcleo de apertura en negativo / punto focal */}
      <circle cx="20" cy="12.5" r="3.25" fill="var(--color-bg-surface, #18181b)" />
    </svg>
  );
}

export function RocketIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

export function MapPinIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function ExternalLinkIcon({ size = 14, className = 'w-3.5 h-3.5', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export function CheckIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function CircleDotIcon({ size = 12, className = 'w-3 h-3', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

export function CircleIcon({ size = 12, className = 'w-3 h-3', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function AlertCircleIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

export function UserIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function LockIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function SearchIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function XIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function FilterIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

export function PaletteIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

export function SmartphoneIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

export function EyeIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function CodeIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export function SparklesIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

export function LayersIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5" />
      <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function MailIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function SunIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

export function MoonIcon({ size = 16, className = 'w-4 h-4', ariaLabel, ...props }: BaseSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      {...props}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function Icon({ name, ...props }: IconProps) {
  switch (name) {
    case 'brand-logo':
      return <BrandLogoIcon {...props} />;
    case 'rocket':
      return <RocketIcon {...props} />;
    case 'map-pin':
      return <MapPinIcon {...props} />;
    case 'arrow-left':
      return <ArrowLeftIcon {...props} />;
    case 'arrow-right':
      return <ArrowRightIcon {...props} />;
    case 'chevron-down':
      return <ChevronDownIcon {...props} />;
    case 'external-link':
      return <ExternalLinkIcon {...props} />;
    case 'check':
      return <CheckIcon {...props} />;
    case 'circle-dot':
      return <CircleDotIcon {...props} />;
    case 'circle':
      return <CircleIcon {...props} />;
    case 'alert-circle':
      return <AlertCircleIcon {...props} />;
    case 'user':
      return <UserIcon {...props} />;
    case 'lock':
      return <LockIcon {...props} />;
    case 'mail':
      return <MailIcon {...props} />;
    case 'sun':
      return <SunIcon {...props} />;
    case 'moon':
      return <MoonIcon {...props} />;
    case 'search':
      return <SearchIcon {...props} />;
    case 'x':
      return <XIcon {...props} />;
    case 'filter':
      return <FilterIcon {...props} />;
    case 'palette':
      return <PaletteIcon {...props} />;
    case 'smartphone':
      return <SmartphoneIcon {...props} />;
    case 'eye':
      return <EyeIcon {...props} />;
    case 'code':
      return <CodeIcon {...props} />;
    case 'sparkles':
      return <SparklesIcon {...props} />;
    case 'layers':
      return <LayersIcon {...props} />;
    default:
      return null;
  }
}
