import { cn } from "@/lib/utils";

interface PartyBadgeProps {
  party: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const partyConfig: Record<string, { bg: string; text: string }> = {
  BJP: { bg: "bg-party-bjp/20", text: "text-party-bjp" },
  INC: { bg: "bg-party-inc/20", text: "text-party-inc" },
  BSP: { bg: "bg-party-bsp/20", text: "text-party-bsp" },
  SP: { bg: "bg-party-sp/20", text: "text-party-sp" },
  AAP: { bg: "bg-party-aap/20", text: "text-party-aap" },
  SBSP: { bg: "bg-purple-500/20", text: "text-purple-600" },
  AD: { bg: "bg-teal-500/20", text: "text-teal-600" },
  OTHERS: { bg: "bg-party-others/20", text: "text-party-others" },
};

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

const PartyBadge = ({ party, size = "md", className }: PartyBadgeProps) => {
  const config = partyConfig[party.toUpperCase()] || partyConfig.OTHERS;

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-md",
        config.bg,
        config.text,
        sizeClasses[size],
        className
      )}
    >
      {party}
    </span>
  );
};

export default PartyBadge;
