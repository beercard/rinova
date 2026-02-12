import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        let Icon = null
        
        if (variant === 'success') {
          Icon = CheckCircle2
        } else if (variant === 'error' || variant === 'destructive') {
          Icon = AlertCircle
        } else if (variant === 'info') {
          Icon = Info
        } else if (variant === 'warning') {
          Icon = AlertTriangle
        }

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3 items-start">
              {Icon && (
                <div className="shrink-0 mt-0.5">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}