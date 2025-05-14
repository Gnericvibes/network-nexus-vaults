
import { toast as sonnerToast } from "sonner";
import { toast as radixToast } from "@/components/ui/toast";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
};

export const useToast = () => {
  const toast = (props: ToastProps) => {
    // Use sonner toast for simple notifications
    if (!props.action) {
      sonnerToast[props.variant === "destructive" ? "error" : "success"](
        props.title, 
        { description: props.description }
      );
      return;
    }
    
    // Use radix toast for more complex toasts with actions
    radixToast({
      title: props.title,
      description: props.description,
      variant: props.variant,
      action: props.action,
    });
  };

  return { toast };
};

export const toast = {
  success: (title: string, options?: { description?: string }) => {
    sonnerToast.success(title, { description: options?.description });
  },
  error: (title: string, options?: { description?: string }) => {
    sonnerToast.error(title, { description: options?.description });
  },
  info: (title: string, options?: { description?: string }) => {
    sonnerToast.info(title, { description: options?.description });
  },
  warning: (title: string, options?: { description?: string }) => {
    sonnerToast.warning(title, { description: options?.description });
  },
};
