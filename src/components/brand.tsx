import { cn } from '@/lib/cn';

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn('size-8 shrink-0', className)}>
      <defs>
        <clipPath id="gugu-mark">
          <rect width="64" height="64" rx="14" />
        </clipPath>
      </defs>
      <g clipPath="url(#gugu-mark)">
        <rect width="64" height="64" fill="#086E8E" />
        <rect y="52" width="64" height="12" fill="#042F3D" />
        <rect x="12" y="52" width="9" height="12" fill="#0F96C1" />
        <rect x="21" y="52" width="5" height="12" fill="#D99A1E" />
        <rect x="38" y="52" width="9" height="12" fill="#74C4DF" />
      </g>
      <path
        d="M42.5 17.5A13 13 0 1 0 44 27H32"
        fill="none"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ area, inverse }: { area?: string; inverse?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <BrandMark />
      <span className="flex flex-col leading-none">
        <span className={cn('text-[1.0625rem] font-extrabold tracking-[0.04em]', inverse ? 'text-white' : 'text-ink')}>
          GUGU
        </span>
        {area ? (
          <span className={cn('mt-1 text-[0.8125rem] font-medium', inverse ? 'text-brand-200' : 'text-ink-muted')}>
            {area}
          </span>
        ) : null}
      </span>
    </span>
  );
}
