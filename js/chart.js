/**
 * cppType - High Performance Canvas Chart Renderer
 * Custom lightweight Monkeytype-style dual-axis chart.
 * Zero external dependencies (no heavy bundle), ultra-responsive, retina-crisp.
 */

class MonkeyChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.data = null;
    this.hoverPoint = null;
    this.animationProgress = 0;
    this.animFrame = null;

    if (this.canvas) {
      this._initEvents();
    }
  }

  _initEvents() {
    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.data || !this.data.timeline || this.data.timeline.length === 0) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this._handleHover(x, y);
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.hoverPoint = null;
      this.draw(1);
    });

    window.addEventListener("resize", () => {
      if (this.data) {
        this.render(this.data, false);
      }
    });
  }

  render(data, animate = true) {
    this.data = data;
    if (!this.canvas || !this.ctx || !data || !data.timeline || data.timeline.length === 0) return;

    this._resizeCanvas();

    if (animate) {
      this.animationProgress = 0;
      if (this.animFrame) cancelAnimationFrame(this.animFrame);
      const start = performance.now();
      const duration = 650;

      const step = (now) => {
        const elapsed = now - start;
        this.animationProgress = Math.min(1, elapsed / duration);
        // Ease out cubic
        const progress = 1 - Math.pow(1 - this.animationProgress, 3);
        this.draw(progress);

        if (this.animationProgress < 1) {
          this.animFrame = requestAnimationFrame(step);
        }
      };
      this.animFrame = requestAnimationFrame(step);
    } else {
      this.draw(1);
    }
  }

  _resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = Math.max(220, Math.min(320, rect.height || 260));

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
  }

  _handleHover(mouseX, mouseY) {
    const pad = { top: 25, right: 45, bottom: 35, left: 45 };
    const chartW = this.width - pad.left - pad.right;
    const points = this.data.timeline;
    if (points.length <= 1) return;

    const stepX = chartW / (points.length - 1);
    const index = Math.round((mouseX - pad.left) / stepX);

    if (index >= 0 && index < points.length) {
      this.hoverPoint = {
        index,
        data: points[index],
        x: pad.left + index * stepX
      };
      this.draw(1);
    }
  }

  draw(progress = 1) {
    if (!this.ctx || !this.data || !this.data.timeline) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    const timeline = this.data.timeline;
    if (timeline.length === 0) return;

    const pad = { top: 25, right: 45, bottom: 35, left: 45 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    // Calculate maximum values for scaling
    let maxWpm = 0;
    let maxErrors = 0;
    timeline.forEach(pt => {
      if (pt.wpm > maxWpm) maxWpm = pt.wpm;
      if (pt.rawWpm > maxWpm) maxWpm = pt.rawWpm;
      if (pt.errors > maxErrors) maxErrors = pt.errors;
    });

    maxWpm = Math.max(30, Math.ceil((maxWpm + 10) / 10) * 10);
    maxErrors = Math.max(4, Math.ceil(maxErrors + 1));

    // Get theme colors from CSS variables
    const computed = getComputedStyle(document.documentElement);
    const mainColor = computed.getPropertyValue("--main-color").trim() || "#e2b714";
    const subColor = computed.getPropertyValue("--sub-color").trim() || "#646669";
    const textColor = computed.getPropertyValue("--text-color").trim() || "#d1d0c5";
    const errorColor = computed.getPropertyValue("--error-color").trim() || "#ca4754";
    const bgColor = computed.getPropertyValue("--bg-color").trim() || "#323437";

    // 1. Draw Grid lines & Y-Axis Labels
    ctx.strokeStyle = "rgba(100, 102, 105, 0.15)";
    ctx.lineWidth = 1;
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillStyle = subColor;

    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
      const yVal = pad.top + (chartH / gridRows) * i;
      const wpmVal = Math.round(maxWpm - (maxWpm / gridRows) * i);
      const errVal = Math.round(maxErrors - (maxErrors / gridRows) * i);

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(pad.left, yVal);
      ctx.lineTo(w - pad.right, yVal);
      ctx.stroke();

      // Left Y-Axis (WPM)
      ctx.textAlign = "right";
      ctx.fillText(`${wpmVal}`, pad.left - 10, yVal + 4);

      // Right Y-Axis (Errors)
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(202, 71, 84, 0.7)";
      ctx.fillText(`${errVal}`, w - pad.right + 10, yVal + 4);
      ctx.fillStyle = subColor;
    }

    // 2. X-Axis Time Labels
    ctx.textAlign = "center";
    const stepX = chartW / Math.max(1, timeline.length - 1);
    const labelInterval = Math.max(1, Math.floor(timeline.length / 8));

    for (let i = 0; i < timeline.length; i++) {
      if (i % labelInterval === 0 || i === timeline.length - 1) {
        const xVal = pad.left + i * stepX;
        ctx.fillText(`${timeline[i].second}s`, xVal, h - 12);
      }
    }

    // Helper coordinates mapper
    const getX = (i) => pad.left + i * stepX;
    const getY_Wpm = (val) => pad.top + chartH - (val / maxWpm) * chartH * progress;
    const getY_Err = (val) => pad.top + chartH - (val / maxErrors) * chartH * progress;

    // 3. Draw Gradient Area under WPM curve
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    gradient.addColorStop(0, `${mainColor}33`); // 20% opacity
    gradient.addColorStop(1, `${mainColor}00`);

    ctx.beginPath();
    ctx.moveTo(getX(0), pad.top + chartH);
    for (let i = 0; i < timeline.length; i++) {
      ctx.lineTo(getX(i), getY_Wpm(timeline[i].wpm));
    }
    ctx.lineTo(getX(timeline.length - 1), pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 4. Draw Raw WPM Line (subtle dashed line)
    ctx.beginPath();
    ctx.strokeStyle = "rgba(226, 183, 20, 0.35)";
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 1.5;
    for (let i = 0; i < timeline.length; i++) {
      const x = getX(i);
      const y = getY_Wpm(timeline[i].rawWpm);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Draw WPM Curve (solid bold gold)
    ctx.beginPath();
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 0; i < timeline.length; i++) {
      const x = getX(i);
      const y = getY_Wpm(timeline[i].wpm);
      if (i === 0) ctx.moveTo(x, y);
      else {
        // Smooth curve with quadratic Bezier
        const prevX = getX(i - 1);
        const prevY = getY_Wpm(timeline[i - 1].wpm);
        const midX = (prevX + x) / 2;
        const midY = (prevY + y) / 2;
        ctx.quadraticCurveTo(prevX, prevY, midX, midY);
      }
    }
    if (timeline.length > 1) {
      ctx.lineTo(getX(timeline.length - 1), getY_Wpm(timeline[timeline.length - 1].wpm));
    }
    ctx.stroke();

    // 6. Draw Error Indicators (Red cross/dots)
    for (let i = 0; i < timeline.length; i++) {
      const errCount = timeline[i].errors;
      if (errCount > 0) {
        const x = getX(i);
        const y = getY_Err(errCount);

        ctx.fillStyle = errorColor;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Inner white dot for precision look
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 7. Draw Average Line (subtle horizontal guide)
    if (this.data.avgWpm) {
      const avgY = getY_Wpm(this.data.avgWpm);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(100, 102, 105, 0.4)";
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 1;
      ctx.moveTo(pad.left, avgY);
      ctx.lineTo(w - pad.right, avgY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 8. Draw Hover Tooltip
    if (this.hoverPoint && progress === 1) {
      const hp = this.hoverPoint;
      const pt = hp.data;
      const x = hp.x;
      const y = getY_Wpm(pt.wpm);

      // Vertical cursor guide
      ctx.beginPath();
      ctx.strokeStyle = "rgba(209, 208, 197, 0.4)";
      ctx.lineWidth = 1;
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + chartH);
      ctx.stroke();

      // Active point highlight
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = bgColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tooltip Card
      const tooltipText1 = `${pt.second}s`;
      const tooltipText2 = `wpm: ${pt.wpm} (raw: ${pt.rawWpm})`;
      const tooltipText3 = `errors: ${pt.errors}`;

      ctx.font = "12px 'JetBrains Mono', monospace";
      const boxW = 150;
      const boxH = 68;
      let boxX = x + 12;
      let boxY = Math.max(pad.top, Math.min(pad.top + chartH - boxH, y - boxH / 2));

      if (boxX + boxW > w - pad.right) {
        boxX = x - boxW - 12;
      }

      // Tooltip Box background
      ctx.fillStyle = "rgba(20, 22, 24, 0.94)";
      ctx.strokeStyle = "rgba(100, 102, 105, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      // Tooltip content
      ctx.textAlign = "left";
      ctx.fillStyle = subColor;
      ctx.fillText(tooltipText1, boxX + 12, boxY + 18);

      ctx.fillStyle = mainColor;
      ctx.fillText(tooltipText2, boxX + 12, boxY + 36);

      ctx.fillStyle = pt.errors > 0 ? errorColor : subColor;
      ctx.fillText(tooltipText3, boxX + 12, boxY + 54);
    }
  }
}
