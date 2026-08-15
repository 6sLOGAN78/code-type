/**
 * cppType - Curated C++ Code Snippets Library
 * Categorized by: DSA, STL, Competitive Programming, Modern C++, Systems, and Speed Drills
 */

const CPP_SNIPPETS = [
  // ==========================================
  // 1. DATA STRUCTURES & ALGORITHMS (DSA)
  // ==========================================
  {
    id: "dsa-binary-search",
    title: "Binary Search",
    category: "dsa",
    difficulty: "easy",
    code: `int binarySearch(const std::vector<int>& arr, int target) {
  int left = 0, right = static_cast<int>(arr.size()) - 1;
  while (left <= right) {
    int mid = left + (right - left) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`
  },
  {
    id: "dsa-dijkstra",
    title: "Dijkstra Shortest Path",
    category: "dsa",
    difficulty: "medium",
    code: `std::vector<int> dijkstra(int src, int n, const std::vector<std::vector<std::pair<int, int>>>& adj) {
  std::vector<int> dist(n, 1e9);
  std::priority_queue<std::pair<int, int>, std::vector<std::pair<int, int>>, std::greater<>> pq;
  dist[src] = 0;
  pq.push({0, src});
  while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    if (d > dist[u]) continue;
    for (const auto& [v, w] : adj[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push({dist[v], v});
      }
    }
  }
  return dist;
}`
  },
  {
    id: "dsa-quicksort",
    title: "QuickSort Partition",
    category: "dsa",
    difficulty: "medium",
    code: `int partition(std::vector<int>& arr, int low, int high) {
  int pivot = arr[high];
  int i = low - 1;
  for (int j = low; j < high; ++j) {
    if (arr[j] <= pivot) {
      ++i;
      std::swap(arr[i], arr[j]);
    }
  }
  std::swap(arr[i + 1], arr[high]);
  return i + 1;
}

void quickSort(std::vector<int>& arr, int low, int high) {
  if (low < high) {
    int pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}`
  },
  {
    id: "dsa-trie",
    title: "Trie (Prefix Tree)",
    category: "dsa",
    difficulty: "hard",
    code: `struct TrieNode {
  std::array<std::unique_ptr<TrieNode>, 26> children;
  bool isEndOfWord = false;
};

class Trie {
  std::unique_ptr<TrieNode> root = std::make_unique<TrieNode>();
public:
  void insert(std::string_view word) {
    TrieNode* curr = root.get();
    for (char c : word) {
      int idx = c - 'a';
      if (!curr->children[idx]) {
        curr->children[idx] = std::make_unique<TrieNode>();
      }
      curr = curr->children[idx].get();
    }
    curr->isEndOfWord = true;
  }
};`
  },
  {
    id: "dsa-lru-cache",
    title: "LRU Cache",
    category: "dsa",
    difficulty: "hard",
    code: `class LRUCache {
  int capacity;
  std::list<std::pair<int, int>> items;
  std::unordered_map<int, std::list<std::pair<int, int>>::iterator> cache;
public:
  explicit LRUCache(int cap) : capacity(cap) {}
  int get(int key) {
    auto it = cache.find(key);
    if (it == cache.end()) return -1;
    items.splice(items.begin(), items, it->second);
    return it->second->second;
  }
  void put(int key, int value) {
    auto it = cache.find(key);
    if (it != cache.end()) {
      it->second->second = value;
      items.splice(items.begin(), items, it->second);
      return;
    }
    if (items.size() == capacity) {
      cache.erase(items.back().first);
      items.pop_back();
    }
    items.emplace_front(key, value);
    cache[key] = items.begin();
  }
};`
  },
  {
    id: "dsa-dsu",
    title: "Disjoint Set Union (DSU)",
    category: "dsa",
    difficulty: "medium",
    code: `class DSU {
  std::vector<int> parent, rank;
public:
  explicit DSU(int n) : parent(n), rank(n, 0) {
    std::iota(parent.begin(), parent.end(), 0);
  }
  int find(int i) {
    if (parent[i] == i) return i;
    return parent[i] = find(parent[i]);
  }
  bool unite(int i, int j) {
    int root_i = find(i), root_j = find(j);
    if (root_i == root_j) return false;
    if (rank[root_i] < rank[root_j]) std::swap(root_i, root_j);
    parent[root_j] = root_i;
    if (rank[root_i] == rank[root_j]) rank[root_i]++;
    return true;
  }
};`
  },
  {
    id: "dsa-segment-tree",
    title: "Segment Tree Point Update",
    category: "dsa",
    difficulty: "hard",
    code: `class SegmentTree {
  int n;
  std::vector<int> tree;
public:
  explicit SegmentTree(int size) : n(size), tree(2 * size, 0) {}
  void update(int pos, int val) {
    for (tree[pos += n] = val; pos > 1; pos >>= 1) {
      tree[pos >> 1] = tree[pos] + tree[pos ^ 1];
    }
  }
  int query(int l, int r) {
    int res = 0;
    for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
      if (l & 1) res += tree[l++];
      if (r & 1) res += tree[--r];
    }
    return res;
  }
};`
  },

  // ==========================================
  // 2. STL & MODERN C++
  // ==========================================
  {
    id: "stl-vector-ranges",
    title: "C++20 Ranges & Transform",
    category: "stl",
    difficulty: "easy",
    code: `auto processNumbers(const std::vector<int>& nums) {
  auto is_even = [](int x) { return x % 2 == 0; };
  auto square = [](int x) { return x * x; };
  return nums 
    | std::views::filter(is_even)
    | std::views::transform(square);
}`
  },
  {
    id: "stl-custom-comparator",
    title: "Priority Queue with Lambda Comparator",
    category: "stl",
    difficulty: "medium",
    code: `struct Task {
  int id;
  int priority;
  std::string name;
};

void scheduleTasks(std::vector<Task>& taskList) {
  auto cmp = [](const Task& a, const Task& b) {
    return a.priority < b.priority;
  };
  std::priority_queue<Task, std::vector<Task>, decltype(cmp)> queue(cmp);
  for (const auto& task : taskList) {
    queue.push(task);
  }
}`
  },
  {
    id: "modern-smart-pointers",
    title: "Modern RAII & Smart Pointers",
    category: "stl",
    difficulty: "medium",
    code: `class DatabaseConnection {
public:
  void query(std::string_view sql) {
    std::cout << "Executing: " << sql << "\\n";
  }
};

void runQuerySession() {
  auto db = std::make_unique<DatabaseConnection>();
  std::shared_ptr<DatabaseConnection> sharedDb = std::move(db);
  if (sharedDb) {
    sharedDb->query("SELECT * FROM users WHERE active = 1;");
  }
}`
  },
  {
    id: "modern-variant-visitor",
    title: "std::variant & Overloaded Pattern",
    category: "stl",
    difficulty: "hard",
    code: `template<class... Ts> struct overloaded : Ts... { using Ts::operator()...; };
template<class... Ts> overloaded(Ts...) -> overloaded<Ts...>;

using Value = std::variant<int, double, std::string>;

void printValue(const Value& val) {
  std::visit(overloaded {
    [](int i) { std::cout << "Integer: " << i << "\\n"; },
    [](double d) { std::cout << "Double: " << d << "\\n"; },
    [](const std::string& s) { std::cout << "String: " << s << "\\n"; }
  }, val);
}`
  },
  {
    id: "modern-structured-bindings",
    title: "Structured Bindings & Tuples",
    category: "stl",
    difficulty: "easy",
    code: `std::tuple<std::string, int, bool> getUserStatus(int userId) {
  return {"admin_user", 42, true};
}

void checkUser() {
  const auto [username, score, isActive] = getUserStatus(101);
  if (isActive && score >= 40) {
    std::cout << username << " has passed the validation.\\n";
  }
}`
  },

  // ==========================================
  // 3. COMPETITIVE PROGRAMMING TEMPLATES
  // ==========================================
  {
    id: "cp-fast-io-template",
    title: "Competitive Fast I/O Template",
    category: "cp",
    difficulty: "easy",
    code: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;
using ll = long long;

void solve() {
  int n;
  if (!(cin >> n)) return;
  vector<ll> a(n);
  for (int i = 0; i < n; ++i) cin >> a[i];
  sort(a.begin(), a.end());
  cout << a.back() << "\\n";
}

int main() {
  ios_base::sync_with_stdio(false);
  cin.tie(nullptr);
  int t = 1;
  while (t--) solve();
  return 0;
}`
  },
  {
    id: "cp-mod-exponentiation",
    title: "Fast Modular Exponentiation",
    category: "cp",
    difficulty: "medium",
    code: `long long powerMod(long long base, long long exp, long long mod) {
  long long res = 1;
  base %= mod;
  while (exp > 0) {
    if (exp & 1) res = (res * base) % mod;
    base = (base * base) % mod;
    exp >>= 1;
  }
  return res;
}`
  },
  {
    id: "cp-sieve",
    title: "Sieve of Eratosthenes",
    category: "cp",
    difficulty: "easy",
    code: `std::vector<int> generatePrimes(int limit) {
  std::vector<bool> isPrime(limit + 1, true);
  std::vector<int> primes;
  isPrime[0] = isPrime[1] = false;
  for (int p = 2; p * p <= limit; ++p) {
    if (isPrime[p]) {
      for (int i = p * p; i <= limit; i += p) {
        isPrime[i] = false;
      }
    }
  }
  for (int p = 2; p <= limit; ++p) {
    if (isPrime[p]) primes.push_back(p);
  }
  return primes;
}`
  },
  {
    id: "cp-sliding-window",
    title: "Sliding Window Maximum",
    category: "cp",
    difficulty: "medium",
    code: `std::vector<int> maxSlidingWindow(const std::vector<int>& nums, int k) {
  std::deque<int> dq;
  std::vector<int> result;
  for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
    if (!dq.empty() && dq.front() == i - k) dq.pop_front();
    while (!dq.empty() && nums[dq.back()] < nums[i]) dq.pop_back();
    dq.push_back(i);
    if (i >= k - 1) result.push_back(nums[dq.front()]);
  }
  return result;
}`
  },

  // ==========================================
  // 4. SYSTEMS & LOW LEVEL
  // ==========================================
  {
    id: "sys-ring-buffer",
    title: "Lock-Free Ring Buffer Concept",
    category: "systems",
    difficulty: "hard",
    code: `template<typename T, size_t Capacity>
class RingBuffer {
  std::array<T, Capacity> buffer;
  std::atomic<size_t> head{0};
  std::atomic<size_t> tail{0};
public:
  bool push(const T& item) {
    size_t current_tail = tail.load(std::memory_order_relaxed);
    size_t next_tail = (current_tail + 1) % Capacity;
    if (next_tail == head.load(std::memory_order_acquire)) return false;
    buffer[current_tail] = item;
    tail.store(next_tail, std::memory_order_release);
    return true;
  }
};`
  },
  {
    id: "sys-bit-manipulation",
    title: "Bit Manipulation Utilities",
    category: "systems",
    difficulty: "easy",
    code: `inline bool isPowerOfTwo(uint32_t x) {
  return x != 0 && (x & (x - 1)) == 0;
}

inline uint32_t countSetBits(uint32_t n) {
  uint32_t count = 0;
  while (n > 0) {
    n &= (n - 1);
    ++count;
  }
  return count;
}

inline uint32_t reverseBits(uint32_t n) {
  uint32_t rev = 0;
  for (int i = 0; i < 32; ++i) {
    rev = (rev << 1) | (n & 1);
    n >>= 1;
  }
  return rev;
}`
  },
  {
    id: "sys-spinlock",
    title: "Atomic Spinlock Mutex",
    category: "systems",
    difficulty: "medium",
    code: `class Spinlock {
  std::atomic_flag lock_flag = ATOMIC_FLAG_INIT;
public:
  void lock() noexcept {
    while (lock_flag.test_and_set(std::memory_order_acquire)) {
      #if defined(__x86_64__) || defined(_M_X64)
      _mm_pause();
      #endif
    }
  }
  void unlock() noexcept {
    lock_flag.clear(std::memory_order_release);
  }
};`
  },
  {
    id: "sys-custom-allocator",
    title: "Linear Arena Memory Allocator",
    category: "systems",
    difficulty: "hard",
    code: `class ArenaAllocator {
  std::vector<uint8_t> buffer;
  size_t offset = 0;
public:
  explicit ArenaAllocator(size_t size) : buffer(size) {}
  void* allocate(size_t bytes, size_t alignment = alignof(std::max_align_t)) {
    size_t current = reinterpret_cast<uintptr_t>(buffer.data() + offset);
    size_t aligned = (current + (alignment - 1)) & ~(alignment - 1);
    size_t padding = aligned - current;
    if (offset + padding + bytes > buffer.size()) return nullptr;
    offset += padding + bytes;
    return reinterpret_cast<void*>(aligned);
  }
  void reset() noexcept { offset = 0; }
};`
  },

  // ==========================================
  // 5. OBJECT ORIENTED & DESIGN PATTERNS
  // ==========================================
  {
    id: "oop-singleton",
    title: "Thread-Safe Meyers Singleton",
    category: "oop",
    difficulty: "easy",
    code: `class ConfigManager {
public:
  static ConfigManager& getInstance() {
    static ConfigManager instance;
    return instance;
  }
  ConfigManager(const ConfigManager&) = delete;
  ConfigManager& operator=(const ConfigManager&) = delete;
  std::string getSetting(const std::string& key) const {
    auto it = settings.find(key);
    return it != settings.end() ? it->second : "";
  }
private:
  ConfigManager() = default;
  std::unordered_map<std::string, std::string> settings;
};`
  },
  {
    id: "oop-observer",
    title: "Observer Event Bus",
    category: "oop",
    difficulty: "medium",
    code: `class EventListener {
public:
  virtual ~EventListener() = default;
  virtual void onEvent(int eventId, const std::string& payload) = 0;
};

class EventDispatcher {
  std::vector<std::shared_ptr<EventListener>> listeners;
public:
  void subscribe(std::shared_ptr<EventListener> listener) {
    listeners.push_back(std::move(listener));
  }
  void emit(int eventId, const std::string& data) {
    for (const auto& listener : listeners) {
      if (listener) listener->onEvent(eventId, data);
    }
  }
};`
  },

  // ==========================================
  // 6. SPEED DRILLS & OPERATOR OVERLOADS
  // ==========================================
  {
    id: "drill-operator-overload",
    title: "Vec2D Vector Math Overloads",
    category: "drills",
    difficulty: "easy",
    code: `struct Vec2 {
  float x, y;
  constexpr Vec2(float x_ = 0, float y_ = 0) : x(x_), y(y_) {}
  constexpr Vec2 operator+(const Vec2& rhs) const noexcept { return {x + rhs.x, y + rhs.y}; }
  constexpr Vec2 operator-(const Vec2& rhs) const noexcept { return {x - rhs.x, y - rhs.y}; }
  constexpr Vec2 operator*(float scalar) const noexcept { return {x * scalar, y * scalar}; }
  constexpr float dot(const Vec2& rhs) const noexcept { return x * rhs.x + y * rhs.y; }
};`
  },
  {
    id: "drill-template-concepts",
    title: "C++20 Concept & Constraints",
    category: "drills",
    difficulty: "medium",
    code: `template<typename T>
concept Numeric = std::is_arithmetic_v<T>;

template<Numeric T>
T clamp(T value, T minVal, T maxVal) {
  if (value < minVal) return minVal;
  if (value > maxVal) return maxVal;
  return value;
}`
  },
  {
    id: "drill-lambda-algorithms",
    title: "Custom Lambdas in STL Find_If",
    category: "drills",
    difficulty: "easy",
    code: `struct Account {
  int id;
  double balance;
  bool isFlagged;
};

auto findHighRiskAccount(const std::vector<Account>& accounts, double threshold) {
  return std::find_if(accounts.begin(), accounts.end(), [threshold](const Account& acc) {
    return acc.isFlagged && acc.balance > threshold;
  });
}`
  }
];

// Provide helper to get snippet by category or random
function getRandomSnippet(category = "all", difficulty = "all") {
  let filtered = CPP_SNIPPETS;
  if (category !== "all") {
    filtered = filtered.filter(s => s.category === category);
  }
  if (difficulty !== "all") {
    filtered = filtered.filter(s => s.difficulty === difficulty);
  }
  if (filtered.length === 0) filtered = CPP_SNIPPETS;
  const idx = Math.floor(Math.random() * filtered.length);
  return filtered[idx];
}
