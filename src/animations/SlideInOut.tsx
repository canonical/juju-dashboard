import { motion } from "framer-motion";

type Props = {
  isActive: boolean;
  children: JSX.Element;
};

export default function SlideInOut({
  isActive = true,
  children,
}: Props): JSX.Element {
  return (
    <>
      {isActive && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween" }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
