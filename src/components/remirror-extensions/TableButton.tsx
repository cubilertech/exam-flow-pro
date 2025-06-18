import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useRemirrorContext } from "@remirror/react";
import { Table2, Plus, Trash2 } from "lucide-react";
import { IconButton } from "@mui/material";

export const TableDropdown = () => {
  const ctx = useRemirrorContext();
  const commands = ctx.commands;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          size="small"
          sx={{
            border: "1px solid #ccc",
            borderRadius: 1,
            padding: "6px 12px",
            margin: "0px !important",
          }}
          title="Table Tools"
        >
          <Table2 size={16} />
        </IconButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48">
        <DropdownMenuItem
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => commands.createTable()}
        >
          <Plus className="mr-2 h-4 w-4 text-green-600" /> Add New Table
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => commands.addTableRowBefore()}>
          <Plus className="mr-2 h-4 w-4 rotate-180" /> Add Row Above
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => commands.addTableRowAfter()}>
          <Plus className="mr-2 h-4 w-4" /> Add Row Below
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => commands.addTableColumnBefore()}>
          <Plus className="mr-2 h-4 w-4" /> Add Column Left
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => commands.addTableColumnAfter()}>
          <Plus className="mr-2 h-4 w-4" /> Add Column Right
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => commands.deleteTableRow()}>
          <Trash2 className="mr-2 h-4 w-4 text-red-600" /> Delete Row
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => commands.deleteTableColumn()}>
          <Trash2 className="mr-2 h-4 w-4 text-red-600" /> Delete Column
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => commands.deleteTable()}>
          <Trash2 className="mr-2 h-4 w-4 text-red-600" /> Delete Table
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
