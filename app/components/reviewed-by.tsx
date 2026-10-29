import { getMessages } from "../lib/messages";
import { REVIEWER } from "../lib/reviewer";

/** "Content reviewed by …" under a calculator, the Budget page or a guide. */
export async function ReviewedBy({ className = "" }: { className?: string }) {
  const { t } = await getMessages();
  return (
    <p className={`text-xs leading-5 text-muted ${className}`}>
      {t.footer.reviewed.replace("{reviewer}", REVIEWER)}
    </p>
  );
}
