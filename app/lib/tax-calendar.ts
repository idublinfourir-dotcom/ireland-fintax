/* The home page's tax calendar: filing and payment dates, each checked on
   28 Oct 2026 against the Revenue page it links to. The page shows the dates
   still ahead in Irish time, so nothing here goes stale on its own, but the
   list does run out: the last entry is 31 January 2028.

   To keep it going:
   - Add the 2027 ROS extension (Form 11 for 2026) once Revenue announces it,
     usually in an eBrief early in the year; 2026's was eBrief 034/26.
   - Add each further year's dates before the list runs dry.

   Company dates assume a 31 December year end, the common case; the copy
   says so. Copy for each kind is in messages/home.ts (calendar.kinds). */

export type DeadlineKind =
  | "payFile"
  | "rosExtension"
  | "prelimCt"
  | "prelimCtFirst"
  | "ct1"
  | "cgtInitial"
  | "cgtLater";

export interface Deadline {
  /** Due date, YYYY-MM-DD. */
  date: string;
  kind: DeadlineKind;
  /** The Revenue page that states the date. */
  source: string;
}

const SOURCES = {
  selfAssessment: "https://www.revenue.ie/en/self-assessment-and-self-employment/filing-your-tax-return/index.aspx",
  rosExtension2026: "https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-0342026.aspx",
  preliminaryCt:
    "https://www.revenue.ie/en/companies-and-charities/corporation-tax-for-companies/corporation-tax-payment-and-filing/when-is-preliminary-ct-due.aspx",
  ct1: "https://www.revenue.ie/en/companies-and-charities/corporation-tax-for-companies/corporation-tax-payment-and-filing/payment-and-filing.aspx",
  cgt: "https://www.revenue.ie/en/gains-gifts-and-inheritance/transfering-an-asset/when-and-how-do-you-pay-and-file-cgt.aspx",
};

export const DEADLINES: readonly Deadline[] = [
  // Form 11 for 2025 and preliminary tax for 2026, paper or non-ROS.
  { date: "2026-10-31", kind: "payFile", source: SOURCES.selfAssessment },
  // Only when both the return and the payment go through ROS (eBrief 034/26).
  { date: "2026-11-18", kind: "rosExtension", source: SOURCES.rosExtension2026 },
  // 23rd of the 11th month: a small company's single payment, a large one's second.
  { date: "2026-11-23", kind: "prelimCt", source: SOURCES.preliminaryCt },
  // Gains made 1 January to 30 November.
  { date: "2026-12-15", kind: "cgtInitial", source: SOURCES.cgt },
  // Gains made in December 2026.
  { date: "2027-01-31", kind: "cgtLater", source: SOURCES.cgt },
  // 23rd of the 6th month, large companies only.
  { date: "2027-06-23", kind: "prelimCtFirst", source: SOURCES.preliminaryCt },
  // 23rd of the 9th month after a 31 December 2026 year end.
  { date: "2027-09-23", kind: "ct1", source: SOURCES.ct1 },
  { date: "2027-10-31", kind: "payFile", source: SOURCES.selfAssessment },
  { date: "2027-11-23", kind: "prelimCt", source: SOURCES.preliminaryCt },
  { date: "2027-12-15", kind: "cgtInitial", source: SOURCES.cgt },
  { date: "2028-01-31", kind: "cgtLater", source: SOURCES.cgt },
];

/** Today's date in Ireland, YYYY-MM-DD: a deadline is open all of its day there. */
export function irishToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Dublin" }).format(now);
}

/** The deadlines on or after `today` (YYYY-MM-DD), soonest first. */
export function upcomingDeadlines(today: string, list: readonly Deadline[] = DEADLINES): Deadline[] {
  return list.filter((d) => d.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}
