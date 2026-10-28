import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

/** Visibility is local to this field; the original input and its value never remount. */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, ...props }, forwardedRef) => {
    const [visible, setVisible] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const selection = React.useRef<{ start: number | null; end: number | null; direction: "forward" | "backward" | "none" | null } | null>(null);
    const label = visible ? "Ẩn mật khẩu" : "Hiện mật khẩu";

    React.useLayoutEffect(() => {
      const input = inputRef.current;
      const saved = selection.current;
      if (input && saved && saved.start !== null && saved.end !== null) {
        input.setSelectionRange(saved.start, saved.end, saved.direction ?? "none");
      }
      selection.current = null;
    }, [visible]);

    return (
      <div className="relative w-full min-w-0 flex-1">
        <Input
          {...props}
          ref={(input) => {
            inputRef.current = input;
            if (typeof forwardedRef === "function") forwardedRef(input);
            else if (forwardedRef) forwardedRef.current = input;
          }}
          type={visible ? "text" : "password"}
          disabled={disabled}
          className={cn("h-11 pr-12", className)}
        />
        <TooltipProvider delayDuration={250}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                className="absolute right-0 top-0 h-full min-h-11 w-11 rounded-md text-muted-foreground hover:bg-accent/60 hover:text-primary"
                aria-label={label}
                aria-pressed={visible}
                aria-controls={props.id}
                onPointerDown={(event) => {
                  // Keep the field's focus and caret when using a mouse or touch.
                  event.preventDefault();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  const input = inputRef.current;
                  if (input) selection.current = { start: input.selectionStart, end: input.selectionEnd, direction: input.selectionDirection };
                  setVisible((value) => !value);
                }}
              >
                {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };