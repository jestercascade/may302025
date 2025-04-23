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

export function OptionsButton() {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore((state) => state.pages.editProduct.overlays.options.name);

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

export function OptionsOverlay() {
  const [loading, setLoading] = useState(false);

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

  // Sample product data
  const [productName, setProductName] = useState("BioloMix 1200W Blender");
  const [productDescription, setProductDescription] = useState("Professional High-Speed Blender");

  // Option groups data structure
  const [optionGroups, setOptionGroups] = useState([
    {
      id: 1,
      name: "Size",
      options: [
        { id: 1, value: "S", isActive: true },
        { id: 2, value: "M", isActive: true },
        { id: 3, value: "L", isActive: true },
      ],
    },
    {
      id: 2,
      name: "Color",
      options: [
        { id: 4, value: "Blue", isActive: true },
        { id: 5, value: "Green", isActive: true },
        { id: 6, value: "Yellow", isActive: true },
        { id: 7, value: "Red", isActive: true },
      ],
    },
  ]);

  // Chaining configuration
  const [chainingConfig, setChainingConfig] = useState({
    enabled: false,
    parentGroupId: null,
    childGroupId: null,
  });

  // Availability matrix - defines which child options are available for each parent option
  const [availabilityMatrix, setAvailabilityMatrix] = useState({
    1: [4, 5, 6], // Size S compatible with Blue, Green, Yellow
    2: [4, 6], // Size M compatible with Blue and Yellow
    3: [5, 7], // Size L compatible with Green and Red
  });

  // Admin state
  const [newOptionValues, setNewOptionValues] = useState({});
  const [editingName, setEditingName] = useState(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Public-facing state
  const [selectedOptions, setSelectedOptions] = useState({});

  // Track which parent options should be disabled based on child availability
  const [disabledParentOptions, setDisabledParentOptions] = useState([]);

  // Find a group by ID
  const findGroup = (groupId) => {
    return optionGroups.find((group) => group.id === groupId);
  };

  // Effect to update disabled parent options
  useEffect(() => {
    if (!chainingConfig.enabled) {
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

      if (parentId == null || !findGroup(parentId)) {
        parentId = optionGroups[0].id;
      }

      if (childId == null || !findGroup(childId) || childId === parentId) {
        childId = optionGroups.find((g) => g.id !== parentId)?.id || optionGroups[1].id;
      }

      if (parentId !== chainingConfig.parentGroupId || childId !== chainingConfig.childGroupId) {
        setParentChildRelationship(parentId, childId);
      }
    }
  }, [chainingConfig.enabled, optionGroups]);

  // Admin functions
  const addOptionGroup = () => {
    if (newGroupName.trim() === "") return;

    const newGroup = {
      id: Date.now(),
      name: newGroupName,
      options: [],
    };

    setOptionGroups([...optionGroups, newGroup]);
    setNewGroupName("");
  };

  const deleteOptionGroup = (groupId) => {
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

  const addOption = (groupId) => {
    if (!newOptionValues[groupId] || newOptionValues[groupId].trim() === "") return;

    setOptionGroups(
      optionGroups.map((group) => {
        if (group.id === groupId) {
          const newOption = {
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

  const toggleOptionActive = (groupId, optionId) => {
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

      if (chainingConfig.enabled && chainingConfig.parentGroupId === groupId) {
        delete newSelections[chainingConfig.childGroupId];
      }

      setSelectedOptions(newSelections);
    }
  };

  const deleteOption = (groupId, optionId) => {
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

      if (chainingConfig.enabled && chainingConfig.parentGroupId === groupId) {
        delete newSelections[chainingConfig.childGroupId];
      }

      setSelectedOptions(newSelections);
    }
  };

  const startEditName = (groupId, currentName) => {
    setEditingName(groupId);
    setEditNameValue(currentName);
  };

  const saveEditName = (groupId) => {
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

  const toggleAvailability = (parentOptionId, childOptionId) => {
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

  const setParentChildRelationship = (parentId, childId) => {
    if (parentId === null || childId === null || parentId === childId) {
      return;
    }

    if (!findGroup(parentId) || !findGroup(childId)) return;

    const newMatrix = {};
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
    if (!chainingConfig.enabled) return;

    const newMatrix = {};
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

  const moveGroupUp = (index) => {
    if (index <= 0) return;

    const newGroups = [...optionGroups];
    [newGroups[index], newGroups[index - 1]] = [newGroups[index - 1], newGroups[index]];
    setOptionGroups(newGroups);
  };

  const moveGroupDown = (index) => {
    if (index >= optionGroups.length - 1) return;

    const newGroups = [...optionGroups];
    [newGroups[index], newGroups[index + 1]] = [newGroups[index + 1], newGroups[index]];
    setOptionGroups(newGroups);
  };

  // Helper functions
  const isOptionAvailable = (childOptionId) => {
    if (!chainingConfig.enabled) return true;

    const parentOptionId = selectedOptions[chainingConfig.parentGroupId];
    if (!parentOptionId) return true;

    return (availabilityMatrix[parentOptionId] || []).includes(childOptionId);
  };

  const isParentOptionDisabled = (parentOptionId) => {
    return disabledParentOptions.includes(parentOptionId);
  };

  // Public-facing functions
  const selectOption = (groupId, optionId) => {
    const option = findGroup(groupId).options.find((o) => o.id === optionId);
    if (!option.isActive) return;

    if (chainingConfig.enabled) {
      if (groupId === chainingConfig.parentGroupId) {
        if (isParentOptionDisabled(optionId)) return;

        setSelectedOptions({
          ...selectedOptions,
          [groupId]: optionId,
          [chainingConfig.childGroupId]: null,
        });
      } else if (groupId === chainingConfig.childGroupId) {
        const parentOptionId = selectedOptions[chainingConfig.parentGroupId];
        if (parentOptionId && isOptionAvailable(optionId)) {
          setSelectedOptions({
            ...selectedOptions,
            [groupId]: optionId,
          });
        }
      } else {
        setSelectedOptions({
          ...selectedOptions,
          [groupId]: optionId,
        });
      }
    } else {
      setSelectedOptions({
        ...selectedOptions,
        [groupId]: optionId,
      });
    }
  };

  const canAddToCart = () => {
    return optionGroups.every((group) => selectedOptions[group.id] !== undefined);
  };

  const handleSave = () => {
    const product = {
      name: productName,
      description: productDescription,
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
            relationships: chainingConfig.enabled
              ? [
                  {
                    parentGroupId: chainingConfig.parentGroupId,
                    childGroupId: chainingConfig.childGroupId,
                    constraints: Object.keys(availabilityMatrix).reduce((acc, key) => {
                      acc[key] = availabilityMatrix[key];
                      return acc;
                    }, {}),
                  },
                ]
              : [],
          },
        },
      },
    };
    console.log(product);
  };

  const getParentOptionStatusText = (option) => {
    if (!option.isActive) return "Inactive";
    if (isParentOptionDisabled(option.id)) return "No Available Child Options";
    return "Active";
  };

  const getParentOptionStatusClass = (option) => {
    if (!option.isActive) return "bg-gray-100 text-gray-800";
    if (isParentOptionDisabled(option.id)) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
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
                  // onClick={handleSave}
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
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                {/* ... */}

                {/* Add New Option Group Section */}
                <div className="mb-4 space-y-2">
                  <h2 className="text-sm font-medium">Option Group</h2>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name (e.g. Size, Color, Material)"
                      className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                    />
                    <button
                      onClick={addOptionGroup}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      <span className="mr-1">Add</span>
                    </button>
                  </div>
                </div>

                {/* Chain Option Groups Section */}
                {optionGroups.length >= 2 && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-medium">Chain Option Groups</h2>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray-600">
                          {chainingConfig.enabled ? "Enabled" : "Disabled"}
                        </span>
                        <div
                          onClick={toggleChaining}
                          className={`w-10 h-5 rounded-full relative cursor-pointer ease-in-out duration-200 border ${
                            chainingConfig.enabled ? "bg-blue-100 border-blue-300" : "bg-white border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full ease-in-out duration-300 absolute top-1/2 transform -translate-y-1/2 ${
                              chainingConfig.enabled ? "left-6 bg-blue-600" : "left-1 bg-black"
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
                                setParentChildRelationship(
                                  value,
                                  value === chainingConfig.childGroupId
                                    ? optionGroups.find((g) => g.id !== value)?.id
                                    : chainingConfig.childGroupId
                                );
                              }}
                              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select Parent Group</option>
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
                                  setParentChildRelationship(
                                    chainingConfig.parentGroupId === value
                                      ? optionGroups.find((g) => g.id !== value)?.id
                                      : chainingConfig.parentGroupId,
                                    value
                                  );
                                }}
                                className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">Select Child Group</option>
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
                                <RefreshCw className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-blue-600">
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
                    <div key={group.id} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between px-6 py-4 bg-white cursor-pointer"
                        onClick={() =>
                          setCollapsedGroups((prev) => ({
                            ...prev,
                            [group.id]: !prev[group.id],
                          }))
                        }
                      >
                        <div className="flex items-center">
                          {isCollapsed ? (
                            <ChevronRight size={18} className="text-gray-600 mr-2" />
                          ) : (
                            <ChevronDown size={18} className="text-gray-600 mr-2" />
                          )}
                          <div className="flex items-center">
                            {editingName === group.id ? (
                              <input
                                type="text"
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                autoFocus
                                onBlur={() => saveEditName(group.id)}
                              />
                            ) : (
                              <>
                                <span className="font-medium text-gray-800">{group.name}</span>
                                {isParent && (
                                  <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                                    Parent
                                  </span>
                                )}
                                {isChild && (
                                  <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                                    Child
                                  </span>
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
                                className="p-1 text-gray-500 hover:text-gray-700"
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
                                className="p-1 text-gray-500 hover:text-gray-700"
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
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="border-t border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Option Value
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                {isParent && (
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Available Options
                                  </th>
                                )}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {group.options.map((option) => (
                                <tr key={option.id}>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                                    {option.value}
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap">
                                    <button
                                      onClick={() => toggleOptionActive(group.id, option.id)}
                                      className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                                        isParent
                                          ? getParentOptionStatusClass(option)
                                          : option.isActive
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {isParent
                                        ? getParentOptionStatusText(option)
                                        : option.isActive
                                        ? "Active"
                                        : "Inactive"}
                                    </button>
                                  </td>
                                  {isParent && (
                                    <td className="px-6 py-3 whitespace-nowrap">
                                      <div className="flex flex-wrap gap-2">
                                        {findGroup(chainingConfig.childGroupId)?.options.map((child) => (
                                          <label
                                            key={child.id}
                                            className={`flex items-center ${!child.isActive ? "opacity-50" : ""}`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={availabilityMatrix[option.id]?.includes(child.id)}
                                              onChange={() => toggleAvailability(option.id, child.id)}
                                              className="h-3 w-3 text-blue-500 rounded border-gray-300"
                                              disabled={!child.isActive}
                                            />
                                            <span className="ml-1 text-xs text-gray-600">{child.value}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </td>
                                  )}
                                  <td className="px-6 py-3 whitespace-nowrap text-right text-sm">
                                    <button
                                      onClick={() => deleteOption(group.id, option.id)}
                                      className="text-gray-500 hover:text-red-500"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="px-6 py-3 bg-white border-t border-gray-200 flex">
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
                              className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                            />
                            <button
                              onClick={() => addOption(group.id)}
                              className="ml-2 text-gray-500 hover:text-blue-500"
                            >
                              <PlusCircle size={20} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* ... */}
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 bg-white">
              <button
                // onClick={handleSave}
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
