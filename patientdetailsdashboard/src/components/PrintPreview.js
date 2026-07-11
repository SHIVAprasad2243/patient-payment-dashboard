import React from 'react';

const PrintPreview = ({ selectedPatient, handlePrint, setShowPrintModal, userRole }) => {
  return (
    <div className="modal-overlay print-modal-overlay">
      <div className="modal-content modal-large print-preview-modal">
        <div className="modal-header no-print">
          <h2>Patient Details Preview</h2>
          <div className="modal-header-actions">
            <button className="print-action-btn" onClick={handlePrint}>
              Print Details
            </button>
            <button
              className="close-modal"
              onClick={() => setShowPrintModal(false)}
            >
              &times;
            </button>
          </div>
        </div>

        <div className="modal-scroll-area">
          <div id="printable-area" className="printable-content">
            <div className="print-hospital-header">
              <img
                src="/images.jpg"
                alt="Logo"
                className="print-logo"
              />
              <div className="print-hospital-info">
                <h1 style={{ color: '#0f766e' }}>SIDDHARTHA NURSING HOME</h1>
                <p>near Gandhi park, Chinna kondur road, Choutuppal</p>
                <p>Phone: +91 9912033193</p>
              </div>
            </div>

            <div className="print-body">
              <div className="print-section">
                <div className="print-grid">
                  <div className="print-item"><strong>Full Name:</strong> {selectedPatient.first_name} {selectedPatient.last_name}</div>
                  <div className="print-item"><strong>Age/Gender:</strong> {selectedPatient.age || '-'} / {selectedPatient.gender || '-'}</div>

                  <div className="print-item"><strong>Relative Name:</strong> {selectedPatient.husband_name || '-'}</div>
                  <div className="print-item"><strong>Bill Date:</strong> {selectedPatient.date_of_admission || '-'}</div>

                  <div className="print-item"><strong>Phone No:</strong> {selectedPatient.phone || '-'}</div>
                  <div className="print-item"><strong>Reg No:</strong> {selectedPatient.reg_no || '-'}</div>

                  <div className="print-item"><strong>Address:</strong> {selectedPatient.address || '-'}</div>
                  <div className="print-item"><strong>Bill No:</strong> {selectedPatient.bill_no || '-'}</div>
                </div>
              </div>

              <div className="print-section">
                <div className="print-grid">
                  <div className="print-item"><strong>Doctor Name:</strong> {selectedPatient.surgeon_name || '-'}</div>

                  <div className="print-item"><strong>Diagnosis:</strong> {selectedPatient.diagnosis || '-'}</div>
                </div>
              </div>

              {userRole === 'admin' && (
                <div className="print-section">
                  <hr className="print-divider" />
                  <div className="print-billing-grid">
                    <div className="billing-left">
                      <div className="print-item"><strong>Package:</strong> ₹{selectedPatient.package_amount || 0}</div>
                    </div>
                    <div className="billing-right">
                      <div className="print-item"><strong>Advance Payment:</strong> ₹{selectedPatient.advance_payment || 0}</div>
                      <div className="print-item"><strong>Remaining Balance:</strong> ₹{selectedPatient.remaining_amount || 0}</div>
                      <div className="print-item"><strong>Discount:</strong> ₹{selectedPatient.discount || 0}</div>
                      <div className="print-item"><strong>Total Amount:</strong> ₹{selectedPatient.total_amount || 0}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="print-footer">
              <div className="print-signature">
                <div className="signature-line"></div>
                <p>Authorized Signature</p>
              </div>
              <div className="print-date">
                Printed on: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
