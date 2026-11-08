// Google Sheets Database Driver for Driftwood Camp
import { Camper, ActivityLog, CamperAgreement } from '../types.ts';

const SPREADSHEET_NAME = 'Driftwood Camp Database';

export interface GoogleSheetsDbConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Locate or create the primary 'Driftwood Camp Database' Google Spreadsheet
 */
export async function getOrCreateCampSpreadsheet(accessToken: string): Promise<GoogleSheetsDbConfig> {
  // 1. Search for existing spreadsheet in Google Drive
  const q = encodeURIComponent(`name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return {
        spreadsheetId: data.files[0].id,
        spreadsheetUrl: data.files[0].webViewLink || `https://docs.google.com/spreadsheets/d/${data.files[0].id}`,
      };
    }
  }

  // 2. Create new spreadsheet with required sheets/headers
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_NAME,
      },
      sheets: [
        {
          properties: { title: 'Campers' },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    'ID', 'Child Name', 'Age', 'Parent Name', 'Parent Phone',
                    'Parent Email', 'Emergency Contact', 'Medical Notes', 'Transport',
                    'Pickup Area', 'Program', 'Session Choice', 'Director Status',
                    'Payment Status', 'Amount Received', 'Payment Reference',
                    'Director Notes', 'Signed At', 'Created At'
                  ].map((v) => ({ userEnteredValue: { stringValue: v } })),
                },
              ],
            },
          ],
        },
        {
          properties: { title: 'ActivityLogs' },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    'ID', 'Camper ID', 'Camper Name', 'Activity Date',
                    'Activity', 'Attendance', 'Note', 'Created By', 'Created At'
                  ].map((v) => ({ userEnteredValue: { stringValue: v } })),
                },
              ],
            },
          ],
        },
        {
          properties: { title: 'Agreements' },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    'ID', 'Camper ID', 'Type', 'Title', 'Signed By', 'Signature Image', 'Signed At'
                  ].map((v) => ({ userEnteredValue: { stringValue: v } })),
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${createRes.status} ${errText}`);
  }

  const newSheetData = await createRes.json();
  return {
    spreadsheetId: newSheetData.spreadsheetId,
    spreadsheetUrl: newSheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${newSheetData.spreadsheetId}`,
  };
}

/**
 * Read all Campers from Google Sheets
 */
export async function getCampersFromSheets(accessToken: string, spreadsheetId: string): Promise<Camper[]> {
  const range = encodeURIComponent('Campers!A2:S');
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    console.error('Failed to fetch campers from Sheets:', res.statusText);
    return [];
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  return rows.map((row) => ({
    id: row[0] || '',
    parentId: row[5] || 'parent-1',
    childName: row[1] || '',
    age: Number(row[2]) || 8,
    parentName: row[3] || '',
    parentPhone: row[4] || '',
    parentEmail: row[5] || '',
    emergencyContact: row[6] || '',
    paymentMethod: (row[7] as any) || 'Dashen Bank',
    transport: (row[8] as any) || 'No — own drop-off and pickup',
    pickupArea: row[9] || '',
    program: (row[10] as any) || 'Weekend camp',
    sessionChoice: row[11] || 'Saturday only',
    directorStatus: (row[12] as any) || 'Pending review',
    paymentStatus: (row[13] as any) || 'Not recorded',
    amountReceived: row[14] || '',
    paymentReference: row[15] || '',
    directorNotes: row[16] || '',
    notes: row[17] || '',
    createdAt: row[18] || new Date().toISOString(),
  }));
}

/**
 * Append a new Camper row to Google Sheets
 */
export async function addCamperToSheets(
  accessToken: string,
  spreadsheetId: string,
  camper: Camper
): Promise<void> {
  const range = encodeURIComponent('Campers!A:S');
  const values = [
    [
      camper.id,
      camper.childName,
      camper.age,
      camper.parentName,
      camper.parentPhone,
      camper.parentEmail,
      camper.emergencyContact,
      camper.paymentMethod || 'Dashen Bank',
      camper.transport,
      camper.pickupArea || '',
      camper.program,
      camper.sessionChoice,
      camper.directorStatus,
      camper.paymentStatus,
      camper.amountReceived || '',
      camper.paymentReference || '',
      camper.directorNotes || '',
      camper.notes || '',
      camper.createdAt,
    ],
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to append camper to Google Sheets: ${res.status} ${errText}`);
  }
}

/**
 * Update an existing Camper row in Google Sheets
 */
export async function updateCamperInSheets(
  accessToken: string,
  spreadsheetId: string,
  camperId: string,
  updates: Partial<Camper>
): Promise<void> {
  // First fetch current rows to locate row index
  const campers = await getCampersFromSheets(accessToken, spreadsheetId);
  const index = campers.findIndex((c) => c.id === camperId);
  if (index === -1) return;

  const rowNum = index + 2; // Row 1 is header
  const updatedCamper = { ...campers[index], ...updates };

  const range = encodeURIComponent(`Campers!A${rowNum}:S${rowNum}`);
  const values = [
    [
      updatedCamper.id,
      updatedCamper.childName,
      updatedCamper.age,
      updatedCamper.parentName,
      updatedCamper.parentPhone,
      updatedCamper.parentEmail,
      updatedCamper.emergencyContact,
      updatedCamper.paymentMethod || 'Dashen Bank',
      updatedCamper.transport,
      updatedCamper.pickupArea || '',
      updatedCamper.program,
      updatedCamper.sessionChoice,
      updatedCamper.directorStatus,
      updatedCamper.paymentStatus,
      updatedCamper.amountReceived || '',
      updatedCamper.paymentReference || '',
      updatedCamper.directorNotes || '',
      updatedCamper.notes || '',
      updatedCamper.createdAt,
    ],
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update camper in Google Sheets: ${res.status} ${errText}`);
  }
}

/**
 * Read Activity Logs from Google Sheets
 */
export async function getActivityLogsFromSheets(accessToken: string, spreadsheetId: string): Promise<ActivityLog[]> {
  const range = encodeURIComponent('ActivityLogs!A2:I');
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const rows: string[][] = data.values || [];

  return rows.map((row) => ({
    id: row[0] || '',
    camperId: row[1] || '',
    camperName: row[2] || '',
    activityDate: row[3] || '',
    activity: row[4] || '',
    attendance: (row[5] as any) || 'Attended',
    note: row[6] || '',
    createdBy: row[7] || 'Director Haile',
    createdAt: row[8] || new Date().toISOString(),
  }));
}

/**
 * Append Activity Log row to Google Sheets
 */
export async function addActivityLogToSheets(
  accessToken: string,
  spreadsheetId: string,
  log: ActivityLog
): Promise<void> {
  const range = encodeURIComponent('ActivityLogs!A:I');
  const values = [
    [
      log.id,
      log.camperId,
      log.camperName,
      log.activityDate,
      log.activity,
      log.attendance,
      log.note,
      log.createdBy,
      log.createdAt,
    ],
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to append log to Google Sheets: ${res.status} ${errText}`);
  }
}
