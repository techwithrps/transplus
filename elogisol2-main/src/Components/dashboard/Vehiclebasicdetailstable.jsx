import React, { useState, useEffect, useRef, useMemo } from "react";
import { driverAPI, vendorAPI, vehicleAPI } from "../../utils/Api";

const VendorSearchInput = ({ value, onChange, placeholder }) => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const selfOption = {
    VENDOR_ID: "SELF",
    VENDOR_NAME: "Self",
    VENDOR_CODE: "SELF",
    CITY: "Own Vehicles",
    ADDRESS: "Own Vehicles",
  };

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const response = await vendorAPI.getAllVendors();
        const vendorsData = response.data || response || [];
        if (Array.isArray(vendorsData)) {
          const vendorsWithSelf = [selfOption, ...vendorsData];
          setVendors(vendorsWithSelf);
          setFilteredVendors(vendorsWithSelf);
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
        setVendors([selfOption]);
        setFilteredVendors([selfOption]);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    if (searchTerm && vendors.length > 0) {
      const filtered = vendors.filter((v) =>
        v.VENDOR_NAME.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors(vendors);
    }
  }, [searchTerm, vendors]);

  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  const calculateDropdownPosition = () => {
    if (!inputRef.current) return;

    const inputRect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 200;

    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownPosition("top");
    } else {
      setDropdownPosition("bottom");
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    setTimeout(calculateDropdownPosition, 0);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", calculateDropdownPosition, true);
      window.addEventListener("resize", calculateDropdownPosition);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", calculateDropdownPosition, true);
      window.removeEventListener("resize", calculateDropdownPosition);
    };
  }, [isOpen]);

  const getDropdownStyles = () => {
    if (!inputRef.current || !isOpen) return { display: "none" };

    const inputRect = inputRef.current.getBoundingClientRect();

    const styles = {
      width: `${Math.max(inputRect.width, 220)}px`,
      maxHeight: "200px",
      zIndex: 9999,
    };

    if (dropdownPosition === "top") {
      styles.bottom = `${window.innerHeight - inputRect.top + 4}px`;
      styles.left = `${inputRect.left}px`;
    } else {
      styles.top = `${inputRect.bottom + 4}px`;
      styles.left = `${inputRect.left}px`;
    }

    return styles;
  };

  return (
    <>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full min-w-[160px] border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          placeholder={placeholder}
          required
          autoComplete="off"
        />

        {loading && (
          <div className="absolute right-2 top-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && filteredVendors.length > 0 && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto"
          style={getDropdownStyles()}
        >
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.VENDOR_ID}
              className={`px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                vendor.VENDOR_ID === "SELF" ? "bg-green-50" : ""
              }`}
              onClick={() => {
                setSearchTerm(vendor.VENDOR_NAME);
                onChange(vendor.VENDOR_NAME);
                setIsOpen(false);
              }}
            >
              <div className="font-medium text-gray-900 truncate">
                {vendor.VENDOR_NAME}
                {vendor.VENDOR_ID === "SELF" && (
                  <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                    Own
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {vendor.CITY || vendor.ADDRESS}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const DriverSearchInput = ({ value, onChange, vendorName, placeholder }) => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const [vendorId, setVendorId] = useState(null);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchVendorIdAndDrivers = async () => {
      if (!vendorName) {
        setDrivers([]);
        setFilteredDrivers([]);
        setVendorId(null);
        return;
      }

      setLoading(true);
      try {
        if (vendorName.toLowerCase() === "self") {
          setVendorId("SELF");
          const response = await vehicleAPI.getAllvehicles();
          const vehiclesData = response.data || response || [];

          if (Array.isArray(vehiclesData)) {
            const selfDrivers = vehiclesData.map((vehicle) => ({
              DRIVER_ID: `SELF_VEHICLE_${vehicle.VEHICLE_ID || vehicle.ID}`,
              DRIVER_NAME:
                vehicle.OWNER_NAME || vehicle.DRIVER_NAME || vehicle.VEHICLE_NO,
              MOBILE_NO:
                vehicle.OWNER_CONTACT_NO ||
                vehicle.CONTACT_NO ||
                vehicle.MOBILE_NO ||
                "",
              CONTACT_NO:
                vehicle.OWNER_CONTACT_NO ||
                vehicle.CONTACT_NO ||
                vehicle.MOBILE_NO ||
                "",
              DL_NO: vehicle.DL_NO || "",
              VEHICLE_NO: vehicle.VEHICLE_NO || "",
              VEHICLE_TYPE: vehicle.VEHICLE_TYPE || "",
              MAKE: vehicle.MAKE || "",
              MODEL: vehicle.MODEL || "",
              YEAR: vehicle.YEAR || "",
              IS_SELF_VEHICLE: true,
            }));
            setDrivers(selfDrivers);
            setFilteredDrivers(selfDrivers);
          }
        } else {
          const vendorResponse = await vendorAPI.getAllVendors();
          const vendors = vendorResponse.data || vendorResponse || [];
          const selectedVendor = vendors.find(
            (v) => v.VENDOR_NAME.toLowerCase() === vendorName.toLowerCase()
          );

          if (selectedVendor) {
            setVendorId(selectedVendor.VENDOR_ID);
            const driverResponse = await driverAPI.getAllDrivers();
            const driversData = driverResponse.data || driverResponse || [];
            if (Array.isArray(driversData)) {
              const vendorDrivers = driversData.filter(
                (d) =>
                  d.VENDOR_ID === selectedVendor.VENDOR_ID ||
                  d.VENDOR_NAME === selectedVendor.VENDOR_NAME
              );
              setDrivers(vendorDrivers);
              setFilteredDrivers(vendorDrivers);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching drivers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorIdAndDrivers();
  }, [vendorName]);

  useEffect(() => {
    if (searchTerm && drivers.length > 0) {
      const filtered = drivers.filter(
        (d) =>
          d.DRIVER_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.VEHICLE_NO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.MOBILE_NO?.includes(searchTerm)
      );
      setFilteredDrivers(filtered);
    } else {
      setFilteredDrivers(drivers);
    }
  }, [searchTerm, drivers]);

  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  const calculateDropdownPosition = () => {
    if (!inputRef.current) return;
    const inputRect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 200;

    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownPosition("top");
    } else {
      setDropdownPosition("bottom");
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    setTimeout(calculateDropdownPosition, 0);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getDropdownStyles = () => {
    if (!inputRef.current || !isOpen) return { display: "none" };
    const inputRect = inputRef.current.getBoundingClientRect();

    const styles = {
      width: `${Math.max(inputRect.width, 260)}px`,
      maxHeight: "200px",
      zIndex: 9999,
    };

    if (dropdownPosition === "top") {
      styles.bottom = `${window.innerHeight - inputRect.top + 4}px`;
      styles.left = `${inputRect.left}px`;
    } else {
      styles.top = `${inputRect.bottom + 4}px`;
      styles.left = `${inputRect.left}px`;
    }

    return styles;
  };

  return (
    <>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full min-w-[140px] border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={!vendorName}
          required
          autoComplete="off"
        />

        {loading && (
          <div className="absolute right-2 top-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && filteredDrivers.length > 0 && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto"
          style={getDropdownStyles()}
        >
          {filteredDrivers.map((driver) => (
            <div
              key={driver.DRIVER_ID}
              className={`px-3 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                vendorId === "SELF" || driver.IS_SELF_VEHICLE ? "bg-green-50" : ""
              }`}
              onClick={() => {
                setSearchTerm(driver.DRIVER_NAME);
                onChange(driver.DRIVER_NAME, driver);
                setIsOpen(false);
              }}
            >
              <div className="font-medium text-gray-900 text-sm flex items-center justify-between">
                <span>{driver.DRIVER_NAME}</span>
                {(vendorId === "SELF" || driver.IS_SELF_VEHICLE) && (
                  <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                    Own
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                {driver.MOBILE_NO || driver.CONTACT_NO || "No contact"}
                {driver.VEHICLE_NO && ` • Vehicle: ${driver.VEHICLE_NO}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const VehicleBasicDetailsTable = ({ vehicleDataList, updateVehicleData }) => {
  const [validationErrors, setValidationErrors] = useState({});

  // Group vehicles and their associated container records
  const groupedVehicles = useMemo(() => {
    if (!vehicleDataList || vehicleDataList.length === 0) {
      return [
        {
          vehicle: {
            vehicleIndex: 1,
            vendorName: "",
            transporterName: "",
            vehicleNumber: "",
            driverName: "",
            driverContact: "",
          },
          primaryIndex: 0,
          containers: [
            {
              originalIndex: 0,
              containerNo: "",
              containerSize: "20",
              containerType: "DV",
              line: "",
              seal1: "",
              seal2: "",
              cargoTotalWeight: "",
              containerTotalWeight: "",
            },
          ],
        },
      ];
    }

    const map = new Map();

    vehicleDataList.forEach((item, originalIndex) => {
      // Group by assigned vehicle number or unique sequence/index
      const vKey =
        item.vehicleNumber?.trim().toUpperCase() ||
        `UNASSIGNED_VEHICLE_${item.vehicleIndex || originalIndex}`;

      if (!map.has(vKey)) {
        map.set(vKey, {
          vehicle: item,
          primaryIndex: originalIndex,
          containers: [],
        });
      }

      map.get(vKey).containers.push({
        ...item,
        originalIndex,
      });
    });

    return Array.from(map.values());
  }, [vehicleDataList]);

  const validateVehicleData = (field, value) => {
    switch (field) {
      case "vehicleNumber":
        return /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(value);
      case "driverName":
        return value.length >= 3 && /^[A-Za-z.\s]+$/.test(value);
      case "driverContact":
        return /^\d{10}$/.test(value);
      default:
        return true;
    }
  };

  const handleInputChange = (originalIndex, field, value) => {
    updateVehicleData(originalIndex, field, value);

    // If updating vehicle number, synchronize across twin containers of this vehicle
    if (field === "vehicleNumber") {
      const oldVehicle = vehicleDataList[originalIndex];
      const oldVNum = oldVehicle?.vehicleNumber?.trim().toUpperCase();

      if (oldVNum) {
        vehicleDataList.forEach((v, idx) => {
          if (idx !== originalIndex && v.vehicleNumber?.trim().toUpperCase() === oldVNum) {
            updateVehicleData(idx, "vehicleNumber", value);
          }
        });
      }
    }

    const isValid = validateVehicleData(field, value);
    setValidationErrors((prev) => ({
      ...prev,
      [`${originalIndex}-${field}`]: isValid
        ? null
        : `Invalid ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
    }));
  };

  const handleVendorChange = (originalIndex, vendorName) => {
    updateVehicleData(originalIndex, "vendorName", vendorName);
    updateVehicleData(originalIndex, "transporterName", vendorName);

    // Sync across twin container rows for this vehicle
    const currentVehicle = vehicleDataList[originalIndex];
    if (currentVehicle?.vehicleNumber) {
      vehicleDataList.forEach((v, idx) => {
        if (idx !== originalIndex && v.vehicleNumber === currentVehicle.vehicleNumber) {
          updateVehicleData(idx, "vendorName", vendorName);
          updateVehicleData(idx, "transporterName", vendorName);
        }
      });
    }
  };

  const handleDriverSelection = (originalIndex, driverName, driverData) => {
    if (driverData) {
      updateVehicleData(originalIndex, "driverName", driverName);
      updateVehicleData(
        originalIndex,
        "driverContact",
        driverData.MOBILE_NO || driverData.CONTACT_NO || ""
      );
      updateVehicleData(originalIndex, "licenseNumber", driverData.DL_NO || "");
      updateVehicleData(
        originalIndex,
        "vehicleNumber",
        driverData.VEHICLE_NO || ""
      );

      if (driverData.DL_RENEWABLE_DATE) {
        const date = new Date(driverData.DL_RENEWABLE_DATE);
        const formattedDate = date.toISOString().split("T")[0];
        updateVehicleData(originalIndex, "licenseExpiry", formattedDate);
      }

      // Sync across twin rows for this vehicle
      const currentVehicle = vehicleDataList[originalIndex];
      if (currentVehicle?.vehicleNumber || driverData.VEHICLE_NO) {
        const targetVNum = driverData.VEHICLE_NO || currentVehicle.vehicleNumber;
        vehicleDataList.forEach((v, idx) => {
          if (idx !== originalIndex && v.vehicleNumber === targetVNum) {
            updateVehicleData(idx, "driverName", driverName);
            updateVehicleData(
              idx,
              "driverContact",
              driverData.MOBILE_NO || driverData.CONTACT_NO || ""
            );
            updateVehicleData(idx, "vehicleNumber", driverData.VEHICLE_NO || "");
          }
        });
      }
    } else {
      updateVehicleData(originalIndex, "driverName", driverName);
    }
  };

  const handleAddContainerToVehicle = (vehicle) => {
    // Clone vehicle base data and append as a new twin container row
    const newRow = {
      ...vehicle,
      id: null,
      containerNo: "",
      line: "",
      seal1: "",
      seal2: "",
      sealNo: "",
      containerTotalWeight: "",
      cargoTotalWeight: "",
      containerType: "DV",
      containerSize: "20",
    };
    updateVehicleData(null, "_insert_new_row", newRow);
  };

  const getVendorName = (vehicle) => {
    return vehicle.vendorName || vehicle.transporterName || "";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">
          Vehicle & Container Details (Sub-Tree View)
          <span className="text-sm font-normal text-gray-500 ml-2">
            (All fields marked with * are required)
          </span>
        </h4>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16 text-center">
                Vehicle #
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]">
                Vendor Name *
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">
                Vehicle Number *
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">
                Assigner Name *
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[160px]">
                Driver Contact *
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {groupedVehicles.map((group, groupIndex) => {
              const { vehicle, primaryIndex, containers } = group;

              return (
                <React.Fragment key={`group-vehicle-${groupIndex}`}>
                  {/* Parent Vehicle Row */}
                  <tr className="bg-gray-50/80 hover:bg-blue-50/30 transition-colors border-t-2 border-gray-200">
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-center align-top">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                          {groupIndex + 1}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {containers.length} cont.
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap align-top">
                      <VendorSearchInput
                        value={getVendorName(vehicle)}
                        onChange={(value) => handleVendorChange(primaryIndex, value)}
                        placeholder="Search and select vendor"
                      />
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap align-top">
                      <div>
                        <input
                          type="text"
                          className={`w-full min-w-[140px] border ${
                            validationErrors[`${primaryIndex}-vehicleNumber`]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md p-2 text-sm uppercase font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          value={vehicle.vehicleNumber || ""}
                          onChange={(e) =>
                            handleInputChange(
                              primaryIndex,
                              "vehicleNumber",
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="e.g. MH01AB1234"
                          pattern="[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}"
                          title="Vehicle number must be in format like MH01AB1234"
                          required
                        />
                        {validationErrors[`${primaryIndex}-vehicleNumber`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {validationErrors[`${primaryIndex}-vehicleNumber`]}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap align-top">
                      <DriverSearchInput
                        value={vehicle.driverName || ""}
                        onChange={(value, driverData) =>
                          handleDriverSelection(primaryIndex, value, driverData)
                        }
                        vendorName={getVendorName(vehicle)}
                        placeholder="Select driver"
                      />
                      {validationErrors[`${primaryIndex}-driverName`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {validationErrors[`${primaryIndex}-driverName`]}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap align-top">
                      <div>
                        <input
                          type="tel"
                          className={`w-full min-w-[160px] border ${
                            validationErrors[`${primaryIndex}-driverContact`]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          value={vehicle.driverContact || ""}
                          onChange={(e) =>
                            handleInputChange(
                              primaryIndex,
                              "driverContact",
                              e.target.value.replace(/\D/g, "").slice(0, 10)
                            )
                          }
                          placeholder="10-digit mobile"
                          pattern="\d{10}"
                          title="Driver contact must be exactly 10 digits"
                          maxLength="10"
                          required
                        />
                        {validationErrors[`${primaryIndex}-driverContact`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {validationErrors[`${primaryIndex}-driverContact`]}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap text-center align-top">
                      <button
                        type="button"
                        onClick={() => handleAddContainerToVehicle(vehicle)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-blue-600 shadow-xs text-xs font-medium rounded text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 cursor-pointer"
                        title="Add twin container to this vehicle"
                      >
                        <svg
                          className="w-3.5 h-3.5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        + Container
                      </button>
                    </td>
                  </tr>

                  {/* Sub-Tree Branch: Nested Containers for this Vehicle */}
                  <tr>
                    <td colSpan="6" className="p-0 bg-white">
                      <div className="pl-6 pr-4 py-3 bg-gradient-to-r from-blue-50/40 via-gray-50/30 to-white border-l-4 border-blue-500 ml-4 my-2 rounded-r-lg shadow-xs">
                        <div className="flex items-center mb-2.5 text-xs font-semibold text-blue-900">
                          <svg
                            className="w-4 h-4 mr-1.5 text-blue-600"
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
                          Containers for Vehicle #{groupIndex + 1} ({vehicle.vehicleNumber || "Pending Vehicle No"}):
                        </div>

                        <div className="space-y-3">
                          {containers.map((container, contIndex) => {
                            const originalIdx = container.originalIndex;

                            return (
                              <div
                                key={`sub-container-${originalIdx}`}
                                className="bg-white border border-gray-200 rounded-lg p-3 shadow-xs relative hover:border-blue-300 transition-colors"
                              >
                                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-gray-100">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                                      Container {contIndex + 1}
                                    </span>
                                    {container.containerNo && (
                                      <span className="text-xs font-mono font-bold text-blue-700">
                                        {container.containerNo}
                                      </span>
                                    )}
                                  </div>

                                  {containers.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateVehicleData(
                                          originalIdx,
                                          "_remove_row",
                                          null
                                        )
                                      }
                                      className="text-xs text-red-600 hover:text-red-800 font-medium inline-flex items-center cursor-pointer"
                                      title="Remove container"
                                    >
                                      <svg
                                        className="w-3.5 h-3.5 mr-0.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
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

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
                                  {/* Container Number */}
                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                      Container No *
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full border border-gray-300 rounded p-1.5 text-xs uppercase font-mono font-semibold focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                      value={container.containerNo || ""}
                                      onChange={(e) => {
                                        let val = e.target.value.toUpperCase();
                                        if (val.length > 11) val = val.substring(0, 11);
                                        updateVehicleData(originalIdx, "containerNo", val);
                                      }}
                                      placeholder="ABCD1234567"
                                      maxLength="11"
                                    />
                                  </div>

                                  {/* Container Size */}
                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                      Size
                                    </label>
                                    <select
                                      className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                      value={container.containerSize || "20"}
                                      onChange={(e) =>
                                        updateVehicleData(
                                          originalIdx,
                                          "containerSize",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="20">20 ft</option>
                                      <option value="40">40 ft</option>
                                      <option value="45">45 ft</option>
                                    </select>
                                  </div>

                                  {/* Container Type */}
                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                      Type
                                    </label>
                                    <select
                                      className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                      value={container.containerType || "DV"}
                                      onChange={(e) =>
                                        updateVehicleData(
                                          originalIdx,
                                          "containerType",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="DV">DV</option>
                                      <option value="HQ">HQ</option>
                                      <option value="REFER">REFER</option>
                                      <option value="OT">OT</option>
                                      <option value="FR">FR</option>
                                    </select>
                                  </div>

                                  {/* Shipping Line */}
                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                      Shipping Line
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full border border-gray-300 rounded p-1.5 text-xs uppercase focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                      value={container.line || ""}
                                      onChange={(e) =>
                                        updateVehicleData(
                                          originalIdx,
                                          "line",
                                          e.target.value.toUpperCase()
                                        )
                                      }
                                      placeholder="Shipping Line"
                                    />
                                  </div>

                                  {/* Seal 1 */}
                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                      Seal 1
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full border border-gray-300 rounded p-1.5 text-xs uppercase focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                      value={container.seal1 || container.sealNo || ""}
                                      onChange={(e) => {
                                        const val = e.target.value.toUpperCase();
                                        updateVehicleData(originalIdx, "seal1", val);
                                        updateVehicleData(originalIdx, "sealNo", val);
                                      }}
                                      placeholder="Seal 1"
                                    />
                                  </div>

                                  {/* Cargo Weight */}
                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                      Cargo Wt (kg)
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      className="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                      value={container.cargoTotalWeight || ""}
                                      onChange={(e) =>
                                        updateVehicleData(
                                          originalIdx,
                                          "cargoTotalWeight",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Cargo Weight"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleBasicDetailsTable;
