import type { OrvoxEvent } from "@/lib/data/types";
import { formatDateRange, formatINR } from "@/lib/utils";

/**
 * Generates a factual FAQ for an event purely from its structured data.
 *
 * These power both the visible FAQ section (AEO — readers and AI get direct
 * answers) and FAQPage schema (rich-result eligible). Every answer is a concise,
 * self-contained fact so an answer engine can quote it verbatim with attribution.
 */
export function buildEventFaq(event: OrvoxEvent): { q: string; a: string }[] {
  const dates = formatDateRange(event.startDate, event.endDate);
  const deadline = new Date(event.registrationDeadline).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const seatsLeft = event.seatsTotal - event.seatsFilled;
  const modeLabel =
    event.mode === "Online" ? "fully online" : event.mode === "Hybrid" ? "hybrid (online qualifiers plus an on-site final)" : "on-site";

  const faq: { q: string; a: string }[] = [
    {
      q: `What is ${event.title}?`,
      a: `${event.title} is a ${event.format} ${event.track === "debate" ? "debate" : event.track === "speaking" ? "public speaking" : event.track === "pitch" ? "pitch" : "writing"} competition organised by ORVOX for ${event.eligibility.toLowerCase()} students. ${event.summary}`,
    },
    {
      q: `When does ${event.title} take place?`,
      a: `${event.title} runs ${dates}. Registration closes on ${deadline}.`,
    },
    {
      q: `Where is ${event.title} held?`,
      a:
        event.mode === "Online"
          ? `${event.title} is held ${modeLabel}, so you can compete from anywhere.`
          : `${event.title} is ${modeLabel}, held at ${event.venue} in ${event.city}.`,
    },
    {
      q: `Who is eligible to enter ${event.title}?`,
      a: `${event.eligibilityDetails.join(" ")}`,
    },
    {
      q: `How much does it cost to enter ${event.title}?`,
      a: `Entry is free. Register on the event page and you'll get confirmation by email${seatsLeft > 0 ? `. There are currently ${seatsLeft} of ${event.seatsTotal} seats left` : "; the event is currently full, so registration adds you to the waitlist"}.`,
    },
    {
      q: `What format and rules does ${event.title} follow?`,
      a: `${event.format}. ${event.rules.slice(0, 2).join(" ")}`,
    },
  ];

  if (event.prizePool) {
    faq.push({
      q: `What can you win at ${event.title}?`,
      a: `${event.title} has a total prize pool of ${formatINR(event.prizePool)}, plus published standings and written adjudicator feedback for every speaker.`,
    });
  }

  return faq;
}

/**
 * One-sentence factual summary ("quick answer" / definition block) for the top
 * of an event page — the snippet most likely to be lifted into an AI Overview.
 */
export function eventQuickAnswer(event: OrvoxEvent): string {
  const dates = formatDateRange(event.startDate, event.endDate);
  const where =
    event.mode === "Online" ? "online" : `${event.mode === "Hybrid" ? "online and in " : "in "}${event.city}`;
  return `${event.title} is a free ${event.format} ${event.track === "debate" ? "debate" : event.track === "speaking" ? "public speaking" : event.track === "pitch" ? "pitch" : "writing"} competition by ORVOX for ${event.eligibility.toLowerCase()} students, held ${dates} ${where}. Standings and adjudicator feedback publish within minutes of each round.`;
}
