import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  children: any;
  isActive: boolean;
};

export default function ZoomIn({
  children,
  isActive,
}: Props): React.ReactElement {
  return (
    <>
      {isActive && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
