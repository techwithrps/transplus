import React from "react";

const VehicleChargesTable = ({
  vehicleDataList,
  services,
  updateVehicleData,
}) => {
  // Add deduplication function for charges table
  const getUniqueVehicles = (vehicles) => {
    // If no vehicles or empty array, return at least one empty vehicle
    if (!vehicles || vehicles.length === 0) {
      return [
        {
          vehicleIndex: 1,
          vehicleNumber: "",
          serviceCharges: {},
          additionalCharges: 0,
          totalCharge: 0,
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
          `Skipping duplicate vehicle number in charges: ${vehicleNumber} at index ${index}`
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
        vehicleNumber: "",
        serviceCharges: {},
        additionalCharges: 0,
        totalCharge: 0,
      });
    }

    console.log(
      `Charges table: Filtered ${vehicles.length} vehicles down to ${uniqueVehicles.length} unique vehicles`
    );
    return uniqueVehicles;
  };

  // Filter the vehicle data list to show only unique vehicle numbers
  const uniqueVehicleDataList = getUniqueVehicles(vehicleDataList);

  const handleServiceChargeChange = (index, serviceName, value) => {
    // Find the original index in vehicleDataList for this unique vehicle
    const originalIndex = vehicleDataList.findIndex(
      (v) => v.vehicleIndex === uniqueVehicleDataList[index].vehicleIndex
    );

    const vehicle = vehicleDataList[originalIndex];
    const updatedCharges = {
      ...vehicle.serviceCharges,
      [serviceName]: value,
    };

    updateVehicleData(originalIndex, "serviceCharges", updatedCharges);

    const serviceTotal = Object.values(updatedCharges).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );

    updateVehicleData(originalIndex, "totalCharge", serviceTotal);
  };

  const handleAdditionalChargeChange = (index, value) => {
    // Find the original index in vehicleDataList for this unique vehicle
    const originalIndex = vehicleDataList.findIndex(
      (v) => v.vehicleIndex === uniqueVehicleDataList[index].vehicleIndex
    );

    updateVehicleData(originalIndex, "additionalCharges", value);
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 mb-2">
        Vehicle Charges
      </h4>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2.5 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-32">
                Vehicle Number
              </th>

              {services.map((serviceName) => (
                <th
                  key={serviceName}
                  className="px-2.5 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider min-w-[130px]"
                >
                  Vendor Charges (INR)
                </th>
              ))}
              <th className="px-2.5 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">
                Additional Charges (INR)
              </th>
              <th className="px-2.5 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">
                Total Charge (INR)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Use uniqueVehicleDataList instead of vehicleDataList */}
            {uniqueVehicleDataList.map((vehicle, index) => (
              <tr
                key={`charges-${vehicle.vehicleIndex || index}`}
                className="hover:bg-gray-50"
              >
                <td className="px-2.5 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {vehicle.vehicleNumber ||
                      `Vehicle ${vehicle.vehicleIndex || index + 1}`}
                  </span>
                </td>

                {services.map((serviceName) => (
                  <td key={serviceName} className="px-2.5 py-2 whitespace-nowrap">
                    <input
                      type="number"
                      className="w-full min-w-[120px] h-8.5 border border-gray-300 rounded-md px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      value={vehicle.serviceCharges?.[serviceName] || ""}
                      onChange={(e) =>
                        handleServiceChargeChange(
                          index,
                          serviceName,
                          e.target.value
                        )
                      }
                      placeholder={`${serviceName} charge`}
                      min="0"
                      step="0.01"
                    />
                  </td>
                ))}
                <td className="px-2.5 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    className="w-full min-w-[120px] h-8.5 border border-gray-300 rounded-md px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={vehicle.additionalCharges || ""}
                    onChange={(e) =>
                      handleAdditionalChargeChange(index, e.target.value)
                    }
                    placeholder="Additional charges"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="px-2.5 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full min-w-[140px] h-8.5 border border-gray-300 rounded-md px-2.5 py-1 text-xs bg-gray-50 cursor-not-allowed font-semibold text-gray-900"
                    value={`₹${(vehicle.totalCharge || 0).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`}
                    readOnly
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleChargesTable;
