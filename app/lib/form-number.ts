/* A number typed into an admin form. A blank (or a File) is NaN, not 0, so
   every editor's Number.isFinite check refuses it instead of saving a zero
   rate. Number("") is 0, which is the bug this exists to stop. */
export const formNumber = (v: FormDataEntryValue | null): number =>
  Number(String(v ?? "").trim() || NaN);
