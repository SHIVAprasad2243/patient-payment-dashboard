import React from 'react';

const PatientTable = ({
  patientsLoading,
  filteredPatients,
  userRole,
  handlePrintClick,
  handleEditPatient,
  handleDeletePatient,
  selectedPatientIds = [],
  handlePatientSelectionToggle = () => {},
  handleSelectAllPatients = () => {},
}) => {
    const columnCount = userRole === 'admin' ? 16 : 15; // header columns depend on role
  

  return (

    <div className="records-table-container">

      <table className="records-table">
        <thead>
          <tr>
            <th className="selection-col">
              <input
                type="checkbox"
                aria-label="Select all visible patients"
                checked={filteredPatients.length > 0 && filteredPatients.every((patient) => selectedPatientIds.includes(patient.id))}
                onChange={handleSelectAllPatients}
                disabled={filteredPatients.length === 0}
              />
            </th>
            <th>Patient Name</th>
            <th>Age/Sex</th>
            <th>Relative Name</th>
            <th>Cell No</th>
            <th>Admission Date</th>
            <th>Diagnosis</th>
            <th>Surgeon</th>
            <th>Anaesthetist</th>
            <th>Assistant</th>
            {userRole === 'admin' && <th>Charge</th>}
            <th>Remaining Balance</th>
            <th>Total Amount</th>
            <th>Payment status</th>
            <th>Payment method</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {patientsLoading && filteredPatients.length === 0 ? (

            <tr>
              <td colSpan={columnCount} className="table-empty-state">
                Loading patient details...
              </td>
            </tr>
          ) : filteredPatients.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="table-empty-state">
                No records found
              </td>
            </tr>
          ) : (
            filteredPatients.map((patient) => {
              const totalCharge =
                Number(patient.surgeon_charge || 0) +
                Number(patient.anaesthetist_charge || 0) +
                Number(patient.assistant_charge || 0);

              return (
                <tr key={patient.id}>
                  <td className="selection-col">
                    <input
                      type="checkbox"
                      checked={selectedPatientIds.includes(patient.id)}
                      onChange={() => handlePatientSelectionToggle(patient.id)}
                      aria-label={`Select ${patient.first_name || 'patient'} ${patient.last_name || ''}`}
                    />
                  </td>
                  <td className="font-bold">
                    <div className="table-patient-info">
                      {patient.photo_url ? (
                        <img src={patient.photo_url} alt="Avatar" className="table-avatar" />
                      ) : (
                        <div className="table-avatar-placeholder">
                          {patient.first_name ? patient.first_name[0] : 'P'}
                        </div>
                      )}
                      <span>{patient.first_name} {patient.last_name}</span>
                    </div>
                  </td>
                  <td>
                    {patient.age || '-'} / {patient.gender ? patient.gender.charAt(0) : '-'}
                  </td>
                  <td>{patient.husband_name || '-'}</td>
                  <td>{patient.phone || '-'}</td>
                  <td>{patient.date_of_admission || '-'}</td>
                  <td>
                    <div className="diagnosis-cell" title={patient.diagnosis}>
                      {patient.diagnosis || '-'}
                    </div>
                  </td>
                  <td>{patient.surgeon_name || '-'}</td>
                  <td>{patient.anaesthetist_name || '-'}</td>
                  <td>{patient.assistant_name || '-'}</td>
                  
                    {userRole === 'admin' && (
                      <td>{patient.charge ? `₹${patient.charge}` : '₹0'}</td>
                    )}
                  <td>₹{patient.remaining_amount || 0}</td>
                  <td>₹{patient.total_amount || 0}</td>
                  <td>
                    <span
                      className={
                        patient.payment_status === 'Fully Paid'
                          ? 'status-badge fully-paid'
                          : 'status-badge due'
                      }
                    >
                      {patient.payment_status || 'Due'}
                    </span>
                  </td>
                  <td>{patient.cash_method || 'Not Selected'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="text-button print-btn"
                        onClick={() => handlePrintClick(patient)}
                        title="Print Preview"
                      >
                        🖨️
                      </button>
                      <button
                        className="text-button edit-btn"
                        onClick={() => handleEditPatient(patient)}
                        title="Edit"
                      >
                        ✎
                      </button>
                      {userRole === 'admin' && (
                        <button
                          className="text-button delete-btn"
                          onClick={() => handleDeletePatient(patient.id)}
                          title="Delete"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>

    );
};

export default PatientTable;
