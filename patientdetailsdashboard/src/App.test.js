import { render, screen } from '@testing-library/react';
import App from './App';
import PatientModal from './components/PatientModal';
import PatientTable from './components/PatientTable';

test('renders Supabase setup message when env vars are missing', () => {
  render(<App />);
  expect(screen.getByText(/supabase is not configured/i)).toBeInTheDocument();
});

test('hides professional charges for staff users', () => {
  const baseProps = {
    editingPatientId: null,
    setShowPatientModal: jest.fn(),
    patientForm: {
      patient_image: '',
      first_name: 'John',
      last_name: 'Doe',
      age: '30',
      gender: 'Male',
      cell_no: '+91 9876543210',
      husband_name: '',
      alternative_number: '',
      address: '',
      date_of_admission: '',
      diagnosis: '',
      surgeon_name: '',
      anaesthetist_name: '',
      assistant_name: '',
      package_amount: '1000',
      advance_payment: '200',
      balance: '150',
      discount: '50',
      cash_method: 'Cash',
      surgeon_charge: '300',
      anaesthetist_charge: '200',
      assistant_charge: '100',
      bp: '',
      pr: '',
      rr: '',
      spo2: '',
      temperature: '',
      heart: '',
      lungs: '',
    },
    handlePatientChange: jest.fn(),
    handleImageChange: jest.fn(),
    handlePatientSubmit: jest.fn(),
    patientsLoading: false,
    patientMessage: '',
    masterDiagnoses: [],
    masterStaff: {
      surgeons: [],
      anaesthetists: [],
      assistants: [],
    },
    userRole: 'staff',
  };

  render(<PatientModal {...baseProps} />);

  expect(screen.queryByText(/professional charges/i)).not.toBeInTheDocument();

  render(<PatientModal {...baseProps} userRole="admin" />);
  expect(screen.getByText(/professional charges/i)).toBeInTheDocument();
});

test('shows charge column and total in admin patient table', () => {
  render(
    <PatientTable
      patientsLoading={false}
      filteredPatients={[
        {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          age: 30,
          gender: 'Male',
          husband_name: 'Jane',
          phone: '+91 9876543210',
          date_of_admission: '2026-08-31',
          diagnosis: 'Appendix',
          surgeon_name: 'Dr. X',
          anaesthetist_name: 'Dr. Y',
          assistant_name: 'Helper',
          remaining_amount: 500,
          total_amount: 1500,
          cash_method: 'Cash',
          payment_status: 'Due',
          surgeon_charge: 300,
          anaesthetist_charge: 200,
          assistant_charge: 100,
        }
      ]}
      userRole="admin"
      handlePrintClick={jest.fn()}
      handleEditPatient={jest.fn()}
      handleDeletePatient={jest.fn()}
      selectedPatientIds={[]}
      handlePatientSelectionToggle={jest.fn()}
      handleSelectAllPatients={jest.fn()}
    />
  );

  expect(screen.getByText(/charge/i)).toBeInTheDocument();
  expect(screen.getByText('₹600')).toBeInTheDocument();
});
