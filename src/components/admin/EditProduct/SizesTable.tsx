"use client";

import { useCallback } from "react";

export default function SizesTable({
  data,
  columns,
  onUpdate,
  onColumnUpdate,
}: SizesTableType) {
  const handleCellChange = useCallback(
    (rowIndex: number, column: string, value: string) => {
      const updatedData = data.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, [column]: value };
        }
        return row;
      });
      onUpdate(updatedData);
    },
    [data, onUpdate]
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    rowIndex: number,
    column: string
  ) => {
    const { value } = e.target;
    handleCellChange(rowIndex, column, value);
  };

  const handleColumnChange = (index: number, newValue: string) => {
    const updatedColumns = columns.map((col, i) => ({
      label: i === index ? newValue : col,
      order: i + 1,
    }));
    onColumnUpdate(updatedColumns);
  };

  return (
    <div className="w-max max-w-full relative border overflow-y-hidden custom-x-scrollbar rounded-md bg-white">
      <table className="table-fixed w-max text-left">
        <thead className="font-semibold text-sm">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`w-28 max-w-28 h-10 text-sm border-b border-l first:border-l-0 ${
                  index === 0 ? "bg-lightgray" : ""
                }`}
              >
                <input
                  value={column}
                  type="text"
                  className={`focus:border focus:border-black w-full h-full text-center font-semibold ${
                    index === 0 ? "bg-lightgray" : ""
                  }`}
                  onChange={(e) => handleColumnChange(index, e.target.value)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="py-0">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`w-28 max-w-28 h-10 text-sm overflow-hidden border-l first:border-l-0 ${
                    rowIndex === data.length - 1 ? "" : "border-b"
                  } ${colIndex === 0 ? "bg-lightgray" : ""}`}
                >
                  <input
                    value={row[column]}
                    type="text"
                    className={`focus:border focus:border-black w-full h-full text-center ${
                      colIndex === 0 ? "bg-lightgray" : ""
                    }`}
                    onChange={(e) => handleInputChange(e, rowIndex, column)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -- Type Definitions --

type TableRowType = {
  [key: string]: string;
};

type SizesTableType = {
  data: TableRowType[];
  columns: string[];
  onUpdate: (updatedData: TableRowType[]) => void;
  onColumnUpdate: (updatedColumns: { label: string; order: number }[]) => void;
};
