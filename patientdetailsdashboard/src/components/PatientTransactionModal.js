import React, { useState } from 'react';

const getInitialForm = (patient) => {
  const fullName = `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim();

  return {
    patientName: fullName,
    billNo: patient?.bill_no || '',
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: '',
    sentBy: '',
    mobileNumber: '',
    paymentMode: 'Cash',
    collectedBy: '',
    remark: '',
  };
};

const normalizeMobileNumber = (value = '') => {
  const rawDigits = value.replace(/\D/g, '');
  const digits = rawDigits.replace(/^91/, '').slice(0, 10);
  return digits ? `+91 ${digits}` : '';
};

const PatientTransactionModal = ({ patient, onClose, onSave }) => {
  const [formData, setFormData] = useState(() => getInitialForm(patient));

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'mobileNumber' ? normalizeMobileNumber(value) : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedMobile = normalizeMobileNumber(formData.mobileNumber);
    if (normalizedMobile && !/^\+91\d{10}$/.test(normalizedMobile)) {
      alert('Mobile number must start with +91 and contain 10 digits after it.');
      return;
    }

    onSave({
      ...formData,
      mobileNumber: normalizedMobile,
      amount: Number(formData.amount) || 0,
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content transaction-modal">
        <div className="modal-header">
          <h2>Add Payment</h2>
          <button type="button" className="close-modal" onClick={onClose} title="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="transaction-grid">
            <div>
              <label htmlFor="patientName">Name</label>
              <input
                id="patientName"
                name="patientName"
                type="text"
                value={formData.patientName}
                readOnly
              />
            </div>

            <div>
              <label htmlFor="billNo">Bill No</label>
              <input
                id="billNo"
                name="billNo"
                type="text"
                value={formData.billNo}
                readOnly
              />
            </div>

            <div>
              <label htmlFor="paymentDate">Payment Date</label>
              <input
                id="paymentDate"
                name="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Amount"
                required
              />
            </div>

            <div>
              <label htmlFor="sentBy">Sent By</label>
              <input
                id="sentBy"
                name="sentBy"
                type="text"
                value={formData.sentBy}
                onChange={handleChange}
                placeholder="Sent By"
              />
            </div>

            <div>
              <label htmlFor="mobileNumber">Mobile Number</label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                inputMode="numeric"
                pattern="\+91 [0-9]{10}"
              />
            </div>

            <div>
              <label htmlFor="paymentMode">Payment Mode</label>
              <select
                id="paymentMode"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label htmlFor="collectedBy">Collected By</label>
              <input
                id="collectedBy"
                name="collectedBy"
                type="text"
                value={formData.collectedBy}
                onChange={handleChange}
                placeholder="Collected By"
              />
            </div>

            <div className="transaction-full-width">
              <label htmlFor="remark">Remark</label>
              <textarea
                id="remark"
                name="remark"
                rows="3"
                value={formData.remark}
                onChange={handleChange}
                placeholder="Remark"
              />
            </div>
          </div>

          <div className="transaction-modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientTransactionModal;
