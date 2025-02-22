"use client";

import { useOverlayStore } from "@/zustand/admin/overlayStore";
import {
  Pencil,
  ArrowLeft,
  X,
  ArrowUp,
  ArrowDown,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import AlertMessage from "@/components/shared/AlertMessage";
import { Spinner } from "@/ui/Spinners/Default";
import { AlertMessageType } from "@/lib/sharedTypes";
import { UpdateProductAction } from "@/actions/products";
import SizesTable from "./SizesTable";
import Overlay from "@/ui/Overlay";
import { clsx } from "clsx";

export function SizeChartButton() {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.sizes.name
  );

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className="w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
    >
      <Pencil size={18} strokeWidth={1.75} />
    </button>
  );
}

export function SizeChartOverlay({ data }: { data: DataType }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );
  const [activeTab, setActiveTab] = useState<"inches" | "centimeters">(
    "inches"
  );
  const [rowsCount, setRowsCount] = useState<number>(0);
  const [columnsCount, setColumnsCount] = useState<number>(0);

  const [tableData, setTableData] = useState<SizeChartType>({
    inches: { columns: [], rows: [] },
    centimeters: { columns: [], rows: [] },
  });

  useEffect(() => {
    if (Object.keys(data.sizes || {}).length === 0) {
      setTableData({
        inches: { columns: [], rows: [] },
        centimeters: { columns: [], rows: [] },
      });
      setRowsCount(0);
      setColumnsCount(0);
    } else {
      setTableData(data.sizes);
    }
  }, [data]);

  useEffect(() => {
    setRowsCount(tableData[activeTab].rows.length);
    setColumnsCount(tableData[activeTab].columns.length);
  }, [tableData, activeTab]);

  const columns = tableData[activeTab].columns
    .sort((a, b) => a.order - b.order)
    .map((col) => col.label);

  const addRow = useCallback(() => {
    if (rowsCount === 0 && columnsCount === 0) {
      // If we're at 0x0, create a 1x1 grid
      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: {
          columns: [{ label: "Column1", order: 0 }],
          rows: [{ Column1: "" }],
        },
      }));
      setRowsCount(1);
      setColumnsCount(1);
    } else {
      // Normal row addition
      const newRow = columns.reduce((acc, col) => ({ ...acc, [col]: "" }), {});
      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: {
          ...prevData[activeTab],
          rows: [...prevData[activeTab].rows, newRow],
        },
      }));
      setRowsCount((prev) => prev + 1);
    }
  }, [columns, activeTab, rowsCount, columnsCount]);

  const addColumn = useCallback(() => {
    if (rowsCount === 0 && columnsCount === 0) {
      // If we're at 0x0, create a 1x1 grid
      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: {
          columns: [{ label: "Column1", order: 0 }],
          rows: [{ Column1: "" }],
        },
      }));
      setRowsCount(1);
      setColumnsCount(1);
    } else {
      // Normal column addition
      const newColumnName = `Column${columns.length + 1}`;
      const newColumnOrder =
        Math.max(...tableData[activeTab].columns.map((col) => col.order), 0) +
        1;
      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: {
          columns: [
            ...prevData[activeTab].columns,
            { label: newColumnName, order: newColumnOrder },
          ],
          rows: prevData[activeTab].rows.map((row) => ({
            ...row,
            [newColumnName]: "",
          })),
        },
      }));
      setColumnsCount((prev) => prev + 1);
    }
  }, [columns, tableData, activeTab, rowsCount, columnsCount]);

  const removeRow = useCallback(() => {
    if (rowsCount === 1) {
      // If removing last row, reset to empty state
      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: {
          columns: [],
          rows: [],
        },
      }));
      setRowsCount(0);
      setColumnsCount(0);
    } else if (rowsCount > 1) {
      // Normal row removal
      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: {
          ...prevData[activeTab],
          rows: prevData[activeTab].rows.slice(0, -1),
        },
      }));
      setRowsCount((prev) => prev - 1);
    }
  }, [activeTab, rowsCount]);

  const removeColumn = useCallback(() => {
    if (columnsCount === 1) {
      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: {
          columns: [],
          rows: [],
        },
      }));
      setRowsCount(0);
      setColumnsCount(0);
    } else if (columnsCount > 1) {
      const lastColumn = columns[columns.length - 1];
      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: {
          columns: prevData[activeTab].columns.slice(0, -1),
          rows: prevData[activeTab].rows.map((row) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [lastColumn]: _omitted, ...rest } = row;

            return rest;
          }),
        },
      }));
      setColumnsCount((prev) => prev - 1);
    }
  }, [columns, activeTab, columnsCount]);

  const handlePasteData = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split("\n").map((row) => row.split("\t"));
      const headers = rows[0];

      const newRows = rows.slice(1).map((row) => {
        const newRow: { [key: string]: string } = {};
        headers.forEach((header, index) => {
          newRow[header.trim()] = row[index]?.trim() || "";
        });
        return newRow;
      });

      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: {
          columns: headers.map((label, order) => ({
            label: label.trim(),
            order,
          })),
          rows: newRows,
        },
      }));
    } catch (error) {
      console.error("Failed to paste data:", error);
      setAlertMessage(
        "Failed to paste data. Make sure you have copied a valid table."
      );
      setAlertMessageType(AlertMessageType.ERROR);
      setShowAlert(true);
    }
  };

  const updateData = (
    updatedData: Array<{
      [key: string]: string;
    }>
  ) => {
    setTableData((prevData) => ({
      ...prevData,
      [activeTab]: {
        ...prevData[activeTab],
        rows: updatedData,
      },
    }));
  };

  const updateColumns = (
    updatedColumns: { label: string; order: number }[]
  ) => {
    setTableData((prevData) => {
      const updateRows = (rows: TableRowType[]) =>
        rows.map((row) => {
          const newRow: TableRowType = {};
          updatedColumns.forEach(({ label }) => {
            newRow[label] = row[label] || "";
          });
          return newRow;
        });

      return {
        ...prevData,
        [activeTab]: {
          columns: updatedColumns,
          rows: updateRows(prevData[activeTab].rows),
        },
      };
    });
  };

  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.sizes.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editProduct.overlays.sizes.isVisible
  );

  useEffect(() => {
    if (isOverlayVisible || showAlert) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      if (!isOverlayVisible && !showAlert) {
        document.body.style.overflow = "visible";
      }
    };
  }, [isOverlayVisible, showAlert]);

  const hideAlertMessage = () => {
    setShowAlert(false);
    setAlertMessage("");
    setAlertMessageType(AlertMessageType.NEUTRAL);
  };

  const handleSave = async () => {
    if (rowsCount < 1 || columnsCount < 2) {
      setAlertMessage("Table must have at least 1 row and 2 columns.");
      setAlertMessageType(AlertMessageType.ERROR);
      setShowAlert(true);
      return;
    }

    setLoading(true);

    try {
      const updatedSizes = {
        id: data.id,
        options: { sizes: tableData },
      };

      const result = await UpdateProductAction(updatedSizes);
      setAlertMessageType(result.type);
      setAlertMessage(result.message);
      setShowAlert(true);
    } catch (error) {
      console.error("Error updating product:", error);
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Failed to update product");
      setShowAlert(true);
    } finally {
      setLoading(false);
      hideOverlay({ pageName, overlayName });
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-max md:min-w-[516px] md:max-w-[740px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Sizes</h2>
                  <button
                    onClick={() => {
                      hideOverlay({ pageName, overlayName });
                    }}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <X color="#6c6c6c" size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={() => {
                    hideOverlay({ pageName, overlayName });
                  }}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                >
                  <ArrowLeft
                    size={20}
                    strokeWidth={2}
                    className="-ml-1 stroke-blue"
                  />
                  <span className="font-semibold text-sm text-blue">Sizes</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handlePasteData}
                    className="px-4 py-2 font-semibold text-sm bg-lightgray rounded-full hover:bg-lightgray-dimmed"
                  >
                    Paste from Clipboard
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={clsx(
                      "px-6 py-2 font-semibold text-sm text-white bg-neutral-700 rounded-full",
                      {
                        "opacity-50": loading,
                        "hover:bg-neutral-800": !loading,
                      }
                    )}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Spinner color="white" />
                        <span>Saving</span>
                      </div>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-2 mb-6">
                <p className="text-xs text-gray">Unit</p>
                <div className="inline-flex p-1 bg-lightgray rounded-lg">
                  <button
                    onClick={() => setActiveTab("inches")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                      activeTab === "inches"
                        ? "bg-white shadow-sm"
                        : "text-gray hover:text-black"
                    }`}
                  >
                    Inches
                  </button>
                  <button
                    onClick={() => setActiveTab("centimeters")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                      activeTab === "centimeters"
                        ? "bg-white shadow-sm"
                        : "text-gray hover:text-black"
                    }`}
                  >
                    Centimeters
                  </button>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                <p className="text-xs text-gray">Grid Size</p>
                <div className="inline-flex items-center bg-gray-100 p-1 rounded-md">
                  <button
                    onClick={removeRow}
                    className="w-7 h-7 flex items-center justify-center text-gray hover:bg-white hover:shadow-sm rounded"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={addRow}
                    className="w-7 h-7 flex items-center justify-center text-gray hover:bg-white hover:shadow-sm rounded"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                  <span className="text-sm font-medium px-2">
                    {rowsCount}×{columnsCount}
                  </span>
                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                  <button
                    onClick={removeColumn}
                    className="w-7 h-7 flex items-center justify-center text-gray hover:bg-white hover:shadow-sm rounded"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    onClick={addColumn}
                    className="w-7 h-7 flex items-center justify-center text-gray hover:bg-white hover:shadow-sm rounded"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
              {tableData[activeTab].rows.length > 0 ? (
                <SizesTable
                  data={tableData[activeTab].rows}
                  columns={columns}
                  onUpdate={updateData}
                  onColumnUpdate={updateColumns}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-4">
                    No data available. Add a row to start.
                  </p>
                  <button
                    onClick={addRow}
                    className="px-4 py-2 text-sm font-medium text-white bg-neutral-700 rounded-full hover:bg-neutral-800"
                  >
                    Add Row
                  </button>
                </div>
              )}
            </div>
          </div>
        </Overlay>
      )}
      {showAlert && (
        <AlertMessage
          message={alertMessage}
          hideAlertMessage={hideAlertMessage}
          type={alertMessageType}
        />
      )}
    </>
  );
}

type TableRowType = {
  [key: string]: string;
};

type DataType = {
  id: string;
  sizes: SizeChartType;
};

type SizeChartType = {
  inches: {
    columns: { label: string; order: number }[];
    rows: TableRowType[];
  };
  centimeters: {
    columns: { label: string; order: number }[];
    rows: TableRowType[];
  };
};
