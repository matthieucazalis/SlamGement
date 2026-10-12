import { STATUS_LABELS, type AdrStatusValue } from "@/lib/adr-status";

const STYLES: Record<AdrStatusValue, string> = {
  PROPOSED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  ACCEPTED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  DEPRECATED:
    "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  SUPERSEDED:
    "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
};

export function AdrStatusBadge({ status }: { status: AdrStatusValue }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
