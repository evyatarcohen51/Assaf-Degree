// Inline SVG icons used in the soft-neumorphic redesign.
// No icon library — keeps the dependency surface minimal.

interface IconProps {
  size?: number;
  className?: string;
}

const baseProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export function PencilIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

export function TrashIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function BellIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function FolderIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function CalendarIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function PlusIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function CheckIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function MoonIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function SunIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function LogoutIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function CloudUploadIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <path d="M16 16l-4-4-4 4" />
      <path d="M12 12v9" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      <path d="M16 16l-4-4-4 4" />
    </svg>
  );
}

// Branded provider icons (multi-color, full color SVG — not stroked)
export function GoogleDriveBrand({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M4.39 17.55L6.05 20.43A2 2 0 0 0 7.78 21.43H16.22A2 2 0 0 0 17.95 20.43L19.61 17.55H4.39Z" fill="#4285F4" />
      <path d="M9.85 2.57L4.39 12L0 12L6.61 0.57A1 1 0 0 1 7.5 0H10.85L9.85 2.57Z" fill="#0F9D58" />
      <path d="M14.15 2.57L13.15 0H16.5A1 1 0 0 1 17.39 0.57L24 12H19.61L14.15 2.57Z" fill="#FFCD40" />
      <path d="M19.61 12L24 12L17.95 20.43L13.5 12H19.61Z" fill="#FF7043" />
      <path d="M0 12L4.39 17.55L8.78 12H0Z" fill="#1FA463" />
      <path d="M19.61 12H8.78L13.5 4.04L19.61 12Z" fill="#F1F1F1" />
    </svg>
  );
}

export function DropboxBrand({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M6 2L0 6L6 10L12 6L6 2Z" fill="#0061FF" />
      <path d="M18 2L12 6L18 10L24 6L18 2Z" fill="#0061FF" />
      <path d="M0 14L6 18L12 14L6 10L0 14Z" fill="#0061FF" />
      <path d="M18 10L12 14L18 18L24 14L18 10Z" fill="#0061FF" />
      <path d="M6 19.2L12 23.2L18 19.2L12 15.2L6 19.2Z" fill="#0061FF" />
    </svg>
  );
}

export function OneDriveBrand({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M14.6 9.4l3.5 2.1c.5-.2 1-.3 1.5-.3 1.4 0 2.6.8 3.2 2-.3-3.2-3-5.7-6.3-5.7-1.4 0-2.7.5-3.7 1.3l1.8 0.6z" fill="#28A8EA" />
      <path d="M9.7 9.5c1.4-1.4 3.4-2.3 5.6-2.3.6 0 1.2.1 1.7.2C15.6 5.4 13 4 10 4 6.3 4 3.2 6.6 2.4 10c.6-.3 1.3-.4 2-.4 1.3 0 2.5.4 3.5 1.1l1.8-1.2z" fill="#0364B8" />
      <path d="M7.9 10.6c-1-.7-2.1-1.1-3.4-1.1-2.6 0-4.7 2.1-4.7 4.7 0 2.6 2.1 4.7 4.7 4.7h11.7c2.6 0 4.6-2.1 4.6-4.6 0-1.5-.7-2.8-1.9-3.6-.5.2-.9.3-1.5.3-1.7 0-3.2-.9-4-2.2-1.5-.7-3.3-.5-4.6.4l-.9 1.4z" fill="#14447D" />
      <path d="M19.6 11.2c-.5 0-1 .1-1.5.3l-3.5-2.1-1.8-.6c-.7.5-1.3 1.2-1.7 2-.4.8-.6 1.7-.5 2.6.2 1.7 1.2 3.2 2.7 3.9.5.2 1 .3 1.5.3h4.8c2.5 0 4.6-2 4.6-4.6 0-2.5-2.1-4.5-4.6-4.5z" fill="#1490DF" />
    </svg>
  );
}
