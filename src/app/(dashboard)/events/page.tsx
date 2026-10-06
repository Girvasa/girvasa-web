"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Calendar, Users, MapPin } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { endpoints } from "@/lib/api/endpoints";
import { EventResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatDate } from "@/lib/utils";

export default function EventsPage() {
  const { activeSocietyId } = useTenant();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.events.getEvents();
      setEvents(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load society events.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Community Events</h1>
        <p className="text-xs text-slate-500 mt-1">
          Festival celebrations, AGM meetings, cultural programs, and society gatherings.
        </p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchEvents} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
          No upcoming community events scheduled.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((evt) => (
            <Card key={evt.id} className="hover:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-600 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {formatDate(evt.eventDate)}
                </span>
                <Badge variant="info">
                  <Users className="w-3 h-3 mr-1" />
                  {evt.rsvpCount ?? 0} RSVPs
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{evt.description}</p>
              {evt.venue && (
                <div className="mt-4 flex items-center text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>{evt.venue}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
