import React from 'react';

const PatientModal = ({ 
  editingPatientId, 
  setShowPatientModal, 
  patientForm, 
  handlePatientChange, 
  handleImageChange, 
  handlePatientSubmit, 
  patientsLoading, 
  patientMessage, 
  masterDiagnoses, 
  masterStaff,
  userRole 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h2>
            {editingPatientId
              ? 'Edit Patient Details'
              : 'New Patient Record'}
          </h2>
          <button
            className="close-modal"
            onClick={() => setShowPatientModal(false)}
            title="Cancel"
          >
            &times;
          </button>
        </div>
        <form className="patient-form scrollable-form" onSubmit={handlePatientSubmit}>
          <div className="image-upload-section">
            <div className="image-preview-container">
              {patientForm.patient_image ? (
                <img src={patientForm.patient_image} alt="Patient Preview" />
              ) : (
                <div className="placeholder-icon">👤</div>
              )}
            </div>
            <label className="upload-label">
              {patientForm.patient_image ? 'Change Photo' : 'Upload Patient Photo'}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden-input" 
                onChange={handleImageChange} 
              />
            </label>
            <p className="helper-text-small">Format: JPG, PNG. Max size: 2MB</p>
          </div>

          <div className="form-section">
            <div className="form-row">
              <div>
                <label>First name</label>
                <input
                  name="first_name"
                  type="text"
                  value={patientForm.first_name}
                  onChange={handlePatientChange}
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <label>Last name</label>
                <input
                  name="last_name"
                  type="text"
                  value={patientForm.last_name}
                  onChange={handlePatientChange}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>Age</label>
                <input
                  name="age"
                  type="number"
                  value={patientForm.age}
                  onChange={handlePatientChange}
                  placeholder="Age"
                />
              </div>
              <div>
                <label>Gender</label>
                <select
                  name="gender"
                  value={patientForm.gender}
                  onChange={handlePatientChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>Phone Number (Cell No)</label>
                <input
                  name="cell_no"
                  type="tel"
                  value={patientForm.cell_no}
                  onChange={handlePatientChange}
                  placeholder="Phone number"
                  pattern="\+91 [0-9]{10}"
                  minLength={14}
                  maxLength={14}
                  required
                />
              </div>
              <div>
                <label>Relative Name</label>
                <input
                  name="husband_name"
                  type="text"
                  value={patientForm.husband_name}
                  onChange={handlePatientChange}
                  placeholder="Relative Name"
                />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>Alternative number</label>
                <input
                  name="alternative_number"
                  type="tel"
                  value={patientForm.alternative_number}
                  onChange={handlePatientChange}
                  placeholder="Alt number"
                  pattern="\+91 [0-9]{10}"
                  minLength={14}
                  maxLength={14}
                />
              </div>
              <div>
                <label>Date of admission</label>
                <input
                  name="date_of_admission"
                  type="date"
                  value={patientForm.date_of_admission}
                  onChange={handlePatientChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>Reg No</label>
                <input
                  name="reg_no"
                  type="text"
                  value={patientForm.reg_no}
                  onChange={handlePatientChange}
                  placeholder="Reg No"
                  pattern="[0-9]*"
                />
              </div>
              <div>
                <label>Bill No</label>
                <input
                  name="bill_no"
                  type="text"
                  value={patientForm.bill_no}
                  onChange={handlePatientChange}
                  placeholder="Bill No"
                  pattern="[0-9]*"
                />
              </div>
            </div>
            <div>
              <label>Address</label>
              <textarea
                name="address"
                value={patientForm.address}
                onChange={handlePatientChange}
                placeholder="Full address"
                rows="2"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Surgery & Diagnosis</h3>
            <div className="form-row">
              <div>
                <label>Diagnosis</label>
                <input
                  name="diagnosis"
                  list="diagnosis-list"
                  value={patientForm.diagnosis}
                  onChange={handlePatientChange}
                  placeholder="Select or type diagnosis..."
                />
                <datalist id="diagnosis-list">
                  {masterDiagnoses.map((d, i) => (
                    <option key={i} value={d} />
                  ))}
                </datalist>
              </div>
              <div>
                <label>Surgeon Name</label>
                <input
                  name="surgeon_name"
                  list="surgeon-list"
                  type="text"
                  value={patientForm.surgeon_name}
                  onChange={handlePatientChange}
                  placeholder="Surgeon Name"
                />
                <datalist id="surgeon-list">
                  {masterStaff.surgeons.map((s, i) => (
                    <option key={i} value={s} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>Anaesthetist Name</label>
                <input
                  name="anaesthetist_name"
                  list="anaesthetist-list"
                  type="text"
                  value={patientForm.anaesthetist_name}
                  onChange={handlePatientChange}
                  placeholder="Anaesthetist Name"
                />
                <datalist id="anaesthetist-list">
                  {masterStaff.anaesthetists.map((a, i) => (
                    <option key={i} value={a} />
                  ))}
                </datalist>
              </div>
              <div>
                <label>Assistant Name</label>
                <input
                  name="assistant_name"
                  list="assistant-list"
                  type="text"
                  value={patientForm.assistant_name}
                  onChange={handlePatientChange}
                  placeholder="Assistant Name"
                />
                <datalist id="assistant-list">
                  {masterStaff.assistants.map((ast, i) => (
                    <option key={i} value={ast} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {userRole === 'admin' && (
            <>
              <div className="form-section">
                <h3 className="section-title">Payment Details</h3>
                <div className="form-row">
                  <div>
                    <label>Package Amount (₹)</label>
                    <input
                      name="package_amount"
                      type="number"
                      value={patientForm.package_amount}
                      onChange={handlePatientChange}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label>Total Amount (₹)</label>
                    <input
                      name="total_amount"
                      type="number"
                      value={patientForm.total_amount}
                      onChange={handlePatientChange}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div>
                    <label>Advance Payment (₹)</label>
                    <input
                      name="advance_payment"
                      type="number"
                      value={patientForm.advance_payment}
                      onChange={handlePatientChange}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label>Discount (₹)</label>
                    <input
                      name="discount"
                      type="number"
                      value={patientForm.discount}
                      onChange={handlePatientChange}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div>
                    <label>Remaining Amount (₹)</label>
                    <div className="balance-box">
                      ₹{(Number(patientForm.package_amount) || 0) - (Number(patientForm.total_amount) || 0) - (Number(patientForm.advance_payment) || 0) - (Number(patientForm.discount) || 0)}
                    </div>
                  </div>
                  <div>
                    <label>Cash Method</label>
                    <select
                      name="cash_method"
                      value={patientForm.cash_method}
                      onChange={handlePatientChange}
                      className="full-width-input"
                    >
                      <option value="">Select Method</option>
                      <option value="Cash">Cash</option>
                      <option value="PhonePay">PhonePay</option>
                      <option value="GPay">GPay</option>
                      <option value="Scanner">Scanner</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Professional Charges</h3>
                <div className="form-row">
                  <div>
                    <label>Surgeon Charge (₹)</label>
                    <input
                      name="surgeon_charge"
                      type="number"
                      value={patientForm.surgeon_charge}
                      onChange={handlePatientChange}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label>Anaesthetist Charge (₹)</label>
                    <input
                      name="anaesthetist_charge"
                      type="number"
                      value={patientForm.anaesthetist_charge}
                      onChange={handlePatientChange}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div>
                    <label>Assistant Charge (₹)</label>
                    <input
                      name="assistant_charge"
                      type="number"
                      value={patientForm.assistant_charge}
                      onChange={handlePatientChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {patientMessage && (
            <p className="status-message">{patientMessage}</p>
          )}

          <div className="form-actions-row">
            <button
              className="primary-button"
              style={{ width: '100%' }}
              type="submit"
              disabled={patientsLoading}
            >
              {patientsLoading
                ? 'Saving...'
                : editingPatientId
                ? 'Update Details'
                : 'Save Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
