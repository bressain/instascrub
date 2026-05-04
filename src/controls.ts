const SPEEDS = [1, 1.25, 1.5, 2] as const;

export interface ControlElements {
  playPause: HTMLButtonElement;
  scrubber: HTMLInputElement;
  speedButtons: HTMLButtonElement[];
  progressFill: HTMLElement;
}

export function buildControls(): { controlsEl: HTMLElement; progressBarEl: HTMLElement; elements: ControlElements } {
  const controlsEl = document.createElement("div");
  controlsEl.className = "is-controls";

  const playPause = document.createElement("button");
  playPause.className = "is-play-pause";
  playPause.textContent = "⏸";
  controlsEl.appendChild(playPause);

  const scrubber = document.createElement("input");
  scrubber.className = "is-scrubber";
  scrubber.type = "range";
  scrubber.min = "0";
  scrubber.max = "100";
  scrubber.step = "0.1";
  scrubber.value = "0";
  controlsEl.appendChild(scrubber);

  const speedContainer = document.createElement("div");
  speedContainer.className = "is-speed-buttons";
  const speedButtons: HTMLButtonElement[] = [];
  for (const speed of SPEEDS) {
    const btn = document.createElement("button");
    btn.textContent = `${speed}x`;
    btn.dataset["speed"] = String(speed);
    if (speed === 1) btn.classList.add("is-active");
    speedContainer.appendChild(btn);
    speedButtons.push(btn);
  }
  controlsEl.appendChild(speedContainer);

  const progressBarEl = document.createElement("div");
  progressBarEl.className = "is-progress-bar";
  const progressFill = document.createElement("div");
  progressFill.className = "is-progress-fill";
  progressBarEl.appendChild(progressFill);

  return { controlsEl, progressBarEl, elements: { playPause, scrubber, speedButtons, progressFill } };
}

export function wireControls(video: HTMLVideoElement, elements: ControlElements): () => void {
  const { playPause, scrubber, speedButtons, progressFill } = elements;
  let isScrubbing = false;

  function updatePlayPauseIcon(): void {
    playPause.textContent = video.paused ? "▶" : "⏸";
  }

  function updateProgress(): void {
    if (isScrubbing || !video.duration || isNaN(video.duration)) return;
    const pct = (video.currentTime / video.duration) * 100;
    scrubber.value = String(pct);
    progressFill.style.width = `${pct}%`;
  }

  let rafId: number;
  function tick(): void {
    updateProgress();
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);

  function onPlayPauseClick(): void {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  function onScrubberInput(): void {
    if (!video.duration || isNaN(video.duration)) return;
    video.currentTime = (Number(scrubber.value) / 100) * video.duration;
    progressFill.style.width = `${scrubber.value}%`;
  }

  function onScrubberMouseDown(): void {
    isScrubbing = true;
  }

  function onScrubberMouseUp(): void {
    isScrubbing = false;
  }

  function onSpeedClick(e: Event): void {
    const btn = e.currentTarget as HTMLButtonElement;
    const speed = Number(btn.dataset["speed"]);
    if (!isNaN(speed)) {
      video.playbackRate = speed;
      for (const b of speedButtons) {
        b.classList.toggle("is-active", b === btn);
      }
    }
  }

  function onVideoPlay(): void { updatePlayPauseIcon(); }
  function onVideoPause(): void { updatePlayPauseIcon(); }

  updatePlayPauseIcon();

  playPause.addEventListener("click", onPlayPauseClick);
  scrubber.addEventListener("input", onScrubberInput);
  scrubber.addEventListener("mousedown", onScrubberMouseDown);
  scrubber.addEventListener("mouseup", onScrubberMouseUp);
  for (const btn of speedButtons) {
    btn.addEventListener("click", onSpeedClick);
  }
  video.addEventListener("play", onVideoPlay);
  video.addEventListener("pause", onVideoPause);

  return () => {
    cancelAnimationFrame(rafId);
    playPause.removeEventListener("click", onPlayPauseClick);
    scrubber.removeEventListener("input", onScrubberInput);
    scrubber.removeEventListener("mousedown", onScrubberMouseDown);
    scrubber.removeEventListener("mouseup", onScrubberMouseUp);
    for (const btn of speedButtons) {
      btn.removeEventListener("click", onSpeedClick);
    }
    video.removeEventListener("play", onVideoPlay);
    video.removeEventListener("pause", onVideoPause);
  };
}
