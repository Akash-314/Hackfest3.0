import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format registration records into clean exportable rows.
 */
function prepareRegistrationRows(registrations) {
  return registrations.map((r, index) => {
    const participantName = r.profile?.full_name || r.user_name || 'Anonymous';
    const email = r.profile?.email || r.user_email || 'N/A';
    const phone = r.profile?.phone || 'N/A';
    const college = r.profile?.college || 'Rajkiya Engineering College Banda';
    const competition = r.competition?.name || r.competition_name || 'General';
    const teamName = r.team?.name || r.team_name || (r.team_id ? 'Team' : 'Individual');
    const teamCode = r.team?.code || 'N/A';
    const status = (r.registration_status || 'confirmed').toUpperCase();
    const experience = r.experience_level || 'Intermediate';
    const regDate = r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : 'N/A';
    const regId = r.id || `REG-${index + 1}`;

    return {
      'S.No': index + 1,
      'Registration ID': regId,
      'Participant Name': participantName,
      'Email': email,
      'Phone': phone,
      'College / Institution': college,
      'Competition': competition,
      'Team Name': teamName,
      'Team Code': teamCode,
      'Experience Level': experience,
      'Status': status,
      'Registration Date': regDate,
      'Notes': r.notes || '',
    };
  });
}

export const exportService = {
  /**
   * Export registrations to Microsoft Excel (.xlsx) file
   */
  exportToExcel(registrations, filename = 'HackFest3_Registrations.xlsx') {
    if (!registrations || registrations.length === 0) {
      throw new Error('No registration records available to export.');
    }

    const dataRows = prepareRegistrationRows(registrations);
    const worksheet = XLSX.utils.json_to_sheet(dataRows);

    // Set column widths automatically
    const colWidths = [
      { wch: 6 },   // S.No
      { wch: 38 },  // Registration ID
      { wch: 24 },  // Name
      { wch: 28 },  // Email
      { wch: 15 },  // Phone
      { wch: 32 },  // College
      { wch: 20 },  // Arena
      { wch: 22 },  // Team
      { wch: 14 },  // Team Code
      { wch: 18 },  // Experience
      { wch: 14 },  // Status
      { wch: 22 },  // Date
      { wch: 25 },  // Notes
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
    return true;
  },

  /**
   * Export registrations to CSV format with UTF-8 BOM
   */
  exportToCsv(registrations, filename = 'HackFest3_Registrations.csv') {
    if (!registrations || registrations.length === 0) {
      throw new Error('No registration records available to export.');
    }

    const dataRows = prepareRegistrationRows(registrations);
    const headers = Object.keys(dataRows[0]);

    const csvContent = [
      headers.join(','),
      ...dataRows.map(row =>
        headers.map(field => {
          const val = row[field] === undefined || row[field] === null ? '' : String(row[field]);
          // Escape quotes and commas
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\r\n');

    // Prepend UTF-8 BOM so Excel opens Hindi/Special chars cleanly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  },

  /**
   * Generate clean, professional printable PDF report
   */
  exportToPdf(registrations, filename = 'HackFest3_Registrations_Report.pdf', filterTitle = 'All Registrations') {
    if (!registrations || registrations.length === 0) {
      throw new Error('No registration records available to export.');
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const nowStr = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Header Branding
    doc.setFillColor(13, 17, 26); // Dark navy
    doc.rect(0, 0, pageWidth, 60, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(245, 182, 66); // Warm amber
    doc.text('HACKFEST 3.0 // OFFICIAL REGISTRATION REPORT', 40, 32);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 200, 220);
    doc.text('Student Developer Club (SDC) • Rajkiya Engineering College Banda', 40, 48);

    doc.setFontSize(9);
    doc.setTextColor(220, 220, 220);
    doc.text(`Generated: ${nowStr}`, pageWidth - 40, 32, { align: 'right' });
    doc.text(`Filter Scope: ${filterTitle} (${registrations.length} records)`, pageWidth - 40, 48, { align: 'right' });

    // Table Data
    const tableColumns = [
      { header: '#', dataKey: 'sno' },
      { header: 'Participant', dataKey: 'name' },
      { header: 'Email', dataKey: 'email' },
      { header: 'College', dataKey: 'college' },
      { header: 'Competition', dataKey: 'competition' },
      { header: 'Team', dataKey: 'team' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Date', dataKey: 'date' },
    ];

    const tableRows = registrations.map((r, i) => ({
      sno: i + 1,
      name: r.profile?.full_name || 'Anonymous',
      email: r.profile?.email || 'N/A',
      college: r.profile?.college || 'REC Banda',
      competition: r.competition?.name || 'General',
      team: r.team?.name || (r.team_id ? 'Team Member' : 'Individual'),
      status: (r.registration_status || 'confirmed').toUpperCase(),
      date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : 'N/A',
    }));

    autoTable(doc, {
      startY: 75,
      columns: tableColumns,
      body: tableRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: 5,
        overflow: 'linebreak',
        textColor: [30, 35, 45],
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [245, 182, 66],
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 248, 252],
      },
      columnStyles: {
        sno: { cellWidth: 25, halign: 'center' },
        name: { cellWidth: 110 },
        email: { cellWidth: 140 },
        college: { cellWidth: 150 },
        competition: { cellWidth: 85 },
        team: { cellWidth: 90 },
        status: { cellWidth: 65, halign: 'center' },
        date: { cellWidth: 65, halign: 'center' },
      },
      margin: { left: 35, right: 35, bottom: 40 },
      didDrawPage: (data) => {
        // Page footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(120, 130, 140);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount} — Confidential • Authorized SDC Administrative Personnel Only`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 15,
          { align: 'center' }
        );
      },
    });

    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  },

  /**
   * Open clean browser printable view
   */
  printRegistrations(registrations, filterTitle = 'All Registrations') {
    if (!registrations || registrations.length === 0) {
      throw new Error('No registration records available to print.');
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Pop-up was blocked. Please allow pop-ups to print registration records.');
    }

    const nowStr = new Date().toLocaleString('en-IN');
    const rowsHtml = registrations.map((r, i) => `
      <tr>
        <td style="text-align: center;">${i + 1}</td>
        <td><strong>${r.profile?.full_name || 'Anonymous'}</strong></td>
        <td>${r.profile?.email || 'N/A'}</td>
        <td>${r.profile?.phone || 'N/A'}</td>
        <td>${r.profile?.college || 'REC Banda'}</td>
        <td>${r.competition?.name || 'General'}</td>
        <td>${r.team?.name || (r.team_id ? 'Team' : 'Individual')}</td>
        <td style="text-align: center;"><span class="status status-${r.registration_status || 'confirmed'}">${(r.registration_status || 'confirmed').toUpperCase()}</span></td>
        <td style="text-align: center;">${r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : 'N/A'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HackFest 3.0 — Registrations Report (${filterTitle})</title>
        <style>
          @page { size: landscape; margin: 15mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #1a202c;
            background: #ffffff;
            margin: 0;
            padding: 20px;
          }
          .header {
            border-bottom: 2px solid #b98545;
            padding-bottom: 12px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          h1 { margin: 0; font-size: 20px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; }
          .sub { color: #64748b; font-size: 11px; margin-top: 3px; }
          .meta { font-size: 11px; color: #475569; text-align: right; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th {
            background: #0f172a;
            color: #f5b642;
            padding: 8px 6px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #cbd5e1;
          }
          td { padding: 6px; border: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .status {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            font-family: monospace;
          }
          .status-confirmed { background: #dcfce7; color: #15803d; }
          .status-pending { background: #fef3c7; color: #b45309; }
          .status-rejected { background: #fee2e2; color: #b91c1c; }
          .footer {
            margin-top: 20px;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>HACKFEST 3.0 // REGISTRATION REPORT</h1>
            <div class="sub">Student Developer Club (SDC) • Rajkiya Engineering College Banda</div>
          </div>
          <div class="meta">
            <div>Scope: <strong>${filterTitle}</strong> (${registrations.length} entries)</div>
            <div>Generated: ${nowStr}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">#</th>
              <th>PARTICIPANT</th>
              <th>EMAIL</th>
              <th>PHONE</th>
              <th>COLLEGE / INSTITUTION</th>
              <th>COMPETITION</th>
              <th>TEAM</th>
              <th style="text-align: center;">STATUS</th>
              <th style="text-align: center;">DATE</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          HackFest 3.0 Administrative Archive • Confidential Document • Rec Banda
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    return true;
  },
};
