
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary-from to-primary-to text-primary-foreground hover:shadow-glow hover:scale-105 shadow-lg",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-destructive-foreground hover:shadow-lg hover:scale-105",
          delete:
          "bg-gradient-to-r from-red-400 to-red-500 text-destructive-foreground hover:shadow-lg hover:scale-105",
        outline:
          "border-2 border-input bg-background text-primary hover:border-primary/50 transition-all duration-300",
        secondary:
          "bg-gradient-to-r from-secondary-from to-secondary-to text-secondary-foreground hover:shadow-lg hover:scale-105",
        ghost: "hover:bg-gradient-to-r hover:from-accent/10 hover:to-primary/10 hover:text-accent-foreground transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-from transition-colors",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
