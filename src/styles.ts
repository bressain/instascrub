const CSS = `
  [data-instascrub] {
    position: fixed;
    pointer-events: none;
    z-index: 2147483647;
  }

  .is-controls {
    position: absolute;
    bottom: 4px;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    background: rgba(0, 0, 0, 0.6);
    pointer-events: auto;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  [data-instascrub-hover] .is-controls {
    opacity: 1;
    bottom: 0;
  }

  [data-instascrub-hover] .is-progress-bar {
    display: none;
  }

  .is-play-pause {
    background: none;
    border: none;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    padding: 0 2px;
    line-height: 1;
    flex-shrink: 0;
  }

  .is-scrubber {
    flex: 1;
    height: 4px;
    cursor: pointer;
    accent-color: #fff;
    min-width: 0;
  }

  .is-speed-buttons {
    display: flex;
    gap: 3px;
    flex-shrink: 0;
  }

  .is-speed-buttons button {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.45);
    color: #fff;
    font-size: 10px;
    cursor: pointer;
    border-radius: 3px;
    padding: 2px 4px;
    line-height: 1;
    white-space: nowrap;
  }

  .is-speed-buttons button.is-active {
    background: rgba(255, 255, 255, 0.25);
    border-color: #fff;
  }

  .is-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.25);
    pointer-events: none;
  }

  .is-progress-fill {
    height: 100%;
    background: #fff;
    width: 0%;
  }
`;

export function injectStyles(): void {
  if (document.getElementById("instascrub-styles")) return;
  const style = document.createElement("style");
  style.id = "instascrub-styles";
  style.textContent = CSS;
  document.head.appendChild(style);
}
