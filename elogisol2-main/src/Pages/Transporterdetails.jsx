import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { transporterAPI, transporterListAPI } from "../utils/Api";
import ModalChecklist from "../Components/dashboard/ModalChecklist";
import {
  Truck as TruckIcon,
  Package,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  CheckCircle2,
  Save,
} from "lucide-react";

// Branded Truck Illustration with "Transplus" logo
const BrandedTruckIllustration = ({ color = "#1e40af", vendor = "CARAVAN" }) => {
  const isRed =
    color.toLowerCase().includes("dc2626") ||
    vendor?.toUpperCase().includes("SANGAM") ||
    vendor?.toUpperCase().includes("DEV");
  const trailerColor = isRed ? "#b91c1c" : "#1e40af";
  const cabColor = isRed ? "#f87171" : "#60a5fa";

  return (
    <div className="relative flex items-center justify-center select-none shrink-0">
      <svg
        viewBox="0 0 160 56"
        className="w-24 h-9 drop-shadow-xs transition-transform duration-200 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 38H18V18C18 16.5 19.5 15 21 15H36V38H42"
          stroke="#334155"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 20L25 15H38V38H18V20Z"
          fill={cabColor}
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        <path
          d="M20 21L25 17H34V26H20V21Z"
          fill="#e2e8f0"
          stroke="#0f172a"
          strokeWidth="1"
        />
        <rect x="4" y="36" width="10" height="5" rx="2" fill="#64748b" />
        <rect x="38" y="32" width="12" height="6" fill="#475569" />
        <rect
          x="48"
          y="6"
          width="106"
          height="34"
          rx="3"
          fill={trailerColor}
          stroke="#0f172a"
          strokeWidth="2"
        />
        <line x1="56" y1="6" x2="56" y2="40" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="66" y1="6" x2="66" y2="40" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="76" y1="6" x2="76" y2="40" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="86" y1="6" x2="86" y2="40" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="96" y1="6" x2="96" y2="40" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="106" y1="6" x2="106" y2="40" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="116" y1="6" x2="116" y2="40" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="126" y1="6" x2="126" y2="40" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="136" y1="6" x2="136" y2="40" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="146" y1="6" x2="146" y2="40" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <text
          x="101"
          y="26"
          fill="#ffffff"
          fontSize="13"
          fontWeight="900"
          fontStyle="italic"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          Transplus
        </text>
        <line x1="52" y1="41" x2="148" y2="41" stroke="#334155" strokeWidth="3" />
        <circle cx="22" cy="42" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
        <circle cx="22" cy="42" r="3" fill="#cbd5e1" />
        <circle cx="120" cy="42" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
        <circle cx="120" cy="42" r="3" fill="#cbd5e1" />
        <circle cx="138" cy="42" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
        <circle cx="138" cy="42" r="3" fill="#cbd5e1" />
      </svg>
    </div>
  );
};

// Branded Mini Container
const BrandedContainerIllustration = ({ color = "#1e40af", size = "20ft" }) => {
  const isRed = color.toLowerCase().includes("dc2626") || color.toLowerCase().includes("red");
  const boxColor = isRed ? "#b91c1c" : "#1e40af";

  return (
    <div className="relative flex items-center justify-center select-none shrink-0">
      <svg
        viewBox="0 0 110 42"
        className="w-18 h-7 drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="2"
          width="106"
          height="38"
          rx="3"
          fill={boxColor}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        <line x1="12" y1="3" x2="12" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="22" y1="3" x2="22" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="32" y1="3" x2="32" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="42" y1="3" x2="42" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="52" y1="3" x2="52" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="62" y1="3" x2="62" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="72" y1="3" x2="72" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="82" y1="3" x2="82" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="92" y1="3" x2="92" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <text
          x="55"
          y="24"
          fill="#ffffff"
          fontSize="11"
          fontWeight="900"
          fontStyle="italic"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
        >
          Transplus
        </text>
      </svg>
    </div>
  );
};

export const TransporterDetails = ({
  transportRequestId,
  onBack,
  selectedServices = [],
  transporterData,
  setTransporterData,
  vehicleType,
  numberOfVehicles,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nestedVehicles, setNestedVehicles] = useState([]);
  const [transportersList, setTransportersList] = useState([]);
  const [services, setServices] = useState(selectedServices);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let servicesArray = [];
    if (typeof selectedServices === "string") {
      try {
        servicesArray = JSON.parse(selectedServices);
      } catch (e) {
        servicesArray = [selectedServices];
      }
    } else if (Array.isArray(selectedServices)) {
      servicesArray = selectedServices;
    }
    setServices(servicesArray);
  }, [selectedServices]);

  // Load vendors list
  useEffect(() => {
    const fetchTransporters = async () => {
      try {
        const response = await transporterListAPI.getAllTransporters();
        if (response) {
          setTransportersList(
            response
              .filter((t) => t.status === "Active")
              .map((t) => ({
                id: t.transporter_id,
                name: t.transporter_name,
              }))
          );
        }
      } catch (error) {
        console.error("Error fetching transporters:", error);
      }
    };
    fetchTransporters();
  }, []);

  // Helper to build a clean default container
  const createDefaultContainer = (index = 1) => ({
    id: null,
    clientId: `c-${Date.now()}-${Math.random()}`,
    containerNumber: "",
    size: "20ft",
    line: "DP WORLD",
    sealNumber: "",
    vendorCharges: 0,
    additionalCharges: 0,
  });

  // Helper to build a clean default vehicle
  const createDefaultVehicle = (index = 1) => ({
    id: null,
    vehicleIndex: index,
    vehicleNumber: "",
    driverName: "",
    driverContact: "",
    vendorName: "CARAVAN ROADWAYS",
    vendorColor: "#1e40af",
    isExpanded: true,
    containers: [createDefaultContainer(1)],
  });

  // Load and transform flat transporter rows from backend into Nested Tree
  const loadTransporterDetails = async () => {
    if (!transportRequestId) {
      setNestedVehicles([createDefaultVehicle(1)]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await transporterAPI.getTransporterByRequestId(
        transportRequestId
      );

      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        const rows = response.data;

        // Group rows by vehicle_number (or vehicle_sequence if vehicle_number is empty)
        const vehicleMap = new Map();

        rows.forEach((row, rIdx) => {
          const vKey = row.vehicle_number?.trim() || `_seq_${row.vehicle_sequence || rIdx + 1}`;

          let serviceChargesObj = {};
          if (row.service_charges) {
            try {
              serviceChargesObj = JSON.parse(row.service_charges);
            } catch (e) {
              // ignore
            }
          }

          // Extract numeric service charge
          const firstServiceCharge = Object.values(serviceChargesObj)[0] || row.total_charge || 0;
          const vendorCharge = parseFloat(firstServiceCharge) || parseFloat(row.base_charge) || 0;
          const additionalCharge = parseFloat(row.additional_charges) || 0;

          const containerObj = {
            id: row.id,
            clientId: `c-db-${row.id}`,
            containerNumber: row.container_no || "",
            size: row.container_size ? `${row.container_size}ft` : "20ft",
            line: row.line || "DP WORLD",
            sealNumber: row.seal1 || row.seal_no || "",
            vendorCharges: vendorCharge,
            additionalCharges: additionalCharge,
          };

          if (!vehicleMap.has(vKey)) {
            vehicleMap.set(vKey, {
              id: row.id,
              vehicleIndex: vehicleMap.size + 1,
              vehicleNumber: row.vehicle_number || "",
              driverName: row.driver_name || "",
              driverContact: row.driver_contact || "",
              vendorName: row.transporter_name || "CARAVAN ROADWAYS",
              vendorColor: (row.transporter_name || "").toUpperCase().includes("SANGAM")
                ? "#dc2626"
                : "#1e40af",
              isExpanded: true,
              containers: [containerObj],
            });
          } else {
            const existingV = vehicleMap.get(vKey);
            existingV.containers.push(containerObj);
          }
        });

        const transformedList = Array.from(vehicleMap.values()).map((v, i) => ({
          ...v,
          vehicleIndex: i + 1,
        }));

        setNestedVehicles(transformedList);
      } else {
        const initialCount = parseInt(numberOfVehicles) || 1;
        const defaultList = Array.from({ length: Math.min(initialCount, 5) }, (_, i) =>
          createDefaultVehicle(i + 1)
        );
        setNestedVehicles(defaultList);
      }
    } catch (error) {
      console.error("Error loading transporter details:", error);
      setNestedVehicles([createDefaultVehicle(1)]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (transportRequestId) {
      loadTransporterDetails();
    } else {
      setNestedVehicles([createDefaultVehicle(1)]);
    }
  }, [transportRequestId]);

  // Expand / collapse vehicle
  const toggleVehicleExpand = (vIdx) => {
    setNestedVehicles((prev) =>
      prev.map((v, idx) => (idx === vIdx ? { ...v, isExpanded: !v.isExpanded } : v))
    );
  };

  // Add new vehicle
  const handleAddVehicle = () => {
    const nextIdx = nestedVehicles.length + 1;
    setNestedVehicles((prev) => [...prev, createDefaultVehicle(nextIdx)]);
    toast.success(`Vehicle #${nextIdx} added`);
  };

  // Remove vehicle
  const handleRemoveVehicle = (vIdx = null) => {
    if (nestedVehicles.length <= 1) {
      toast.warning("At least 1 vehicle is required");
      return;
    }
    setNestedVehicles((prev) => {
      const targetIndex = vIdx !== null ? vIdx : prev.length - 1;
      const filtered = prev.filter((_, idx) => idx !== targetIndex);
      return filtered.map((v, i) => ({ ...v, vehicleIndex: i + 1 }));
    });
    toast.info("Vehicle removed");
  };

  // Update vehicle header field (driver, vehicleNumber, vendor)
  const handleUpdateVehicleField = (vIdx, field, value) => {
    setNestedVehicles((prev) =>
      prev.map((v, idx) => {
        if (idx === vIdx) {
          const updated = { ...v, [field]: value };
          if (field === "vendorName") {
            updated.vendorColor = value.toUpperCase().includes("SANGAM")
              ? "#dc2626"
              : "#1e40af";
          }
          return updated;
        }
        return v;
      })
    );
  };

  // Add container inside vehicle
  const handleAddContainer = (vIdx) => {
    setNestedVehicles((prev) =>
      prev.map((v, idx) => {
        if (idx === vIdx) {
          return {
            ...v,
            isExpanded: true,
            containers: [...v.containers, createDefaultContainer(v.containers.length + 1)],
          };
        }
        return v;
      })
    );
    toast.success(`Container added to Vehicle #${vIdx + 1}`);
  };

  // Delete container inside vehicle
  const handleDeleteContainer = (vIdx, cIdx) => {
    setNestedVehicles((prev) =>
      prev.map((v, idx) => {
        if (idx === vIdx) {
          if (v.containers.length <= 1) {
            toast.warning("At least 1 container is required per vehicle");
            return v;
          }
          return {
            ...v,
            containers: v.containers.filter((_, cI) => cI !== cIdx),
          };
        }
        return v;
      })
    );
    toast.info("Container deleted");
  };

  // Update container field
  const handleUpdateContainerField = (vIdx, cIdx, field, value) => {
    setNestedVehicles((prev) =>
      prev.map((v, idx) => {
        if (idx === vIdx) {
          return {
            ...v,
            containers: v.containers.map((c, cI) => {
              if (cI === cIdx) {
                return {
                  ...c,
                  [field]:
                    field === "vendorCharges" || field === "additionalCharges"
                      ? parseFloat(value) || 0
                      : value,
                };
              }
              return c;
            }),
          };
        }
        return v;
      })
    );
  };

  // Calculation helpers
  const calculateVehicleTotals = (vehicle) => {
    const vendorSum = vehicle.containers.reduce(
      (sum, c) => sum + (parseFloat(c.vendorCharges) || 0),
      0
    );
    const additionalSum = vehicle.containers.reduce(
      (sum, c) => sum + (parseFloat(c.additionalCharges) || 0),
      0
    );
    return {
      vendorCharges: vendorSum,
      additionalCharges: additionalSum,
      totalCharges: vendorSum + additionalSum,
    };
  };

  const grandVendorCharges = nestedVehicles.reduce((sum, v) => {
    const totals = calculateVehicleTotals(v);
    return sum + totals.vendorCharges;
  }, 0);

  const grandAdditionalCharges = nestedVehicles.reduce((sum, v) => {
    const totals = calculateVehicleTotals(v);
    return sum + totals.additionalCharges;
  }, 0);

  const grandTotalAmount = grandVendorCharges + grandAdditionalCharges;

  const totalContainersCount = nestedVehicles.reduce(
    (sum, v) => sum + v.containers.length,
    0
  );

  // Save all transporter details
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    if (!transportRequestId) {
      toast.error("Transport Request ID is required to save");
      return;
    }

    setIsSubmitting(true);
    const loadingId = toast.loading("Saving Transporter & Container Details...", {
      position: "top-center",
    });

    try {
      // Flatten nested tree into backend database rows
      const flatPayload = [];
      let seq = 1;

      nestedVehicles.forEach((vehicle) => {
        vehicle.containers.forEach((container) => {
          const serviceName = services[0] || "Transportation Charges";
          const serviceObj = { [serviceName]: (container.vendorCharges || 0).toString() };

          flatPayload.push({
            id: container.id || null,
            transporter_name: vehicle.vendorName.trim(),
            vehicle_number: vehicle.vehicleNumber.trim().toUpperCase(),
            driver_name: vehicle.driverName.trim(),
            driver_contact: vehicle.driverContact.trim(),
            additional_charges: parseFloat(container.additionalCharges) || 0,
            service_charges: JSON.stringify(serviceObj),
            total_charge:
              (parseFloat(container.vendorCharges) || 0) +
              (parseFloat(container.additionalCharges) || 0),
            container_no: container.containerNumber?.trim().toUpperCase() || null,
            line: container.line?.trim() || "DP WORLD",
            seal_no: container.sealNumber?.trim() || null,
            seal1: container.sealNumber?.trim() || null,
            container_size: container.size?.replace("ft", "") || "20",
            container_type: "DV",
            number_of_containers: 1,
            vehicle_sequence: seq++,
          });
        });
      });

      // Submit new or updated rows
      const createResponse = await transporterAPI.createMultipleVehicles(
        transportRequestId,
        flatPayload
      );

      if (createResponse && createResponse.success) {
        toast.update(loadingId, {
          render: `Saved ${nestedVehicles.length} vehicles & ${totalContainersCount} containers successfully!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        await loadTransporterDetails();
      } else {
        throw new Error(createResponse?.message || "Failed to save details");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.update(loadingId, {
        render: error.message || "Error saving details",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 mt-6 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-slate-500 font-medium mt-3">Loading Transporter Details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 mt-6 overflow-hidden">
      {/* HEADER BAR */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Transporter Details
          </h3>
          {transportRequestId && (
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Request ID: <span className="text-slate-800">{transportRequestId}</span>
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleAddVehicle}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>

          <button
            type="button"
            onClick={() => handleRemoveVehicle()}
            disabled={nestedVehicles.length <= 1}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              nestedVehicles.length <= 1
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Vehicle</span>
          </button>
        </div>
      </div>

      {/* NESTED VEHICLE & CONTAINER CARDS */}
      <div className="p-6 space-y-4 bg-slate-50/50">
        {nestedVehicles.map((vehicle, vIdx) => {
          const totals = calculateVehicleTotals(vehicle);

          return (
            <div
              key={vehicle.id || `v-${vIdx}`}
              className="bg-white border border-slate-200 rounded-xl shadow-xs transition-all duration-200 hover:border-slate-300 overflow-hidden"
            >
              {/* VEHICLE HEADER CARD */}
              <div
                onClick={() => toggleVehicleExpand(vIdx)}
                className={`p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                  vehicle.isExpanded ? "bg-slate-50/90 border-b border-slate-200" : "hover:bg-slate-50/50"
                }`}
              >
                {/* Badge + Truck + Vehicle Number */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 shadow-xs">
                    {vIdx + 1}
                  </div>

                  <BrandedTruckIllustration
                    color={vehicle.vendorColor}
                    vendor={vehicle.vendorName}
                  />

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Vehicle Number
                    </div>
                    <input
                      type="text"
                      value={vehicle.vehicleNumber}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleUpdateVehicleField(
                          vIdx,
                          "vehicleNumber",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="HR55BC1677"
                      className="text-xs font-bold text-blue-600 bg-blue-50/90 px-2 py-0.5 rounded border border-blue-200 w-28 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Driver */}
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-blue-600">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Driver
                    </div>
                    <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={vehicle.driverName}
                        onChange={(e) =>
                          handleUpdateVehicleField(vIdx, "driverName", e.target.value)
                        }
                        placeholder="Driver Name"
                        className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded px-1.5 py-0.5 w-24 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={vehicle.driverContact}
                        onChange={(e) =>
                          handleUpdateVehicleField(vIdx, "driverContact", e.target.value)
                        }
                        placeholder="Contact"
                        className="text-xs font-normal text-slate-500 bg-white border border-slate-200 rounded px-1.5 py-0.5 w-24 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Vendor Name */}
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Vendor
                    </div>
                    <input
                      type="text"
                      value={vehicle.vendorName}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleUpdateVehicleField(vIdx, "vendorName", e.target.value)
                      }
                      placeholder="Vendor Name"
                      className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-0.5 w-36 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Rollup Charges & Chevron */}
                <div className="flex items-center space-x-5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">
                      Vendor Charges
                    </div>
                    <div className="text-xs font-bold text-slate-800 text-right">
                      ₹ {totals.vendorCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">
                      Additional Charges
                    </div>
                    <div className="text-xs font-bold text-slate-800 text-right">
                      ₹ {totals.additionalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">
                      Total Charges
                    </div>
                    <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 text-right">
                      ₹ {totals.totalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="text-slate-400 hover:text-slate-600">
                    {vehicle.isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* EXPANDED CONTAINER TREE */}
              {vehicle.isExpanded && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-100">
                  <div className="relative pl-5">
                    {/* Visual Vertical Connector Line */}
                    <div className="absolute left-2 top-0 bottom-4 w-0.5 bg-blue-300" />

                    {/* Container Section Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Package className="w-3 h-3" />
                        </div>
                        <span className="font-bold text-slate-800 text-xs">
                          Containers ({vehicle.containers.length})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddContainer(vIdx)}
                        className="flex items-center space-x-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded border border-blue-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Container</span>
                      </button>
                    </div>

                    {/* Container Table */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                            <th className="py-2 px-2.5 w-10 text-center">#</th>
                            <th className="py-2 px-2.5 w-24 text-center">Preview</th>
                            <th className="py-2 px-2.5 min-w-[130px]">Container Number</th>
                            <th className="py-2 px-2.5 w-20">Size</th>
                            <th className="py-2 px-2.5 min-w-[110px]">Line</th>
                            <th className="py-2 px-2.5 min-w-[100px]">Seal Number</th>
                            <th className="py-2 px-2.5 min-w-[110px] text-right">Vendor Charges (₹)</th>
                            <th className="py-2 px-2.5 min-w-[110px] text-right">Additional Charges (₹)</th>
                            <th className="py-2 px-2.5 min-w-[110px] text-right">Total Charges (₹)</th>
                            <th className="py-2 px-2.5 w-10 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {vehicle.containers.map((container, cIdx) => {
                            const cTotal =
                              (parseFloat(container.vendorCharges) || 0) +
                              (parseFloat(container.additionalCharges) || 0);

                            return (
                              <tr key={container.clientId || `c-${cIdx}`} className="hover:bg-blue-50/30">
                                <td className="py-2.5 px-2.5 text-center font-bold text-slate-600">
                                  <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-slate-100 text-blue-600 text-[10px] border border-slate-200">
                                    {cIdx + 1}
                                  </span>
                                </td>

                                <td className="py-2.5 px-2.5 text-center">
                                  <BrandedContainerIllustration
                                    color={vehicle.vendorColor}
                                    size={container.size}
                                  />
                                </td>

                                <td className="py-2.5 px-2.5">
                                  <input
                                    type="text"
                                    value={container.containerNumber}
                                    onChange={(e) =>
                                      handleUpdateContainerField(
                                        vIdx,
                                        cIdx,
                                        "containerNumber",
                                        e.target.value.toUpperCase()
                                      )
                                    }
                                    className="w-full font-bold text-blue-600 bg-blue-50/80 border border-blue-200 rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    placeholder="MSKU1234567"
                                  />
                                </td>

                                <td className="py-2.5 px-2.5">
                                  <select
                                    value={container.size}
                                    onChange={(e) =>
                                      handleUpdateContainerField(
                                        vIdx,
                                        cIdx,
                                        "size",
                                        e.target.value
                                      )
                                    }
                                    className="font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                                  >
                                    <option value="20ft">20ft</option>
                                    <option value="40ft">40ft</option>
                                  </select>
                                </td>

                                <td className="py-2.5 px-2.5">
                                  <input
                                    type="text"
                                    value={container.line}
                                    onChange={(e) =>
                                      handleUpdateContainerField(
                                        vIdx,
                                        cIdx,
                                        "line",
                                        e.target.value
                                      )
                                    }
                                    className="w-full font-semibold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                                    placeholder="DP WORLD"
                                  />
                                </td>

                                <td className="py-2.5 px-2.5">
                                  <input
                                    type="text"
                                    value={container.sealNumber}
                                    onChange={(e) =>
                                      handleUpdateContainerField(
                                        vIdx,
                                        cIdx,
                                        "sealNumber",
                                        e.target.value
                                      )
                                    }
                                    className="w-full font-medium text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                                    placeholder="SL1234"
                                  />
                                </td>

                                <td className="py-2.5 px-2.5 text-right">
                                  <input
                                    type="number"
                                    value={container.vendorCharges}
                                    onChange={(e) =>
                                      handleUpdateContainerField(
                                        vIdx,
                                        cIdx,
                                        "vendorCharges",
                                        e.target.value
                                      )
                                    }
                                    className="w-24 font-semibold text-slate-800 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    min="0"
                                  />
                                </td>

                                <td className="py-2.5 px-2.5 text-right">
                                  <input
                                    type="number"
                                    value={container.additionalCharges}
                                    onChange={(e) =>
                                      handleUpdateContainerField(
                                        vIdx,
                                        cIdx,
                                        "additionalCharges",
                                        e.target.value
                                      )
                                    }
                                    className="w-24 font-semibold text-slate-800 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    min="0"
                                  />
                                </td>

                                <td className="py-2.5 px-2.5 text-right">
                                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                    ₹ {cTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </span>
                                </td>

                                <td className="py-2.5 px-2.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteContainer(vIdx, cIdx)}
                                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                                    title="Delete Container"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Vehicle Subtotal Footer */}
                      <div className="bg-slate-100/80 border-t border-slate-200 px-3.5 py-2 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-600 uppercase tracking-wider text-[10px]">
                          Vehicle Total ({vehicle.containers.length} Container{vehicle.containers.length > 1 ? "s" : ""})
                        </span>
                        <div className="flex items-center space-x-5 text-slate-800 text-xs">
                          <span>
                            Vendor:{" "}
                            <strong className="text-slate-900">
                              ₹ {totals.vendorCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </strong>
                          </span>
                          <span>
                            Addnl:{" "}
                            <strong className="text-slate-900">
                              ₹ {totals.additionalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </strong>
                          </span>
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-bold">
                            ₹ {totals.totalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BOTTOM SUMMARY & ACTIONS */}
      <div className="p-5 border-t border-slate-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Summary
            </div>
            <div className="text-xs font-medium text-slate-700 mt-0.5 space-x-2">
              <span>Request ID: <strong className="text-slate-900">{transportRequestId || "N/A"}</strong></span>
              <span>•</span>
              <span>Total Vehicles: <strong className="text-blue-600">{nestedVehicles.length}</strong></span>
              <span>•</span>
              <span>Total Containers: <strong className="text-blue-600">{totalContainersCount}</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 text-right">
                Total Vendor Charges
              </div>
              <div className="text-sm font-bold text-blue-600 text-right">
                ₹ {grandVendorCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 text-right">
                Total Additional Charges
              </div>
              <div className="text-sm font-bold text-blue-600 text-right">
                ₹ {grandAdditionalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow-xs text-right">
              <div className="text-[10px] font-semibold uppercase text-blue-100">
                Grand Total Amount
              </div>
              <div className="text-lg font-black tracking-tight">
                ₹ {grandTotalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-slate-200/80">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSubmitting}
            className={`px-6 py-2.5 rounded-lg text-white font-semibold text-xs transition-all shadow-sm flex items-center space-x-2 ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/20"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                <span>Saving Details...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save All Transporter Details</span>
              </>
            )}
          </button>
        </div>
      </div>

      <ModalChecklist
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerify={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default TransporterDetails;
