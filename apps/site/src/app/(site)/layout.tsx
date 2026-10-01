import { Manager } from "@/components/manager/Manager";
import { tree } from "@/lib/data";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <Manager tree={tree()}>{children}</Manager>;
}
