import * as XLSX from 'xlsx';

// Test xlsx generation with dummy registration data
const testData = [
  {
    'S.No': 1,
    'Registration ID': 'REG-TEST-001',
    'Participant Name': 'Test Operative',
    'Email': 'operative@recbanda.ac.in',
    'Phone': '+91 9876543210',
    'College / Institution': 'Rajkiya Engineering College Banda',
    'Competition Arena': 'Marvelous Hacks (48H Flagship)',
    'Team Name': 'Stark Innovators',
    'Team Code': 'STK-001',
    'Status': 'CONFIRMED',
    'Registration Date': '2026-10-09 20:00:00',
    'Notes': 'Verified by admin',
  }
];

const worksheet = XLSX.utils.json_to_sheet(testData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

console.log('Excel XLSX Buffer generated successfully! Byte length:', buffer.length);

const csvContent = XLSX.utils.sheet_to_csv(worksheet);
console.log('CSV Content generated successfully! Length:', csvContent.length);
