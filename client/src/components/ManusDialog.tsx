/**
 * components/ManusDialog.tsx
 * A modal dialog that prompts the user to log in via OAuth.
 *
 * The component supports two open-state management modes:
 *   Controlled   – caller passes `open` and `onOpenChange`, so the parent owns state.
 *   Uncontrolled – caller passes only `open`; the component manages state internally.
 *
 * Props:
 *   title       – Optional headline displayed in the dialog body.
 *   logo        – Optional image URL shown above the title.
 *   open        – Initial / controlled open state.
 *   onLogin     – Called when the user clicks the "Login" button.
 *   onOpenChange – Optional; if provided, the dialog is fully controlled.
 *   onClose      – Called whenever the dialog transitions to closed.
 */

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

// Props accepted by ManusDialog.
interface ManusDialogProps {
  title?: string;
  logo?: string;
  open?: boolean;
  onLogin: () => void;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function ManusDialog({
  title,
  logo,
  open = false,
  onLogin,
  onOpenChange,
  onClose,
}: ManusDialogProps) {
  // Internal state used when the caller does NOT provide onOpenChange.
  const [internalOpen, setInternalOpen] = useState(open);

  // Keep the internal state in sync when `open` changes from outside
  // (only relevant in uncontrolled mode – when onOpenChange is not provided).
  useEffect(() => {
    if (!onOpenChange) {
      setInternalOpen(open);
    }
  }, [open, onOpenChange]);

  /**
   * Unified change handler for both controlled and uncontrolled modes.
   * - Controlled mode: delegates to the parent's onOpenChange.
   * - Uncontrolled mode: updates internal state directly.
   * In both cases, fires onClose when the dialog is being closed.
   */
  const handleOpenChange = (nextOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }

    // Notify the parent whenever the dialog is dismissed.
    if (!nextOpen) {
      onClose?.();
    }
  };

  return (
    <Dialog
      // In controlled mode use the prop value; otherwise use internal state.
      open={onOpenChange ? open : internalOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="py-5 bg-[#f8f8f7] rounded-[20px] w-[400px] shadow-[0px_4px_11px_0px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.08)] backdrop-blur-2xl p-0 gap-0 text-center">
        <div className="flex flex-col items-center gap-2 p-5 pt-12">
          {/* Optional app logo displayed at the top of the dialog */}
          {logo ? (
            <div className="w-16 h-16 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] flex items-center justify-center">
              <img
                src={logo}
                alt="Dialog graphic"
                className="w-10 h-10 rounded-md"
              />
            </div>
          ) : null}

          {/* Title and subtitle */}
          {title ? (
            <DialogTitle className="text-xl font-semibold text-[#34322d] leading-[26px] tracking-[-0.44px]">
              {title}
            </DialogTitle>
          ) : null}
          {/* Static subtitle asking the user to log in */}
          <DialogDescription className="text-sm text-[#858481] leading-5 tracking-[-0.154px]">
            Please login with Manus to continue
          </DialogDescription>
        </div>

        <DialogFooter className="px-5 py-5">
          {/* Login button – triggers the OAuth flow provided by the parent */}
          <Button
            onClick={onLogin}
            className="w-full h-10 bg-[#1a1a19] hover:bg-[#1a1a19]/90 text-white rounded-[10px] text-sm font-medium leading-5 tracking-[-0.154px]"
          >
            Login with Manus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
