import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { transporterAPI } from "../utils/Api";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ResponseModal from "../Components/Responsemodal";

const generateUid = () =>
  `uid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const ContainerDetailsPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [containers, setContainers] = useState([]);
  const [transportRequestId, setTransportRequestId] = useState("");
  const [vehicleDataList, setVehicleDataList] = useState([]);
  const [existingTransporterData, setExistingTransporterData] = useState([]);
  const [expandedVehicles, setExpandedVehicles] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const initialLoadDoneRef = useRef(false);

  // Create empty container with a guaranteed unique client-side UID
  const createEmptyContainer = (vehicleNumber = "") => {
    const uid = generateUid();
    return {
      _uid: uid,
      clientId: uid,
      id: null,
      containerNo: "",
      numberOfContainers: "1",
      containerType: "",
      containerSize: "",
      line: "",
      seal1: "",
      seal2: "",
      containerTotalWeight: "",
      cargoTotalWeight: "",
      remarks: "",
      vehicleNumber: vehicleNumber || "",
      isDirty: true,
    };
  };

  // Group containers by vehicle number
  const groupedContainers = useMemo(() => {
    const grouped = {};

    // Ensure all unique vehicles from vehicleDataList exist in the map
    if (vehicleDataList && vehicleDataList.length > 0) {
      const seenVehicles = new Set();
      vehicleDataList.forEach((v) => {
        const vNum = (v.vehicleNumber || v.vehicle_number || "").trim().toUpperCase();
        if (vNum && !seenVehicles.has(vNum)) {
          seenVehicles.add(vNum);
          grouped[vNum] = [];
        }
      });
    }

    // Assign containers to their vehicle
    containers.forEach((container) => {
      const vNum = (container.vehicleNumber || "unassigned").trim().toUpperCase();
      if (!grouped[vNum]) {
        grouped[vNum] = [];
      }
      grouped[vNum].push(container);
    });

    return grouped;
  }, [vehicleDataList, containers]);

  // Initial load effect: load session storage and fetch backend data once
  useEffect(() => {
    const initPageData = async () => {
      const storedRequestId = sessionStorage.getItem("transportRequestId") || "";
      const storedVehicleData = sessionStorage.getItem("vehicleData");
      const storedContainerData = sessionStorage.getItem("containerData");

      if (storedRequestId) {
        setTransportRequestId(storedRequestId);
      }

      let parsedVehicles = [];
      if (storedVehicleData) {
        try {
          parsedVehicles = JSON.parse(storedVehicleData);
          if (Array.isArray(parsedVehicles)) {
            setVehicleDataList(parsedVehicles);
          }
        } catch (error) {
          console.error("Error parsing vehicle data:", error);
        }
      }

      let parsedContainers = [];
      if (storedContainerData) {
        try {
          const parsed = JSON.parse(storedContainerData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedContainers = parsed.map((c) => ({
              ...c,
              _uid: c._uid || generateUid(),
              clientId: c.clientId || c._uid || generateUid(),
              id: c.id || null,
              isDirty: false,
            }));
          }
        } catch (error) {
          console.error("Error parsing container data from sessionStorage:", error);
        }
      }

      if (parsedContainers.length > 0) {
        setContainers(parsedContainers);
      }

      // If we have a request ID, fetch latest transporter & container data from backend
      if (storedRequestId && !initialLoadDoneRef.current) {
        initialLoadDoneRef.current = true;
        setIsLoading(true);

        try {
          // 1. Fetch transporter details
          const transporterRes = await transporterAPI.getTransporterByRequestId(storedRequestId);
          let loadedVehicles = parsedVehicles;

          if (transporterRes.success && transporterRes.data) {
            const rawData = Array.isArray(transporterRes.data)
              ? transporterRes.data
              : [transporterRes.data];
            setExistingTransporterData(rawData);

            if (rawData.length > 0) {
              loadedVehicles = rawData.map((item) => ({
                vehicleNumber: item.vehicle_number,
                transporterName: item.transporter_name || "",
                vehicleSequence: item.vehicle_sequence || 0,
              }));
              setVehicleDataList(loadedVehicles);
              sessionStorage.setItem("vehicleData", JSON.stringify(loadedVehicles));
            }
          }

          // 2. Fetch container details for all unique vehicles (avoid duplicate requests)
          const backendContainers = [];
          if (loadedVehicles && loadedVehicles.length > 0) {
            const uniqueVehicleNumbers = Array.from(
              new Set(
                loadedVehicles
                  .map((v) => (v.vehicleNumber || v.vehicle_number)?.trim().toUpperCase())
                  .filter(Boolean)
              )
            );

            for (const vNum of uniqueVehicleNumbers) {
              try {
                const containerRes = await transporterAPI.getContainersByVehicleNumber(
                  storedRequestId,
                  vNum
                );
                if (containerRes.success && Array.isArray(containerRes.data)) {
                  // Deduplicate containers by container id
                  const seenIds = new Set();
                  containerRes.data.forEach((item) => {
                    if (item.id && seenIds.has(item.id)) return;
                    if (item.id) seenIds.add(item.id);

                    const uid = generateUid();
                    backendContainers.push({
                      _uid: uid,
                      id: item.id,
                      clientId: `temp-${item.id}`,
                      containerNo: item.container_no || "",
                      numberOfContainers: item.number_of_containers?.toString() || "1",
                      containerType: item.container_type || "",
                      containerSize: item.container_size || "",
                      line: item.line || "",
                      seal1: item.seal1 || item.seal_no || "",
                      seal2: item.seal2 || "",
                      containerTotalWeight: item.container_total_weight?.toString() || "",
                      cargoTotalWeight: item.cargo_total_weight?.toString() || "",
                      remarks: item.remarks || "",
                      vehicleNumber: item.vehicle_number || vNum,
                      isDirty: false,
                    });
                  });
                }
              } catch (err) {
                console.error(`Error loading containers for vehicle ${vNum}:`, err);
              }
            }
          }

          // If backend returned containers, use them
          if (backendContainers.length > 0) {
            setContainers(backendContainers);
            sessionStorage.setItem("containerData", JSON.stringify(backendContainers));
          } else if (parsedContainers.length === 0) {
            // No containers in backend and none in session: create 1 default container
            const defaultVehicle = loadedVehicles[0]?.vehicleNumber || "";
            const initialContainer = createEmptyContainer(defaultVehicle);
            setContainers([initialContainer]);
            sessionStorage.setItem("containerData", JSON.stringify([initialContainer]));
          }
        } catch (error) {
          console.error("Error during initial data loading:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initPageData();
  }, []);

  // Reload all data after container updates or refresh button
  const reloadDataAfterUpdate = async () => {
    if (!transportRequestId) return;

    setIsLoading(true);
    try {
      const transporterRes = await transporterAPI.getTransporterByRequestId(transportRequestId);
      let activeVehicles = vehicleDataList;

      if (transporterRes.success && transporterRes.data) {
        const rawData = Array.isArray(transporterRes.data)
          ? transporterRes.data
          : [transporterRes.data];
        setExistingTransporterData(rawData);

        if (rawData.length > 0) {
          activeVehicles = rawData.map((item) => ({
            vehicleNumber: item.vehicle_number,
            transporterName: item.transporter_name || "",
            vehicleSequence: item.vehicle_sequence || 0,
          }));
          setVehicleDataList(activeVehicles);
          sessionStorage.setItem("vehicleData", JSON.stringify(activeVehicles));
        }
      }

      const refreshedContainers = [];
      if (activeVehicles.length > 0) {
        const uniqueVehicleNumbers = Array.from(
          new Set(
            activeVehicles
              .map((v) => (v.vehicleNumber || v.vehicle_number)?.trim().toUpperCase())
              .filter(Boolean)
          )
        );

        for (const vNum of uniqueVehicleNumbers) {
          try {
            const containerRes = await transporterAPI.getContainersByVehicleNumber(
              transportRequestId,
              vNum
            );
            if (containerRes.success && Array.isArray(containerRes.data)) {
              const seenIds = new Set();
              containerRes.data.forEach((item) => {
                if (item.id && seenIds.has(item.id)) return;
                if (item.id) seenIds.add(item.id);

                const uid = generateUid();
                refreshedContainers.push({
                  _uid: uid,
                  id: item.id,
                  clientId: `temp-${item.id}`,
                  containerNo: item.container_no || "",
                  numberOfContainers: item.number_of_containers?.toString() || "1",
                  containerType: item.container_type || "",
                  containerSize: item.container_size || "",
                  line: item.line || "",
                  seal1: item.seal1 || item.seal_no || "",
                  seal2: item.seal2 || "",
                  containerTotalWeight: item.container_total_weight?.toString() || "",
                  cargoTotalWeight: item.cargo_total_weight?.toString() || "",
                  remarks: item.remarks || "",
                  vehicleNumber: item.vehicle_number || vNum,
                  isDirty: false,
                });
              });
            }
          } catch (err) {
            console.error(`Error refreshing containers for vehicle ${vNum}:`, err);
          }
        }
      }

      if (refreshedContainers.length > 0) {
        setContainers(refreshedContainers);
        sessionStorage.setItem("containerData", JSON.stringify(refreshedContainers));
      } else {
        const defaultVehicle = activeVehicles[0]?.vehicleNumber || "";
        const initialContainer = createEmptyContainer(defaultVehicle);
        setContainers([initialContainer]);
        sessionStorage.setItem("containerData", JSON.stringify([initialContainer]));
      }

      toast.success("Container data refreshed successfully");
    } catch (error) {
      console.error("Error reloading data after update:", error);
      toast.error("Failed to refresh container data");
    } finally {
      setIsLoading(false);
    }
  };

  // Back Navigation
  const onBack = () => {
    sessionStorage.setItem("containerData", JSON.stringify(containers));
    navigate(-1);
  };

  // Add container to specific vehicle
  const addContainer = (vehicleNumber = "") => {
    const newContainer = createEmptyContainer(vehicleNumber);
    setContainers((prev) => {
      const updated = [...prev, newContainer];
      sessionStorage.setItem("containerData", JSON.stringify(updated));
      return updated;
    });

    if (vehicleNumber) {
      setExpandedVehicles((prev) => ({
        ...prev,
        [vehicleNumber]: true,
      }));
    }
  };

  // Remove container strictly using its unique `_uid`
  const removeContainer = async (targetUid) => {
    const containerToRemove = containers.find(
      (c) =>
        c._uid === targetUid ||
        (c.id && c.id === targetUid) ||
        (c.clientId && c.clientId === targetUid)
    );

    if (!containerToRemove) {
      console.warn("Container not found for removal:", targetUid);
      return;
    }

    if (containers.length <= 1) {
      toast.warning("At least one container entry is required");
      return;
    }

    if (containerToRemove.id) {
      try {
        setIsLoading(true);
        const response = await transporterAPI.deleteContainer(containerToRemove.id);
        if (!response.success) {
          throw new Error(response.message || "Failed to delete container");
        }
        toast.success("Container deleted successfully");
      } catch (error) {
        console.error("Error deleting container:", error);
        toast.error(error.message || "Failed to delete container");
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.success("Container removed");
    }

    setContainers((prev) => {
      const updatedContainers = prev.filter(
        (c) =>
          c._uid !== containerToRemove._uid &&
          (!containerToRemove.id || c.id !== containerToRemove.id)
      );
      sessionStorage.setItem("containerData", JSON.stringify(updatedContainers));
      return updatedContainers;
    });
  };

  // Update container data strictly using its unique `_uid`
  const updateContainerData = (targetUid, field, value) => {
    if (field === "containerNo") {
      value = value.toUpperCase();
      if (value.length > 11) {
        value = value.substring(0, 11);
      }
      if (value.length <= 4) {
        value = value.replace(/[^A-Z]/g, "");
      } else {
        const letters = value.substring(0, 4).replace(/[^A-Z]/g, "");
        const digits = value.substring(4).replace(/[^0-9]/g, "");
        value = letters + digits;
      }
    }

    setContainers((prev) => {
      const updated = prev.map((container) => {
        if (
          container._uid === targetUid ||
          (container.id && container.id === targetUid) ||
          (container.clientId && container.clientId === targetUid)
        ) {
          return { ...container, [field]: value, isDirty: true };
        }
        return container;
      });
      sessionStorage.setItem("containerData", JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle vehicle accordion
  const toggleVehicleExpansion = (vehicleNumber) => {
    setExpandedVehicles((prev) => ({
      ...prev,
      [vehicleNumber]: prev[vehicleNumber] === false ? true : false,
    }));
  };

  // Toggle all vehicles expanded / collapsed
  const toggleAllVehicles = () => {
    const allExpanded = Object.keys(groupedContainers).every(
      (vNum) => expandedVehicles[vNum] !== false
    );
    const updated = {};
    Object.keys(groupedContainers).forEach((vNum) => {
      updated[vNum] = !allExpanded;
    });
    setExpandedVehicles(updated);
  };

  // Validate container data with ISO 6346 check digit
  const calculateCheckDigit = (containerNo) => {
    const chars = containerNo.slice(0, 10).split("");
    const letters = "0123456789A?BCDEFGHIJK?LMNOPQRSTU?VWXYZ";
    let sum = 0;
    chars.forEach((char, i) => {
      let value = /[A-Z]/.test(char)
        ? letters.indexOf(char)
        : parseInt(char, 10);
      sum += value * Math.pow(2, i);
    });
    return (sum % 11) % 10;
  };

  const validateContainers = () => {
    const errors = [];
    const vehicleContainerMap = new Map();

    containers.forEach((container, index) => {
      const containerNo = container.containerNo.trim().toUpperCase();
      const vehicleNumber = container.vehicleNumber?.trim();

      if (!containerNo) {
        errors.push(`Container ${index + 1}: Container number is required`);
      } else {
        const containerNoRegex = /^[A-Z]{4}[0-9]{7}$/;
        if (!containerNoRegex.test(containerNo)) {
          errors.push(
            `Container ${
              index + 1
            }: Container number must be 4 letters followed by 7 digits (e.g., ABCD1234567)`
          );
        } else {
          const expectedCheckDigit = calculateCheckDigit(containerNo);
          const actualCheckDigit = parseInt(containerNo.slice(-1), 10);
          if (expectedCheckDigit !== actualCheckDigit) {
            errors.push(
              `Container ${
                index + 1
              }: Invalid check digit. Expected ${expectedCheckDigit}, got ${actualCheckDigit}`
            );
          }
        }
      }
      if (!container.vehicleNumber) {
        errors.push(`Container ${index + 1}: Vehicle number is required`);
      }

      if (containerNo && vehicleNumber) {
        const duplicateKey = `${vehicleNumber}|${containerNo}`;
        if (vehicleContainerMap.has(duplicateKey)) {
          errors.push(
            `Container ${index + 1}: ${containerNo} is already assigned to vehicle ${vehicleNumber}`
          );
        } else {
          vehicleContainerMap.set(duplicateKey, index);
        }
      }
    });
    return errors;
  };

  // Check container history
  const checkContainerHistory = async (containerNo, requestId) => {
    try {
      const response = await transporterAPI.checkContainerHistory(
        containerNo,
        requestId
      );
      return response.data;
    } catch (error) {
      console.error("Error checking container history:", error);
      return { history: [], lastUsed: null, totalUses: 0 };
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateContainers();
    if (errors.length > 0) {
      toast.error(
        <div className="flex flex-col">
          <span className="font-bold text-lg mb-1">Validation Failed</span>
          <ul className="list-disc pl-4">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </div>,
        { position: "top-center", autoClose: 5000 }
      );
      return;
    }

    setIsSubmitting(true);
    const loadingId = toast.loading("Assigning containers to vehicles...", {
      position: "top-center",
    });

    try {
      // Check container history
      const containerHistoryPromises = containers
        .filter((c) => c.containerNo.trim())
        .map(async (container) => {
          const history = await checkContainerHistory(
            container.containerNo,
            transportRequestId
          );
          return { containerNo: container.containerNo, history };
        });
      const containerHistories = await Promise.all(containerHistoryPromises);
      const historyWarnings = containerHistories.filter(
        (h) => h.history && h.history.totalUses > 0
      );

      if (historyWarnings.length > 0) {
        toast.warning(
          <div className="flex flex-col">
            <span className="font-bold text-lg mb-1">
              Container History Warnings
            </span>
            <ul className="list-disc pl-4">
              {historyWarnings.map((warning, index) => (
                <li key={index} className="text-sm">
                  Container {warning.containerNo} was used in Request #
                  {warning.history.lastUsed?.request_id || "unknown"} (
                  {warning.history.totalUses} previous use(s))
                </li>
              ))}
            </ul>
          </div>,
          { position: "top-center", autoClose: 8000 }
        );
      }

      // Prepare payload for batch container assignment
      const uniqueVehicles = Array.from(
        new Set(
          vehicleDataList
            .map((v) => (v.vehicleNumber || v.vehicle_number)?.trim().toUpperCase())
            .filter(Boolean)
        )
      );

      const vehicleContainers = uniqueVehicles
        .map((vNum) => {
          const containersForVehicle = containers.filter(
            (c) =>
              c.vehicleNumber?.trim().toUpperCase() === vNum &&
              (c.isDirty || !c.id)
          );

          if (containersForVehicle.length === 0) {
            return null;
          }

          return {
            vehicle_number: vNum,
            vehicle_sequence: 0,
            containers: containersForVehicle.map((container) => ({
              id: container.id,
              clientId: container._uid || container.clientId,
              container_no: container.containerNo.trim().toUpperCase(),
              line: container.line?.trim() || null,
              seal_no: container.seal1?.trim() || null,
              number_of_containers: parseInt(container.numberOfContainers) || 1,
              seal1: container.seal1?.trim() || null,
              seal2: container.seal2?.trim() || null,
              container_total_weight:
                parseFloat(container.containerTotalWeight) || null,
              cargo_total_weight:
                parseFloat(container.cargoTotalWeight) || null,
              container_type: container.containerType?.trim() || null,
              container_size: container.containerSize?.trim() || null,
              remarks: container.remarks?.trim() || null,
            })),
          };
        })
        .filter(Boolean);

      if (vehicleContainers.length === 0) {
        toast.dismiss(loadingId);
        toast.info("No unsaved changes to submit.");
        setIsSubmitting(false);
        return;
      }

      const response = await transporterAPI.updateMultipleVehicleContainers(
        transportRequestId,
        vehicleContainers
      );

      if (response.success) {
        // Map saved containers back to local state
        const savedContainersMap = new Map();
        if (Array.isArray(response.data)) {
          response.data.forEach((vc) => {
            if (Array.isArray(vc.containers)) {
              vc.containers.forEach((container) => {
                const savedContainer = {
                  id: container.id,
                  clientId: container.clientId || `temp-${container.id}`,
                  containerNo: container.container_no || "",
                  numberOfContainers:
                    container.number_of_containers?.toString() || "1",
                  containerType: container.container_type || "",
                  containerSize: container.container_size || "",
                  line: container.line || "",
                  seal1: container.seal1 || container.seal_no || "",
                  seal2: container.seal2 || "",
                  containerTotalWeight:
                    container.container_total_weight?.toString() || "",
                  cargoTotalWeight:
                    container.cargo_total_weight?.toString() || "",
                  remarks: container.remarks || "",
                  vehicleNumber: vc.vehicle_number || "",
                  isDirty: false,
                };

                if (container.id) {
                  savedContainersMap.set(String(container.id), savedContainer);
                }
                if (container.clientId) {
                  savedContainersMap.set(String(container.clientId), savedContainer);
                }
              });
            }
          });
        }

        // Merge saved data into state
        setContainers((prevContainers) => {
          const newContainers = prevContainers.map((pc) => {
            const keyByUid = pc._uid && savedContainersMap.get(String(pc._uid));
            const keyById = pc.id && savedContainersMap.get(String(pc.id));
            const keyByClientId =
              pc.clientId && savedContainersMap.get(String(pc.clientId));

            const matched = keyByUid || keyById || keyByClientId;
            if (matched) {
              return { ...pc, ...matched, _uid: pc._uid };
            }
            return { ...pc, isDirty: false };
          });

          sessionStorage.setItem("containerData", JSON.stringify(newContainers));
          return newContainers;
        });

        toast.dismiss(loadingId);
        if (response.data && response.data.some((vc) => vc.hasWarnings)) {
          response.data.forEach((vc) => {
            if (vc.hasWarnings && Array.isArray(vc.containers)) {
              vc.containers.forEach((container) => {
                if (container.message) {
                  toast.warning(container.message, { position: "top-center" });
                }
              });
            }
          });
        }

        const totalSavedCount = Array.isArray(response.data)
          ? response.data.reduce(
              (sum, vc) => sum + (Array.isArray(vc.containers) ? vc.containers.length : 0),
              0
            )
          : 0;

        toast.success(
          <div className="flex flex-col">
            <span className="font-bold text-lg mb-1">Success</span>
            <p className="text-sm">
              Successfully saved {totalSavedCount} container(s)
            </p>
          </div>,
          { position: "top-center", autoClose: 5000 }
        );

        setShowModal(true);
        setModalData({
          containers: Array.isArray(response.data)
            ? response.data.flatMap((vc) =>
                Array.isArray(vc.containers)
                  ? vc.containers.map((c) => ({
                      ...c,
                      vehicle_number: vc.vehicle_number,
                    }))
                  : []
              )
            : [],
        });
      } else {
        throw new Error(response.message || "Failed to update containers");
      }
    } catch (error) {
      toast.dismiss(loadingId);
      console.error("Error updating containers:", error);
      toast.error(error.message || "Error updating containers", {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading container details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ width: "400px" }}
        toastStyle={{
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          fontSize: "14px",
        }}
      />
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-5 py-3.5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Container Details Management
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-xs text-gray-500">
                  Request ID:{" "}
                  <span className="font-semibold text-gray-800">{transportRequestId}</span>
                </p>
                {existingTransporterData.length > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ {existingTransporterData.length} transporter record(s) found
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={reloadDataAfterUpdate}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-xs text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
              >
                <svg
                  className="w-3.5 h-3.5 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh Data
              </button>
              <button
                onClick={onBack}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-xs text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 cursor-pointer"
              >
                <svg
                  className="w-3.5 h-3.5 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning if no transporter data */}
      {existingTransporterData.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No transporter data found
              </h3>
              <div className="mt-1 text-xs text-yellow-700">
                <p>
                  Please add transporter details first before updating
                  container information. The container update requires
                  existing transporter data to preserve vehicle and driver
                  information.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Sub-Tree Vehicle & Container Hierarchy */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Container Hierarchy ({containers.length} Container
              {containers.length !== 1 ? "s" : ""})
            </h2>
            <button
              type="button"
              onClick={toggleAllVehicles}
              className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200/80 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {Object.keys(groupedContainers).length > 0 &&
              Object.keys(groupedContainers).every(
                (vNum) => expandedVehicles[vNum] !== false
              )
                ? "Collapse All"
                : "Expand All"}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nested Vehicle Sub-Tree Structure */}
            <div className="space-y-4">
                {Object.entries(groupedContainers).map(
                  ([vehicleNumber, vehicleContainers], vehicleIdx) => {
                    const isExpanded = expandedVehicles[vehicleNumber] !== false;

                    return (
                      <div
                        key={vehicleNumber}
                        className={`border rounded-xl overflow-hidden shadow-xs transition-all duration-200 ${
                          isExpanded
                            ? "border-blue-200 shadow-sm"
                            : "border-gray-200 hover:border-blue-300 hover:shadow-xs"
                        }`}
                      >
                        {/* Parent Node: Vehicle Header */}
                        <div
                          className={`group px-4 py-2.5 flex justify-between items-center cursor-pointer select-none transition-all duration-200 border-l-4 ${
                            isExpanded
                              ? "border-l-blue-600 bg-slate-50 border-b border-gray-200 hover:bg-slate-100/90"
                              : "border-l-transparent bg-gray-50/90 hover:bg-blue-50/50 hover:border-l-blue-400"
                          }`}
                          onClick={() => toggleVehicleExpansion(vehicleNumber)}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="bg-blue-600 group-hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs transition-colors">
                              Vehicle #{vehicleIdx + 1}
                            </span>
                            <span className="font-semibold text-gray-900 group-hover:text-blue-900 text-sm transition-colors">
                              {vehicleNumber === "unassigned"
                                ? "Unassigned Containers"
                                : vehicleNumber}
                            </span>
                            <span className="bg-blue-100 group-hover:bg-blue-200/80 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors">
                              {vehicleContainers.length} container{vehicleContainers.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addContainer(
                                  vehicleNumber === "unassigned" ? "" : vehicleNumber
                                );
                              }}
                              className="inline-flex items-center px-2.5 py-1 border border-transparent rounded-md shadow-xs text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 cursor-pointer transition-all"
                              title="Add container to this vehicle"
                            >
                              <svg
                                className="h-3 w-3 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                              + Add Container
                            </button>

                            <div className="p-1 rounded text-gray-400 group-hover:text-blue-600 transition-colors">
                              <svg
                                className={`h-4 w-4 transform transition-transform duration-300 ${
                                  isExpanded ? "rotate-180" : "rotate-0"
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Child Sub-Tree: Ultra-Compact Nested Container Cards */}
                        {isExpanded && (
                          <div className="p-3 bg-slate-50/50">
                            {vehicleContainers.length === 0 ? (
                              <div className="text-center py-4 text-gray-500 text-xs bg-white rounded-lg border border-dashed border-gray-300">
                                No containers assigned yet. Click{" "}
                                <button
                                  type="button"
                                  onClick={() =>
                                    addContainer(
                                      vehicleNumber === "unassigned"
                                        ? ""
                                        : vehicleNumber
                                    )
                                  }
                                  className="text-blue-600 font-semibold underline hover:text-blue-800 cursor-pointer"
                                >
                                  + Add Container
                                </button>
                              </div>
                            ) : (
                              <div className="pl-3 border-l-3 border-blue-500 space-y-2.5">
                                <div className="text-[11px] font-semibold text-blue-900 flex items-center uppercase tracking-wider">
                                  <svg
                                    className="w-3.5 h-3.5 mr-1 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                                    />
                                  </svg>
                                  Sub-Tree Containers for Vehicle #{vehicleIdx + 1} ({vehicleNumber}):
                                </div>

                                <div className="space-y-2">
                                  {vehicleContainers.map(
                                    (container, containerIndex) => {
                                      return (
                                        <div
                                          key={container._uid}
                                          className="border border-gray-200 rounded-lg p-2.5 px-3 bg-white shadow-xs relative hover:border-blue-400 hover:shadow-md transition-all duration-200 w-full"
                                        >
                                          {/* Compact Container Header */}
                                          <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-gray-100">
                                            <div className="flex items-center space-x-2">
                                              <span className="text-[11px] font-bold text-gray-800 bg-slate-100 px-2 py-0.5 rounded">
                                                Container #{containerIndex + 1}
                                              </span>
                                              {container.containerNo && (
                                                <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                  {container.containerNo}
                                                </span>
                                              )}
                                            </div>

                                            {containers.length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeContainer(container._uid)
                                                }
                                                className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 border border-red-200 hover:border-red-300 rounded focus:outline-none cursor-pointer transition-all active:scale-95"
                                                title="Remove Container"
                                              >
                                                <svg
                                                  className="h-3 w-3 mr-0.5"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  stroke="currentColor"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                  />
                                                </svg>
                                                Remove
                                              </button>
                                            )}
                                          </div>

                                          {/* Ultra-Compact Fields Form Grid (All on single line on desktop) */}
                                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-[1.4fr_85px_80px_1.2fr_1fr_1fr_90px_90px_90px] gap-2 items-end">
                                            {/* Container Number */}
                                            <div>
                                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-tight mb-0.5 truncate">
                                                Container No *
                                              </label>
                                              <input
                                                type="text"
                                                required
                                                className="w-full h-8 text-xs uppercase font-mono font-semibold border border-gray-300 rounded px-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                value={container.containerNo || ""}
                                                onChange={(e) =>
                                                  updateContainerData(
                                                    container._uid,
                                                    "containerNo",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="ABCD1234567"
                                              />
                                            </div>

                                            {/* Container Type */}
                                            <div>
                                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-tight mb-0.5 truncate">
                                                Type
                                              </label>
                                              <select
                                                className="w-full h-8 text-xs border border-gray-300 rounded px-2 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                value={container.containerType || ""}
                                                onChange={(e) =>
                                                  updateContainerData(
                                                    container._uid,
                                                    "containerType",
                                                    e.target.value
                                                  )
                                                }
                                              >
                                                <option value="">Type</option>
                                                <option value="HQ">HQ</option>
                                                <option value="DV">DV</option>
                                                <option value="REFER">REFER</option>
                                              </select>
                                            </div>

                                            {/* Container Size */}
                                            <div>
                                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-tight mb-0.5 truncate">
                                                Size
                                              </label>
                                              <input
                                                type="text"
                                                className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                value={container.containerSize || ""}
                                                onChange={(e) =>
                                                  updateContainerData(
                                                    container._uid,
                                                    "containerSize",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="20 / 40"
                                              />
                                            </div>

                                            {/* Shipping Line */}
                                            <div>
                                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-tight mb-0.5 truncate">
                                                Line
                                              </label>
                                              <input
                                                type="text"
                                                className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                value={container.line || ""}
                                                onChange={(e) =>
                                                  updateContainerData(
                                                    container._uid,
                                                    "line",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Line"
                                              />
                                            </div>

                                            {/* Seal 1 */}
                                            <div>
                                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-tight mb-0.5 truncate">
                                                Seal 1
                                              </label>
                                              <input
                                                type="text"
                                                className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                value={container.seal1 || ""}
                                                onChange={(e) =>
                                                  updateContainerData(
                                                    container._uid,
                                                    "seal1",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Seal 1"
                                              />
                                            </div>

                                            {/* Seal 2 */}
                                            <div>
                                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-tight mb-0.5 truncate">
                                                Seal 2
                                              </label>
                                              <input
                                                type="text"
                                                className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                value={container.seal2 || ""}
                                                onChange={(e) =>
                                                  updateContainerData(
                                                    container._uid,
                                                    "seal2",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Seal 2"
                                              />
                                            </div>

                                            {/* Tare Weight */}
                                            <div>
                                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-tight mb-0.5 truncate">
                                                Tare (kg)
                                              </label>
                                              <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                value={container.containerTotalWeight || ""}
                                                onChange={(e) =>
                                                  updateContainerData(
                                                    container._uid,
                                                    "containerTotalWeight",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Tare"
                                              />
                                            </div>

                                            {/* Cargo Weight */}
                                            <div>
                                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-tight mb-0.5 truncate">
                                                Cargo (kg)
                                              </label>
                                              <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                value={container.cargoTotalWeight || ""}
                                                onChange={(e) =>
                                                  updateContainerData(
                                                    container._uid,
                                                    "cargoTotalWeight",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Cargo"
                                              />
                                            </div>

                                            {/* Gross Weight */}
                                            <div>
                                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-tight mb-0.5 truncate">
                                                Gross (kg)
                                              </label>
                                              <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="w-full h-8 text-xs border border-gray-300 rounded px-2 bg-gray-100 text-gray-700 focus:outline-none"
                                                value={
                                                  (parseFloat(container.cargoTotalWeight) || 0) +
                                                  (parseFloat(container.containerTotalWeight) || 0)
                                                }
                                                disabled
                                                placeholder="Gross"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || existingTransporterData.length === 0}
                  className={`
                    px-7 py-2.5 rounded-lg text-white font-medium text-sm transition-all duration-200 cursor-pointer
                    ${
                      isSubmitting || existingTransporterData.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-xs"
                    }
                    flex items-center
                  `}
                  title={
                    existingTransporterData.length === 0
                      ? "Add transporter details first"
                      : "Update container details"
                  }
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating Containers...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Update Container Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        <ResponseModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          data={modalData}
        />
      </div>
  );
};

export default ContainerDetailsPage;
