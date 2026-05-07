// Sequential warmup for BrainViewer 3D toggles.
//
// Each <BrainViewer> registers a "ready" callback. After the page has finished
// its initial paint and the heavy Brainnetome chunk has been preloaded, we
// fire each registered callback one-by-one with a small stagger, so the 3D
// buttons light up in source order rather than all at once.

const queue = [];
let chunkPromise = null;
let started = false;
let drained = false;

const STAGGER_MS = 450;

function preloadChunk() {
  if (!chunkPromise) {
    // Same module path the lazy() in BrainViewer.jsx uses, so Vite shares the
    // chunk. Once this resolves the network/parse cost is paid for every
    // instance.
    chunkPromise = import("../components/BrainnetomeAtlas.jsx").catch(() => {
      // Swallow errors here so a flaky network doesn't break the page; the
      // user's own click on the 3D button will retry through Suspense.
    });
  }
  return chunkPromise;
}

function drain() {
  if (drained) return;
  drained = true;
  let i = 0;
  const tick = () => {
    if (i >= queue.length) return;
    const cb = queue[i++];
    try {
      cb();
    } catch {
      /* no-op */
    }
    setTimeout(tick, STAGGER_MS);
  };
  tick();
}

function startIfPossible() {
  if (started) return;
  started = true;

  const begin = () => {
    preloadChunk().then(() => drain());
  };

  if (typeof window === "undefined") return;

  const onIdle = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(begin, { timeout: 2000 });
    } else {
      setTimeout(begin, 600);
    }
  };

  if (document.readyState === "complete") {
    onIdle();
  } else {
    window.addEventListener("load", onIdle, { once: true });
  }
}

export function registerViewerReady(cb) {
  // If we already drained, fire immediately so late-mounting viewers still
  // get the ready signal.
  if (drained) {
    cb();
    return () => {};
  }
  queue.push(cb);
  startIfPossible();
  return () => {
    const idx = queue.indexOf(cb);
    if (idx >= 0) queue.splice(idx, 1);
  };
}
