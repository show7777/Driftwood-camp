import { Camper, ActivityLog } from '../types.ts';

export interface CampCapacityStats {
  totalRegistered: number;
  withinCapacity: number;
  maxCapacity: number;
  approvedCount: number;
  pendingCount: number;
  waitingCount: number;
  totalETBCollected: number;
  paidCount: number;
  unpaidCount: number;
}

export function calculateCapacity(campers: Camper[], maxCapacity = 40): CampCapacityStats {
  const totalRegistered = campers.length;
  const nonWaitlisted = campers.filter(c => c.directorStatus !== 'Waiting list');
  const withinCapacity = Math.min(maxCapacity, nonWaitlisted.length);
  const approvedCount = campers.filter(c => c.directorStatus === 'Approved').length;
  const pendingCount = campers.filter(c => c.directorStatus === 'Pending review' || c.directorStatus === 'Needs information').length;
  const waitingCount = campers.filter(c => c.directorStatus === 'Waiting list').length;
  
  const totalETBCollected = campers.reduce((sum, c) => {
    const amt = parseFloat(c.amountReceived || '0');
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const paidCount = campers.filter(c => c.paymentStatus === 'Paid').length;
  const unpaidCount = campers.filter(c => c.paymentStatus !== 'Paid' && c.paymentStatus !== 'Waived').length;

  return {
    totalRegistered,
    withinCapacity,
    maxCapacity,
    approvedCount,
    pendingCount,
    waitingCount,
    totalETBCollected,
    paidCount,
    unpaidCount,
  };
}

export function validateCamperAge(age: number): boolean {
  return Number.isInteger(age) && age >= 8 && age <= 12;
}

export function formatETB(amount: number): string {
  return `${amount.toLocaleString('en-US')} ETB`;
}

export function filterActivityLogs(
  logs: ActivityLog[],
  camperId?: string,
  attendanceFilter?: string,
  searchQuery?: string
): ActivityLog[] {
  return logs.filter(log => {
    if (camperId && camperId !== 'all' && log.camperId !== camperId) {
      return false;
    }
    if (attendanceFilter && attendanceFilter !== 'all' && log.attendance !== attendanceFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchCamper = log.camperName.toLowerCase().includes(q);
      const matchActivity = log.activity.toLowerCase().includes(q);
      const matchNote = log.note.toLowerCase().includes(q);
      if (!matchCamper && !matchActivity && !matchNote) {
        return false;
      }
    }
    return true;
  });
}
