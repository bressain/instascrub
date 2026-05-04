import { buildControls, wireControls } from "./controls";

interface AttachedOverlay {
  overlayEl: HTMLDivElement;
  container: HTMLElement;
  cleanup: () => void;
}

const overlayMap = new Map<HTMLVideoElement, AttachedOverlay>();

function findPositioningContainer(video: HTMLVideoElement): HTMLElement {
  let el: HTMLElement | null = video.parentElement;
  let depth = 0;
  while (el && depth < 6) {
    const pos = getComputedStyle(el).position;
    if (pos === "relative" || pos === "absolute" || pos === "fixed" || pos === "sticky") {
      return el;
    }
    el = el.parentElement;
    depth++;
  }
  const parent = video.parentElement ?? document.body;
  parent.style.position = "relative";
  return parent;
}

export function attachOverlay(video: HTMLVideoElement): void {
  if (overlayMap.has(video)) return;

  const container = findPositioningContainer(video);

  const overlayEl = document.createElement("div");
  overlayEl.setAttribute("data-instascrub", "");

  const { controlsEl, progressBarEl, elements } = buildControls();
  overlayEl.appendChild(controlsEl);
  overlayEl.appendChild(progressBarEl);

  const cleanupControls = wireControls(video, elements);

  // mouseover/mouseout bubble through Instagram's overlaid elements; mouseenter/mouseleave don't
  function onMouseOver(): void {
    overlayEl.setAttribute("data-instascrub-hover", "");
  }
  function onMouseOut(e: MouseEvent): void {
    if (!container.contains(e.relatedTarget as Node | null)) {
      overlayEl.removeAttribute("data-instascrub-hover");
    }
  }

  container.addEventListener("mouseover", onMouseOver);
  container.addEventListener("mouseout", onMouseOut);

  container.appendChild(overlayEl);

  overlayMap.set(video, {
    overlayEl,
    container,
    cleanup: () => {
      cleanupControls();
      container.removeEventListener("mouseover", onMouseOver);
      container.removeEventListener("mouseout", onMouseOut);
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
