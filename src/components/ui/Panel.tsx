import * as React from "react";
import { cn } from "@/lib/utils";

const Panel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bg-card/90 rounded-lg shadow-lg text-center p-8 text-secondary-foreground", className)}
    {...props}
  />
));
Panel.displayName = "Panel";

export { Panel };
