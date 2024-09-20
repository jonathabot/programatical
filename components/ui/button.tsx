import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
  base: "inline-flex items-center justify-center text-m font-medium transition-colors focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-8 py-3 rounded-3xl",
  variants: {
    variant: {
      default:
        "bg-pgmt-blue text-primary-foreground hover:bg-pgmt-blue/80 text-white",
      white: "bg-white text-gray-900 hover:bg-gray-100 text-black",
      gray: "bg-gray-200 text-gray-900 hover:bg-gray-300 text-black",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <button className={button({ variant, className })} ref={ref} {...props} />
    );
  }
);

Button.displayName = "Button";
