export type Category =
  | "Actions"
  | "Forms"
  | "Status"
  | "Cards"
  | "Layout"
  | "Navigation"
  | "Data"
  | "Overlays"
  | "Feedback"
  | "Files"
  | "Charts"
  | "Foundations";

export interface Alternative {
  name: string;
  /** Finishes the sentence "Use {name} instead …". */
  when: string;
}

export interface CatalogEntry {
  /** The docs page's name, e.g. "Button" or "Cards/FigureCard"; a docs file titled ui/{name} documents it. */
  name: string;
  category: Category;
  summary: string;
  exports: string[];
  import: string;
  whenToUse: string;
  useInstead?: Alternative[];
  keywords?: string[];
}

const entry = (e: Omit<CatalogEntry, "import">): CatalogEntry => ({
  ...e,
  import: `import { ${e.exports.join(", ")} } from "@puckoops/camelot";`,
});

export const catalog: CatalogEntry[] = [
  entry({
    name: "Button",
    category: "Actions",
    summary: "A one-shot action: primary (ink), ghost (outlined) or quiet (filled), in three sizes, with optional icons.",
    exports: ["Button", "IconButton"],
    whenToUse:
      "Use Button for anything that fires an action: submit, save, open a drawer. One primary per section; everything else is ghost or quiet. Use IconButton for a toolbar or row action that is a single glyph, and always give it an aria-label.",
    useInstead: [
      { name: "TextLink", when: "when the action navigates somewhere and reads as part of a sentence." },
      { name: "ChoiceGroup", when: "when the control keeps a selected state instead of firing once." },
      { name: "Menu", when: "when one trigger offers several actions, such as Add new." },
    ],
    keywords: ["cta", "submit", "action", "icon button"],
  }),
  entry({
    name: "Chip",
    category: "Status",
    summary: "The only place a hue may appear: a state label with its frozen glyph, in teal, blue, amber, red or neutral.",
    exports: ["Chip", "Glyph"],
    whenToUse:
      "Use Chip for a state — task status, invoice stage, obligation direction, client health. Always pass the glyph so the state reads in greyscale. One chip column per table; if a second column wants a chip it becomes plain ink.",
    useInstead: [
      { name: "PriorityMark", when: "for priority, which is glyph and ink only and never a filled chip." },
      { name: "Badge", when: "for a count or a neutral tag that is not a state." },
    ],
    keywords: ["status", "tag", "pill", "state", "badge", "glyph"],
  }),
  entry({
    name: "PriorityMark",
    category: "Status",
    summary: "P1 / P2 / P3 (or High / Medium / Low) as a small glyph and a word, never a filled chip.",
    exports: ["PriorityMark", "priorityLabel"],
    whenToUse: "Use PriorityMark wherever a priority is shown: board cards, table cells, drawers.",
    useInstead: [{ name: "Chip", when: "for a status or stage, not a priority." }],
    keywords: ["priority", "p1", "high", "urgency"],
  }),
  entry({
    name: "Badge",
    category: "Status",
    summary: "A neutral count or tag: 12 open, PDF, Beta. Counts are mono in a pill; tags are mono caps, outlined. Never a state, never a hue.",
    exports: ["Badge"],
    whenToUse:
      "Use Badge for a number beside a label (a tab, a sidebar item, a column head) or a short neutral tag such as a file kind or Beta. strong fills a count with ink when it needs attention, such as unread; it still carries no state.",
    useInstead: [
      { name: "Chip", when: "for a state such as Overdue, In Review or Done, which needs a tone and a glyph." },
      { name: "PriorityMark", when: "for a priority." },
    ],
    keywords: ["count", "tag", "counter", "number", "pill"],
  }),
  entry({
    name: "Field",
    category: "Forms",
    summary: "A label, a control, and a hint or error, wired together for assistive tech.",
    exports: ["Field", "Input", "SearchInput", "Textarea"],
    whenToUse:
      "Wrap every form control in Field so its label, hint and error are connected. Input for text and numbers (prefix for a currency symbol), Textarea for notes, SearchInput for a filter box.",
    useInstead: [
      { name: "Select", when: "when the value comes from a fixed list." },
      { name: "DateInput", when: "for a date; never a free-text date." },
    ],
    keywords: ["input", "text field", "label", "form", "textarea", "search"],
  }),
  entry({
    name: "Label",
    category: "Forms",
    summary: "The caption for a control outside Field, with the required mark or a quiet Optional; clicking it focuses the control.",
    exports: ["Label"],
    whenToUse:
      "Use Label for a control that Field does not wrap: a Slider, a RadioGroup, a custom picker. Point htmlFor at the control's id. Mark the few optional fields or the required ones, never both in one form.",
    useInstead: [{ name: "Field", when: "for an Input, Textarea, Select or DateInput, where the label, hint and error travel together." }],
    keywords: ["label", "caption", "required", "optional", "form label"],
  }),
  entry({
    name: "HelperText",
    category: "Forms",
    summary: "One line under a control: a hint, an error that says what to do next, or a confirmation, each with its glyph.",
    exports: ["HelperText"],
    whenToUse:
      'Use HelperText under a control that Field does not wrap (RadioGroup, Switch, Slider, Dropzone), or to confirm a check that passed, such as "That handle is free". Write an error as the fix: "Enter a date after 01 Oct", not "Invalid date".',
    useInstead: [
      { name: "Field", when: "for an Input, Select or Textarea; its hint and error props render the same line and wire it to the control." },
      { name: "Alert", when: "for a message about the whole form or page." },
    ],
    keywords: ["hint", "error message", "validation", "help text", "description"],
  }),
  entry({
    name: "Select",
    category: "Forms",
    summary: "Pick one value from a list, as a form field or as a compact filter button.",
    exports: ["Select"],
    whenToUse:
      'Use variant="field" inside forms and variant="filter" in filter rows. allLabel adds a first option such as "All clients" that reports an empty string.',
    useInstead: [
      { name: "SegmentedControl", when: "for two to five options that should all stay visible." },
      { name: "ChoiceGroup", when: "for options shown as chips, such as Type or Priority in a form." },
    ],
    keywords: ["dropdown", "picker", "filter", "combobox"],
  }),
  entry({
    name: "SearchSelect",
    category: "Forms",
    summary: "A searchable single select for long lists such as clients or projects: a field-shaped trigger, a search box and a filtered, keyboard-driven list.",
    exports: ["SearchSelect"],
    whenToUse:
      "Use SearchSelect when the list is long enough that people type to find the option (roughly more than ten) or grows with the account: clients, projects, people. Put an Add client action in footer when the option might not exist yet.",
    useInstead: [
      { name: "Select", when: "for a short, fixed list that fits on screen." },
      { name: "Menu", when: "for a list of actions rather than a value." },
    ],
    keywords: ["combobox", "autocomplete", "typeahead", "searchable select", "picker", "client picker"],
  }),
  entry({
    name: "Checkbox",
    category: "Forms",
    summary: "An on/off choice with a label, such as Include archived or a calendar overlay.",
    exports: ["Checkbox"],
    whenToUse: "Use Checkbox for independent on/off options, alone or in a list.",
    useInstead: [{ name: "Switch", when: "when flipping it takes effect immediately, like a setting." }],
    keywords: ["tick", "toggle", "option"],
  }),
  entry({
    name: "Switch",
    category: "Forms",
    summary: "An on/off setting that applies the moment it flips, with an optional description.",
    exports: ["Switch"],
    whenToUse:
      'Use Switch in settings where the change takes effect immediately: notifications, auto-archive, a public link. In a settings list use labelPosition="start" so the labels align and the switches line up at the end.',
    useInstead: [{ name: "Checkbox", when: "when the choice is saved with the rest of a form." }],
    keywords: ["toggle", "on off", "setting", "preference"],
  }),
  entry({
    name: "RadioGroup",
    category: "Forms",
    summary: "One choice from a short list as radio buttons, each able to carry a sentence of explanation.",
    exports: ["RadioGroup"],
    whenToUse:
      "Use RadioGroup in a form when each option needs a line of explanation, such as invoice frequency or who can see a project. Two to about six options; the arrow keys move the choice.",
    useInstead: [
      { name: "ChoiceGroup", when: "for compact options shown as pills, outlines or chips." },
      { name: "Select", when: "for more than about six options." },
      { name: "SegmentedControl", when: "to switch a view rather than set a value." },
    ],
    keywords: ["radio", "radio button", "options", "single choice"],
  }),
  entry({
    name: "Slider",
    category: "Forms",
    summary: "Drag to an approximate number, or a range with two thumbs, with the value set in mono.",
    exports: ["Slider"],
    whenToUse:
      "Use Slider for an approximate value inside known bounds, such as weekly capacity or a budget range filter. Give it a label and a format so the readout carries the unit.",
    useInstead: [{ name: "Field", when: "with an Input when the exact number matters, such as a fee." }],
    keywords: ["range", "range filter", "budget", "min max"],
  }),
  entry({
    name: "SegmentedControl",
    category: "Navigation",
    summary: "Two to five mutually exclusive views in a trough with a sliding thumb: Month · Week · Timeline · Agenda.",
    exports: ["SegmentedControl"],
    whenToUse: "Use SegmentedControl to switch views or a direction filter (Both · Payable · Receivable) without leaving the page.",
    useInstead: [
      { name: "Tabs", when: "when each option is a distinct section with its own content below." },
      { name: "ChoiceGroup", when: "when the options are form values rather than views." },
    ],
    keywords: ["tabs", "toggle group", "view switch", "segmented"],
  }),
  entry({
    name: "Tabs",
    category: "Navigation",
    summary: "Sections of one surface that the reader switches between: underline tabs for a page or record, segmented tabs inside a card or drawer, with optional counts.",
    exports: ["Tabs", "TabsList", "TabsTrigger", "TabsContent"],
    whenToUse:
      "Use Tabs when each option shows a different section below, such as Overview · Tasks · Files on a project. Underline is the default; segmented sits inside a card, a drawer or a panel. Keep labels to one or two words and put a count on the tab rather than in its label.",
    useInstead: [
      { name: "SegmentedControl", when: "to switch the view of the same data, such as Month · Week." },
      { name: "Accordion", when: "when several sections may be open at once or are read in order." },
      { name: "Stepper", when: "when the sections are steps that must be done in order." },
    ],
    keywords: ["tab bar", "sections", "switcher"],
  }),
  entry({
    name: "Stepper",
    category: "Navigation",
    summary: "A horizontal row of named steps: a check when done, an ink ring on the current step, a number for the rest.",
    exports: ["Stepper"],
    whenToUse:
      "Use Stepper at the top of a flow that has to be done in order, such as onboarding a client or raising an invoice. Three to six steps; pass onStepClick to let people go back to a finished step.",
    useInstead: [
      { name: "Progress", when: "when the work has no named steps." },
      { name: "Tabs", when: "when the sections can be visited in any order." },
    ],
    keywords: ["steps", "wizard", "multi-step", "onboarding"],
  }),
  entry({
    name: "ChoiceGroup",
    category: "Forms",
    summary: "A single choice shown as pills, outlined options or chips: quick filters, Type, Priority, Status, Health.",
    exports: ["ChoiceGroup"],
    whenToUse:
      'look="pill" for quick filters (the chosen one is ink-filled), look="outline" for form choices such as Type or Priority, look="bare" when each option is itself a Chip.',
    useInstead: [
      { name: "Select", when: "when there are more than about six options." },
      { name: "SegmentedControl", when: "when the choice switches a view." },
    ],
    keywords: ["radio", "pills", "chips", "quick filter"],
  }),
  entry({
    name: "DateInput",
    category: "Forms",
    summary: "A date field that opens a month calendar and reports YYYY-MM-DD.",
    exports: ["DateInput", "Calendar", "formatIsoDate"],
    whenToUse: "Use DateInput for any single date. Values are YYYY-MM-DD strings so a picked day never moves with the viewer's timezone.",
    keywords: ["date picker", "calendar", "due date"],
  }),
  entry({
    name: "FormFooter",
    category: "Forms",
    summary: "The sticky bottom bar of a long form: a note on the left, Cancel and the one primary action on the right.",
    exports: ["FormFooter"],
    whenToUse:
      'Use FormFooter as the last element of a full-page form (New project, Edit client) so its actions stay in reach while it scrolls. The note says what the reader needs before submitting, such as "All fields marked * are required".',
    useInstead: [{ name: "Drawer", when: "for a short create form; its footer prop already pins the actions." }],
    keywords: ["form actions", "sticky footer", "save bar", "submit bar"],
  }),
  entry({
    name: "Cards/FigureCard",
    category: "Cards",
    summary: "The one number that matters: caps label, a KPI figure, a caption, and an optional bar row at the bottom.",
    exports: ["FigureCard", "Sparkbars"],
    whenToUse: "Use FigureCard for the hero figure of a screen (hero) or a secondary figure. Exactly one hero per screen.",
    useInstead: [
      { name: "Cards/ListCard", when: "for three to five related numbers." },
      { name: "Cards/MeterCard", when: "for a share of a whole, such as capacity." },
    ],
    keywords: ["kpi", "metric", "stat", "number"],
  }),
  entry({
    name: "Cards/ListCard",
    category: "Cards",
    summary: "Three to five label · value rows under a title, separated by hairlines.",
    exports: ["ListCard"],
    whenToUse: "Use ListCard for 'this month', 'needs attention', 'due this week' — short lists of numbers. More than five rows is a Table.",
    useInstead: [{ name: "Table", when: "for more than five rows or anything with several columns." }],
    keywords: ["list", "summary", "stats"],
  }),
  entry({
    name: "Cards/MeterCard",
    category: "Cards",
    summary: "A title, a percentage and a bar: capacity, allocation, progress.",
    exports: ["MeterCard", "Meter", "InlineMeter"],
    whenToUse: "Use MeterCard for one share of a whole. Use InlineMeter inside a drawer or row for the Allocated / Committed / Consumed / Invoiced stack.",
    keywords: ["progress", "capacity", "percentage", "bar"],
  }),
  entry({
    name: "Cards/ActionCard",
    category: "Cards",
    summary: "A 28px glyph, a title, one caption line and an action: next steps, uploads, empty states.",
    exports: ["ActionCard"],
    whenToUse: "Use ActionCard for a next step such as Upload files, or pass onClick/href to make the whole card the action.",
    useInstead: [{ name: "EmptyState", when: "inside a table or band that has nothing to show." }],
    keywords: ["cta card", "shortcut", "upload"],
  }),
  entry({
    name: "Cards/Card",
    category: "Cards",
    summary: "The base card: surface, hairline, radius-lg, shadow-card. Every archetype is built on it.",
    exports: ["Card", "MediaCard"],
    whenToUse: "Use Card only when none of the archetypes fits. MediaCard is for the landing page: an image bleeding to three edges with a title.",
    keywords: ["panel", "container", "box"],
  }),
  entry({
    name: "Kpi",
    category: "Data",
    summary: "A tabular mono figure that counts to its new value when it changes.",
    exports: ["Kpi"],
    whenToUse:
      "Use Kpi for a figure outside a FigureCard, such as a stat row. size=\"hero\" is reserved for the one hero figure. With reduced motion, or in a hidden tab, a change jumps straight to the new number.",
    keywords: ["number", "figure", "counter", "value tick"],
  }),
  entry({
    name: "Meter",
    category: "Data",
    summary: "A share of a whole as a bar (Meter), the Allocated / Committed / Consumed / Invoiced stack (InlineMeter), and a row of bars for a small trend (Sparkbars).",
    exports: ["Meter", "InlineMeter", "Sparkbars"],
    whenToUse:
      "Use Meter for a measure that is not a task, such as capacity or budget used. InlineMeter compares four stages of one budget in a drawer or a row, with an optional warning tick. Sparkbars sits at the foot of a FigureCard; the trailing bars carry ink.",
    useInstead: [
      { name: "Progress", when: "for work that finishes, such as an import or a sync." },
      { name: "Chart", when: "when the trend needs axes and values." },
    ],
    keywords: ["gauge", "capacity", "sparkline", "budget", "allocation"],
  }),
  entry({
    name: "Progress",
    category: "Feedback",
    summary: "How far a task has got: a linear bar with its label above or beside it, or a small ring; it slides while the total is unknown.",
    exports: ["Progress", "ProgressCircle"],
    whenToUse:
      "Use Progress for work that finishes: an import, a sync, an onboarding checklist. Label it with the task and let the value read in mono. ProgressCircle fits where a bar would not, such as a card corner. Pass null while the total is unknown. Never use either for content that is loading; that is Skeleton.",
    useInstead: [
      { name: "Meter", when: "for a share of a whole that is not a task, such as capacity." },
      { name: "Skeleton", when: "while content loads." },
      { name: "Stepper", when: "when the steps have names." },
    ],
    keywords: ["progress bar", "percent", "ring", "spinner", "indeterminate"],
  }),
  entry({
    name: "Chart",
    category: "Charts",
    summary: "Small SVG bar, line and area charts: one ink series and a quiet comparison, hairline grid, mono ticks, a hover and keyboard readout, and a data table for assistive tech.",
    exports: ["BarChart", "LineChart", "AreaChart"],
    whenToUse:
      "Use BarChart to compare periods or categories, LineChart for a trend over time, AreaChart for a total that accumulates. One ink series; the comparison (last year, the target) is always the quiet one. Always pass title; the legend appears only when there are two series. One value axis only: two measures of different scale are two charts.",
    useInstead: [
      { name: "Cards/FigureCard", when: "when the story is one number; its Sparkbars footer covers a small trend without axes." },
      { name: "Meter", when: "for a single share of a whole." },
      { name: "Table", when: "when the reader needs exact values more than the shape." },
    ],
    keywords: ["graph", "bar chart", "line chart", "area chart", "trend", "data viz"],
  }),
  entry({
    name: "Table",
    category: "Data",
    summary: "The product's table: sticky caps header, three densities, numeric cells, a count line and an empty state that keeps the header.",
    exports: ["Table", "THead", "TBody", "Tr", "Th", "Td", "TGroup"],
    whenToUse:
      "Use Table for rows people scan. Density follows the job: relaxed for tables people read, default for the product, compact for a second table or a drawer. One dense table per viewport; never two tables in adjacent bands. A Tr with interactive and onClick is a tab stop that opens on Enter or Space, leaving keys on controls inside it alone; a row that contains its own link should pass tabIndex={-1} so the link is the one stop.",
    useInstead: [
      { name: "Cards/ListCard", when: "for five rows or fewer of label · value." },
      { name: "Board", when: "when rows are work items moving between states." },
    ],
    keywords: ["grid", "data table", "rows", "list"],
  }),
  entry({
    name: "Board",
    category: "Data",
    summary: "Status columns of cards; each column shows its glyph, name and count.",
    exports: ["Board", "BoardColumn", "BoardCard"],
    whenToUse: "Use Board for work that moves between states. Columns keep their place when empty — an empty Re-do column is information.",
    useInstead: [{ name: "Table", when: "when the reader needs to compare many fields across items." }],
    keywords: ["kanban", "columns", "tracker"],
  }),
  entry({
    name: "Drawer",
    category: "Overlays",
    summary: "A 480px right sheet over a scrim for creating or inspecting one record, plus a centred Dialog for confirmations.",
    exports: ["Drawer", "DrawerSection", "DescriptionList", "Dialog"],
    whenToUse:
      "Use Drawer for a record's detail or a short create form (Add client, New task). Use Dialog for a confirmation or a question that blocks the flow. Sections inside a drawer are separated by the strong hairline.",
    useInstead: [{ name: "Menu", when: "for a list of actions rather than content." }],
    keywords: ["sheet", "side panel", "modal", "dialog"],
  }),
  entry({
    name: "Menu",
    category: "Overlays",
    summary: "A dropdown of actions or links from one trigger.",
    exports: ["Menu", "MenuItem", "MenuLabel", "MenuSeparator", "MenuGroup"],
    whenToUse: "Use Menu for Add new, row actions, and the account menu.",
    useInstead: [{ name: "Select", when: "when the user is choosing a value, not an action." }],
    keywords: ["dropdown", "actions", "context menu", "overflow"],
  }),
  entry({
    name: "Tooltip",
    category: "Overlays",
    summary: "A short ink label on hover or focus, for icon buttons and truncated values.",
    exports: ["Tooltip", "TooltipProvider"],
    whenToUse: "Use Tooltip to name an icon-only control or show a full value that was truncated. Never put interactive content in a tooltip.",
    keywords: ["hint", "title", "hover"],
  }),
  entry({
    name: "Toast",
    category: "Feedback",
    summary: "A transient message in the corner after something happened: saved, failed, uploaded.",
    exports: ["Toaster", "toast"],
    whenToUse: "Call toast.success or toast.error after a mutation. Mount Toaster once near the root.",
    useInstead: [{ name: "Alert", when: "for a message that must stay on the page until it is dealt with." }],
    keywords: ["notification", "snackbar", "sonner", "message"],
  }),
  entry({
    name: "Alert",
    category: "Feedback",
    summary: "A message that stays on the page until it is dealt with: neutral, info, success, warning or critical. The tone colours only the glyph and a thin edge.",
    exports: ["Alert"],
    whenToUse:
      "Use Alert above the content it concerns for a condition the reader must see: a failed bank sync, an overdue balance, a locked period. A title that states the condition, one or two sentences, at most one action. Warning and critical interrupt assistive tech; the others wait. One alert per band.",
    useInstead: [
      { name: "Toast", when: "to confirm something that just happened." },
      { name: "Chip", when: "for the state of one row or record." },
      { name: "HelperText", when: "for a message about one field." },
    ],
    keywords: ["banner", "callout", "notice", "warning", "inline message"],
  }),
  entry({
    name: "EmptyState",
    category: "Feedback",
    summary: "A glyph, one sentence and one ghost button, centred where content would be.",
    exports: ["EmptyState"],
    whenToUse: 'Use EmptyState when a band or a filtered table has nothing to show. Never "No data".',
    keywords: ["empty", "zero state", "nothing"],
  }),
  entry({
    name: "Skeleton",
    category: "Feedback",
    summary: "Surface blocks at the real sizes, pulsing while data loads.",
    exports: ["Skeleton"],
    whenToUse: "Use Skeleton for loading, laid out like the final content. Never a spinner inside a table.",
    keywords: ["loading", "placeholder", "shimmer"],
  }),
  entry({
    name: "Avatar",
    category: "Data",
    summary: "Initials (or a picture) in a circle or rounded square.",
    exports: ["Avatar", "initials"],
    whenToUse: "Use Avatar for people and, with square, for client logos.",
    keywords: ["user", "initials", "profile picture", "logo"],
  }),
  entry({
    name: "Shell",
    category: "Layout",
    summary: "The app frame: a 248px sidebar with sections and items, a sticky topbar with breadcrumbs, and the content column.",
    exports: ["AppShell", "Sidebar", "SidebarBrand", "BrandMark", "SidebarSection", "SidebarItem", "SidebarSeparator", "SidebarUser", "SidebarFooter", "Topbar", "Breadcrumbs"],
    whenToUse:
      "Use AppShell once per product. One level of navigation only; the current item is the only filled one. Below 1040px the sidebar becomes an icon rail, below 860px a horizontal strip.",
    keywords: ["sidebar", "navigation", "layout", "app frame", "breadcrumbs"],
  }),
  entry({
    name: "Layout",
    category: "Layout",
    summary: "Composition: Page, PageHeader, Band (eyebrow, heading, caption), and the 12-column Grid with the allowed spans.",
    exports: ["Page", "PageHeader", "Band", "Grid", "GridItem", "Stack", "Divider", "SampleFlag"],
    whenToUse:
      "Every screen is a PageHeader followed by Bands. Bands hold a Grid whose items use the allowed spans: 12, 8+4, 7+5, 6+6 (once), 5+4+3, 4+4+4, 3×4. No band repeats the same card shape more than twice in a row.",
    keywords: ["grid", "columns", "section", "band", "page header"],
  }),
  entry({
    name: "Divider",
    category: "Layout",
    summary: "A hairline rule between groups: horizontal or vertical, solid or dashed, and strong between drawer sections.",
    exports: ["Divider"],
    whenToUse:
      "Use Divider to separate groups inside a card, a drawer or a toolbar. vertical separates inline groups such as filter controls, dashed marks a provisional or sample boundary, strong matches the rule between drawer sections. Bands never need one: spacing separates bands.",
    useInstead: [{ name: "Layout", when: "to separate sections of a page; Band spacing does that without a rule." }],
    keywords: ["hr", "separator", "rule", "line"],
  }),
  entry({
    name: "Accordion",
    category: "Layout",
    summary: "Sections that open in place, one at a time or several, with an optional count or date beside each title.",
    exports: ["Accordion", "AccordionItem"],
    whenToUse:
      'Use Accordion for secondary sections the reader opens one at a time: advanced settings, a client\'s past engagements, questions and answers. Keep what everyone needs outside it, and never hide a required field in a closed section. variant="framed" puts it on a card surface.',
    useInstead: [
      { name: "Tabs", when: "when the sections are peers the reader switches between." },
      { name: "Drawer", when: "for one record's detail opened from a list." },
    ],
    keywords: ["collapsible", "disclosure", "expand", "faq"],
  }),
  entry({
    name: "AspectRatio",
    category: "Layout",
    summary: "A frame that holds media at a fixed ratio (16:9, 4:3, 1:1) on --surface-2, so the layout keeps its shape while it loads.",
    exports: ["AspectRatio"],
    whenToUse:
      "Use AspectRatio around images, video and file previews: in a MediaCard, a file drawer, a gallery grid. Pass rounded={false} inside a card that already clips its media.",
    useInstead: [{ name: "Cards/Card", when: "with MediaCard for media with a title on the landing page." }],
    keywords: ["image", "video", "thumbnail", "media frame"],
  }),
  entry({
    name: "Upload",
    category: "Files",
    summary: "A dropzone and the per-file row with size, progress and remove.",
    exports: ["Dropzone", "UploadItem"],
    whenToUse: "Use Dropzone with useFileUpload for any file intake; list the queue with UploadItem.",
    keywords: ["file upload", "dropzone", "drag and drop", "attachments"],
  }),
  entry({
    name: "useFileUpload",
    category: "Files",
    summary: "A validated upload queue: type, size and count checks that read as sentences, concurrency, progress, cancel and retry; createSignedUrlUploader PUTs straight to storage.",
    exports: ["useFileUpload", "createSignedUrlUploader", "formatBytes"],
    whenToUse:
      "Use useFileUpload behind every Dropzone. Pass accept, maxSize and maxFiles so rejections read as sentences, and an upload function; createSignedUrlUploader builds one that asks your API for a signed URL, PUTs the file with progress, then registers it. List the queue with UploadItem and show a rejected file's sentence beside the dropzone.",
    useInstead: [{ name: "Upload", when: "for the visual pieces alone: Dropzone and UploadItem." }],
    keywords: ["file upload hook", "signed url", "presigned url", "upload queue", "retry"],
  }),
  entry({
    name: "AzStrip",
    category: "Navigation",
    summary: "A jump strip of letters for long alphabetical lists; letters with no entries stay quiet.",
    exports: ["AzStrip"],
    whenToUse: "Use AzStrip above an A–Z list such as Clients.",
    keywords: ["alphabet", "index", "jump"],
  }),
  entry({
    name: "Pagination",
    category: "Navigation",
    summary: "Page through a long list: numbers with arrows, arrows with Page 3 of 12, or a compact 3 / 12.",
    exports: ["Pagination", "paginationRange"],
    whenToUse:
      "Use Pagination under a Table whose rows are fetched a page at a time: numbers for a primary list, compact in a drawer or under a second table, arrows for a sequence read one page at a time. It is controlled; keep the page in state or in the URL.",
    useInstead: [{ name: "AzStrip", when: "to jump through an alphabetical list." }],
    keywords: ["pager", "pages", "next page", "paging"],
  }),
  entry({
    name: "GoogleSignIn",
    category: "Actions",
    summary: "Google's own sign-in button, drawn by Google's script in light or dark to follow the theme.",
    exports: ["GoogleSignIn"],
    whenToUse:
      "Use GoogleSignIn above a sign-in or sign-up form, once per page, with the OAuth client ID whose authorised JavaScript origins list the page's origin. Send the credential it hands over to user-svc's POST /user/oauth as id_token, through the app's own server where it has one. Google draws the button, so its size and type are Google's.",
    useInstead: [{ name: "Button", when: "for any other action, including email and password sign-in." }],
    keywords: ["google", "sso", "oauth", "sign in with google", "login", "social"],
  }),
  entry({
    name: "TextLink",
    category: "Navigation",
    summary: "An underlined inline link, optionally with a forward or back arrow.",
    exports: ["TextLink"],
    whenToUse: "Use TextLink for navigation inside copy and for back links such as ← Dashboard.",
    useInstead: [{ name: "Button", when: "for an action that does something rather than going somewhere." }],
    keywords: ["link", "anchor", "back"],
  }),
  entry({
    name: "Icon",
    category: "Foundations",
    summary: "A Hugeicons Stroke Rounded icon at 1.5 stroke in currentColor, at 16, 18, 20 or 28px.",
    exports: ["Icon"],
    whenToUse:
      "Use Icon for a glyph beside text, or pass the icon to a component's icon prop (Button iconStart, SidebarItem icon, ActionCard icon). Import the icon from @hugeicons/core-free-icons. Give it a label only when it stands alone and means something.",
    useInstead: [{ name: "Chip", when: "for a state, whose frozen Glyph is not an icon." }],
    keywords: ["icon", "hugeicons", "svg", "pictogram"],
  }),
  entry({
    name: "Theme",
    category: "Foundations",
    summary: "Light / dark / system preference on <html data-theme>, with a pre-paint script.",
    exports: ["ThemeProvider", "useTheme", "themeScript", "themeScriptFor"],
    whenToUse: "Wrap the app once in ThemeProvider and inline themeScript in <head> so the theme is set before first paint. With a defaultPreference other than system, inline themeScriptFor(thatPreference) instead.",
    keywords: ["dark mode", "theme", "appearance"],
  }),
];

export function catalogEntry(name: string) {
  const key = name.toLowerCase();
  return catalog.find((e) => e.name.toLowerCase() === key || e.name.toLowerCase().endsWith(`/${key}`));
}
