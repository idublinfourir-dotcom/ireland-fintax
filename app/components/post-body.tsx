import Link from "next/link";
import type { ReactNode } from "react";
import { parseLines, type Inline } from "../lib/inline-format";
import type { Block } from "../lib/post-blocks";
import { imageSize, imageUrl, type PostImage } from "../lib/post-types";

/* A blog post's blocks as React elements. Shared by the public post page
   (server) and the editor's preview (client): no hooks, no server-only
   imports, so it renders in either.

   Every piece of text becomes a React text node, so React escapes all of it.
   There is deliberately no dangerouslySetInnerHTML anywhere on this path; see
   lib/inline-format.ts.

   The blocks are grid items of a `.post-grid` (globals.css) that the caller
   provides: a reading column with room either side, which a wide picture or
   gallery steps out into with `.post-wide`. */

/** A post picture. Plain <img>: uploads come from this site and the rest from
    Unsplash, and the site has no next/image remote config. Its width and
    height attributes reserve the space before the file arrives, so the text
    around it does not jump. */
export function PostImg({
  image,
  width,
  alt,
  className = "",
  eager = false,
}: {
  image: PostImage;
  /** Roughly how wide it is drawn, to pick the file size. */
  width: number;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const size = imageSize(image) ?? {};
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl(image, width)}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      {...size}
      className={className}
    />
  );
}

const linkCls =
  "font-medium text-primary-600 underline decoration-primary-300 underline-offset-4 transition-colors duration-200 hover:text-primary-500 hover:decoration-primary-500";

function renderInline(nodes: Inline[]): ReactNode[] {
  return nodes.map((node, i) => {
    switch (node.type) {
      case "text":
        return node.value;
      case "break":
        return <br key={i} />;
      case "strong":
        return (
          <strong key={i} className="font-semibold text-ink">
            {renderInline(node.children)}
          </strong>
        );
      case "em":
        return <em key={i}>{renderInline(node.children)}</em>;
      case "code":
        return (
          <code key={i} className="bg-surface-muted px-1.5 py-0.5 font-mono text-[0.88em] text-ink">
            {node.value}
          </code>
        );
      case "link":
        if (node.external) {
          return (
            <a key={i} href={node.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
              {renderInline(node.children)}
            </a>
          );
        }
        return node.href.startsWith("/") ? (
          <Link key={i} href={node.href} className={linkCls}>
            {renderInline(node.children)}
          </Link>
        ) : (
          <a key={i} href={node.href} className={linkCls}>
            {renderInline(node.children)}
          </a>
        );
    }
  });
}

/** Text with inline formatting, newlines kept as line breaks. */
export function RichText({ text }: { text: string }) {
  return <>{renderInline(parseLines(text))}</>;
}

const body = "mt-6 text-[1.0625rem] leading-8 text-ink-body sm:text-lg sm:leading-[1.8]";

function Caption({ text }: { text: string }) {
  if (!text) return null;
  return (
    <figcaption className="mt-3 text-sm leading-6 text-muted">
      <RichText text={text} />
    </figcaption>
  );
}

function BlockView({ block, anchor }: { block: Block; anchor?: string }): ReactNode {
  switch (block.type) {
    case "paragraph":
      return block.text ? (
        <p className={body}>
          <RichText text={block.text} />
        </p>
      ) : null;

    case "heading":
      if (!block.text) return null;
      return block.level === 2 ? (
        <h2
          id={anchor}
          className="mt-14 scroll-mt-28 font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-balance text-ink sm:text-[2rem]"
        >
          <RichText text={block.text} />
        </h2>
      ) : (
        <h3
          id={anchor}
          className="mt-10 scroll-mt-28 font-display text-xl font-semibold leading-snug tracking-tight text-ink sm:text-2xl"
        >
          <RichText text={block.text} />
        </h3>
      );

    case "image":
      if (!block.image) return null;
      return (
        <figure className={`mt-10 ${block.size === "wide" ? "post-wide" : ""}`}>
          <PostImg
            image={block.image}
            width={block.size === "wide" ? 1600 : 1200}
            alt={block.alt}
            className="h-auto w-full bg-surface-muted"
          />
          <Caption text={block.caption} />
        </figure>
      );

    case "gallery":
      if (block.items.length === 0) return null;
      return (
        <figure className="post-wide mt-10">
          <div
            className={`grid gap-3 ${
              block.items.length === 1
                ? ""
                : block.items.length === 2 || block.items.length === 4
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {block.items.map((item, i) => (
              <PostImg
                key={i}
                image={item.image}
                width={900}
                alt={item.alt}
                className="aspect-[4/3] h-full w-full bg-surface-muted object-cover"
              />
            ))}
          </div>
          <Caption text={block.caption} />
        </figure>
      );

    case "quote":
      if (!block.text) return null;
      return (
        <figure className="mt-12 border-l-2 border-primary-500 pl-6 sm:pl-8">
          <blockquote className="font-display text-2xl font-medium leading-snug tracking-tight text-ink sm:text-[1.75rem]">
            <RichText text={block.text} />
          </blockquote>
          {block.cite && (
            <figcaption className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-muted">
              {block.cite}
            </figcaption>
          )}
        </figure>
      );

    case "callout":
      if (!block.text && !block.title) return null;
      return (
        <aside className="mt-10 border-l-2 border-primary-500 bg-primary-50/70 px-6 py-5 sm:px-7 sm:py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">
            {block.title || "Key point"}
          </p>
          {block.text && (
            <p className="mt-2 text-[1.0625rem] leading-8 text-ink">
              <RichText text={block.text} />
            </p>
          )}
        </aside>
      );

    case "list": {
      const items = block.items.filter(Boolean);
      if (items.length === 0) return null;
      const lis = items.map((item, i) => (
        <li key={i} className="pl-1.5">
          <RichText text={item} />
        </li>
      ));
      return block.style === "number" ? (
        <ol className={`${body} list-decimal space-y-2 pl-6 marker:font-semibold marker:text-primary-500`}>
          {lis}
        </ol>
      ) : (
        <ul className={`${body} list-disc space-y-2 pl-6 marker:text-primary-500`}>{lis}</ul>
      );
    }

    case "table": {
      const [head, ...rows] = block.rows;
      if (!head || block.rows.flat().every((c) => !c)) return null;
      return (
        <div className="mt-10 overflow-x-auto border border-line">
          <table className="w-full border-collapse text-[15px] leading-6">
            <thead className="bg-surface-muted">
              <tr>
                {head.map((cell, c) => (
                  <th key={c} scope="col" className="px-4 py-3 text-left font-semibold text-ink">
                    <RichText text={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r} className="border-t border-line">
                  {row.map((cell, c) => (
                    <td key={c} className="px-4 py-3 align-top text-ink-body tabular-nums">
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "divider":
      return (
        <div role="separator" className="my-14 flex justify-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500/70" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500/70" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500/70" />
        </div>
      );

    case "pagebreak":
      // Pages are split before rendering; a break never reaches the page.
      return null;
  }
}

/** The blocks of one page, as children for a `.post-grid`. */
export function PostBlocks({
  blocks,
  anchors,
}: {
  blocks: Block[];
  anchors: Map<string, string>;
}) {
  return (
    <>
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} anchor={anchors.get(block.id)} />
      ))}
    </>
  );
}
