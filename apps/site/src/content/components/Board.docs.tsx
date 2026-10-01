import { Board, BoardCard, BoardColumn, PriorityMark, type GlyphShape, type PriorityLevel } from "@puckoops/camelot";
import { useState, type DragEvent } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

interface Work {
  id: string;
  name: string;
  client: string;
  due: string;
  priority: PriorityLevel;
  column: string;
}

const columns: { key: string; name: string; glyph: GlyphShape }[] = [
  { key: "backlog", name: "Backlog", glyph: "square" },
  { key: "progress", name: "In Progress", glyph: "circle-half" },
  { key: "review", name: "In Review", glyph: "diamond" },
  { key: "redo", name: "Re-do", glyph: "redo" },
  { key: "done", name: "Done", glyph: "check" },
];

const initial: Work[] = [
  { id: "t1", name: "Rebrand discovery notes", client: "Purslane Studio", due: "12 Oct", priority: 3, column: "backlog" },
  { id: "t2", name: "Packaging die-line audit", client: "Brightwater Foods", due: "15 Oct", priority: 2, column: "backlog" },
  { id: "t3", name: "Brand system rollout", client: "Nordvik Atelier", due: "02 Oct", priority: 1, column: "progress" },
  { id: "t4", name: "Signage proofs", client: "Nordvik Atelier", due: "03 Oct", priority: 2, column: "review" },
  { id: "t5", name: "Annual report cover", client: "Halden & Moss", due: "28 Sep", priority: 2, column: "done" },
];

const meta = {
  title: "ui/Board",
  component: Board,
  subcomponents: { BoardColumn, BoardCard },
  description:
    "Status **columns** of **cards** for work that moves between states. Each column shows its glyph, name and count, and keeps its place when empty — an empty Re-do column is information. A card is a button when it opens something, so it works from the keyboard.",
  parameters: { layout: "padded" },
  render: () => (
    <Board>
      {columns.map((c) => {
        const cards = initial.filter((w) => w.column === c.key);
        return (
          <BoardColumn key={c.key} title={c.name} glyph={c.glyph} count={cards.length}>
            {cards.map((w) => (
              <BoardCard key={w.id} title={w.name} meta={w.client} start={w.due} end={<PriorityMark level={w.priority} format="code" />} onOpen={() => {}} />
            ))}
          </BoardColumn>
        );
      })}
    </Board>
  ),
} satisfies Meta<typeof Board>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "The tracker's board; Re-do is empty and stays in place.",
};

export const DragAndDrop: Example = {
  render: function Render() {
    const [work, setWork] = useState(initial);
    const [dragging, setDragging] = useState<string | null>(null);
    const [over, setOver] = useState<string | null>(null);
    const drop = (column: string) => (e: DragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain") || dragging;
      setWork((list) => list.map((w) => (w.id === id ? { ...w, column } : w)));
      setDragging(null);
      setOver(null);
    };
    return (
      <Board>
        {columns.map((c) => {
          const cards = work.filter((w) => w.column === c.key);
          return (
            <BoardColumn
              key={c.key}
              title={c.name}
              glyph={c.glyph}
              count={cards.length}
              over={over === c.key}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(c.key);
              }}
              onDragLeave={() => setOver((o) => (o === c.key ? null : o))}
              onDrop={drop(c.key)}
            >
              {cards.map((w) => (
                <BoardCard
                  key={w.id}
                  title={w.name}
                  meta={w.client}
                  start={w.due}
                  end={<PriorityMark level={w.priority} format="code" />}
                  draggable
                  dragging={dragging === w.id}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", w.id);
                    setDragging(w.id);
                  }}
                  onDragEnd={() => {
                    setDragging(null);
                    setOver(null);
                  }}
                />
              ))}
            </BoardColumn>
          );
        })}
      </Board>
    );
  },
  description: "Drag a card: the column under it goes dashed, the card fades while it moves, and the counts update.",
};

export const DropTarget: Example = {
  render: () => (
    <Board>
      <BoardColumn title="In Progress" glyph="circle-half" count={1}>
        <BoardCard title="Brand system rollout" meta="Nordvik Atelier" start="02 Oct" end={<PriorityMark level={1} format="code" />} dragging />
      </BoardColumn>
      <BoardColumn title="In Review" glyph="diamond" count={0} over />
      <BoardColumn title="Done" glyph="check" count={0} />
    </Board>
  ),
  description: "Mid-drag: the card at half opacity, the target column dashed.",
};

export const Cards: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 260 }}>
      <BoardCard title="Brand system rollout" onOpen={action()} />
      <BoardCard title="Packaging die-line audit" meta="Brightwater Foods" onOpen={action()} />
      <BoardCard title="Signage proofs" meta="Nordvik Atelier" start="03 Oct" end={<PriorityMark level={2} format="code" />} onOpen={action()} />
    </div>
  ),
  description: "A card with a title only, with its client, and with a due date and priority.",
};

export const AllVariants: Example = {
  render: () => (
    <Board>
      <BoardColumn title="Backlog" glyph="square" count={2}>
        <BoardCard title="Rebrand discovery notes" meta="Purslane Studio" start="12 Oct" end={<PriorityMark level={3} format="code" />} onOpen={() => {}} />
        <BoardCard title="Packaging die-line audit" meta="Brightwater Foods" onOpen={() => {}} />
      </BoardColumn>
      <BoardColumn title="In Progress" glyph="circle-half" count={1}>
        <BoardCard title="Brand system rollout" meta="Nordvik Atelier" start="02 Oct" end={<PriorityMark level={1} format="code" />} dragging />
      </BoardColumn>
      <BoardColumn title="Re-do" glyph="redo" count={0} over />
      <BoardColumn title="Done" glyph="check" count={0} />
    </Board>
  ),
  description: "Full and empty columns, a card mid-drag and a drop target.",
};
