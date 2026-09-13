import type { SimpleIcon } from "simple-icons";

import {
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siTypescript,
} from "simple-icons";

type Technology = {
  icon: SimpleIcon;
  label: string;
  useBrandColor?: boolean;
};

const technologies: Technology[] = [
  {
    icon: siNextdotjs,
    label: "Next.js",
  },
  {
    icon: siTypescript,
    label: "TypeScript",
    useBrandColor: true,
  },
  {
    icon: siNodedotjs,
    label: "Node.js",
    useBrandColor: true,
  },
  {
    icon: siPostgresql,
    label: "PostgreSQL",
    useBrandColor: true,
  },
  {
    icon: siPrisma,
    label: "Prisma",
  },
];

function BrandIcon({
  icon,
  useBrandColor = false,
}: {
  icon: SimpleIcon;
  useBrandColor?: boolean;
}) {
  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      style={{
        fill: useBrandColor ? `#${icon.hex}` : "currentColor",
      }}
    >
      <path d={icon.path} />
    </svg>
  );
}

export default function TechStack() {
  return (
    <footer className="mt-14 border-t border-border pt-7">
      <div className="flex flex-wrap items-center gap-x-22 gap-y-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
          Built with
        </span>

        {technologies.map((technology) => (
          <div
            key={technology.label}
            className="flex items-center gap-2 text-foreground"
          >
            <BrandIcon
              icon={technology.icon}
              useBrandColor={technology.useBrandColor}
            />

            <span className="text-sm font-medium text-foreground-muted">
              {technology.label}
            </span>
          </div>
        ))}
      </div>
    </footer>
  );
}
