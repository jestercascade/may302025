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
    enabled: false, // Start with chaining off to match your workflow
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

      // If parentId is null or invalid, set to first group
      if (parentId == null || !findGroup(parentId)) {
        parentId = optionGroups[0].id;
      }

      // If childId is null, invalid, or same as parentId, set to a different group
      if (childId == null || !findGroup(childId) || childId === parentId) {
        childId =
          optionGroups.find((g) => g.id !== parentId)?.id || optionGroups[1].id;
      }

      // Update config if changes are needed
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
      // When enabling chaining, rely on useEffect to set defaults
      setSelectedOptions({});
    }
  };

  const setParentChildRelationship = (parentId, childId) => {
    if (parentId === null || childId === null || parentId === childId) {
      // If either is null or they are the same, do not proceed
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
        {/* Admin Panel */}
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
            {/* Add new option group */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Add New Option Group
              </h3>
              <div className="flex rounded-md overflow-hidden">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name (e.g. Size, Color, Material)"
                  className="flex-1 py-2 px-3 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={addOptionGroup}
                  className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 text-sm font-medium rounded-r"
                >
                  Add Group
                </button>
              </div>
            </div>

            {/* Chaining Configuration */}
            {optionGroups.length >= 2 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Chain Option Groups
                  </h3>
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

                {chainingConfig.enabled && (
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                    <div className="flex items-center mb-4">
                      <div className="text-sm text-blue-800 font-medium mr-2">
                        Parent Group:
                      </div>
                      <select
                        value={chainingConfig.parentGroupId ?? ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseInt(e.target.value)
                            : null;
                          setParentChildRelationship(
                            value,
                            value === chainingConfig.childGroupId
                              ? optionGroups.find((g) => g.id !== value)?.id ||
                                  null
                              : chainingConfig.childGroupId
                          );
                        }}
                        className="bg-white border border-blue-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">Select Parent Group</option>
                        {optionGroups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={swapParentChild}
                        className="ml-4 p-1 bg-blue-100 rounded hover:bg-blue-200"
                        title="Swap Parent-Child"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-600"
                        >
                          <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>

                      <div className="text-sm text-blue-800 font-medium ml-8 mr-2">
                        Child Group:
                      </div>
                      <select
                        value={chainingConfig.childGroupId ?? ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseInt(e.target.value)
                            : null;
                          setParentChildRelationship(
                            chainingConfig.parentGroupId === value
                              ? optionGroups.find((g) => g.id !== value)?.id ||
                                  null
                              : chainingConfig.parentGroupId,
                            value
                          );
                        }}
                        className="bg-white border border-blue-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">Select Child Group</option>
                        {optionGroups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-xs text-blue-600">
                      When chaining is enabled, selecting an option from the
                      parent group will determine which options are available in
                      the child group. Parent options will be disabled if all
                      their linked child options are inactive.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Option Groups Management */}
            {optionGroups.map((group, groupIndex) => (
              <div
                key={group.id}
                className="mb-6 border-b border-gray-200 pb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex flex-col mr-2">
                      <button
                        onClick={() => moveGroupUp(groupIndex)}
                        disabled={groupIndex === 0}
                        className={`p-0.5 ${
                          groupIndex === 0
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveGroupDown(groupIndex)}
                        disabled={groupIndex === optionGroups.length - 1}
                        className={`p-0.5 ${
                          groupIndex === optionGroups.length - 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {editingName === group.id ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEditName(group.id)}
                          className="ml-2 text-gray-600 hover:text-gray-800"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-800">
                          {group.name}
                        </h3>
                        {chainingConfig.enabled && (
                          <span
                            className={`ml-2 text-xs px-2 py-0.5 rounded ${
                              chainingConfig.parentGroupId === group.id
                                ? "bg-blue-100 text-blue-800"
                                : chainingConfig.childGroupId === group.id
                                ? "bg-purple-100 text-purple-800"
                                : ""
                            }`}
                          >
                            {chainingConfig.parentGroupId === group.id
                              ? "Parent"
                              : chainingConfig.childGroupId === group.id
                              ? "Child"
                              : ""}
                          </span>
                        )}
                        <button
                          onClick={() => startEditName(group.id, group.name)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    {chainingConfig.enabled && (
                      <span className="mr-4">
                        {chainingConfig.parentGroupId === group.id ? (
                          <Link className="w-4 h-4 text-blue-500" />
                        ) : chainingConfig.childGroupId === group.id ? (
                          <Link className="w-4 h-4 text-purple-500" />
                        ) : (
                          <Link2Off className="w-4 h-4 text-gray-400" />
                        )}
                      </span>
                    )}
                    <button
                      onClick={() => deleteOptionGroup(group.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Options Table */}
                <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Option Value
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        {chainingConfig.enabled &&
                          chainingConfig.parentGroupId === group.id && (
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Available{" "}
                              {findGroup(chainingConfig.childGroupId)?.name ||
                                "Child"}{" "}
                              Options
                            </th>
                          )}
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.options.map((option) => (
                        <tr key={option.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800">
                            {option.value}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <button
                              onClick={() =>
                                toggleOptionActive(group.id, option.id)
                              }
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                chainingConfig.enabled &&
                                chainingConfig.parentGroupId === group.id
                                  ? getParentOptionStatusClass(option)
                                  : option.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {chainingConfig.enabled &&
                              chainingConfig.parentGroupId === group.id
                                ? getParentOptionStatusText(option)
                                : option.isActive
                                ? "Active"
                                : "Inactive"}
                            </button>
                          </td>

                          {chainingConfig.enabled &&
                            chainingConfig.parentGroupId === group.id && (
                              <td className="px-4 py-2">
                                <div className="flex flex-wrap gap-2">
                                  {findGroup(
                                    chainingConfig.childGroupId
                                  )?.options.map((childOption) => (
                                    <label
                                      key={childOption.id}
                                      className={`flex items-center ${
                                        !childOption.isActive
                                          ? "opacity-50"
                                          : ""
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={(
                                          availabilityMatrix[option.id] || []
                                        ).includes(childOption.id)}
                                        onChange={() =>
                                          toggleAvailability(
                                            option.id,
                                            childOption.id
                                          )
                                        }
                                        disabled={!childOption.isActive}
                                        className="h-3 w-3 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                                      />
                                      <span className="ml-1 text-xs text-gray-600">
                                        {childOption.value}
                                        {!childOption.isActive && " (Inactive)"}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </td>
                            )}

                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                            <button
                              onClick={() => deleteOption(group.id, option.id)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {group.options.length === 0 && (
                        <tr>
                          <td
                            colSpan={
                              chainingConfig.enabled &&
                              chainingConfig.parentGroupId === group.id
                                ? 4
                                : 3
                            }
                            className="px-4 py-4 text-sm text-gray-500 text-center"
                          >
                            No options added yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Add new option */}
                <div className="flex rounded-md overflow-hidden border border-gray-300">
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
                    className="flex-1 py-2 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={() => addOption(group.id)}
                    className="bg-gray-100 px-3 hover:bg-gray-200 border-l border-gray-300 text-sm font-medium text-gray-600"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {optionGroups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <PlusCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No option groups added yet</p>
                <p className="text-sm">Add your first option group above</p>
              </div>
            )}

            {/* SAVE Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm font-medium"
              >
                Save Product Options
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-8 border-gray-300" />

        {/* Public-facing UI */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-6">
            Product Options Preview
          </h2>

          {/* Product Name */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">{productName}</h3>
            <p className="text-gray-600">{productDescription}</p>
          </div>

          {/* Options Selection */}
          {optionGroups.map((group) => (
            <div key={group.id} className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  {group.name}
                </h4>
                {selectedOptions[group.id] !== undefined && (
                  <span className="text-sm text-gray-500">
                    Selected:{" "}
                    {
                      group.options.find(
                        (o) => o.id === selectedOptions[group.id]
                      )?.value
                    }
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const isChild =
                    chainingConfig.enabled &&
                    chainingConfig.childGroupId === group.id;
                  const isAvailable = isOptionAvailable(option.id);
                  const isParentDisabled =
                    group.id === chainingConfig.parentGroupId &&
                    isParentOptionDisabled(option.id);
                  const isOptionDisabled =
                    !option.isActive ||
                    isParentDisabled ||
                    (isChild && !isAvailable);

                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (option.isActive && (!isChild || isAvailable)) {
                          selectOption(group.id, option.id);
                        }
                      }}
                      disabled={isOptionDisabled}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-md
                        ${
                          selectedOptions[group.id] === option.id
                            ? "bg-blue-100 text-blue-800 border-2 border-blue-500"
                            : isOptionDisabled
                            ? "bg-white text-gray-400 border-2 border-dashed border-gray-300 cursor-not-allowed"
                            : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
                        }
                      `}
                    >
                      {option.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Add to Cart */}
          <div className="mt-8">
            <button
              disabled={!canAddToCart()}
              className={`
                px-6 py-3 rounded-md text-white font-medium
                ${
                  !canAddToCart()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
