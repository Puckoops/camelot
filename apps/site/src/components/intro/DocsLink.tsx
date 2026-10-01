"use client";

import { TextLink } from "@puckoops/camelot";
import Link from "next/link";
import type { ReactNode } from "react";

export function DocsLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <TextLink as={Link} href={href}>
      {children}
    </TextLink>
  );
}
