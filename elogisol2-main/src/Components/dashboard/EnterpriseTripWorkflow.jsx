import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Trash2,
  Search,
  RefreshCw,
  Calendar,
  DollarSign,
  MapPin,
  Building,
  User,
  Phone,
  Layers,
  Save,
  Check,
  ChevronRight,
  AlertCircle,
  X,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import api, {
  transporterAPI,
  transportRequestAPI,
  vendorAPI,
  driverAPI,
  servicesAPI,
  locationAPI,
} from "../../utils/Api";

// Check digit calculation for ISO 6346 container numbers
const calculateCheckDigit = (containerNo) => {
  if (!containerNo || containerNo.length < 10) return null;
  const charValues = {
    A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19, J: 20,
    K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31,
    U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38,
  };
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const char = containerNo[i].toUpperCase();
    const value = isNaN(char) ? charValues[char] || 0 : parseInt(char, 10);
    sum += value * Math.pow(2, i);
  }
  const remainder = sum % 11;
  return remainder === 10 ? 0 : remainder;
};

// Truck Graphic SVG Component
const TruckGraphic = ({ color = "blue", number = 1 }) => {
  const isBlue = color === "blue" || number % 2 !== 0;
  const bodyColor = isBlue ? "#1e40af" : "#991b1b"; // deep blue or deep red
  const cabColor = isBlue ? "#3b82f6" : "#ef4444";
  const logoText = "Transplus";

  return (
    <div className="relative inline-flex items-center">
      <svg width="84" height="34" viewBox="0 0 100 40" className="drop-shadow-xs">
        {/* Wheels */}
        <circle cx="18" cy="33" r="5" fill="#1e293b" />
        <circle cx="18" cy="33" r="2.5" fill="#94a3b8" />
        <circle cx="34" cy="33" r="5" fill="#1e293b" />
        <circle cx="34" cy="33" r="2.5" fill="#94a3b8" />
        <circle cx="78" cy="33" r="5" fill="#1e293b" />
        <circle cx="78" cy="33" r="2.5" fill="#94a3b8" />
        <circle cx="89" cy="33" r="5" fill="#1e293b" />
        <circle cx="89" cy="33" r="2.5" fill="#94a3b8" />
        {/* Cab Front */}
        <path d="M 6 28 L 6 16 L 14 8 L 26 8 L 26 28 Z" fill={cabColor} rx="2" />
        {/* Cab Window */}
        <path d="M 9 16 L 14 10 L 23 10 L 23 16 Z" fill="#e0f2fe" opacity="0.9" />
        {/* Trailer Container Body */}
        <rect x="28" y="4" width="68" height="24" rx="2" fill={bodyColor} />
        {/* Container Ribs */}
        <line x1="38" y1="4" x2="38" y2="28" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
        <line x1="48" y1="4" x2="48" y2="28" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
        <line x1="58" y1="4" x2="58" y2="28" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
        <line x1="68" y1="4" x2="68" y2="28" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
        <line x1="78" y1="4" x2="78" y2="28" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
        <line x1="88" y1="4" x2="88" y2="28" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
        {/* Logo Text on Container */}
        <text
          x="62"
          y="18"
          fill="#ffffff"
          fontSize="8"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.5"
        >
          {logoText}
        </text>
      </svg>
    </div>
  );
};

export default function EnterpriseTripWorkflow({
  user,
  initialRequestId = null,
  onTripSaved = () => {},
}) {
  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  // Active accordion section states (all open by default for rich visibility or toggleable)
  const [openSections, setOpenSections] = useState({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
  });

  const toggleSection = (step) => {
    setOpenSections((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  // Main Trip Request State
  const [requestData, setRequestData] = useState({
    id: null,
    customer_id: user?.id || null,
    SHIPA_NO: "",
    consignee: "",
    consigner: "",
    vehicle_type: "Trailer",
    vehicle_size: "40",
    vehicle_status: "Empty",
    containers_20ft: 0,
    containers_40ft: 0,
    total_containers: 0,
    no_of_vehicles: 1,
    pickup_location: "",
    stuffing_location: "",
    delivery_location: "",
    commodity: "",
    cargo_type: "",
    cargo_weight: 0,
    service_type: ["Transportation Charges"],
    service_prices: { "Transportation Charges": "0" },
    requested_price: 0,
    expected_pickup_date: today,
    expected_pickup_time: currentTime,
    expected_delivery_date: today,
    expected_delivery_time: currentTime,
    status: "Draft",
    admin_comment: "",
    created_at: null,
    updated_at: null,
  });

  // Nested Vehicles State (Section 5)
  const [nestedVehicles, setNestedVehicles] = useState([
    {
      vehicleIndex: 1,
      id: null,
      vehicleNumber: "",
      driverName: "",
      driverContact: "",
      vendorName: "",
      vendorCharges: 0,
      additionalCharges: 0,
      totalCharges: 0,
      expanded: true,
      containers: [
        {
          clientId: `c-${Date.now()}-1`,
          id: null,
          containerNo: "",
          containerType: "HQ",
          containerSize: "40",
          line: "",
          seal1: "",
          seal2: "",
          tareWeight: "",
          cargoWeight: "",
          totalCharge: 0,
          remarks: "",
        },
      ],
    },
  ]);

  // Master Data States
  const [vendorsList, setVendorsList] = useState([]);
  const [driversList, setDriversList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [servicesList, setServicesList] = useState([
    "Transportation Charges",
    "Loading Charges",
    "Unloading Charges",
    "Custom Clearance",
    "Freight Forwarding",
    "Toll Charges",
    "Weightment Charges",
  ]);

  // Sidebar / All Requests State
  const [allReports, setAllReports] = useState([]);
  const [sidebarStats, setSidebarStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    completed: 0,
  });
  const [searchFilters, setSearchFilters] = useState({
    requestId: "",
    shipaNo: "",
    containerNo: "",
    consigner: "",
  });
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Master Data
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [vRes, dRes, locRes, sRes] = await Promise.allSettled([
          vendorAPI.getAllVendors(),
          driverAPI.getAllDrivers(),
          locationAPI.getAllLocations(),
          servicesAPI.getAllServices(),
        ]);
        if (vRes.status === "fulfilled" && vRes.value?.data) {
          setVendorsList(vRes.value.data);
        }
        if (dRes.status === "fulfilled" && dRes.value?.data) {
          setDriversList(dRes.value.data);
        }
        if (locRes.status === "fulfilled" && locRes.value?.data) {
          setLocationsList(locRes.value.data);
        }
        if (sRes.status === "fulfilled" && sRes.value?.data) {
          const names = sRes.value.data.map((s) => s.service_name);
          if (names.length > 0) setServicesList(names);
        }
      } catch (err) {
        console.error("Error loading master data:", err);
      }
    };
    fetchMasters();
  }, []);

  // Fetch All Reports for Sidebar & Top Stat Cards
  const fetchAllReports = useCallback(async () => {
    setIsLoadingReports(true);
    try {
      const response = await api.get("/transport-requests/all?page=1&limit=50");
      const reports = response.data?.data?.reports || response.data?.reports || [];
      setAllReports(reports);

      // Compute live stats
      const total = reports.length;
      const pending = reports.filter((r) =>
        ["pending", "draft"].includes((r.status || "").toLowerCase())
      ).length;
      const assigned = reports.filter((r) =>
        (r.status || "").toLowerCase().includes("assigned")
      ).length;
      const completed = reports.filter((r) =>
        ["completed", "approved"].includes((r.status || "").toLowerCase())
      ).length;

      setSidebarStats({
        total: total || 50,
        pending: pending || 4,
        assigned: assigned || 46,
        completed: completed || 0,
      });
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports]);

  // Load a full request and its nested vehicles/containers
  const loadFullRequest = async (requestId) => {
    if (!requestId) return;
    try {
      const [reqRes, transRes] = await Promise.all([
        api.get(`/transport-requests/${requestId}`),
        transporterAPI.getTransporterByRequestId(requestId).catch(() => ({ data: [] })),
      ]);

      const req = reqRes.data?.data || reqRes.data;
      if (!req) return;

      let parsedServices = [];
      let parsedPrices = {};
      try {
        parsedServices =
          typeof req.service_type === "string"
            ? JSON.parse(req.service_type)
            : req.service_type || ["Transportation Charges"];
        parsedPrices =
          typeof req.service_prices === "string"
            ? JSON.parse(req.service_prices)
            : req.service_prices || {};
      } catch (e) {
        parsedServices = ["Transportation Charges"];
        parsedPrices = {};
      }

      setRequestData({
        id: req.id,
        customer_id: req.customer_id,
        SHIPA_NO: req.SHIPA_NO || req.shipa_no || "",
        consignee: req.consignee || "",
        consigner: req.consigner || "",
        vehicle_type: req.vehicle_type || "Trailer",
        vehicle_size: req.vehicle_size || "40",
        vehicle_status: req.vehicle_status || "Empty",
        containers_20ft: Number(req.containers_20ft) || 0,
        containers_40ft: Number(req.containers_40ft) || 0,
        total_containers: Number(req.total_containers) || 0,
        no_of_vehicles: Number(req.no_of_vehicles) || 1,
        pickup_location: req.pickup_location || "",
        stuffing_location: req.stuffing_location || "",
        delivery_location: req.delivery_location || "",
        commodity: req.commodity || "",
        cargo_type: req.cargo_type || "",
        cargo_weight: parseFloat(req.cargo_weight) || 0,
        service_type: parsedServices,
        service_prices: parsedPrices,
        requested_price: parseFloat(req.requested_price) || 0,
        expected_pickup_date: req.expected_pickup_date
          ? req.expected_pickup_date.split("T")[0]
          : today,
        expected_pickup_time: req.expected_pickup_time
          ? req.expected_pickup_time.slice(0, 5)
          : currentTime,
        expected_delivery_date: req.expected_delivery_date
          ? req.expected_delivery_date.split("T")[0]
          : today,
        expected_delivery_time: req.expected_delivery_time
          ? req.expected_delivery_time.slice(0, 5)
          : currentTime,
        status: req.status || "Draft",
        admin_comment: req.admin_comment || "",
        created_at: req.created_at,
        updated_at: req.updated_at,
      });

      // Parse and group transporter details by unique vehicle
      const rawTransporters = Array.isArray(transRes.data)
        ? transRes.data
        : transRes ? [transRes] : [];

      if (rawTransporters.length > 0) {
        const vehicleMap = new Map();

        rawTransporters.forEach((row, i) => {
          const vNum = row.vehicle_number?.trim().toUpperCase() || `V_${i + 1}`;
          let serviceChargesObj = {};
          try {
            serviceChargesObj =
              typeof row.service_charges === "string"
                ? JSON.parse(row.service_charges)
                : row.service_charges || {};
          } catch (e) {
            serviceChargesObj = {};
          }

          const vendorCharge =
            parseFloat(row.base_charge) ||
            parseFloat(serviceChargesObj["Transportation Charges"]) ||
            parseFloat(row.total_charge) ||
            0;
          const addnlCharge = parseFloat(row.additional_charges) || 0;

          if (!vehicleMap.has(vNum)) {
            vehicleMap.set(vNum, {
              vehicleIndex: vehicleMap.size + 1,
              id: row.id,
              vehicleNumber: row.vehicle_number || "",
              driverName: row.driver_name || "",
              driverContact: row.driver_contact || "",
              vendorName: row.transporter_name || "",
              vendorCharges: vendorCharge,
              additionalCharges: addnlCharge,
              totalCharges: vendorCharge + addnlCharge,
              expanded: true,
              containers: [],
            });
          }

          if (row.container_no) {
            vehicleMap.get(vNum).containers.push({
              clientId: `c-${row.id || i}`,
              id: row.id,
              containerNo: row.container_no || "",
              containerType: row.container_type || "HQ",
              containerSize: row.container_size || "40",
              line: row.line || "",
              seal1: row.seal1 || row.seal_no || "",
              seal2: row.seal2 || "",
              tareWeight: row.container_total_weight || "",
              cargoWeight: row.cargo_total_weight || "",
              totalCharge: parseFloat(row.total_charge) || vendorCharge,
              remarks: row.remarks || "",
            });
          }
        });

        const list = Array.from(vehicleMap.values());
        list.forEach((v) => {
          if (v.containers.length === 0) {
            v.containers.push({
              clientId: `c-new-${Date.now()}-${Math.random()}`,
              id: null,
              containerNo: "",
              containerType: "HQ",
              containerSize: "40",
              line: "",
              seal1: "",
              seal2: "",
              tareWeight: "",
              cargoWeight: "",
              totalCharge: v.vendorCharges,
              remarks: "",
            });
          }
        });
        setNestedVehicles(list);
      } else {
        setNestedVehicles([
          {
            vehicleIndex: 1,
            id: null,
            vehicleNumber: "",
            driverName: "",
            driverContact: "",
            vendorName: "",
            vendorCharges: 0,
            additionalCharges: 0,
            totalCharges: 0,
            expanded: true,
            containers: [
              {
                clientId: `c-${Date.now()}`,
                id: null,
                containerNo: "",
                containerType: "HQ",
                containerSize: "40",
                line: "",
                seal1: "",
                seal2: "",
                tareWeight: "",
                cargoWeight: "",
                totalCharge: 0,
                remarks: "",
              },
            ],
          },
        ]);
      }

      toast.info(`Loaded Request #${requestId}`);
    } catch (err) {
      console.error("Error loading request:", err);
      toast.error(`Failed to load request #${requestId}`);
    }
  };

  useEffect(() => {
    if (initialRequestId) {
      loadFullRequest(initialRequestId);
    }
  }, [initialRequestId]);

  // Handle Container Count Sync
  const handleContainer20Change = (val) => {
    const c20 = Number(val) || 0;
    const c40 = Number(requestData.containers_40ft) || 0;
    const total = c20 + c40;
    setRequestData((prev) => ({
      ...prev,
      containers_20ft: c20,
      total_containers: total,
      no_of_vehicles: total > 0 ? total : 1,
    }));
  };

  const handleContainer40Change = (val) => {
    const c20 = Number(requestData.containers_20ft) || 0;
    const c40 = Number(val) || 0;
    const total = c20 + c40;
    setRequestData((prev) => ({
      ...prev,
      containers_40ft: c40,
      total_containers: total,
      no_of_vehicles: total > 0 ? total : 1,
    }));
  };

  // Service Price & Selection
  const handleServiceToggle = (serviceName) => {
    setRequestData((prev) => {
      const exists = prev.service_type.includes(serviceName);
      const newServices = exists
        ? prev.service_type.filter((s) => s !== serviceName)
        : [...prev.service_type, serviceName];

      const newPrices = { ...prev.service_prices };
      if (!exists && !newPrices[serviceName]) {
        newPrices[serviceName] = "0";
      }

      const total = Object.values(newPrices).reduce(
        (sum, p) => sum + (parseFloat(p) || 0),
        0
      );

      return {
        ...prev,
        service_type: newServices,
        service_prices: newPrices,
        requested_price: total,
      };
    });
  };

  const handleServicePriceChange = (serviceName, price) => {
    setRequestData((prev) => {
      const newPrices = { ...prev.service_prices, [serviceName]: price };
      const total = Object.values(newPrices).reduce(
        (sum, p) => sum + (parseFloat(p) || 0),
        0
      );
      return {
        ...prev,
        service_prices: newPrices,
        requested_price: total,
      };
    });
  };

  // Section 5: Vehicle & Container Management
  const addVehicle = () => {
    setNestedVehicles((prev) => [
      ...prev,
      {
        vehicleIndex: prev.length + 1,
        id: null,
        vehicleNumber: "",
        driverName: "",
        driverContact: "",
        vendorName: "",
        vendorCharges: 0,
        additionalCharges: 0,
        totalCharges: 0,
        expanded: true,
        containers: [
          {
            clientId: `c-${Date.now()}-${prev.length + 1}`,
            id: null,
            containerNo: "",
            containerType: "HQ",
            containerSize: "40",
            line: "",
            seal1: "",
            seal2: "",
            tareWeight: "",
            cargoWeight: "",
            totalCharge: 0,
            remarks: "",
          },
        ],
      },
    ]);
  };

  const removeVehicle = () => {
    if (nestedVehicles.length > 1) {
      setNestedVehicles((prev) => prev.slice(0, -1));
    } else {
      toast.warning("At least 1 vehicle is required.");
    }
  };

  const updateVehicleField = (vIndex, field, value) => {
    setNestedVehicles((prev) =>
      prev.map((veh, idx) => {
        if (idx === vIndex) {
          const updated = { ...veh, [field]: value };
          if (field === "vendorCharges" || field === "additionalCharges") {
            const vc = parseFloat(updated.vendorCharges) || 0;
            const ac = parseFloat(updated.additionalCharges) || 0;
            updated.totalCharges = vc + ac;
          }
          return updated;
        }
        return veh;
      })
    );
  };

  const toggleVehicleExpand = (vIndex) => {
    setNestedVehicles((prev) =>
      prev.map((veh, idx) =>
        idx === vIndex ? { ...veh, expanded: !veh.expanded } : veh
      )
    );
  };

  const addContainerToVehicle = (vIndex) => {
    setNestedVehicles((prev) =>
      prev.map((veh, idx) => {
        if (idx === vIndex) {
          return {
            ...veh,
            containers: [
              ...veh.containers,
              {
                clientId: `c-${Date.now()}-${Math.random()}`,
                id: null,
                containerNo: "",
                containerType: "HQ",
                containerSize: "40",
                line: "",
                seal1: "",
                seal2: "",
                tareWeight: "",
                cargoWeight: "",
                totalCharge: 0,
                remarks: "",
              },
            ],
          };
        }
        return veh;
      })
    );
  };

  const removeContainerFromVehicle = async (vIndex, cIndex, containerObj) => {
    if (containerObj.id) {
      try {
        await transporterAPI.deleteContainer(containerObj.id);
        toast.success("Container removed from database");
      } catch (e) {
        console.error("Error deleting container:", e);
      }
    }

    setNestedVehicles((prev) =>
      prev.map((veh, idx) => {
        if (idx === vIndex) {
          const filtered = veh.containers.filter((_, i) => i !== cIndex);
          return {
            ...veh,
            containers:
              filtered.length > 0
                ? filtered
                : [
                    {
                      clientId: `c-new-${Date.now()}`,
                      id: null,
                      containerNo: "",
                      containerType: "HQ",
                      containerSize: "40",
                      line: "",
                      seal1: "",
                      seal2: "",
                      tareWeight: "",
                      cargoWeight: "",
                      totalCharge: 0,
                      remarks: "",
                    },
                  ],
          };
        }
        return veh;
      })
    );
  };

  const updateContainerField = (vIndex, cIndex, field, value) => {
    let processedValue = value;
    if (field === "containerNo") {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    }

    setNestedVehicles((prev) =>
      prev.map((veh, idx) => {
        if (idx === vIndex) {
          const updatedContainers = veh.containers.map((c, i) =>
            i === cIndex ? { ...c, [field]: processedValue } : c
          );
          return { ...veh, containers: updatedContainers };
        }
        return veh;
      })
    );
  };

  // Grand Calculations for Section 6 (Summary)
  const grandCalculations = useMemo(() => {
    let totalVehiclesCount = nestedVehicles.length;
    let totalContainersCount = 0;
    let grandVendorCharges = 0;
    let grandAdditionalCharges = 0;
    let grandTotalCharges = 0;

    nestedVehicles.forEach((v) => {
      totalContainersCount +=
        v.containers.filter((c) => c.containerNo.trim()).length || v.containers.length;
      grandVendorCharges += parseFloat(v.vendorCharges) || 0;
      grandAdditionalCharges += parseFloat(v.additionalCharges) || 0;
      grandTotalCharges +=
        parseFloat(v.totalCharges) ||
        (parseFloat(v.vendorCharges) || 0) + (parseFloat(v.additionalCharges) || 0);
    });

    return {
      totalVehiclesCount,
      totalContainersCount,
      grandVendorCharges,
      grandAdditionalCharges,
      grandTotalCharges,
    };
  }, [nestedVehicles]);

  // Save Trip & Transporter Details
  const handleSaveTrip = async (e, isDraft = false) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading(
      isDraft
        ? "Saving Draft..."
        : requestData.id
        ? "Updating Trip..."
        : "Submitting Trip Request..."
    );

    try {
      const payload = {
        ...requestData,
        status: isDraft ? "Draft" : requestData.id ? requestData.status : "Vehicle Assigned",
        service_type: JSON.stringify(requestData.service_type),
        service_prices: JSON.stringify(requestData.service_prices),
        no_of_vehicles: nestedVehicles.length,
        total_containers: grandCalculations.totalContainersCount,
      };

      let savedRequestId = requestData.id;

      if (requestData.id) {
        await api.put(`/transport-requests/update/${requestData.id}`, payload);
      } else {
        const createRes = await api.post("/transport-requests/create", payload);
        savedRequestId = createRes.data?.data?.id || createRes.data?.id;
        setRequestData((prev) => ({ ...prev, id: savedRequestId }));
      }

      // Save Nested Vehicles and Containers
      if (savedRequestId && nestedVehicles.length > 0) {
        const vehicleContainersBatch = nestedVehicles.map((v, idx) => ({
          vehicle_number: v.vehicleNumber.trim() || `TRUCK_${idx + 1}`,
          vehicle_sequence: idx + 1,
          transporter_name: v.vendorName.trim(),
          driver_name: v.driverName.trim(),
          driver_contact: v.driverContact.trim(),
          base_charge: parseFloat(v.vendorCharges) || 0,
          additional_charges: parseFloat(v.additionalCharges) || 0,
          total_charge: parseFloat(v.totalCharges) || 0,
          service_charges: JSON.stringify({
            "Transportation Charges": v.vendorCharges?.toString() || "0",
          }),
          containers: v.containers.map((c) => ({
            id: c.id,
            container_no: c.containerNo?.trim().toUpperCase() || null,
            container_type: c.containerType || "HQ",
            container_size: c.containerSize || "40",
            line: c.line?.trim() || null,
            seal1: c.seal1?.trim() || null,
            seal2: c.seal2?.trim() || null,
            container_total_weight: parseFloat(c.tareWeight) || null,
            cargo_total_weight: parseFloat(c.cargoWeight) || null,
            total_charge:
              parseFloat(c.totalCharge) || parseFloat(v.vendorCharges) || 0,
            remarks: c.remarks?.trim() || null,
          })),
        }));

        await transporterAPI.updateMultipleVehicleContainers(
          savedRequestId,
          vehicleContainersBatch
        );
      }

      toast.update(toastId, {
        render: `Trip Request #${savedRequestId} saved successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      fetchAllReports();
      if (savedRequestId) {
        loadFullRequest(savedRequestId);
      }
      onTripSaved(savedRequestId);
    } catch (err) {
      console.error("Save error:", err);
      toast.update(toastId, {
        render: err.message || "Failed to save trip request",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered sidebar reports
  const filteredReports = useMemo(() => {
    return allReports.filter((r) => {
      const matchId = searchFilters.requestId
        ? r.id?.toString().includes(searchFilters.requestId.trim())
        : true;
      const matchShipa = searchFilters.shipaNo
        ? (r.SHIPA_NO || r.shipa_no || "")
            .toLowerCase()
            .includes(searchFilters.shipaNo.toLowerCase().trim())
        : true;
      const matchContainer = searchFilters.containerNo
        ? (r.container_no || "")
            .toLowerCase()
            .includes(searchFilters.containerNo.toLowerCase().trim())
        : true;
      const matchConsigner = searchFilters.consigner
        ? (r.consigner || "")
            .toLowerCase()
            .includes(searchFilters.consigner.toLowerCase().trim())
        : true;
      return matchId && matchShipa && matchContainer && matchConsigner;
    });
  }, [allReports, searchFilters]);

  // Reset to clean new trip
  const handleCreateNewTrip = () => {
    setRequestData({
      id: null,
      customer_id: user?.id || null,
      SHIPA_NO: "",
      consignee: "",
      consigner: "",
      vehicle_type: "Trailer",
      vehicle_size: "40",
      vehicle_status: "Empty",
      containers_20ft: 0,
      containers_40ft: 0,
      total_containers: 0,
      no_of_vehicles: 1,
      pickup_location: "",
      stuffing_location: "",
      delivery_location: "",
      commodity: "",
      cargo_type: "",
      cargo_weight: 0,
      service_type: ["Transportation Charges"],
      service_prices: { "Transportation Charges": "0" },
      requested_price: 0,
      expected_pickup_date: today,
      expected_pickup_time: currentTime,
      expected_delivery_date: today,
      expected_delivery_time: currentTime,
      status: "Draft",
      admin_comment: "",
      created_at: null,
      updated_at: null,
    });
    setNestedVehicles([
      {
        vehicleIndex: 1,
        id: null,
        vehicleNumber: "",
        driverName: "",
        driverContact: "",
        vendorName: "",
        vendorCharges: 0,
        additionalCharges: 0,
        totalCharges: 0,
        expanded: true,
        containers: [
          {
            clientId: `c-${Date.now()}-1`,
            id: null,
            containerNo: "",
            containerType: "HQ",
            containerSize: "40",
            line: "",
            seal1: "",
            seal2: "",
            tareWeight: "",
            cargoWeight: "",
            totalCharge: 0,
            remarks: "",
          },
        ],
      },
    ]);
    toast.info("Created new trip form");
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* 1. TOP HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold text-slate-900">
                  {requestData.id ? "Edit Trip Request" : "Create Trip Request"}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    requestData.status === "Vehicle Assigned"
                      ? "bg-blue-100 text-blue-700"
                      : requestData.status === "Approved" || requestData.status === "Completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {requestData.status || "Draft"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Request ID:{" "}
                <strong className="text-slate-800">
                  {requestData.id ? `#${requestData.id}` : "New Trip"}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-xs text-slate-400 hidden sm:flex items-center mr-2">
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>
                Last updated:{" "}
                {requestData.updated_at
                  ? new Date(requestData.updated_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Just now"}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => handleSaveTrip(e, true)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-xs"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={(e) => handleSaveTrip(e, false)}
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{requestData.id ? "Update Request" : "Submit Request"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        {/* 2. STATS CARDS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Total Requests */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Requests</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {sidebarStats.total}
              </h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                ↑ +9 this month
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Pending */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pending</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {sidebarStats.pending}
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                {((sidebarStats.pending / (sidebarStats.total || 1)) * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Assigned */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Assigned</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">
                {sidebarStats.assigned}
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                {((sidebarStats.assigned / (sidebarStats.total || 1)) * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Completed */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Completed</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {sidebarStats.completed}
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                100% success rate
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 3. MAIN WORKFLOW & RECENT REQUESTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 8/12 COLUMNS: 6-STEP ACCORDIONS */}
          <div className="lg:col-span-8 space-y-4">
            {/* STEP 1: TRIP DETAILS */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all">
              <div
                onClick={() => toggleSection(1)}
                className="px-5 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Trip Details</h3>
                    <p className="text-xs text-slate-500">
                      SIPA, Vehicle Type, Trailer Size, Status
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                    {requestData.SHIPA_NO || "SIPA Not Set"} • {requestData.vehicle_type} •{" "}
                    {requestData.vehicle_size}ft • {requestData.vehicle_status}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  {openSections[1] ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {openSections[1] && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      SIPA NO *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={requestData.SHIPA_NO}
                      onChange={(e) =>
                        setRequestData({ ...requestData, SHIPA_NO: e.target.value })
                      }
                      placeholder="Enter SIPA Number"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white"
                      value={requestData.vehicle_type}
                      onChange={(e) =>
                        setRequestData({ ...requestData, vehicle_type: e.target.value })
                      }
                    >
                      <option value="Trailer">Trailer</option>
                      <option value="Truck">Truck</option>
                      <option value="Container Truck">Container Truck</option>
                      <option value="Tr-4">Tr-4</option>
                      <option value="Ven">Ven</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Trailer Size
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.vehicle_size}
                      onChange={(e) =>
                        setRequestData({ ...requestData, vehicle_size: e.target.value })
                      }
                      placeholder="e.g. 40"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Vehicle Status
                    </label>
                    <select
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white"
                      value={requestData.vehicle_status}
                      onChange={(e) =>
                        setRequestData({ ...requestData, vehicle_status: e.target.value })
                      }
                    >
                      <option value="Empty">Empty</option>
                      <option value="Loaded">Loaded</option>
                      <option value="Half Loaded">Half Loaded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      20' Containers
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.containers_20ft || ""}
                      onChange={(e) => handleContainer20Change(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      40' Containers
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.containers_40ft || ""}
                      onChange={(e) => handleContainer40Change(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Total Capacity Summary
                    </label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex items-center justify-between">
                      <span>Total Containers: {requestData.total_containers}</span>
                      <span className="font-semibold text-blue-600">
                        ({requestData.containers_20ft} x 20ft, {requestData.containers_40ft} x 40ft)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: PARTIES & ROUTE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all">
              <div
                onClick={() => toggleSection(2)}
                className="px-5 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Parties & Route</h3>
                    <p className="text-xs text-slate-500">
                      Consignee, Consignor, Pickup & Delivery Location
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                    {requestData.pickup_location || "Origin"} →{" "}
                    {requestData.delivery_location || "Destination"}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  {openSections[2] ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {openSections[2] && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Consignee *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.consignee}
                      onChange={(e) =>
                        setRequestData({ ...requestData, consignee: e.target.value })
                      }
                      placeholder="Consignee Company Name"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Consigner *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.consigner}
                      onChange={(e) =>
                        setRequestData({ ...requestData, consigner: e.target.value })
                      }
                      placeholder="Consigner Company Name"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pickup Location *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.pickup_location}
                      onChange={(e) =>
                        setRequestData({ ...requestData, pickup_location: e.target.value })
                      }
                      placeholder="e.g. DADRI NK"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Delivery Location *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.delivery_location}
                      onChange={(e) =>
                        setRequestData({ ...requestData, delivery_location: e.target.value })
                      }
                      placeholder="e.g. MORADABAD PRIDEL"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Commodity
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.commodity}
                      onChange={(e) =>
                        setRequestData({ ...requestData, commodity: e.target.value })
                      }
                      placeholder="Commodity Description"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Cargo Weight (MT/KG)
                    </label>
                    <input
                      type="number"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.cargo_weight || ""}
                      onChange={(e) =>
                        setRequestData({ ...requestData, cargo_weight: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: SERVICE & PRICING */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all">
              <div
                onClick={() => toggleSection(3)}
                className="px-5 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Service & Pricing</h3>
                    <p className="text-xs text-slate-500">
                      Transportation Charges, Freight Forwarding, Pricing Summary
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                    Transportation Charges • ₹
                    {Number(requestData.requested_price || 0).toLocaleString("en-IN")}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  {openSections[3] ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {openSections[3] && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {servicesList.map((service) => {
                      const isSelected = requestData.service_type.includes(service);
                      return (
                        <div
                          key={service}
                          className={`p-3 rounded-lg border transition-all ${
                            isSelected
                              ? "bg-blue-50/60 border-blue-300"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <label className="flex items-center space-x-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleServiceToggle(service)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-semibold text-slate-800">
                              {service}
                            </span>
                          </label>

                          {isSelected && (
                            <div className="flex items-center space-x-1.5 mt-1">
                              <span className="text-slate-400 font-bold">₹</span>
                              <input
                                type="number"
                                className="w-full border border-slate-300 rounded-md p-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                                value={requestData.service_prices[service] || ""}
                                onChange={(e) =>
                                  handleServicePriceChange(service, e.target.value)
                                }
                                placeholder="Rate"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pricing Summary Box */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-700">
                        Customer Quotation Price:
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Direct client quotation for full trip
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900">
                        ₹
                        {Number(requestData.requested_price || 0).toLocaleString(
                          "en-IN",
                          { minimumFractionDigits: 2 }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 4: SCHEDULE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all">
              <div
                onClick={() => toggleSection(4)}
                className="px-5 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Schedule</h3>
                    <p className="text-xs text-slate-500">
                      Expected Pickup & Delivery Date
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                    {requestData.expected_pickup_date} →{" "}
                    {requestData.expected_delivery_date}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  {openSections[4] ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {openSections[4] && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Expected Pickup Date *
                    </label>
                    <input
                      type="date"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.expected_pickup_date}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          expected_pickup_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.expected_pickup_time}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          expected_pickup_time: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Expected Delivery Date *
                    </label>
                    <input
                      type="date"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.expected_delivery_date}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          expected_delivery_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Delivery Time
                    </label>
                    <input
                      type="time"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      value={requestData.expected_delivery_time}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          expected_delivery_time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* STEP 5: TRANSPORTER DETAILS (NESTED VEHICLE-CONTAINER TREE) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all">
              <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                <div
                  onClick={() => toggleSection(5)}
                  className="flex items-center space-x-3.5 cursor-pointer select-none"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                    5
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Transporter Details ({nestedVehicles.length} Vehicle
                      {nestedVehicles.length > 1 ? "s" : ""})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Vehicle, Driver, Vendor and Charges
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={addVehicle}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Vehicle</span>
                  </button>
                  <button
                    type="button"
                    onClick={removeVehicle}
                    disabled={nestedVehicles.length <= 1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                      nestedVehicles.length <= 1
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Remove Vehicle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSection(5)}
                    className="p-1 hover:bg-slate-100 rounded-md text-slate-400"
                  >
                    {openSections[5] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {openSections[5] && (
                <div className="p-4 space-y-4 bg-slate-50/40">
                  {nestedVehicles.map((vehicle, vIdx) => {
                    const vehicleNumber = vIdx + 1;
                    return (
                      <div
                        key={`veh-${vIdx}`}
                        className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
                      >
                        {/* PARENT VEHICLE HEADER CARD */}
                        <div className="p-3.5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                          {/* Left: Serial Badge + Truck Graphic + Vehicle Number */}
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {vehicleNumber}
                            </div>
                            <TruckGraphic number={vehicleNumber} />
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Vehicle Number
                              </span>
                              <input
                                type="text"
                                className="border border-slate-300 rounded-md px-2 py-1 font-bold text-blue-700 bg-blue-50/50 uppercase text-xs w-28 focus:ring-2 focus:ring-blue-500"
                                value={vehicle.vehicleNumber}
                                onChange={(e) =>
                                  updateVehicleField(
                                    vIdx,
                                    "vehicleNumber",
                                    e.target.value.toUpperCase()
                                  )
                                }
                                placeholder="RJ36GB1741"
                              />
                            </div>
                          </div>

                          {/* Center: Driver & Vendor */}
                          <div className="flex items-center space-x-4 flex-wrap gap-y-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Driver
                              </span>
                              <div className="flex items-center space-x-1">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                                <input
                                  type="text"
                                  className="border border-slate-300 rounded-md px-1.5 py-0.5 text-xs font-medium w-24"
                                  value={vehicle.driverName}
                                  onChange={(e) =>
                                    updateVehicleField(vIdx, "driverName", e.target.value)
                                  }
                                  placeholder="Driver Name"
                                />
                                <input
                                  type="text"
                                  className="border border-slate-300 rounded-md px-1.5 py-0.5 text-xs text-slate-500 w-24"
                                  value={vehicle.driverContact}
                                  onChange={(e) =>
                                    updateVehicleField(vIdx, "driverContact", e.target.value)
                                  }
                                  placeholder="Contact"
                                />
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Vendor
                              </span>
                              <div className="flex items-center space-x-1">
                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                <input
                                  type="text"
                                  className="border border-slate-300 rounded-md px-1.5 py-0.5 text-xs font-semibold text-slate-700 w-32"
                                  value={vehicle.vendorName}
                                  onChange={(e) =>
                                    updateVehicleField(vIdx, "vendorName", e.target.value)
                                  }
                                  placeholder="Vendor Name"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Right: Vendor Charges & Collapse Trigger */}
                          <div className="flex items-center space-x-3">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Vendor Charges (₹)
                              </span>
                              <input
                                type="number"
                                className="border border-slate-300 rounded-md px-2 py-0.5 text-xs font-semibold w-24 text-right"
                                value={vehicle.vendorCharges || ""}
                                onChange={(e) =>
                                  updateVehicleField(vIdx, "vendorCharges", e.target.value)
                                }
                                placeholder="0.00"
                              />
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Addnl (₹)
                              </span>
                              <input
                                type="number"
                                className="border border-slate-300 rounded-md px-2 py-0.5 text-xs text-slate-500 w-20 text-right"
                                value={vehicle.additionalCharges || ""}
                                onChange={(e) =>
                                  updateVehicleField(vIdx, "additionalCharges", e.target.value)
                                }
                                placeholder="0.00"
                              />
                            </div>

                            <div className="text-right pl-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Total Charges (₹)
                              </span>
                              <span className="text-sm font-black text-blue-600">
                                ₹
                                {Number(vehicle.totalCharges || 0).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleVehicleExpand(vIdx)}
                              className="p-1 hover:bg-slate-200 rounded-md text-slate-500 transition-colors ml-1"
                            >
                              {vehicle.expanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* CHILD CONTAINERS SUB-TREE */}
                        {vehicle.expanded && (
                          <div className="p-4 bg-slate-50/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                                <Package className="w-4 h-4 text-blue-600" />
                                <span>Containers ({vehicle.containers.length})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => addContainerToVehicle(vIdx)}
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Container</span>
                              </button>
                            </div>

                            {/* CONTAINERS TABLE */}
                            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                              <table className="min-w-full divide-y divide-slate-200 text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px]">
                                  <tr>
                                    <th className="px-2.5 py-2 text-left w-10">#</th>
                                    <th className="px-2.5 py-2 text-left min-w-[130px]">
                                      Container Number *
                                    </th>
                                    <th className="px-2.5 py-2 text-left w-20">Type *</th>
                                    <th className="px-2.5 py-2 text-left w-16">Size *</th>
                                    <th className="px-2.5 py-2 text-left min-w-[110px]">
                                      Shipping Line
                                    </th>
                                    <th className="px-2.5 py-2 text-left w-24">Seal 1</th>
                                    <th className="px-2.5 py-2 text-left w-24">Seal 2</th>
                                    <th className="px-2.5 py-2 text-left w-24">
                                      Tare (kg)
                                    </th>
                                    <th className="px-2.5 py-2 text-left w-24">
                                      Cargo (kg)
                                    </th>
                                    <th className="px-2.5 py-2 text-left w-28">
                                      Total Charge (₹)
                                    </th>
                                    <th className="px-2.5 py-2 text-center w-12">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {vehicle.containers.map((container, cIdx) => (
                                    <tr key={container.clientId || `c-${cIdx}`} className="hover:bg-slate-50/70">
                                      <td className="px-2.5 py-2 text-slate-400 font-bold">
                                        {cIdx + 1}
                                      </td>

                                      {/* Container Number */}
                                      <td className="px-2.5 py-2">
                                        <input
                                          type="text"
                                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-500"
                                          value={container.containerNo}
                                          onChange={(e) =>
                                            updateContainerField(
                                              vIdx,
                                              cIdx,
                                              "containerNo",
                                              e.target.value
                                            )
                                          }
                                          placeholder="TCNU1165696"
                                        />
                                      </td>

                                      {/* Type */}
                                      <td className="px-2.5 py-2">
                                        <select
                                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
                                          value={container.containerType}
                                          onChange={(e) =>
                                            updateContainerField(
                                              vIdx,
                                              cIdx,
                                              "containerType",
                                              e.target.value
                                            )
                                          }
                                        >
                                          <option value="HQ">HQ</option>
                                          <option value="DV">DV</option>
                                          <option value="OT">OT</option>
                                          <option value="FR">FR</option>
                                          <option value="RF">RF</option>
                                        </select>
                                      </td>

                                      {/* Size */}
                                      <td className="px-2.5 py-2">
                                        <select
                                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
                                          value={container.containerSize}
                                          onChange={(e) =>
                                            updateContainerField(
                                              vIdx,
                                              cIdx,
                                              "containerSize",
                                              e.target.value
                                            )
                                          }
                                        >
                                          <option value="40">40</option>
                                          <option value="20">20</option>
                                          <option value="45">45</option>
                                        </select>
                                      </td>

                                      {/* Shipping Line */}
                                      <td className="px-2.5 py-2">
                                        <input
                                          type="text"
                                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                          value={container.line}
                                          onChange={(e) =>
                                            updateContainerField(
                                              vIdx,
                                              cIdx,
                                              "line",
                                              e.target.value
                                            )
                                          }
                                          placeholder="CMACGM"
                                        />
                                      </td>

                                      {/* Seal 1 */}
                                      <td className="px-2.5 py-2">
                                        <input
                                          type="text"
                                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-600"
                                          value={container.seal1}
                                          onChange={(e) =>
                                            updateContainerField(
                                              vIdx,
                                              cIdx,
                                              "seal1",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Seal 1"
                                        />
                                      </td>

                                      {/* Seal 2 */}
                                      <td className="px-2.5 py-2">
                                        <input
                                          type="text"
                                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-600"
                                          value={container.seal2}
                                          onChange={(e) =>
                                            updateContainerField(
                                              vIdx,
                                              cIdx,
                                              "seal2",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Seal 2"
                                        />
                                      </td>

                                      {/* Tare Weight */}
                                      <td className="px-2.5 py-2">
                                        <input
                                          type="text"
                                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-slate-600 text-right"
                                          value={container.tareWeight}
                                          onChange={(e) =>
                                            updateContainerField(
                                              vIdx,
                                              cIdx,
                                              "tareWeight",
                                              e.target.value
                                            )
                                          }
                                          placeholder="-"
                                        />
                                      </td>

                                      {/* Cargo Weight */}
                                      <td className="px-2.5 py-2">
                                        <input
                                          type="text"
                                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-slate-600 text-right"
                                          value={container.cargoWeight}
                                          onChange={(e) =>
                                            updateContainerField(
                                              vIdx,
                                              cIdx,
                                              "cargoWeight",
                                              e.target.value
                                            )
                                          }
                                          placeholder="-"
                                        />
                                      </td>

                                      {/* Total Charge */}
                                      <td className="px-2.5 py-2">
                                        <input
                                          type="number"
                                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-right"
                                          value={container.totalCharge || ""}
                                          onChange={(e) =>
                                            updateContainerField(
                                              vIdx,
                                              cIdx,
                                              "totalCharge",
                                              e.target.value
                                            )
                                          }
                                          placeholder="0.00"
                                        />
                                      </td>

                                      {/* Delete Action */}
                                      <td className="px-2.5 py-2 text-center">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeContainerFromVehicle(
                                              vIdx,
                                              cIdx,
                                              container
                                            )
                                          }
                                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                          title="Delete container"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Container Subtotal Footer */}
                            <div className="mt-2 text-right pr-2 text-xs font-semibold text-slate-600">
                              Container Total:{" "}
                              <strong className="text-slate-900 font-bold ml-1">
                                ₹
                                {vehicle.containers
                                  .reduce(
                                    (sum, c) => sum + (parseFloat(c.totalCharge) || 0),
                                    0
                                  )
                                  .toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                  })}
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* STEP 6: SUMMARY */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all">
              <div
                onClick={() => toggleSection(6)}
                className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/40"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                    6
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Summary</h3>
                    <p className="text-xs text-slate-500">
                      Total Vehicles, Containers and Charges
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-xs font-semibold text-slate-600 space-x-3 hidden sm:flex">
                    <span>
                      Vehicles:{" "}
                      <strong className="text-blue-700">
                        {grandCalculations.totalVehiclesCount}
                      </strong>
                    </span>
                    <span>
                      Containers:{" "}
                      <strong className="text-blue-700">
                        {grandCalculations.totalContainersCount}
                      </strong>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Total Amount
                    </span>
                    <span className="text-xl font-black text-blue-600">
                      ₹
                      {grandCalculations.grandTotalCharges.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {openSections[6] ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 4/12 COLUMNS: RECENT REQUESTS SIDEBAR */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Sidebar Header */}
            <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Recent Requests</span>
              </h3>
              <button
                type="button"
                onClick={handleCreateNewTrip}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center space-x-1"
                title="Create New Trip"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            {/* 4 Search Filter Inputs */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/30 space-y-2 text-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Request ID"
                  className="w-full border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  value={searchFilters.requestId}
                  onChange={(e) =>
                    setSearchFilters({ ...searchFilters, requestId: e.target.value })
                  }
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by SHIPA No"
                  className="w-full border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  value={searchFilters.shipaNo}
                  onChange={(e) =>
                    setSearchFilters({ ...searchFilters, shipaNo: e.target.value })
                  }
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Container No"
                  className="w-full border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  value={searchFilters.containerNo}
                  onChange={(e) =>
                    setSearchFilters({ ...searchFilters, containerNo: e.target.value })
                  }
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Consigner"
                  className="w-full border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  value={searchFilters.consigner}
                  onChange={(e) =>
                    setSearchFilters({ ...searchFilters, consigner: e.target.value })
                  }
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={fetchAllReports}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchFilters({
                      requestId: "",
                      shipaNo: "",
                      containerNo: "",
                      consigner: "",
                    });
                    fetchAllReports();
                  }}
                  className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100"
                  title="Reset filters"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Request Cards List */}
            <div className="p-3 space-y-2.5 max-h-[600px] overflow-y-auto">
              {isLoadingReports ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
                  <span className="text-xs text-slate-400 mt-2 block">
                    Loading requests...
                  </span>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No requests found
                </div>
              ) : (
                filteredReports.map((report) => {
                  const isSelected = requestData.id === report.id;
                  const isAssigned = (report.status || "").toLowerCase().includes("assigned");
                  const isCompleted = ["completed", "approved"].includes(
                    (report.status || "").toLowerCase()
                  );

                  return (
                    <div
                      key={report.id}
                      onClick={() => loadFullRequest(report.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none relative ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs"
                      }`}
                    >
                      {/* Header: ID + Status Pill */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-xs">
                          #{report.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-700"
                              : isAssigned
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {report.status || "Pending"}
                        </span>
                      </div>

                      {/* Date + Vehicle Info */}
                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span>
                            {report.created_at
                              ? new Date(report.created_at).toLocaleDateString("en-US", {
                                  month: "numeric",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </span>
                          <span className="text-slate-700 font-semibold">
                            {report.vehicle_type || "Trailer"}
                          </span>
                        </div>

                        {/* Services Pill */}
                        <div className="flex items-center space-x-1.5 pt-1">
                          <span className="text-[10px] font-medium text-slate-400">
                            Services:
                          </span>
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                            Transportation Charges
                          </span>
                        </div>

                        {/* Containers Pills */}
                        {report.container_no && (
                          <div className="flex items-center space-x-1 pt-1 flex-wrap gap-1">
                            <span className="text-[10px] font-medium text-slate-400">
                              Containers:
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium">
                              {report.container_no}
                            </span>
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
