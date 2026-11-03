import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Baby, CheckCircle2, AlertCircle, Clock, ShieldCheck, FileCheck, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Camper, CamperAgreement } from '../types.ts';
import { getCamperAgreements } from '../lib/db.ts';
import { ActivityLogsFeed } from '../components/ActivityLogsFeed.tsx';

interface ParentPortalProps {
  campers: Camper[];
  openRegisterModal: () => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ campers, openRegisterModal }) => {
  const { userProfile, updateProfile } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile?.name || '');
  const [phoneInput, setPhoneInput] = useState(userProfile?.phone || '');
  const [agreementsMap, setAgreementsMap] = useState<Record<string, CamperAgreement[]>>({});

  // Filter campers for current parent profile
  // If demo parent, matches parent-demo-1 or email
  const myCampers = campers.filter(
    (c) =>
      c.parentId === userProfile?.uid ||
      c.parentEmail.toLowerCase() === userProfile?.email?.toLowerCase() ||
      userProfile?.role === 'director' // Director can preview all
  );

  useEffect(() => {
    // Fetch agreements for each camper
    myCampers.forEach(async (c) => {
      if (!agreementsMap[c.id]) {
        const ags = await getCamperAgreements(c.id);
        setAgreementsMap((prev) => ({ ...prev, [c.id]: ags }));
      }
    });
  }, [myCampers.length]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name: nameInput, phone: phoneInput });
    setEditingProfile(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'Waiting list':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Waiting List
          </span>
        );
      case 'Needs information':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" /> Needs Information
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <section className="bg-gradient-to-r from-[#173828] to-[#22503a] rounded-2xl text-white p-6 sm:p-8 shadow-sm border border-emerald-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-amber-400">Guardian Hub</span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Welcome, {userProfile?.name || 'Parent'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
              Track your camper’s registration status, review digitally signed legal agreements,
              and follow real-time attendance and trail activities as they happen.
            </p>
          </div>

          <button
            onClick={openRegisterModal}
            className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-4 py-2.5 rounded-full text-sm shadow-sm transition-transform active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            + Register Another Child
          </button>
        </div>
      </section>

      {/* Parent Account Card */}
      <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Parent Profile & Contact</h2>
              <span className="text-[11px] text-stone-400">Stored in database</span>
            </div>
          </div>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {editingProfile ? 'Cancel' : 'Edit Contact'}
          </button>
        </div>

        {editingProfile ? (
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-emerald-900 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-emerald-800 w-full"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-stone-400" />
              <div>
                <span className="text-stone-400 block text-[10px]">Email Address</span>
                <span className="font-semibold text-stone-800">{userProfile?.email || 'None provided'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-stone-400" />
              <div>
                <span className="text-stone-400 block text-[10px]">Phone Number</span>
                <span className="font-semibold text-stone-800">{userProfile?.phone || 'Not recorded yet'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-stone-400 block text-[10px]">Account Role</span>
                <span className="font-semibold text-stone-800 capitalize">{userProfile?.role || 'Parent'}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Campers List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <Baby className="w-5 h-5 text-emerald-800" />
            <span>Registered Campers ({myCampers.length})</span>
          </h2>
        </div>

        {myCampers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center space-y-3">
            <Baby className="w-10 h-10 mx-auto text-stone-300" />
            <h3 className="font-bold text-stone-800 text-base">No registered campers found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You haven't registered a child for Driftwood Camp yet. Submit a registration to start their outdoor journey!
            </p>
            <button
              onClick={openRegisterModal}
              className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-5 py-2.5 rounded-full text-xs shadow-sm"
            >
              Register Child Now
            </button>
          </div>
        ) : (
          myCampers.map((camper) => {
            const agreements = agreementsMap[camper.id] || [];

            return (
              <div
                key={camper.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs space-y-5 p-5 sm:p-6"
              >
                {/* Camper Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-emerald-950">{camper.childName}</h3>
                      <span className="bg-stone-100 text-stone-600 text-xs px-2 py-0.5 rounded-md font-semibold">
                        Age {camper.age}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Registration ID: <span className="font-mono text-stone-700">#{camper.id}</span> · Enrolled on{' '}
                      {new Date(camper.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(camper.directorStatus)}
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                      {camper.program}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Attendance Day</span>
                    <span className="font-semibold text-stone-800">{camper.sessionChoice}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Transportation</span>
                    <span className="font-semibold text-stone-800">{camper.transport}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Pickup Area</span>
                    <span className="font-semibold text-stone-800">{camper.pickupArea || 'Venue drop-off'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Payment Status</span>
                    <span className="font-bold text-emerald-900">
                      {camper.paymentStatus} {camper.amountReceived ? `(${camper.amountReceived} ETB)` : ''}
                    </span>
                  </div>
                </div>

                {/* Director notes message if present */}
                {camper.directorNotes && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950">
                    <strong className="block text-amber-900 font-bold mb-0.5">Message from Camp Director:</strong>
                    <p>{camper.directorNotes}</p>
                    {camper.directorSignature && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={camper.directorSignature}
                          alt="Director Signature"
                          className="h-7 border border-amber-300 rounded bg-white px-2"
                        />
                        <span className="text-[10px] text-amber-800 font-medium">
                          Signed by {camper.directorName || 'Director'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Signed Agreements Accordion */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-800" />
                    <span>Signed Consent & Legal Agreements</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {agreements.length > 0 ? (
                      agreements.map((ag) => (
                        <div
                          key={ag.agreementKey}
                          className="p-3 bg-white border border-stone-200 rounded-xl text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-800 truncate">{ag.agreementTitle}</span>
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                              Recorded
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-2">{ag.agreementText}</p>
                          {ag.signature ? (
                            <div className="pt-1">
                              <img
                                src={ag.signature}
                                alt="Signature"
                                className="h-9 w-full object-contain border border-stone-200 rounded bg-stone-50"
                              />
                            </div>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">No signature needed</span>
                          )}
                        </div>
                      ))
                    ) : camper.parentSignature ? (
                      <div className="p-3 bg-white border border-stone-200 rounded-xl text-xs sm:col-span-3 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-800">Parent Master Consent</span>
                          <p className="text-stone-500 text-[11px]">Signed at: {camper.parentSignedAt}</p>
                        </div>
                        <img
                          src={camper.parentSignature}
                          alt="Signature"
                          className="h-10 border border-stone-200 rounded bg-stone-50 px-2"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400 italic sm:col-span-3">Agreements loaded.</p>
                    )}
                  </div>
                </div>

                {/* Real-time Activity Feed for this camper */}
                <div className="pt-3 border-t border-stone-100">
                  <ActivityLogsFeed
                    camperId={camper.id}
                    title={`${camper.childName}’s Live Activity Updates`}
                    subtitle="Real-time attendance & milestones posted by camp instructors"
                  />
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
