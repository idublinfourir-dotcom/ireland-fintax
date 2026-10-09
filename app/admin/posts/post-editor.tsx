"use client";

/* The blog post editor: title and summary at the top like a document, the body
   as blocks underneath (block-editor.tsx), and publishing, category and cover
   in the sidebar. Preview shows the post as the public page will.

   Every field is controlled, and the form submits through onSubmit rather
   than <form action>, so React's automatic form reset never fires on an
   editor someone has spent an hour writing in. The body and the cover travel
   as JSON in hidden inputs and are rebuilt field by field on the server. */

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { PostBlocks, PostImg } from "../../components/post-body";
import {
  headingAnchors,
  readingMinutes,
  splitPages,
  type Block,
} from "../../lib/post-blocks";
import {
  DEFAULT_COVER,
  POST_CATEGORIES,
  POST_CATEGORY_LABELS,
  postSlug,
  type PostCategory,
  type PostImage,
  type PostStatus,
} from "../../lib/post-types";
import { POST_LIMITS, type PostField } from "../../lib/post-validation";
import {
  deletePostAction,
  savePostAction,
  type DeleteState,
  type PostFormState,
} from "./actions";
import { BlockEditor, newId } from "./block-editor";
import { ImagePicker } from "./image-picker";

export interface EditorPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: PostCategory;
  cover: PostImage;
  blocks: Block[];
  status: PostStatus;
  live: boolean;
  slugLocked: boolean;
}

const IDLE: PostFormState = { status: "idle" };

const panel = "border border-line bg-white p-5";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";
const primaryBtn =
  "inline-flex h-10 cursor-pointer items-center justify-center bg-primary-500 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60";
const outlineBtn =
  "inline-flex h-10 cursor-pointer items-center justify-center border border-line px-5 text-sm font-semibold text-ink-body transition-colors duration-200 hover:border-ink/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-primary-600">
      {message}
    </p>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={`text-[11px] tabular-nums ${value.length > max ? "font-semibold text-primary-600" : "text-muted"}`}>
      {value.length}/{max}
    </span>
  );
}

/** A borderless textarea that grows with its text: the title and summary. */
function Grow(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value]);
  return <textarea ref={ref} rows={1} {...props} />;
}

/** A new post starts with one empty paragraph, ready to type in. */
const starterBlocks = (): Block[] => [{ id: newId(), type: "paragraph", text: "" }];

export function PostEditor({
  post,
  notice,
}: {
  post: EditorPost | null;
  /** One-off confirmation carried over from the first save of a new post. */
  notice?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  // A new post's slug follows its title until someone edits the slug itself.
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [category, setCategory] = useState<string>(post?.category ?? POST_CATEGORIES[0].value);
  const [cover, setCover] = useState<PostImage>(post?.cover ?? DEFAULT_COVER);
  const [pickingCover, setPickingCover] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>(() =>
    post && post.blocks.length > 0 ? post.blocks : starterBlocks(),
  );
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const values = { title, slug, excerpt, category, cover, blocks };
  const snapshot = JSON.stringify(values);
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot);
  const submitted = useRef(values);
  const dirty = snapshot !== savedSnapshot;

  const [state, formAction, pending] = useActionState(
    async (prev: PostFormState, formData: FormData): Promise<PostFormState> => {
      const result = await savePostAction(prev, formData);
      if (result.status === "saved" && result.saved) {
        const { saved } = result;
        // The server tidies the slug ("Budget 2027" → "budget-2027").
        setSlug(saved.slug);
        setSavedSnapshot(JSON.stringify({ ...submitted.current, slug: saved.slug }));
        if (result.created) router.replace(`/admin/posts/${saved.id}?saved=${saved.status}`);
      }
      return result;
    },
    IDLE,
  );

  // Redirects to the list on success, so only a failure ever comes back.
  const [deleteState, deleteAction, deleting] = useActionState<DeleteState, FormData>(deletePostAction, {});

  // Warn before a reload or a closed tab throws away unsaved writing.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const current = state.saved ?? post;
  const status: PostStatus = current?.status ?? "draft";
  const live = current?.live ?? false;
  const slugLocked = current?.slugLocked ?? false;
  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const invalid = (f: PostField) => (errors[f] ? true : undefined);
  const busy = pending || deleting;

  const note =
    state.status === "idle"
      ? notice
        ? { tone: "saved" as const, text: notice }
        : null
      : { tone: state.status, text: state.message ?? "" };

  function onTitleChange(value: string) {
    const oneLine = value.replace(/\n/g, " ");
    setTitle(oneLine);
    if (!slugTouched && !slugLocked) setSlug(postSlug(oneLine));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const formData = new FormData(e.currentTarget, submitter);
    if (submitter?.value === "delete") {
      startTransition(() => deleteAction(formData));
      return;
    }
    submitted.current = values;
    startTransition(() => formAction(formData));
  }

  const pages = splitPages(blocks);
  const anchors = headingAnchors(blocks);

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="cover" value={JSON.stringify(cover)} />
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
      <input type="hidden" name="category" value={category} />

      {/* ── the document ── */}
      <div className="min-w-0 border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div role="tablist" aria-label="Editor mode" className="flex border border-line">
            {(["write", "preview"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`h-8 cursor-pointer px-4 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ${
                  mode === m ? "bg-navy-900 text-white" : "text-muted hover:text-ink"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted">
            {readingMinutes(blocks)} min read
            {pages.length > 1 && ` · ${pages.length} pages`}
          </span>
        </div>

        <div hidden={mode !== "write"}>
          <div className="mx-auto max-w-[44rem] px-14 pb-6 pt-10">
            <Grow
              name="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Post title"
              aria-label="Title"
              aria-invalid={invalid("title")}
              className="block w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-display text-[2.25rem] font-bold leading-[1.1] tracking-[-0.02em] text-ink placeholder:text-muted/40 focus:outline-none"
            />
            <div className="mt-1 flex justify-end">
              <Counter value={title} max={POST_LIMITS.title} />
            </div>
            <FieldError id="title-error" message={errors.title} />

            <Grow
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value.replace(/\n/g, " "))}
              placeholder="Summary: one or two sentences. It shows under the title, on the blog page and in search results."
              aria-label="Summary"
              aria-invalid={invalid("excerpt")}
              className="mt-3 block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-lg leading-8 text-ink-body placeholder:text-muted/50 focus:outline-none"
            />
            <div className="mt-1 flex justify-end">
              <Counter value={excerpt} max={POST_LIMITS.excerpt} />
            </div>
            <FieldError id="excerpt-error" message={errors.excerpt} />

            <div className="mt-4 flex items-stretch text-xs">
              <span className="inline-flex items-center border border-r-0 border-line bg-surface-muted px-2.5 text-muted">
                /blog/
              </span>
              <input
                name="slug"
                value={slug}
                readOnly={slugLocked}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="web-address"
                aria-label="Web address"
                aria-invalid={invalid("slug")}
                className="h-8 w-full border border-line bg-white px-2.5 font-mono text-xs text-ink focus:border-primary-400 focus:outline-none read-only:bg-surface-muted read-only:text-muted"
              />
            </div>
            {slugLocked ? (
              <p className="mt-1.5 text-[11px] text-muted">
                Locked: this post has been live, so its address stays put for anyone who linked to it.
              </p>
            ) : (
              <FieldError id="slug-error" message={errors.slug} />
            )}
          </div>

          <div className="mx-auto max-w-[44rem] border-t border-line px-14 pb-10 pt-8">
            {errors.blocks && (
              <p role="alert" className="mb-5 border-l-2 border-primary-500 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-600">
                {errors.blocks}
              </p>
            )}
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          </div>
        </div>

        {mode === "preview" && (
          <div className="pb-12">
            <div className="mx-auto max-w-2xl px-6 pb-8 pt-10 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-500">
                {POST_CATEGORY_LABELS[category as PostCategory] ?? "Category"}
                <span className="text-muted"> · {readingMinutes(blocks)} min read</span>
              </p>
              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-[-0.025em] text-balance text-ink">
                {title || "Post title"}
              </h1>
              {excerpt && <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-ink-body">{excerpt}</p>}
            </div>
            <div className="px-6">
              <PostImg image={cover} width={1400} alt="" className="aspect-[2/1] w-full object-cover" />
            </div>
            {pages.map((page, i) => (
              <div key={i}>
                {i > 0 && (
                  <p className="mx-6 mt-14 border-t-2 border-dashed border-primary-300 pt-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-600">
                    Page {i + 1}
                  </p>
                )}
                <div className="post-grid mt-10 [&>:first-child]:mt-0">
                  <PostBlocks blocks={page} anchors={anchors} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── the sidebar ── */}
      <div className="flex flex-col gap-5 lg:sticky lg:top-24">
        <div className={panel}>
          <div className="flex items-center justify-between gap-3">
            <span className={labelCls}>Status</span>
            <span
              className={`px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                live ? "bg-primary-500 text-white" : "bg-surface-muted text-muted"
              }`}
            >
              {live ? "Live" : "Draft"}
            </span>
          </div>
          {live && current && (
            <Link
              href={`/blog/${current.slug}`}
              target="_blank"
              className="mt-2 inline-block text-xs font-semibold text-primary-600 hover:text-primary-500"
            >
              View on the site <span aria-hidden="true">↗</span>
            </Link>
          )}
          <div className="mt-4 flex flex-col gap-2">
            {status === "published" ? (
              <>
                <button type="submit" name="intent" value="save" disabled={busy} className={primaryBtn}>
                  {pending ? "Saving…" : "Save changes"}
                </button>
                <button type="submit" name="intent" value="unpublish" disabled={busy} className={outlineBtn}>
                  Unpublish
                </button>
              </>
            ) : (
              <>
                <button type="submit" name="intent" value="publish" disabled={busy} className={primaryBtn}>
                  {pending ? "Saving…" : "Publish"}
                </button>
                <button type="submit" name="intent" value="save" disabled={busy} className={outlineBtn}>
                  Save draft
                </button>
              </>
            )}
          </div>
          <p aria-live="polite" className="mt-3 min-h-4 text-xs font-medium">
            {/* An error stays until the next submit; a "saved" note gives way
                to "Unsaved changes" as soon as anything is edited after it. */}
            {!pending && note?.tone === "error" && <span className="text-primary-600">{note.text}</span>}
            {!pending && note?.tone !== "error" && dirty && <span className="text-muted">Unsaved changes</span>}
            {!pending && note?.tone === "saved" && !dirty && (
              <span className="text-secondary-600">✓ {note.text}</span>
            )}
          </p>
        </div>

        <div className={panel}>
          <label htmlFor="category" className={labelCls}>
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-invalid={invalid("category")}
            className="h-10 w-full border border-line bg-white px-3 text-sm text-ink focus:border-primary-400 focus:outline-none"
          >
            {POST_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <FieldError id="category-error" message={errors.category} />
        </div>

        <div className={panel}>
          <span className={labelCls}>Cover picture</span>
          {pickingCover ? (
            <ImagePicker
              compact
              onPick={([image]) => {
                setCover(image);
                setPickingCover(false);
              }}
              onCancel={() => setPickingCover(false)}
            />
          ) : (
            <>
              <PostImg image={cover} width={600} alt="" className="aspect-[16/10] w-full bg-surface-muted object-cover" />
              <button
                type="button"
                onClick={() => setPickingCover(true)}
                className="mt-2 inline-flex h-8 cursor-pointer items-center border border-line px-3 text-xs font-semibold text-ink-body hover:border-ink/30 hover:text-ink"
              >
                Change cover
              </button>
            </>
          )}
          <FieldError id="cover-error" message={errors.cover} />
        </div>

        {/* Delete is two clicks on purpose: the first only reveals the real
            button. In-page rather than window.confirm, which blocks the tab. */}
        {post && (
          <div className={panel}>
            <span className={labelCls}>Delete</span>
            <p className="text-xs leading-5 text-muted">
              Removes the post from the blog and from this list for good. To take it offline but keep it,
              unpublish it instead.
            </p>
            {confirmingDelete ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="submit"
                  name="intent"
                  value="delete"
                  disabled={busy}
                  className="inline-flex h-9 cursor-pointer items-center bg-ink px-4 text-xs font-semibold text-white transition-colors duration-200 hover:bg-navy-700 disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Yes, delete it"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={busy}
                  className="inline-flex h-9 cursor-pointer items-center border border-line px-4 text-xs font-semibold text-muted hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="mt-3 inline-flex h-9 cursor-pointer items-center border border-line px-4 text-xs font-semibold text-ink-body hover:border-ink/40 hover:text-ink"
              >
                Delete post
              </button>
            )}
            {deleteState.message && (
              <p role="alert" className="mt-2 text-xs font-medium text-primary-600">
                {deleteState.message}
              </p>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
