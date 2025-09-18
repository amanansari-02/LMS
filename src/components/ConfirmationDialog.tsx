import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMediaQuery } from "react-responsive";
import { Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";

export function ConfirmationDialog({
  isOpen,
  setIsOpen,
  title,
  description,
  isLoading,
  successLabel,
  isDisabled,
  successLoadingLabel,
  successVariant = null,
  successAction,
  buttonStyle = null,
  cancelButtonStyle = null,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  isLoading: boolean;
  successAction: () => void;
  isDisabled?: boolean;
  successLabel: string;
  successLoadingLabel: string;
  successVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
  description?: React.ReactNode;
  buttonStyle?: string | null;
  cancelButtonStyle?: string | null;
}) {
  const DESKTOP_BREAKPOINT = "(min-width: 768px)";
  const isDesktop = useMediaQuery({ query: DESKTOP_BREAKPOINT });

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription> {description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant={"outline"}
              onClick={() => setIsOpen(false)}
              className={`${cancelButtonStyle}`}
            >
              Cancel
            </Button>
            <Button
              variant={successVariant}
              disabled={isLoading || isDisabled}
              onClick={() => successAction()}
              className={`${buttonStyle}`}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? successLoadingLabel : successLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription> {description}</DrawerDescription>}
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-2 p-4">
          <Button
            variant={"outline"}
            onClick={() => setIsOpen(false)}
            className={`${cancelButtonStyle} w-full`}
          >
            Cancel
          </Button>
          <Button
            variant={successVariant}
            className={`${buttonStyle} w-full`}
            disabled={isLoading || isDisabled}
            onClick={() => successAction()}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? successLoadingLabel : successLabel}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
