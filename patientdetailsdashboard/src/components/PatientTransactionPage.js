import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const getPaymentRecordKey = (transaction = {}) => {
  return transaction.primaryKey ?? transaction.id ?? transaction.primary_key ?? transaction.primarykey ?? null;
};

const getPaymentKeyField = (transaction = {}) => {
  if (Object.prototype.hasOwnProperty.call(transaction, 'primaryKey')) return 'primaryKey';
  if (Object.prototype.hasOwnProperty.call(transaction, 'id')) return 'id';
  if (Object.prototype.hasOwnProperty.call(transaction, 'primary_key')) return 'primary_key';
  if (Object.prototype.hasOwnProperty.call(transaction, 'primarykey')) return 'primarykey';
  return 'id';
};

const PatientTransactionPage = ({ patientName = '', patientId = '', billNo = '', onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    payment_date: '',
    sent_by: '',
    mobile_number: '',
    payment_mode: 'Cash',
    collected_by: '',
    amount: '',
    remark: '',
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!supabase) {
        setTransactions([]);
        setSelectedTransactionId(null);
        setLoading(false);
        return;
      }

      let query = supabase.from('PaymentTable').select('*');

      if (patientId) {
        query = query.eq('patientID', Number(patientId) || patientId);
      } else if (billNo) {
        query = query.eq('bill_no', billNo);
      } else if (patientName) {
        query = query.ilike('patient_name', `%${patientName}%`);
      }

      const { data, error } = await query.order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching payment history:', error);
        setTransactions([]);
        setSelectedTransactionId(null);
      } else {
        const nextTransactions = data || [];
        setTransactions(nextTransactions);
        setSelectedTransactionId(getPaymentRecordKey(nextTransactions[0]) ?? null);
      }

      setLoading(false);
    };

    fetchTransactions();
  }, [patientId, billNo, patientName]);

  const selectedTransaction = transactions.find((transaction) => getPaymentRecordKey(transaction) === selectedTransactionId) || transactions[0] || null;

  useEffect(() => {
    if (!selectedTransaction) {
      setFormData({
        payment_date: '',
        sent_by: '',
        mobile_number: '',
        payment_mode: 'Cash',
        collected_by: '',
        amount: '',
        remark: '',
      });
      return;
    }

    setFormData({
      payment_date: selectedTransaction.payment_date || '',
      sent_by: selectedTransaction.sent_by || '',
      mobile_number: selectedTransaction.mobile_number || '',
      payment_mode: selectedTransaction.payment_mode || 'Cash',
      collected_by: selectedTransaction.collected_by || '',
      amount: Number(selectedTransaction.amount || 0),
      remark: selectedTransaction.remark || '',
    });
    setIsEditing(false);
  }, [selectedTransaction]);

  const normalizeMobileNumber = (value = '') => {
    const rawDigits = value.replace(/\D/g, '');
    const digits = rawDigits.replace(/^91/, '').slice(0, 10);
    return digits ? `+91 ${digits}` : '';
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: name === 'amount' ? Number(value || 0) : name === 'mobile_number' ? normalizeMobileNumber(value) : value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedTransaction) {
      return;
    }

    const normalizedMobile = normalizeMobileNumber(formData.mobile_number);
    if (normalizedMobile && !/^\+91\s?\d{10}$/.test(normalizedMobile)) {
      alert('Mobile number must start with +91 and contain 10 digits after it.');
      return;
    }

    const payload = {
      payment_date: formData.payment_date,
      sent_by: formData.sent_by,
      mobile_number: normalizedMobile,
      payment_mode: formData.payment_mode,
      collected_by: formData.collected_by,
      amount: Number(formData.amount || 0),
      remark: formData.remark,
    };

    const keyField = getPaymentKeyField(selectedTransaction);
    const recordKey = getPaymentRecordKey(selectedTransaction);

    let updateRequest = supabase
      .from('PaymentTable')
      .update(payload);

    if (keyField === 'primaryKey') {
      updateRequest = updateRequest.eq('primaryKey', recordKey);
    } else if (keyField === 'primary_key') {
      updateRequest = updateRequest.eq('primary_key', recordKey);
    } else if (keyField === 'primarykey') {
      updateRequest = updateRequest.eq('primarykey', recordKey);
    } else {
      updateRequest = updateRequest.eq('id', recordKey);
    }

    const { error } = await updateRequest;

    if (error) {
      alert(error.message);
      return;
    }

    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        getPaymentRecordKey(transaction) === recordKey
          ? { ...transaction, ...payload }
          : transaction
      )
    );
    setIsEditing(false);
  };

  const handleDeleteTransaction = async (transactionItem = selectedTransaction) => {
    const targetTransaction = transactionItem || selectedTransaction;

    if (!targetTransaction) {
      return;
    }

    const confirmed = window.confirm('Delete this payment record?');
    if (!confirmed) {
      return;
    }

    const keyField = getPaymentKeyField(targetTransaction);
    const recordKey = getPaymentRecordKey(targetTransaction);

    let deleteRequest = supabase
      .from('PaymentTable')
      .delete();

    if (keyField === 'primaryKey') {
      deleteRequest = deleteRequest.eq('primaryKey', recordKey);
    } else if (keyField === 'primary_key') {
      deleteRequest = deleteRequest.eq('primary_key', recordKey);
    } else if (keyField === 'primarykey') {
      deleteRequest = deleteRequest.eq('primarykey', recordKey);
    } else {
      deleteRequest = deleteRequest.eq('id', recordKey);
    }

    const { error } = await deleteRequest;

    if (error) {
      alert(error.message);
      return;
    }

    const remainingTransactions = transactions.filter(
      (transaction) => getPaymentRecordKey(transaction) !== recordKey
    );
    setTransactions(remainingTransactions);
    setSelectedTransactionId(getPaymentRecordKey(remainingTransactions[0]) ?? null);
  };

  return (
    <section className="dashboard-page transaction-page">
      <div className="transaction-page-header">
        <button type="button" className="secondary-button" onClick={onBack || (() => window.history.pushState({}, '', '/'))} aria-label="Back to dashboard">
          ←
        </button>
        <h2>{patientName ? `Payment History of ${patientName}` : 'Payment History'}</h2>
      </div>

      <div className="transaction-list-card">
        {loading ? (
          <p className="empty-state">Loading payment history...</p>
        ) : transactions.length === 0 ? (
          <p className="empty-state">No payment history found.</p>
        ) : (
          <table className="records-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Bill No</th>
                <th>Date</th>
                <th>Sent By</th>
                <th>Mobile Number</th>
                <th>Payment Mode</th>
                <th>Collected By</th>
                <th>Amount</th>
                <th>Remark</th>
                <th className="action-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={getPaymentRecordKey(transaction) || `${transaction.bill_no}-${transaction.payment_date}-${transaction.amount}`}
                  className={getPaymentRecordKey(selectedTransaction) === getPaymentRecordKey(transaction) ? 'selected-row' : ''}
                  onClick={() => setSelectedTransactionId(getPaymentRecordKey(transaction))}
                >
                  <td>{transaction.patient_name || '-'}</td>
                  <td>{transaction.bill_no || '-'}</td>
                  <td>{transaction.payment_date || '-'}</td>
                  <td>{transaction.sent_by || '-'}</td>
                  <td>{transaction.mobile_number || '-'}</td>
                  <td>{transaction.payment_mode || '-'}</td>
                  <td>{transaction.collected_by || '-'}</td>
                  <td>{currencyFormatter.format(Number(transaction.amount || 0))}</td>
                  <td>{transaction.remark || '-'}</td>
                  <td className="action-column">
                    <div className="row-action-buttons">
                      <button
                        type="button"
                        className="icon-button edit-icon"
                        aria-label={`Edit payment for ${transaction.sent_by || 'record'}`}
                        title="Edit"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedTransactionId(getPaymentRecordKey(transaction));
                          setIsEditing(true);
                        }}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="icon-button delete-icon"
                        aria-label={`Delete payment for ${transaction.sent_by || 'record'}`}
                        title="Delete"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedTransactionId(getPaymentRecordKey(transaction));
                          handleDeleteTransaction(transaction);
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedTransaction && isEditing && (
        <div className="modal-overlay payment-edit-overlay">
          <div className="modal-content payment-edit-modal">
            <div className="inline-edit-header">
              <h3>Edit Payment Details</h3>
              <button type="button" className="close-inline-edit" onClick={() => setIsEditing(false)} aria-label="Close edit form">×</button>
            </div>

            <div className="payment-detail-grid">
              <label>
                Patient Name
                <input type="text" name="patient_name" value={selectedTransaction.patient_name || patientName || ''} readOnly />
              </label>

              <label>
                Bill No
                <input type="text" name="bill_no" value={selectedTransaction.bill_no || billNo || ''} readOnly />
              </label>

              <label>
                Payment Date
                <input type="date" name="payment_date" value={formData.payment_date || ''} onChange={handleChange} />
              </label>

              <label>
                Amount
                <input type="number" name="amount" min="0" step="0.01" value={formData.amount} onChange={handleChange} />
              </label>

              <label>
                Sent By
                <input type="text" name="sent_by" value={formData.sent_by} onChange={handleChange} />
              </label>

              <label>
                Mobile Number
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  placeholder="+91XXXXXXXXXX"
                  inputMode="numeric"
                  pattern="\+91 [0-9]{10}"
                />
              </label>

              <label>
                Payment Mode
                <select name="payment_mode" value={formData.payment_mode} onChange={handleChange}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </label>

              <label>
                Collected By
                <input type="text" name="collected_by" value={formData.collected_by} onChange={handleChange} />
              </label>

              <label className="payment-detail-full">
                Remark
                <textarea name="remark" rows="3" value={formData.remark} onChange={handleChange} />
              </label>
            </div>

            <div className="payment-details-actions">
              <button type="button" className="secondary-button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button" onClick={handleSaveChanges}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PatientTransactionPage;
