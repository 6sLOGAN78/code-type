# codeType ⚡ Multi-Language Speed Coding Test

A modern web application for speed coding in **C++20**, **Python 3.12**, **Go 1.22**, **CUDA C++**, and **Rust**, designed with the clean aesthetics and warm ergonomics of **Monkeytype**.

---

## 🌟 Key Features

1. **Multi-Language Architecture:**
   - **C++ (C++20):** Ranges, Lambdas, `std::variant`, Smart Pointers, Lock-free Ring Buffer, DSA & CP routines.
   - **Python (Python 3.12):** Pattern Matching (`match/case`), Type Annotations, `dataclass(slots=True)`, Async/Await, PyTorch Residual Blocks & Attention, Generators.
   - **Go (Go 1.22):** Goroutine Worker Pools, Channels & Pub/Sub Brokers, Generics, Error Wrapping (`fmt.Errorf`), HTTP Middleware.
   - **CUDA (CUDA C++):** Kernel Launch Syntax (`<<<>>>`), Tiled Matrix Multiplication with Shared Memory, Warp Shuffle Reductions, Grid-Stride Loops, Atomics.
   - **Rust:** Ownership, Lifetimes, MPSC Channels, Custom Iterators, Smart Pointers (`Deref`), and Error handling.

2. **Monkeytype Look & Feel & Warm Palettes:**
   - **Serika Dark** (default warm charcoal & gold)
   - **Gruvbox Dark** (warm earth & amber)
   - **Amber Glow** (warm retro CRT)
   - **Espresso Warm** (warm mocha & sand)
   - **Nord Slate** & **Carbon Minimal**

3. **Monkeytype-Style Post-Test Dashboard:**
   - **Headline Metrics:** Net WPM & Accuracy %
   - **Secondary Breakdown:** Raw WPM, Consistency %, Total Time, Correct/Incorrect Character counts
   - **Language-Specific Syntax Precision:** Pinpoints exactly which special symbols or operators you mistyped (e.g. `;`, `{}`, `:=`, `<-`, `<<<>>>`, `@`, `->`)
   - **Interactive Telemetry Chart:** Dual-axis canvas graph with WPM curve, Raw WPM dashed line, error point markers, and hover tooltips.

4. **Persistent History & Analytics:**
   - Saved automatically in `localStorage`
   - Language-tagged test history with per-test deletion and JSON export
   - Lifetime summary cards (Total tests, Best WPM, Average WPM, Average Accuracy, Total Time, Characters typed)

5. **Multi-Language Custom Snippet Mode:**
   - Paste any custom C++, Python, Go, CUDA, or Rust code to practice your own libraries, routines, or competitive programming templates.

6. **Web Audio Mechanical Sound Effects:**
   - Instant zero-lag synthesized keystroke sounds (Thock, Click, Clack, Beep, or Off).

7. **Shortcuts & Ergonomics:**
   - `Tab` or `Esc`: Quick restart test
   - `Enter` / `Tab` on result screen: Instant next test
   - `R` on result screen: Repeat same snippet
   - Language-aware auto-indentation (2 spaces for C++/CUDA, 4 spaces for Python/Go/Rust) on `Enter`

---

## 🚀 How to Run

You can open `index.html` directly in any web browser, or run the local server:

```bash
# Clone the repository
git clone https://github.com/6sLOGAN78/code-type.git
cd code-type

# Start the server
python3 server.py
```

Then open `http://localhost:5173` in your browser.
