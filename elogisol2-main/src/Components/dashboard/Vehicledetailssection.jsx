import React from "react";
import CustomerSearchInput from "../dashboard/CustomerSearchinput";

const VehicleDetailsSection = ({
  safeRequestData,
  setRequestData,
  createTransporterDetailsArray,
}) => {
  // Helper functions
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

  const shouldRestrictToSingleVehicle = (vehicleType) => {
    const singleVehicleTypes = [
      "Tr-4",
      "Tr-5",
      "Tr-8",
      "Tr-9",
      "Single Car Carrier",
    ];
    return singleVehicleTypes.includes(vehicleType);
  };

  const shouldShowContainerDetails = (vehicleType) => {
    return vehicleType === "Trailer";
  };

  const shouldShow40ftOption = (vehicleType) => {
    return vehicleType !== "Ven";
  };

  const currentNoOfVehicles = parseInt(safeRequestData.no_of_vehicles) || 1;
  const currentVehicleStatus = shouldForceLoadedStatus(
    safeRequestData.vehicle_type
  )
    ? "Loaded"
    : safeRequestData.vehicle_status;
  const isRestrictedToSingleVehicle = shouldRestrictToSingleVehicle(
    safeRequestData.vehicle_type
  );

  return (
    <>
      {/* SHIPA NO and Vehicle Type - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div>
          <label htmlFor="shipa_no" className="block text-xs font-semibold text-gray-700 mb-1">
            SIPA NO
          </label>
          <CustomerSearchInput
            value={safeRequestData.SHIPA_NO || ""}
            onChange={(value) =>
              setRequestData((prev) => ({
                ...prev,
                SHIPA_NO: value,
              }))
            }
            placeholder="Search and select SHIPA NO (e.g., SHIP20250813001)"
            required={!safeRequestData.id} // Required for new requests, optional for updates
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Type</label>
          <select
            name="vehicle_type"
            className="w-full h-8.5 border border-gray-300 rounded-md px-2.5 py-1 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={safeRequestData.vehicle_type}
            onChange={(e) => {
              const newVehicleType = e.target.value;
              const newVehicleStatus = shouldForceLoadedStatus(newVehicleType)
                ? "Loaded"
                : "Empty";
              const newNoOfVehicles = shouldRestrictToSingleVehicle(
                newVehicleType
              )
                ? 1
                : safeRequestData.no_of_vehicles;

              setRequestData((prev) => ({
                ...prev,
                vehicle_type: newVehicleType,
                vehicle_size: "",
                trailerSize: "",
                truckSize: "",
                vehicle_status: newVehicleStatus,
                no_of_vehicles: newNoOfVehicles,
                transporterDetails: createTransporterDetailsArray(
                  newNoOfVehicles,
                  prev.transporterDetails || []
                ),
                containers_20ft: shouldShowContainerDetails(newVehicleType)
                  ? prev.containers_20ft
                  : 0,
                containers_40ft: shouldShowContainerDetails(newVehicleType)
                  ? prev.containers_40ft
                  : 0,
                total_containers: shouldShowContainerDetails(newVehicleType)
                  ? prev.total_containers
                  : 0,
                stuffing_location:
                  newVehicleStatus === "Loaded" ? prev.stuffing_location : "",
                commodity: newVehicleStatus === "Loaded" ? prev.commodity : "",
                cargo_type:
                  newVehicleStatus === "Loaded" ? prev.cargo_type : "",
                cargo_weight:
                  newVehicleStatus === "Loaded" ? prev.cargo_weight : 0,
              }));
            }}
            required
          >
            <option value="">Select Vehicle Type</option>
            <option value="Trailer">Trailer</option>
            <option value="Truck">Truck</option>
          </select>
        </div>
      </div>

      {/* Vehicle Size - Second Row (conditional based on vehicle type) */}
      {safeRequestData.vehicle_type && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {safeRequestData.vehicle_type === "Trailer" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Trailer Size
              </label>
              <input
                type="text"
                name="trailerSize"
                value={
                  safeRequestData.trailerSize ||
                  safeRequestData.vehicle_size ||
                  ""
                }
                onChange={(e) =>
                  setRequestData((prev) => ({
                    ...prev,
                    trailerSize: e.target.value,
                    vehicle_size: e.target.value,
                  }))
                }
                className="w-full h-8.5 border border-gray-300 rounded-md px-2.5 py-1 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter trailer size"
                required
              />
            </div>
          )}

          {safeRequestData.vehicle_type === "Truck" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Truck Size
              </label>
              <input
                type="text"
                name="truckSize"
                value={
                  safeRequestData.truckSize ||
                  safeRequestData.vehicle_size ||
                  ""
                }
                onChange={(e) =>
                  setRequestData((prev) => ({
                    ...prev,
                    truckSize: e.target.value,
                    vehicle_size: e.target.value,
                  }))
                }
                className="w-full h-8.5 border border-gray-300 rounded-md px-2.5 py-1 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter truck size"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Vehicle Status
            </label>
            {shouldForceLoadedStatus(safeRequestData.vehicle_type) ? (
              <div>
                <input
                  type="text"
                  className="w-full h-8.5 border border-gray-300 rounded-md px-2.5 py-1 text-xs bg-gray-100 text-gray-600"
                  value="Loaded"
                  disabled
                />
                <p className="text-[11px] text-gray-500 mt-0.5">
                  This vehicle type is always loaded
                </p>
              </div>
            ) : (
              <select
                name="vehicle_status"
                className="w-full h-8.5 border border-gray-300 rounded-md px-2.5 py-1 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={safeRequestData.vehicle_status}
                onChange={(e) =>
                  setRequestData((prev) => ({
                    ...prev,
                    vehicle_status: e.target.value,
                    stuffing_location:
                      e.target.value === "Empty" ? "" : prev.stuffing_location,
                    containers_20ft:
                      e.target.value === "Empty" ? 0 : prev.containers_20ft,
                    containers_40ft:
                      e.target.value === "Empty" ? 0 : prev.containers_40ft,
                    total_containers:
                      e.target.value === "Empty" ? 0 : prev.total_containers,
                    commodity: e.target.value === "Empty" ? "" : prev.commodity,
                    cargo_type:
                      e.target.value === "Empty" ? "" : prev.cargo_type,
                    cargo_weight:
                      e.target.value === "Empty" ? 0 : prev.cargo_weight,
                  }))
                }
                required
              >
                <option value="Empty">Empty</option>
                <option value="Loaded">Loaded</option>
              </select>
            )}
          </div>
        </div>
      )}

      {/* Container Details - Third Section (only for Trailer) */}
      {shouldShowContainerDetails(safeRequestData.vehicle_type) && (
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-gray-700">
            Container Details
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50/50">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  20' Containers
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full h-8.5 border border-gray-300 rounded-md px-2.5 py-1 text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of 20ft containers"
                  value={safeRequestData.containers_20ft || ""}
                  onChange={(e) => {
                    const c20 = Number(e.target.value) || 0;
                    const c40 = Number(safeRequestData.containers_40ft) || 0;
                    const total = c20 + c40;
                    setRequestData((prev) => ({
                      ...prev,
                      containers_20ft: c20,
                      total_containers: total,
                      no_of_vehicles: total > 0 ? total : 1,
                    }));
                  }}
                />
              </div>
            </div>

            {shouldShow40ftOption(safeRequestData.vehicle_type) && (
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 block">
                    40' Containers
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full h-8.5 border border-gray-300 rounded-md px-2.5 py-1 text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter number of 40ft containers"
                    value={safeRequestData.containers_40ft || ""}
                    onChange={(e) => {
                      const c20 = Number(safeRequestData.containers_20ft) || 0;
                      const c40 = Number(e.target.value) || 0;
                      const total = c20 + c40;
                      setRequestData((prev) => ({
                        ...prev,
                        containers_40ft: c40,
                        total_containers: total,
                        no_of_vehicles: total > 0 ? total : 1,
                      }));
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-600">
            Total Containers: <span className="font-semibold text-gray-800">{safeRequestData.total_containers || 0}</span>
            {(safeRequestData.containers_20ft > 0 ||
              safeRequestData.containers_40ft > 0) && (
              <span className="ml-1.5 text-blue-600 font-medium">
                (
                {safeRequestData.containers_20ft > 0
                  ? `${safeRequestData.containers_20ft} × 20ft`
                  : ""}
                {safeRequestData.containers_20ft > 0 &&
                safeRequestData.containers_40ft > 0
                  ? ", "
                  : ""}
                {safeRequestData.containers_40ft > 0
                  ? `${safeRequestData.containers_40ft} × 40ft`
                  : ""}
                )
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VehicleDetailsSection;
