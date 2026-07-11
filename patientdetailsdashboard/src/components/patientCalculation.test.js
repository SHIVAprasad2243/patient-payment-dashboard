import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PatientTable from './PatientTable';
import PatientModal from './PatientModal';
import PrintPreview from './PrintPreview';

describe('Payment calculations and Form fields', () => {
  const mockPatient = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    age: 30,
    gender: 'Male',
    husband_name: 'Jane Doe',
    phone: '+91 1234567890',
    date_of_admission: '2026-07-10',
    diagnosis: 'Hernia',
    surgeon_name: 'Dr. Ramesh',
    anaesthetist_name: 'Dr. Anitha',
    assistant_name: 'Mr. Raju',
    package_amount: 50000,
    total_amount: 10000,
    advance_payment: 5000,
    discount: 2000,
    photo_url: '',
    reg_no: '101',
    bill_no: '202',
  };

  test('PatientTable calculates and displays correct Remaining Balance', () => {
    render(
      <PatientTable
        patientsLoading={false}
        filteredPatients={[mockPatient]}
        userRole="admin"
        handlePrintClick={jest.fn()}
        handleEditPatient={jest.fn()}
        handleDeletePatient={jest.fn()}
      />
    );

    // Remaining Balance calculated: 50000 - 10000 - 5000 - 2000 = 33000
    expect(screen.getByText('₹33000')).toBeInTheDocument();
    // Total Pay displayed: ₹10000
    expect(screen.getByText('₹10000')).toBeInTheDocument();
  });

  test('PatientModal shows correct Remaining Amount calculation in form', () => {
    const mockForm = {
      first_name: 'John',
      last_name: 'Doe',
      reg_no: '101',
      bill_no: '202',
      husband_name: 'Jane Doe',
      gender: 'Male',
      age: '30',
      cell_no: '+91 1234567890',
      alternative_number: '',
      address: '',
      date_of_admission: '2026-07-10',
      diagnosis: 'Hernia',
      surgeon_name: 'Dr. Ramesh',
      anaesthetist_name: 'Dr. Anitha',
      assistant_name: 'Mr. Raju',
      package_amount: '50000',
      total_amount: '10000',
      advance_payment: '5000',
      discount: '2000',
      patient_image: '',
      cash_method: '',
      surgeon_charge: '',
      anaesthetist_charge: '',
      assistant_charge: '',
    };

    render(
      <PatientModal
        editingPatientId={null}
        setShowPatientModal={jest.fn()}
        patientForm={mockForm}
        handlePatientChange={jest.fn()}
        handleImageChange={jest.fn()}
        handlePatientSubmit={jest.fn()}
        patientsLoading={false}
        patientMessage=""
        masterDiagnoses={[]}
        masterStaff={{ surgeons: [], anaesthetists: [], assistants: [] }}
        userRole="admin"
      />
    );

    // Displays the Remaining Amount box: 50000 - 10000 - 5000 - 2000 = 33000
    expect(screen.getByText('₹33000')).toBeInTheDocument();
  });

  test('PrintPreview displays correct Reg No and Bill No based on database properties', () => {
    render(
      <PrintPreview
        selectedPatient={mockPatient}
        handlePrint={jest.fn()}
        setShowPrintModal={jest.fn()}
        userRole="admin"
      />
    );

    // Checks Reg No rendering
    expect(screen.getByText('101')).toBeInTheDocument();
    // Checks Bill No rendering
    expect(screen.getByText('202')).toBeInTheDocument();
  });

  test('PatientModal Phone, Alt Phone, Reg No, and Bill No inputs have correct restrictions', () => {
    const mockForm = {
      first_name: '',
      last_name: '',
      reg_no: '',
      bill_no: '',
      husband_name: '',
      gender: '',
      age: '',
      cell_no: '',
      alternative_number: '',
      address: '',
      date_of_admission: '',
      diagnosis: '',
      surgeon_name: '',
      anaesthetist_name: '',
      assistant_name: '',
      package_amount: '',
      total_amount: '',
      advance_payment: '',
      discount: '',
      patient_image: '',
      cash_method: '',
      surgeon_charge: '',
      anaesthetist_charge: '',
      assistant_charge: '',
    };

    render(
      <PatientModal
        editingPatientId={null}
        setShowPatientModal={jest.fn()}
        patientForm={mockForm}
        handlePatientChange={jest.fn()}
        handleImageChange={jest.fn()}
        handlePatientSubmit={jest.fn()}
        patientsLoading={false}
        patientMessage=""
        masterDiagnoses={[]}
        masterStaff={{ surgeons: [], anaesthetists: [], assistants: [] }}
        userRole="admin"
      />
    );

    const cellInput = screen.getByPlaceholderText('Phone number');
    expect(cellInput).toBeRequired();
    expect(cellInput).toHaveAttribute('pattern', '\\+91 [0-9]{10}');
    expect(cellInput).toHaveAttribute('minLength', '14');
    expect(cellInput).toHaveAttribute('maxLength', '14');

    const altInput = screen.getByPlaceholderText('Alt number');
    expect(altInput).not.toBeRequired();
    expect(altInput).toHaveAttribute('pattern', '\\+91 [0-9]{10}');
    expect(altInput).toHaveAttribute('minLength', '14');
    expect(altInput).toHaveAttribute('maxLength', '14');

    const regInput = screen.getByPlaceholderText('Reg No');
    expect(regInput).toHaveAttribute('pattern', '[0-9]*');

    const billInput = screen.getByPlaceholderText('Bill No');
    expect(billInput).toHaveAttribute('pattern', '[0-9]*');
  });
});
