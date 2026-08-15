# cppType ⚡ Minimalist C++ Typing Speed Test

A web application for speed coding in **C++20**, designed with the clean aesthetics and warm ergonomics of **Monkeytype**.

---

## 🌟 Key Features

1. **Monkeytype Exact Look & Feel & Warm Palettes:**
   - **Serika Dark** (default warm charcoal & gold)
   - **Gruvbox Dark** (warm earth & amber)
   - **Amber Glow** (warm retro CRT)
   - **Espresso Warm** (warm mocha & sand)
   - **Nord Slate** & **Carbon Minimal**

2. **C++20 Snippet Library (50+ Real Code Snippets):**
   - **DSA & Algorithms:** Binary Search, Dijkstra, QuickSort, Segment Tree, Trie, DSU, LRU Cache
   - **STL & Modern C++:** Ranges, Lambdas, `std::variant`, `std::unique_ptr`, Structured Bindings
   - **Competitive Programming:** Fast I/O, Modular Exponentiation, Sieve, Sliding Window
   - **Systems & Low-Level:** Lock-free Ring Buffer, Spinlocks, Arena Allocator, Bit manipulation
   - **OOP & Patterns:** Thread-safe Meyers Singleton, Observer Event Bus
   - **Speed Drills:** Operator overloading, C++20 concepts, custom lambdas

3. **Monkeytype-Style Post-Test Dashboard:**
   - **Large Headline Metrics:** Net WPM & Accuracy %
   - **Secondary Breakdown:** Raw WPM, Consistency %, Total Time, Correct/Incorrect Character counts
   - **C++ Syntax Precision Strip:** Pinpoints exactly which special symbols you mistyped (e.g. `;`, `{}`, `->`, `::`, `[]`)
   - **Interactive Performance Chart:** Dual-axis canvas graph with WPM curve, Raw WPM dashed line, error point markers, and hover tooltips.

4. **Persistent History & Analytics:**
   - Saved automatically in `localStorage`
   - Lifetime summary cards (Total tests, Best WPM, Average WPM, Average Accuracy, Total Time, Characters typed)
   - Filterable history table with per-test deletion and JSON export

5. **Custom Snippet Mode:**
   - Paste any custom C++ function, class, or competitive programming snippet to practice on your own code.

6. **Web Audio Mechanical Sound Effects:**
   - Instant zero-lag synthesized keystroke sounds (Thock, Click, Clack, Beep, or Off).

7. **Shortcuts & Ergonomics:**
   - `Tab` or `Esc`: Quick restart test
   - `Enter` / `Tab` on result screen: Instant next test
   - `R` on result screen: Repeat same snippet
   - Auto-indentation past leading spaces on `Enter`

---

## 🚀 How to Run

You can open `index.html` directly in any web browser, or run the local server:

```bash
# Clone the repository
git clone https://github.com/6sLOGAN78/cpp-type.git
cd cpp-type

# Start the server
python3 server.py
```

Then open `http://localhost:5173` in your browser.
