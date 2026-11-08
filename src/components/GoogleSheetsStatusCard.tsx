import React, { useState, useEffect } from 'react';
import { Table, ExternalLink, CheckCircle2, RefreshCw, Database, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { getOrCreateCampSpreadsheet, GoogleSheetsDbConfig } from '../lib/googleSheetsDb.ts';

export const GoogleSheetsStatusCard: React.FC = () => {
  const { driveAccessToken, connectGoogleDrive } = useAuth();
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsDbConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initSheetsDb = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const cfg = await getOrCreateCampSpreadsheet(token);
      setSheetsConfig(cfg);
    } catch (err: any) {
      console.error('Failed to connect Google Sheets database:', err);
      setError(err.message || 'Could not access or create Google Spreadsheet database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (driveAccessToken) {
      initSheetsDb(driveAccessToken);
    }
  }, [driveAccessToken]);

  const handleConnectSheets = async () => {
    setError(null);
    try {
      const token = await connectGoogleDrive();
      if (token) {
        await initSheetsDb(token);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authorize Google Sheets.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#112d20] to-[#1a4430] rounded-2xl text-white p-5 sm:p-6 shadow-md border border-emerald-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Primary Database</span>
              <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-700/60 font-semibold">
                Google Sheets Engine
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
              Google Sheets Live Database
            </h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              All camper registrations, payment records, and activity logs are stored directly in your Google Spreadsheet.
            </p>
          </div>
        </div>

        {!driveAccessToken ? (
          <button
            onClick={handleConnectSheets}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Database className="w-4 h-4 text-stone-900" />
            <span>Connect Google Sheets Database</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sheets DB Connected
            </span>
            <button
              onClick={() => driveAccessToken && initSheetsDb(driveAccessToken)}
              className="p-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 transition-colors"
              title="Sync Database with Google Sheets"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {sheetsConfig && (
        <div className="pt-3 border-t border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200/90 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60">
          <div className="flex items-center gap-2 truncate">
            <Table className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate font-mono">Spreadsheet ID: {sheetsConfig.spreadsheetId}</span>
          </div>

          <a
            href={sheetsConfig.spreadsheetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold shrink-0 underline"
          >
            <span>Open Driftwood Camp Spreadsheet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
