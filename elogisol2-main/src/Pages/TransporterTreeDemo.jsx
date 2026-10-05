import React, { useState } from "react";
import {
  Truck as TruckIcon,
  Package,
  Layers,
  FileText,
  LogOut,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// Reusable Truck Vector Component with "Transplus" Branding
const BrandedTruckIllustration = ({ color = "#1e40af", vendor = "CARAVAN" }) => {
  const isRed = color.toLowerCase().includes("dc2626") || vendor.toUpperCase().includes("SANGAM");
  const trailerColor = isRed ? "#b91c1c" : "#1e40af";
  const cabColor = isRed ? "#f87171" : "#60a5fa";

  return (
    <div className="relative flex items-center justify-center select-none">
      <svg
        viewBox="0 0 160 56"
        className="w-28 h-10 drop-shadow-sm transition-transform duration-200 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cab Front / Hood */}
        <path
          d="M6 38H18V18C18 16.5 19.5 15 21 15H36V38H42"
          stroke="#334155"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Cab Body */}
        <path
          d="M18 20L25 15H38V38H18V20Z"
          fill={cabColor}
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        {/* Windshield */}
        <path
          d="M20 21L25 17H34V26H20V21Z"
          fill="#e2e8f0"
          stroke="#0f172a"
          strokeWidth="1"
        />
        {/* Bumper */}
        <rect x="4" y="36" width="10" height="5" rx="2" fill="#64748b" />

        {/* Chassis Connector */}
        <rect x="38" y="32" width="12" height="6" fill="#475569" />

        {/* Container Trailer Box */}
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

        {/* Container Corrugated Lines */}
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

        {/* Transplus Brand Text on Trailer */}
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

        {/* Trailer Undercarriage Bars */}
        <line x1="52" y1="41" x2="148" y2="41" stroke="#334155" strokeWidth="3" />

        {/* Wheels */}
        {/* Front Cab Wheel */}
        <circle cx="22" cy="42" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
        <circle cx="22" cy="42" r="3" fill="#cbd5e1" />

        {/* Trailer Wheels (Rear Dual Axle) */}
        <circle cx="120" cy="42" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
        <circle cx="120" cy="42" r="3" fill="#cbd5e1" />

        <circle cx="138" cy="42" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
        <circle cx="138" cy="42" r="3" fill="#cbd5e1" />
      </svg>
    </div>
  );
};

// Reusable Mini Container Illustration with Transplus branding
const BrandedContainerIllustration = ({ color = "#1e40af", size = "20ft" }) => {
  const isRed = color.toLowerCase().includes("dc2626") || color.toLowerCase().includes("red");
  const boxColor = isRed ? "#b91c1c" : "#1e40af";

  return (
    <div className="relative flex items-center justify-center select-none">
      <svg
        viewBox="0 0 110 42"
        className="w-20 h-8 drop-shadow-sm"
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
        {/* Corrugated Stripes */}
        <line x1="12" y1="3" x2="12" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="22" y1="3" x2="22" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="32" y1="3" x2="32" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="42" y1="3" x2="42" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="52" y1="3" x2="52" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="62" y1="3" x2="62" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="72" y1="3" x2="72" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="82" y1="3" x2="82" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="92" y1="3" x2="92" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="100" y1="3" x2="100" y2="39" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />

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

const initialSampleVehicles = [
  {
    id: 1,
    vehicleIndex: 1,
    vehicleNumber: "HR55BC1677",
    driverName: "SUNIL",
    driverContact: "0000000000",
    vendorName: "CARAVAN",
    vendorColor: "#1e40af",
    isExpanded: true,
    containers: [
      {
        id: "c-101",
        containerNumber: "ESDU3322147",
        size: "20ft",
        line: "DP WORLD",
        sealNumber: "SL1234",
        vendorCharges: 4250,
        additionalCharges: 0,
      },
      {
        id: "c-102",
        containerNumber: "ESDU2284720",
        size: "20ft",
        line: "DP WORLD",
        sealNumber: "SL5678",
        vendorCharges: 4250,
        additionalCharges: 0,
      },
    ],
  },
  {
    id: 2,
    vehicleIndex: 2,
    vehicleNumber: "HR38AH2077",
    driverName: "SUNIL",
    driverContact: "0000000000",
    vendorName: "CARAVAN",
    vendorColor: "#1e40af",
    isExpanded: false,
    containers: [
      {
        id: "c-201",
        containerNumber: "ESDU1395231",
        size: "20ft",
        line: "DP WORLD",
        sealNumber: "SL9101",
        vendorCharges: 8500,
        additionalCharges: 0,
      },
    ],
  },
  {
    id: 3,
    vehicleIndex: 3,
    vehicleNumber: "HR55BC9477",
    driverName: "SUNIL",
    driverContact: "0000000000",
    vendorName: "CARAVAN",
    vendorColor: "#1e40af",
    isExpanded: false,
    containers: [
      {
        id: "c-301",
        containerNumber: "ESDU2213476",
        size: "20ft",
        line: "DP WORLD",
        sealNumber: "SL3141",
        vendorCharges: 8500,
        additionalCharges: 0,
      },
    ],
  },
  {
    id: 4,
    vehicleIndex: 4,
    vehicleNumber: "NL01AL0799",
    driverName: "SUNIL",
    driverContact: "0000000000",
    vendorName: "SANGAM",
    vendorColor: "#dc2626",
    isExpanded: true,
    containers: [
      {
        id: "c-401",
        containerNumber: "TCKU9558545",
        size: "40ft",
        line: "DP WORLD",
        sealNumber: "SL7181",
        vendorCharges: 9500,
        additionalCharges: 0,
      },
    ],
  },
  {
    id: 5,
    vehicleIndex: 5,
    vehicleNumber: "HR38AA5887",
    driverName: "SUNIL",
    driverContact: "0000000000",
    vendorName: "SANGAM",
    vendorColor: "#dc2626",
    isExpanded: false,
    containers: [
      {
        id: "c-501",
        containerNumber: "LMCU9136374",
        size: "40ft",
        line: "DP WORLD",
        sealNumber: "SL9202",
        vendorCharges: 9500,
        additionalCharges: 0,
      },
    ],
  },
];

export default function TransporterTreeDemo() {
  const [vehicles, setVehicles] = useState(initialSampleVehicles);
  const [requestId] = useState("1309");

  // Toggle expand/collapse of vehicle card
  const toggleVehicleExpand = (vehicleId) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId ? { ...v, isExpanded: !v.isExpanded } : v
      )
    );
  };

  // Add new vehicle dynamically
  const handleAddVehicle = () => {
    const nextIndex = vehicles.length + 1;
    const newVehicle = {
      id: Date.now(),
      vehicleIndex: nextIndex,
      vehicleNumber: `NEW_TRUCK_${nextIndex}`,
      driverName: "NEW DRIVER",
      driverContact: "0000000000",
      vendorName: "CARAVAN",
      vendorColor: "#1e40af",
      isExpanded: true,
      containers: [
        {
          id: `c-new-${Date.now()}`,
          containerNumber: `NEWU${Math.floor(1000000 + Math.random() * 9000000)}`,
          size: "20ft",
          line: "DP WORLD",
          sealNumber: `SL${Math.floor(1000 + Math.random() * 9000)}`,
          vendorCharges: 8500,
          additionalCharges: 0,
        },
      ],
    };
    setVehicles((prev) => [...prev, newVehicle]);
  };

  // Remove last or selected vehicle
  const handleRemoveVehicle = (vehicleId) => {
    if (vehicles.length <= 1) {
      alert("At least 1 vehicle is required.");
      return;
    }
    const targetId = vehicleId || vehicles[vehicles.length - 1].id;
    setVehicles((prev) => {
      const filtered = prev.filter((v) => v.id !== targetId);
      // Re-index remaining vehicles
      return filtered.map((v, i) => ({ ...v, vehicleIndex: i + 1 }));
    });
  };

  // Add container to a specific vehicle
  const handleAddContainer = (vehicleId) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          const newContainer = {
            id: `c-${Date.now()}-${Math.random()}`,
            containerNumber: `CONT${Math.floor(1000000 + Math.random() * 9000000)}`,
            size: "20ft",
            line: "DP WORLD",
            sealNumber: `SL${Math.floor(1000 + Math.random() * 9000)}`,
            vendorCharges: 4250,
            additionalCharges: 0,
          };
          return {
            ...v,
            isExpanded: true,
            containers: [...v.containers, newContainer],
          };
        }
        return v;
      })
    );
  };

  // Delete container from a specific vehicle
  const handleDeleteContainer = (vehicleId, containerId) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          if (v.containers.length <= 1) {
            alert("At least 1 container is required per vehicle (or remove the vehicle).");
            return v;
          }
          return {
            ...v,
            containers: v.containers.filter((c) => c.id !== containerId),
          };
        }
        return v;
      })
    );
  };

  // Update container field (vendorCharges, additionalCharges, containerNumber, etc.)
  const handleUpdateContainerField = (vehicleId, containerId, field, value) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            containers: v.containers.map((c) => {
              if (c.id === containerId) {
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

  // Helper calculations
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

  // Grand summary calculations
  const totalVehiclesCount = vehicles.length;
  const totalContainersCount = vehicles.reduce(
    (sum, v) => sum + v.containers.length,
    0
  );
  const grandVendorCharges = vehicles.reduce((sum, v) => {
    const totals = calculateVehicleTotals(v);
    return sum + totals.vendorCharges;
  }, 0);
  const grandAdditionalCharges = vehicles.reduce((sum, v) => {
    const totals = calculateVehicleTotals(v);
    return sum + totals.additionalCharges;
  }, 0);
  const grandTotalAmount = grandVendorCharges + grandAdditionalCharges;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 antialiased">
      {/* LEFT SIDEBAR - Dark Navy */}
      <aside className="w-64 bg-[#0a192f] text-slate-300 flex flex-col justify-between hidden md:flex shrink-0 shadow-xl border-r border-slate-800">
        <div>
          {/* Header Brand */}
          <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TruckIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">
                Fleet Customer
              </h2>
              <span className="text-xs text-slate-400">Customer Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            <button className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg bg-emerald-600 text-white font-medium shadow-md shadow-emerald-900/30 transition-all text-sm">
              <Layers className="w-4 h-4" />
              <div className="text-left">
                <div className="leading-tight">Dashboard</div>
                <div className="text-[11px] text-emerald-100/70 font-normal">
                  Overview & Summary
                </div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium transition-all text-sm">
              <TruckIcon className="w-4 h-4" />
              <div className="text-left">
                <div className="leading-tight">My Shipments</div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Track Deliveries
                </div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium transition-all text-sm">
              <Package className="w-4 h-4" />
              <div className="text-left">
                <div className="leading-tight">Vendor Management</div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Manage Vendors
                </div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium transition-all text-sm">
              <FileText className="w-4 h-4" />
              <div className="text-left">
                <div className="leading-tight">Reports</div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Account Configuration
                </div>
              </div>
            </button>
          </nav>
        </div>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center space-x-2 text-rose-400 hover:text-rose-300 font-medium text-sm transition-colors w-full px-3 py-2 rounded-lg hover:bg-rose-950/20">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 pb-28">
        {/* TOP BAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Transporter Details
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Request ID: <span className="text-slate-800 font-semibold">{requestId}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddVehicle}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>

            <button
              onClick={() => handleRemoveVehicle()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Vehicle</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY - VEHICLE LIST */}
        <div className="p-6 max-w-7xl mx-auto w-full space-y-4">
          {vehicles.map((vehicle) => {
            const totals = calculateVehicleTotals(vehicle);

            return (
              <div
                key={vehicle.id}
                className="bg-white border border-slate-200 rounded-xl shadow-xs transition-all duration-200 hover:border-slate-300 overflow-hidden"
              >
                {/* VEHICLE HEADER CARD */}
                <div
                  onClick={() => toggleVehicleExpand(vehicle.id)}
                  className={`p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                    vehicle.isExpanded ? "bg-slate-50/80 border-b border-slate-200" : "hover:bg-slate-50/50"
                  }`}
                >
                  {/* Left: Badge + Truck + Vehicle Number */}
                  <div className="flex items-center space-x-4">
                    {/* Index Badge */}
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200 shadow-xs">
                      {vehicle.vehicleIndex}
                    </div>

                    {/* Truck Graphic */}
                    <BrandedTruckIllustration
                      color={vehicle.vendorColor}
                      vendor={vehicle.vendorName}
                    />

                    {/* Vehicle Number Pill */}
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Vehicle Number
                      </div>
                      <div className="text-sm font-bold text-blue-600 tracking-wide bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                        {vehicle.vehicleNumber}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Driver Info */}
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-blue-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Driver
                      </div>
                      <div className="text-sm font-semibold text-slate-800">
                        {vehicle.driverName}{" "}
                        <span className="text-xs text-slate-400 font-normal">
                          ({vehicle.driverContact})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Info */}
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Vendor
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {vehicle.vendorName}
                      </div>
                    </div>
                  </div>

                  {/* Right: Rollup Charges + Chevron */}
                  <div className="flex items-center space-x-6">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">
                        Vendor Charges
                      </div>
                      <div className="text-sm font-bold text-slate-800 text-right">
                        ₹ {totals.vendorCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">
                        Additional Charges
                      </div>
                      <div className="text-sm font-bold text-slate-800 text-right">
                        ₹ {totals.additionalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">
                        Total Charges
                      </div>
                      <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-200 text-right">
                        ₹ {totals.totalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="text-slate-400 hover:text-slate-600 transition-transform">
                      {vehicle.isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* EXPANDED NESTED CONTAINERS TREE */}
                {vehicle.isExpanded && (
                  <div className="p-5 bg-slate-50/50">
                    <div className="relative pl-6">
                      {/* Visual Tree Connector Line (Vertical) */}
                      <div className="absolute left-2 top-0 bottom-6 w-0.5 bg-blue-300" />

                      {/* Header for Containers */}
                      <div className="flex items-center justify-between mb-3 relative">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-slate-800 text-sm">
                            Containers ({vehicle.containers.length})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddContainer(vehicle.id)}
                          className="flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Container</span>
                        </button>
                      </div>

                      {/* Container Table/Card */}
                      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                              <th className="py-2.5 px-3 w-12 text-center">#</th>
                              <th className="py-2.5 px-3 w-28 text-center">Preview</th>
                              <th className="py-2.5 px-3 min-w-[140px]">Container Number</th>
                              <th className="py-2.5 px-3 w-20">Size</th>
                              <th className="py-2.5 px-3 min-w-[120px]">Line</th>
                              <th className="py-2.5 px-3 min-w-[110px]">Seal Number</th>
                              <th className="py-2.5 px-3 min-w-[120px]">Vendor Charges (₹)</th>
                              <th className="py-2.5 px-3 min-w-[120px]">Additional Charges (₹)</th>
                              <th className="py-2.5 px-3 min-w-[120px]">Total Charges (₹)</th>
                              <th className="py-2.5 px-3 w-12 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {vehicle.containers.map((container, cIdx) => {
                              const cTotal =
                                (parseFloat(container.vendorCharges) || 0) +
                                (parseFloat(container.additionalCharges) || 0);

                              return (
                                <tr
                                  key={container.id}
                                  className="hover:bg-blue-50/40 transition-colors group"
                                >
                                  {/* # Index */}
                                  <td className="py-3 px-3 text-center font-bold text-slate-600">
                                    <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-slate-100 text-blue-600 border border-slate-200">
                                      {cIdx + 1}
                                    </span>
                                  </td>

                                  {/* Container Illustration */}
                                  <td className="py-3 px-3 text-center">
                                    <BrandedContainerIllustration
                                      color={vehicle.vendorColor}
                                      size={container.size}
                                    />
                                  </td>

                                  {/* Container Number */}
                                  <td className="py-3 px-3">
                                    <input
                                      type="text"
                                      value={container.containerNumber}
                                      onChange={(e) =>
                                        handleUpdateContainerField(
                                          vehicle.id,
                                          container.id,
                                          "containerNumber",
                                          e.target.value.toUpperCase()
                                        )
                                      }
                                      className="w-full font-bold text-blue-600 bg-blue-50/70 border border-blue-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                      placeholder="MSKU1234567"
                                    />
                                  </td>

                                  {/* Size */}
                                  <td className="py-3 px-3">
                                    <span className="px-2 py-0.5 rounded font-bold text-slate-700 bg-slate-100 border border-slate-200">
                                      {container.size}
                                    </span>
                                  </td>

                                  {/* Line */}
                                  <td className="py-3 px-3">
                                    <span className="font-semibold text-slate-700">
                                      {container.line}
                                    </span>
                                  </td>

                                  {/* Seal Number */}
                                  <td className="py-3 px-3">
                                    <input
                                      type="text"
                                      value={container.sealNumber}
                                      onChange={(e) =>
                                        handleUpdateContainerField(
                                          vehicle.id,
                                          container.id,
                                          "sealNumber",
                                          e.target.value
                                        )
                                      }
                                      className="w-full font-medium text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                      placeholder="SL1234"
                                    />
                                  </td>

                                  {/* Vendor Charges */}
                                  <td className="py-3 px-3">
                                    <input
                                      type="number"
                                      value={container.vendorCharges}
                                      onChange={(e) =>
                                        handleUpdateContainerField(
                                          vehicle.id,
                                          container.id,
                                          "vendorCharges",
                                          e.target.value
                                        )
                                      }
                                      className="w-full font-semibold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-right"
                                      min="0"
                                      step="100"
                                    />
                                  </td>

                                  {/* Additional Charges */}
                                  <td className="py-3 px-3">
                                    <input
                                      type="number"
                                      value={container.additionalCharges}
                                      onChange={(e) =>
                                        handleUpdateContainerField(
                                          vehicle.id,
                                          container.id,
                                          "additionalCharges",
                                          e.target.value
                                        )
                                      }
                                      className="w-full font-semibold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-right"
                                      min="0"
                                      step="50"
                                    />
                                  </td>

                                  {/* Total Charges (Auto-calculated) */}
                                  <td className="py-3 px-3">
                                    <div className="font-bold text-blue-600 bg-blue-50/80 border border-blue-200 rounded px-2.5 py-1 text-xs text-right">
                                      ₹ {cTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </div>
                                  </td>

                                  {/* Delete Button */}
                                  <td className="py-3 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteContainer(vehicle.id, container.id)
                                      }
                                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                                      title="Delete Container"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Vehicle Subtotal Bar */}
                        <div className="bg-slate-100/70 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-600 uppercase tracking-wider">
                            Vehicle Total ({vehicle.containers.length} Container{vehicle.containers.length > 1 ? "s" : ""})
                          </span>
                          <div className="flex items-center space-x-6 text-slate-800">
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
                            <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded font-bold">
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

        {/* BOTTOM FIXED SUMMARY BAR */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-slate-200 shadow-2xl px-6 py-4 z-30">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            {/* Left: Metadata */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Summary
              </div>
              <div className="text-sm text-slate-700 font-medium mt-0.5">
                Request ID: <strong className="text-slate-900">{requestId}</strong>
                <span className="mx-2 text-slate-300">|</span>
                Total Vehicles: <strong className="text-blue-600">{totalVehiclesCount}</strong>
                <span className="mx-2 text-slate-300">|</span>
                Total Containers: <strong className="text-blue-600">{totalContainersCount}</strong>
              </div>
            </div>

            {/* Right: Rollup & Grand Total */}
            <div className="flex items-center space-x-6">
              <div>
                <div className="text-xs text-slate-400 font-medium text-right">
                  Total Vendor Charges
                </div>
                <div className="text-base font-bold text-blue-600 text-right">
                  ₹ {grandVendorCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-medium text-right">
                  Total Additional Charges
                </div>
                <div className="text-base font-bold text-blue-600 text-right">
                  ₹ {grandAdditionalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Large Grand Total Pill */}
              <div className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl shadow-md transition-all flex flex-col items-end">
                <div className="text-[11px] font-medium uppercase tracking-wider text-blue-100">
                  Grand Total Amount
                </div>
                <div className="text-xl font-extrabold tracking-tight">
                  ₹ {grandTotalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
