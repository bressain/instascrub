import { injectStyles } from "./styles";
import { attachOverlay, detachOverlay } from "./overlay";

const managedVideos = new WeakSet<HTMLVideoElement>();

function processVideo(video: HTMLVideoElement): void {
  if (managedVideos.has(video)) return;
  managedVideos.add(video);
  attachOverlay(video);
}

function processNode(node: Node): void {
  if (node instanceof HTMLVideoElement) {
    processVideo(node);
    return;
  }
  if (node instanceof Element) {
    node.querySelectorAll("video").forEach(processVideo);
  }
}

function removeNode(node: Node): void {
  if (node instanceof HTMLVideoElement) {
    detachOverlay(node);
    managedVideos.delete(node);
  } else if (node instanceof Element) {
    node.querySelectorAll("video").forEach((v) => {
      detachOverlay(v);
      managedVideos.delete(v);
    });
  }
}

function updateModalState(): void {
  const hasModal = !!document.querySelector('[role="dialog"][aria-modal="true"]');
  document.body.classList.toggle("is-modal-open", hasModal);
}

function init(): void {
  injectStyles();

  document.querySelectorAll("video").forEach(processVideo);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(processNode);
      mutation.removedNodes.forEach(removeNode);
    }
    updateModalState();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

init();
