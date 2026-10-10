import React, { useEffect, useRef, useState } from 'react';
import { formatINR } from '../utils/numberFormat';
import { formatDateIndian, formatDateTimeIndian } from '../utils/dateFormat';
import { supabase } from '../lib/supabaseClient';
import PatientTransactionModal from './PatientTransactionModal';

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
  onViewTransaction = () => {},
}) => {
  const columnCount = userRole === 'admin' ? 19 : 18;
  const [menuPatientId, setMenuPatientId] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionPatient, setTransactionPatient] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const actionMenuRef = useRef(null);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage('');
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!actionMenuRef.current) {
        return;
      }

      const clickedInsideMenu = actionMenuRef.current.contains(event.target);
      if (!clickedInsideMenu) {
        setMenuPatientId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenTransactionMenu = (patient) => {
    setMenuPatientId(menuPatientId === patient.id ? null : patient.id);
    setTransactionPatient(patient);
  };

  const handleAddTransaction = (patient) => {
    setTransactionPatient(patient);
    setShowTransactionModal(true);
    setMenuPatientId(null);
  };

  const handleSaveTransaction = async (payload) => {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured. Payment record was not saved.');
        setShowTransactionModal(false);
        setTransactionPatient(null);
        return;
      }

      const patientName = `${transactionPatient?.first_name || ''} ${transactionPatient?.last_name || ''}`.trim() || payload.patientName || '';
      const sanitizedMobile = String(payload.mobileNumber || '').replace(/\D/g, '').slice(0, 12);

      const paymentRecord = {
        patient_name: patientName,
        bill_no: payload.billNo || transactionPatient?.bill_no || '',
        patientID: transactionPatient?.id ?? null,
        payment_date: payload.paymentDate || new Date().toISOString().slice(0, 10),
        amount: Number(payload.amount) || 0,
        sent_by: payload.sentBy || '',
        mobile_number: sanitizedMobile,
        payment_mode: payload.paymentMode || 'Cash',
        collected_by: payload.collectedBy || '',
        remark: payload.remark || '',
      };

      const { error } = await supabase.from('PaymentTable').insert([paymentRecord]);

      if (error) {
        throw error;
      }

      const redirectPath = `/patient/${encodeURIComponent(patientName || 'patient')}/transaction?${new URLSearchParams({
        patientId: transactionPatient?.id ?? '',
        billNo: payload.billNo || transactionPatient?.bill_no || '',
      }).toString()}`;

      setToastMessage('Payment saved successfully');
      setShowTransactionModal(false);
      setTransactionPatient(null);
      onViewTransaction(redirectPath);
    } catch (error) {
      console.error('Error saving payment:', error);
      alert(error?.message || 'Failed to save payment.');
    }
  };

  const handleViewTransactions = (patient) => {
    const patientName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'patient';
    const query = new URLSearchParams({
      patientId: patient.id ?? '',
      billNo: patient.bill_no ?? '',
    }).toString();

    onViewTransaction(`/patient/${encodeURIComponent(patientName)}/transaction?${query}`);
    setMenuPatientId(null);
  };

  return (
    <>
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
              <th>Discharge  Date</th>
              <th>Diagnosis</th>
              <th>Baby Birth Date</th>
              <th>Baby Gender</th>
              <th>Baby Weight</th>
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
                    <td>{formatDateIndian(patient.date_of_admission) || '-'}</td>
                    <td>{formatDateIndian(patient.date_of_discharge) || '-'}</td>
                    <td>
                      <div className="diagnosis-cell" title={patient.diagnosis}>
                        {patient.diagnosis || '-'}
                      </div>
                    </td>
                    <td>{formatDateTimeIndian(patient.baby_date_of_birth ?? patient.baby_birth_date) || '-'}</td>
                    <td>{patient.baby_gender || '-'}</td>
                    <td>{patient.baby_weight ? `${patient.baby_weight} kg` : '-'}</td>
                    <td>{patient.surgeon_name || '-'}</td>
                    <td>{patient.anaesthetist_name || '-'}</td>
                    <td>{patient.assistant_name || '-'}</td>

                    {userRole === 'admin' && (
                      <td>{patient.charge ? formatINR(patient.charge) : formatINR(0)}</td>
                    )}
                    <td>{formatINR(patient.remaining_amount || 0)}</td>
                    <td>{formatINR(patient.total_amount || 0)}</td>
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
                    <td className="table-action-cell">
                      <div className="table-actions">
                        {userRole === 'admin' && (
                          <div
                            className="action-menu-wrapper"
                            ref={menuPatientId === patient.id ? actionMenuRef : null}
                          >
                            <button
                              className="text-button action-menu-btn"
                              onClick={() => handleOpenTransactionMenu(patient)}
                              title="More actions"
                              aria-label="More actions"
                            >
                              ⋮
                            </button>

                            {menuPatientId === patient.id && (
                              <div className="action-menu">
                                <button type="button" onClick={() => handleAddTransaction(patient)}>
                                  Add Payment
                                </button>
                                <button type="button" onClick={() => handleViewTransactions(patient)}>
                                  View Payment
                                </button>
                              </div>
                            )}
                          </div>
                        )}

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
                            onClick={() => handleDeletePatient(patient)}
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

      {showTransactionModal && transactionPatient && (
        <PatientTransactionModal
          patient={transactionPatient}
          onClose={() => {
            setShowTransactionModal(false);
            setTransactionPatient(null);
          }}
          onSave={handleSaveTransaction}
        />
      )}

      {toastMessage && (
        <div className="toast-container" role="status" aria-live="polite" aria-atomic="true">
          <div className="toast toast-success">{toastMessage}</div>
        </div>
      )}
    </>
  );
};

export default PatientTable;
