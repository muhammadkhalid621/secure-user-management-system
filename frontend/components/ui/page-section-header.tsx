import { Button } from "./button";

export const PageSectionHeader = ({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-row items-center justify-between gap-4">
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export const SectionActionButton = Button;
