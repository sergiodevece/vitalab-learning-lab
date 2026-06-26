const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const toggleViewBtn = document.getElementById('toggleViewBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const fill = document.getElementById('fill');
const peak = document.getElementById('peak');
const levelValue = document.getElementById('levelValue');
const peakValue = document.getElementById('peakValue');
const dbValue = document.getElementById('dbValue');
const statusText = document.getElementById('statusText');
const clipIndicator = document.getElementById('clipIndicator');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

let audioContext;
let analyser;
let animationFrame;
let source;
let stream;
let peakHold = 0;
let peakHoldReleaseTime = 0;
let lastFrameTime = 0;
let viewMode = 'waveform';
let isListening = false;

const resizeCanvas = () => {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
};

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const setMeterColor = (dbFs) => {
  let color = '#10b981';
  if (dbFs <= -18) {
    color = '#10b981';
  } else if (dbFs <= -6) {
    color = '#3b82f6';
  } else if (dbFs <= -1) {
    color = '#f59e0b';
  } else {
    color = '#ef4444';
  }
  document.documentElement.style.setProperty('--meter-color', color);
};

const updateClipIndicator = (dbFs) => {
  let state = 'safe';
  let label = 'Safe';

  if (dbFs >= 0) {
    state = 'clipping';
    label = 'Clipping';
  } else if (dbFs >= -1) {
    state = 'hot';
    label = 'Clipping risk';
  } else if (dbFs >= -6) {
    state = 'active';
    label = 'Hot';
  }

  clipIndicator.textContent = label;
  clipIndicator.className = `clip-indicator ${state}`;
};

const resetMeterState = () => {
  fill.style.width = '0%';
  peak.style.left = '0%';
  levelValue.textContent = '0%';
  peakValue.textContent = '0%';
  dbValue.textContent = '-∞ dBFS';
  statusText.textContent = 'Idle';
  clipIndicator.textContent = 'Safe';
  clipIndicator.className = 'clip-indicator safe';
  peakHold = 0;
  peakHoldReleaseTime = 0;
  lastFrameTime = 0;
  document.documentElement.style.setProperty('--meter-color', '#10b981');
};

const drawVisualizer = (timeData, frequencyData) => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  const color = getComputedStyle(document.documentElement).getPropertyValue('--meter-color').trim() || '#10b981';

  if (viewMode === 'spectrum') {
    ctx.fillStyle = color;
    const barWidth = Math.max(2, width / frequencyData.length);
    for (let i = 0; i < frequencyData.length; i += 1) {
      const value = frequencyData[i] / 255;
      const barHeight = Math.max(2, value * height);
      const x = i * barWidth;
      const y = height - barHeight;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < timeData.length; i += 1) {
      const x = (i / timeData.length) * width;
      const y = height / 2 + ((timeData[i] - 128) / 128) * (height / 2.2);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
};

const stopMicrophone = () => {
  cancelAnimationFrame(animationFrame);

  if (source) {
    source.disconnect();
    source = null;
  }

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  isListening = false;
  startBtn.disabled = false;
  startBtn.textContent = 'Start microphone';
  stopBtn.disabled = true;
  resetMeterState();
};

const updateMeter = (timestamp) => {
  if (!analyser || !isListening) return;

  const deltaSeconds = lastFrameTime ? (timestamp - lastFrameTime) / 1000 : 0.016;
  lastFrameTime = timestamp;

  const timeData = new Uint8Array(analyser.fftSize);
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(timeData);
  analyser.getByteFrequencyData(frequencyData);

  let sumSquares = 0;
  for (let i = 0; i < timeData.length; i += 1) {
    const sample = (timeData[i] - 128) / 128;
    sumSquares += sample * sample;
  }

  const rms = Math.sqrt(sumSquares / timeData.length);
  const level = Math.min(100, Math.max(0, rms * 140));
  const dbFs = rms > 0 ? 20 * Math.log10(rms) : -Infinity;

  if (level > peakHold) {
    peakHold = level;
    peakHoldReleaseTime = timestamp + 900;
  } else if (timestamp >= peakHoldReleaseTime) {
    peakHold = Math.max(0, peakHold - 40 * deltaSeconds);
  }

  fill.style.width = `${level}%`;
  peak.style.left = `${peakHold}%`;
  levelValue.textContent = `${level.toFixed(0)}%`;
  peakValue.textContent = `${peakHold.toFixed(0)}%`;
  dbValue.textContent = `${Number.isFinite(dbFs) ? dbFs.toFixed(1) : '-∞'} dBFS`;
  statusText.textContent = level > 70 ? 'Loud' : level > 25 ? 'Active' : 'Quiet';
  setMeterColor(dbFs);
  updateClipIndicator(dbFs);
  drawVisualizer(timeData, frequencyData);

  animationFrame = window.requestAnimationFrame(updateMeter);
};

startBtn.addEventListener('click', async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    statusText.textContent = 'Browser does not support microphone access.';
    return;
  }

  try {
    if (!audioContext) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.9;
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    if (source) {
      source.disconnect();
    }

    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    isListening = true;
    startBtn.disabled = true;
    startBtn.textContent = 'Listening…';
    stopBtn.disabled = false;
    statusText.textContent = 'Listening';

    cancelAnimationFrame(animationFrame);
    lastFrameTime = 0;
    animationFrame = window.requestAnimationFrame(updateMeter);
  } catch (error) {
    console.error(error);
    let message = 'AudioContext could not start.';
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      message = 'Microphone permission denied.';
    } else if (error.name === 'NotFoundError') {
      message = 'No microphone found.';
    } else if (error.name === 'NotSupportedError' || error.name === 'SecurityError') {
      message = 'Browser does not support microphone access.';
    } else if (error.name === 'NotReadableError') {
      message = 'Microphone is already in use.';
    }
    statusText.textContent = message;
  }
});

stopBtn.addEventListener('click', stopMicrophone);

toggleViewBtn.addEventListener('click', () => {
  viewMode = viewMode === 'waveform' ? 'spectrum' : 'waveform';
  toggleViewBtn.textContent = viewMode === 'waveform' ? 'Switch to spectrum' : 'Switch to waveform';
});

fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
    document.body.classList.add('fullscreen');
  } else {
    document.exitFullscreen?.();
    document.body.classList.remove('fullscreen');
  }
});

document.addEventListener('fullscreenchange', () => {
  document.body.classList.toggle('fullscreen', Boolean(document.fullscreenElement));
});
