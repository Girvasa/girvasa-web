"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Vote, Shield, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { endpoints } from "@/lib/api/endpoints";
import { PollResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";

export default function PollsPage() {
  const { activeSocietyId } = useTenant();
  const [polls, setPolls] = useState<PollResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.polls.getPolls();
      setPolls(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load society polls.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Resident Polls & Voting</h1>
        <p className="text-xs text-slate-500 mt-1">
          Democratic society resolutions, feedback surveys, and anonymous ballots.
        </p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchPolls} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : polls.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
          No active polls conducted in this society.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => {
            const total = poll.totalVotes || poll.options?.reduce((sum, o) => sum + (o.voteCount || 0), 0) || 0;

            return (
              <Card key={poll.id} className="hover:border-slate-300">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={poll.isActive ? "success" : "neutral"}>
                    {poll.isActive ? "Active Ballot" : "Closed"}
                  </Badge>
                  {poll.isAnonymous && (
                    <span className="flex items-center text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      <Shield className="w-3 h-3 mr-1" />
                      Anonymous Voting
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{poll.question}</h3>
                {poll.description && (
                  <p className="text-xs text-slate-500 mt-1 mb-4">{poll.description}</p>
                )}

                <div className="space-y-3 mt-4">
                  {poll.options?.map((opt) => {
                    const count = opt.voteCount || 0;
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                    return (
                      <div key={opt.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">{opt.optionText}</span>
                          <span className="font-semibold text-slate-900">
                            {count} votes ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Total votes recorded: {total}</span>
                  {poll.isAnonymous && (
                    <span className="text-slate-400 italic">Voter identities securely anonymized</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
