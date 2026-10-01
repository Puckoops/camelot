import {
  Add01Icon,
  Calendar03Icon,
  DashboardSquare02Icon,
  File01Icon,
  MoneyExchange01Icon,
  MoreHorizontalIcon,
  PackageIcon,
  Settings01Icon,
  Sun03Icon,
  Task01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import {
  AppShell,
  Avatar,
  Band,
  BrandMark,
  Breadcrumbs,
  Button,
  FigureCard,
  Grid,
  GridItem,
  IconButton,
  ListCard,
  Menu,
  MenuItem,
  MenuSeparator,
  Page,
  PageHeader,
  SampleFlag,
  SearchInput,
  Sidebar,
  SidebarBrand,
  SidebarFooter,
  SidebarItem,
  SidebarSection,
  SidebarSeparator,
  SidebarUser,
  Topbar,
} from "@puckoops/camelot";
import type { ReactNode } from "react";
import type { Decorator, ExampleOf, Meta } from "@/docs";

const docsFrame: Decorator = (Example, { parameters, viewMode }) =>
  viewMode === "docs" && !parameters.docsInline ? (
    <div style={{ height: 640, overflow: "auto", borderRadius: "var(--radius-lg)", boxShadow: "inset 0 0 0 var(--border-w) var(--hairline)" }}>
      <Example />
    </div>
  ) : (
    <Example />
  );

function StudioSidebar({ current = "Dashboard" }: { current?: string }) {
  const item = (icon: typeof Task01Icon, label: string, badge?: ReactNode) => (
    <SidebarItem icon={icon} href="#" current={current === label} badge={badge}>
      {label}
    </SidebarItem>
  );
  return (
    <Sidebar aria-label="Primary">
      <SidebarBrand name="ORBIT" end={<IconButton icon={Sun03Icon} aria-label="Appearance" variant="bare" size="sm" />} />
      <SidebarSection label="Workspace">
        {item(DashboardSquare02Icon, "Dashboard")}
        {item(Task01Icon, "Tracker", 12)}
        {item(Calendar03Icon, "Calendar")}
      </SidebarSection>
      <SidebarSection label="Ledger">
        {item(File01Icon, "Obligations", 3)}
        {item(MoneyExchange01Icon, "Payments")}
      </SidebarSection>
      <SidebarSection label="Files & people">
        {item(PackageIcon, "Inventory")}
        {item(UserIcon, "Clients")}
        <SidebarSeparator />
        {item(Settings01Icon, "Settings")}
      </SidebarSection>
      <SidebarFooter note="Sample data. Nothing here is real.">
        <SidebarUser
          name="Annika Revell"
          email="annika@nordvikatelier.com"
          avatar={<Avatar name="Annika Revell" />}
          menu={
            <Menu trigger={<IconButton icon={MoreHorizontalIcon} aria-label="Account" variant="bare" size="sm" />} side="top" align="start">
              <MenuItem>Profile</MenuItem>
              <MenuItem>Appearance</MenuItem>
              <MenuSeparator />
              <MenuItem>Sign out</MenuItem>
            </Menu>
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}

function Dashboard() {
  return (
    <Page>
      <PageHeader
        eyebrow="Wednesday 30 September"
        title="Dashboard"
        subtitle="What needs you this week, across every client."
        actions={
          <Button variant="primary" iconStart={Add01Icon}>
            Add new
          </Button>
        }
      />
      <Band first>
        <Grid>
          <GridItem span={7}>
            <FigureCard
              hero
              label="Outstanding"
              value={48320}
              format={(n) => `£${Math.round(n).toLocaleString("en-GB")}`}
              caption="Receivable across 9 open invoices."
            />
          </GridItem>
          <GridItem span={5}>
            <ListCard
              title="This week"
              rows={[
                { label: "Tasks due", value: 14 },
                { label: "Invoices to send", value: 3 },
                { label: "Files to review", value: 6 },
              ]}
            />
          </GridItem>
        </Grid>
      </Band>
    </Page>
  );
}

const meta = {
  title: "ui/Shell",
  component: AppShell,
  subcomponents: { Sidebar, SidebarBrand, SidebarSection, SidebarItem, SidebarSeparator, SidebarUser, SidebarFooter, Topbar, Breadcrumbs },
  decorators: [docsFrame],
  description:
    "The app frame: a **248px sidebar** of sections and items (the current item is the only filled one), a **sticky topbar** with breadcrumbs that gains its rule once the page scrolls, and the content column. One level of navigation only. Below 1040px the sidebar becomes an icon rail; below 860px, a horizontal strip.",
  parameters: { layout: "fullscreen" },
  args: { sidebar: <StudioSidebar />, children: null },
  argTypes: { sidebar: { control: false }, children: { control: false } },
  render: (args) => (
    <AppShell {...args}>
      <Topbar
        start={<Breadcrumbs items={[{ label: "ORBIT", href: "#" }, { label: "Dashboard" }]} />}
        end={
          <div style={{ width: 220 }}>
            <SearchInput aria-label="Search" placeholder="Search" />
          </div>
        }
      />
      <Dashboard />
    </AppShell>
  ),
} satisfies Meta<typeof AppShell>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "The whole frame. Scroll the content to see the topbar pick up its hairline.",
};

export const DeepPage: Example = {
  args: { sidebar: <StudioSidebar current="Clients" /> },
  render: (args) => (
    <AppShell {...args}>
      <Topbar
        start={<Breadcrumbs items={[{ label: "ORBIT", href: "#" }, { label: "Clients", href: "#" }, { label: "Nordvik Atelier" }]} />}
        end={<Button size="sm">Edit client</Button>}
      />
      <Page>
        <PageHeader title="Nordvik Atelier" subtitle="Client since March 2024 · Oslo" actions={<SampleFlag />} />
        <Band first heading="Open work" caption="Three projects, one overdue invoice.">
          <Grid>
            <GridItem span={8}>
              <ListCard
                title="Projects"
                rows={[
                  { label: "Brand system rollout", value: "£28,000" },
                  { label: "Signage pilot", value: "£9,400" },
                  { label: "Annual report", value: "£6,200" },
                ]}
              />
            </GridItem>
            <GridItem span={4}>
              <FigureCard label="Owed" value={14200} format={(n) => `£${Math.round(n).toLocaleString("en-GB")}`} caption="Invoice 2041, due 02 Oct." />
            </GridItem>
          </Grid>
        </Band>
      </Page>
    </AppShell>
  ),
  description: "Three levels of breadcrumbs; the sidebar marks the section, not the record.",
};

export const SidebarAlone: Example = {
  render: () => (
    <div style={{ display: "flex", height: 640 }}>
      <StudioSidebar current="Tracker" />
    </div>
  ),
  description: "Sections, counts, a separator and the account row with its menu.",
};

export const BreadcrumbTrail: Example = {
  render: () => (
    <div style={{ padding: 24, background: "var(--surface)" }}>
      <Breadcrumbs items={[{ label: "ORBIT", href: "#" }, { label: "Ledger", href: "#" }, { label: "Obligations", href: "#" }, { label: "Invoice 2041" }]} />
    </div>
  ),
  parameters: { docsInline: true },
  description: "Breadcrumbs: earlier levels link, the last is the current page.",
};

export const Brand: Example = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24, padding: 24, background: "var(--surface)", color: "var(--text-1)" }}>
      <BrandMark size={22} />
      <BrandMark size={32} />
      <div style={{ width: 248, borderRight: "var(--border-w) solid var(--hairline)" }}>
        <SidebarBrand name="ORBIT" href="#" />
      </div>
    </div>
  ),
  parameters: { docsInline: true },
  description: "The mark alone and in the sidebar's brand row.",
};

export const AllVariants: Example = {
  args: { sidebar: <StudioSidebar current="Obligations" /> },
  render: (args) => (
    <AppShell {...args}>
      <Topbar
        start={<Breadcrumbs items={[{ label: "ORBIT", href: "#" }, { label: "Ledger", href: "#" }, { label: "Obligations" }]} />}
        end={
          <>
            <div style={{ width: 240 }}>
              <SearchInput aria-label="Search obligations" placeholder="Search obligations" />
            </div>
            <Button variant="primary" size="sm" iconStart={Add01Icon}>
              New obligation
            </Button>
          </>
        }
      />
      <Dashboard />
    </AppShell>
  ),
  description: "Every piece at once: badges, separator, account menu, search and a primary action in the topbar.",
};
