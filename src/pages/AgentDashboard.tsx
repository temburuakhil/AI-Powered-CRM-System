import { useState, useEffect } from 'react';
import { Phone, RefreshCw, Download, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RetellCall {
  call_id: string;
  call_type: 'web_call' | 'phone_call';
  call_status: string;
  start_timestamp: number;
  end_timestamp?: number;
  duration_ms?: number;
  from_number?: string;
  to_number?: string;
  disconnection_reason?: string;
  call_analysis?: {
    user_sentiment?: string;
    call_successful?: boolean;
  };
  transcript?: string;
  recording_url?: string;
  cost?: number;
  lead_score?: number;
}

export default function AgentDashboard() {
  const [calls, setCalls] = useState<RetellCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchRetellCalls(true); // Show loading on initial fetch
    // Poll for updates every 30 seconds in background
    const interval = setInterval(() => fetchRetellCalls(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRetellCalls = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      console.log('📞 Fetching calls from Retell AI...');
      
      const response = await fetch('/api/retell/list-calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Retell calls received:', result.total || 0);
      
      if (result.success && result.calls) {
        setCalls(result.calls);
      } else {
        setError('Failed to fetch calls from Retell AI');
      }
    } catch (error) {
      console.error('❌ Error fetching calls:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const exportToCSV = () => {
    if (calls.length === 0) {
      alert('No calls to export');
      return;
    }

    // CSV columns: Time, Call Duration, Disconnection Reason, Call Status, User Sentiment, From, To, Call Successful, Transcript, Call Recordings, Lead Score (AI)
    const headers = [
      'Time',
      'Call Duration',
      'Disconnection Reason',
      'Call Status',
      'User Sentiment',
      'From',
      'To',
      'Call Successful',
      'Transcript',
      'Call Recordings',
      'Lead Score (AI)'
    ];

    const rows = calls.map(call => [
      formatTimestamp(call.start_timestamp),
      formatDuration(call.duration_ms),
      call.disconnection_reason || '-',
      call.call_status || '-',
      call.call_analysis?.user_sentiment || '-',
      call.from_number || '-',
      call.to_number || '-',
      call.call_analysis?.call_successful ? 'Yes' : 'No',
      call.transcript ? `"${call.transcript.replace(/"/g, '""')}"` : '-',
      call.recording_url || '-',
      call.lead_score || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `retell_calls_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (durationMs?: number): string => {
    if (!durationMs) return '-';
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'failed': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'ongoing': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'ongoing': return <Clock className="w-4 h-4 animate-pulse" />;
      default: return <Phone className="w-4 h-4" />;
    }
  };

  // Calculate real-time statistics
  const calculateStats = () => {
    const totalCalls = calls.length;
    const completedCalls = calls.filter(c => c.call_status === 'ended').length;
    const missedCalls = calls.filter(c => c.call_status === 'not_connected' || c.disconnection_reason === 'dial_no_answer').length;
    const incomingCalls = calls.filter(c => c.call_type === 'phone_call').length;
    
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration_ms || 0), 0);
    const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;
    
    const successfulCalls = calls.filter(c => c.call_analysis?.call_successful === true).length;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls * 100).toFixed(1) : '0';
    
    // Calculate lead scores
    const hotLeads = calls.filter(c => c.lead_score && c.lead_score >= 8).length;
    const warmLeads = calls.filter(c => c.lead_score && c.lead_score >= 5 && c.lead_score < 8).length;
    const coldLeads = calls.filter(c => c.lead_score && c.lead_score < 5).length;

    return {
      totalCalls,
      completedCalls,
      missedCalls,
      incomingCalls,
      avgDuration,
      successRate,
      hotLeads,
      warmLeads,
      coldLeads
    };
  };

  // Prepare chart data (calls per day)
  const prepareChartData = () => {
    const callsByDate = new Map<string, { date: string; calls: number; successful: number; missed: number }>();
    
    calls.forEach(call => {
      const date = new Date(call.start_timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = callsByDate.get(date) || { date, calls: 0, successful: 0, missed: 0 };
      
      existing.calls += 1;
      if (call.call_analysis?.call_successful) existing.successful += 1;
      if (call.call_status === 'not_connected') existing.missed += 1;
      
      callsByDate.set(date, existing);
    });

    return Array.from(callsByDate.values()).slice(-14); // Last 14 days
  };

  // Pagination
  const totalPages = Math.ceil(calls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCalls = calls.slice(startIndex, endIndex);

  const stats = calculateStats();
  const chartData = prepareChartData();
  
  // Debug logging
  console.log('🔍 Dashboard State:', {
    callsCount: calls.length,
    loading,
    error,
    statsTotal: stats.totalCalls,
    chartDataPoints: chartData.length,
    currentPage,
    totalPages
  });

  return (
    <div className="min-h-screen bg-[#0d1117] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#e6edf3] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              Agent Dashboard
            </h1>
            <p className="text-[#7d8590] mt-1">Monitor all voice call activities from Retell AI</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRetellCalls(true)}
              className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[#e6edf3] hover:bg-[#30363d] transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </>
              )}
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white transition-colors flex items-center gap-2"
              disabled={loading || calls.length === 0}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Calls */}
          <Card className="bg-[#161b22] border-[#30363d] p-6 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7d8590]">Total Calls</p>
                <h3 className="text-3xl font-bold text-[#e6edf3] mt-2">{stats.totalCalls}</h3>
                <p className="text-xs text-[#7d8590] mt-1">All time</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Phone className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Completed Calls */}
          <Card className="bg-[#161b22] border-[#30363d] p-6 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7d8590]">Completed</p>
                <h3 className="text-3xl font-bold text-[#e6edf3] mt-2">{stats.completedCalls}</h3>
                <p className="text-xs text-green-400 mt-1">Success rate: {stats.successRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </Card>

          {/* Missed Calls */}
          <Card className="bg-[#161b22] border-[#30363d] p-6 hover:border-red-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7d8590]">Missed Calls</p>
                <h3 className="text-3xl font-bold text-[#e6edf3] mt-2">{stats.missedCalls}</h3>
                <p className="text-xs text-[#7d8590] mt-1">No answer</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </Card>

          {/* Average Duration */}
          <Card className="bg-[#161b22] border-[#30363d] p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7d8590]">Avg Duration</p>
                <h3 className="text-3xl font-bold text-[#e6edf3] mt-2">{Math.round(stats.avgDuration / 1000)}s</h3>
                <p className="text-xs text-[#7d8590] mt-1">Per call</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Lead Quality Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#161b22] border-[#30363d] p-6 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7d8590]">Hot Leads</p>
                <h3 className="text-2xl font-bold text-[#e6edf3] mt-2">{stats.hotLeads}</h3>
                <p className="text-xs text-emerald-400 mt-1">Score: 8-10</p>
              </div>
              <div className="text-3xl">🔥</div>
            </div>
          </Card>

          <Card className="bg-[#161b22] border-[#30363d] p-6 hover:border-yellow-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7d8590]">Warm Leads</p>
                <h3 className="text-2xl font-bold text-[#e6edf3] mt-2">{stats.warmLeads}</h3>
                <p className="text-xs text-yellow-400 mt-1">Score: 5-7</p>
              </div>
              <div className="text-3xl">☀️</div>
            </div>
          </Card>

          <Card className="bg-[#161b22] border-[#30363d] p-6 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7d8590]">Cold Leads</p>
                <h3 className="text-2xl font-bold text-[#e6edf3] mt-2">{stats.coldLeads}</h3>
                <p className="text-xs text-cyan-400 mt-1">Score: 1-4</p>
              </div>
              <div className="text-3xl">❄️</div>
            </div>
          </Card>
        </div>

        {/* Call Trends Chart */}
        <Card className="bg-[#0d1117] border-[#30363d] p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#e6edf3]">Call Trends</h2>
            <p className="text-sm text-[#7d8590] mt-1">Daily call activity over the last 14 days</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis 
                  dataKey="date" 
                  stroke="#7d8590"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#7d8590"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#161b22', 
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    color: '#e6edf3'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#e6edf3' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Total Calls"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="successful" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Successful"
                  dot={{ fill: '#10b981', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="missed" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Missed"
                  dot={{ fill: '#ef4444', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-medium">Error</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Call Records Table */}
        <Card className="bg-[#0d1117] border-[#30363d] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#30363d]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#e6edf3]">Call History</h2>
                <p className="text-sm text-[#7d8590] mt-1">
                  All calls from Retell AI ({calls.length} total) • Page {currentPage} of {totalPages} • 20 per page
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#010409] border-b border-[#30363d]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                    Call Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                    Disconnection Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                    Call Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                    User Sentiment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                    Call Successful
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                    Transcript
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                    Call Recordings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#7d8590] uppercase tracking-wider">
                    Lead Score (AI)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-8 text-center text-[#7d8590]">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5 animate-spin" />
                        Loading calls from Retell AI...
                      </div>
                    </td>
                  </tr>
                ) : calls.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-8 text-center text-[#7d8590]">
                      No calls found. Click Refresh to load calls from Retell AI.
                    </td>
                  </tr>
                ) : (
                  paginatedCalls.map((call) => (
                    <tr key={call.call_id} className="hover:bg-[#161b22] transition-colors">
                      {/* Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#e6edf3]">
                          {formatTimestamp(call.start_timestamp)}
                        </span>
                      </td>

                      {/* Call Duration */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#e6edf3]">
                          {formatDuration(call.duration_ms)}
                        </span>
                      </td>

                      {/* Disconnection Reason */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#7d8590]">
                          {call.disconnection_reason || '-'}
                        </span>
                      </td>

                      {/* Call Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(call.call_status)}`}>
                          {getStatusIcon(call.call_status)}
                          <span className="ml-1.5">{call.call_status}</span>
                        </span>
                      </td>

                      {/* User Sentiment */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#e6edf3]">
                          {call.call_analysis?.user_sentiment || '-'}
                        </span>
                      </td>

                      {/* From */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#7d8590]">
                          {call.from_number || '-'}
                        </span>
                      </td>

                      {/* To */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#7d8590]">
                          {call.to_number || '-'}
                        </span>
                      </td>

                      {/* Call Successful */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {call.call_analysis?.call_successful !== undefined ? (
                          call.call_analysis.call_successful ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )
                        ) : (
                          <span className="text-sm text-[#7d8590]">-</span>
                        )}
                      </td>

                      {/* Transcript */}
                      <td className="px-6 py-4 max-w-md">
                        {call.transcript ? (
                          <button
                            onClick={() => {
                              setSelectedTranscript(call.transcript || '');
                              setIsDialogOpen(true);
                            }}
                            className="text-left text-sm text-[#58a6ff] hover:text-[#79c0ff] hover:underline cursor-pointer line-clamp-2"
                          >
                            {call.transcript}
                          </button>
                        ) : (
                          <span className="text-sm text-[#7d8590] italic">No transcript available</span>
                        )}
                      </td>

                      {/* Call Recordings */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {call.recording_url ? (
                          <a
                            href={call.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-sm rounded-md transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Download
                          </a>
                        ) : (
                          <span className="text-sm text-[#7d8590]">-</span>
                        )}
                      </td>

                      {/* Lead Score - MOVED TO LAST */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {call.lead_score ? (
                            <>
                              <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg ${
                                call.lead_score >= 8 ? 'bg-green-500/20 text-green-400 border-2 border-green-500' :
                                call.lead_score >= 6 ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500' :
                                call.lead_score >= 4 ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500' :
                                'bg-red-500/20 text-red-400 border-2 border-red-500'
                              }`}>
                                {call.lead_score}
                              </div>
                              <div className="text-xs text-[#7d8590]">
                                {call.lead_score >= 8 ? 'Hot' :
                                 call.lead_score >= 6 ? 'Warm' :
                                 call.lead_score >= 4 ? 'Cold' :
                                 'Poor'}
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-[#7d8590]">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {calls.length > 0 && (
            <div className="px-6 py-4 border-t border-[#30363d] flex items-center justify-between">
              <div className="text-sm text-[#7d8590]">
                Showing <span className="font-medium text-[#e6edf3]">{startIndex + 1}</span> to{' '}
                <span className="font-medium text-[#e6edf3]">{Math.min(endIndex, calls.length)}</span> of{' '}
                <span className="font-medium text-[#e6edf3]">{calls.length}</span> calls
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[#e6edf3] hover:bg-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 
                      ? i + 1 
                      : currentPage >= totalPages - 2 
                        ? totalPages - 4 + i 
                        : currentPage - 2 + i;
                    
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:bg-[#30363d]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[#e6edf3] hover:bg-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Transcript Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#0d1117] border-[#30363d] text-[#e6edf3]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#e6edf3] flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Full Transcript
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                <p className="text-sm text-[#e6edf3] whitespace-pre-wrap leading-relaxed">
                  {selectedTranscript}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
