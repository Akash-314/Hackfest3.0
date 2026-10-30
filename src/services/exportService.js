import XLSX from 'xlsx-js-style';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Normalizes event information and returns explicit sorting rank:
 * 1: HACKATHON
 * 2: IDEATHON
 * 3: CODEATHON
 * 99: OTHER
 */
function getEventInfo(r) {
  const compSlug = String(r.competition?.slug || '').toLowerCase();
  const compName = String(r.competition?.name || r.competition_name || '').toLowerCase();
  const compId = String(r.competition?.id || r.competition_id || '').toLowerCase();

  if (
    compSlug.includes('hackathon') ||
    compName.includes('hackathon') ||
    compId === 'c16ff34f-a8ca-4997-bfe9-50757ef3a451'
  ) {
    return { name: 'HACKATHON', order: 1 };
  }
  if (
    compSlug.includes('ideathon') ||
    compName.includes('ideathon') ||
    compId === '5a6cea4a-84bc-486b-b34c-afda79232c64'
  ) {
    return { name: 'IDEATHON', order: 2 };
  }
  if (
    compSlug.includes('codeathon') ||
    compName.includes('codeathon') ||
    compId === 'da7de04e-eb6d-494a-8d3d-909ee88ec88a'
  ) {
    return { name: 'CODEATHON', order: 3 };
  }

  const raw = String(r.competition?.name || r.competition_name || 'OTHER').toUpperCase();
  return { name: raw, order: 99 };
}

/**
 * Resolves Problem Statement Title from existing registration data:
 * - Codeathon: Always blank
 * - Team events:
 *   1. Prefer existing specific Problem Track Theme
 *   2. If theme unavailable, use existing Problem Track Title
 *   3. If both unavailable, leave blank
 *   Never infer or fabricate titles.
 */
function getProblemStatementTitle(r, isCodeathon) {
  if (isCodeathon) return '';

  // 1. Prefer existing specific Problem Track Theme when available
  const theme = r.problem_category?.theme || r.team?.problem_category?.theme || r.theme || '';
  if (typeof theme === 'string' && theme.trim().length > 0) {
    return theme.trim();
  }

  // 2. Fallback to existing Problem Track Title
  const title =
    r.problem_category?.title ||
    r.team?.problem_category?.title ||
    r.problem_statement?.title ||
    r.problem_title ||
    r.title ||
    '';
  if (typeof title === 'string' && title.trim().length > 0) {
    return title.trim();
  }

  return '';
}

/**
 * Restructures registrations for Excel export:
 * - 12 exact columns:
 *   1. S.No.
 *   2. Event
 *   3. Team Name
 *   4. Problem Statement Title
 *   5. Team Leader Name
 *   6. Participant Name
 *   7. Contact No.
 *   8. Email
 *   9. Roll No.
 *   10. College Name
 *   11. Branch
 *   12. Year
 * - Explicit Event Sorting: HACKATHON -> IDEATHON -> CODEATHON
 * - Team Member Expansion: 1 row per team member with their own details
 * - Codeathon: Individual participant with Team Name="Individual", blank Leader & Problem
 * - Teams participating in multiple events included under each event
 * - Sequential S.No. starting from 1 to N
 */
function prepareExcelParticipantRows(registrations) {
  if (!registrations || registrations.length === 0) return [];

  // Group registrations into canonical event buckets
  const buckets = {
    HACKATHON: [],
    IDEATHON: [],
    CODEATHON: [],
    OTHER: [],
  };

  registrations.forEach((r) => {
    const { name: eventName } = getEventInfo(r);
    if (buckets[eventName]) {
      buckets[eventName].push(r);
    } else {
      buckets.OTHER.push(r);
    }
  });

  const orderedEventKeys = ['HACKATHON', 'IDEATHON', 'CODEATHON', 'OTHER'];
  const allRows = [];

  orderedEventKeys.forEach((eventName) => {
    const eventRegs = buckets[eventName] || [];
    const seenTeamsInEvent = new Set();

    eventRegs.forEach((r) => {
      const isCodeathon = eventName === 'CODEATHON';

      if (isCodeathon) {
        // Individual participant for Codeathon
        const partName = String(r.profile?.full_name || r.user_name || r.name || 'Participant').trim();
        const contactNo = String(r.profile?.phone || r.phone || '').trim();
        const email = String(r.profile?.email || r.user_email || r.email || '').trim();
        const rollNo = String(
          r.profile?.roll_no ||
          r.profile?.roll_number ||
          r.profile?.rollNo ||
          r.profile?.roll ||
          r.roll_no ||
          r.roll_number ||
          ''
        ).trim();
        const college = String(r.profile?.college || r.college || 'Rajkiya Engineering College Banda').trim();
        const branch = String(r.profile?.branch || r.branch || '').trim();
        const year = String(r.profile?.year || r.year || '').trim();

        allRows.push({
          'Event': 'CODEATHON',
          'Team Name': 'Individual',
          'Problem Statement Title': '',
          'Team Leader Name': '',
          'Participant Name': partName,
          'Contact No.': contactNo,
          'Email': email,
          'Roll No.': rollNo,
          'College Name': college,
          'Branch': branch,
          'Year': year,
        });
        return;
      }

      // Team event (Hackathon / Ideathon / Other)
      const teamId = r.team?.id || r.team_id;
      if (teamId) {
        if (seenTeamsInEvent.has(teamId)) {
          // Team already expanded in this event
          return;
        }
        seenTeamsInEvent.add(teamId);
      }

      const teamName = String(r.team?.name || r.team_name || 'Team').trim();
      const problemTitle = getProblemStatementTitle(r, false);

      // Determine team leader name
      let teamLeaderName = '';
      const members = Array.isArray(r.team?.members) ? r.team.members : [];
      const leaderMember = members.find(
        (m) => m.role === 'leader' || (r.team?.leader_id && (m.user_id === r.team.leader_id || m.id === r.team.leader_id))
      );

      if (leaderMember && (leaderMember.name || leaderMember.profile?.full_name)) {
        teamLeaderName = String(leaderMember.name || leaderMember.profile?.full_name).trim();
      } else if (r.team?.leader_name) {
        teamLeaderName = String(r.team.leader_name).trim();
      } else if (r.profile?.full_name) {
        teamLeaderName = String(r.profile.full_name).trim();
      }

      // Sort members so leader is listed first
      const sortedMembers = [...members].sort((a, b) => {
        const isLA = a.role === 'leader' || (r.team?.leader_id && (a.user_id === r.team.leader_id || a.id === r.team.leader_id));
        const isLB = b.role === 'leader' || (r.team?.leader_id && (b.user_id === r.team.leader_id || b.id === r.team.leader_id));
        if (isLA && !isLB) return -1;
        if (!isLA && isLB) return 1;
        return 0;
      });

      if (sortedMembers.length > 0) {
        sortedMembers.forEach((m) => {
          const partName = String(m.name || m.profile?.full_name || 'Member').trim();
          const contactNo = String(m.phone || m.profile?.phone || '').trim();
          const email = String(m.email || m.profile?.email || '').trim();
          const rollNo = String(
            m.roll_no ||
            m.roll_number ||
            m.rollNo ||
            m.roll ||
            m.profile?.roll_no ||
            m.profile?.roll_number ||
            m.profile?.rollNo ||
            m.profile?.roll ||
            ''
          ).trim();
          const college = String(m.college || m.profile?.college || r.team?.college || 'Rajkiya Engineering College Banda').trim();
          const branch = String(m.branch || m.profile?.branch || '').trim();
          const year = String(m.year || m.profile?.year || '').trim();

          allRows.push({
            'Event': eventName,
            'Team Name': teamName,
            'Problem Statement Title': problemTitle,
            'Team Leader Name': teamLeaderName,
            'Participant Name': partName,
            'Contact No.': contactNo,
            'Email': email,
            'Roll No.': rollNo,
            'College Name': college,
            'Branch': branch,
            'Year': year,
          });
        });
      } else {
        // Fallback for team without roster records: use master registration profile
        const partName = String(r.profile?.full_name || r.user_name || 'Member').trim();
        const contactNo = String(r.profile?.phone || r.phone || '').trim();
        const email = String(r.profile?.email || r.user_email || r.email || '').trim();
        const rollNo = String(
          r.profile?.roll_no ||
          r.profile?.roll_number ||
          r.profile?.rollNo ||
          r.profile?.roll ||
          r.roll_no ||
          r.roll_number ||
          ''
        ).trim();
        const college = String(r.profile?.college || r.team?.college || 'Rajkiya Engineering College Banda').trim();
        const branch = String(r.profile?.branch || r.branch || '').trim();
        const year = String(r.profile?.year || r.year || '').trim();

        allRows.push({
          'Event': eventName,
          'Team Name': teamName,
          'Problem Statement Title': problemTitle,
          'Team Leader Name': teamLeaderName || partName,
          'Participant Name': partName,
          'Contact No.': contactNo,
          'Email': email,
          'Roll No.': rollNo,
          'College Name': college,
          'Branch': branch,
          'Year': year,
        });
      }
    });
  });

  // Assign sequential S.No. (1 to N)
  return allRows.map((row, idx) => ({
    'S.No.': idx + 1,
    ...row,
  }));
}

/**
 * Format registration records into clean exportable rows for CSV/Print.
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

    const docUrl = r.document_url || r.team?.document_url || '';
    const docName = r.document_name || r.team?.document_name || (docUrl ? 'Presentation Deck' : 'N/A');
    const docType = r.document_type || r.team?.document_type || (docUrl ? 'PPTX/PDF' : 'N/A');

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
      'PPT Status': docUrl ? 'ATTACHED' : 'NOT UPLOADED',
      'PPT File Name': docName,
      'PPT File Type': docType,
      'PPT URL': docUrl,
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
   * Features:
   * - Exactly 12 columns in specified order
   * - Sorted strictly: HACKATHON -> IDEATHON -> CODEATHON
   * - Individual team member expansion with distinct contact details
   * - Emerald-green header, auto-filter, frozen header, auto-width, text wrapping
   */
  exportToExcel(registrations, filename = 'HackFest3_Registrations.xlsx') {
    if (!registrations || registrations.length === 0) {
      throw new Error('No registration records available to export.');
    }

    const participantRows = prepareExcelParticipantRows(registrations);
    if (participantRows.length === 0) {
      throw new Error('No valid participant records could be extracted for export.');
    }

    const columns = [
      'S.No.',
      'Event',
      'Team Name',
      'Problem Statement Title',
      'Team Leader Name',
      'Participant Name',
      'Contact No.',
      'Email',
      'Roll No.',
      'College Name',
      'Branch',
      'Year',
    ];

    // Build 2D Sheet array:
    // Row 1: Merged Title Banner
    // Row 2: Column Headers
    // Row 3+: Expanded Participant Data Rows
    const aoaData = [
      ['HACKFEST 3.0 | PARTICIPANT REGISTRATION LIST'],
      columns,
      ...participantRows.map((row) => columns.map((col) => row[col] ?? '')),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(aoaData);

    // Merge title banner across all 12 columns (A1:L1)
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
    ];

    // Title Banner Styling (A1)
    worksheet['A1'].s = {
      font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '064E3B' } }, // Dark emerald banner
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    // Header Styling (Row 2, cells A2 to L2)
    const headerStyle = {
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '0F5132' } }, // Clean dark green (HackFest emerald theme)
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '043A24' } },
        bottom: { style: 'medium', color: { rgb: '043A24' } },
        left: { style: 'thin', color: { rgb: '043A24' } },
        right: { style: 'thin', color: { rgb: '043A24' } },
      },
    };

    for (let c = 0; c < columns.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 1, c });
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = headerStyle;
      }
    }

    // Row heights: Title 32pt, Header 28pt, Data rows 24pt
    const rowHeights = [{ hpt: 32 }, { hpt: 28 }];
    for (let i = 0; i < participantRows.length; i++) {
      rowHeights.push({ hpt: 24 });
    }
    worksheet['!rows'] = rowHeights;

    // Generous Column Widths preventing text clipping
    worksheet['!cols'] = [
      { wch: 8 },   // 1. S.No.
      { wch: 16 },  // 2. Event
      { wch: 28 },  // 3. Team Name
      { wch: 42 },  // 4. Problem Statement Title (wrap enabled)
      { wch: 24 },  // 5. Team Leader Name
      { wch: 24 },  // 6. Participant Name
      { wch: 18 },  // 7. Contact No. (explicit text with leading zeros)
      { wch: 34 },  // 8. Email (no truncation)
      { wch: 18 },  // 9. Roll No.
      { wch: 38 },  // 10. College Name (wrap enabled)
      { wch: 26 },  // 11. Branch
      { wch: 14 },  // 12. Year
    ];

    // Data Row Styling & Explicit Text Types for Contact No. and Roll No.
    for (let r = 0; r < participantRows.length; r++) {
      const rowIndex = r + 2;
      const isEven = r % 2 === 0;
      const rowBg = isEven ? 'FFFFFF' : 'F0FDF4'; // Subtle emerald zebra striping

      for (let c = 0; c < columns.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
        const cell = worksheet[cellRef];
        if (!cell) continue;

        const colName = columns[c];

        // Format Contact No. and Roll No. as text so leading zeros are never lost
        if (colName === 'Contact No.' || colName === 'Roll No.') {
          cell.t = 's';
          cell.z = '@';
        }

        let hAlign = 'left';
        if (['S.No.', 'Event', 'Contact No.', 'Roll No.', 'Year'].includes(colName)) {
          hAlign = 'center';
        }

        const shouldWrap = colName === 'Problem Statement Title' || colName === 'College Name';

        cell.s = {
          font: {
            name: 'Calibri',
            sz: 10,
            bold: colName === 'Event' || colName === 'S.No.',
            color: { rgb: '0F172A' },
          },
          fill: { fgColor: { rgb: rowBg } },
          alignment: {
            horizontal: hAlign,
            vertical: 'center',
            wrapText: shouldWrap,
          },
          border: {
            top: { style: 'thin', color: { rgb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
            left: { style: 'thin', color: { rgb: 'E2E8F0' } },
            right: { style: 'thin', color: { rgb: 'E2E8F0' } },
          },
        };
      }
    }

    // Enable Excel autofilter on header row (Row 2: A2 to L{lastRowIndex})
    const lastRowIndex = participantRows.length + 2;
    worksheet['!autofilter'] = {
      ref: `A2:${XLSX.utils.encode_col(columns.length - 1)}${lastRowIndex}`,
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;

    // Download in browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        XLSX.writeFile(workbook, finalFilename);
      } catch (writeErr) {
        console.warn('XLSX.writeFile fallback to Blob:', writeErr);
        const finalBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([finalBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 30000);
      }
    }

    return true;
  },

  /**
   * Export registrations to CSV format matching the exact 12 columns
   * Compatible with any spreadsheet software, text editor, or Google Sheets
   */
  exportToCsv(registrations, filename = 'HackFest3_Registrations.csv') {
    if (!registrations || registrations.length === 0) {
      throw new Error('No registration records available to export.');
    }

    const participantRows = prepareExcelParticipantRows(registrations);
    if (participantRows.length === 0) {
      throw new Error('No valid participant records could be extracted for export.');
    }

    const columns = [
      'S.No.',
      'Event',
      'Team Name',
      'Problem Statement Title',
      'Team Leader Name',
      'Participant Name',
      'Contact No.',
      'Email',
      'Roll No.',
      'College Name',
      'Branch',
      'Year',
    ];

    const csvLines = [
      columns.join(','),
      ...participantRows.map((row) =>
        columns
          .map((col) => {
            let val = row[col] === undefined || row[col] === null ? '' : String(row[col]);
            // Escape double quotes
            val = val.replace(/"/g, '""');
            return `"${val}"`;
          })
          .join(',')
      ),
    ];

    const csvContent = csvLines.join('\r\n');

    // Prepend UTF-8 BOM (\uFEFF) so Excel, Sheets, and all CSV readers open unicode and numbers cleanly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 30000);
    }
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
