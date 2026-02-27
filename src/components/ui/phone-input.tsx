import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { PHONE_PREFIX, getDigitsOnly } from "@/lib/phone";

export interface PhoneInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, id, placeholder, ...props }, ref) => {
    const digitsOnly = getDigitsOnly(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
      onChange(raw.length === 0 ? "+91 " : `+91 ${raw}`);
    };

    return (
      <div
        className={cn(
          "flex h-10 w-full overflow-hidden rounded-xl border-2 border-input bg-background/50 transition-all duration-200 hover:border-border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:border-primary/50",
          className
        )}
      >
        <span
          aria-hidden
          className="inline-flex h-full items-center border-r-2 border-input bg-muted/60 px-3 text-sm font-medium text-muted-foreground select-none"
        >
          {PHONE_PREFIX}
        </span>
        <Input
          ref={ref}
          id={id}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder={placeholder ?? "98765 43210"}
          value={digitsOnly}
          onChange={handleChange}
          className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          {...props}
        />
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
