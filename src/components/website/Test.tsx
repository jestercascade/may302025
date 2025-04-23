"use client";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  Trash2,
  Edit,
  Save,
  Link,
  Link2Off,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export default function FlexibleProductOptions() {
  // Sample product data
  const [productName, setProductName] = useState("BioloMix 1200W Blender");
  const [productDescription, setProductDescription] = useState(
    "Professional High-Speed Blender"
  );

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

    const activeChildOptionIds = childGroup.options
      .filter((option) => option.isActive)
      .map((option) => option.id);

    const newDisabledParentOptions = parentGroup.options
      .filter((parentOption) => {
        const availableChildOptions = availabilityMatrix[parentOption.id] || [];
        const hasActiveChildOption = availableChildOptions.some(
          (childOptionId) => activeChildOptionIds.includes(childOptionId)
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
        childId =
          optionGroups.find((g) => g.id !== parentId)?.id || optionGroups[1].id;
      }

      if (
        parentId !== chainingConfig.parentGroupId ||
        childId !== chainingConfig.childGroupId
      ) {
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
    if (
      chainingConfig.parentGroupId === groupId ||
      chainingConfig.childGroupId === groupId
    ) {
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
    if (!newOptionValues[groupId] || newOptionValues[groupId].trim() === "")
      return;

    setOptionGroups(
      optionGroups.map((group) => {
        if (group.id === groupId) {
          const newOption = {
            id: Date.now(),
            value: newOptionValues[groupId],
            isActive: true,
          };

          if (
            chainingConfig.enabled &&
            chainingConfig.parentGroupId === groupId
          ) {
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
        [parentOptionId]: currentAvailability.filter(
          (id) => id !== childOptionId
        ),
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
    [newGroups[index], newGroups[index - 1]] = [
      newGroups[index - 1],
      newGroups[index],
    ];
    setOptionGroups(newGroups);
  };

  const moveGroupDown = (index) => {
    if (index >= optionGroups.length - 1) return;

    const newGroups = [...optionGroups];
    [newGroups[index], newGroups[index + 1]] = [
      newGroups[index + 1],
      newGroups[index],
    ];
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
    return optionGroups.every(
      (group) => selectedOptions[group.id] !== undefined
    );
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
                    constraints: Object.keys(availabilityMatrix).reduce(
                      (acc, key) => {
                        acc[key] = availabilityMatrix[key];
                        return acc;
                      },
                      {}
                    ),
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
    if (isParentOptionDisabled(option.id))
      return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        {/* Product Options Management Panel */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 mb-8">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-center flex-1 font-medium text-gray-700">
              Product Options Management
            </div>
          </div>

          <div className="p-6">
            {/* Add New Option Group Section */}
            <div className="mb-6 bg-white border border-gray-200 rounded-lg">
              <div className="px-4 py-3">
                <h3 className="text-base font-medium text-gray-800">
                  Add New Option Group
                </h3>
                <div className="mt-3 flex">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Group name (e.g. Size, Color, Material)"
                    className="flex-1 py-2 px-3 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={addOptionGroup}
                    className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 text-sm font-medium rounded-r flex items-center"
                  >
                    <span className="mr-1">Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Chain Option Groups Section */}
            {optionGroups.length >= 2 && (
              <div className="mb-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h3 className="text-base font-medium text-gray-800">
                    Chain Option Groups
                  </h3>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-500">
                      {chainingConfig.enabled ? "Enabled" : "Disabled"}
                    </span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chainingConfig.enabled}
                        onChange={toggleChaining}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {chainingConfig.enabled && (
                  <div className="p-4 bg-blue-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="mb-2 text-sm font-medium text-gray-700">
                          Parent Group:
                        </div>
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
                        <div className="mb-2 text-sm font-medium text-gray-700">
                          Child Group:
                        </div>
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
                      Parent options will be disabled if all their linked child
                      options are inactive.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Option Groups Management */}
            {optionGroups.map((group, groupIndex) => {
              const isCollapsed = collapsedGroups[group.id];
              const isParent =
                chainingConfig.enabled &&
                chainingConfig.parentGroupId === group.id;
              const isChild =
                chainingConfig.enabled &&
                chainingConfig.childGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className="mb-6 bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white cursor-pointer"
                    onClick={() =>
                      setCollapsedGroups((prev) => ({
                        ...prev,
                        [group.id]: !prev[group.id],
                      }))
                    }
                  >
                    <div className="flex items-center">
                      {isCollapsed ? (
                        <ChevronRight className="w-5 h-5 text-gray-500 mr-2" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 mr-2" />
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
                            <span className="font-medium text-gray-800">
                              {group.name}
                            </span>
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
                      <div className="flex flex-col">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveGroupUp(groupIndex);
                          }}
                          disabled={groupIndex === 0}
                          className="p-0.5 text-gray-500 hover:text-gray-700"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveGroupDown(groupIndex);
                          }}
                          disabled={groupIndex === optionGroups.length - 1}
                          className="p-0.5 text-gray-500 hover:text-gray-700"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteOptionGroup(group.id);
                        }}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="p-4">
                      <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Option Value
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              {isParent && (
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Available Options
                                </th>
                              )}
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {group.options.map((option) => (
                              <tr key={option.id}>
                                <td className="px-4 py-2 text-sm font-medium text-gray-800">
                                  {option.value}
                                </td>
                                <td className="px-4 py-2">
                                  <button
                                    onClick={() =>
                                      toggleOptionActive(group.id, option.id)
                                    }
                                    className={`px-2.5 py-0.5 rounded-full text-xs ${
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
                                  <td className="px-4 py-2">
                                    <div className="flex flex-wrap gap-2">
                                      {findGroup(
                                        chainingConfig.childGroupId
                                      )?.options.map((child) => (
                                        <label
                                          key={child.id}
                                          className={`flex items-center ${
                                            !child.isActive ? "opacity-50" : ""
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={availabilityMatrix[
                                              option.id
                                            ]?.includes(child.id)}
                                            onChange={() =>
                                              toggleAvailability(
                                                option.id,
                                                child.id
                                              )
                                            }
                                            className="h-3 w-3 text-blue-500 rounded border-gray-300"
                                            disabled={!child.isActive}
                                          />
                                          <span className="ml-1 text-xs text-gray-600">
                                            {child.value}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </td>
                                )}
                                <td className="px-4 py-2 text-right">
                                  <button
                                    onClick={() =>
                                      deleteOption(group.id, option.id)
                                    }
                                    className="text-gray-500 hover:text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex border border-gray-300 rounded-md">
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
                          className="flex-1 px-3 py-2 text-sm focus:outline-none"
                        />
                        <button
                          onClick={() => addOption(group.id)}
                          className="px-3 bg-gray-100 border-l border-gray-300 hover:bg-gray-200"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Save Section */}
            <div className="mt-6 flex justify-end space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 text-sm"
              >
                Save Options
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-6">
            Product Options Preview
          </h2>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">{productName}</h3>
            <p className="text-gray-600">{productDescription}</p>
          </div>

          {optionGroups.map((group) => (
            <div key={group.id} className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {group.name}
              </h4>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => selectOption(group.id, option.id)}
                    className={`px-4 py-2 text-sm rounded-md border-2 ${
                      selectedOptions[group.id] === option.id
                        ? "border-blue-500 bg-blue-100"
                        : "border-gray-300 bg-white"
                    } ${
                      !option.isActive ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!option.isActive}
                  >
                    {option.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            disabled={!canAddToCart()}
            className={`mt-6 px-6 py-3 rounded-md text-white ${
              canAddToCart()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
