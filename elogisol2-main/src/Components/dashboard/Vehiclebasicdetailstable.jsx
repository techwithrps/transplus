import React, { useState, useEffect, useRef } from "react";
import { driverAPI, vendorAPI, vehicleAPI } from "../../utils/Api";
import ContainerDetailsPage from "../../Pages/Containerdetailspage";

const VendorSearchInput = ({ value, onChange, placeholder }) => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Self option object
  const selfOption = {
    VENDOR_ID: "SELF",
    VENDOR_NAME: "Self",
    VENDOR_CODE: "SELF",
    CITY: "Own Vehicles",
    ADDRESS: "Own Vehicles",
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const response = await vehicleAPI.getAllvehicles();
        const vehiclesData = response.data || response || [];
        if (Array.isArray(vehiclesData)) {
          setVehicles(vehiclesData);
        } else {
          console.error("Vehicles data is not an array:", vehiclesData);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const response = await vendorAPI.getAllVendors();
        const vendorsData = response.data || response || [];
        if (Array.isArray(vendorsData)) {
          // Always add "Self" option at the beginning
          const vendorsWithSelf = [selfOption, ...vendorsData];
          setVendors(vendorsWithSelf);
          setFilteredVendors(vendorsWithSelf);
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
        // Even if API fails, show Self option
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

  // Simple dropdown position calculation
  const calculateDropdownPosition = () => {
    if (!inputRef.current) return;

    const inputRect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 200; // Fixed smaller height

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
    // Delay calculation to ensure filteredVendors is updated
    setTimeout(calculateDropdownPosition, 0);
  };

  // Handle click outside to close dropdown
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
  }, [isOpen, filteredVendors.length]);

  // Simple dropdown position styles
  const getDropdownStyles = () => {
    if (!inputRef.current || !isOpen) return { display: "none" };

    const inputRect = inputRef.current.getBoundingClientRect();

    const styles = {
      width: `${Math.max(inputRect.width, 200)}px`,
      maxHeight: "200px", // Fixed height
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

      {/* Improved dropdown with constrained dimensions */}
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
                vendor.VENDOR_ID === "SELF" ? "bg-green-50 font-medium" : ""
              }`}
              onClick={() => {
                setSearchTerm(vendor.VENDOR_NAME);
                onChange(vendor.VENDOR_NAME);
                setIsOpen(false);
              }}
            >
              <div
                className={`font-medium text-gray-900 truncate ${
                  vendor.VENDOR_ID === "SELF" ? "text-green-800" : ""
                }`}
              >
                {vendor.VENDOR_NAME}
                {vendor.VENDOR_ID === "SELF" && (
                  <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                    Own Vehicles
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {vendor.VENDOR_CODE || "No code"} |{" "}
                {vendor.CITY || vendor.ADDRESS || "No location"}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredVendors.length === 0 && searchTerm && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-300 rounded-md shadow-lg"
          style={getDropdownStyles()}
        >
          <div className="px-3 py-2 text-gray-500 text-sm">
            No vendors found matching "{searchTerm}"
          </div>
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
  const [vendorId, setVendorId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const [vehicles, setVehicles] = useState([]);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // First effect to get vendor ID when vendor name changes
  useEffect(() => {
    const getVendorId = async () => {
      if (!vendorName) {
        setVendorId(null);
        return;
      }

      // Handle "Self" vendor specially
      if (vendorName === "Self") {
        setVendorId("SELF");
        return;
      }

      try {
        console.log("Fetching vendors for name:", vendorName);
        const vendorsResponse = await vendorAPI.getAllVendors();
        const vendors = vendorsResponse.data || vendorsResponse || [];
        console.log("All vendors:", vendors);
        const vendor = vendors.find((v) => v.VENDOR_NAME === vendorName);

        if (vendor) {
          console.log("Found vendor:", vendor);
          setVendorId(vendor.VENDOR_ID);
        } else {
          console.log("No vendor found with name:", vendorName);
          setVendorId(null);
        }
      } catch (error) {
        console.error("Error fetching vendor ID:", error);
        setVendorId(null);
      }
    };

    getVendorId();
  }, [vendorName]);

  // Second effect to fetch drivers/vehicles when vendor ID changes
  useEffect(() => {
    const fetchData = async () => {
      if (!vendorId) {
        console.log("No vendor ID, clearing drivers");
        setDrivers([]);
        setFilteredDrivers([]);
        setVehicles([]);
        return;
      }

      setLoading(true);
      try {
        if (vendorId === "SELF") {
          // Fetch vehicles for self option
          console.log("Fetching vehicles for Self option");
          const vehiclesResponse = await vehicleAPI.getAllvehicles();
          console.log("Vehicles response for SELF:", vehiclesResponse);

          // Handle different response structures
          let vehiclesData = [];
          if (vehiclesResponse && Array.isArray(vehiclesResponse)) {
            vehiclesData = vehiclesResponse;
          } else if (
            vehiclesResponse &&
            vehiclesResponse.data &&
            Array.isArray(vehiclesResponse.data)
          ) {
            vehiclesData = vehiclesResponse.data;
          } else if (
            vehiclesResponse &&
            Array.isArray(vehiclesResponse.vehicles)
          ) {
            vehiclesData = vehiclesResponse.vehicles;
          } else {
            console.warn(
              "Unexpected vehicles response structure:",
              vehiclesResponse
            );
            vehiclesData = [];
          }

          console.log("Processed vehicles data:", vehiclesData);
          console.log("Number of vehicles found:", vehiclesData.length);

          if (vehiclesData.length === 0) {
            console.warn("No vehicles found in response");
            setDrivers([]);
            setFilteredDrivers([]);
            setVehicles([]);
            return;
          }

          // Convert vehicles to driver-like format for compatibility
          const vehicleDrivers = vehiclesData.map((vehicle, index) => {
            console.log(`Processing vehicle ${index + 1}:`, vehicle);

            const driverName =
              vehicle.OWNER_NAME ||
              vehicle.owner_name ||
              `Owner of ${
                vehicle.VEHICLE_NUMBER ||
                vehicle.vehicle_number ||
                "Unknown Vehicle"
              }`;

            const vehicleNumber =
              vehicle.VEHICLE_NUMBER ||
              vehicle.vehicle_number ||
              vehicle.VEHICLE_NO ||
              "";
            const ownerContact =
              vehicle.OWNER_CONTACT ||
              vehicle.owner_contact ||
              vehicle.CONTACT_NO ||
              "";
            const vehicleType =
              vehicle.VEHICLE_TYPE || vehicle.vehicle_type || "";
            const make = vehicle.MAKE || vehicle.make || "";
            const model = vehicle.MODEL || vehicle.model || "";
            const year = vehicle.YEAR || vehicle.year || "";
            const vehicleId =
              vehicle.VEHICLE_ID || vehicle.vehicle_id || vehicle.id || index;

            return {
              DRIVER_ID: `VEHICLE_${vehicleId}`,
              DRIVER_NAME: driverName,
              CONTACT_NO: ownerContact,
              MOBILE_NO: ownerContact,
              DL_NO: "", // Vehicles don't have driver license info
              DL_RENEWABLE_DATE: null,
              VEHICLE_NO: vehicleNumber,
              VEHICLE_ID: vehicleId,
              VEHICLE_TYPE: vehicleType,
              MAKE: make,
              MODEL: model,
              YEAR: year,
              IS_SELF_VEHICLE: true, // Flag to identify self vehicles
            };
          });

          console.log("Converted vehicle drivers:", vehicleDrivers);

          setDrivers(vehicleDrivers);
          setFilteredDrivers(vehicleDrivers);
          setVehicles(vehiclesData);
        } else {
          // Fetch drivers for regular vendor
          console.log("Fetching drivers for vendor ID:", vendorId);
          const driversResponse = await driverAPI.getDriversByVendorId(
            vendorId
          );
          console.log("Drivers response:", driversResponse);
          const driversData = driversResponse.data || driversResponse || [];
          console.log("Drivers data:", driversData);
          setDrivers(driversData);
          setFilteredDrivers(driversData);
          setVehicles([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          response: error.response,
        });
        setDrivers([]);
        setFilteredDrivers([]);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vendorId]);

  useEffect(() => {
    if (searchTerm && drivers.length > 0) {
      const filtered = drivers.filter((d) =>
        d.DRIVER_NAME.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDrivers(filtered);
    } else {
      setFilteredDrivers(drivers);
    }
  }, [searchTerm, drivers]);

  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  // Simple dropdown position calculation
  const calculateDropdownPosition = () => {
    if (!inputRef.current) return;

    const inputRect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 200; // Fixed smaller height

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

  // Handle click outside to close dropdown
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
      window.addEventListener("scroll", calculateDropdownPosition, true);
      window.addEventListener("resize", calculateDropdownPosition);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", calculateDropdownPosition, true);
      window.removeEventListener("resize", calculateDropdownPosition);
    };
  }, [isOpen, filteredDrivers.length]);

  // Simple dropdown position styles
  const getDropdownStyles = () => {
    if (!inputRef.current || !isOpen) return { display: "none" };

    const inputRect = inputRef.current.getBoundingClientRect();

    const styles = {
      width: `${Math.max(inputRect.width, 250)}px`, // Increased width for vehicle info
      maxHeight: "200px", // Fixed height
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

  // Helper function to format vehicle info
  const getVehicleInfo = (driver) => {
    if (vendorId === "SELF" || driver.IS_SELF_VEHICLE) {
      // For self vehicles, show more detailed info
      const vehicleInfo = [];
      if (driver.VEHICLE_NO) vehicleInfo.push(`${driver.VEHICLE_NO}`);
      if (driver.VEHICLE_TYPE) vehicleInfo.push(`(${driver.VEHICLE_TYPE})`);
      if (driver.MAKE && driver.MODEL)
        vehicleInfo.push(`${driver.MAKE} ${driver.MODEL}`);

      return vehicleInfo.length > 0 ? vehicleInfo.join(" ") : "Own Vehicle";
    } else {
      // For vendor drivers
      if (driver.VEHICLE_NO) {
        return `Vehicle: ${driver.VEHICLE_NO}`;
      } else if (driver.VEHICLE_ID) {
        return `Vehicle ID: ${driver.VEHICLE_ID}`;
      } else {
        return "No vehicle assigned";
      }
    }
  };

  // Helper function to get contact info
  const getContactInfo = (driver) => {
    const contact = driver.CONTACT_NO || driver.MOBILE_NO;
    const license = driver.DL_NO;

    if (vendorId === "SELF" || driver.IS_SELF_VEHICLE) {
      // For self vehicles, show owner contact and year
      const info = [];
      if (contact) info.push(contact);
      if (driver.YEAR) info.push(`Year: ${driver.YEAR}`);
      return info.length > 0 ? info.join(" | ") : "No contact info";
    } else {
      // For vendor drivers
      if (contact && license) {
        return `${contact} | License: ${license}`;
      } else if (contact) {
        return contact;
      } else if (license) {
        return `License: ${license}`;
      } else {
        return "No contact info";
      }
    }
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

      {/* Enhanced dropdown with vehicle information */}
      {isOpen && filteredDrivers.length > 0 && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto"
          style={getDropdownStyles()}
        >
          {filteredDrivers.map((driver) => (
            <div
              key={driver.DRIVER_ID}
              className={`px-3 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                vendorId === "SELF" || driver.IS_SELF_VEHICLE
                  ? "bg-green-50"
                  : ""
              }`}
              onClick={() => {
                console.log("Selected driver/vehicle:", driver);
                setSearchTerm(driver.DRIVER_NAME);
                onChange(driver.DRIVER_NAME, driver);
                setIsOpen(false);
              }}
            >
              <div className="font-medium text-gray-900 truncate">
                {driver.DRIVER_NAME}
                {(vendorId === "SELF" || driver.IS_SELF_VEHICLE) && (
                  <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                    Own
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 truncate mt-1">
                {getContactInfo(driver)}
              </div>
              <div
                className={`text-sm truncate mt-1 ${
                  vendorId === "SELF" || driver.IS_SELF_VEHICLE
                    ? "text-green-600"
                    : "text-blue-600"
                }`}
              >
                {getVehicleInfo(driver)}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredDrivers.length === 0 && searchTerm && !loading && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-300 rounded-md shadow-lg"
          style={getDropdownStyles()}
        >
          <div className="px-3 py-2 text-gray-500 text-sm">
            {vendorId === "SELF"
              ? `No vehicles found matching "${searchTerm}"`
              : `No drivers found matching "${searchTerm}"`}
          </div>
        </div>
      )}

      {isOpen &&
        filteredDrivers.length === 0 &&
        !searchTerm &&
        !loading &&
        vendorName && (
          <div
            ref={dropdownRef}
            className="fixed bg-white border border-gray-300 rounded-md shadow-lg"
            style={getDropdownStyles()}
          >
            <div className="px-3 py-2 text-gray-500 text-sm">
              {vendorId === "SELF"
                ? "No vehicles available"
                : "No drivers available for this vendor"}
            </div>
          </div>
        )}

      {!vendorName && isOpen && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-300 rounded-md shadow-lg"
          style={getDropdownStyles()}
        >
          <div className="px-3 py-2 text-gray-500 text-sm">
            Please select a vendor first
          </div>
        </div>
      )}
    </>
  );
};

// Updated table component with vehicle number auto-fill
// Add this function at the top of your VehicleBasicDetailsTable component
const VehicleBasicDetailsTable = ({ vehicleDataList, updateVehicleData }) => {
  // Add this function to filter unique vehicles by vehicle number
  const getUniqueVehicles = (vehicles) => {
    // If no vehicles or empty array, return at least one empty vehicle
    if (!vehicles || vehicles.length === 0) {
      return [
        {
          vehicleIndex: 1,
          vendorName: "",
          transporterName: "",
          vehicleNumber: "",
          driverName: "",
          driverContact: "",
          licenseNumber: "",
          licenseExpiry: "",
        },
      ];
    }

    const seenVehicleNumbers = new Set();
    const uniqueVehicles = [];

    vehicles.forEach((vehicle, index) => {
      const vehicleNumber = vehicle.vehicleNumber?.trim().toUpperCase();

      // For empty vehicle numbers, always include them (for new entries)
      if (!vehicleNumber) {
        uniqueVehicles.push(vehicle);
        return;
      }

      // If vehicle number is already seen, skip it
      if (seenVehicleNumbers.has(vehicleNumber)) {
        console.log(
          `Skipping duplicate vehicle number: ${vehicleNumber} at index ${index}`
        );
        return;
      }

      // Add to seen set and unique vehicles array
      seenVehicleNumbers.add(vehicleNumber);
      uniqueVehicles.push(vehicle);
    });

    // Ensure at least one row is always shown
    if (uniqueVehicles.length === 0) {
      uniqueVehicles.push({
        vehicleIndex: 1,
        vendorName: "",
        transporterName: "",
        vehicleNumber: "",
        driverName: "",
        driverContact: "",
        licenseNumber: "",
        licenseExpiry: "",
      });
    }

    console.log(
      `Filtered ${vehicles.length} vehicles down to ${uniqueVehicles.length} unique vehicles`
    );
    return uniqueVehicles;
  };

  // Filter the vehicle data list to show only unique vehicle numbers
  const uniqueVehicleDataList = getUniqueVehicles(vehicleDataList);

  // Rest of your existing validation and handler functions remain the same...
  const validateVehicleData = (field, value) => {
    switch (field) {
      case "vehicleNumber":
        return /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(value);
      case "driverName":
        return value.length >= 3 && /^[A-Za-z.\s]+$/.test(value);
      case "driverContact":
        return /^\d{10}$/.test(value);
      case "licenseNumber":
        return value.length >= 5 && /^[A-Z0-9]+$/.test(value);
      case "licenseExpiry":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiryDate = new Date(value);
        return expiryDate >= today;
      default:
        return true;
    }
  };

  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (index, field, value) => {
    // Find the original index in vehicleDataList for this unique vehicle
    const originalIndex = vehicleDataList.findIndex(
      (v) => v.vehicleIndex === uniqueVehicleDataList[index].vehicleIndex
    );

    updateVehicleData(originalIndex, field, value);
    const isValid = validateVehicleData(field, value);
    setValidationErrors((prev) => ({
      ...prev,
      [`${originalIndex}-${field}`]: isValid
        ? null
        : `Invalid ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
    }));
  };

  const handleVendorChange = (index, vendorName) => {
    // Find the original index in vehicleDataList for this unique vehicle
    const originalIndex = vehicleDataList.findIndex(
      (v) => v.vehicleIndex === uniqueVehicleDataList[index].vehicleIndex
    );

    updateVehicleData(originalIndex, "vendorName", vendorName);
    updateVehicleData(originalIndex, "transporterName", vendorName);
  };

  const handleDriverSelection = (index, driverName, driverData) => {
    // Find the original index in vehicleDataList for this unique vehicle
    const originalIndex = vehicleDataList.findIndex(
      (v) => v.vehicleIndex === uniqueVehicleDataList[index].vehicleIndex
    );

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
    } else {
      updateVehicleData(originalIndex, "driverName", driverName);
    }
  };

  const getVendorName = (vehicle) => {
    return vehicle.vendorName || vehicle.transporterName || "";
  };

  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Vehicle & Driver Information
        <span className="text-sm font-normal text-gray-500 ml-2">
          (All fields marked with * are required)
        </span>
      </h4>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Vehicle #
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                Vendor Name *
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                Vehicle Number *
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                Assigner Name *
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                Driver Contact *
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {uniqueVehicleDataList.map((vehicle, index) => {
              // Find original index for this vehicle
              const originalIndex = vehicleDataList.findIndex(
                (v) => v.vehicleIndex === vehicle.vehicleIndex
              );

              // Find all container rows associated with this physical vehicle
              const vehicleNumberClean = vehicle.vehicleNumber?.trim().toUpperCase();
              const associatedContainers = vehicleDataList
                .map((v, vIdx) => ({ ...v, originalIndex: vIdx }))
                .filter((v) => {
                  if (vehicleNumberClean) {
                    return v.vehicleNumber?.trim().toUpperCase() === vehicleNumberClean;
                  }
                  return v.vehicleIndex === vehicle.vehicleIndex;
                });

              return (
                <React.Fragment key={`vehicle-group-${vehicle.vehicleIndex || index}`}>
                  {/* PARENT VEHICLE ROW */}
                  <tr className="hover:bg-gray-50 bg-white">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <VendorSearchInput
                        value={getVendorName(vehicle)}
                        onChange={(value) => handleVendorChange(index, value)}
                        placeholder="Search and select vendor"
                      />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div>
                        <input
                          type="text"
                          className={`w-full min-w-[140px] border ${
                            validationErrors[`${originalIndex}-vehicleNumber`]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-800`}
                          value={vehicle.vehicleNumber}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            handleInputChange(index, "vehicleNumber", val);
                            // Also sync vehicleNumber to all associated container rows for this truck
                            associatedContainers.forEach((c) => {
                              if (c.originalIndex !== originalIndex) {
                                updateVehicleData(c.originalIndex, "vehicleNumber", val);
                              }
                            });
                          }}
                          placeholder="e.g., MH01AB1234"
                          pattern="[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}"
                          title="Vehicle number format: MH01AB1234"
                          required
                        />
                        {validationErrors[`${originalIndex}-vehicleNumber`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {validationErrors[`${originalIndex}-vehicleNumber`]}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <DriverSearchInput
                        value={vehicle.driverName}
                        onChange={(value, driverData) =>
                          handleDriverSelection(index, value, driverData)
                        }
                        vendorName={getVendorName(vehicle)}
                        placeholder="Select driver"
                      />
                      {validationErrors[`${originalIndex}-driverName`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {validationErrors[`${originalIndex}-driverName`]}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div>
                        <input
                          type="tel"
                          className={`w-full min-w-[160px] border ${
                            validationErrors[`${originalIndex}-driverContact`]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          value={vehicle.driverContact}
                          onChange={(e) =>
                            handleInputChange(
                              index,
                              "driverContact",
                              e.target.value.replace(/\D/g, "").slice(0, 10)
                            )
                          }
                          placeholder="10-digit mobile number"
                          pattern="\d{10}"
                          maxLength="10"
                          required
                        />
                        {validationErrors[`${originalIndex}-driverContact`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {validationErrors[`${originalIndex}-driverContact`]}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* NESTED SUB-TREE ROW FOR CONTAINERS */}
                  <tr className="bg-slate-50/60">
                    <td colSpan="5" className="px-4 py-2 border-b border-gray-200">
                      <div className="ml-4 pl-3 border-l-2 border-blue-400 py-1.5 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span className="flex items-center space-x-1.5">
                            <span className="text-blue-600 font-bold">↳</span>
                            <span>Assigned Containers ({associatedContainers.length})</span>
                          </span>
                          {associatedContainers.length === 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                // Add twin container for this physical vehicle
                                const newContainerRow = {
                                  ...vehicle,
                                  id: null,
                                  vehicleIndex: vehicleDataList.length + 1,
                                  containerNo: "",
                                  containerSize: "20",
                                  containerType: "DV",
                                  line: vehicle.line || "",
                                  seal1: "",
                                  seal2: "",
                                  containerTotalWeight: "",
                                  cargoTotalWeight: "",
                                };
                                updateVehicleData(vehicleDataList.length, "_insert_new_row", newContainerRow);
                              }}
                              className="text-[11px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-colors"
                            >
                              + Add Twin 20ft Container
                            </button>
                          )}
                        </div>

                        {/* Containers List in Sub-Tree */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {associatedContainers.map((container, cIdx) => (
                            <div
                              key={`container-${container.originalIndex || cIdx}`}
                              className="bg-white border border-slate-200 rounded-md p-2.5 shadow-2xs space-y-2"
                            >
                              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded text-[10px]">
                                    Container #{cIdx + 1}
                                  </span>
                                  <span className="text-slate-500 font-normal">
                                    on {vehicle.vehicleNumber || `Vehicle ${index + 1}`}
                                  </span>
                                </span>
                                {associatedContainers.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Remove this twin container row
                                      updateVehicleData(container.originalIndex, "_remove_row", null);
                                    }}
                                    className="text-[10px] text-red-500 hover:text-red-700 font-medium"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                <div>
                                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                    Container No *
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-1 text-xs uppercase font-mono font-semibold focus:ring-1 focus:ring-blue-500"
                                    value={container.containerNo || ""}
                                    onChange={(e) =>
                                      updateVehicleData(
                                        container.originalIndex,
                                        "containerNo",
                                        e.target.value.toUpperCase()
                                      )
                                    }
                                    placeholder="e.g. MSDU1234567"
                                    maxLength="11"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                    Size
                                  </label>
                                  <select
                                    className="w-full border border-gray-300 rounded p-1 text-xs bg-white focus:ring-1 focus:ring-blue-500"
                                    value={container.containerSize || "20"}
                                    onChange={(e) =>
                                      updateVehicleData(
                                        container.originalIndex,
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

                                <div>
                                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                    Type
                                  </label>
                                  <select
                                    className="w-full border border-gray-300 rounded p-1 text-xs bg-white focus:ring-1 focus:ring-blue-500"
                                    value={container.containerType || "DV"}
                                    onChange={(e) =>
                                      updateVehicleData(
                                        container.originalIndex,
                                        "containerType",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="DV">DV (Dry Van)</option>
                                    <option value="HQ">HQ (High Cube)</option>
                                    <option value="OT">OT (Open Top)</option>
                                    <option value="FR">FR (Flat Rack)</option>
                                    <option value="RF">RF (Reefer)</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                    Shipping Line
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-1 text-xs uppercase focus:ring-1 focus:ring-blue-500"
                                    value={container.line || ""}
                                    onChange={(e) =>
                                      updateVehicleData(
                                        container.originalIndex,
                                        "line",
                                        e.target.value.toUpperCase()
                                      )
                                    }
                                    placeholder="Line (e.g. MAERSK)"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                    Seal No
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-1 text-xs uppercase focus:ring-1 focus:ring-blue-500"
                                    value={container.seal1 || container.sealNo || ""}
                                    onChange={(e) => {
                                      updateVehicleData(container.originalIndex, "seal1", e.target.value.toUpperCase());
                                      updateVehicleData(container.originalIndex, "sealNo", e.target.value.toUpperCase());
                                    }}
                                    placeholder="Seal 1"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                    Cargo Weight (MT)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="w-full border border-gray-300 rounded p-1 text-xs focus:ring-1 focus:ring-blue-500"
                                    value={container.cargoTotalWeight || ""}
                                    onChange={(e) =>
                                      updateVehicleData(
                                        container.originalIndex,
                                        "cargoTotalWeight",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Weight"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
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
