import { Card, Elevation } from "@blueprintjs/core";
import React, { ReactNode } from "react";
import { block } from "../bem/bem";
import "./section-layout.scss";

const b = block("section-layout");

interface Props {
  header: ReactNode;
  children: ReactNode;
}

export const SectionLayout = ({ children, header }: Props) => (
  <Card className={b()} elevation={Elevation.TWO}>
    <header className={b("header")}>{header}</header>
    {children}
  </Card>
);
