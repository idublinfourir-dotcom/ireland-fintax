import Link from "./locale-link";
import { EN } from "./blog";
import { getT } from "../lib/messages";
import { calcMessages } from "../lib/messages/calc";
import { getPublishedTitle } from "../lib/posts";

/** "Read the guide" under a calculator, to the post that explains it.
    Renders nothing unless the post is published, so a draft never shows. */
export async function GuideLink({ slug }: { slug: string }) {
  const title = await getPublishedTitle(slug);
  if (!title) return null;
  const [before, after] = (await getT(calcMessages)).guideLink.split("{title}");
  return (
    <p className="mt-2 text-sm leading-6 text-muted">
      {before}
      <Link
        href={`/blog/${slug}`}
        className="font-semibold text-primary-600 transition-colors duration-200 hover:text-primary-500"
      >
        <span {...EN}>{title}</span>
      </Link>
      {after}
    </p>
  );
}
