import { ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  children: ReactElement | ReactElement[];
  className?: string;
  isActive: boolean;
};

export default function FadeIn({
  children,
  className,
  isActive = true,
}: Props): ReactElement {
  return (
    <>
      {isActive && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={className}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
