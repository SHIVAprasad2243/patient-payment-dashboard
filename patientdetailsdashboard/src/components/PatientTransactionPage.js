import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const PatientTransactionPage = ({ patientName = '', patientId = '', billNo = '', onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!supabase) {
        setTransactions([]);
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
      } else {
        setTransactions(data || []);
      }

      setLoading(false);
    };

    fetchTransactions();
  }, [patientId, billNo, patientName]);

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
                <th>Date</th>
                <th>Sent By</th>
                <th>Mobile Number</th>
                <th>Payment Mode</th>
                <th>Collected By</th>
                <th>Amount</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id || `${transaction.bill_no}-${transaction.payment_date}-${transaction.amount}`}>
                  <td>{transaction.payment_date || '-'}</td>
                  <td>{transaction.sent_by || '-'}</td>
                  <td>{transaction.mobile_number || '-'}</td>
                  <td>{transaction.payment_mode || '-'}</td>
                  <td>{transaction.collected_by || '-'}</td>
                  <td>₹{Number(transaction.amount || 0).toLocaleString('en-IN')}</td>
                  <td>{transaction.remark || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default PatientTransactionPage;
