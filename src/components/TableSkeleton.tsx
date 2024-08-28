import { cn } from "@/lib/utils";
import React from "react";
import ContentLoader from "react-content-loader";

const TableSkeleton = ({ className }: { className?: string }) => (
  <ContentLoader
    speed={1}
    viewBox="0 0 700 400"
    width={700}
    height={400}
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    className={cn("w-full", className)}
  >
    <rect x="32" y="138" rx="0" ry="0" width="0" height="2" />
    <rect x="187" y="574" rx="0" ry="0" width="14" height="0" />
    <circle cx="54" cy="63" r="24" />
    <rect x="116" y="47" rx="0" ry="0" width="500" height="30" />
    <circle cx="54" cy="126" r="24" />
    <circle cx="54" cy="185" r="24" />
    <circle cx="54" cy="243" r="24" />
    <circle cx="55" cy="305" r="24" />
    <circle cx="55" cy="365" r="24" />
    <circle cx="57" cy="431" r="24" />
    <rect x="116" y="106" rx="0" ry="0" width="500" height="30" />
    <rect x="116" y="169" rx="0" ry="0" width="500" height="30" />
    <rect x="116" y="227" rx="0" ry="0" width="500" height="30" />
    <rect x="116" y="290" rx="0" ry="0" width="500" height="30" />
    <rect x="116" y="352" rx="0" ry="0" width="500" height="30" />
    <rect x="116" y="415" rx="0" ry="0" width="500" height="30" />
  </ContentLoader>
);

export default TableSkeleton;
