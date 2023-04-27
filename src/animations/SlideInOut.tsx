import type { PropsWithSpread } from "@canonical/react-components";
import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";

export type Props = PropsWithSpread<
  {
    isActive: boolean;
    children: JSX.Element;
    className: string;
  },
  HTMLMotionProps<"div">
>;

export default function SlideInOut({
  isActive = true,
  children,
  className,
  ...props
}: Props): JSX.Element {
  return (
    <>
      {isActive && (
        <motion.div
          className={className}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween" }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
