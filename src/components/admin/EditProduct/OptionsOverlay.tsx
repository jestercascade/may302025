"use client";

import { useCallback, useEffect, useState } from "react";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import Overlay from "@/ui/Overlay";
import { useBodyOverflowStore } from "@/zustand/shared/bodyOverflowStore";
import clsx from "clsx";
import { Spinner } from "@/ui/Spinners/Default";
import {
  PlusCircle,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  Pencil,
  X,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  Table,
} from "lucide-react";
import { UpdateProductAction } from "@/actions/products";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

// **Interfaces**
interface Option {
  id: number;
  value: string;
  isActive: boolean;
}

interface OptionGroup {
  id: number;
  name: string;
  options: Option[];
}

interface ChainingConfig {
  enabled: boolean;
  parentGroupId: number | null;
  childGroupId: number | null;
  relationships?: Array<{
    parentGroupId: number;
    childGroupId: number;
    constraints: { [parentOptionId: string]: number[] };
  }>;
}

type AvailabilityMatrix = { [key: number]: number[] };

type SizeChartType = {
  inches: { columns: { label: string; order: number }[]; rows: TableRowType[] };
  centimeters: {
    columns: { label: string; order: number }[];
    rows: TableRowType[];
  };
};

type TableRowType = { [key: string]: string };

// **OptionsButton Component**
export function OptionsButton({ className }: { className: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore((state) => state.pages.editProduct.overlays.options.name);

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray ${className}`}
    >
      <Pencil size={18} strokeWidth={1.75} />
    </button>
  );
}

// **OptionsOverlay Component**
export function OptionsOverlay({
  data,
}: {
  data: {
    id: string;
    options: ProductType["options"];
  };
}) {
  // **State Declarations**
  const [loading, setLoading] = useState<boolean>(false);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore((state) => state.pages.editProduct.overlays.options.name);
  const isOverlayVisible = useOverlayStore((state) => state.pages.editProduct.overlays.options.isVisible);
  const setPreventBodyOverflowChange = useBodyOverflowStore((state) => state.setPreventBodyOverflowChange);

  // **Body Overflow Effect**
  useEffect(() => {
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
      setPreventBodyOverflowChange(false);
    }

    return () => {
      if (!isOverlayVisible) {
        document.body.style.overflow = "visible";
        setPreventBodyOverflowChange(false);
      }
    };
  }, [isOverlayVisible, setPreventBodyOverflowChange]);

  // **Initialize Option Groups**
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>(() => {
    if (!data.options || !data.options.groups) return [];
    return data.options.groups.map((group) => ({
      id: group.id,
      name: group.name,
      options: group.values
        ? group.values.map((opt) => ({
            id: opt.id,
            value: opt.value,
            isActive: opt.isActive,
          }))
        : [],
    }));
  });

  // **Initialize Chaining Configuration**
  const [chainingConfig, setChainingConfig] = useState<ChainingConfig>(() => {
    const config = data.options?.config?.chaining;
    if (!config || !config.enabled || !config.relationships || config.relationships.length === 0) {
      return { enabled: false, parentGroupId: null, childGroupId: null };
    }
    const relationship = config.relationships[0];
    return {
      enabled: config.enabled,
      parentGroupId: relationship.parentGroupId,
      childGroupId: relationship.childGroupId,
    };
  });

  // **Initialize Availability Matrix**
  const [availabilityMatrix, setAvailabilityMatrix] = useState<AvailabilityMatrix>(() => {
    const config = data.options?.config?.chaining;
    if (!config || !config.enabled || !config.relationships || config.relationships.length === 0) return {};
    const constraints = config.relationships[0].constraints;
    const matrix: AvailabilityMatrix = {};
    Object.keys(constraints).forEach((key) => {
      matrix[Number(key)] = constraints[key];
    });
    return matrix;
  });

  // **Initialize Size Chart States**
  const sizeGroup = data.options.groups.find((g) => g.name.toLowerCase() === "size");
  const initialTableData: SizeChartType = {
    inches: sizeGroup?.sizeChart?.inches ?? { columns: [], rows: [] },
    centimeters: sizeGroup?.sizeChart?.centimeters ?? { columns: [], rows: [] },
  };
  const [tableData, setTableData] = useState<SizeChartType>(initialTableData);
  const [sizeChartGroupId, setSizeChartGroupId] = useState<number | null>(sizeGroup ? sizeGroup.id : null);
  const [sizeChartEnabled, setSizeChartEnabled] = useState<boolean>(sizeGroup !== undefined);
  const [showSizeChart, setShowSizeChart] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"inches" | "centimeters">("inches");
  const [rowsCount, setRowsCount] = useState<number>(0);
  const [columnsCount, setColumnsCount] = useState<number>(0);

  // **Initialize Size Chart Counts**
  useEffect(() => {
    setRowsCount(tableData[activeTab].rows.length);
    setColumnsCount(tableData[activeTab].columns.length);
  }, [tableData, activeTab]);

  // **Admin State**
  const [newOptionValues, setNewOptionValues] = useState<{
    [key: number]: string;
  }>({});
  const [editingName, setEditingName] = useState<number | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [collapsedGroups, setCollapsedGroups] = useState<{
    [key: number]: boolean;
  }>({});

  // Wrap findGroup in useCallback to maintain referential equality
  const findGroup = useCallback(
    (groupId: number): OptionGroup | undefined => optionGroups.find((group) => group.id === groupId),
    [optionGroups]
  );

  // Wrap setParentChildRelationship in useCallback to maintain referential equality
  const setParentChildRelationship = useCallback(
    (parentId: number | null, childId: number | null) => {
      if (parentId === null || childId === null || parentId === childId) return;
      if (!findGroup(parentId) || !findGroup(childId)) return;
      const newMatrix: AvailabilityMatrix = {};
      const parentGroup = findGroup(parentId);
      if (parentGroup) parentGroup.options.forEach((option) => (newMatrix[option.id] = []));
      setChainingConfig({
        enabled: true,
        parentGroupId: parentId,
        childGroupId: childId,
      });
      setAvailabilityMatrix(newMatrix);
    },
    [findGroup]
  );

  useEffect(() => {
    if (chainingConfig.enabled && optionGroups.length >= 2) {
      let parentId = chainingConfig.parentGroupId;
      let childId = chainingConfig.childGroupId;
      if (parentId === null || !findGroup(parentId)) parentId = optionGroups[0].id;
      if (childId === null || !findGroup(childId) || childId === parentId) {
        const otherGroup = optionGroups.find((g) => g.id !== parentId);
        childId = otherGroup ? otherGroup.id : optionGroups[1] ? optionGroups[1].id : null;
      }
      if (parentId !== chainingConfig.parentGroupId || childId !== chainingConfig.childGroupId) {
        if (parentId !== null && childId !== null) setParentChildRelationship(parentId, childId);
      }
    }
  }, [
    chainingConfig.enabled,
    chainingConfig.parentGroupId,
    chainingConfig.childGroupId,
    optionGroups,
    findGroup,
    setParentChildRelationship,
  ]);

  // **Ensure Size Chart Group ID Consistency**
  useEffect(() => {
    if (sizeChartEnabled) {
      const sizeGroup = optionGroups.find((group) => group.name.toLowerCase() === "size");
      if (sizeGroup) {
        setSizeChartGroupId(sizeGroup.id);
      } else {
        setSizeChartEnabled(false);
        setSizeChartGroupId(null);
        showAlert({
          message: "No 'Size' group found. Size chart cannot be enabled.",
          type: ShowAlertType.NEUTRAL,
        });
      }
    } else {
      setSizeChartGroupId(null);
    }
  }, [optionGroups, sizeChartEnabled, showAlert]);

  // **Admin Functions**
  const addOptionGroup = () => {
    if (newGroupName.trim() === "") return;
    const newGroup: OptionGroup = {
      id: Date.now(),
      name: newGroupName,
      options: [],
    };
    setOptionGroups([...optionGroups, newGroup]);
    setNewGroupName("");
  };

  const deleteOptionGroup = (groupId: number) => {
    if (chainingConfig.parentGroupId === groupId || chainingConfig.childGroupId === groupId) {
      setChainingConfig({
        enabled: false,
        parentGroupId: null,
        childGroupId: null,
      });
    }
    if (sizeChartGroupId === groupId) {
      setSizeChartGroupId(null);
      setSizeChartEnabled(false);
    }
    setOptionGroups(optionGroups.filter((group) => group.id !== groupId));
    setCollapsedGroups((prev) => {
      const newState = { ...prev };
      delete newState[groupId];
      return newState;
    });
  };

  const addOption = (groupId: number) => {
    if (!newOptionValues[groupId] || newOptionValues[groupId].trim() === "") return;
    setOptionGroups(
      optionGroups.map((group) => {
        if (group.id === groupId) {
          const newOption: Option = {
            id: Date.now(),
            value: newOptionValues[groupId],
            isActive: true,
          };
          if (chainingConfig.enabled && chainingConfig.parentGroupId === groupId) {
            setAvailabilityMatrix({
              ...availabilityMatrix,
              [newOption.id]: [],
            });
          }
          return { ...group, options: [...group.options, newOption] };
        }
        return group;
      })
    );
    setNewOptionValues({ ...newOptionValues, [groupId]: "" });
  };

  const toggleOptionActive = (groupId: number, optionId: number) => {
    setOptionGroups(
      optionGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            options: group.options.map((option) =>
              option.id === optionId ? { ...option, isActive: !option.isActive } : option
            ),
          };
        }
        return group;
      })
    );
  };

  const deleteOption = (groupId: number, optionId: number) => {
    setOptionGroups(
      optionGroups.map((group) => {
        if (group.id === groupId)
          return {
            ...group,
            options: group.options.filter((option) => option.id !== optionId),
          };
        return group;
      })
    );
    if (chainingConfig.enabled && chainingConfig.parentGroupId === groupId) {
      const newMatrix = { ...availabilityMatrix };
      delete newMatrix[optionId];
      setAvailabilityMatrix(newMatrix);
    }
  };

  const saveEditName = (groupId: number) => {
    if (editNameValue.trim() === "") return;
    setOptionGroups(optionGroups.map((group) => (group.id === groupId ? { ...group, name: editNameValue } : group)));
    setEditingName(null);
  };

  const toggleAvailability = (parentOptionId: number, childOptionId: number) => {
    const currentAvailability = availabilityMatrix[parentOptionId] || [];
    if (currentAvailability.includes(childOptionId)) {
      setAvailabilityMatrix({
        ...availabilityMatrix,
        [parentOptionId]: currentAvailability.filter((id) => id !== childOptionId),
      });
    } else {
      setAvailabilityMatrix({
        ...availabilityMatrix,
        [parentOptionId]: [...currentAvailability, childOptionId],
      });
    }
  };

  const toggleChaining = () => {
    setChainingConfig({ ...chainingConfig, enabled: !chainingConfig.enabled });
  };

  const swapParentChild = () => {
    if (!chainingConfig.enabled || chainingConfig.parentGroupId === null || chainingConfig.childGroupId === null)
      return;
    const newMatrix: AvailabilityMatrix = {};
    const newParentGroup = findGroup(chainingConfig.childGroupId);
    if (newParentGroup) newParentGroup.options.forEach((option) => (newMatrix[option.id] = []));
    setChainingConfig({
      enabled: true,
      parentGroupId: chainingConfig.childGroupId,
      childGroupId: chainingConfig.parentGroupId,
    });
    setAvailabilityMatrix(newMatrix);
  };

  const moveGroupUp = (index: number) => {
    if (index <= 0) return;
    const newGroups = [...optionGroups];
    [newGroups[index], newGroups[index - 1]] = [newGroups[index - 1], newGroups[index]];
    setOptionGroups(newGroups);
  };

  const moveGroupDown = (index: number) => {
    if (index >= optionGroups.length - 1) return;
    const newGroups = [...optionGroups];
    [newGroups[index], newGroups[index + 1]] = [newGroups[index + 1], newGroups[index]];
    setOptionGroups(newGroups);
  };

  // **Size Chart Functions**
  const columns = tableData[activeTab].columns.sort((a, b) => a.order - b.order).map((col) => col.label);

  const addRow = () => {
    if (rowsCount === 0 && columnsCount === 0) {
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
  };

  const addColumn = () => {
    if (rowsCount === 0 && columnsCount === 0) {
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
      const newColumnName = `Column${columns.length + 1}`;
      const newColumnOrder = Math.max(...tableData[activeTab].columns.map((col) => col.order), -1) + 1;
      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: {
          columns: [...prevData[activeTab].columns, { label: newColumnName, order: newColumnOrder }],
          rows: prevData[activeTab].rows.map((row) => ({
            ...row,
            [newColumnName]: "",
          })),
        },
      }));
      setColumnsCount((prev) => prev + 1);
    }
  };

  const removeRow = () => {
    if (rowsCount === 1) {
      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: { columns: [], rows: [] },
      }));
      setRowsCount(0);
      setColumnsCount(0);
    } else if (rowsCount > 1) {
      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: {
          ...prevData[activeTab],
          rows: prevData[activeTab].rows.slice(0, -1),
        },
      }));
      setRowsCount((prev) => prev - 1);
    }
  };

  const removeColumn = () => {
    if (columnsCount === 1) {
      setTableData((prevData) => ({
        ...prevData,
        [activeTab]: { columns: [], rows: [] },
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
  };

  const handlePasteData = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split("\n").map((row) => row.split("\t"));
      const headers = rows[0];
      const newRows = rows.slice(1).map((row) => {
        const newRow: { [key: string]: string } = {};
        headers.forEach((header, index) => (newRow[header.trim()] = row[index]?.trim() || ""));
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
      showAlert({
        message: "Failed to paste data. Make sure you have copied a valid table.",
        type: ShowAlertType.NEUTRAL,
      });
      setPreventBodyOverflowChange(true);
    }
  };

  const updateData = (updatedData: Array<{ [key: string]: string }>) => {
    setTableData((prevData) => ({
      ...prevData,
      [activeTab]: { ...prevData[activeTab], rows: updatedData },
    }));
  };

  const updateColumns = (updatedColumns: { label: string; order: number }[]) => {
    setTableData((prevData) => {
      const updateRows = (rows: TableRowType[]) =>
        rows.map((row) => {
          const newRow: TableRowType = {};
          updatedColumns.forEach(({ label }) => (newRow[label] = row[label] || ""));
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

  const handleSave = async () => {
    setLoading(true);

    // Format the options data according to ProductType structure
    const formattedGroups = optionGroups.map((group, index) => {
      const baseGroup = {
        id: group.id,
        name: group.name,
        displayOrder: index,
        values: group.options.map((opt) => ({
          id: opt.id,
          value: opt.value,
          isActive: opt.isActive,
        })),
      };

      // If this is the size group and size chart is enabled, add the size chart data
      if (sizeChartEnabled && sizeChartGroupId === group.id) {
        return {
          ...baseGroup,
          sizeChart: {
            inches: tableData.inches,
            centimeters: tableData.centimeters,
          },
        };
      }

      return baseGroup;
    });

    // Format chaining relationships
    const relationships = [];
    if (chainingConfig.enabled && chainingConfig.parentGroupId !== null && chainingConfig.childGroupId !== null) {
      const constraints: { [key: string]: number[] } = {};
      Object.keys(availabilityMatrix).forEach((parentId) => {
        constraints[parentId] = availabilityMatrix[Number(parentId)] || [];
      });

      relationships.push({
        parentGroupId: chainingConfig.parentGroupId,
        childGroupId: chainingConfig.childGroupId,
        constraints,
      });
    }

    const updatedData = {
      id: data.id,
      options: {
        groups: formattedGroups,
        config: {
          chaining: {
            enabled: chainingConfig.enabled,
            relationships,
          },
        },
      },
    };

    try {
      const result = await UpdateProductAction(updatedData);
      showAlert({ message: result.message, type: result.type });

      // Clear the size chart data on the frontend if size chart is disabled
      if (!sizeChartEnabled) {
        setTableData({
          inches: { columns: [], rows: [] },
          centimeters: { columns: [], rows: [] },
        });
      }
    } catch (error) {
      console.error("Error updating product options:", error);
      showAlert({
        message: "Failed to update product options",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
      hideOverlay({ pageName, overlayName });
    }
  };

  const getParentOptionStatusText = (option: Option): string => (!option.isActive ? "Inactive" : "Active");

  const getParentOptionStatusClass = (option: Option): string =>
    !option.isActive ? "bg-neutral-100" : "bg-green-100 text-green-700";

  const toggleSizeChartEnabled = () => {
    const newEnabled = !sizeChartEnabled;
    if (newEnabled) {
      const sizeGroup = optionGroups.find((group) => group.name.toLowerCase() === "size");
      if (!sizeGroup) {
        showAlert({
          message: "No 'Size' group found. Cannot enable size chart.",
          type: ShowAlertType.NEUTRAL,
        });
        return;
      }
    }
    setSizeChartEnabled(newEnabled);
  };

  const toggleSizeChart = () => setShowSizeChart(!showSizeChart);

  // **Render**
  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[700px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              {/* Mobile Header */}
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Options</h2>
                  <button
                    onClick={() => hideOverlay({ pageName, overlayName })}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <X color="#6c6c6c" size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Desktop Header */}
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={() => hideOverlay({ pageName, overlayName })}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                >
                  <ArrowLeft size={20} strokeWidth={2} className="-ml-1 stroke-blue" />
                  <span className="font-semibold text-sm text-blue">Options</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "hover:bg-neutral-600 active:bg-neutral-800": !loading,
                    }
                  )}
                >
                  {loading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner color="white" />
                      <span className="text-white">Saving</span>
                    </div>
                  ) : (
                    <span className="text-white">Save</span>
                  )}
                </button>
              </div>

              {/* Main Content */}
              <div className="space-y-2 w-full h-full mt-[52px] md:mt-0 p-5 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                {/* Add New Option Group */}
                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-gray-700">Option Group</h2>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name (e.g. Size, Color, Material)"
                      className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors"
                    />
                    <button
                      onClick={addOptionGroup}
                      className="bg-lightgray hover:bg-lightgray-dimmed px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <span className="mr-1">Add</span>
                    </button>
                  </div>
                </div>

                {/* Chain Option Groups */}
                {optionGroups.length >= 2 && (
                  <div className="bg-neutral-50 rounded-xl space-y-4 px-4 py-4 border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-medium text-gray-700">Chain Option Groups</h2>
                      <div className="flex items-center">
                        <span className="mr-3 text-sm text-gray-600">
                          {chainingConfig.enabled ? "Enabled" : "Disabled"}
                        </span>
                        <div
                          onClick={toggleChaining}
                          className={`w-10 h-5 rounded-full relative cursor-pointer ease-in-out duration-200 border ${
                            chainingConfig.enabled ? "bg-blue-100 border-blue-300" : "bg-white border-neutral-300"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full ease-in-out duration-300 absolute top-1/2 transform -translate-y-1/2 ${
                              chainingConfig.enabled ? "left-[22px] bg-blue" : "left-1 bg-black"
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                    {chainingConfig.enabled && (
                      <div className="p-4 border border-neutral-200 rounded-lg bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="mb-2 text-sm font-medium text-gray-700">Parent Group:</div>
                            <select
                              value={chainingConfig.parentGroupId ?? ""}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                let childId = chainingConfig.childGroupId;
                                if (value === childId) {
                                  const otherGroup = optionGroups.find((g) => g.id !== value);
                                  childId = otherGroup ? otherGroup.id : null;
                                }
                                setParentChildRelationship(value, childId);
                              }}
                              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors"
                            >
                              {optionGroups.map((group) => (
                                <option key={group.id} value={group.id}>
                                  {group.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <div className="mb-2 text-sm font-medium text-gray-700">Child Group:</div>
                            <div className="flex items-center">
                              <select
                                value={chainingConfig.childGroupId ?? ""}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  let parentId = chainingConfig.parentGroupId;
                                  if (value === parentId) {
                                    const otherGroup = optionGroups.find((g) => g.id !== value);
                                    parentId = otherGroup ? otherGroup.id : null;
                                  }
                                  setParentChildRelationship(parentId, value);
                                }}
                                className="flex-1 bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors"
                              >
                                {optionGroups.map((group) => (
                                  <option key={group.id} value={group.id}>
                                    {group.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={swapParentChild}
                                className="ml-3 p-2 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                              >
                                <RefreshCw className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-600">
                          Parent options will be disabled if all their linked child options are inactive.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Option Groups Management */}
                {optionGroups.map((group, groupIndex) => {
                  const isCollapsed = collapsedGroups[group.id];
                  const isParent = chainingConfig.enabled && chainingConfig.parentGroupId === group.id;
                  const isChild = chainingConfig.enabled && chainingConfig.childGroupId === group.id;
                  const isFirstGroup = groupIndex === 0;
                  const isLastGroup = groupIndex === optionGroups.length - 1;

                  return (
                    <div key={group.id} className="border border-neutral-200 rounded-xl mb-4">
                      <div
                        className="flex items-center justify-between p-4 pr-4 rounded-t-xl cursor-pointer hover:bg-gray-50/50 transition-colors"
                        onClick={() =>
                          setCollapsedGroups((prev) => ({
                            ...prev,
                            [group.id]: !prev[group.id],
                          }))
                        }
                      >
                        <div className="flex items-center">
                          {isCollapsed ? (
                            <ChevronRight size={18} className="text-gray-500 mr-3" />
                          ) : (
                            <ChevronDown size={18} className="text-gray-500 mr-3" />
                          )}
                          <div className="flex items-center">
                            {editingName === group.id ? (
                              <input
                                type="text"
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                className="px-2 py-1 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                                autoFocus
                                onBlur={() => saveEditName(group.id)}
                              />
                            ) : (
                              <>
                                <span className="font-medium text-gray-800">{group.name}</span>
                                {isParent && (
                                  <span className="ml-3 text-xs px-2 py-1 bg-lightgray text-gray-600 rounded-md">
                                    Parent
                                  </span>
                                )}
                                {isChild && (
                                  <span className="ml-3 text-xs px-2 py-1 bg-lightgray text-gray-600 rounded-md">
                                    Child
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            {!isFirstGroup && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveGroupUp(groupIndex);
                                }}
                                className="p-1.5 text-gray-500 hover:text-blue hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <ChevronUp size={18} />
                              </button>
                            )}
                            {!isLastGroup && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveGroupDown(groupIndex);
                                }}
                                className="p-1.5 text-gray-500 hover:text-blue hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <ChevronDown size={18} />
                              </button>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteOptionGroup(group.id);
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="border-t border-neutral-200 rounded-b-xl overflow-hidden">
                          <div className="overflow-x-auto custom-x-scrollbar">
                            <table className="w-max min-w-full table-fixed">
                              <thead>
                                <tr className="bg-gray-50/90 backdrop-blur-md border-b border-gray-200/80">
                                  <th className="min-w-28 max-w-28 w-28 px-3 py-3 text-left text-xs font-semibold text-gray-600 tracking-wide sticky left-0 bg-gray-50/90 backdrop-blur-md z-10 border-r border-gray-200/50">
                                    Actions
                                  </th>
                                  <th className="min-w-36 w-36 px-3 py-3 text-left text-xs font-semibold text-gray-600 tracking-wide">
                                    Option Value
                                  </th>
                                  <th className="min-w-28 px-3 py-3 text-left text-xs font-semibold text-gray-600 tracking-wide">
                                    Status
                                  </th>
                                  {isParent && chainingConfig.childGroupId !== null && (
                                    <th className="min-w-0 px-3 py-3 text-left text-xs font-semibold text-gray-600 tracking-wide">
                                      Available Options
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100/70 bg-white">
                                {group.options.map((option) => (
                                  <tr key={option.id} className="hover:bg-gray-50/60 transition-colors duration-200">
                                    <td className="min-w-28 max-w-28 w-28 px-3 py-3 sticky left-0 bg-white hover:bg-gray-50/60 transition-colors duration-200 z-10 border-r border-gray-100/80">
                                      <button
                                        onClick={() => deleteOption(group.id, option.id)}
                                        className="inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-red-500 hover:bg-red-50/80 rounded-full transition-all duration-200 hover:scale-105"
                                        aria-label="Delete option"
                                      >
                                        <X size={12} />
                                      </button>
                                    </td>
                                    <td className="min-w-36 w-36 px-3 py-3 text-sm font-medium text-gray-800">
                                      <div className="truncate" title={option.value}>
                                        {option.value}
                                      </div>
                                    </td>
                                    <td className="min-w-28 px-3 py-3">
                                      <button
                                        onClick={() => toggleOptionActive(group.id, option.id)}
                                        className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full transition-all duration-200 border ${
                                          isParent
                                            ? getParentOptionStatusClass(option)
                                            : option.isActive
                                            ? "bg-green-50/90 text-green-700 border-green-200/80 hover:bg-green-100/90 hover:border-green-300/80"
                                            : "bg-gray-50/90 text-gray-600 border-gray-200/80 hover:bg-gray-100/90 hover:border-gray-300/80"
                                        }`}
                                      >
                                        {isParent
                                          ? getParentOptionStatusText(option)
                                          : option.isActive
                                          ? "Active"
                                          : "Inactive"}
                                      </button>
                                    </td>
                                    {isParent && chainingConfig.childGroupId !== null && (
                                      <td className="min-w-0 px-3 py-3">
                                        <div className="flex gap-3 flex-nowrap">
                                          {findGroup(chainingConfig.childGroupId)?.options.map((child) => (
                                            <label
                                              key={child.id}
                                              className={`flex items-center text-xs rounded-lg px-2.5 py-1.5 transition-all duration-200 whitespace-nowrap ${
                                                !child.isActive
                                                  ? "opacity-40 cursor-not-allowed"
                                                  : "cursor-pointer hover:bg-blue-50/80 hover:scale-[1.02]"
                                              }`}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={availabilityMatrix[option.id]?.includes(child.id)}
                                                onChange={() => toggleAvailability(option.id, child.id)}
                                                className="h-3.5 w-3.5 text-blue-600 bg-white border-gray-300/80 rounded focus:ring-blue-500/40 focus:ring-2 mr-2"
                                                disabled={!child.isActive}
                                              />
                                              <span className="text-gray-700 font-medium">{child.value}</span>
                                            </label>
                                          ))}
                                        </div>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="px-4 py-4 bg-white border-t border-neutral-200 flex">
                            <input
                              type="text"
                              value={newOptionValues[group.id] || ""}
                              onChange={(e) =>
                                setNewOptionValues({
                                  ...newOptionValues,
                                  [group.id]: e.target.value,
                                })
                              }
                              placeholder="Add new option value"
                              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors"
                            />
                            <button
                              onClick={() => addOption(group.id)}
                              className="ml-3 text-gray-500 hover:text-blue hover:bg-blue-50 rounded-lg p-1.5 transition-colors"
                              aria-label="Add option"
                            >
                              <PlusCircle size={20} />
                            </button>
                          </div>

                          {/* Size Chart Section for "Size" Group */}
                          {group.name.toLowerCase() === "size" && (
                            <div className="mb-4 pt-4 border-t border-neutral-200">
                              <div className="w-[calc(100%-32px)] mx-auto flex items-center justify-between bg-neutral-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                  <Table size={20} className="text-gray-600 mr-3" />
                                  <span className="font-medium text-gray-700">Size Chart</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="mr-3 text-sm text-gray-600">
                                    {sizeChartEnabled ? "Enabled" : "Disabled"}
                                  </span>
                                  <div
                                    onClick={toggleSizeChartEnabled}
                                    className={`w-10 h-5 rounded-full relative cursor-pointer ease-in-out duration-200 border ${
                                      sizeChartEnabled ? "bg-blue-100 border-blue-300" : "bg-white border-neutral-300"
                                    }`}
                                  >
                                    <div
                                      className={`w-3 h-3 rounded-full ease-in-out duration-300 absolute top-1/2 transform -translate-y-1/2 ${
                                        sizeChartEnabled ? "left-[22px] bg-blue" : "left-1 bg-black"
                                      }`}
                                    ></div>
                                  </div>
                                </div>
                              </div>

                              {sizeChartEnabled && (
                                <div className="mt-4">
                                  <div className="w-[calc(100%-32px)] mx-auto mb-3">
                                    <button
                                      onClick={toggleSizeChart}
                                      className="flex items-center text-blue hover:text-blue-700 transition-colors text-xs font-medium"
                                    >
                                      {showSizeChart ? (
                                        <>
                                          <ChevronUp size={16} className="mr-1" />
                                          Hide size chart
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown size={16} className="mr-1" />
                                          Show size chart
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  {showSizeChart && sizeChartGroupId === group.id && (
                                    <div className="p-4 border-t border-neutral-200">
                                      <div className="space-y-2 mb-6">
                                        <p className="text-xs text-gray-600">Unit</p>
                                        <div className="inline-flex p-1 bg-lightgray rounded-lg">
                                          <button
                                            onClick={() => setActiveTab("inches")}
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                              activeTab === "inches"
                                                ? "bg-white shadow-sm"
                                                : "text-gray-600 hover:text-black"
                                            }`}
                                          >
                                            Inches
                                          </button>
                                          <button
                                            onClick={() => setActiveTab("centimeters")}
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                              activeTab === "centimeters"
                                                ? "bg-white shadow-sm"
                                                : "text-gray-600 hover:text-black"
                                            }`}
                                          >
                                            Centimeters
                                          </button>
                                        </div>
                                      </div>
                                      <div className="space-y-2 mb-5">
                                        <p className="text-xs text-gray-600">Grid Size</p>
                                        <div className="inline-flex items-center bg-lightgray p-1 rounded-lg">
                                          <button
                                            onClick={removeRow}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-colors"
                                          >
                                            <ArrowUp size={14} />
                                          </button>
                                          <button
                                            onClick={addRow}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-colors"
                                          >
                                            <ArrowDown size={14} />
                                          </button>
                                          <div className="w-px h-5 bg-neutral-300 mx-2"></div>
                                          <span className="text-sm font-medium px-2 text-gray-700">
                                            {rowsCount}×{columnsCount}
                                          </span>
                                          <div className="w-px h-5 bg-neutral-300 mx-2"></div>
                                          <button
                                            onClick={removeColumn}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-colors"
                                          >
                                            <ArrowLeftIcon size={14} />
                                          </button>
                                          <button
                                            onClick={addColumn}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-colors"
                                          >
                                            <ArrowRight size={14} />
                                          </button>
                                        </div>
                                      </div>
                                      <div className="flex justify-end mb-4">
                                        <button
                                          onClick={handlePasteData}
                                          className="relative h-9 w-max px-4 rounded-full overflow-hidden transition-colors bg-lightgray hover:bg-lightgray-dimmed"
                                        >
                                          Paste from Clipboard
                                        </button>
                                      </div>
                                      {tableData[activeTab].rows.length > 0 ? (
                                        <SizesTable
                                          data={tableData[activeTab].rows}
                                          columns={columns}
                                          onUpdate={updateData}
                                          onColumnUpdate={updateColumns}
                                        />
                                      ) : (
                                        <div className="flex flex-col items-center justify-center p-6 bg-neutral-50 rounded-lg">
                                          <p className="text-gray-500 mb-4">No data available. Add a row to start.</p>
                                          <button
                                            onClick={addRow}
                                            className="px-4 py-2 text-sm font-medium text-white bg-neutral-700 rounded-full hover:bg-neutral-600 active:bg-neutral-800"
                                          >
                                            Add Row
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Save Button */}
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 z-20 bg-white">
              <button
                onClick={handleSave}
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loading,
                    "hover:bg-neutral-600 active:bg-neutral-800": !loading,
                  }
                )}
              >
                {loading ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner color="white" />
                    <span className="text-white">Saving</span>
                  </div>
                ) : (
                  <span className="text-white">Save</span>
                )}
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}

function SizesTable({
  data,
  columns,
  onUpdate,
  onColumnUpdate,
}: {
  data: TableRowType[];
  columns: string[];
  onUpdate: (updatedData: TableRowType[]) => void;
  onColumnUpdate: (updatedColumns: { label: string; order: number }[]) => void;
}) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number, column: string) => {
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
