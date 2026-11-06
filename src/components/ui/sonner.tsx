import { Toaster as Sonner, toast } from "sonner";
import { usePreferences } from "@/context/PreferencesContext";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Follow the site's own theme and reading direction (toasts sit on the "end" side).
  const { resolvedTheme, dir } = usePreferences();

  return (
    <Sonner
      theme={resolvedTheme}
      dir={dir}
      position={dir === "rtl" ? "bottom-left" : "bottom-right"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
