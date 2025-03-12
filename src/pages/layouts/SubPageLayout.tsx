import classNames from "classnames";

import { FooterView } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import React from "react";

export function BlurEllipsis(props: { positionClass?: string }) {
  return (
    <>
      {/* Blur elipsis */}
      <div
        className={classNames(
          props.positionClass ?? "fixed",
          "top-0 -right-48 rotate-[32deg] w-[50rem] h-[15rem] rounded-[70rem] bg-background-accentA blur-[100px] pointer-events-none opacity-25 transition-colors duration-75",
        )}
      />
      <div
        className={classNames(
          props.positionClass ?? "fixed",
          "top-0 right-48 rotate-[32deg] w-[50rem] h-[15rem] rounded-[70rem] bg-background-accentB blur-[100px] pointer-events-none opacity-25 transition-colors duration-75",
        )}
      />
    </>
  );
}

// export function SubPageLayout(props: { children: React.ReactNode }) {
export const SubPageLayout: React.FC<{ children: React.ReactNode }> = (props) => {
  return (
    <div
      className="bg-background-main"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, var(--tw-gradient-from), var(--tw-gradient-to) 800px)",
      }}
    >
      <BlurEllipsis />
      {/* Main page */}
      <FooterView>
        <Navigation doBackground noLightbar />
        <div className="mt-40 relative">{props.children}</div>
      </FooterView>
    </div>
  );
}
// 使用 React.memo 包装组件
export default React.memo(SubPageLayout);
