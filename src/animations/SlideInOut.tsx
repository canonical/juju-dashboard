import { ReactElement } from "react";
import { motion } from "framer-motion";

type Props = {
  children: ReactElement | ReactElement[];
};

export default function SlideInOut({ children }: Props): ReactElement {
  return (
    <motion.div
      initial={{ x: 100 }}
      animate={{ x: 0 }}
      exit={{ x: 100 }}
      transition={{ type: "spring", stiffness: 0 }}
    >
      {children}
    </motion.div>
  );
}
