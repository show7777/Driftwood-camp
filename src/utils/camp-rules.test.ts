import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCapacity, validateCamperAge, formatETB, filterActivityLogs } from './camp-rules.ts';
import { Camper, ActivityLog } from '../types.ts';

test('validateCamperAge checks 8-12 bounds accurately', () => {
  assert.equal(validateCamperAge(7), false);
  assert.equal(validateCamperAge(8), true);
  assert.equal(validateCamperAge(10), true);
  assert.equal(validateCamperAge(12), true);
  assert.equal(validateCamperAge(13), false);
  assert.equal(validateCamperAge(8.5), false);
});

test('calculateCapacity tracks active slots, waitlists, and revenue correctly', () => {
  const mockCampers: Camper[] = [
    {
      id: '1',
      parentId: 'p1',
      parentName: 'Abebe',
      parentEmail: 'abebe@example.com',
      parentPhone: '0911000000',
      childName: 'Dawit',
      age: 9,
      program: 'Weekend camp',
      sessionChoice: 'Saturday',
      emergencyContact: '0911000000',
      paymentMethod: 'Dashen Bank',
      paymentStatus: 'Paid',
      amountReceived: '1000',
      transport: 'No — own drop-off and pickup',
      directorStatus: 'Approved',
      createdAt: '2026-11-01T10:00:00.000Z',
    },
    {
      id: '2',
      parentId: 'p2',
      parentName: 'Sara',
      parentEmail: 'sara@example.com',
      parentPhone: '0922000000',
      childName: 'Hanna',
      age: 11,
      program: 'Summer camp (two months)',
      sessionChoice: 'Both Saturday and Sunday',
      emergencyContact: '0922000000',
      paymentMethod: 'Telebirr',
      paymentStatus: 'Pending',
      amountReceived: '0',
      transport: 'Yes — need transportation',
      directorStatus: 'Waiting list',
      createdAt: '2026-11-01T11:00:00.000Z',
    },
  ];

  const stats = calculateCapacity(mockCampers, 40);
  assert.equal(stats.totalRegistered, 2);
  assert.equal(stats.withinCapacity, 1);
  assert.equal(stats.waitingCount, 1);
  assert.equal(stats.approvedCount, 1);
  assert.equal(stats.totalETBCollected, 1000);
  assert.equal(stats.paidCount, 1);
  assert.equal(stats.unpaidCount, 1);
});

test('formatETB formats currency in ETB string', () => {
  assert.equal(formatETB(1000), '1,000 ETB');
  assert.equal(formatETB(45000), '45,000 ETB');
});

test('filterActivityLogs filters by camper and attendance type', () => {
  const logs: ActivityLog[] = [
    {
      id: 'l1',
      camperId: 'c1',
      camperName: 'Dawit',
      activityDate: '2026-11-03',
      activity: 'Nature hike',
      attendance: 'Arrived',
      note: 'Checked in with hiking gear',
      createdBy: 'Director',
      createdAt: '2026-11-03T08:15:00.000Z',
    },
    {
      id: 'l2',
      camperId: 'c2',
      camperName: 'Hanna',
      activityDate: '2026-11-03',
      activity: 'Knot challenge',
      attendance: 'Attended',
      note: 'Learned square knot successfully',
      createdBy: 'Director',
      createdAt: '2026-11-03T10:00:00.000Z',
    },
  ];

  const filteredByCamper = filterActivityLogs(logs, 'c1', 'all', '');
  assert.equal(filteredByCamper.length, 1);
  assert.equal(filteredByCamper[0].camperName, 'Dawit');

  const filteredByAttendance = filterActivityLogs(logs, 'all', 'Attended', '');
  assert.equal(filteredByAttendance.length, 1);
  assert.equal(filteredByAttendance[0].camperName, 'Hanna');

  const filteredBySearch = filterActivityLogs(logs, 'all', 'all', 'knot');
  assert.equal(filteredBySearch.length, 1);
  assert.equal(filteredBySearch[0].activity, 'Knot challenge');
});
