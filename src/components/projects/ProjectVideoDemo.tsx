"use client";

import { useId, useRef } from "react";
import type { MouseEvent } from "react";
import type { ProjectDemo } from "@/lib/content";

type ProjectVideoDemoProps = {
  demo: ProjectDemo;
};

export function ProjectVideoDemo({ demo }: ProjectVideoDemoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleId = useId();

  const openDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;

    dialog.showModal();
    void videoRef.current?.play().catch(() => undefined);
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const pauseVideo = () => {
    videoRef.current?.pause();
  };

  const closeFromBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closeDialog();
  };

  return (
    <div className="mt-7">
      <button
        type="button"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-label={demo.triggerLabel}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-surface text-left transition-[border-color,transform] duration-300 hover:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:scale-[0.99]"
      >
        <img
          src={demo.poster}
          alt=""
          width={960}
          height={600}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent"
        />
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <span className="text-sm font-medium text-white">{demo.triggerLabel}</span>
          <span className="shrink-0 text-xs text-white/70">{demo.duration}</span>
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="project-demo-dialog"
        onClose={pauseVideo}
        onClick={closeFromBackdrop}
      >
        <div className="project-demo-shell overflow-hidden rounded-[inherit] bg-surface">
          <header className="project-demo-header flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:gap-6 sm:px-5 sm:py-4 md:px-6">
            <div>
              <div className="text-xs text-accent">Project demo</div>
              <h4 id={titleId} className="mt-1 text-lg leading-tight md:text-xl">
                {demo.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98]"
            >
              Close
            </button>
          </header>

          <video
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            poster={demo.poster}
            aria-label={demo.ariaLabel}
            className="project-demo-video block w-full bg-black object-contain"
          >
            <source src={demo.src} type="video/mp4" />
            <a href={demo.src}>Download the project demo</a>
          </video>
        </div>
      </dialog>
    </div>
  );
}
