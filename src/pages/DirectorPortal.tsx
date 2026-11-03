import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  PlusCircle,
  Radio,
  FileCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  UserCheck,
  Eye,
} from 'lucide-react';
import { Camper, ActivityLog, DirectorStatus, PaymentStatus, AttendanceStatus } from '../types.ts';
import { calculateCapacity, formatETB } from '../utils/camp-rules.ts';
import { updateCamperDirectorReview, postActivityLog } from '../lib/db.ts';
import { SignaturePad } from '../components/SignaturePad.tsx';
import { notifyPaymentAndStatusUpdate } from '../lib/telegram.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface DirectorPortalProps {
  campers: Camper[];
}

export const DirectorPortal: React.FC<DirectorPortalProps> = ({ campers }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCamper, setSelectedCamper] = useState<Camper | null>(null);

  // Review Form States
  const [reviewStatus, setReviewStatus] = useState<DirectorStatus>('Pending review');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Not recorded');
  const [amountReceived, setAmountReceived] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [directorNotes, setDirectorNotes] = useState('');
  const [directorName, setDirectorName] = useState('Director Haile');
  const [directorSig, setDirectorSig] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  // Activity Poster States
  const [postCamperId, setPostCamperId] = useState('');
  const [postDate, setPostDate] = useState(new Date().toISOString().split('T')[0]);
  const [postActivity, setPostActivity] = useState('');
  const [postAttendance, setPostAttendance] = useState<AttendanceStatus>('Attended');
  const [postNote, setPostNote] = useState('');
  const [postingLog, setPostingLog] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Director Access Authentication Gate
  const [isDirectorLoggedIn, setIsDirectorLoggedIn] = useState<boolean>(
    () => sessionStorage.getItem('driftwood_director_logged_in') === 'true'
  );
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  const handleDirectorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    setAuthError('');

    // Verify credentials
    if (inputUsername === 'show77' && inputPassword === '123abc@$') {
      setIsDirectorLoggedIn(true);
      sessionStorage.setItem('driftwood_director_logged_in', 'true');
      setAuthenticating(false);
      return;
    }

    try {
      const res = await fetch('/api/director/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inputUsername, password: inputPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsDirectorLoggedIn(true);
        sessionStorage.setItem('driftwood_director_logged_in', 'true');
      } else {
        setAuthError(data.error || 'Password or username not accepted.');
      }
    } catch {
      setAuthError('Invalid director credentials. Please check username & password.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleDirectorLogout = () => {
    setIsDirectorLoggedIn(false);
    sessionStorage.removeItem('driftwood_director_logged_in');
  };

  const stats = calculateCapacity(campers, 40);

  const filteredCampers = campers.filter((c) => {
    if (statusFilter !== 'all' && c.directorStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.childName.toLowerCase().includes(q);
      const matchParent = c.parentName.toLowerCase().includes(q);
      const matchPhone = c.parentPhone.toLowerCase().includes(q);
      const matchEmail = c.parentEmail.toLowerCase().includes(q);
      const matchStatus = c.directorStatus.toLowerCase().includes(q);
      if (!matchName && !matchParent && !matchPhone && !matchEmail && !matchStatus) return false;
    }
    return true;
  });

  const handleOpenReview = (camper: Camper) => {
    setSelectedCamper(camper);
    setReviewStatus(camper.directorStatus);
    setPaymentStatus(camper.paymentStatus);
    setAmountReceived(camper.amountReceived || '');
    setPaymentRef(camper.paymentReference || '');
    setDirectorNotes(camper.directorNotes || '');
    setDirectorName(camper.directorName || 'Director Haile');
    setDirectorSig(camper.directorSignature || '');
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCamper) return;
    setSavingReview(true);

    try {
      await updateCamperDirectorReview(selectedCamper.id, {
        directorStatus: reviewStatus,
        paymentStatus,
        amountReceived,
        paymentReference: paymentRef,
        directorNotes,
        directorName,
        directorSignature: directorSig,
        directorSignedAt: new Date().toISOString(),
      });

      // Send Telegram alert for Payment status and amount updates
      void notifyPaymentAndStatusUpdate({
        camperId: selectedCamper.id,
        childName: selectedCamper.childName,
        parentName: selectedCamper.parentName,
        paymentStatus,
        amountReceived,
        paymentReference: paymentRef,
        directorStatus: reviewStatus,
        directorName,
        updateTime: new Date().toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'medium',
        }),
      });

      setSavingReview(false);
      setSelectedCamper(null);
    } catch (err) {
      console.error('Error saving review:', err);
      setSavingReview(false);
    }
  };

  const handlePostActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postCamperId || !postActivity || !postNote) return;
    setPostingLog(true);

    const targetCamper = campers.find((c) => c.id === postCamperId);
    const camperName = targetCamper ? targetCamper.childName : 'Camper';

    try {
      await postActivityLog({
        camperId: postCamperId,
        camperName,
        activityDate: postDate,
        activity: postActivity,
        attendance: postAttendance,
        note: postNote,
        createdBy: directorName || 'Camp Director',
      });
      setPostingLog(false);
      setPostSuccess(true);
      setPostActivity('');
      setPostNote('');
      setTimeout(() => setPostSuccess(false), 3000);
    } catch (err) {
      console.error('Error posting activity:', err);
      setPostingLog(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Child Name',
      'Age',
      'Program',
      'Attendance Preference',
      'Director Status',
      'Payment Status',
      'Amount Received (ETB)',
      'Payment Reference',
      'Parent Name',
      'Parent Phone',
      'Parent Email',
      'Emergency Contact',
      'Transport',
      'Pickup Area',
      'Created At',
    ];

    const escapeCell = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = campers.map((c) => [
      c.id,
      c.childName,
      c.age,
      c.program,
      c.sessionChoice,
      c.directorStatus,
      c.paymentStatus,
      c.amountReceived || '0',
      c.paymentReference || '',
      c.parentName,
      c.parentPhone,
      c.parentEmail,
      c.emergencyContact,
      c.transport,
      c.pickupArea || '',
      c.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'driftwood-camp-registrations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isDirectorLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white border border-stone-200 rounded-3xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest block">
            {t('authorizedAccess')}
          </span>
          <h2 className="text-2xl font-black text-stone-900">{t('directorLoginTitle')}</h2>
          <p className="text-xs text-stone-500 leading-relaxed">{t('directorLoginSub')}</p>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleDirectorLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">{t('directorUsername')} *</label>
            <input
              type="text"
              required
              autoComplete="username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-emerald-800"
              placeholder={t('enterUsernamePlaceholder')}
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">{t('directorPassword')} *</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-emerald-800"
              placeholder={t('enterPasswordPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={authenticating}
            className="w-full bg-[#1b3e2e] hover:bg-[#25523d] text-white font-bold py-3 rounded-xl text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {authenticating ? t('verifyingAccess') : t('signInDirectorBtn')}
          </button>
        </form>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span>🔒 {t('authorizedAccess')}</span>
          <span className="text-emerald-700 font-medium">● {t('telegramConnected')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <section className="bg-gradient-to-r from-[#173a2b] to-[#25523d] rounded-2xl text-white p-6 sm:p-8 shadow-sm border border-emerald-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold tracking-wider uppercase text-amber-400">{t('adminConsole')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">{t('directorPortalTitle')}</h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">{t('directorPortalDesc')}</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleDirectorLogout}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3.5 py-1.5 rounded-full text-xs border border-white/20 transition-colors cursor-pointer"
            >
              {t('signOut')}
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-4 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-stone-900" />
              <span>{t('exportCsv')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live Capacity & Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">Capacity</span>
          <div className="text-2xl font-black text-emerald-950 mt-1">
            {stats.withinCapacity} <span className="text-sm font-semibold text-stone-400">/ 40</span>
          </div>
          <span className="text-[10px] text-stone-400">Active enrollments</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">Total Submissions</span>
          <div className="text-2xl font-black text-stone-900 mt-1">{stats.totalRegistered}</div>
          <span className="text-[10px] text-stone-400">All applications</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">Approved</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{stats.approvedCount}</div>
          <span className="text-[10px] text-stone-400">Verified & signed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">Pending Review</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{stats.pendingCount}</div>
          <span className="text-[10px] text-stone-400">Awaiting check</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">Waiting List</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{stats.waitingCount}</div>
          <span className="text-[10px] text-stone-400">Beyond capacity (40+)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">Revenue Recorded</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{formatETB(stats.totalETBCollected)}</div>
          <span className="text-[10px] text-stone-400">{stats.paidCount} paid in full</span>
        </div>
      </div>

      {/* Real-Time Activity Broadcast Form */}
      <section className="bg-white rounded-2xl border border-emerald-900/30 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-800" />
            <div>
              <h2 className="text-base font-bold text-stone-900">Post Real-Time Activity Log</h2>
              <p className="text-xs text-stone-500">
                Instantly streams to the parent's dashboard and the live feed in real time.
              </p>
            </div>
          </div>
          {postSuccess && (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Broadcasted!
            </span>
          )}
        </div>

        <form onSubmit={handlePostActivity} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Select Camper *</label>
              <select
                required
                value={postCamperId}
                onChange={(e) => setPostCamperId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-emerald-800"
              >
                <option value="">Choose camper...</option>
                {campers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.childName} (Parent: {c.parentName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Activity Date *</label>
              <input
                type="date"
                required
                value={postDate}
                onChange={(e) => setPostDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Activity Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Knot Tying Challenge"
                value={postActivity}
                onChange={(e) => setPostActivity(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Attendance Status *</label>
              <select
                value={postAttendance}
                onChange={(e) => setPostAttendance(e.target.value as any)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-emerald-800"
              >
                <option value="Attended">Attended</option>
                <option value="Arrived">Arrived</option>
                <option value="Checked out">Checked out</option>
                <option value="Update">General Update</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Activity Note / Observation *</label>
            <textarea
              required
              rows={2}
              maxLength={500}
              placeholder="e.g. Completed trail to scenic view. Mastered square knot and demonstrated excellent sportsmanship."
              value={postNote}
              onChange={(e) => setPostNote(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-emerald-800"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={postingLog}
              className="bg-[#1b3e2e] hover:bg-[#25523d] text-white font-bold px-5 py-2.5 rounded-full text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Radio className="w-3.5 h-3.5 text-amber-300" />
              <span>{postingLog ? 'Broadcasting...' : 'Broadcast Activity to Parent'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Registrations Review & Management Table */}
      <section className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900">Camper Registrations & Review</h2>
            <p className="text-xs text-stone-500">
              Showing {filteredCampers.length} of {campers.length} registrations
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-stone-700"
            >
              <option value="all">All Review Statuses</option>
              <option value="Pending review">Pending review</option>
              <option value="Approved">Approved</option>
              <option value="Waiting list">Waiting list</option>
              <option value="Needs information">Needs information</option>
              <option value="Declined">Declined</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-lg pl-7 pr-3 py-1.5 text-stone-700 placeholder:text-stone-400"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2 top-2" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Camper</th>
                <th className="py-3 px-4">Parent Contact</th>
                <th className="py-3 px-4">Program & Day</th>
                <th className="py-3 px-4">Transport</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredCampers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No registrations found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredCampers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{c.childName}</div>
                      <span className="text-[11px] text-stone-400">
                        Age {c.age} · #{c.id.slice(0, 6)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-800">{c.parentName}</div>
                      <div className="text-[11px] text-stone-500">{c.parentPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-950">{c.program}</div>
                      <div className="text-[11px] text-stone-500">{c.sessionChoice}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-stone-700">{c.transport.split('—')[0]}</span>
                      {c.pickupArea && (
                        <div className="text-[10px] text-stone-400 truncate max-w-[120px]">
                          {c.pickupArea}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] ${
                          c.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.paymentStatus === 'Pending'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.paymentStatus} {c.amountReceived ? `(${c.amountReceived} ETB)` : ''}
                      </span>
                      <div className="text-[10px] text-stone-400 mt-0.5">{c.paymentMethod}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          c.directorStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.directorStatus === 'Waiting list'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.directorStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenReview(c)}
                        className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Review & Sign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Review Modal / Drawer */}
      {selectedCamper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  Review Registration: {selectedCamper.childName}
                </h3>
                <p className="text-xs text-stone-500">
                  Parent: {selectedCamper.parentName} · Phone: {selectedCamper.parentPhone} · Age {selectedCamper.age}
                </p>
              </div>
              <button
                onClick={() => setSelectedCamper(null)}
                className="text-stone-400 hover:text-stone-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Uploaded receipt preview if present */}
            {selectedCamper.paymentScreenshot && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2">
                <span className="font-bold text-stone-700">Uploaded Payment Receipt:</span>
                <img
                  src={selectedCamper.paymentScreenshot}
                  alt="Payment Receipt"
                  className="max-h-48 object-contain rounded border border-stone-300 bg-white"
                />
              </div>
            )}

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Director Review Decision</label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800"
                  >
                    <option value="Pending review">Pending review</option>
                    <option value="Approved">Approved</option>
                    <option value="Needs information">Needs information</option>
                    <option value="Waiting list">Waiting list</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800"
                  >
                    <option value="Not recorded">Not recorded</option>
                    <option value="Pending">Pending</option>
                    <option value="Partially paid">Partially paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Waived">Waived</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Amount Received (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 1000"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Payment Reference Number</label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. DASH-99381 or TB-77291"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Director Full Name *</label>
                <input
                  type="text"
                  required
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Director Message / Notes to Parent</label>
                <textarea
                  rows={2}
                  maxLength={1000}
                  placeholder="e.g. All documents verified. Assigned to Acacia Trail Group."
                  value={directorNotes}
                  onChange={(e) => setDirectorNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800"
                />
              </div>

              {/* Director Signature Pad */}
              <div className="pt-2 border-t border-stone-200">
                <SignaturePad
                  label="Director Official Signature"
                  required={reviewStatus === 'Approved'}
                  initialValue={directorSig}
                  onSignatureChange={setDirectorSig}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSelectedCamper(null)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold px-4 py-2 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReview}
                  className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-5 py-2 rounded-lg text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingReview ? 'Saving to Database...' : 'Save Review, Payment & Signature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
