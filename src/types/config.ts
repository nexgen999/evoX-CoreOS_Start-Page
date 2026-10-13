export type IconType = 'fontawesome' | 'image' | 'emoji' | 'text';

export interface ShortcutItem {
  name: string;
  url: string;
  icon: string;
  type?: IconType;
  category?: string;
}

export interface BrandConfig {
  name: string;
  icon: string;
  iconType?: IconType;
  localAssetFallback?: string;
  url?: string;
}

export interface ProfileConfig {
  name: string;
  avatar: string;
  github?: string;
  online?: boolean;
}

export interface FooterBadge {
  id: string;
  label: string;
  subLabel?: string;
  icon?: string;
  iconImage?: string;
  iconType?: IconType;
  url?: string;
  style?: 'rectangular' | 'badge' | 'pill';
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  border?: boolean;
}

export interface FooterLink {
  name: string;
  url: string;
  icon?: string;
}

export interface FooterConfig {
  text?: string;
  subtext?: string;
  copyright?: string;
  badges?: FooterBadge[];
  links?: FooterLink[];
}

export interface AppearanceConfig {
  showClock?: boolean;
  showLanguageSelector?: boolean;
  animation?: boolean;
  theme?: string;
  showGamepadHints?: boolean;
  showConfigButtons?: boolean;
}

export interface AppConfig {
  title: string;
  language: string;
  searchEngine: string;
  brand: BrandConfig;
  profile: ProfileConfig;
  appearance: AppearanceConfig;
  footer: FooterConfig;
  shortcuts: ShortcutItem[];
  customShortcuts?: ShortcutItem[];
}
