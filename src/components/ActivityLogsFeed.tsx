import React, { useState, useEffect } from 'react';
import { Radio, Search, Filter, Clock, CheckCircle2, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { ActivityLog, Camper } from '../types.ts';
import { subscribeActivityLogs } from '../lib/db.ts';
import { filterActivityLogs } from '../utils/camp-rules.ts';

interface ActivityLogsFeedProps {
  camperId?: string; // If provided, limits feed to this camper
  campers?: Camper[];
  title?: string;
  subtitle?: string;
}

export const ActivityLogsFeed: React.FC<ActivityLogsFeedProps> = ({
  camperId,
  campers = [],
  title = 'Real-Time Camp Activity Stream',
  subtitle = 'Live attendance, milestones, and safety updates from camp organizers',
}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedCamper, setSelectedCamper] = useState<string>(camperId || 'all');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    setLoading(true);
    const targetCamper = camperId || (selectedCamper !== 'all' ? selectedCamper : undefined);
    const unsubscribe = subscribeActivityLogs((newLogs) => {
      setLogs(newLogs);
      setLoading(false);
      setLastUpdated(new Date());
    }, targetCamper);

    return () => unsubscribe();
  }, [camperId, selectedCamper]);

  const filteredLogs = filterActivityLogs(logs, camperId || selectedCamper, attendanceFilter, searchQuery);

  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case 'Arrived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <UserCheck className="w-3 h-3" /> Arrived
          </span>
        );
      case 'Attended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Attended
          </span>
        );
      case 'Checked out':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Clock className="w-3 h-3" /> Checked Out
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3" /> Update
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1b3d2d] to-[#25523d] text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-300" />
                {title}
              </h3>
            </div>
            <p className="text-xs text-emerald-100/80 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-200 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-700/50 self-start sm:self-auto">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-300' : 'text-emerald-300'}`} />
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-4 pt-3 border-t border-emerald-800/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {/* Camper selection filter (only shown if not bound to single camper) */}
          {!camperId && (
            <div>
              <label className="block text-[11px] font-medium text-emerald-200 mb-1">Filter Camper</label>
              <select
                value={selectedCamper}
                onChange={(e) => setSelectedCamper(e.target.value)}
                className="w-full bg-[#122b1f] text-white rounded-lg px-2.5 py-1.5 border border-emerald-700/70 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="all">All Campers</option>
                {campers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.childName} (#{c.id.slice(0, 5)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-emerald-200 mb-1">Status Type</label>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="w-full bg-[#122b1f] text-white rounded-lg px-2.5 py-1.5 border border-emerald-700/70 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="all">All Statuses</option>
              <option value="Arrived">Arrived</option>
              <option value="Attended">Attended</option>
              <option value="Checked out">Checked out</option>
              <option value="Update">Update</option>
            </select>
          </div>

          <div className={camperId ? 'sm:col-span-2' : ''}>
            <label className="block text-[11px] font-medium text-emerald-200 mb-1">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Trail, knot, snack, lunch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#122b1f] text-white rounded-lg pl-7 pr-3 py-1.5 border border-emerald-700/70 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-emerald-300/40"
              />
              <Search className="w-3.5 h-3.5 text-emerald-400/70 absolute left-2 top-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Feed list */}
      <div className="p-4 sm:p-5 max-h-[500px] overflow-y-auto space-y-3 divide-y divide-stone-100">
        {loading && logs.length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-700 mb-2" />
            <p className="text-sm font-medium">Connecting to real-time activity stream...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <Filter className="w-8 h-8 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-medium text-stone-700">No activity logs found</p>
            <p className="text-xs text-stone-400 mt-1">
              Organizer updates will appear here automatically in real time.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="pt-3 first:pt-0 group hover:bg-stone-50/80 p-3 rounded-xl transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">{log.camperName}</span>
                  <span className="text-xs text-stone-400">·</span>
                  <span className="text-xs font-semibold text-emerald-800">{log.activity}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getAttendanceBadge(log.attendance)}
                  <span className="text-[11px] text-stone-400 font-mono">
                    {log.activityDate}
                  </span>
                </div>
              </div>

              <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 border-l-3 border-amber-400 px-3 py-2 rounded-r-lg">
                {log.note}
              </p>

              <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2">
                <span>Posted by: <strong className="text-stone-600 font-medium">{log.createdBy}</strong></span>
                <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-stone-50 px-4 py-2.5 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
        <span>Showing {filteredLogs.length} updates</span>
        <span className="text-[11px] text-emerald-700 font-medium">● Firestore Live Sync Enabled</span>
      </div>
    </div>
  );
};
