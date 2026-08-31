import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const emptyTransferForm = {
  patient_name: '',
  age: '',
  gender: '',
  relative_name: '',
  reg_no: '',
  bill_no: '',
  diagnosis: '',
  transfer_to: '',
  transfer_reason: '',
  transfer_date: '',
};

const TransferManagement = ({ userRole }) => {
  const [transferRecords, setTransferRecords] = useState([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransferId, setEditingTransferId] = useState(null);
  const [formData, setFormData] = useState(emptyTransferForm);

  const isAdmin = userRole === 'admin';

  const fetchTransfers = async () => {
    if (!supabase) {
      return;
    }

    setTransferLoading(true);
    setMessage('');

    const { data, error } = await supabase
      .from('transferDetailsTable')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      setMessage(error.message);
      setTransferLoading(false);
      return;
    }

    setTransferRecords(data || []);
    setTransferLoading(false);
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyTransferForm);
    setEditingTransferId(null);
    setShowForm(false);
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supabase || !isAdmin) {
      return;
    }

    const payload = {
      patient_name: formData.patient_name,
      age: formData.age ? Number(formData.age) : null,
      gender: formData.gender,
      relative_name: formData.relative_name,
      reg_no: formData.reg_no,
      bill_no: formData.bill_no,
      diagnosis: formData.diagnosis,
      transfer_to: formData.transfer_to,
      transfer_reason: formData.transfer_reason,
      transfer_date: formData.transfer_date,
    };

    const request = editingTransferId
      ? supabase.from('transferDetailsTable').update(payload).eq('id', editingTransferId)
      : supabase.from('transferDetailsTable').insert(payload).select().single();

    const { error } = await request;

    if (error) {
      setMessage(error.message);
      return;
    }

    resetForm();
    fetchTransfers();
  };

  const handleEdit = (record) => {
    if (!isAdmin) {
      return;
    }

    setEditingTransferId(record.id);
    setFormData({
      patient_name: record.patient_name || '',
      age: record.age ?? '',
      gender: record.gender || '',
      relative_name: record.relative_name || '',
      reg_no: record.reg_no || '',
      bill_no: record.bill_no || '',
      diagnosis: record.diagnosis || '',
      transfer_to: record.transfer_to || '',
      transfer_reason: record.transfer_reason || '',
      transfer_date: record.transfer_date || '',
    });
    setShowForm(true);
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (!supabase || !isAdmin) {
      return;
    }

    const { error } = await supabase
      .from('transferDetailsTable')
      .delete()
      .eq('id', id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Transfer deleted successfully');
    fetchTransfers();
  };

  const tableHeaders = useMemo(() => [
    'Patient Name',
    'Age/Gender',
    'Relative Name',
    'Reg No',
    'Bill No',
    'Diagnosis',
    'Transfer To',
    'Transfer Reason',
    'Transfer Date',
    'Action',
  ], []);

  return (
    <div className="transfer-management">
      <div className="transfer-header-row">
        <h2>Transfer Details</h2>
        {isAdmin && (
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            Add Transfer Details
          </button>
        )}
      </div>

      {!isAdmin && (
        <p className="helper-text">
          Only admins can create, update, or delete transfer records.
        </p>
      )}

      {showForm && isAdmin && (
        <form className="transfer-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div>
              <label>Patient Name</label>
              <input
                name="patient_name"
                value={formData.patient_name}
                onChange={handleInputChange}
                placeholder="Patient name"
                required
              />
            </div>
            <div>
              <label>Age</label>
              <input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Age"
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label>Relative Name</label>
              <input
                name="relative_name"
                value={formData.relative_name}
                onChange={handleInputChange}
                placeholder="Relative name"
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Reg No</label>
              <input
                name="reg_no"
                value={formData.reg_no}
                onChange={handleInputChange}
                placeholder="Reg No"
              />
            </div>
            <div>
              <label>Bill No</label>
              <input
                name="bill_no"
                value={formData.bill_no}
                onChange={handleInputChange}
                placeholder="Bill No"
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Diagnosis</label>
              <input
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                placeholder="Diagnosis"
              />
            </div>
            <div>
              <label>Transfer To</label>
              <input
                name="transfer_to"
                value={formData.transfer_to}
                onChange={handleInputChange}
                placeholder="Ward / Room / Department"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Transfer Reason</label>
              <input
                name="transfer_reason"
                value={formData.transfer_reason}
                onChange={handleInputChange}
                placeholder="Transfer reason"
              />
            </div>
            <div>
              <label>Transfer Date</label>
              <input
                type="date"
                name="transfer_date"
                value={formData.transfer_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-actions-row">
            <button type="submit" className="primary-button">
              {editingTransferId ? 'Update Transfer' : 'Save Transfer'}
            </button>
            <button type="button" className="secondary-button" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {message && <p className="status-message">{message}</p>}

      <div className="records-table-container">
        <table className="records-table">
          <thead>
            <tr>
              {tableHeaders.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transferLoading ? (
              <tr>
                <td colSpan={10} className="table-empty-state">
                  Loading transfer details...
                </td>
              </tr>
            ) : transferRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="table-empty-state">
                  No transfer records found.
                </td>
              </tr>
            ) : (
              transferRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.patient_name || '-'}</td>
                  <td>
                    {record.age || '-'} / {record.gender || '-'}
                  </td>
                  <td>{record.relative_name || '-'}</td>
                  <td>{record.reg_no || '-'}</td>
                  <td>{record.bill_no || '-'}</td>
                  <td>{record.diagnosis || '-'}</td>
                  <td>{record.transfer_to || '-'}</td>
                  <td>{record.transfer_reason || '-'}</td>
                  <td>{record.transfer_date || '-'}</td>
                  <td>
                    {isAdmin ? (
                      <div className="table-actions">
                        <button
                          type="button"
                          className="text-button edit-btn"
                          title="Edit Transfer"
                          onClick={() => handleEdit(record)}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="text-button delete-btn"
                          title="Delete Transfer"
                          onClick={() => handleDelete(record.id)}
                        >
                          🗑
                        </button>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransferManagement;
