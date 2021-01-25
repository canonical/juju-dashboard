import { ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  children: ReactElement | ReactElement[];
  isActive: boolean;
};

export default function FadeIn({
  children,
  isActive = true,
}: Props): ReactElement {
  return (
    <>
      {isActive && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
