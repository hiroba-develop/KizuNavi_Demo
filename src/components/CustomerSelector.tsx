import React from "react";
import { useCustomer } from "../context/CustomerContext";
import { useAuth } from "../context/AuthContext";
import { THEME_COLORS } from "../types";

interface CustomerSelectorProps {
  showPeriod?: boolean;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  showPeriod = false,
}) => {
  const {
    selectedCustomerId,
    setSelectedCustomerId,
    selectedPeriod,
    setSelectedPeriod,
    customers,
    periods,
  } = useCustomer();

  const { user } = useAuth();
  const isMaster = user?.role === "master";

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomerId(e.target.value);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(e.target.value);
  };

  // 現在選択されている顧客名を取得
  const selectedCustomerName =
    customers.find((c) => c.id === selectedCustomerId)?.name || "";

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">顧客選択:</span>
        {isMaster ? (
          <select
            value={selectedCustomerId}
            onChange={handleCustomerChange}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-[180px]"
            style={{ borderColor: THEME_COLORS.border }}
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        ) : (
          <span
            className="px-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
            style={{ borderColor: THEME_COLORS.border }}
          >
            {selectedCustomerName}
          </span>
        )}
      </div>

      {showPeriod && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">実施日:</span>
          <select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-[180px]"
            style={{ borderColor: THEME_COLORS.border }}
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
