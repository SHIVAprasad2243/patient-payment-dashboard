import React, { useEffect, useMemo, useState } from 'react';
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

const getPaymentSelectionKey = (transaction = {}) => {
  const recordKey = getPaymentRecordKey(transaction);
  if (recordKey !== null && recordKey !== undefined) {
    return String(recordKey);
  }

  return `${transaction.patient_name || 'unknown'}-${transaction.bill_no || 'unknown'}-${transaction.payment_date || ''}-${transaction.amount || 0}`;
};

const normalizeMobileDisplay = (value = '') => {
  const digits = String(value || '').replace(/\D/g, '').slice(-10);
  return digits ? `+91 ${digits}` : '';
};

const sanitizeMobileNumberForDb = (value = '') => String(value || '').replace(/\D/g, '').slice(0, 12);

const PaymentHistoryPage = ({ initialTransactions = [], onBack }) => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(!initialTransactions.length);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [selectedPaymentKeys, setSelectedPaymentKeys] = useState([]);
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
    if (initialTransactions.length) {
      setTransactions(initialTransactions);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchTransactions = async () => {
      if (!supabase) {
        if (isMounted) {
          setTransactions([]);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('PaymentTable')
        .select('*')
        .order('payment_date', { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Error fetching payment history:', error);
        setTransactions([]);
      } else {
        setTransactions(data || []);
      }

      setLoading(false);
    };

    fetchTransactions();

    return () => {
      isMounted = false;
    };
  }, [initialTransactions]);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return transactions;
    }

    return transactions.filter((transaction) => {
      const byName = String(transaction.patient_name || '').toLowerCase().includes(query);
      const byBillNo = String(transaction.bill_no || '').toLowerCase().includes(query);
      return byName || byBillNo;
    });
  }, [transactions, searchQuery]);

  const selectedTransaction = transactions.find((transaction) => getPaymentRecordKey(transaction) === selectedTransactionId) || null;
  const selectedCount = selectedPaymentKeys.length;

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
      mobile_number: normalizeMobileDisplay(selectedTransaction.mobile_number || ''),
      payment_mode: selectedTransaction.payment_mode || 'Cash',
      collected_by: selectedTransaction.collected_by || '',
      amount: Number(selectedTransaction.amount || 0),
      remark: selectedTransaction.remark || '',
    });
    setIsEditing(false);
  }, [selectedTransaction]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: name === 'amount' ? Number(value || 0) : name === 'mobile_number' ? normalizeMobileDisplay(value) : value,
    }));
  };

  const togglePaymentSelection = (transaction) => {
    const selectionKey = getPaymentSelectionKey(transaction);
    setSelectedPaymentKeys((currentKeys) => {
      if (currentKeys.includes(selectionKey)) {
        return currentKeys.filter((key) => key !== selectionKey);
      }
      return [...currentKeys, selectionKey];
    });
  };

  const toggleSelectAllPayments = () => {
    const visibleKeys = filteredTransactions.map((transaction) => getPaymentSelectionKey(transaction));
    const allVisibleSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selectedPaymentKeys.includes(key));

    if (allVisibleSelected) {
      setSelectedPaymentKeys((currentKeys) => currentKeys.filter((key) => !visibleKeys.includes(key)));
      return;
    }

    setSelectedPaymentKeys((currentKeys) => [...new Set([...currentKeys, ...visibleKeys])]);
  };

  const handleDownloadSelected = () => {
    if (!selectedCount) {
      return;
    }

    const selectedRows = filteredTransactions.filter((transaction) =>
      selectedPaymentKeys.includes(getPaymentSelectionKey(transaction))
    );

    if (!selectedRows.length) {
      return;
    }

    const headers = ['Patient Name', 'Bill No', 'Payment Date', 'Sent By', 'Mobile Number', 'Payment Mode', 'Collected By', 'Amount', 'Remark'];
    const rows = selectedRows.map((transaction) => [
      transaction.patient_name || '',
      transaction.bill_no || '',
      transaction.payment_date || '',
      transaction.sent_by || '',
      normalizeMobileDisplay(transaction.mobile_number) || '',
      transaction.payment_mode || '',
      transaction.collected_by || '',
      Number(transaction.amount || 0),
      transaction.remark || '',
    ]);

    const csvRows = [headers, ...rows].map((row) =>
      row.map((cell) => {
        const value = String(cell ?? '').replace(/"/g, '""');
        return `"${value}"`;
      }).join(',')
    );

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `selected-payments-${selectedCount}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveChanges = async () => {
    if (!selectedTransaction) {
      return;
    }

    const normalizedMobile = normalizeMobileDisplay(formData.mobile_number);
    if (normalizedMobile && !/^\+91\s?\d{10}$/.test(normalizedMobile)) {
      alert('Mobile number must start with +91 and contain 10 digits after it.');
      return;
    }

    const payload = {
      payment_date: formData.payment_date,
      sent_by: formData.sent_by,
      mobile_number: sanitizeMobileNumberForDb(normalizedMobile),
      payment_mode: formData.payment_mode,
      collected_by: formData.collected_by,
      amount: Number(formData.amount || 0),
      remark: formData.remark,
    };

    const keyField = getPaymentKeyField(selectedTransaction);
    const recordKey = getPaymentRecordKey(selectedTransaction);

    let updateRequest = supabase.from('PaymentTable').update(payload);

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

  const handleDeleteTransaction = async (transaction) => {
    const recordKey = getPaymentRecordKey(transaction);
    if (!recordKey) {
      return;
    }

    const confirmed = window.confirm('Delete this payment record?');
    if (!confirmed) {
      return;
    }

    const keyField = getPaymentKeyField(transaction);
    let deleteRequest = supabase.from('PaymentTable').delete();

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

    setTransactions((currentTransactions) =>
      currentTransactions.filter((item) => getPaymentRecordKey(item) !== recordKey)
    );
    if (selectedTransactionId === recordKey) {
      setSelectedTransactionId(null);
    }
  };

  return (
    <section className="dashboard-page payment-history-page">
      <div className="transaction-page-header">
        <button
          type="button"
          className="secondary-button"
          onClick={onBack || (() => window.history.pushState({}, '', '/'))}
          aria-label="Back to dashboard"
        >
          ←
        </button>
        <h2>Payment History</h2>
      </div>

      <div className="payment-history-toolbar">
        <div className="payment-history-search">
          <span className="payment-search-icon" aria-hidden="true">🔎</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name or bill no"
            aria-label="Search payment history by patient name or bill number"
          />
        </div>

        <button
          type="button"
          className="download-selected-button"
          onClick={handleDownloadSelected}
          disabled={selectedCount === 0}
          aria-label={`Download Selected (${selectedCount})`}
        >
          Download Selected ({selectedCount})
        </button>
      </div>

      <div className="payment-history-list-card">
        {loading ? (
          <p className="empty-state">Loading payment history...</p>
        ) : filteredTransactions.length === 0 ? (
          <p className="empty-state">No payment history found.</p>
        ) : (
          <table className="records-table">
            <thead>
              <tr>
                <th className="select-col-header">
                  <input
                    type="checkbox"
                    checked={filteredTransactions.length > 0 && filteredTransactions.every((transaction) => selectedPaymentKeys.includes(getPaymentSelectionKey(transaction)))}
                    onChange={toggleSelectAllPayments}
                    aria-label="Select all payment rows"
                  />
                </th>
                <th>Patient Name</th>
                <th>Bill No</th>
                <th>Payment Date</th>
                <th>Sent By</th>
                <th>Mobile Number</th>
                <th>Payment Mode</th>
                <th>Collected By</th>
                <th>Amount</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => {
                const recordKey = getPaymentRecordKey(transaction);
                const selectionKey = getPaymentSelectionKey(transaction);
                const isSelected = selectedPaymentKeys.includes(selectionKey);

                return (
                  <tr key={recordKey || `${transaction.bill_no}-${transaction.payment_date}-${transaction.amount}`}>
                    <td className="select-col">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePaymentSelection(transaction)}
                        aria-label={`Select payment for ${transaction.patient_name || 'record'}`}
                      />
                    </td>
                    <td>{transaction.patient_name || '-'}</td>
                    <td>{transaction.bill_no || '-'}</td>
                    <td>{transaction.payment_date || '-'}</td>
                    <td>{transaction.sent_by || '-'}</td>
                    <td>{normalizeMobileDisplay(transaction.mobile_number) || '-'}</td>
                    <td>{transaction.payment_mode || '-'}</td>
                    <td>{transaction.collected_by || '-'}</td>
                    <td>{currencyFormatter.format(Number(transaction.amount || 0))}</td>
                    <td>{transaction.remark || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedTransaction && isEditing && (
        <div className="inline-edit-panel">
          <div className="inline-edit-header">
            <h3>Edit Payment Details</h3>
            <button type="button" className="close-inline-edit" onClick={() => setIsEditing(false)} aria-label="Close edit form">×</button>
          </div>

          <div className="payment-detail-grid">
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
              <input type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} />
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
      )}
    </section>
  );
};

export default PaymentHistoryPage;
