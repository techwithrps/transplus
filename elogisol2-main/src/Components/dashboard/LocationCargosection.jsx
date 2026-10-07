import React from "react";
import LocationSearchInput from "./LocationSearchInput";
import CustomerSearchInput from "../dashboard/CustomerSearchinput";

const LocationsCargoSection = ({
  safeRequestData,
  setRequestData,
  useOpenStreetMap,
  setUseOpenStreetMap,
}) => {
  const shouldForceLoadedStatus = (vehicleType) => {
    const alwaysLoadedTypes = [
      "Tr-4",
      "Tr-5",
      "Tr-8",
      "Tr-9",
      "Single Car Carrier",
    ];
    return alwaysLoadedTypes.includes(vehicleType);
  };

  // New helper function to check if commodity should be locked to VIN
  const shouldLockCommodityToVIN = (vehicleType) => {
    const vinTypes = ["Tr-4", "Tr-5", "Tr-8", "Tr-9", "Single Car Carrier"];
    return vinTypes.includes(vehicleType);
  };

  const currentVehicleStatus = shouldForceLoadedStatus(
    safeRequestData.vehicle_type
  )
    ? "Loaded"
    : safeRequestData.vehicle_status;

  const handleCheckboxChange = (e) => {
    setUseOpenStreetMap(e.target.checked);
  };

  return (
    <>
      {/* Consignee and Consigner Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Consignee</label>
          <CustomerSearchInput
            value={safeRequestData.consignee}
            onChange={(value) =>
              setRequestData({ ...safeRequestData, consignee: value })
            }
            placeholder="Search and select consignee"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Consigner</label>
          <CustomerSearchInput
            value={safeRequestData.consigner}
            onChange={(value) =>
              setRequestData({ ...safeRequestData, consigner: value })
            }
            placeholder="Search and select consigner"
          />
        </div>
      </div>

      {/* Map Selection Checkbox */}
      <div className="my-1.5">
        <label className="bg-blue-50/80 hover:bg-blue-50 py-1.5 px-3 rounded-md border border-blue-200 inline-flex items-center text-sm font-medium text-blue-800 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={useOpenStreetMap}
            onChange={handleCheckboxChange}
            className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          Use Google Map
        </label>
      </div>

      {/* Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Pickup Location
          </label>
          <LocationSearchInput
            value={safeRequestData.pickup_location}
            onChange={(value) =>
              setRequestData((prev) => ({
                ...prev,
                pickup_location: value,
              }))
            }
            placeholder="Enter pickup location"
            useOpenStreetMap={useOpenStreetMap}
          />
        </div>
        {currentVehicleStatus === "Loaded" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Stuffing Location
            </label>
            <LocationSearchInput
              value={safeRequestData.stuffing_location}
              onChange={(value) =>
                setRequestData((prev) => ({
                  ...prev,
                  stuffing_location: value,
                }))
              }
              placeholder="Enter stuffing location"
              useOpenStreetMap={useOpenStreetMap}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Delivery Location
          </label>
          <LocationSearchInput
            value={safeRequestData.delivery_location}
            onChange={(value) =>
              setRequestData((prev) => ({
                ...prev,
                delivery_location: value,
              }))
            }
            placeholder="Enter delivery location"
            useOpenStreetMap={useOpenStreetMap}
          />
        </div>
      </div>

      {/* Cargo Details (only when Loaded) */}
      {currentVehicleStatus === "Loaded" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Commodity/Cargo
            </label>
            {shouldLockCommodityToVIN(safeRequestData.vehicle_type) ? (
              <div>
                <input
                  type="text"
                  className="w-full h-10 border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-600"
                  value="VIN"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  This trip type automatically uses VIN as commodity
                </p>
              </div>
            ) : (
              <input
                type="text"
                className="w-full h-10 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={safeRequestData.commodity}
                onChange={(e) =>
                  setRequestData({
                    ...safeRequestData,
                    commodity: e.target.value,
                  })
                }
                required
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cargo Type</label>
            <select
              className="w-full h-10 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={safeRequestData.cargo_type}
              onChange={(e) =>
                setRequestData({
                  ...safeRequestData,
                  cargo_type: e.target.value,
                })
              }
              required
            >
              <option value="">Select Type</option>
              <option value="General">General</option>
              <option value="Hazardous">Hazardous</option>
              <option value="Perishable">Perishable</option>
              <option value="Fragile">Fragile</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Total Weight (KG)
            </label>
            {shouldLockCommodityToVIN(safeRequestData.vehicle_type) ? (
              <div>
                <input
                  type="number"
                  className="w-full h-10 border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-600"
                  value={0}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Weight is automatically set to 0 for this trip type
                </p>
              </div>
            ) : (
              <input
                type="number"
                name="cargo_weight"
                className="w-full h-10 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={safeRequestData.cargo_weight}
                onChange={(e) =>
                  setRequestData((prev) => ({
                    ...prev,
                    cargo_weight: Number(e.target.value),
                  }))
                }
                required
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LocationsCargoSection;
