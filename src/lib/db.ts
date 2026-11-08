import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase.ts';
import { UserProfile, Camper, ActivityLog, CamperAgreement, DirectorStatus } from '../types.ts';

const USERS_COL = 'users';
const CAMPERS_COL = 'campers';
const ACTIVITY_LOGS_COL = 'activity_logs';
const AGREEMENTS_COL = 'camper_agreements';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, USERS_COL, uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${USERS_COL}/${uid}`);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, USERS_COL, profile.uid), profile, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${USERS_COL}/${profile.uid}`);
  }
}

export function subscribeUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  return onSnapshot(
    doc(db, USERS_COL, uid),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `${USERS_COL}/${uid}`);
    }
  );
}

// Campers
export function subscribeCampers(
  callback: (campers: Camper[]) => void,
  parentId?: string
) {
  let q = query(collection(db, CAMPERS_COL), orderBy('createdAt', 'desc'));
  if (parentId) {
    q = query(collection(db, CAMPERS_COL), where('parentId', '==', parentId), orderBy('createdAt', 'desc'));
  }

  try {
    return onSnapshot(
      q,
      (snap) => {
        const campers: Camper[] = [];
        snap.forEach((d) => {
          campers.push({ id: d.id, ...d.data() } as Camper);
        });
        localStorage.setItem('driftwood_cached_campers', JSON.stringify(campers));
        callback(campers);
      },
      (err) => {
        console.warn('Firestore subscription fallback:', err);
        const cached = localStorage.getItem('driftwood_cached_campers');
        if (cached) {
          try {
            const list = JSON.parse(cached);
            callback(parentId ? list.filter((c: any) => c.parentId === parentId) : list);
          } catch {}
        }
      }
    );
  } catch (err) {
    console.warn('subscribeCampers catch fallback:', err);
    const cached = localStorage.getItem('driftwood_cached_campers');
    if (cached) {
      try {
        const list = JSON.parse(cached);
        callback(parentId ? list.filter((c: any) => c.parentId === parentId) : list);
      } catch {}
    }
    return () => {};
  }
}

export async function getAllCampersOnce(): Promise<Camper[]> {
  try {
    const snap = await getDocs(query(collection(db, CAMPERS_COL), orderBy('createdAt', 'desc')));
    const campers: Camper[] = [];
    snap.forEach((d) => {
      campers.push({ id: d.id, ...d.data() } as Camper);
    });
    localStorage.setItem('driftwood_cached_campers', JSON.stringify(campers));
    return campers;
  } catch (err) {
    console.warn('getAllCampersOnce fallback:', err);
    const cached = localStorage.getItem('driftwood_cached_campers');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return [];
  }
}

function sanitizeDocData<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean as T;
}

export async function registerCamper(
  camperInput: Omit<Camper, 'id' | 'createdAt' | 'directorStatus'>,
  agreements: Omit<CamperAgreement, 'camperId' | 'signedAt'>[]
): Promise<string> {
  const existingCampers = await getAllCampersOnce();
  const nonWaitlisted = existingCampers.filter(c => c.directorStatus !== 'Waiting list');
  const directorStatus = nonWaitlisted.length >= 40 ? 'Waiting list' : 'Pending review';

  const camperData = sanitizeDocData({
    ...camperInput,
    directorStatus,
    createdAt: new Date().toISOString(),
  });

  try {
    const docRef = await addDoc(collection(db, CAMPERS_COL), camperData);
    const camperId = docRef.id;

    // Save signed agreements
    for (const ag of agreements) {
      await addDoc(collection(db, AGREEMENTS_COL), {
        ...ag,
        camperId,
        signedAt: new Date().toISOString(),
      });
    }

    // Auto-create initial activity log
    await addDoc(collection(db, ACTIVITY_LOGS_COL), {
      camperId,
      camperName: camperInput.childName,
      activityDate: new Date().toISOString().split('T')[0],
      activity: 'Registration Received',
      attendance: 'Update',
      note: `Registration received for ${camperInput.childName}. Status: ${directorStatus}. Preferred attendance: ${camperInput.sessionChoice}.`,
      createdBy: 'System',
      createdAt: new Date().toISOString(),
    });

    return camperId;
  } catch (err) {
    console.warn('registerCamper Firestore fallback:', err);
    const camperId = 'camper-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newCamper: Camper = {
      id: camperId,
      ...camperData,
      directorStatus: camperData.directorStatus as DirectorStatus,
    };

    const cached = localStorage.getItem('driftwood_cached_campers');
    const list: Camper[] = cached ? JSON.parse(cached) : [];
    list.unshift(newCamper);
    localStorage.setItem('driftwood_cached_campers', JSON.stringify(list));
    return camperId;
  }
}

export async function updateCamperDirectorReview(
  camperId: string,
  updates: Partial<Camper>
): Promise<void> {
  try {
    await updateDoc(doc(db, CAMPERS_COL, camperId), updates);

    // If status changed or payment changed, log an activity update
    if (updates.directorStatus || updates.paymentStatus) {
      const camperSnap = await getDoc(doc(db, CAMPERS_COL, camperId));
      const childName = camperSnap.exists() ? camperSnap.data()?.childName : 'Camper';

      await addDoc(collection(db, ACTIVITY_LOGS_COL), {
        camperId,
        camperName: childName,
        activityDate: new Date().toISOString().split('T')[0],
        activity: 'Director Status Update',
        attendance: 'Update',
        note: `Review: ${updates.directorStatus || 'Updated'}. Payment: ${updates.paymentStatus || 'Updated'}${updates.amountReceived ? ` (${updates.amountReceived} ETB)` : ''}. Note: ${updates.directorNotes || 'None'}`,
        createdBy: updates.directorName || 'Camp Director',
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${CAMPERS_COL}/${camperId}`);
  }
}

// Real-Time Activity Logs
export function subscribeActivityLogs(
  callback: (logs: ActivityLog[]) => void,
  camperId?: string
) {
  let q = query(collection(db, ACTIVITY_LOGS_COL), orderBy('createdAt', 'desc'), limit(100));
  if (camperId && camperId !== 'all') {
    q = query(
      collection(db, ACTIVITY_LOGS_COL),
      where('camperId', '==', camperId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }

  return onSnapshot(
    q,
    (snap) => {
      const logs: ActivityLog[] = [];
      snap.forEach((d) => {
        logs.push({ id: d.id, ...d.data() } as ActivityLog);
      });
      callback(logs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, ACTIVITY_LOGS_COL);
    }
  );
}

export async function postActivityLog(
  log: Omit<ActivityLog, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, ACTIVITY_LOGS_COL), {
      ...log,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, ACTIVITY_LOGS_COL);
    throw err;
  }
}

// Camper Agreements
export async function getCamperAgreements(camperId: string): Promise<CamperAgreement[]> {
  try {
    const q = query(collection(db, AGREEMENTS_COL), where('camperId', '==', camperId));
    const snap = await getDocs(q);
    const agreements: CamperAgreement[] = [];
    snap.forEach((d) => {
      agreements.push({ id: d.id, ...d.data() } as CamperAgreement);
    });
    return agreements;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, AGREEMENTS_COL);
    return [];
  }
}

// Seed Demo Data if Fresh Database
export async function seedDemoDataIfEmpty(): Promise<void> {
  try {
    const existing = await getDocs(query(collection(db, CAMPERS_COL), limit(1)));
    if (!existing.empty) {
      return; // Already populated
    }

    console.log('Populating initial Driftwood Camp records in Firestore...');

    const sampleCampers = [
      {
        parentId: 'parent-demo-1',
        parentName: 'Solomon Kebede',
        parentEmail: 'solomon.k@gmail.com',
        parentPhone: '+251 91 123 4567',
        childName: 'Dawit Solomon',
        age: 10,
        program: 'Weekend camp' as const,
        sessionChoice: 'Saturday',
        emergencyContact: 'Almaz Kebede (+251 91 234 5678)',
        paymentMethod: 'Dashen Bank' as const,
        paymentStatus: 'Paid' as const,
        amountReceived: '1000',
        paymentReference: 'DASH-8839201',
        transport: 'Yes — need transportation' as const,
        pickupArea: 'Bole Medhanialem (near Church)',
        notes: 'Dawit is enthusiastic about bird identification.',
        directorStatus: 'Approved' as const,
        directorName: 'Director Haile',
        directorNotes: 'All agreements verified. Welcome Dawit!',
        directorSignedAt: '2026-11-01T09:00:00.000Z',
        createdAt: '2026-11-01T08:30:00.000Z',
      },
      {
        parentId: 'parent-demo-2',
        parentName: 'Bethlehem Tadesse',
        parentEmail: 'bethlehem.t@gmail.com',
        parentPhone: '+251 92 345 6789',
        childName: 'Liya Eyob',
        age: 9,
        program: 'Summer camp (two months)' as const,
        sessionChoice: 'Both Saturday and Sunday',
        emergencyContact: 'Eyob Wolde (+251 92 456 7890)',
        paymentMethod: 'Telebirr' as const,
        paymentStatus: 'Paid' as const,
        amountReceived: '1000',
        paymentReference: 'TB-9921448',
        transport: 'No — own drop-off and pickup' as const,
        pickupArea: 'Parent drop-off at Botanic Garden gate',
        notes: 'Mild peanut sensitivity, carries own water bottle.',
        directorStatus: 'Approved' as const,
        directorName: 'Director Haile',
        directorNotes: 'Approved. Medical note logged with first aid staff.',
        directorSignedAt: '2026-11-02T10:15:00.000Z',
        createdAt: '2026-11-01T11:20:00.000Z',
      },
      {
        parentId: 'parent-demo-3',
        parentName: 'Yared Mengistu',
        parentEmail: 'yared.m@gmail.com',
        parentPhone: '+251 93 456 7891',
        childName: 'Abel Yared',
        age: 11,
        program: 'Weekend camp' as const,
        sessionChoice: 'Sunday',
        emergencyContact: 'Tigist Mengistu (+251 93 567 8901)',
        paymentMethod: 'Cash' as const,
        paymentStatus: 'Pending' as const,
        transport: 'Yes — need transportation' as const,
        pickupArea: 'Mexico Square / Genete Tsige',
        notes: 'First time at camp.',
        directorStatus: 'Pending review' as const,
        createdAt: '2026-11-02T14:45:00.000Z',
      },
    ];

    for (const c of sampleCampers) {
      const docRef = await addDoc(collection(db, CAMPERS_COL), c);
      const camperId = docRef.id;

      // Seed agreements
      await addDoc(collection(db, AGREEMENTS_COL), {
        camperId,
        agreementKey: 'participation',
        agreementTitle: 'Participation consent',
        agreementText: 'Parent authorized supervised outdoor activities at Gulele Botanic Garden.',
        signedAt: c.createdAt,
      });
      await addDoc(collection(db, AGREEMENTS_COL), {
        camperId,
        agreementKey: 'risk',
        agreementTitle: 'Outdoor activity risk acknowledgment',
        agreementText: 'Parent acknowledged natural terrain, outdoor conditions and safety rules.',
        signedAt: c.createdAt,
      });
      await addDoc(collection(db, AGREEMENTS_COL), {
        camperId,
        agreementKey: 'emergency',
        agreementTitle: 'Emergency care authorization',
        agreementText: 'Parent authorized emergency contact and urgent medical care when necessary.',
        signedAt: c.createdAt,
      });

      // Seed realistic live activity updates
      if (c.childName === 'Dawit Solomon') {
        await addDoc(collection(db, ACTIVITY_LOGS_COL), {
          camperId,
          camperName: c.childName,
          activityDate: '2026-11-03',
          activity: 'Morning Arrival & Safety Briefing',
          attendance: 'Arrived',
          note: 'Arrived on the Bole shuttle on time. Checked gear and drinking water.',
          createdBy: 'Director Haile',
          createdAt: '2026-11-03T08:15:00.000Z',
        });
        await addDoc(collection(db, ACTIVITY_LOGS_COL), {
          camperId,
          camperName: c.childName,
          activityDate: '2026-11-03',
          activity: 'Gulele Ridge Nature Hike',
          attendance: 'Attended',
          note: 'Completed 2.5km botanical nature trail. Spotted indigenous juniper trees and sunbirds.',
          createdBy: 'Instructor Aster',
          createdAt: '2026-11-03T10:45:00.000Z',
        });
        await addDoc(collection(db, ACTIVITY_LOGS_COL), {
          camperId,
          camperName: c.childName,
          activityDate: '2026-11-03',
          activity: 'Wilderness Skills & Knot Tying',
          attendance: 'Attended',
          note: 'Mastered the reef knot and square lashing for shelter construction! Great teamwork.',
          createdBy: 'Instructor Aster',
          createdAt: '2026-11-03T13:30:00.000Z',
        });
      } else if (c.childName === 'Liya Eyob') {
        await addDoc(collection(db, ACTIVITY_LOGS_COL), {
          camperId,
          camperName: c.childName,
          activityDate: '2026-11-03',
          activity: 'Camp Welcome & Warm-up Rhythm',
          attendance: 'Arrived',
          note: 'Parent dropped off at main gate. Participated in the team cheer and dance circles.',
          createdBy: 'Director Haile',
          createdAt: '2026-11-03T08:25:00.000Z',
        });
        await addDoc(collection(db, ACTIVITY_LOGS_COL), {
          camperId,
          camperName: c.childName,
          activityDate: '2026-11-03',
          activity: 'Driftwood Olympia Relay Game',
          attendance: 'Attended',
          note: 'Led the Cedar Team in the obstacle relay! High energy and sportsmanship.',
          createdBy: 'Coach Dawit',
          createdAt: '2026-11-03T14:15:00.000Z',
        });
      }
    }
  } catch (err) {
    console.warn('Could not seed initial data:', err);
  }
}
