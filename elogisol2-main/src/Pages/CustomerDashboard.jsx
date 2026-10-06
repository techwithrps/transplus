import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { generateInvoice } from "../utils/pdfGenerator";
import ServiceRequestForm from "../Components/dashboard/Servicerequest";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  Menu,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
} from "lucide-react";
import api, { transporterAPI } from "../utils/Api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import StatsCards from "../Components/dashboard/StatCards";
import { TransporterDetails } from "./Transporterdetails";
import { transportRequestAPI } from "../utils/Api"; // Import the provided API
import EnterpriseTripWorkflow from "../Components/dashboard/EnterpriseTripWorkflow";

export default function CustomerDashboard({
  collapsed,
  toggleSidebar,
  activePage,
  setActivePage,
  mobileMenuOpen,
  toggleMobileMenu,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [requestData, setRequestData] = useState({
    id: null,
    SHIPA_NO: "",
    consignee: "",
    consigner: "",
    vehicle_type: "",
    vehicle_size: "",
    containers_20ft: 0,
    containers_40ft: 0,
    total_containers: 0,
    pickup_location: "",
    stuffing_location: "",
    delivery_location: "",
    commodity: "",
    cargo_type: "",
    cargo_weight: "",
    service_type: [],
    service_prices: {},
    expected_pickup_date: "",
    expected_pickup_time: "",
    expected_delivery_date: "",
    expected_delivery_time: "",
    requested_price: "",
    status: "Pending",
    admin_comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pastRequests, setPastRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requestsPerPage] = useState(10);
  const [transporterData, setTransporterData] = useState({
    transporterName: "",
    vehicleNumber: "",
    driverName: "",
    driverContact: "",
    vendorName: "",
    vendorContact: "",
  });

  // Filtering states
  const [requestId, setRequestId] = useState("");
  const [shipaNo, setShipaNo] = useState("");
  const [containerNo, setContainerNo] = useState("");
  const [consigner, setConsigner] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const transporterCache = useMemo(() => new Map(), []);

  const fetchRequests = useCallback(
    async (page, applyFilters = false) => {
      setLoading(true);
      try {
        const params = { page, limit: requestsPerPage, customer_id: user.id };
        let endpoint = "/transport-requests/all"; // Default endpoint

        if (applyFilters) {
          if (!requestId && !shipaNo && !containerNo && !consigner) {
            toast.info(
              "Please enter a Request ID, SHIPA No, Container No, or Consigner to search."
            );
            setPastRequests([]);
            setTotalPages(1);
            setLoading(false);
            return;
          }
          endpoint = "/transport-requests/filtered";
          if (requestId) params.request_id = requestId;
          if (shipaNo) params.shipa_no = shipaNo;
          if (containerNo) params.container_no = containerNo;
          if (consigner) params.consigner = consigner;
        }

        const response = await api.get(endpoint, { params });
        const {
          requests,
          totalPages: newTotalPages,
          currentPage: newCurrentPage,
        } = response.data;

        const requestsWithContainers = await Promise.all(
          (requests || []).map(async (request) => {
            try {
              const containerResponse =
                await transporterAPI.getContainersByRequestId(request.id);
              return {
                ...request,
                containerDetails:
                  containerResponse.success && containerResponse.data
                    ? containerResponse.data
                    : [],
              };
            } catch (error) {
              console.error(
                `Error fetching containers for request ${request.id}:`,
                error
              );
              return { ...request, containerDetails: [] };
            }
          })
        );

        setPastRequests(requestsWithContainers);
        setTotalPages(newTotalPages || 1);
        setCurrentPage(newCurrentPage || 1);
      } catch (error) {
        console.error("Fetch requests error:", error);
        toast.error(error.message || "Failed to fetch requests");
        setPastRequests([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [user.id, requestsPerPage, requestId, shipaNo, containerNo, consigner]
  );

  useEffect(() => {
    fetchRequests(currentPage, isFiltered);
  }, [currentPage, isFiltered]);

  const handleSearch = () => {
    setCurrentPage(1);
    setIsFiltered(true);
    // fetchRequests will be called by the useEffect
  };

  const refreshData = () => {
    setRequestId("");
    setShipaNo("");
    setContainerNo("");
    setConsigner("");
    setIsFiltered(false);
    setCurrentPage(1);
    // fetchRequests will be called by the useEffect
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (
        !requestData.expected_pickup_date ||
        !requestData.expected_delivery_date
      ) {
        toast.error("Expected pickup and delivery dates are required");
        return;
      }
      const isValidDate = (dateString) =>
        !isNaN(new Date(dateString).getTime());
      if (
        !isValidDate(requestData.expected_pickup_date) ||
        !isValidDate(requestData.expected_delivery_date)
      ) {
        toast.error("Invalid date format");
        return;
      }
      const formatTimeForDatabase = (timeString) =>
        timeString ? `${timeString.trim()}:00` : null;
      const formData = {
        SHIPA_NO: requestData.SHIPA_NO?.trim() || "",
        consignee: requestData.consignee.trim(),
        consigner: requestData.consigner.trim(),
        vehicle_type: requestData.vehicle_type,
        vehicle_size: requestData.vehicle_size,
        vehicle_status: requestData.vehicle_status,
        no_of_vehicles: parseInt(requestData.no_of_vehicles) || 1,
        pickup_location: requestData.pickup_location.trim(),
        stuffing_location: requestData.stuffing_location.trim(),
        delivery_location: requestData.delivery_location.trim(),
        commodity: requestData.commodity.trim(),
        cargo_type: requestData.cargo_type,
        cargo_weight: parseFloat(requestData.cargo_weight) || 0,
        service_type: JSON.stringify(requestData.service_type),
        service_prices: JSON.stringify(requestData.service_prices),
        containers_20ft: parseInt(requestData.containers_20ft) || 0,
        containers_40ft: parseInt(requestData.containers_40ft) || 0,
        total_containers: parseInt(requestData.total_containers) || 0,
        expected_pickup_date: requestData.expected_pickup_date,
        expected_pickup_time: formatTimeForDatabase(
          requestData.expected_pickup_time
        ),
        expected_delivery_date: requestData.expected_delivery_date,
        expected_delivery_time: formatTimeForDatabase(
          requestData.expected_delivery_time
        ),
        requested_price: parseFloat(requestData.requested_price) || 0,
        status: "Pending",
      };
      const isUpdate = Boolean(requestData.id);
      const response = isUpdate
        ? await transportRequestAPI.updateRequest(requestData.id, formData)
        : await transportRequestAPI.createRequest(formData);
      if (response.success) {
        toast.success(
          isUpdate
            ? "Request updated successfully!"
            : "Request created successfully!"
        );
        const requestId = isUpdate ? requestData.id : response.request?.id;
        if (requestId && !isUpdate && response.request) {
          const newRequest = response.request;
          setRequestData({
            id: newRequest.id,
            SHIPA_NO: newRequest.SHIPA_NO || "",
            consignee: newRequest.consignee || "",
            consigner: newRequest.consigner || "",
            vehicle_type: newRequest.vehicle_type || "",
            vehicle_size: newRequest.vehicle_size || "",
            vehicle_status: newRequest.vehicle_status || "Empty",
            no_of_vehicles: newRequest.no_of_vehicles || "1",
            pickup_location: newRequest.pickup_location || "",
            stuffing_location: newRequest.stuffing_location || "",
            delivery_location: newRequest.delivery_location || "",
            commodity: newRequest.commodity || "",
            cargo_type: newRequest.cargo_type || "",
            cargo_weight: parseFloat(newRequest.cargo_weight) || 0,
            service_type: Array.isArray(newRequest.service_type)
              ? newRequest.service_type
              : JSON.parse(newRequest.service_type || "[]"),
            service_prices:
              typeof newRequest.service_prices === "string"
                ? JSON.parse(newRequest.service_prices)
                : newRequest.service_prices || {},
            containers_20ft: parseInt(newRequest.containers_20ft) || 0,
            containers_40ft: parseInt(newRequest.containers_40ft) || 0,
            total_containers: parseInt(newRequest.total_containers) || 0,
            expected_pickup_date: newRequest.expected_pickup_date
              ? newRequest.expected_pickup_date.split("T")[0]
              : "",
            expected_delivery_date: newRequest.expected_delivery_date
              ? newRequest.expected_delivery_date.split("T")[0]
              : "",
            expected_pickup_time: newRequest.expected_pickup_time
              ? newRequest.expected_pickup_time.slice(0, 5)
              : "",
            expected_delivery_time: newRequest.expected_delivery_time
              ? newRequest.expected_delivery_time.slice(0, 5)
              : "",
            requested_price: parseFloat(newRequest.requested_price) || 0,
            status: newRequest.status || "Pending",
            admin_comment: newRequest.admin_comment || "",
          });
          toast.info(`Booking #${requestId} is now loaded for editing`);
        }
        fetchRequests(currentPage, isFiltered); // Refresh current page
      } else {
        toast.error(response.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error.message ||
          "Failed to submit request. Please check all fields and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setRequestData({
      id: null,
      SHIPA_NO: "",
      consignee: "",
      consigner: "",
      vehicle_type: "",
      vehicle_size: "",
      vehicle_status: "Empty",
      containers_20ft: 0,
      containers_40ft: 0,
      no_of_vehicles: "",
      total_containers: 0,
      pickup_location: "",
      stuffing_location: "",
      delivery_location: "",
      commodity: "",
      cargo_type: "",
      cargo_weight: "",
      service_type: [],
      service_prices: {},
      expected_pickup_date: "",
      expected_pickup_time: "",
      expected_delivery_date: "",
      expected_delivery_time: "",
      requested_price: "",
      status: "Pending",
      admin_comment: "",
    });
  };

  const canEditRequest = (status) => status.toLowerCase() !== "completed";

  const handleRequestClick = (request) => {
    if (canEditRequest(request.status)) {
      setRequestData({
        id: request.id,
        SHIPA_NO: request.SHIPA_NO || "",
        consignee: request.consignee || "",
        consigner: request.consigner || "",
        vehicle_type: request.vehicle_type || "",
        vehicle_size: request.vehicle_size || "",
        vehicle_status: request.vehicle_status || "Empty",
        no_of_vehicles: request.no_of_vehicles || "1",
        pickup_location: request.pickup_location || "",
        stuffing_location: request.stuffing_location || "",
        delivery_location: request.delivery_location || "",
        commodity: request.commodity || "",
        cargo_type: request.cargo_type || "",
        cargo_weight: parseFloat(request.cargo_weight) || 0,
        service_type: Array.isArray(request.service_type)
          ? request.service_type
          : JSON.parse(request.service_type || "[]"),
        service_prices:
          typeof request.service_prices === "string"
            ? JSON.parse(request.service_prices)
            : request.service_prices || {},
        containers_20ft: parseInt(request.containers_20ft) || 0,
        containers_40ft: parseInt(request.containers_40ft) || 0,
        total_containers: parseInt(request.total_containers) || 0,
        expected_pickup_date: request.expected_pickup_date
          ? request.expected_pickup_date.split("T")[0]
          : "",
        expected_delivery_date: request.expected_delivery_date
          ? new Date(request.expected_delivery_date).toISOString().split("T")[0]
          : "",
        requested_price: parseFloat(request.requested_price) || 0,
        status: request.status || "Pending",
        admin_comment: request.admin_comment || "",
      });
      document
        .querySelector(".request-form")
        ?.scrollIntoView({ behavior: "smooth" });
      toast.info("Request loaded for editing");
    } else {
      toast.info("Completed requests cannot be edited");
    }
  };

  const handleDownloadInvoice = (request) => {
    try {
      const loadingToast = toast.loading("Generating invoice...");
      const doc = generateInvoice(request);
      if (!doc) throw new Error("Failed to generate PDF document");
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `invoice-${request.id}-${timestamp}.pdf`;
      doc.save(filename);
      toast.dismiss(loadingToast);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Invoice download error:", error);
      toast.error("Failed to generate invoice. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        dot: "bg-green-500",
      },
      "In Progress": {
        bg: "bg-blue-100",
        text: "text-blue-700",
        dot: "bg-blue-500",
      },
      Pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        dot: "bg-yellow-500",
      },
    };
    const config = statusConfig[status] || {
      bg: "bg-gray-100",
      text: "text-gray-700",
      dot: "bg-gray-500",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <span className={`w-2 h-2 rounded-full mr-1 ${config.dot}`}></span>
        {status}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <header className="bg-white shadow-sm flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-600 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative text-gray-600 hover:text-gray-800"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                <div className="p-3 border-b">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="p-4 text-sm text-gray-500">
                  No new notifications
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="flex items-center text-gray-700 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user?.name?.charAt(0) || <User className="h-5 w-5" />}
              </div>
              <span className="ml-2 hidden md:block">
                {user?.name || "User"}
              </span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                <div className="py-2 px-4 border-b">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                  <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto bg-slate-50/60">
        <EnterpriseTripWorkflow user={user} />
      </main>
    </div>
  );
}
