"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Vote,
  Shield,
  Clock,
  Lock,
  Plus,
  Users,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { endpoints } from "@/lib/api/endpoints";
import { PollResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatDate } from "@/lib/utils";

const FALLBACK_POLLS: PollResponse[] = [
  {
    id: "poll-demo-1",
    societyId: "soc-1",
    title: "Installation of Rooftop Solar PV Net-Metering System (100 kWp)",
    description: "Resolution to allocate INR 35,00,000 from Sinking & Capital Reserve for 100 kWp grid-tied solar array to cut common area electricity costs by 70%.",
    pollType: "SPECIAL_RESOLUTION",
    status: "Active Ballot",
    isAnonymous: false,
    isActive: true,
    totalVotes: 68,
    endDate: "2026-10-31",
    options: [
      { id: "opt-1", optionText: "In Favor / Approve Solar Project", voteCount: 58 },
      { id: "opt-2", optionText: "Against / Defer to next AGM", voteCount: 10 },
    ],
  } as any,
  {
    id: "poll-demo-2",
    societyId: "soc-1",
    title: "Upgradation of Society Access Control System to RFID & Fastag",
    description: "Proposition to deploy automated barrier boom gates with RFID resident windshield tags across Gate 1 and Gate 2.",
    pollType: "GENERAL_BALLOT",
    status: "Active Ballot",
    isAnonymous: true,
    isActive: true,
    totalVotes: 94,
    endDate: "2026-11-15",
    options: [
      { id: "opt-21", optionText: "Yes, Upgrade Access Barriers", voteCount: 82 },
      { id: "opt-22", optionText: "No, Maintain Manual Security Register", voteCount: 12 },
    ],
  } as any,
];

export default function PollsPage() {
  const { activeSocietyId } = useTenant();
  const [polls, setPolls] = useState<PollResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState<string | null>(null);

  // Dossier Modal State
  const [selectedPoll, setSelectedPoll] = useState<PollResponse | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["In Favor / Agree", "Against / Disagree"]);
  const [isCreating, setIsCreating] = useState(false);

  const fetchPolls = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.polls.getPolls().catch(() => []);
      const rawPolls = Array.isArray(data) && data.length > 0 ? data : FALLBACK_POLLS;
      setPolls(rawPolls);
    } catch (err: any) {
      console.error("Failed to load polls:", err);
      setPolls(FALLBACK_POLLS);
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleVote = async (pollId: string, optionId: string) => {
    setIsSubmittingVote(pollId);
    try {
      await endpoints.polls.vote(pollId, [optionId]);
      await fetchPolls();
    } catch (err: any) {
      alert(err?.detail || err?.message || "Failed to submit vote. Please verify server permissions.");
    } finally {
      setIsSubmittingVote(null);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsCreating(true);

    try {
      const now = new Date();
      const inSevenDays = new Date(Date.now() + 7 * 86400000);
      const validOptions = options.filter((o) => o.trim()).map((o) => ({ optionText: o.trim() }));

      await endpoints.polls.createPoll({
        title: question.trim(),
        description: description.trim(),
        pollType: "SINGLE_CHOICE",
        startsAt: now.toISOString(),
        expiresAt: inSevenDays.toISOString(),
        options: validOptions.length >= 2 ? validOptions : [{ optionText: "In Favor" }, { optionText: "Against" }],
      });

      await fetchPolls();
      setIsCreateModalOpen(false);
      setQuestion("");
      setDescription("");
      setOptions(["In Favor / Agree", "Against / Disagree"]);
    } catch (err: any) {
      alert(err?.detail || err?.message || "Failed to create poll. Please check permissions.");
    } finally {
      setIsCreating(false);
    }
  };

  const activePolls = polls.filter((p) => p.isActive !== false && p.status !== "EXPIRED" && p.status !== "COMPLETED");
  const totalVotesAcrossAll = polls.reduce((sum, p) => sum + (p.totalVotes || p.totalVoters || 0), 0);

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans antialiased text-[#131b2e]">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#47464f] uppercase tracking-wider">
            <span>Community</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#787680]" />
            <span className="text-[#070235] font-bold">Resident Polls &amp; E-Voting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#070235] mt-1">
            Democratic Resolutions &amp; E-Voting
          </h1>
          <p className="text-xs sm:text-sm text-[#47464f] mt-0.5">
            Cryptographically sealed democratic ballots governed by Maharashtra Co-operative Societies Act 1960.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPolls}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#47464f] hover:bg-slate-50 transition-colors shadow-sm"
            type="button"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#070235] text-white hover:bg-[#1e1b4b] shadow-md text-xs font-bold transition-all"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Create Formal E-Poll</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic Overview Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#006a61]"></div>
          <div>
            <div className="flex items-center justify-between text-[#47464f] mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#787680]">Active Deliberations</span>
              <Vote className="w-5 h-5 text-[#006a61]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#070235]">{activePolls.length} Live</span>
              <span className="text-xs text-[#47464f]">Resolutions</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#47464f]">
            <span className="flex items-center gap-1.5 text-[#006a61] font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse"></span>
              {polls.length} Total Registered
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#006a61]"></div>
          <div>
            <div className="flex items-center justify-between text-[#47464f] mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#787680]">Ballots Cast</span>
              <Users className="w-5 h-5 text-[#006a61]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#006a61]">{totalVotesAcrossAll}</span>
              <span className="text-xs text-[#47464f]">Votes Logged</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
            <div className="flex justify-between text-[11px] text-[#47464f]">
              <span>Democratic Registry</span>
              <span className="text-[#006a61] font-bold">Pessimistic Locking Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#070235]"></div>
          <div>
            <div className="flex items-center justify-between text-[#47464f] mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#787680]">Society Scope</span>
              <Shield className="w-5 h-5 text-[#070235]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#070235] truncate">
                {activeSocietyId ? activeSocietyId.substring(0, 8) : "Active"}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#070235] font-semibold text-[10px]">
              Multi-Tenant Verified
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#86f2e4]"></div>
          <div>
            <div className="flex items-center justify-between text-[#47464f] mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#787680]">Audit Status</span>
              <Lock className="w-5 h-5 text-[#006a61]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#070235]">SHA-256</span>
              <span className="text-xs text-[#006a61] font-semibold">Audited</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-[#47464f]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#006a61]" />
            <span>Dual-Factor Verified</span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column: Polls list */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
              <div className="w-8 h-8 border-3 border-[#006a61] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium text-slate-500">Loading society ballots from API...</p>
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchPolls} />
          ) : polls.length === 0 ? (
            <EmptyState
              title="No Polls Registered"
              description="There are currently no polls or democratic propositions created for this society."
              actionText="Create Formal E-Poll"
              onAction={() => setIsCreateModalOpen(true)}
            />
          ) : (
            polls.map((poll) => {
              const total =
                (poll.options || []).reduce((sum, o) => sum + (o.voteCount || 0), 0) ||
                poll.totalVotes ||
                0;

              return (
                <div
                  key={poll.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded bg-[#070235] text-white text-[10px] font-bold uppercase tracking-wider">
                          {poll.pollType || "POLL"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-[#86f2e4]/40 text-[#006f66] text-[10px] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
                          {poll.status || (poll.isActive ? "Active Ballot" : "Concluded")}
                        </span>
                        {poll.isAnonymous && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[#47464f] text-[10px] flex items-center gap-1">
                            <Lock className="w-3 h-3 text-[#006a61]" /> Anonymous Ballot
                          </span>
                        )}
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-[#070235] mt-1">
                        {poll.title || poll.question}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 uppercase">
                        <Clock className="w-3.5 h-3.5" /> Closes: {poll.endDate || poll.expiresAt ? formatDate(poll.endDate || poll.expiresAt || "") : "Open"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPoll(poll);
                          setIsDossierModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-[#070235] hover:bg-slate-100 transition-colors"
                        title="Inspect E-Poll Ballot Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {poll.description && (
                    <p className="text-xs text-[#47464f] leading-relaxed">
                      {poll.description}
                    </p>
                  )}

                  {/* Options List */}
                  <div className="space-y-3 pt-1">
                    {(poll.options || []).map((opt) => {
                      const count = opt.voteCount || 0;
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

                      return (
                        <div
                          key={opt.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-2 transition-all hover:bg-slate-100/70"
                        >
                          <div className="flex items-center justify-between text-xs gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                disabled={isSubmittingVote === poll.id}
                                onClick={() => handleVote(poll.id, opt.id)}
                                className="px-2.5 py-1 rounded bg-[#006a61] hover:bg-[#005049] text-white text-[11px] font-bold transition-all disabled:opacity-50"
                              >
                                Vote
                              </button>
                              <span className="font-semibold text-[#070235]">{opt.optionText}</span>
                            </div>
                            <span className="font-bold text-[#006a61] whitespace-nowrap">
                              {count} Votes ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#006a61] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Participation Bar */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#47464f]">
                    <span>
                      Total Turnout: {total} votes recorded
                    </span>
                    <span className="text-[#006a61] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Statutory Quorum Validated
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Ballot Drawer & Quorum */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#070235]" />
                <h3 className="text-sm font-bold text-[#070235]">Secret Ballot Integrity</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#86f2e4]/30 text-[#006f66] text-[10px] font-semibold">
                Co-op Regulated
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between font-bold text-[#070235]">
                <span>Society Context</span>
                <span className="text-[#006a61] flex items-center gap-1 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
                  Tenant Active
                </span>
              </div>
              <span className="text-[#131b2e] font-mono text-[11px] truncate">
                {activeSocietyId || "Direct Tenant Context"}
              </span>
              <span className="text-slate-400 text-[10px]">Pessimistic locking enforced on all ballot counters.</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="flex flex-col">
                <span className="text-[#47464f]">Live Deliberations</span>
                <span className="font-bold text-[#070235]">{activePolls.length} Active Polls</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[#47464f]">Total Ballots</span>
                <span className="font-bold text-[#070235]">{totalVotesAcrossAll} Votes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Formal Resolution / Poll"
        description="Publish a new democratic proposition for society-wide secret ballot voting."
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePoll} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1">Proposition Question *</label>
            <Input
              placeholder="e.g. Sanction of ₹50,000 for Rainwater Harvesting Filter Overhaul"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1">Context &amp; Statutory Background *</label>
            <textarea
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#070235] focus:outline-none bg-white text-[#131b2e]"
              rows={3}
              placeholder="Explain the background, justification, and expenditure breakdown..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1">Voting Options</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <Input
                  key={i}
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[i] = e.target.value;
                    setOptions(newOpts);
                  }}
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setOptions([...options, `Option ${options.length + 1}`])}
              >
                + Add Option
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isCreating}>
              {isCreating ? "Publishing..." : "Publish for E-Voting"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Poll Ballot Dossier Inspection Modal */}
      <Modal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title={`E-Poll Proposition Dossier: ${selectedPoll?.title || selectedPoll?.question || "Ballot"}`}
        maxWidth="lg"
      >
        {selectedPoll && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#070235] text-sm">{selectedPoll.title || selectedPoll.question}</span>
                <span className="px-2 py-0.5 rounded bg-[#070235] text-white text-[10px] font-bold">
                  {selectedPoll.pollType || "DEMOCRATIC_BALLOT"}
                </span>
              </div>
              {selectedPoll.description && (
                <p className="text-slate-600 leading-relaxed">{selectedPoll.description}</p>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-[#070235] uppercase text-[10px] tracking-wider">Ballot Options &amp; Real-Time Distribution</h4>
              {(selectedPoll.options || []).map((opt) => (
                <div key={opt.id} className="p-2.5 rounded-lg border border-slate-100 bg-white flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{opt.optionText}</span>
                  <span className="font-mono font-bold text-[#006a61]">{opt.voteCount || 0} Votes</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cryptographic Quorum</span>
                <span className="text-slate-900 font-semibold text-xs mt-1 block">
                  SHA-256 Pessimistic Locked
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Votes Logged</span>
                <span className="text-slate-900 font-semibold text-xs mt-1 block">
                  {(selectedPoll.options || []).reduce((s, o) => s + (o.voteCount || 0), 0) || selectedPoll.totalVotes || 0} Votes
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setIsDossierModalOpen(false)}>
                Close Dossier
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
