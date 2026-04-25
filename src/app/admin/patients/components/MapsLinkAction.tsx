interface MapsLinkActionProps {
  href: string;
  label?: string;
  className?: string;
}

export function MapsLinkAction({
  href,
  label = "Abrir en Maps",
  className,
}: MapsLinkActionProps) {
  return (
    <a
      aria-label={label}
      className={className}
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="10" fill="currentColor" r="2.2" />
      </svg>
      {label}
    </a>
  );
}
