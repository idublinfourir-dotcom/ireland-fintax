"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type HeroClip = { src: string; poster: string };

/**
 * Full-bleed hero background. The first clip's poster is always there as an
 * optimised, preloaded image (it is the page's largest paint). On wide
 * screens, with motion allowed and Save-Data off, muted clips play over it
 * and cross-fade one after another, looping. Phones, reduced motion and
 * Save-Data keep the still image: on a phone the clips cost ~1.5 MB each for
 * a narrow slice of footage behind the text.
 *
 * The first render is always the still, on the server and the client alike,
 * so hydration matches; the clips mount after. They carry no poster: the
 * image beneath shows until a clip has frames, so no extra posters load.
 */
export function HeroVideo({
  clips,
  className = "",
}: {
  clips: HeroClip[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [playClips, setPlayClips] = useState(false);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const apply = () => setPlayClips(!reduced.matches && wide.matches && !saveData);
    apply();
    reduced.addEventListener("change", apply);
    wide.addEventListener("change", apply);
    return () => {
      reduced.removeEventListener("change", apply);
      wide.removeEventListener("change", apply);
    };
  }, []);

  useEffect(() => {
    if (!playClips) return;
    const v = refs.current[index];
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [index, playClips]);

  return (
    <div className={className} aria-hidden="true">
      {/* Phones see a narrow, full-height slice of a 16:9 frame, so the
          image is requested wider than the screen to stay sharp. */}
      <Image
        src={clips[0].poster}
        alt=""
        fill
        priority
        sizes="(max-width: 767px) 330vw, 100vw"
        className="object-cover"
      />
      {playClips &&
        clips.map((clip, i) => (
          <video
            key={clip.src}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-snappy ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            autoPlay={i === 0}
            muted
            playsInline
            preload={i === index ? "auto" : "metadata"}
            tabIndex={-1}
            onEnded={() => setIndex((n) => (n + 1) % clips.length)}
          >
            <source src={clip.src} type="video/mp4" />
          </video>
        ))}
    </div>
  );
}
