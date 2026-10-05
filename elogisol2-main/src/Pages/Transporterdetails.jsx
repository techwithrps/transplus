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
  Save,
  Phone,
} from "lucide-react";

// Compact Branded Truck Illustration
const BrandedTruckIllustration = ({ color = "#1e40af", vendor = "CARAVAN" }) => {
  const isRed =
    color?.toLowerCase().includes("dc2626") ||
    vendor?.toUpperCase().includes("SANGAM") ||
    vendor?.toUpperCase().includes("DEV");
  const trailerColor = isRed ? "#b91c1c" : "#1e40af";
  const cabColor = isRed ? "#f87171" : "#60a5fa";

  return (
    <div className="relative flex items-center justify-center select-none shrink-0">
      <svg
        viewBox="0 0 140 46"
        className="w-20 h-7 drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 32H15V15C15 13.5 16.5 12 18 12H30V32H35"
          stroke="#334155"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 16L21 12H32V32H15V16Z"
          fill={cabColor}
          stroke="#1e293b"
          strokeWidth="1.2"
        />
        <path
          d="M17 17L21 14H28V22H17V17Z"
          fill="#e2e8f0"
          stroke="#0f172a"
          strokeWidth="0.8"
        />
        <rect x="3" y="30" width="8" height="4" rx="1.5" fill="#64748b" />
        <rect x="32" y="27" width="9" height="5" fill="#475569" />
        <rect
          x="40"
          y="4"
          width="96"
          height="28"
          rx="2.5"
          fill={trailerColor}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        <line x1="48" y1="4" x2="48" y2="32" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
        <line x1="58" y1="4" x2="58" y2="32" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
        <line x1="68" y1="4" x2="68" y2="32" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
        <line x1="78" y1="4" x2="78" y2="32" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
        <line x1="88" y1="4" x2="88" y2="32" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
        <line x1="98" y1="4" x2="98" y2="32" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
        <line x1="108" y1="4" x2="108" y2="32" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
        <line x1="118" y1="4" x2="118" y2="32" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
        <line x1="128" y1="4" x2="128" y2="32" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
        <text
          x="88"
          y="21"
          fill="#ffffff"
          fontSize="11"
          fontWeight="900"
          fontStyle="italic"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
          letterSpacing="0.4"
        >
          Transplus
        </text>
        <line x1="44" y1="33" x2="132" y2="33" stroke="#334155" strokeWidth="2.5" />
        <circle cx="18" cy="35" r="5.5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="18" cy="35" r="2" fill="#cbd5e1" />
        <circle cx="106" cy="35" r="5.5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="106" cy="35" r="2" fill="#cbd5e1" />
        <circle cx="122" cy="35" r="5.5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="122" cy="35" r="2" fill="#cbd5e1" />
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

  const toggleVehicleExpand = (vIdx) => {
    setNestedVehicles((prev) =>
      prev.map((v, idx) => (idx === vIdx ? { ...v, isExpanded: !v.isExpanded } : v))
    );
  };

  const handleAddVehicle = () => {
    const nextIdx = nestedVehicles.length + 1;
    setNestedVehicles((prev) => [...prev, createDefaultVehicle(nextIdx)]);
    toast.success(`Vehicle #${nextIdx} added`);
  };

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

  // Calculations
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
      <div className="bg-white rounded-xl border border-slate-200 mt-6 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium mt-3">Loading Transporter Details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 mt-6 overflow-hidden shadow-xs">
      {/* HEADER BAR */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Transporter Details
          </h3>
          {transportRequestId && (
            <p className="text-[11px] font-semibold text-slate-500">
              Request ID: <span className="text-slate-800 font-bold">{transportRequestId}</span>
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleAddVehicle}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>

          <button
            type="button"
            onClick={() => handleRemoveVehicle()}
            disabled={nestedVehicles.length <= 1}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              nestedVehicles.length <= 1
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Vehicle</span>
          </button>
        </div>
      </div>

      {/* NESTED VEHICLES LIST */}
      <div className="p-4 space-y-3 bg-slate-50/40">
        {nestedVehicles.map((vehicle, vIdx) => {
          const totals = calculateVehicleTotals(vehicle);

          return (
            <div
              key={vehicle.id || `v-${vIdx}`}
              className="bg-white border border-slate-200 rounded-xl shadow-xs transition-all hover:border-slate-300 overflow-hidden"
            >
              {/* VEHICLE HEADER CARD - CLEAN 2-ROW RESPONSIVE LAYOUT */}
              <div
                onClick={() => toggleVehicleExpand(vIdx)}
                className={`p-3.5 cursor-pointer select-none transition-colors ${
                  vehicle.isExpanded ? "bg-slate-50/90 border-b border-slate-200" : "hover:bg-slate-50/50"
                }`}
              >
                {/* ROW 1: Identifier + Rollup charges + Chevron */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {/* Left: Badge + Truck + Vehicle Number + Vendor */}
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                      {vIdx + 1}
                    </div>

                    <BrandedTruckIllustration
                      color={vehicle.vendorColor}
                      vendor={vehicle.vendorName}
                    />

                    {/* Vehicle Number Input */}
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">No:</span>
                      <input
                        type="text"
                        value={vehicle.vehicleNumber}
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

                    {/* Vendor Input */}
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Vendor:</span>
                      <input
                        type="text"
                        value={vehicle.vendorName}
                        onChange={(e) =>
                          handleUpdateVehicleField(vIdx, "vendorName", e.target.value)
                        }
                        placeholder="Vendor Name"
                        className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-0.5 w-32 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Right: Rollup Charges Pills + Toggle */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium mr-1.5">Vendor:</span>
                      <span className="text-xs font-bold text-slate-800">
                        ₹{totals.vendorCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium mr-1.5">Total:</span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        ₹{totals.totalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="text-slate-400 hover:text-slate-600 ml-1">
                      {vehicle.isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* ROW 2: Driver Info Subline */}
                <div
                  className="mt-2 pt-2 border-t border-slate-200/60 flex items-center space-x-4 text-xs text-slate-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Driver:</span>
                    <input
                      type="text"
                      value={vehicle.driverName}
                      onChange={(e) =>
                        handleUpdateVehicleField(vIdx, "driverName", e.target.value)
                      }
                      placeholder="Driver Name"
                      className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded px-1.5 py-0.5 w-28 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Contact:</span>
                    <input
                      type="text"
                      value={vehicle.driverContact}
                      onChange={(e) =>
                        handleUpdateVehicleField(vIdx, "driverContact", e.target.value)
                      }
                      placeholder="0000000000"
                      className="text-xs font-normal text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-0.5 w-28 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* EXPANDED CONTAINER TREE SECTION */}
              {vehicle.isExpanded && (
                <div className="p-3.5 bg-slate-50/70 border-t border-slate-100">
                  <div className="relative pl-4">
                    {/* Visual Tree Connector Line */}
                    <div className="absolute left-1.5 top-0 bottom-4 w-0.5 bg-blue-300" />

                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-bold text-slate-800 text-xs">
                          Containers ({vehicle.containers.length})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddContainer(vIdx)}
                        className="flex items-center space-x-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Container</span>
                      </button>
                    </div>

                    {/* Compact Container Table - Perfectly aligned */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[9px]">
                            <th className="py-1.5 px-2 w-7 text-center">#</th>
                            <th className="py-1.5 px-2 min-w-[120px]">Container No</th>
                            <th className="py-1.5 px-1.5 w-16">Size</th>
                            <th className="py-1.5 px-2 min-w-[100px]">Line</th>
                            <th className="py-1.5 px-2 min-w-[90px]">Seal No</th>
                            <th className="py-1.5 px-2 min-w-[90px] text-right">Vendor (₹)</th>
                            <th className="py-1.5 px-2 min-w-[80px] text-right">Addnl (₹)</th>
                            <th className="py-1.5 px-2 min-w-[90px] text-right">Total (₹)</th>
                            <th className="py-1.5 px-1.5 w-8 text-center">Del</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {vehicle.containers.map((container, cIdx) => {
                            const cTotal =
                              (parseFloat(container.vendorCharges) || 0) +
                              (parseFloat(container.additionalCharges) || 0);

                            return (
                              <tr key={container.clientId || `c-${cIdx}`} className="hover:bg-blue-50/20">
                                <td className="py-1.5 px-2 text-center font-bold text-slate-500">
                                  {cIdx + 1}
                                </td>

                                <td className="py-1.5 px-2">
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
                                    className="w-full font-bold text-blue-600 bg-blue-50/80 border border-blue-200 rounded px-1.5 py-0.5 text-[11px] focus:ring-1 focus:ring-blue-500 focus:outline-none uppercase"
                                    placeholder="MSKU1234567"
                                  />
                                </td>

                                <td className="py-1.5 px-1.5">
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
                                    className="font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded px-1 py-0.5 text-[10px] focus:outline-none w-14"
                                  >
                                    <option value="20ft">20ft</option>
                                    <option value="40ft">40ft</option>
                                  </select>
                                </td>

                                <td className="py-1.5 px-2">
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
                                    className="w-full font-semibold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
                                    placeholder="DP WORLD"
                                  />
                                </td>

                                <td className="py-1.5 px-2">
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
                                    className="w-full font-medium text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
                                    placeholder="SL1234"
                                  />
                                </td>

                                <td className="py-1.5 px-2 text-right">
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
                                    className="w-20 font-semibold text-slate-800 bg-white border border-slate-200 rounded px-1 py-0.5 text-[11px] text-right focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    min="0"
                                  />
                                </td>

                                <td className="py-1.5 px-2 text-right">
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
                                    className="w-16 font-semibold text-slate-800 bg-white border border-slate-200 rounded px-1 py-0.5 text-[11px] text-right focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    min="0"
                                  />
                                </td>

                                <td className="py-1.5 px-2 text-right">
                                  <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[11px]">
                                    ₹{cTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </span>
                                </td>

                                <td className="py-1.5 px-1.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteContainer(vIdx, cIdx)}
                                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
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

                      {/* Vehicle Subtotal Footer Bar */}
                      <div className="bg-slate-100/80 border-t border-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-500 uppercase tracking-wider text-[9px]">
                          Vehicle Total ({vehicle.containers.length} Container{vehicle.containers.length > 1 ? "s" : ""})
                        </span>
                        <div className="flex items-center space-x-4 text-slate-800">
                          <span>
                            Vendor:{" "}
                            <strong className="text-slate-900 font-bold">
                              ₹{totals.vendorCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </strong>
                          </span>
                          <span>
                            Addnl:{" "}
                            <strong className="text-slate-900 font-bold">
                              ₹{totals.additionalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </strong>
                          </span>
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-bold text-[11px]">
                            ₹{totals.totalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
      <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-blue-50/40 to-indigo-50/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Summary
            </div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5 space-x-2">
              <span>Request ID: <strong className="text-slate-900">{transportRequestId || "N/A"}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Total Vehicles: <strong className="text-blue-600">{nestedVehicles.length}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Total Containers: <strong className="text-blue-600">{totalContainersCount}</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-4 flex-wrap gap-y-2">
            <div className="text-right">
              <div className="text-[9px] uppercase font-bold text-slate-400">
                Total Vendor Charges
              </div>
              <div className="text-xs font-bold text-blue-600">
                ₹{grandVendorCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[9px] uppercase font-bold text-slate-400">
                Total Additional Charges
              </div>
              <div className="text-xs font-bold text-blue-600">
                ₹{grandAdditionalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-xs text-right">
              <div className="text-[9px] font-semibold uppercase text-blue-100">
                Grand Total Amount
              </div>
              <div className="text-base font-black tracking-tight">
                ₹{grandTotalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg text-white font-semibold text-xs transition-all shadow-xs flex items-center space-x-1.5 ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white mr-1.5" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Transporter Details</span>
                </>
              )}
            </button>
          </div>
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
