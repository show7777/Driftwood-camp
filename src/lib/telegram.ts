export interface TelegramRegistrationPayload {
  camperId: string;
  childName: string;
  age: number;
  program: string;
  sessionChoice: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact: string;
  paymentMethod: string;
  paymentStatus: string;
  hasReceipt: boolean;
  transport: string;
  pickupArea?: string;
  registrationTime: string;
}

export interface TelegramPaymentUpdatePayload {
  camperId: string;
  childName: string;
  parentName: string;
  paymentStatus: string;
  amountReceived?: string;
  paymentReference?: string;
  directorStatus: string;
  directorName: string;
  updateTime: string;
}

const DEFAULT_BOT_TOKEN = '9128165397:AAFZFN_qgNyfROzRZT4M6ZNaM4zfrDz_q2Y';
const DEFAULT_CHAT_ID = '8990517709';

export async function sendTelegramMessage(text: string): Promise<boolean> {
  // First attempt via backend API route
  try {
    const res = await fetch('/api/telegram/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    // If backend route unavailable, proceed to direct client fallback
  }

  // Direct Telegram API fallback
  try {
    const res = await fetch(`https://api.telegram.org/bot${DEFAULT_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: DEFAULT_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();
    return data.ok;
  } catch (err) {
    console.error('Telegram notification error:', err);
    return false;
  }
}

export async function notifyNewChildRegistration(data: TelegramRegistrationPayload): Promise<boolean> {
  const receiptBadge = data.hasReceipt
    ? '✅ <b>Receipt Uploaded</b> (Transfer screenshot attached)'
    : '⏳ <b>No receipt image attached</b>';

  const message = `
🌲 <b>NEW CHILD REGISTRATION RECEIVED</b> 🏕️
━━━━━━━━━━━━━━━━━━━━
👶 <b>Camper:</b> ${data.childName} (Age: ${data.age})
🆔 <b>Registration Ref:</b> <code>#${data.camperId}</code>
📅 <b>Date & Time:</b> ${data.registrationTime}

🏷️ <b>Program:</b> ${data.program}
🗓️ <b>Attendance Preference:</b> ${data.sessionChoice}
🚌 <b>Transportation:</b> ${data.transport}
📍 <b>Pickup Area:</b> ${data.pickupArea || 'Venue drop-off (Gulele gate)'}

💳 <b>PAYMENT DETAILS:</b>
• <b>Method:</b> ${data.paymentMethod}
• <b>Status:</b> ${data.paymentStatus}
• <b>Receipt Status:</b> ${receiptBadge}

👨‍👩‍👧 <b>PARENT & EMERGENCY:</b>
• <b>Parent:</b> ${data.parentName}
• <b>Phone:</b> ${data.parentPhone}
• <b>Email:</b> ${data.parentEmail}
• <b>Emergency:</b> ${data.emergencyContact}
━━━━━━━━━━━━━━━━━━━━
👉 <i>Open the Director Portal to review records, examine receipt evidence, and provide digital sign-off.</i>
`.trim();

  return await sendTelegramMessage(message);
}

export async function notifyPaymentAndStatusUpdate(data: TelegramPaymentUpdatePayload): Promise<boolean> {
  const message = `
💰 <b>PAYMENT & STATUS UPDATE RECORDED</b> 🌲
━━━━━━━━━━━━━━━━━━━━
👶 <b>Camper:</b> ${data.childName}
🆔 <b>Registration Ref:</b> <code>#${data.camperId}</code>
👨‍👩‍👧 <b>Parent:</b> ${data.parentName}
🕒 <b>Updated At:</b> ${data.updateTime}

💵 <b>Payment Status:</b> <b>${data.paymentStatus.toUpperCase()}</b>
💵 <b>Amount Received:</b> <b>${data.amountReceived ? `${data.amountReceived} ETB` : 'Not specified'}</b>
🧾 <b>Payment Reference:</b> <code>${data.paymentReference || 'None'}</code>

📋 <b>Director Review Decision:</b> <b>${data.directorStatus}</b>
✍️ <b>Reviewed By:</b> ${data.directorName}
━━━━━━━━━━━━━━━━━━━━
✅ <i>Updated in live Driftwood database.</i>
`.trim();

  return await sendTelegramMessage(message);
}
