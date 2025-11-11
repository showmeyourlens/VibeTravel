import * as React from "react";
import { cn } from "@/lib/utils";

const Panel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("bg-white rounded-lg shadow-lg p-12 text-center", className)} {...props} />
));
Panel.displayName = "Panel";

export { Panel };
