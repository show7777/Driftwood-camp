// Google Drive API helper for Driftwood Camp integration

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  createdTime?: string;
  size?: string;
}

const FOLDER_NAME = 'Driftwood Camp Documents';

/**
 * Get or create the dedicated 'Driftwood Camp Documents' folder on Google Drive
 */
export async function getOrCreateCampFolder(accessToken: string): Promise<string> {
  try {
    // Search for existing folder
    const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Drive search failed: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    // Create folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create camp folder: ${createRes.statusText}`);
    }

    const folder = await createRes.json();
    return folder.id;
  } catch (err) {
    console.error('getOrCreateCampFolder error:', err);
    throw err;
  }
}

/**
 * List files in the 'Driftwood Camp Documents' folder or root Drive
 */
export async function listCampDriveFiles(accessToken: string, folderId?: string): Promise<DriveFile[]> {
  try {
    let queryStr = 'trashed=false';
    if (folderId) {
      queryStr += ` and '${folderId}' in parents`;
    }

    const q = encodeURIComponent(queryStr);
    const fields = encodeURIComponent('files(id,name,mimeType,webViewLink,iconLink,createdTime,size)');

    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=createdTime%20desc`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to list files: ${res.status} ${errText}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('listCampDriveFiles error:', err);
    throw err;
  }
}

/**
 * Upload a text, CSV, or Blob file directly to Google Drive folder
 */
export async function uploadFileToCampDrive(
  accessToken: string,
  fileName: string,
  mimeType: string,
  content: string | Blob,
  folderId?: string
): Promise<DriveFile> {
  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name: fileName,
    mimeType,
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let bodyContent: string;
  if (typeof content === 'string') {
    bodyContent = content;
  } else {
    bodyContent = await content.text();
  }

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    bodyContent +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,size', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary="${boundary}"`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed: ${res.status} ${errText}`);
  }

  return await res.json();
}

/**
 * Delete a file from Google Drive (MUST be called after UI confirmation)
 */
export async function deleteCampDriveFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(`Failed to delete Drive file: ${res.status} ${errText}`);
  }
}
