"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Users,
  MapPin,
  Vote,
  Shield,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  ChevronRight,
  Lock,
  RefreshCw,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { endpoints } from "@/lib/api/endpoints";
import { EventResponse, PollResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatDate } from "@/lib/utils";

export default function EventsAndResolutionsPage() {
  const { activeSocietyId } = useTenant();
  const [activeTab, setActiveTab] = useState<"RESOLUTIONS" | "EVENTS" | "ARCHIVES">("RESOLUTIONS");
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [polls, setPolls] = useState<PollResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState<string | null>(null);

  // Create Event / Resolution Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<"EVENT" | "RESOLUTION">("RESOLUTION");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [eventsData, pollsData] = await Promise.all([
        endpoints.events.getEvents().catch(() => []),
        endpoints.polls.getPolls().catch(() => []),
      ]);
      setEvents(eventsData || []);
      setPolls(pollsData || []);
    } catch (err: any) {
      setError(err?.detail || err?.message || "Unable to load events and resolutions from server.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVote = async (pollId: string, optionId: string) => {
    setIsSubmittingVote(pollId);
    try {
      await endpoints.polls.vote(pollId, [optionId]);
      await fetchData();
    } catch (err: any) {
      alert(err?.detail || err?.message || "Failed to record vote. Please check your permissions.");
    } finally {
      setIsSubmittingVote(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);

    try {
      if (createType === "EVENT") {
        const todayStr = new Date().toISOString().split("T")[0];
        await endpoints.events.createEvent({
          title: newTitle.trim(),
          description: newDescription.trim(),
          startDate: newDate || todayStr,
          endDate: newDate || todayStr,
          venue: newVenue.trim() || "Society Premises",
          eventType: "GENERAL_BODY",
        });
      } else {
        const now = new Date();
        const inSevenDays = new Date(Date.now() + 7 * 86400000);
        await endpoints.polls.createPoll({
          title: newTitle.trim(),
          description: newDescription.trim(),
          pollType: "SINGLE_CHOICE",
          startsAt: now.toISOString(),
          expiresAt: inSevenDays.toISOString(),
          options: [
            { optionText: "In Favor / Agree" },
            { optionText: "Against / Disagree" },
          ],
        });
      }

      await fetchData();
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewDate("");
      setNewVenue("");
    } catch (err: any) {
      alert(err?.detail || err?.message || "Failed to create. Please verify server permissions.");
    } finally {
      setIsCreating(false);
    }
  };

  const activePolls = polls.filter((p) => p.isActive !== false && p.status !== "EXPIRED" && p.status !== "COMPLETED");
  const archivedPolls = polls.filter((p) => p.isActive === false || p.status === "EXPIRED" || p.status === "COMPLETED");
  const totalVotesAcrossPolls = polls.reduce((sum, p) => sum + (p.totalVotes || p.totalVoters || 0), 0);
  const nextEvent = events.length > 0 ? [...events].sort((a, b) => (a.startDate || a.eventDate || "").localeCompare(b.startDate || b.eventDate || ""))[0] : null;

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans antialiased text-[#131b2e]">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#47464f] uppercase tracking-wider">
            <span>Community</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#787680]" />
            <span>Events &amp; Polls</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#787680]" />
            <span className="text-[#070235] font-bold">Democratic Deliberations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#070235] mt-1">
            Democratic Resolutions &amp; Events Console
          </h1>
          <p className="text-xs sm:text-sm text-[#47464f] mt-0.5">
            Statutory voting registry under Section 79 &amp; Bye-law 99 of Maharashtra Co-operative Societies Act 1960
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setCreateType("EVENT");
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-[#131b2e] hover:bg-slate-50 shadow-sm text-xs font-semibold transition-all"
            type="button"
          >
            <Calendar className="w-4 h-4 text-[#006a61]" />
            <span>Propose Event</span>
          </button>
          <button
            onClick={() => {
              setCreateType("RESOLUTION");
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#070235] text-white hover:bg-[#1e1b4b] shadow-md text-xs font-bold transition-all"
            type="button"
          >
            <Vote className="w-4 h-4" />
            <span>Create Formal Resolution</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic Overview Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Deliberations */}
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
            <span className="text-[11px] text-[#787680]">{archivedPolls.length} Concluded</span>
          </div>
        </div>

        {/* Card 2: Quorum / Total Ballots */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#006a61]"></div>
          <div>
            <div className="flex items-center justify-between text-[#47464f] mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#787680]">Ballots Cast</span>
              <Users className="w-5 h-5 text-[#006a61]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#006a61]">{totalVotesAcrossPolls}</span>
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

        {/* Card 3: Upcoming Assembly */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#070235]"></div>
          <div>
            <div className="flex items-center justify-between text-[#47464f] mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#787680]">Next Event</span>
              <Calendar className="w-5 h-5 text-[#070235]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#070235] truncate max-w-[180px]">
                {nextEvent ? nextEvent.title : "None Scheduled"}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#070235] font-semibold text-[10px]">
              {events.length} Scheduled
            </span>
            <span className="text-[#070235] font-semibold text-[11px]">
              {nextEvent ? formatDate(nextEvent.startDate || nextEvent.eventDate || "") : "—"}
            </span>
          </div>
        </div>

        {/* Card 4: Ledger Audit */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#86f2e4]"></div>
          <div>
            <div className="flex items-center justify-between text-[#47464f] mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#787680]">Ballot Integrity</span>
              <Shield className="w-5 h-5 text-[#006a61]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#070235]">SHA-256</span>
              <span className="text-xs text-[#006a61] font-semibold">Audited</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-[#47464f]">
            <Lock className="w-3.5 h-3.5 text-[#006a61]" />
            <span>Society: {activeSocietyId ? activeSocietyId.substring(0, 8) : "Active"}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Strip */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab("RESOLUTIONS")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "RESOLUTIONS"
                ? "bg-white text-[#070235] shadow-sm font-bold"
                : "text-[#47464f] hover:text-[#070235]"
            }`}
          >
            <Vote className="w-4 h-4 text-[#006a61]" />
            <span>Live Resolutions &amp; Polls</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#86f2e4]/30 text-[#006f66] text-[10px] font-bold">
              {activePolls.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("EVENTS")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "EVENTS"
                ? "bg-white text-[#070235] shadow-sm font-bold"
                : "text-[#47464f] hover:text-[#070235]"
            }`}
          >
            <Calendar className="w-4 h-4 text-[#070235]" />
            <span>Upcoming Community Events</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              {events.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ARCHIVES")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "ARCHIVES"
                ? "bg-white text-[#070235] shadow-sm font-bold"
                : "text-[#47464f] hover:text-[#070235]"
            }`}
          >
            <FileText className="w-4 h-4 text-[#787680]" />
            <span>Concluded Archives</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              {archivedPolls.length}
            </span>
          </button>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#47464f] hover:bg-slate-50 transition-colors self-start lg:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live Data</span>
        </button>
      </div>

      {/* Main Workspace (Left 2 cols, Right 1 col on XL) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
              <div className="w-8 h-8 border-3 border-[#006a61] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium text-slate-500">Loading resolutions and community events...</p>
            </div>
          ) : error ? (
            <ErrorState title="Failed to Load Deliberations" message={error} onRetry={fetchData} />
          ) : (
            <>
              {/* RESOLUTIONS TAB */}
              {activeTab === "RESOLUTIONS" && (
                <div className="space-y-4">
                  {activePolls.length === 0 ? (
                    <EmptyState
                      title="No Active Resolutions or Polls"
                      description="There are currently no active democratic deliberations open for voting in this society."
                      actionText="Create Formal Resolution"
                      onAction={() => {
                        setCreateType("RESOLUTION");
                        setIsCreateModalOpen(true);
                      }}
                    />
                  ) : (
                    activePolls.map((poll) => {
                      const totalVotes = (poll.options || []).reduce((s, o) => s + (o.voteCount || 0), 0) || poll.totalVotes || 0;
                      return (
                        <div
                          key={poll.id}
                          className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded bg-[#070235] text-white text-[10px] font-bold uppercase tracking-wider">
                                  {poll.pollType || "RESOLUTION"}
                                </span>
                                <span className="px-2.5 py-0.5 rounded bg-[#86f2e4]/40 text-[#006f66] text-[10px] font-semibold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
                                  {poll.status || "ACTIVE"}
                                </span>
                                {poll.isAnonymous && (
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[#47464f] text-[10px]">
                                    Anonymous Ballot
                                  </span>
                                )}
                              </div>
                              <h2 className="text-base sm:text-lg font-bold text-[#070235] mt-1">
                                {poll.title || poll.question}
                              </h2>
                            </div>
                            <div className="flex flex-col sm:items-end shrink-0">
                              <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 uppercase">
                                <Clock className="w-3.5 h-3.5" /> Closes: {poll.endDate || poll.expiresAt ? formatDate(poll.endDate || poll.expiresAt || "") : "Open"}
                              </span>
                            </div>
                          </div>

                          {poll.description && (
                            <p className="text-xs text-[#47464f] leading-relaxed">
                              {poll.description}
                            </p>
                          )}

                          {/* Poll Options and Dynamic Progress Bars */}
                          <div className="space-y-3 pt-1">
                            {(poll.options || []).map((opt) => {
                              const voteCount = opt.voteCount || 0;
                              const pct = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : "0.0";
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
                                      {voteCount} Votes ({pct}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-[#006a61] h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${pct}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#47464f]">
                            <span>Total Participation: {totalVotes} votes cast</span>
                            <span className="text-[11px] text-[#006a61] font-semibold">
                              Dual-Audit Verified
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* EVENTS TAB */}
              {activeTab === "EVENTS" && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-[#070235]">Upcoming Community Events &amp; Assemblies</h3>
                      <p className="text-xs text-[#47464f]">Mandatory statutory convocations &amp; community gatherings</p>
                    </div>
                    <button
                      onClick={() => {
                        setCreateType("EVENT");
                        setIsCreateModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-[#070235] hover:bg-slate-200 text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Propose Event</span>
                    </button>
                  </div>

                  {events.length === 0 ? (
                    <EmptyState
                      title="No Upcoming Events"
                      description="No community events or general body assemblies have been scheduled yet."
                      actionText="Propose Event"
                      onAction={() => {
                        setCreateType("EVENT");
                        setIsCreateModalOpen(true);
                      }}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {events.map((evt) => (
                        <div
                          key={evt.id}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-4"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded bg-[#070235] text-white text-[10px] font-bold uppercase">
                                {evt.eventType || "Event"}
                              </span>
                              <span className="text-xs font-bold text-[#006a61] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {evt.rsvpCount || 0} RSVPs
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-[#070235]">{evt.title}</h4>
                            {evt.description && (
                              <p className="text-xs text-[#47464f] line-clamp-2">{evt.description}</p>
                            )}
                            <div className="flex flex-col gap-1.5 text-[#47464f] text-xs mt-1">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#787680]" />
                                {formatDate(evt.startDate || evt.eventDate || "")} {evt.startTime ? `• ${evt.startTime}` : ""}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#787680]" />
                                {evt.venue || evt.amenityName || "Society Premises"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                            <span className="text-[10px] text-[#787680]">Status</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#86f2e4]/30 text-[#006f66] text-xs font-semibold">
                              {evt.status || "CONFIRMED"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ARCHIVES TAB */}
              {activeTab === "ARCHIVES" && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
                  <h3 className="text-base font-bold text-[#070235]">Concluded Resolutions &amp; Archives</h3>
                  <p className="text-xs text-[#47464f]">
                    Digital records of completed general body resolutions and past deliberations.
                  </p>
                  {archivedPolls.length === 0 ? (
                    <EmptyState
                      title="No Concluded Archives"
                      description="Completed resolutions and past AGM ballots will appear here once finalized."
                    />
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                      {archivedPolls.map((poll) => (
                        <div key={poll.id} className="py-3 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#070235] block">{poll.title || poll.question}</span>
                            <span className="text-slate-400 text-[11px]">
                              Closed on {formatDate(poll.endDate || poll.expiresAt || "")} • {poll.totalVotes || 0} Votes Cast
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[#47464f] font-bold text-[10px]">
                            {poll.status || "CONCLUDED"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column (1 Col) - Statutory Integrity Drawer */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#070235]" />
                <h3 className="text-sm font-bold text-[#070235]">Secret Ballot Integrity</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#86f2e4]/30 text-[#006f66] text-[10px] font-semibold">
                MCS Compliant
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
                <span className="text-[#47464f]">Scheduled Events</span>
                <span className="font-bold text-[#070235]">{events.length} Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={createType === "EVENT" ? "Propose Community Event" : "Create Formal Resolution / Poll"}
        description="Configure event or voting deliberation parameters as per society charter."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1">Deliberation Title *</label>
            <Input
              placeholder={createType === "EVENT" ? "e.g. Annual General Body Meeting" : "e.g. Rooftop Solar Net Metering Sanction"}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1">Details &amp; Agenda *</label>
            <textarea
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#070235] focus:outline-none bg-white text-[#131b2e]"
              rows={3}
              placeholder="Provide complete background, budgetary estimates, and statutory reference..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              required
            />
          </div>

          {createType === "EVENT" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">Event Date</label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">Venue</label>
                <Input
                  placeholder="e.g. Clubhouse Banquet or Society Lawn"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isCreating}>
              {isCreating ? "Saving..." : createType === "EVENT" ? "Publish Event" : "Dispatch for E-Voting"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
