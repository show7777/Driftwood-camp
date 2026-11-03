export type UserRole = 'parent' | 'director' | 'organizer';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  avatarUrl?: string;
}

export type DirectorStatus = 'Pending review' | 'Approved' | 'Needs information' | 'Waiting list' | 'Declined';
export type PaymentStatus = 'Not recorded' | 'Pending' | 'Partially paid' | 'Paid' | 'Waived' | 'Refunded';
export type AttendanceStatus = 'Attended' | 'Arrived' | 'Checked out' | 'Update';

export interface Camper {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childName: string;
  age: number;
  program: 'Weekend camp' | 'Summer camp (two months)';
  sessionChoice: string;
  emergencyContact: string;
  paymentMethod: 'Dashen Bank' | 'Telebirr' | 'Cash';
  paymentStatus: PaymentStatus;
  amountReceived?: string;
  paymentReference?: string;
  paymentScreenshot?: string;
  transport: 'Yes — need transportation' | 'No — own drop-off and pickup';
  pickupArea?: string;
  notes?: string;
  directorStatus: DirectorStatus;
  directorNotes?: string;
  directorName?: string;
  directorSignature?: string;
  directorSignedAt?: string;
  parentSignature?: string;
  parentSignedAt?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  camperId: string;
  camperName: string;
  activityDate: string; // YYYY-MM-DD
  activity: string; // e.g. "Nature Trail & Navigation"
  attendance: AttendanceStatus;
  note: string;
  createdBy: string; // director name / email
  createdAt: string; // ISO string
}

export interface CamperAgreement {
  id?: string;
  camperId: string;
  agreementKey: 'participation' | 'risk' | 'emergency' | 'media' | 'media_declined';
  agreementTitle: string;
  agreementText: string;
  signature?: string;
  signedAt: string;
}
