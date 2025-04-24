"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { UpdateProductAction } from "@/actions/products";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

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
}

type AvailabilityMatrix = {
  [key: number]: number[];
};

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

export function OptionsOverlay({ data }: { data: { id: string; options: ProductType["options"] } }) {
  const [loading, setLoading] = useState<boolean>(false);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore((state) => state.pages.editProduct.overlays.options.name);
  const isOverlayVisible = useOverlayStore((state) => state.pages.editProduct.overlays.options.isVisible);
  const setPreventBodyOverflowChange = useBodyOverflowStore((state) => state.setPreventBodyOverflowChange);

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

  // Initialize option groups from props
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>(() => {
    if (!data.options || !data.options.groups) return [];

    return data.options.groups.map((group) => ({
      id: group.id,
      name: group.name,
      options: group.values.map((opt) => ({
        id: opt.id,
        value: opt.value,
        isActive: opt.isActive,
      })),
    }));
  });

  // Initialize chaining configuration from props
  const [chainingConfig, setChainingConfig] = useState<ChainingConfig>(() => {
    const config = data.options?.config?.chaining;
    if (!config || !config.enabled || !config.relationships || config.relationships.length === 0) {
      return {
        enabled: false,
        parentGroupId: null,
        childGroupId: null,
      };
    }

    const relationship = config.relationships[0];
    return {
      enabled: config.enabled,
      parentGroupId: relationship.parentGroupId,
      childGroupId: relationship.childGroupId,
    };
  });

  // Initialize availability matrix from props
  const [availabilityMatrix, setAvailabilityMatrix] = useState<AvailabilityMatrix>(() => {
    const config = data.options?.config?.chaining;
    if (!config || !config.enabled || !config.relationships || config.relationships.length === 0) {
      return {};
    }

    const constraints = config.relationships[0].constraints;
    const matrix: AvailabilityMatrix = {};

    Object.keys(constraints).forEach((key) => {
      matrix[Number(key)] = constraints[key];
    });

    return matrix;
  });

  // Admin state
  const [newOptionValues, setNewOptionValues] = useState<{ [key: number]: string }>({});
  const [editingName, setEditingName] = useState<number | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: number]: boolean }>({});

  // Public-facing state
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: number }>({});

  // Track which parent options should be disabled based on child availability
  const [disabledParentOptions, setDisabledParentOptions] = useState<number[]>([]);

  // Find a group by ID
  const findGroup = (groupId: number): OptionGroup | undefined => {
    return optionGroups.find((group) => group.id === groupId);
  };

  // Effect to update disabled parent options
  useEffect(() => {
    if (!chainingConfig.enabled || chainingConfig.parentGroupId === null || chainingConfig.childGroupId === null) {
      setDisabledParentOptions([]);
      return;
    }

    const childGroup = findGroup(chainingConfig.childGroupId);
    const parentGroup = findGroup(chainingConfig.parentGroupId);

    if (!childGroup || !parentGroup) return;

    const activeChildOptionIds = childGroup.options.filter((option) => option.isActive).map((option) => option.id);

    const newDisabledParentOptions = parentGroup.options
      .filter((parentOption) => {
        const availableChildOptions = availabilityMatrix[parentOption.id] || [];
        const hasActiveChildOption = availableChildOptions.some((childOptionId) =>
          activeChildOptionIds.includes(childOptionId)
        );
        return parentOption.isActive && !hasActiveChildOption;
      })
      .map((option) => option.id);

    setDisabledParentOptions(newDisabledParentOptions);
  }, [optionGroups, availabilityMatrix, chainingConfig]);

  // Effect to set default parent and child groups when chaining is enabled
  useEffect(() => {
    if (chainingConfig.enabled && optionGroups.length >= 2) {
      let parentId = chainingConfig.parentGroupId;
      let childId = chainingConfig.childGroupId;

      if (parentId === null || !findGroup(parentId)) {
        parentId = optionGroups[0].id;
      }

      if (childId === null || !findGroup(childId) || childId === parentId) {
        const otherGroup = optionGroups.find((g) => g.id !== parentId);
        childId = otherGroup ? otherGroup.id : optionGroups[1] ? optionGroups[1].id : null;
      }

      if (parentId !== chainingConfig.parentGroupId || childId !== chainingConfig.childGroupId) {
        if (parentId !== null && childId !== null) {
          setParentChildRelationship(parentId, childId);
        }
      }
    }
  }, [chainingConfig.enabled, optionGroups]);

  // Admin functions
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

    setOptionGroups(optionGroups.filter((group) => group.id !== groupId));
    setCollapsedGroups((prev) => {
      const newState = { ...prev };
      delete newState[groupId];
      return newState;
    });

    const newSelections = { ...selectedOptions };
    delete newSelections[groupId];
    setSelectedOptions(newSelections);
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

          return {
            ...group,
            options: [...group.options, newOption],
          };
        }
        return group;
      })
    );

    setNewOptionValues({
      ...newOptionValues,
      [groupId]: "",
    });
  };

  const toggleOptionActive = (groupId: number, optionId: number) => {
    setOptionGroups(
      optionGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            options: group.options.map((option) => {
              if (option.id === optionId) {
                return { ...option, isActive: !option.isActive };
              }
              return option;
            }),
          };
        }
        return group;
      })
    );

    if (selectedOptions[groupId] === optionId) {
      const newSelections = { ...selectedOptions };
      delete newSelections[groupId];

      if (chainingConfig.enabled && chainingConfig.childGroupId !== null && chainingConfig.parentGroupId === groupId) {
        delete newSelections[chainingConfig.childGroupId];
      }

      setSelectedOptions(newSelections);
    }
  };

  const deleteOption = (groupId: number, optionId: number) => {
    setOptionGroups(
      optionGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            options: group.options.filter((option) => option.id !== optionId),
          };
        }
        return group;
      })
    );

    if (chainingConfig.enabled && chainingConfig.parentGroupId === groupId) {
      const newMatrix = { ...availabilityMatrix };
      delete newMatrix[optionId];
      setAvailabilityMatrix(newMatrix);
    }

    if (selectedOptions[groupId] === optionId) {
      const newSelections = { ...selectedOptions };
      delete newSelections[groupId];

      if (chainingConfig.enabled && chainingConfig.childGroupId !== null && chainingConfig.parentGroupId === groupId) {
        delete newSelections[chainingConfig.childGroupId];
      }

      setSelectedOptions(newSelections);
    }
  };

  const saveEditName = (groupId: number) => {
    if (editNameValue.trim() === "") return;

    setOptionGroups(
      optionGroups.map((group) => {
        if (group.id === groupId) {
          return { ...group, name: editNameValue };
        }
        return group;
      })
    );

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
    setChainingConfig({
      ...chainingConfig,
      enabled: !chainingConfig.enabled,
    });
    if (!chainingConfig.enabled) {
      setSelectedOptions({});
    }
  };

  const setParentChildRelationship = (parentId: number | null, childId: number | null) => {
    if (parentId === null || childId === null || parentId === childId) {
      return;
    }

    if (!findGroup(parentId) || !findGroup(childId)) return;

    const newMatrix: AvailabilityMatrix = {};
    const parentGroup = findGroup(parentId);
    if (parentGroup) {
      parentGroup.options.forEach((option) => {
        newMatrix[option.id] = [];
      });
    }

    setChainingConfig({
      enabled: true,
      parentGroupId: parentId,
      childGroupId: childId,
    });

    setAvailabilityMatrix(newMatrix);
    setSelectedOptions({});
  };

  const swapParentChild = () => {
    if (!chainingConfig.enabled || chainingConfig.parentGroupId === null || chainingConfig.childGroupId === null)
      return;

    const newMatrix: AvailabilityMatrix = {};
    const newParentGroup = findGroup(chainingConfig.childGroupId);
    if (newParentGroup) {
      newParentGroup.options.forEach((option) => {
        newMatrix[option.id] = [];
      });
    }

    setChainingConfig({
      enabled: true,
      parentGroupId: chainingConfig.childGroupId,
      childGroupId: chainingConfig.parentGroupId,
    });

    setAvailabilityMatrix(newMatrix);
    setSelectedOptions({});
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

  const handleSave = async () => {
    setLoading(true);

    const updatedData = {
      id: data.id,
      options: {
        groups: optionGroups.map((group, index) => ({
          id: group.id,
          name: group.name,
          displayOrder: index + 1,
          values: group.options.map((option) => ({
            id: option.id,
            value: option.value,
            isActive: option.isActive,
          })),
        })),
        config: {
          chaining: {
            enabled: chainingConfig.enabled,
            relationships:
              chainingConfig.enabled && chainingConfig.parentGroupId !== null && chainingConfig.childGroupId !== null
                ? [
                    {
                      parentGroupId: chainingConfig.parentGroupId,
                      childGroupId: chainingConfig.childGroupId,
                      constraints: Object.keys(availabilityMatrix).reduce((acc, key) => {
                        const numKey = Number(key);
                        acc[key] = availabilityMatrix[numKey];
                        return acc;
                      }, {} as { [key: string]: number[] }),
                    },
                  ]
                : [],
          },
        },
      },
    };

    try {
      const result = await UpdateProductAction(updatedData);
      showAlert({
        message: result.message,
        type: result.type,
      });
    } catch (error) {
      console.error("Error updating product options:", error);
      showAlert({
        message: "Failed to update product options",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
    }
  };

  const getParentOptionStatusText = (option: Option): string => {
    if (!option.isActive) return "Inactive";
    return "Active";
  };

  const getParentOptionStatusClass = (option: Option): string => {
    if (!option.isActive) return "bg-gray-100";
    return "bg-green-100 text-green-700";
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[700px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
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
              <div className="space-y-2 w-full h-full mt-[52px] md:mt-0 p-5 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                {/* Add New Option Group Section */}
                <div className="space-y-2">
                  <h2 className="text-sm font-medium">Option Group</h2>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name (e.g. Size, Color, Material)"
                      className="flex-1 border rounded-md px-4 py-2 text-sm outline-none"
                    />
                    <button
                      onClick={addOptionGroup}
                      className="bg-lightgray hover:bg-lightgray-dimmed px-4 py-2 rounded-md text-sm font-medium"
                    >
                      <span className="mr-1">Add</span>
                    </button>
                  </div>
                </div>

                {/* Chain Option Groups Section */}
                {optionGroups.length >= 2 && (
                  <div className="bg-neutral-50 rounded-lg space-y-4 px-4 py-[14px] border">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-medium">Chain Option Groups</h2>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray">
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
                      <div className="p-4 border rounded-md bg-white">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="mb-2 text-sm font-medium">Parent Group:</div>
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
                              className="w-full bg-white border rounded px-3 py-2 text-sm focus:outline-none"
                            >
                              {optionGroups.map((group) => (
                                <option key={group.id} value={group.id}>
                                  {group.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <div className="mb-2 text-sm font-medium">Child Group:</div>
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
                                className="flex-1 bg-white border rounded px-3 py-2 text-sm focus:outline-none"
                              >
                                {optionGroups.map((group) => (
                                  <option key={group.id} value={group.id}>
                                    {group.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={swapParentChild}
                                className="ml-2 p-2 bg-gray-100 rounded hover:bg-gray-200"
                              >
                                <RefreshCw className="w-4 h-4 text-gray" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-gray">
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
                    <div key={group.id} className="border rounded-lg overflow-hidden mb-4">
                      <div
                        className="flex items-center justify-between p-3 pr-4 bg-white cursor-pointer"
                        onClick={() =>
                          setCollapsedGroups((prev) => ({
                            ...prev,
                            [group.id]: !prev[group.id],
                          }))
                        }
                      >
                        <div className="flex items-center">
                          {isCollapsed ? (
                            <ChevronRight size={18} className="text-gray mr-2" />
                          ) : (
                            <ChevronDown size={18} className="text-gray mr-2" />
                          )}
                          <div className="flex items-center">
                            {editingName === group.id ? (
                              <input
                                type="text"
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                className="px-2 py-1 border rounded text-sm"
                                autoFocus
                                onBlur={() => saveEditName(group.id)}
                              />
                            ) : (
                              <>
                                <span className="font-medium">{group.name}</span>
                                {isParent && (
                                  <span className="ml-2 text-xs px-2 py-0.5 bg-lightgray text-gray rounded">
                                    Parent
                                  </span>
                                )}
                                {isChild && (
                                  <span className="ml-2 text-xs px-2 py-0.5 bg-lightgray text-gray rounded">Child</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-2">
                            {!isFirstGroup && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveGroupUp(groupIndex);
                                }}
                                className="p-1 text-gray hover:text-blue transition-colors"
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
                                className="p-1 text-gray hover:text-blue transition-colors"
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
                            className="text-gray hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="border-t">
                          <div className="overflow-x-auto custom-x-scrollbar">
                            <table className="w-full table-fixed divide-y divide-neutral-200">
                              <thead className="bg-neutral-50">
                                <tr>
                                  <th
                                    className="px-4 py-2 text-left text-xs font-medium text-gray uppercase tracking-wider"
                                    style={{ width: isParent ? "128px" : "40%" }}
                                  >
                                    Option Value
                                  </th>
                                  <th
                                    className="px-4 py-2 text-left text-xs font-medium text-gray uppercase tracking-wider"
                                    style={{ width: "20%" }}
                                  >
                                    Status
                                  </th>
                                  {isParent && chainingConfig.childGroupId !== null && (
                                    <th
                                      className="px-4 py-2 text-left text-xs font-medium text-gray uppercase tracking-wider"
                                      style={{ width: "60%" }}
                                    >
                                      Available Options
                                    </th>
                                  )}
                                  <th
                                    className="px-4 py-2 text-right text-xs font-medium text-gray uppercase tracking-wider"
                                    style={{ width: "15%", minWidth: "80px" }}
                                  >
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-neutral-200">
                                {group.options.map((option) => (
                                  <tr key={option.id}>
                                    <td className="px-4 py-3 text-sm font-medium truncate">{option.value}</td>
                                    <td className="px-4 py-3">
                                      <button
                                        onClick={() => toggleOptionActive(group.id, option.id)}
                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                                          isParent
                                            ? getParentOptionStatusClass(option)
                                            : option.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-neutral-100"
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
                                      <td className="px-4 py-3">
                                        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                                          {findGroup(chainingConfig.childGroupId)?.options.map((child) => (
                                            <label
                                              key={child.id}
                                              className={`flex items-center ${!child.isActive ? "opacity-50" : ""}`}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={availabilityMatrix[option.id]?.includes(child.id)}
                                                onChange={() => toggleAvailability(option.id, child.id)}
                                                className="h-3 w-3 text-blue rounded"
                                                disabled={!child.isActive}
                                              />
                                              <span className="ml-1 text-xs text-gray truncate">{child.value}</span>
                                            </label>
                                          ))}
                                        </div>
                                      </td>
                                    )}
                                    <td className="px-4 py-3 text-right">
                                      <button
                                        onClick={() => deleteOption(group.id, option.id)}
                                        className="text-gray hover:text-red-700 transition-colors"
                                        aria-label="Delete option"
                                      >
                                        <X size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="px-4 py-3 bg-white border-t flex">
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
                              className="flex-1 border rounded-md px-4 py-2 text-sm outline-none"
                            />
                            <button
                              onClick={() => addOption(group.id)}
                              className="ml-2 text-gray hover:text-blue transition-colors"
                              aria-label="Add option"
                            >
                              <PlusCircle size={20} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 bg-white">
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
