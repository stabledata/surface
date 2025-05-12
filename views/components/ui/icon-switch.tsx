import React from "react";
import { Button } from "./button.js";
import { cn } from "../../lib/utils.js";

type IconSwitchProps = {
  value: "on" | "off";
  onIcon: React.ReactElement;
  offIcon: React.ReactElement;
  onSwitch: (s: "on" | "off") => void;
} & React.ComponentPropsWithoutRef<typeof Button>;

export const IconSwitch = React.forwardRef<
  React.ElementRef<typeof Button>,
  IconSwitchProps
>(({ onIcon, offIcon, value, onSwitch, className, ...props }, ref) => {
  const [justToggled, setJustToggled] = React.useState<boolean>(false);
  const offPositions =
    "top-[-40px] group-hover:top-0 group-focus-visible:top-0";
  const onPositions =
    "top-0 group-hover:top-[-40px] group-focus-visible:top-[-40px]";

  // If just toggled is true we invert the positions so it stays "switched"
  const usePositions = React.useMemo(() => {
    if (justToggled) {
      return value === "off" ? onPositions : offPositions;
    }
    return value === "off" ? offPositions : onPositions;
  }, [justToggled, value]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        "relative overflow-hidden h-10 group hover:bg-transparent",
        className
      )}
      {...props}
      onClick={() => {
        setJustToggled(true);
        onSwitch(value === "on" ? "off" : "on");
      }}
      onBlur={() => setJustToggled(false)}
      onMouseLeave={() => setJustToggled(false)}
    >
      <div
        className={cn(
          "absolute mt-[-1px] transition-all ease-out duration-200",
          usePositions
        )}
      >
        <div className="flex items-center h-10">{onIcon}</div>
        <div className="flex items-center h-10">{offIcon}</div>
      </div>
    </Button>
  );
});
