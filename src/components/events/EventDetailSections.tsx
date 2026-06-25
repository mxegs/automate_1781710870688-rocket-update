'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import EventAccordionSection from '@/components/events/EventAccordionSection';
import { getCampusLabel } from '@/lib/church/constants';
import type { ChurchEvent } from '@/lib/events/types';

interface EventDetailSectionsProps {
  event: ChurchEvent;
}

function InfoParagraphs({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text.split(/\n\n+/).map((para, i) => (
        <p key={i}>{para.trim()}</p>
      ))}
    </div>
  );
}

export default function EventDetailSections({ event }: EventDetailSectionsProps) {
  const venueLabel =
    event.venueName || event.location || getCampusLabel(event.campus);
  const venueLines = [event.venueAddress, event.venueCity].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <EventAccordionSection title="Event Info" icon="InformationCircleIcon" defaultOpen>
        <p className="font-bold text-cloud text-base mb-2">{event.title}</p>
        <p className="font-semibold text-cloud/80 mb-3">
          Date &amp; time: {event.date} · {event.time}
        </p>
        {event.eventInfo ? (
          <InfoParagraphs text={event.eventInfo} />
        ) : (
          <p className="text-cloud/50">More details coming soon.</p>
        )}
      </EventAccordionSection>

      <EventAccordionSection title="Venue & Location" icon="MapPinIcon">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-cloud">{venueLabel}</p>
            {venueLines.map((line) => (
              <p key={line} className="text-cloud/60 mt-1">
                {line}
              </p>
            ))}
            {!venueLines.length && event.location && (
              <p className="text-cloud/60 mt-1">{event.location}</p>
            )}
          </div>
          {event.venueDirectionsUrl && (
            <a
              href={event.venueDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-rose-400/40 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
            >
              <Icon name="ArrowTopRightOnSquareIcon" size={14} variant="outline" />
              Directions
            </a>
          )}
        </div>
      </EventAccordionSection>

      <EventAccordionSection
        title="Important Info"
        icon="ExclamationCircleIcon"
        iconClassName="text-amber-400"
      >
        {event.importantInfo ? (
          <InfoParagraphs text={event.importantInfo} />
        ) : (
          <p className="text-cloud/50">No additional information for this event.</p>
        )}
      </EventAccordionSection>
    </div>
  );
}
