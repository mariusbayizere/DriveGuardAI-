import React, { useState, useEffect, useCallback } from 'react';
import vehicleService from '../../services/vehicleService';

/* ── status badge colors ── */
const STATUS_CLASSES = {
  ACTIVE:      { bg: 'rgba(34,197,94,0.15)',   text: '#22c55e' },
  INACTIVE:    { bg: 'rgba(107,114,128,0.15)', text: '#6b7280' },
  MAINTENANCE: { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
};

const SortIcon = ({ column, sortBy, sortOrder }) => {
  if (sortBy !== column) return <span className="opacity-40 ml-1">⇅</span>;
  return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
};

const INPUT_BASE =
  'w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm text-gray-800 ' +
  'transition-all duration-300 focus:outline-none focus:border-[#84CC16] ' +
  'focus:shadow-[0_0_0_3px_rgba(132,204,22,0.1)] placeholder:text-gray-400 bg-white';
const INPUT_ERR = 'border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]';

/* ════════════════════════════════════════════════════════════ */
const VehiclesManagement = () => {
  const [vehicles,          setVehicles]          = useState([]);
  const [drivers,           setDrivers]           = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [error,             setError]             = useState(null);
  const [success,           setSuccess]           = useState(null);
  const [showModal,         setShowModal]         = useState(false);
  const [editingVehicle,    setEditingVehicle]    = useState(null);
  const [searchTerm,        setSearchTerm]        = useState('');
  const [filterStatus,      setFilterStatus]      = useState('ALL');
  const [currentPage,       setCurrentPage]       = useState(1);
  const [itemsPerPage]                            = useState(8);
  const [sortBy,            setSortBy]            = useState('id');
  const [sortOrder,         setSortOrder]         = useState('asc');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteVehicleId,   setDeleteVehicleId]   = useState(null);
  const [expandedCardId,    setExpandedCardId]    = useState(null);
  const [formData,          setFormData]          = useState({
    licensePlate: '', plateNumber: '', model: '', status: 'ACTIVE', driverId: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vehicleService.getAllVehicles();
      setVehicles(response.data || []);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to fetch vehicles: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await vehicleService.getAllDrivers();
      setDrivers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, [fetchVehicles, fetchDrivers]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    if (formErrors[name]) setFormErrors(fe => ({ ...fe, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.licensePlate.trim()) errors.licensePlate = 'License plate is required';
    if (!formData.plateNumber.trim())  errors.plateNumber  = 'Plate number is required';
    if (!formData.model.trim())        errors.model        = 'Model is required';
    if (!formData.status)              errors.status       = 'Status is required';
    if (!formData.driverId)            errors.driverId     = 'Driver is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const vehicleData = {
        licensePlate: formData.licensePlate,
        plateNumber:  formData.plateNumber,
        model:        formData.model,
        status:       formData.status,
        driver:       { id: parseInt(formData.driverId) },
      };
      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.vehicleId, vehicleData);
        setSuccess(`Vehicle "${formData.licensePlate}" updated successfully!`);
      } else {
        await vehicleService.createVehicle(vehicleData);
        setSuccess(`Vehicle "${formData.licensePlate}" created successfully!`);
      }
      fetchVehicles();
      resetForm();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate || '',
      plateNumber:  vehicle.plateNumber  || '',
      model:        vehicle.model        || '',
      status:       vehicle.status       || 'ACTIVE',
      driverId:     vehicle.driver?.id   || '',
    });
    setExpandedCardId(null);
    setShowModal(true);
  };

  const handleDeleteClick = (vehicleId) => {
    setDeleteVehicleId(vehicleId);
    setExpandedCardId(null);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    setError(null);
    try {
      const vehicle = vehicles.find(v => v.vehicleId === deleteVehicleId);
      await vehicleService.deleteVehicle(deleteVehicleId);
      setSuccess(`Vehicle "${vehicle?.licensePlate}" deleted successfully!`);
      fetchVehicles();
    } catch (err) {
      setError('Failed to delete vehicle: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setDeleteVehicleId(null);
    }
  };

  const resetForm = () => {
    setFormData({ licensePlate: '', plateNumber: '', model: '', status: 'ACTIVE', driverId: '' });
    setFormErrors({});
    setEditingVehicle(null);
  };
  const openAddModal = () => { resetForm(); setShowModal(true); };
  const closeModal   = () => { resetForm(); setShowModal(false); };

  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortOrder('asc'); }
    setCurrentPage(1);
  };

  const toggleCard = (id) =>
    setExpandedCardId(prev => prev === id ? null : id);

  /* ── filter + sort ── */
  let filtered = vehicles.filter(vehicle => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (vehicle.licensePlate || '').toLowerCase().includes(q) ||
      (vehicle.plateNumber  || '').toLowerCase().includes(q) ||
      (vehicle.model        || '').toLowerCase().includes(q) ||
      (vehicle.driver?.user?.firstName || '').toLowerCase().includes(q) ||
      (vehicle.driver?.user?.lastName  || '').toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'ALL' || vehicle.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  filtered = [...filtered].sort((a, b) => {
    let av, bv;
    if      (sortBy === 'id')    { av = a.vehicleId;                   bv = b.vehicleId; }
    else if (sortBy === 'plate') { av = (a.licensePlate||'').toLowerCase(); bv = (b.licensePlate||'').toLowerCase(); }
    else if (sortBy === 'model') { av = (a.model||'').toLowerCase();    bv = (b.model||'').toLowerCase(); }
    return sortOrder === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated  = filtered.slice(startIndex, startIndex + itemsPerPage);

  const getStatusStyle = (status) => STATUS_CLASSES[status] || STATUS_CLASSES.INACTIVE;

  /* ════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        h1,h2,h3 { font-family: 'Poppins', sans-serif; }

        @keyframes fadeIn    { from{opacity:0}                             to{opacity:1} }
        @keyframes slideUp   { from{transform:translateY(50px);opacity:0}  to{transform:translateY(0);opacity:1} }
        @keyframes slideDown { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes expandIn  { from{opacity:0;transform:translateY(-6px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }

        .anim-fadeIn    { animation: fadeIn    0.3s ease; }
        .anim-slideUp   { animation: slideUp   0.3s ease; }
        .anim-slideDown { animation: slideDown 0.3s ease; }
        .anim-expandIn  { animation: expandIn  0.2s ease; }

        .spinner {
          border:3px solid #e5e7eb; border-top-color:#84CC16;
          border-radius:50%; width:40px; height:40px;
          animation:spin 1s linear infinite; margin:40px auto;
        }

        .green-btn {
          background: linear-gradient(135deg,#84CC16,#65A30D);
          border: 2px solid rgba(132,204,22,.3);
          color:#fff; cursor:pointer; transition:all .3s;
        }
        .green-btn:hover {
          background: linear-gradient(135deg,#a3e635,#84CC16);
          transform:translateY(-2px);
          box-shadow:0 12px 24px rgba(132,204,22,.2);
        }

        .pill-select {
          background:#fff;
          border:2px solid #e5e7eb;
          border-radius:50px;
          padding:11px 18px;
          font-size:14px;
          color:#1f2937;
          transition:all .3s;
          cursor:pointer;
          position: relative;
          z-index: 10;
        }
        .pill-select:focus {
          outline:none;
          border-color:#84CC16;
          box-shadow:0 0 0 3px rgba(132,204,22,.1);
        }

        .icon-circle {
          background:#fff; border:2px solid #e5e7eb; border-radius:50%;
          width:44px; height:44px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all .3s; color:#6b7280;
        }
        .icon-circle:hover { background:#84CC16; border-color:#84CC16; color:#fff; transform:scale(1.1); }

        .trow { border-bottom:1px solid #e5e7eb; transition:background .2s; }
        .trow:hover { background:rgba(132,204,22,.04); }
        .trow:last-child { border-bottom:none; }

        .btn-edit         { background:rgba(34,197,94,.1);  color:#22c55e; }
        .btn-edit:hover   { background:rgba(34,197,94,.22); transform:translateY(-2px); }
        .btn-delete       { background:rgba(239,68,68,.1);  color:#ef4444; }
        .btn-delete:hover { background:rgba(239,68,68,.22); transform:translateY(-2px); }

        .page-active {
          background:linear-gradient(135deg,#84CC16,#65A30D) !important;
          color:#fff !important; border-color:transparent !important;
        }

        .btn-submit { background:linear-gradient(135deg,#84CC16,#65A30D); color:#fff; transition:all .3s; }
        .btn-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 16px rgba(132,204,22,.3); }
        .btn-submit:disabled { opacity:.6; cursor:not-allowed; }

        .btn-confirm-del { background:#ef4444; color:#fff; transition:all .3s; }
        .btn-confirm-del:hover { background:#dc2626; transform:translateY(-2px); box-shadow:0 8px 16px rgba(239,68,68,.3); }

        .mob-edit-btn {
          flex:1; padding:10px; border-radius:8px; border:none; cursor:pointer;
          font-weight:600; font-size:13px; display:flex; align-items:center;
          justify-content:center; gap:6px; transition:all .25s;
          background:linear-gradient(135deg,#84CC16,#65A30D); color:#fff;
        }
        .mob-edit-btn:hover { transform:translateY(-1px); box-shadow:0 6px 14px rgba(132,204,22,.3); }

        .mob-del-btn {
          flex:1; padding:10px; border-radius:8px; border:none; cursor:pointer;
          font-weight:600; font-size:13px; display:flex; align-items:center;
          justify-content:center; gap:6px; transition:all .25s;
          background:#ef4444; color:#fff;
        }
        .mob-del-btn:hover { background:#dc2626; transform:translateY(-1px); box-shadow:0 6px 14px rgba(239,68,68,.3); }

        /* cards must NOT clip children so native <select> dropdown escapes */
        .vehicle-card { overflow: visible !important; }
      `}</style>

      {/* ════════════ PAGE ════════════ */}
      <div className="px-4 sm:px-6 pt-7 pb-12 w-full">

        {/* ── Header ── */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <h1 className="m-0 text-2xl sm:text-[32px] font-extrabold text-gray-800 flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#84CC16" strokeWidth="2.5">
              <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="1" r="2"/>
            </svg>
            Vehicles Management
          </h1>
          <button onClick={openAddModal}
            className="green-btn rounded-full px-5 py-3 font-semibold text-sm flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add New Vehicle
          </button>
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className="anim-slideDown flex gap-3 items-start bg-red-50 border-l-4 border-red-400
                          text-red-600 rounded-lg p-4 mb-5 text-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" className="shrink-0 mt-px">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="anim-slideDown flex gap-3 items-start bg-green-50 border-l-4 border-green-400
                          text-green-700 rounded-lg p-4 mb-5 text-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" className="shrink-0 mt-px">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {success}
          </div>
        )}

        {/* ── Search + Filters ── */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 items-stretch sm:items-center"
             style={{ position: 'relative', zIndex: 20 }}>

          {/* Search pill */}
          <div className="flex items-center flex-1 min-w-0 sm:min-w-[260px]
                          bg-white border-2 border-gray-200 rounded-full
                          transition-all duration-300
                          focus-within:border-[#84CC16]
                          focus-within:shadow-[0_0_0_3px_rgba(132,204,22,0.1)]">
            <span className="pl-4 flex items-center shrink-0 text-gray-400 pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search vehicle..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex-1 py-[11px] px-3 text-sm text-gray-800 bg-transparent
                         outline-none placeholder:text-gray-400 rounded-full"
            />
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="pill-select w-full sm:w-[160px]"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          {/* Icon buttons */}
          <div className="flex gap-2 items-center">
            <button className="icon-circle" title="Refresh" onClick={fetchVehicles}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"/>
              </svg>
            </button>
            <button className="icon-circle" title="Download">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <button className="icon-circle" title="More">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && !showModal && (
          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-200 py-4 text-center">
            <div className="spinner"/>
            <p className="text-gray-400 pb-6">Loading vehicles…</p>
          </div>
        )}

        {!loading && (
          <>
            {/* ════ DESKTOP TABLE (≥ md) ════ */}
            <div className="hidden md:block bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)]
                            border border-gray-200 overflow-hidden mt-6">
              <div className="bg-gradient-to-r from-[#84CC16] to-[#65A30D]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {[
                        { label:'ID',            col:'id',    w:'7%'  },
                        { label:'LICENSE PLATE', col:'plate', w:'25%' },
                        { label:'MODEL',         col:'model', w:'20%' },
                        { label:'DRIVER',        col:null,    w:'25%' },
                        { label:'STATUS',        col:null,    w:'13%' },
                        { label:'ACTIONS',       col:null,    w:'10%' },
                      ].map(({ label, col, w }) => (
                        <th key={label} style={{ width: w }}
                          className={`px-5 py-[18px] text-left text-white
                                      ${col ? 'cursor-pointer select-none hover:opacity-90' : ''}`}
                          onClick={col ? () => handleSort(col) : undefined}>
                          <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center">
                            {label}
                            {col && <SortIcon column={col} sortBy={sortBy} sortOrder={sortOrder}/>}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>
              </div>

              <table className="w-full border-collapse">
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-16 text-gray-400">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="1.5" className="mx-auto mb-3 opacity-40">
                        <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>
                      </svg>
                      No vehicles found
                    </td></tr>
                  ) : paginated.map(vehicle => {
                    const sc = getStatusStyle(vehicle.status);
                    return (
                      <tr key={vehicle.vehicleId} className="trow">
                        <td className="px-5 py-4 w-[7%] font-semibold text-[#84CC16] text-[13px]">{vehicle.vehicleId}</td>
                        <td className="px-5 py-4 w-[25%] text-[13px]">
                          <div className="font-semibold text-gray-800">{vehicle.licensePlate}</div>
                          <div className="text-gray-400 text-xs mt-0.5">{vehicle.plateNumber}</div>
                        </td>
                        <td className="px-5 py-4 w-[20%] text-[13px] text-gray-500">{vehicle.model || 'N/A'}</td>
                        <td className="px-5 py-4 w-[25%] text-[13px] text-gray-500">
                          <div className="flex items-center gap-2">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="2" className="opacity-50 shrink-0">
                              <circle cx="12" cy="8" r="4"/>
                              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                            </svg>
                            {vehicle.driver?.user?.firstName} {vehicle.driver?.user?.lastName}
                          </div>
                        </td>
                        <td className="px-5 py-4 w-[13%] text-[13px]">
                          <span className="inline-block px-3 py-1 rounded-full font-semibold text-[11px] uppercase tracking-wide"
                            style={{ background: sc.bg, color: sc.text }}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 w-[10%]">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(vehicle)} title="Edit"
                              className="btn-edit w-9 h-9 rounded-lg border-none cursor-pointer
                                         flex items-center justify-center transition-all duration-300">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteClick(vehicle.vehicleId)} title="Delete"
                              className="btn-delete w-9 h-9 rounded-lg border-none cursor-pointer
                                         flex items-center justify-center transition-all duration-300">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Desktop Pagination */}
              {paginated.length > 0 && (
                <div className="bg-[rgba(132,204,22,0.05)] px-5 py-4 border-t border-gray-200
                                flex flex-wrap gap-3 items-center justify-between text-[13px] text-gray-500">
                  <span>
                    Showing <strong>{startIndex + 1}</strong>–<strong>{Math.min(startIndex + itemsPerPage, filtered.length)}</strong> of <strong>{filtered.length}</strong> vehicles
                  </span>
                  <div className="flex gap-1.5 items-center flex-wrap">
                    <button
                      className="w-8 h-8 border border-gray-200 rounded-lg bg-white font-semibold cursor-pointer
                                 text-gray-500 text-sm transition-all hover:border-[#84CC16] hover:text-[#84CC16]
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}>←</button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 border rounded-lg font-semibold cursor-pointer transition-all text-sm
                          ${currentPage === page
                            ? 'page-active'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-[#84CC16] hover:text-[#84CC16]'
                          }`}>{page}</button>
                    ))}
                    {totalPages > 5 && <span className="text-gray-400 px-1">…</span>}
                    {totalPages > 1 && (
                      <button
                        className="w-8 h-8 border border-gray-200 rounded-lg bg-white font-semibold cursor-pointer
                                   text-gray-500 text-sm transition-all hover:border-[#84CC16] hover:text-[#84CC16]
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}>→</button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ════ MOBILE CARDS (< md) ════ */}
            <div className="md:hidden mt-4">
              <p className="text-sm text-gray-500 mb-3 px-1">
                Showing <strong>{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filtered.length)}</strong> of <strong>{filtered.length}</strong> vehicles
              </p>

              {paginated.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow text-center py-14 text-gray-400">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.5" className="mx-auto mb-3 opacity-40">
                    <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>
                  </svg>
                  No vehicles found
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {paginated.map(vehicle => {
                    const isOpen = expandedCardId === vehicle.vehicleId;
                    const sc = getStatusStyle(vehicle.status);
                    return (
                      <div key={vehicle.vehicleId}
                        className="vehicle-card bg-white rounded-2xl border border-gray-200
                                   shadow-[0_4px_16px_rgba(0,0,0,0.07)]">

                        {/* ── Top row ── */}
                        <div className="flex items-center justify-between px-4 pt-4 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#84CC16] to-[#65A30D]
                                            flex items-center justify-center shrink-0">
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                stroke="white" strokeWidth="2">
                                <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 text-[15px] leading-tight">
                                {vehicle.licensePlate}
                              </div>
                              <div className="text-gray-400 text-xs mt-0.5">ID: {vehicle.vehicleId}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleCard(vehicle.vehicleId)}
                            className="w-8 h-8 flex items-center justify-center rounded-full
                                       text-gray-400 hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5"  r="1.5"/>
                              <circle cx="12" cy="12" r="1.5"/>
                              <circle cx="12" cy="19" r="1.5"/>
                            </svg>
                          </button>
                        </div>

                        {/* ── Plate number + model ── */}
                        <div className="px-4 pb-3 flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="#6366f1" strokeWidth="2">
                              <rect x="2" y="3" width="20" height="14" rx="2"/>
                              <path d="M8 21h8M12 17v4"/>
                            </svg>
                          </div>
                          <span className="font-medium text-gray-700">{vehicle.plateNumber}</span>
                          <span className="text-gray-300 mx-1">·</span>
                          <span className="text-xs text-gray-400">{vehicle.model || 'N/A'}</span>
                        </div>

                        {/* ── Status badge ── */}
                        <div className="px-4 pb-4 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="#22c55e" strokeWidth="2">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                          </div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full font-semibold text-[11px] uppercase"
                            style={{ background: sc.bg, color: sc.text }}>
                            {vehicle.status}
                          </span>
                        </div>

                        {/* ── EXPANDED section ── */}
                        {isOpen && (
                          <div className="anim-expandIn border-t border-gray-100 px-4 py-4">

                            {/* Driver */}
                            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                              <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                  stroke="#a855f7" strokeWidth="2">
                                  <circle cx="12" cy="8" r="4"/>
                                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                                </svg>
                              </div>
                              <span className="text-gray-500 text-xs">Driver</span>
                              <span className="ml-auto text-gray-700 text-sm font-medium">
                                {vehicle.driver?.user?.firstName
                                  ? `${vehicle.driver.user.firstName} ${vehicle.driver.user.lastName}`
                                  : '—'}
                              </span>
                            </div>

                            {/* Plate number detail */}
                            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                              <div className="w-7 h-7 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                  stroke="#eab308" strokeWidth="2">
                                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                                  <path d="M8 21h8M12 17v4"/>
                                </svg>
                              </div>
                              <span className="text-gray-500 text-xs">Plate No.</span>
                              <span className="ml-auto text-gray-700 text-sm font-medium">
                                {vehicle.plateNumber || '—'}
                              </span>
                            </div>

                            {/* Edit + Delete */}
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(vehicle)} className="mob-edit-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Edit
                              </button>
                              <button onClick={() => handleDeleteClick(vehicle.vehicleId)} className="mob-del-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                  <line x1="10" y1="11" x2="10" y2="17"/>
                                  <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mobile pagination */}
              {paginated.length > 0 && totalPages > 1 && (
                <div className="flex gap-1.5 items-center justify-center mt-5 flex-wrap">
                  <button
                    className="w-8 h-8 border border-gray-200 rounded-lg bg-white font-semibold cursor-pointer
                               text-gray-500 text-sm transition-all hover:border-[#84CC16] hover:text-[#84CC16]
                               disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}>←</button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 border rounded-lg font-semibold cursor-pointer transition-all text-sm
                        ${currentPage === page
                          ? 'page-active'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-[#84CC16] hover:text-[#84CC16]'
                        }`}>{page}</button>
                  ))}
                  {totalPages > 5 && <span className="text-gray-400 px-1">…</span>}
                  <button
                    className="w-8 h-8 border border-gray-200 rounded-lg bg-white font-semibold cursor-pointer
                               text-gray-500 text-sm transition-all hover:border-[#84CC16] hover:text-[#84CC16]
                               disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}>→</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ════════════════════════════════════════
          ADD / EDIT MODAL
      ════════════════════════════════════════ */}
      {showModal && (
        <div className="anim-fadeIn fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
          onClick={closeModal}>
          <div className="anim-slideUp bg-white rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto
                          shadow-[0_25px_50px_rgba(0,0,0,0.3)]"
            onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#84CC16] to-[#65A30D] text-white px-6 py-5
                            border-b border-black/10 flex justify-between items-center rounded-t-2xl">
              <h2 className="m-0 text-xl font-bold">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button onClick={closeModal}
                className="bg-white/20 border-none w-9 h-9 rounded-lg text-white cursor-pointer
                           flex items-center justify-center text-2xl transition hover:bg-white/30">×</button>
            </div>
            <div className="p-5 sm:p-6">
              <div className="mb-5">
                <label className="block font-semibold mb-2 text-gray-800 text-sm">License Plate *</label>
                <input type="text" name="licensePlate" value={formData.licensePlate}
                  onChange={handleInputChange} placeholder="Enter license plate"
                  className={`${INPUT_BASE} ${formErrors.licensePlate ? INPUT_ERR : ''}`}/>
                {formErrors.licensePlate && <p className="text-red-400 text-xs mt-1">{formErrors.licensePlate}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block font-semibold mb-2 text-gray-800 text-sm">Plate Number *</label>
                  <input type="text" name="plateNumber" value={formData.plateNumber}
                    onChange={handleInputChange} placeholder="Enter plate number"
                    className={`${INPUT_BASE} ${formErrors.plateNumber ? INPUT_ERR : ''}`}/>
                  {formErrors.plateNumber && <p className="text-red-400 text-xs mt-1">{formErrors.plateNumber}</p>}
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-800 text-sm">Model *</label>
                  <input type="text" name="model" value={formData.model}
                    onChange={handleInputChange} placeholder="Enter vehicle model"
                    className={`${INPUT_BASE} ${formErrors.model ? INPUT_ERR : ''}`}/>
                  {formErrors.model && <p className="text-red-400 text-xs mt-1">{formErrors.model}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block font-semibold mb-2 text-gray-800 text-sm">Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}
                    className={`${INPUT_BASE} ${formErrors.status ? INPUT_ERR : ''}`}>
                    <option value="">Select Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                  {formErrors.status && <p className="text-red-400 text-xs mt-1">{formErrors.status}</p>}
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-800 text-sm">Assign Driver *</label>
                  {drivers && drivers.length > 0 ? (
                    <select name="driverId" value={formData.driverId} onChange={handleInputChange}
                      className={`${INPUT_BASE} ${formErrors.driverId ? INPUT_ERR : ''}`}>
                      <option value="">Select Driver</option>
                      {drivers.filter(d => d && d.id).map((driver, i) => (
                        <option key={`driver-${driver.id}-${i}`} value={driver.id}>
                          {driver.user?.firstName || ''} {driver.user?.lastName || ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ padding: '12px 16px', border: '2px solid #fcd34d', borderRadius: '8px',
                                  background: 'rgba(252,211,77,0.1)', color: '#b45309', fontSize: '14px' }}>
                      No drivers available. Please check your backend is running.
                    </div>
                  )}
                  {formErrors.driverId && <p className="text-red-400 text-xs mt-1">{formErrors.driverId}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-end pt-5 border-t border-gray-200">
                <button type="button" onClick={closeModal}
                  className="px-6 py-3 bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm
                             cursor-pointer transition hover:bg-gray-200 border-none">Cancel</button>
                <button type="button" onClick={handleSubmit} disabled={loading}
                  className="btn-submit px-6 py-3 rounded-lg font-semibold text-sm cursor-pointer border-none">
                  {loading ? 'Saving…' : editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          DELETE CONFIRM DIALOG
      ════════════════════════════════════════ */}
      {showConfirmDialog && (
        <div className="anim-fadeIn fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] p-4"
          onClick={() => setShowConfirmDialog(false)}>
          <div className="anim-slideUp bg-white rounded-2xl w-full max-w-[420px] p-8
                          shadow-[0_25px_50px_rgba(0,0,0,0.3)]"
            onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-800 text-center mb-2">Delete Vehicle?</div>
            <div className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Are you sure you want to delete this vehicle? This action cannot be undone and all associated data will be permanently removed.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm
                           cursor-pointer transition hover:bg-gray-200 border-none">Cancel</button>
              <button onClick={handleConfirmDelete}
                className="btn-confirm-del flex-1 py-3 px-4 rounded-lg font-semibold text-sm cursor-pointer border-none">
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VehiclesManagement;
