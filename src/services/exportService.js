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
 * Format timestamp safely into readable Indian Standard Time (IST)
 */
function formatDateTimeIST(dateInput) {
  if (!dateInput) return 'N/A';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Extract college / institution from profile or registration notes
 */
function extractInstitution(profile, notes) {
  if (profile?.college && profile.college.trim() && profile.college !== 'Rajkiya Engineering College Banda' && profile.college.trim() !== 'N/A') {
    return profile.college.trim();
  }
  if (notes && typeof notes === 'string') {
    const instMatch = notes.match(/Institution:\s*([^|;\n\r]+)/i) || notes.match(/College:\s*([^|;\n\r]+)/i);
    if (instMatch && instMatch[1] && instMatch[1].trim()) {
      return instMatch[1].trim();
    }
  }
  return profile?.college?.trim() || 'Rajkiya Engineering College Banda';
}

/**
 * Format team member roster into clean multi-line string containing all member details
 */
function formatTeamRoster(team, currentUserId) {
  if (!team || (!team.name && !team.id)) return 'N/A (Individual Participation)';
  const members = Array.isArray(team.members) ? team.members : [];
  if (members.length === 0) {
    if (team.name) return `${team.name} (Code: ${team.code || 'N/A'}) - Single member entry`;
    return 'N/A (Individual Participation)';
  }

  return members.map((m, idx) => {
    const name = m.name || m.profile?.full_name || m.full_name || 'Member';
    const isLeader = m.role === 'leader' || (team.leader_id && (m.user_id === team.leader_id || m.id === team.leader_id));
    const roleTag = isLeader ? 'Leader' : (m.role ? m.role.charAt(0).toUpperCase() + m.role.slice(1) : 'Member');
    const isCurrent = m.user_id && currentUserId && m.user_id === currentUserId ? ' [Primary Registrant]' : '';
    const email = (m.email || m.profile?.email) ? ` | ${m.email || m.profile?.email}` : '';
    const phone = (m.phone || m.profile?.phone) ? ` | Ph: ${m.phone || m.profile?.phone}` : '';
    const branch = (m.branch || m.profile?.branch) ? ` | Dept: ${m.branch || m.profile?.branch}` : '';
    const year = (m.year || m.profile?.year) ? ` | Year: ${m.year || m.profile?.year}` : '';
    const college = (m.college || m.profile?.college) ? ` | ${m.college || m.profile?.college}` : '';

    return `${idx + 1}. ${name} (${roleTag}${isCurrent})${email}${phone}${branch}${year}${college}`;
  }).join('\n');
}

/**
 * Prepare all registration rows with every submitted & database field
 */
export function prepareRegistrationRows(registrations) {
  return registrations.map((r, index) => {
    const regId = r.id || `REG-${index + 1}`;
    const participantName = r.profile?.full_name || r.user_name || r.full_name || 'Anonymous';
    const email = r.profile?.email || r.user_email || r.email || 'N/A';

    const isTeam = Boolean(r.team_id || (r.team && (r.team.name || r.team.id)));
    const teamName = r.team?.name || r.team_name || (isTeam ? 'Team' : 'N/A');
    const teamCode = r.team?.code || r.team_code || 'N/A';
    const teamId = r.team?.id || r.team_id || 'N/A';

    const isLeader = Boolean(r.team?.leader_id && r.user_id && r.team.leader_id === r.user_id) || (!r.user_id && isTeam);
    const participantTeamRole = isLeader ? 'Team Leader' : (isTeam ? 'Team Member' : 'Individual');

    // Find participant's member record in team roster if profile branch/year are missing
    const matchedMember = r.team?.members?.find((m) =>
      (m.user_id && r.user_id && m.user_id === r.user_id) ||
      (m.email && r.profile?.email && m.email.toLowerCase() === r.profile.email.toLowerCase())
    ) || (isLeader ? r.team?.members?.find((m) => m.role === 'leader') : null) || r.team?.members?.[0];

    const phone = r.profile?.phone || matchedMember?.phone || r.phone || r.user_phone || 'N/A';
    const college = extractInstitution(r.profile, r.notes) || matchedMember?.college || r.team?.college || 'Rajkiya Engineering College Banda';
    const branch = r.profile?.branch || matchedMember?.branch || r.branch || 'N/A';
    const year = r.profile?.year || matchedMember?.year || r.year || 'N/A';
    const userRole = r.profile?.role || 'participant';

    const competitionName = r.competition?.name || r.competition_name || 'General';
    const competitionSlug = r.competition?.slug || r.competition_id || 'N/A';
    const competitionFormat = r.competition?.format || 'N/A';
    const competitionDuration = r.competition?.duration || 'N/A';

    const problemCode = r.problem_category?.number || 'N/A';
    const problemTitle = r.problem_category?.title || r.problem_category_title || 'N/A';
    const problemTheme = r.problem_category?.theme || 'N/A';

    const leaderMember = r.team?.members?.find((m) => m.role === 'leader') || matchedMember;
    const leaderName = r.team?.leader?.full_name || leaderMember?.name || (isLeader ? participantName : 'N/A');
    const leaderEmail = r.team?.leader?.email || leaderMember?.email || (isLeader ? email : 'N/A');
    const leaderPhone = r.team?.leader?.phone || leaderMember?.phone || (isLeader ? phone : 'N/A');

    const membersList = Array.isArray(r.team?.members) ? r.team.members : [];
    const membersCount = membersList.length > 0 ? membersList.length : (isTeam ? 1 : 1);
    const teamRoster = formatTeamRoster(r.team, r.user_id);

    const status = (r.registration_status || 'confirmed').toUpperCase();
    const experience = r.experience_level || 'Intermediate';
    const regDate = formatDateTimeIST(r.created_at);
    const updatedDate = formatDateTimeIST(r.updated_at);
    const notes = r.notes || 'None';

    // Build row object with complete registration fields
    const row = {
      'S.No': index + 1,
      'Registration ID': regId,
      'Registration Status': status,
      'Registration Date': regDate,
      'Registration Timestamp (ISO)': r.created_at || 'N/A',
      'Participant Name': participantName,
      'Email Address': email,
      'Contact Phone': phone,
      'College / Institution': college,
      'Academic Department / Branch': branch,
      'Academic Year': year,
      'User Account Role': userRole,
      'Competition / Arena': competitionName,
      'Competition Slug': competitionSlug,
      'Competition Format': competitionFormat,
      'Competition Duration': competitionDuration,
      'Problem Track Code': problemCode,
      'Problem Track Title': problemTitle,
      'Problem Track Theme': problemTheme,
      'Participation Type': isTeam ? 'Team' : 'Individual',
      'Team Name': teamName,
      'Team Code': teamCode,
      'Team ID': teamId,
      "Participant's Team Role": participantTeamRole,
      'Team Leader Name': leaderName,
      'Team Leader Email': leaderEmail,
      'Team Leader Phone': leaderPhone,
      'Team Members Count': membersCount,
      'Team Members Roster': teamRoster,
      'Experience Level': experience,
      'Operational Notes / Form Responses': notes,
      'Last Updated': updatedDate,
    };

    // Add dedicated columns for individual team members (up to 4 members)
    for (let mIdx = 0; mIdx < 4; mIdx++) {
      const mNum = mIdx + 1;
      const mem = membersList[mIdx];
      row[`Member ${mNum} Name`] = mem ? (mem.name || mem.profile?.full_name || 'N/A') : 'N/A';
      row[`Member ${mNum} Role`] = mem ? (mem.role === 'leader' ? 'Leader' : (mem.role ? mem.role.charAt(0).toUpperCase() + mem.role.slice(1) : 'Member')) : 'N/A';
      row[`Member ${mNum} Email`] = mem ? (mem.email || mem.profile?.email || 'N/A') : 'N/A';
      row[`Member ${mNum} Phone`] = mem ? (mem.phone || mem.profile?.phone || 'N/A') : 'N/A';
      row[`Member ${mNum} Branch`] = mem ? (mem.branch || mem.profile?.branch || 'N/A') : 'N/A';
      row[`Member ${mNum} Year`] = mem ? (mem.year || mem.profile?.year || 'N/A') : 'N/A';
    }

    return row;
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
   * Generate comprehensive, professional printable PDF report
   */
  exportToPdf(registrations, filename = 'HackFest3_Registrations_Report.pdf', filterOptions = 'All Registrations') {
    if (!registrations || registrations.length === 0) {
      throw new Error('No registration records available to export.');
    }

    const dataRows = prepareRegistrationRows(registrations);

    // Format human-readable filter title whether passed as string or object
    const filterTitle =
      typeof filterOptions === 'object' && filterOptions !== null
        ? `Arena: ${filterOptions.arena || 'ALL'} • Status: ${filterOptions.status || 'ALL'}`
        : String(filterOptions || 'All Registrations');

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const nowStr = formatDateTimeIST(new Date());

    // 1. Header Branding Banner
    doc.setFillColor(17, 24, 39); // Deep dark slate
    doc.rect(0, 0, pageWidth, 62, 'F');

    // Accent line (warm gold)
    doc.setFillColor(245, 182, 66);
    doc.rect(0, 60, pageWidth, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(245, 182, 66);
    doc.text('HACKFEST 3.0 // OFFICIAL MASTER REGISTRATION REGISTER', 40, 28);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(190, 205, 220);
    doc.text('Student Developer Club (SDC) • Rajkiya Engineering College Banda', 40, 46);

    doc.setFontSize(8.5);
    doc.setTextColor(220, 230, 240);
    doc.text(`Generated: ${nowStr}`, pageWidth - 40, 28, { align: 'right' });
    doc.text(`Scope: ${filterTitle} (${registrations.length} Records)`, pageWidth - 40, 46, { align: 'right' });

    // 2. Comprehensive AutoTable
    const tableColumns = [
      { header: '# / REG ID', dataKey: 'col_id' },
      { header: 'PARTICIPANT & ACADEMICS', dataKey: 'col_participant' },
      { header: 'COMPETITION & TRACK', dataKey: 'col_competition' },
      { header: 'TEAM DETAILS & ROSTER', dataKey: 'col_team' },
      { header: 'STATUS, EXP & NOTES', dataKey: 'col_meta' },
    ];

    const pdfRows = dataRows.map((r, i) => {
      const isTeam = r['Participation Type'] === 'Team';
      const teamBlock = isTeam
        ? `Type: Team\nTeam: ${r['Team Name']} [${r['Team Code']}]\nRole: ${r["Participant's Team Role"]}\nLeader: ${r['Team Leader Name']} (${r['Team Leader Email']})\n\nRoster (${r['Team Members Count']}):\n${r['Team Members Roster']}`
        : `Type: Individual\nRole: Solo Contestant`;

      return {
        col_id: `#${i + 1}\n\nID:\n${r['Registration ID']}\n\nSTATUS: ${r['Registration Status']}\n\nDATE:\n${r['Registration Date']}`,
        col_participant: `Name: ${r['Participant Name']}\nEmail: ${r['Email Address']}\nPhone: ${r['Contact Phone']}\nCollege: ${r['College / Institution']}\nDept: ${r['Academic Department / Branch']}\nYear: ${r['Academic Year']}\nRole: ${r['User Account Role']}`,
        col_competition: `Arena: ${r['Competition / Arena']}\nFormat: ${r['Competition Format']}\nDuration: ${r['Competition Duration']}\n\nTrack: ${r['Problem Track Code']}\nTitle: ${r['Problem Track Title']}\nTheme: ${r['Problem Track Theme']}`,
        col_team: teamBlock,
        col_meta: `Level: ${r['Experience Level']}\nUpdated: ${r['Last Updated']}\n\nNotes / Form Responses:\n${r['Operational Notes / Form Responses']}`,
      };
    });

    autoTable(doc, {
      startY: 75,
      columns: tableColumns,
      body: pdfRows,
      theme: 'grid',
      tableWidth: 750,
      margin: { left: 45, right: 45, bottom: 40 },
      showHead: 'everyPage',
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 5,
        overflow: 'linebreak',
        valign: 'top',
        textColor: [30, 35, 45],
        lineColor: [200, 205, 215],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [17, 24, 39],
        textColor: [245, 182, 66],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 253],
      },
      columnStyles: {
        col_id: { cellWidth: 75 },
        col_participant: { cellWidth: 165 },
        col_competition: { cellWidth: 145 },
        col_team: { cellWidth: 200 },
        col_meta: { cellWidth: 165 },
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(120, 130, 140);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount} — Confidential • Student Developer Club (SDC), REC Banda`,
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
   * Open clean browser printable directory view
   */
  printRegistrations(registrations, filterTitle = 'All Registrations') {
    if (!registrations || registrations.length === 0) {
      throw new Error('No registration records available to print.');
    }

    const dataRows = prepareRegistrationRows(registrations);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Pop-up was blocked. Please allow pop-ups to print registration records.');
    }

    const nowStr = formatDateTimeIST(new Date());
    const rowsHtml = dataRows
      .map(
        (r) => `
      <tr>
        <td style="text-align: center; font-weight: bold;">${r['S.No']}</td>
        <td>
          <strong>${r['Participant Name']}</strong><br/>
          <span style="color: #475569; font-size: 10px;">${r['Email Address']} | ${r['Contact Phone']}</span><br/>
          <span style="color: #64748b; font-size: 10px;">${r['College / Institution']} (${r['Academic Department / Branch']} • ${r['Academic Year']})</span>
        </td>
        <td>
          <strong>${r['Competition / Arena']}</strong><br/>
          <span style="font-size: 10px; color: #475569;">Track: ${r['Problem Track Title']}</span>
        </td>
        <td>
          <strong>${r['Participation Type']}: ${r['Team Name']}</strong> ${r['Team Code'] !== 'N/A' ? `[${r['Team Code']}]` : ''}<br/>
          <span style="font-size: 10px; color: #475569;">Role: ${r["Participant's Team Role"]} | Leader: ${r['Team Leader Name']}</span>
          ${r['Team Members Roster'] !== 'N/A (Individual Participation)' ? `<div style="font-size: 9px; color: #334155; margin-top: 4px; white-space: pre-line; line-height: 1.4;">${r['Team Members Roster']}</div>` : ''}
        </td>
        <td style="text-align: center;">
          <span class="status status-${r['Registration Status'].toLowerCase()}">${r['Registration Status']}</span>
        </td>
        <td>
          <span style="font-size: 10px; color: #334155;">${r['Registration Date']}</span><br/>
          <span style="font-size: 9px; color: #64748b;">${r['Operational Notes / Form Responses']}</span>
        </td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HackFest 3.0 — Registrations Master Register</title>
        <style>
          @page { size: landscape; margin: 12mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 16px;
          }
          .header {
            border-bottom: 2px solid #b98545;
            padding-bottom: 10px;
            margin-bottom: 14px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          h1 { margin: 0; font-size: 18px; color: #0f172a; letter-spacing: 0.04em; }
          .sub { color: #64748b; font-size: 11px; margin-top: 2px; }
          .meta { font-size: 11px; color: #475569; text-align: right; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th {
            background: #0f172a;
            color: #f5b642;
            padding: 7px 6px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #cbd5e1;
            font-size: 10px;
          }
          td { padding: 6px; border: 1px solid #e2e8f0; vertical-align: top; }
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
            margin-top: 16px;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>HACKFEST 3.0 // REGISTRATIONS DIRECTORY</h1>
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
              <th style="width: 25px; text-align: center;">#</th>
              <th>PARTICIPANT & ACADEMICS</th>
              <th>COMPETITION & TRACK</th>
              <th>TEAM & ROSTER</th>
              <th style="width: 80px; text-align: center;">STATUS</th>
              <th>DATE & FORM NOTES</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          HackFest 3.0 Administrative Archive • Confidential Document • Rajkiya Engineering College Banda
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

  /**
   * Print single registration entry pass / participant dossier
   */
  printSingleRegistration(registration) {
    if (!registration) {
      throw new Error('No registration record provided to print.');
    }

    const rows = prepareRegistrationRows([registration]);
    const r = rows[0];

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Pop-up was blocked. Please allow pop-ups to print entry pass.');
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HackFest 3.0 — Entry Pass: ${r['Participant Name']}</title>
        <style>
          @page { size: portrait; margin: 15mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #0f172a;
            background: #f8fafc;
            margin: 0;
            padding: 24px;
          }
          .pass-card {
            max-width: 680px;
            margin: 0 auto;
            background: #ffffff;
            border: 2px solid #0f172a;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .pass-header {
            background: #0f172a;
            color: #ffffff;
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #f5b642;
          }
          .pass-title { font-size: 20px; font-weight: 800; letter-spacing: 0.05em; color: #f5b642; margin: 0; }
          .pass-sub { font-size: 11px; color: #94a3b8; margin-top: 3px; }
          .badge-status {
            background: #15803d;
            color: #ffffff;
            font-size: 10px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 4px;
            letter-spacing: 0.05em;
          }
          .pass-body { padding: 24px; }
          .section-title {
            font-size: 11px;
            font-weight: 700;
            color: #b45309;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
          }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
          .info-block { background: #f8fafc; padding: 10px 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
          .info-label { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .info-val { font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px; }
          .full-width { grid-column: span 2; }
          .roster-block { background: #f1f5f9; padding: 10px 12px; border-radius: 6px; font-size: 11px; line-height: 1.6; white-space: pre-line; }
          .pass-footer {
            background: #f8fafc;
            border-top: 1px dashed #cbd5e1;
            padding: 14px 24px;
            font-size: 10px;
            color: #64748b;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="pass-card">
          <div class="pass-header">
            <div>
              <div class="pass-title">HACKFEST 3.0 // ENTRY PASS</div>
              <div class="pass-sub">Student Developer Club • Rajkiya Engineering College Banda</div>
            </div>
            <span class="badge-status">${r['Registration Status']}</span>
          </div>

          <div class="pass-body">
            <div class="section-title">PARTICIPANT PROFILE</div>
            <div class="grid-2">
              <div class="info-block">
                <div class="info-label">Full Name</div>
                <div class="info-val">${r['Participant Name']}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Registration ID</div>
                <div class="info-val" style="font-family: monospace; font-size: 11px;">${r['Registration ID']}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Email Address</div>
                <div class="info-val">${r['Email Address']}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Contact Phone</div>
                <div class="info-val">${r['Contact Phone']}</div>
              </div>
              <div class="info-block full-width">
                <div class="info-label">College / Institution</div>
                <div class="info-val">${r['College / Institution']} (${r['Academic Department / Branch']} • ${r['Academic Year']})</div>
              </div>
            </div>

            <div class="section-title">COMPETITION ALLOCATION</div>
            <div class="grid-2">
              <div class="info-block">
                <div class="info-label">Competition Arena</div>
                <div class="info-val">${r['Competition / Arena']}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Format / Duration</div>
                <div class="info-val">${r['Competition Format']} (${r['Competition Duration']})</div>
              </div>
              <div class="info-block full-width">
                <div class="info-label">Problem Category / Track</div>
                <div class="info-val">${r['Problem Track Code']}: ${r['Problem Track Title']}</div>
              </div>
            </div>

            <div class="section-title">TEAM INFORMATION</div>
            <div class="grid-2">
              <div class="info-block">
                <div class="info-label">Team Name & Code</div>
                <div class="info-val">${r['Team Name']} ${r['Team Code'] !== 'N/A' ? `[${r['Team Code']}]` : ''}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Participant Role</div>
                <div class="info-val">${r["Participant's Team Role"]}</div>
              </div>
              <div class="info-block full-width">
                <div class="info-label">Team Members Roster</div>
                <div class="roster-block">${r['Team Members Roster']}</div>
              </div>
            </div>

            <div class="section-title">REGISTRATION METADATA</div>
            <div class="grid-2">
              <div class="info-block">
                <div class="info-label">Experience Level</div>
                <div class="info-val">${r['Experience Level']}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Registered Timestamp</div>
                <div class="info-val">${r['Registration Date']}</div>
              </div>
              <div class="info-block full-width">
                <div class="info-label">Operational Notes / Form Responses</div>
                <div class="info-val" style="font-weight: normal; font-size: 11px;">${r['Operational Notes / Form Responses']}</div>
              </div>
            </div>
          </div>

          <div class="pass-footer">
            Official HackFest 3.0 Administrative Entry Pass • Bring valid college photo ID along with this pass to campus.
          </div>
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

export default exportService;
