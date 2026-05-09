import { buildControls, wireControls } from "./controls";

interface AttachedOverlay {
  overlayEl: HTMLDivElement;
  cleanup: () => void;
}

const overlayMap = new Map<HTMLVideoElement, AttachedOverlay>();

export function attachOverlay(video: HTMLVideoElement): void {
  if (overlayMap.has(video)) return;

  const overlayEl = document.createElement("div");
  overlayEl.setAttribute("data-instascrub", "");

  const { controlsEl, progressBarEl, elements } = buildControls();
  overlayEl.appendChild(controlsEl);
  overlayEl.appendChild(progressBarEl);

  // IntersectionObserver respects overflow:hidden on ancestor elements, so it correctly
  // detects when a video has slid out of the story container's clipping region.
  // getBoundingClientRect does not account for clipping, so it can't do this.
  let videoVisible = false;
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      videoVisible = (entries[0]?.intersectionRatio ?? 0) > 0.1;
      if (!videoVisible) {
        overlayEl.style.display = "none";
        overlayEl.removeAttribute("data-instascrub-hover");
      }
    },
    { threshold: [0, 0.1] }
  );
  intersectionObserver.observe(video);

  // Sync overlay position to video rect every frame. Using position:fixed + body
  // avoids all stacking context issues with Instagram's own player div (which sits
  // as a sibling outside our container and would otherwise intercept pointer events).
  function syncPosition(): void {
    if (!video.isConnected || !videoVisible) return;
    const rect = video.getBoundingClientRect();
    // Hide the overlay if the video's center point is outside the viewport.
    // IntersectionObserver only checks geometric overlap — a video scrolled mostly
    // above the viewport (e.g. a feed video behind Reels fullscreen) can still have
    // its bottom edge clip into the viewport, keeping intersectionRatio > 0. The
    // center-point check ensures we don't show a phantom scrubber in that case.
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    if (cx < 0 || cx > window.innerWidth || cy < 0 || cy > window.innerHeight) {
      overlayEl.style.display = "none";
      return;
    }
    overlayEl.style.display = "";
    overlayEl.style.left = `${rect.left}px`;
    overlayEl.style.top = `${rect.top}px`;
    overlayEl.style.width = `${rect.width}px`;
    overlayEl.style.height = `${rect.height}px`;
  }

  syncPosition();

  const cleanupControls = wireControls(video, elements, syncPosition);

  // Instagram renders a sibling "Video player" div (data-instancekey) that absorbs all
  // pointer events. Document capture + getBoundingClientRect bypasses the stacking issue.
  function onDocMouseOver(e: MouseEvent): void {
    if (!video.isConnected) return;
    const rect = video.getBoundingClientRect();
    const over =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (over) {
      overlayEl.setAttribute("data-instascrub-hover", "");
    } else {
      overlayEl.removeAttribute("data-instascrub-hover");
    }
  }

  document.addEventListener("mouseover", onDocMouseOver, { capture: true });
  document.body.appendChild(overlayEl);

  overlayMap.set(video, {
    overlayEl,
    cleanup: () => {
      cleanupControls();
      intersectionObserver.disconnect();
      document.removeEventListener("mouseover", onDocMouseOver, { capture: true });
      overlayEl.remove();
    },
  });
}

export function detachOverlay(video: HTMLVideoElement): void {
  const attached = overlayMap.get(video);
  if (!attached) return;
  attached.cleanup();
  overlayMap.delete(video);
}
