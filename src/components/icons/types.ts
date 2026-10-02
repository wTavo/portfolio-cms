/**
 * @file types.ts
 * @description Tipos e identificadores para el sistema centralizado de iconos y diseños SVG.
 */

export type IconName =
  | 'brand-logo'
  | 'rocket'
  | 'map-pin'
  | 'arrow-left'
  | 'arrow-right'
  | 'external-link'
  | 'check'
  | 'sparkles'
  | 'user'
  | 'lock'
  | 'mail'
  | 'globe'
  | 'github'
  | 'linkedin'
  | 'twitter'
  | 'eye'
  | 'eye-off'
  | 'edit'
  | 'trash'
  | 'circle'
  | 'circle-dot'
  | 'alert-circle'
  | 'briefcase'
  | 'code'
  | 'layers'
  | 'search'
  | 'x'
  | 'filter'
  | 'palette'
  | 'smartphone'
  | 'sun'
  | 'moon'
  | 'chevron-down';

export interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  ariaLabel?: string;
}
