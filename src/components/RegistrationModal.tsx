import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Upload, FileText, ChevronRight, Check } from 'lucide-react';
import { SignaturePad } from './SignaturePad.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { registerCamper } from '../lib/db.ts';
import { validateCamperAge } from '../utils/camp-rules.ts';
import { CamperAgreement } from '../types.ts';
import { notifyNewChildRegistration } from '../lib/telegram.ts';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (camperId: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { userProfile, updateProfile } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [parentName, setParentName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [childName, setChildName] = useState('');
  const [age, setAge] = useState<number>(9);
  const [program, setProgram] = useState<'Weekend camp' | 'Summer camp (two months)'>('Weekend camp');
  const [sessionChoice, setSessionChoice] = useState('Saturday');
  const [transport, setTransport] = useState<'Yes — need transportation' | 'No — own drop-off and pickup'>('No — own drop-off and pickup');
  const [pickupArea, setPickupArea] = useState('');
  const [notes, setNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'Dashen Bank' | 'Telebirr' | 'Cash'>('Dashen Bank');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [paymentFileName, setPaymentFileName] = useState('');

  // Agreements Checkboxes & Signatures
  const [consentParticipation, setConsentParticipation] = useState(false);
  const [participationSig, setParticipationSig] = useState('');

  const [consentRisks, setConsentRisks] = useState(false);
  const [riskSig, setRiskSig] = useState('');

  const [consentEmergency, setConsentEmergency] = useState(false);
  const [emergencySig, setEmergencySig] = useState('');

  const [mediaConsent, setMediaConsent] = useState<'No permission granted' | 'Permission granted'>('No permission granted');
  const [mediaSig, setMediaSig] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      alert('Please upload a PNG, JPG, or WEBP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2 MB limit.');
      return;
    }

    setPaymentFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !phone || !email || !emergencyContact || !childName) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (!validateCamperAge(age)) {
      setErrorMsg('Child age must be between 8 and 12 years old.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentParticipation || !participationSig) {
      setErrorMsg('Please read and sign Agreement 1 (Participation consent).');
      return;
    }
    if (!consentRisks || !riskSig) {
      setErrorMsg('Please read and sign Agreement 2 (Activity risk acknowledgment).');
      return;
    }
    if (!consentEmergency || !emergencySig) {
      setErrorMsg('Please read and sign Agreement 3 (Emergency care authorization).');
      return;
    }
    if (mediaConsent === 'Permission granted' && !mediaSig) {
      setErrorMsg('Please provide your signature for the photo/video permission consent.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const parentId = userProfile?.uid || 'guest-parent-' + Date.now();

      // If user profile phone was missing, update it
      if (userProfile && !userProfile.phone && phone) {
        await updateProfile({ phone, name: parentName });
      }

      const agreementsToSave: Omit<CamperAgreement, 'camperId' | 'signedAt'>[] = [
        {
          agreementKey: 'participation',
          agreementTitle: 'Participation consent',
          agreementText: 'Parent authorized supervised camp participation and acknowledged that final dates, rules, venue and supervision information will be provided.',
          signature: participationSig,
        },
        {
          agreementKey: 'risk',
          agreementTitle: 'Outdoor activity risk acknowledgment',
          agreementText: 'Parent acknowledged ordinary outdoor activity risks and safety precautions; this does not waive rights that cannot legally be waived.',
          signature: riskSig,
        },
        {
          agreementKey: 'emergency',
          agreementTitle: 'Emergency care authorization',
          agreementText: 'Parent authorized staff to contact emergency services or arrange urgent medical assistance when necessary.',
          signature: emergencySig,
        },
      ];

      if (mediaConsent === 'Permission granted') {
        agreementsToSave.push({
          agreementKey: 'media',
          agreementTitle: 'Photo and video permission',
          agreementText: 'Parent/guardian granted photo/video permission for camp updates or promotional materials.',
          signature: mediaSig,
        });
      } else {
        agreementsToSave.push({
          agreementKey: 'media_declined',
          agreementTitle: 'Photo and video permission',
          agreementText: 'Parent/guardian did not grant photo/video permission.',
          signature: '',
        });
      }

      const camperId = await registerCamper(
        {
          parentId,
          parentName,
          parentPhone: phone,
          parentEmail: email,
          childName,
          age,
          program,
          sessionChoice,
          emergencyContact,
          paymentMethod,
          paymentStatus: 'Pending',
          paymentScreenshot: paymentScreenshot || '',
          transport,
          pickupArea: pickupArea || '',
          notes: notes || '',
          parentSignature: participationSig,
          parentSignedAt: new Date().toISOString(),
        },
        agreementsToSave
      );

      // Dispatch Telegram Alert with Registration Date, Time, Child, Payment & Receipt Details
      void notifyNewChildRegistration({
        camperId,
        childName,
        age,
        program,
        sessionChoice,
        parentName,
        parentPhone: phone,
        parentEmail: email,
        emergencyContact,
        paymentMethod,
        paymentStatus: 'Pending review',
        hasReceipt: Boolean(paymentScreenshot),
        transport,
        pickupArea: pickupArea || undefined,
        registrationTime: new Date().toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'medium',
        }),
      });

      setSubmitting(false);
      setStep(4);
      onSuccess(camperId);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'Could not complete registration. Please check fields.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#fcfbf7] border border-stone-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Top Header */}
        <div className="bg-[#1b3e2e] text-white px-5 py-4 flex items-center justify-between border-b border-emerald-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">✦</span>
              <h2 className="font-bold text-lg text-white">Driftwood Camp Registration</h2>
            </div>
            <p className="text-xs text-emerald-200">Ages 8–12 · Gulele Botanic Garden, Addis Ababa</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-900/60"
            aria-label="Close registration"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress indicators */}
        <div className="bg-[#f4efe3] px-6 py-2.5 border-b border-stone-200 flex items-center justify-between text-xs font-semibold text-stone-600">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-emerald-900 font-bold' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-emerald-800 text-white' : 'bg-stone-300 text-stone-600'}`}>1</span>
            <span>Family & Child</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-emerald-900 font-bold' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-emerald-800 text-white' : 'bg-stone-300 text-stone-600'}`}>2</span>
            <span>Payment & Transport</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-emerald-900 font-bold' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-emerald-800 text-white' : 'bg-stone-300 text-stone-600'}`}>3</span>
            <span>Agreements & Sign</span>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mx-5 mt-3 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Parent / Guardian Full Name *</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-emerald-700"
                    placeholder="e.g. Solomon Kebede"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number (with WhatsApp/SMS) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={40}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-emerald-700"
                    placeholder="e.g. +251 91 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Parent Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-emerald-700"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Emergency Contact (Name & Phone) *</label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-emerald-700"
                    placeholder="e.g. Almaz Kebede (+251 91 234 5678)"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200">
                <h3 className="text-sm font-bold text-emerald-900 mb-2">Child / Camper Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Child Full Name *</label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-emerald-700"
                      placeholder="e.g. Dawit Solomon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Child Age (Must be 8 to 12) *</label>
                    <select
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-emerald-700"
                    >
                      {[8, 9, 10, 11, 12].map((a) => (
                        <option key={a} value={a}>
                          {a} years old
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Program Selection *</label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value as any)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-emerald-700"
                  >
                    <option value="Weekend camp">Weekend camp</option>
                    <option value="Summer camp (two months)">Summer camp (two months)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Attendance Day Preference *</label>
                  <select
                    value={sessionChoice}
                    onChange={(e) => setSessionChoice(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-emerald-700"
                  >
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Both Saturday and Sunday">Both Saturday and Sunday</option>
                    <option value="Summer program — dates to be confirmed">Summer program (full)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="bg-[#1b3e2e] hover:bg-[#25523d] text-white font-bold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Continue to Payment & Transport</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Payment Accounts (1,000 ETB)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-xs text-stone-800">
                  <div className="bg-white p-3 rounded-lg border border-amber-200">
                    <p className="font-bold text-emerald-950">🏦 Dashen Bank</p>
                    <p className="font-mono text-sm mt-0.5 text-stone-900 font-semibold">5516105727021</p>
                    <p className="text-[11px] text-stone-500">Driftwood Outdoor Camp</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-amber-200">
                    <p className="font-bold text-emerald-950">📱 Telebirr</p>
                    <p className="font-mono text-sm mt-0.5 text-stone-900 font-semibold">0935347799</p>
                    <p className="text-[11px] text-stone-500">Organizer account</p>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  * Note: Confirm the account holder name before sending money. Keep your payment receipt.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Preferred Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-emerald-700"
                  >
                    <option value="Dashen Bank">Dashen Bank Transfer</option>
                    <option value="Telebirr">Telebirr Mobile Money</option>
                    <option value="Cash">Cash (Arrange directly with organizer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Upload Payment Screenshot (Optional, Max 2MB)
                  </label>
                  <label className="flex items-center gap-2 bg-white border border-stone-300 hover:border-emerald-600 px-3 py-2 rounded-lg cursor-pointer text-xs text-stone-700">
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span className="truncate">{paymentFileName || 'Choose image file...'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {paymentScreenshot && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={paymentScreenshot}
                        alt="Receipt Preview"
                        className="w-12 h-12 object-cover rounded border border-stone-300"
                      />
                      <span className="text-xs text-emerald-700 font-medium">Receipt attached</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Transportation Needed? *</label>
                  <select
                    value={transport}
                    onChange={(e) => setTransport(e.target.value as any)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-emerald-700"
                  >
                    <option value="No — own drop-off and pickup">No — own drop-off and pickup</option>
                    <option value="Yes — need transportation">Yes — need shuttle transportation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Pickup Area / Meeting Point</label>
                  <input
                    type="text"
                    maxLength={160}
                    value={pickupArea}
                    onChange={(e) => setPickupArea(e.target.value)}
                    placeholder="e.g. Bole Medhanialem, Mexico Square"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Notes for Organizer (Diet, Medical, Notes)</label>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any dietary restrictions, medical notes, or swimming/hiking experience..."
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-emerald-700"
                />
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold px-4 py-2.5 rounded-full text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-[#1b3e2e] hover:bg-[#25523d] text-white font-bold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Review & Sign Agreements</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                <p className="font-bold">Required Legal & Safety Agreements</p>
                <p className="text-emerald-800 mt-0.5">
                  Each agreement below requires your explicit checkbox acknowledgment and digital signature.
                </p>
              </div>

              {/* Agreement 1 */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <FileText className="w-4 h-4 text-emerald-800" />
                  <h4>Agreement 1 · Participation Consent</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  I confirm that I am the parent/legal guardian and authorize {childName || 'my child'} to participate in
                  Driftwood Camp’s supervised outdoor activities at Gulele Botanic Garden, including trail hikes, knot tying,
                  shelter building, music, team games, and physical activities. I understand the organizer will provide final
                  dates, safety briefings, and rules.
                </p>
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentParticipation}
                    onChange={(e) => setConsentParticipation(e.target.checked)}
                    className="w-4 h-4 text-emerald-800 rounded focus:ring-emerald-700"
                  />
                  <span>I have read and agree to the participation consent *</span>
                </label>
                <SignaturePad
                  label="Parent / Guardian Signature (Participation)"
                  required
                  onSignatureChange={setParticipationSig}
                />
              </div>

              {/* Agreement 2 */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <FileText className="w-4 h-4 text-emerald-800" />
                  <h4>Agreement 2 · Outdoor Activity Risk Acknowledgment</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  I understand that outdoor activities and physical games may involve ordinary risks such as uneven terrain,
                  sun/weather exposure, minor scrapes, or fatigue. Staff will explain safety precautions. This acknowledgment
                  does not waive any rights that cannot legally be waived.
                </p>
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentRisks}
                    onChange={(e) => setConsentRisks(e.target.checked)}
                    className="w-4 h-4 text-emerald-800 rounded focus:ring-emerald-700"
                  />
                  <span>I have read and acknowledge the activity risk information *</span>
                </label>
                <SignaturePad
                  label="Parent / Guardian Signature (Risk Acknowledgment)"
                  required
                  onSignatureChange={setRiskSig}
                />
              </div>

              {/* Agreement 3 */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <FileText className="w-4 h-4 text-emerald-800" />
                  <h4>Agreement 3 · Emergency Care Authorization</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  If my child becomes ill or injured, I authorize camp staff to contact me, call emergency services, or
                  arrange urgent medical assistance if reasonable efforts to contact me fail or in an immediate emergency.
                </p>
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentEmergency}
                    onChange={(e) => setConsentEmergency(e.target.checked)}
                    className="w-4 h-4 text-emerald-800 rounded focus:ring-emerald-700"
                  />
                  <span>I authorize emergency care and contact procedures *</span>
                </label>
                <SignaturePad
                  label="Parent / Guardian Signature (Emergency Care)"
                  required
                  onSignatureChange={setEmergencySig}
                />
              </div>

              {/* Agreement 4 (Optional Media) */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h4>Optional · Photo and Video Permission</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Choose whether the camp may take photos or short videos of your child for camp updates or family memories.
                  This choice is completely optional and does not affect participation.
                </p>
                <select
                  value={mediaConsent}
                  onChange={(e) => setMediaConsent(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-emerald-700"
                >
                  <option value="No permission granted">Do not grant photo/video permission</option>
                  <option value="Permission granted">I grant photo/video permission for camp highlights</option>
                </select>
                {mediaConsent === 'Permission granted' && (
                  <SignaturePad
                    label="Parent Signature Confirming Photo/Video Permission *"
                    required
                    onSignatureChange={setMediaSig}
                  />
                )}
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold px-4 py-2.5 rounded-full text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-black px-6 py-2.5 rounded-full text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving to Database...' : 'Complete Registration & Sign'}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-emerald-950">Registration Submitted!</h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Registration for <strong>{childName}</strong> has been successfully recorded in the database.
                Your agreements and signatures have been safely archived.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="bg-emerald-900 text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-emerald-800"
                >
                  Go to Parent Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
