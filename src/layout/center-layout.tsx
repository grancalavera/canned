import React, { ReactNode } from "react";
import { block } from "../bem/bem";
import "./center-layout.scss";

const b = block("center-layout");

interface Props {
  children?: ReactNode;
}

export const CenterLayout = ({ children }: Props) => {
  return (
    <div className={b()}>
      <div className={b("body")}>{children}</div>
    </div>
  );
};
