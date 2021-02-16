import { ReactElement } from "react";
import { motion } from "framer-motion";

type Props = {
  distanceInPx: number;
  isActive: boolean;
  children: ReactElement | ReactElement[];
};

export default function SlideInOut({
  distanceInPx,
  isActive = true,
  children,
}: Props): ReactElement {
  return (
    <>
      {isActive && (
        <motion.div
          initial={{ x: distanceInPx }}
          animate={{ x: 0 }}
          exit={{ x: distanceInPx }}
          transition={{ type: "tween" }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
