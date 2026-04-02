import type { FC, PropsWithChildren } from "react";

const NestedFields: FC<PropsWithChildren> = ({ children, ...props }) => {
  return (
    <div className="nested-fields" {...props}>
      {children}
    </div>
  );
};

export default NestedFields;
