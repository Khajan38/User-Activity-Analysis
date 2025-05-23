// src/DeliveryManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';










// Mock delivery data generator for demo/testing
const generateMockDeliveries = (count = 200) => {
  const statuses = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
  const names = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Lee', 'Catherine Zeta', 'David Kim'];

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const getRandomDate = (start, end) =>
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

  let deliveries = [];
  for (let i = 1; i <= count; i++) {
    deliveries.push({
      id: i.toString(),
      recipientName: getRandom(names),
      address: `${Math.floor(Math.random() * 9999)} ${getRandom(cities)} St`,
      city: getRandom(cities),
      status: getRandom(statuses),
      deliveryDate: getRandomDate(new Date(2023, 0, 1), new Date(2023, 11, 31)),
      createdAt: new Date(Date.now() - Math.random() * 10000000000),
      notes: '',
    });
  }
  return deliveries;
};



















// Simulate API calls
const fakeApi = {
  fetchDeliveries: () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockDeliveries());
      }, 1200);
    }),
  updateDelivery: (delivery) =>
    new Promise((resolve) => {
      setTimeout(() => resolve(delivery), 700);
    }),
  deleteDelivery: (id) =>
    new Promise((resolve) => {
      setTimeout(() => resolve(id), 500);
    }),
  createDelivery: (delivery) =>
    new Promise((resolve) => {
      setTimeout(() => resolve({ ...delivery, id: Date.now().toString() }), 700);
    }),
};


















// Modal component for editing or creating delivery
function DeliveryModal({ visible, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    recipientName: '',
    address: '',
    city: '',
    status: 'Pending',
    deliveryDate: '',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        recipientName: initialData.recipientName || '',
        address: initialData.address || '',
        city: initialData.city || '',
        status: initialData.status || 'Pending',
        deliveryDate: initialData.deliveryDate
          ? new Date(initialData.deliveryDate).toISOString().slice(0, 10)
          : '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        recipientName: '',
        address: '',
        city: '',
        status: 'Pending',
        deliveryDate: '',
        notes: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((fd) => ({ ...fd, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.recipientName || !formData.address || !formData.city || !formData.deliveryDate) {
      alert('Please fill in all required fields.');
      return;
    }
    // Pass formatted data back to parent
    onSave({
      ...initialData,
      ...formData,
      deliveryDate: new Date(formData.deliveryDate),
    });
  };

  if (!visible) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="bg-white rounded p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <h2 className="text-xl font-bold mb-4">
          {initialData ? 'Edit Delivery' : 'Create Delivery'}
        </h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Recipient Name <span className="text-red-600">*</span>
            <input
              name="recipientName"
              type="text"
              className="w-full border p-2 rounded mt-1"
              value={formData.recipientName}
              onChange={handleChange}
              required
            />
          </label>
          <label className="block mb-2">
            Address <span className="text-red-600">*</span>
            <input
              name="address"
              type="text"
              className="w-full border p-2 rounded mt-1"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </label>
          <label className="block mb-2">
            City <span className="text-red-600">*</span>
            <input
              name="city"
              type="text"
              className="w-full border p-2 rounded mt-1"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </label>
          <label className="block mb-2">
            Status <span className="text-red-600">*</span>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              required
            >
              <option>Pending</option>
              <option>In Transit</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </label>
          <label className="block mb-2">
            Delivery Date <span className="text-red-600">*</span>
            <input
              name="deliveryDate"
              type="date"
              className="w-full border p-2 rounded mt-1"
              value={formData.deliveryDate}
              onChange={handleChange}
              required
            />
          </label>
          <label className="block mb-4">
            Notes
            <textarea
              name="notes"
              rows="3"
              className="w-full border p-2 rounded mt-1"
              value={formData.notes}
              onChange={handleChange}
            />
          </label>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

















// Delete Confirmation Modal
function DeleteModal({ visible, onConfirm, onCancel, delivery }) {
  if (!visible) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}
    >
      <div
        className="bg-white rounded p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
        <p className="mb-6">
          Are you sure you want to delete the delivery to <strong>{delivery?.recipientName}</strong>?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(delivery.id)}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}















// Pagination Component
function Pagination({ total, pageSize, currentPage, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <nav aria-label="Pagination" className="flex space-x-1 justify-center mt-4">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
        aria-label="Previous page"
      >
        &lt;
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border rounded ${
            page === currentPage ? 'bg-blue-600 text-white' : ''
          }`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
        aria-label="Next page"
      >
        &gt;
      </button>
    </nav>
  );
}






// Delivery table header with sorting buttons
function SortableHeader({ label, sortKey, currentSort, onSortChange }) {
  const isActive = currentSort.key === sortKey;
  const nextDirection =
    isActive && currentSort.direction === 'asc' ? 'desc' : 'asc';

  return (
    <th
      scope="col"
      className="cursor-pointer select-none px-4 py-2 border-b border-gray-300 text-left"
      onClick={() => onSortChange(sortKey, nextDirection)}
      aria-sort={
        isActive
          ? currentSort.direction === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSortChange(sortKey, nextDirection);
      }}
    >
      <span className="flex items-center space-x-1">
        <span>{label}</span>
        <span aria-hidden="true">
          {isActive
            ? currentSort.direction === 'asc'
              ? '▲'
              : '▼'
            : '⇅'}
        </span>
      </span>
    </th>
  );
}














// Main Delivery Management Component
export default function DeliveryManagement() {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDelivery, setModalDelivery] = useState(null);

  // Delete modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deliveryToDelete, setDeliveryToDelete] = useState(null);

  // Fetch deliveries on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fakeApi
      .fetchDeliveries()
      .then((data) => {
        if (isMounted) {
          setDeliveries(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (isMounted) {
         






setError('Failed to load deliveries');
setLoading(false);
}
});
return () => {
isMounted = false;
};
}, []);

// Memoized sorting function
const sortedDeliveries = useMemo(() => {
if (!deliveries.length) return [];







const sorted = [...deliveries].sort((a, b) => {
  let aVal = a[sortConfig.key];
  let bVal = b[sortConfig.key];

  // If dates, convert to timestamp
  if (aVal instanceof Date) aVal = aVal.getTime();
  if (bVal instanceof Date) bVal = bVal.getTime();

  if (typeof aVal === 'string') {
    aVal = aVal.toLowerCase();
    bVal = bVal.toLowerCase();
  }

  if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
  if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
  return 0;
});
return sorted;
}, [deliveries, sortConfig]);

// Filter deliveries based on status, city and search term
useEffect(() => {
let filtered = [...sortedDeliveries];





if (statusFilter) {
  filtered = filtered.filter(
    (d) => d.status.toLowerCase() === statusFilter.toLowerCase()
  );
}
if (cityFilter) {
  filtered = filtered.filter(
    (d) => d.city.toLowerCase() === cityFilter.toLowerCase()
  );
}
if (searchTerm.trim()) {
  const term = searchTerm.toLowerCase();
  filtered = filtered.filter(
    (d) =>
      d.recipientName.toLowerCase().includes(term) ||
      d.address.toLowerCase().includes(term)
  );
}




setFilteredDeliveries(filtered);
setCurrentPage(1); // reset to first page when filters change
}, [statusFilter, cityFilter, searchTerm, sortedDeliveries]);

// Current page deliveries slice
const paginatedDeliveries = useMemo(() => {
const startIndex = (currentPage - 1) * pageSize;
return filteredDeliveries.slice(startIndex, startIndex + pageSize);
}, [filteredDeliveries, currentPage]);

// Unique cities and statuses for filters
const uniqueCities = useMemo(() => {
const citiesSet = new Set(deliveries.map((d) => d.city));
return Array.from(citiesSet).sort();
}, [deliveries]);

const uniqueStatuses = useMemo(() => {
const statusesSet = new Set(deliveries.map((d) => d.status));
return Array.from(statusesSet).sort();
}, [deliveries]);

// Handle sort change
const handleSortChange = (key, direction) => {
setSortConfig({ key, direction });
};




// Open modal for new delivery
const openNewModal = () => {
setModalDelivery(null);
setModalVisible(true);
};




// Open modal for edit delivery
const openEditModal = (delivery) => {
setModalDelivery(delivery);
setModalVisible(true);
};





// Close modal
const closeModal = () => {
setModalVisible(false);
setModalDelivery(null);
};







// Save delivery (create or update)
const saveDelivery = async (data) => {
setLoading(true);
try {
if (data.id) {
const updated = await fakeApi.updateDelivery(data);
setDeliveries((prev) =>
prev.map((d) => (d.id === updated.id ? updated : d))
);
} else {
const created = await fakeApi.createDelivery(data);
setDeliveries((prev) => [created, ...prev]);
}
closeModal();
} catch (e) {
alert('Failed to save delivery');
} finally {
setLoading(false);
}
};





// Open delete confirmation modal
const openDeleteModal = (delivery) => {
setDeliveryToDelete(delivery);
setDeleteModalVisible(true);
};







// Close delete modal
const closeDeleteModal = () => {
setDeleteModalVisible(false);
setDeliveryToDelete(null);
};

// Confirm delete
const confirmDelete = async (id) => {
setLoading(true);
try {
await fakeApi.deleteDelivery(id);
setDeliveries((prev) => prev.filter((d) => d.id !== id));
closeDeleteModal();
} catch (e) {
alert('Failed to delete delivery');
} finally {
setLoading(false);
}
};

return (
<div className="max-w-7xl mx-auto p-4">
<header className="flex justify-between items-center mb-6">
<h1 className="text-2xl font-bold">Delivery Management</h1>
<button onClick={openNewModal} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" >
+ New Delivery
</button>
</header>

php-template
Copy
Edit
  {/* Filters */}
  <section className="flex flex-wrap gap-4 mb-4 items-center">
    <input
      type="search"
      placeholder="Search recipient or address..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border p-2 rounded flex-grow min-w-[220px]"
      aria-label="Search recipient or address"
    />
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="border p-2 rounded"
      aria-label="Filter by status"
    >
      <option value="">All Statuses</option>
      {uniqueStatuses.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
    <select
      value={cityFilter}
      onChange={(e) => setCityFilter(e.target.value)}
      className="border p-2 rounded"
      aria-label="Filter by city"
    >
      <option value="">All Cities</option>
      {uniqueCities.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
    </select>
  </section>

  {/* Loading & error */}
  {loading && (
    <p role="status" aria-live="polite" className="text-center py-8">
      Loading deliveries...
    </p>
  )}
  {error && (
    <p role="alert" className="text-center text-red-600 py-8">
      {error}
    </p>
  )}

  {/* Table */}
  {!loading && !error && (
    <>
      {filteredDeliveries.length === 0 ? (
        <p className="text-center py-8">No deliveries found.</p>
      ) : (
        <table
          className="w-full border-collapse border border-gray-300"
          role="table"
        >
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <SortableHeader
                label="Recipient"
                sortKey="recipientName"
                currentSort={sortConfig}
                onSortChange={handleSortChange}
              />
              <SortableHeader
                label="Address"
                sortKey="address"
                currentSort={sortConfig}
                onSortChange={handleSortChange}
              />
              <SortableHeader
                label="City"
                sortKey="city"
                currentSort={sortConfig}
                onSortChange={handleSortChange}
              />
              <SortableHeader
                label="Status"
                sortKey="status"
                currentSort={sortConfig}
                onSortChange={handleSortChange}
              />
              <SortableHeader
                label="Delivery Date"
                sortKey="deliveryDate"
                currentSort={sortConfig}
                onSortChange={handleSortChange}
              />
              <SortableHeader
                label="Created At"
                sortKey="createdAt"
                currentSort={sortConfig}
                onSortChange={handleSortChange}
              />
              <th className="px-4 py-2 border-b border-gray-300 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedDeliveries.map((delivery) => (
              <tr key={delivery.id} className="hover:bg-gray-50">
                <td className="border-b border-gray-200 px-4 py-2">
                  {delivery.recipientName}
                </td>
                <td className="border-b border-gray-200 px-4 py-2">
                  {delivery.address}
                </td>
                <td className="border-b border-gray-200 px-4 py-2">
                  {delivery.city}
                </td>
                <td className="border-b border-gray-200 px-4 py-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold
                    ${
                      delivery.status === 'Delivered'
                        ? 'bg-green-100 text-green-800'
                        : delivery.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : delivery.status === 'In Transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }
                    `}
                    aria-label={`Status: ${delivery.status}`}
                  >
                    {delivery.status}
                  </span>
                </td>
                <td className="border-b border-gray-200 px-4 py-2">
                  {new Date(delivery.deliveryDate).toLocaleDateString()}
                </td>
                <td className="border-b border-gray-200 px-4 py-2">
                  {new Date(delivery.createdAt).toLocaleDateString()}
                </td>
                <td className="border-b border-gray-200 px-4 py-2 text-center">
                  <button
                    onClick={() => openEditModal(delivery)}
                    aria-label={`Edit delivery for ${delivery.recipientName}`}
                    className="mr-2 text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(delivery)}
                    aria-label={`Delete delivery for ${delivery.recipientName}`}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination
        total={filteredDeliveries.length}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  )}

  <DeliveryModal
    visible={modalVisible}
    onClose={closeModal}
    onSave={saveDelivery}
    initialData={modalDelivery}
  />

  <DeleteModal
    visible={deleteModalVisible}
    onConfirm={confirmDelete}
    onCancel={closeDeleteModal}
    delivery={deliveryToDelete}
  />
</div>
);
}

// src/App.jsx
import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Outlet,
} from 'react-router-dom';












// Import components
import DeliveryManagement from './DeliveryManagement';
import Notifications from './Notifications';
import LoginForm from './LoginForm';

// Auth Context and Provider
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}














function fakeAuthProvider() {
  // Mock auth provider with async login/logout
  let user = null;
  return {
    isAuthenticated: () => !!user,
    signin(username, password) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (username === 'admin' && password === 'password') {
            user = { username: 'admin', roles: ['admin'] };
            resolve(user);
          } else if (username && password) {
            user = { username, roles: ['user'] };
            resolve(user);
          } else {
            reject('Invalid credentials');
          }
        }, 700);
      });
    },
    signout() {
      return new Promise((resolve) => {
        setTimeout(() => {
          user = null;
          resolve();
        }, 300);
      });
    },
    getUser() {
      return user;
    },
  };
}

const authProvider = fakeAuthProvider();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authProvider.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signin = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await authProvider.signin(username, password);
      setUser(loggedInUser);
      setLoading(false);
      return loggedInUser;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  const signout = useCallback(async () => {
    setLoading(true);
    await authProvider.signout();
    setUser(null);
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    error,
    signin,
    signout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}













// Protected Route Component
function RequireAuth({ allowedRoles = [], children }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.some((role) => auth.user.roles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
}



























// Login Page
function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await auth.signin(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError('Invalid username or password');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      {formError && <div className="mb-3 text-red-600">{formError}</div>}
      <form onSubmit={handleSubmit} aria-label="login form">
        <label htmlFor="username" className="block mb-1 font-semibold">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="w-full border px-3 py-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-required="true"
        />

        <label htmlFor="password" className="block mb-1 font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full border px-3 py-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-required="true"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={auth.loading}
          aria-busy={auth.loading}
        >
          {auth.loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

















// Unauthorized Page
function Unauthorized() {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow-lg bg-yellow-100 text-center">
      <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
      <p>You do not have permission to view this page.</p>
    </div>
  );
}












// Home Page - simple welcome with links
function Home() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Welcome to Secure Delivery App</h1>
      <p className="mb-4">Hello, {auth.user?.username}!</p>
      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/deliveries')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Manage Deliveries
        </button>
        {auth.user?.roles.includes('admin') && (
          <button
            onClick={() => navigate('/admin')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Admin Panel
          </button>
        )}
        <button
          onClick={handleLogout}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-auto"
        >
          Logout
        </button>
      </div>
    </div>
  );
}









// Admin Panel - simple placeholder
function AdminPanel() {
  return (
    <div className="max-w-4xl mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      <p>This is a placeholder for admin functionalities like audit logs.</p>
    </div>
  );
}








// Main Application Routes
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RequireAuth />}>
        <Route index element={<Home />} />
        <Route path="deliveries" element={<DeliveryManagement />} />
        <Route path="admin" element={<RequireAuth allowedRoles={['admin']}><AdminPanel /></RequireAuth>} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}





// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Notifications />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
