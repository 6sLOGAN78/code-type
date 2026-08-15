/**
 * Multi-Language Code Snippets Library
 * Supported Languages: C++ (C++20), Python (Python 3.12), Go (Go 1.22), CUDA (CUDA C++), Rust
 */

const LANGUAGES_CONFIG = {
  cpp: {
    name: "C++",
    versionBadge: "C++20",
    slug: "cpp",
    logoPrefix: "cpp",
    defaultIndent: 2,
    syntaxLabel: "C++ Syntax Precision",
    syntaxSymbols: [";", "::", "->", "{", "}", "[", "]", "<", ">", "&", "*", "#"],
    categories: [
      { id: "all", label: "all" },
      { id: "dsa", label: "dsa" },
      { id: "stl", label: "stl" },
      { id: "cp", label: "cp" },
      { id: "systems", label: "systems" },
      { id: "oop", label: "oop" },
      { id: "drills", label: "drills" }
    ]
  },
  python: {
    name: "Python",
    versionBadge: "Python 3.12",
    slug: "python",
    logoPrefix: "py",
    defaultIndent: 4,
    syntaxLabel: "Python Syntax Precision",
    syntaxSymbols: [":", "(", ")", "[", "]", "{", "}", "@", "->", "=", "_", "def", "async"],
    categories: [
      { id: "all", label: "all" },
      { id: "dsa", label: "dsa" },
      { id: "idioms", label: "idioms" },
      { id: "async", label: "async" },
      { id: "ml", label: "ml / torch" },
      { id: "oop", label: "oop" },
      { id: "drills", label: "drills" }
    ]
  },
  go: {
    name: "Go",
    versionBadge: "Go 1.22",
    slug: "go",
    logoPrefix: "go",
    defaultIndent: 4,
    syntaxLabel: "Go Syntax Precision",
    syntaxSymbols: [":=", "<-", "{", "}", "(", ")", "[", "]", "*", "&", "err", ";"],
    categories: [
      { id: "all", label: "all" },
      { id: "dsa", label: "dsa" },
      { id: "concurrency", label: "concurrency" },
      { id: "interfaces", label: "interfaces" },
      { id: "systems", label: "systems" },
      { id: "drills", label: "drills" }
    ]
  },
  cuda: {
    name: "CUDA",
    versionBadge: "CUDA C++",
    slug: "cuda",
    logoPrefix: "cuda",
    defaultIndent: 2,
    syntaxLabel: "CUDA Kernel Precision",
    syntaxSymbols: ["<<<", ">>>", "__global__", "__shared__", "__device__", "threadIdx", "blockIdx", ";", "{", "}"],
    categories: [
      { id: "all", label: "all" },
      { id: "kernels", label: "kernels" },
      { id: "memory", label: "shared mem" },
      { id: "matrix", label: "matrix math" },
      { id: "warp", label: "warp ops" },
      { id: "drills", label: "drills" }
    ]
  },
  rust: {
    name: "Rust",
    versionBadge: "Rust 2024",
    slug: "rust",
    logoPrefix: "rust",
    defaultIndent: 4,
    syntaxLabel: "Rust Syntax Precision",
    syntaxSymbols: ["fn", "let mut", "->", "=>", "::", "&mut", "?", "{", "}", ";"],
    categories: [
      { id: "all", label: "all" },
      { id: "dsa", label: "dsa" },
      { id: "ownership", label: "ownership" },
      { id: "concurrency", label: "concurrency" },
      { id: "traits", label: "traits" },
      { id: "drills", label: "drills" }
    ]
  }
};

const SNIPPETS_DATA = {
  // =========================================================================
  // 1. C++ (C++20) SNIPPETS
  // =========================================================================
  cpp: [
    {
      id: "cpp-dsa-binary-search",
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
      id: "cpp-dsa-dijkstra",
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
      id: "cpp-dsa-quicksort",
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
      id: "cpp-dsa-trie",
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
      id: "cpp-dsa-lru-cache",
      title: "LRU Cache (STL List + Map)",
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
    if (static_cast<int>(items.size()) == capacity) {
      cache.erase(items.back().first);
      items.pop_back();
    }
    items.emplace_front(key, value);
    cache[key] = items.begin();
  }
};`
    },
    {
      id: "cpp-stl-ranges",
      title: "C++20 Ranges & Views",
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
      id: "cpp-stl-variant",
      title: "std::variant & Pattern Matching",
      category: "stl",
      difficulty: "medium",
      code: `template<class... Ts> struct overloaded : Ts... { using Ts::operator()...; };
template<class... Ts> overloaded(Ts...) -> overloaded<Ts...>;

using Response = std::variant<int, std::string, double>;

void handleResponse(const Response& resp) {
  std::visit(overloaded{
    [](int val) { std::cout << "Integer result: " << val << "\\n"; },
    [](const std::string& str) { std::cout << "String result: " << str << "\\n"; },
    [](double val) { std::cout << "Floating point result: " << val << "\\n"; }
  }, resp);
}`
    },
    {
      id: "cpp-cp-fast-io",
      title: "Competitive Programming Fast I/O",
      category: "cp",
      difficulty: "easy",
      code: `void optimizeIO() {
  std::ios_base::sync_with_stdio(false);
  std::cin.tie(nullptr);
  std::cout.tie(nullptr);
}

long long modExp(long long base, long long exp, long long mod) {
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
      id: "cpp-sys-ring-buffer",
      title: "Lock-Free SPSC Ring Buffer",
      category: "systems",
      difficulty: "hard",
      code: `template<typename T, size_t Cap>
class SPSCRingBuffer {
  std::array<T, Cap> buffer;
  alignas(64) std::atomic<size_t> head{0};
  alignas(64) std::atomic<size_t> tail{0};
public:
  bool push(const T& item) {
    const size_t current_tail = tail.load(std::memory_order_relaxed);
    const size_t next_tail = (current_tail + 1) % Cap;
    if (next_tail == head.load(std::memory_order_acquire)) return false;
    buffer[current_tail] = item;
    tail.store(next_tail, std::memory_order_release);
    return true;
  }
};`
    },
    {
      id: "cpp-oop-singleton",
      title: "Meyers Thread-Safe Singleton",
      category: "oop",
      difficulty: "easy",
      code: `class ConfigurationManager {
public:
  static ConfigurationManager& getInstance() {
    static ConfigurationManager instance;
    return instance;
  }
  ConfigurationManager(const ConfigurationManager&) = delete;
  ConfigurationManager& operator=(const ConfigurationManager&) = delete;
private:
  ConfigurationManager() = default;
};`
    },
    {
      id: "cpp-drill-vec2",
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
    }
  ],

  // =========================================================================
  // 2. PYTHON (Python 3.12) SNIPPETS
  // =========================================================================
  python: [
    {
      id: "py-dsa-binary-search",
      title: "Binary Search (Type-Annotated)",
      category: "dsa",
      difficulty: "easy",
      code: `def binary_search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`
    },
    {
      id: "py-dsa-lru-cache",
      title: "LRU Cache (OrderedDict)",
      category: "dsa",
      difficulty: "medium",
      code: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cache: OrderedDict[int, int] = OrderedDict()
        self.capacity = capacity

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`
    },
    {
      id: "py-dsa-trie",
      title: "Prefix Tree (Trie)",
      category: "dsa",
      difficulty: "medium",
      code: `class TrieNode:
    def __init__(self):
        self.children: dict[str, TrieNode] = {}
        self.is_terminal: bool = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        curr = self.root
        for char in word:
            if char not in curr.children:
                curr.children[char] = TrieNode()
            curr = curr.children[char]
        curr.is_terminal = True

    def search(self, word: str) -> bool:
        curr = self.root
        for char in word:
            if char not in curr.children:
                return False
            curr = curr.children[char]
        return curr.is_terminal`
    },
    {
      id: "py-dsa-dijkstra",
      title: "Dijkstra with Priority Queue",
      category: "dsa",
      difficulty: "hard",
      code: `import heapq

def dijkstra(graph: dict[str, list[tuple[str, int]]], src: str) -> dict[str, int]:
    dist = {node: float("inf") for node in graph}
    dist[src] = 0
    pq: list[tuple[int, str]] = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, weight in graph[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))
    return dist`
    },
    {
      id: "py-idiom-pattern-matching",
      title: "Pattern Matching (match/case)",
      category: "idioms",
      difficulty: "easy",
      code: `def handle_event(event: dict) -> str:
    match event:
        case {"type": "click", "x": int(x), "y": int(y)}:
            return f"Clicked at coordinate ({x}, {y})"
        case {"type": "keypress", "key": ("Enter" | "Tab") as k}:
            return f"Control trigger key pressed: {k}"
        case {"type": "error", "code": code, "msg": str(msg)}:
            return f"Service error {code}: {msg}"
        case _:
            return "Unhandled incoming payload event"`
    },
    {
      id: "py-idiom-dataclass-slots",
      title: "Frozen Slots Dataclass",
      category: "idioms",
      difficulty: "easy",
      code: `from dataclasses import dataclass, field
from typing import Optional

@dataclass(slots=True, frozen=True)
class UserSession:
    user_id: str
    token: str
    roles: tuple[str, ...] = field(default_factory=tuple)
    is_authenticated: bool = True
    expires_at: Optional[int] = None

    def has_role(self, role: str) -> bool:
        return role in self.roles`
    },
    {
      id: "py-async-pool",
      title: "Async Semaphore Worker Pool",
      category: "async",
      difficulty: "medium",
      code: `import asyncio
from typing import Any

async def fetch_task(sem: asyncio.Semaphore, item_id: int) -> dict[str, Any]:
    async with sem:
        await asyncio.sleep(0.05)
        return {"id": item_id, "status": "success", "value": item_id * 42}

async def process_batch(ids: list[int], max_workers: int = 5) -> list[dict[str, Any]]:
    sem = asyncio.Semaphore(max_workers)
    tasks = [fetch_task(sem, i) for i in ids]
    return await asyncio.gather(*tasks)`
    },
    {
      id: "py-async-stream",
      title: "Async Token Stream Generator",
      category: "async",
      difficulty: "medium",
      code: `import asyncio
from typing import AsyncGenerator

async def stream_tokens(prompt: str, chunk_size: int = 3) -> AsyncGenerator[str, None]:
    tokens = prompt.split()
    for i in range(0, len(tokens), chunk_size):
        chunk = " ".join(tokens[i:i + chunk_size])
        await asyncio.sleep(0.03)
        yield chunk + " "`
    },
    {
      id: "py-ml-resblock",
      title: "PyTorch Residual Conv Block",
      category: "ml",
      difficulty: "medium",
      code: `import torch
import torch.nn as nn

class ResBlock(nn.Module):
    def __init__(self, in_c: int, out_c: int, stride: int = 1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_c, out_c, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_c)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(out_c, out_c, kernel_size=3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_c)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = x
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += res
        return self.relu(out)`
    },
    {
      id: "py-ml-attention",
      title: "Scaled Dot-Product Attention",
      category: "ml",
      difficulty: "hard",
      code: `import torch
import torch.nn.functional as F

def scaled_dot_product_attention(
    q: torch.Tensor, 
    k: torch.Tensor, 
    v: torch.Tensor, 
    mask: torch.Tensor | None = None
) -> torch.Tensor:
    d_k = q.size(-1)
    scores = torch.matmul(q, k.transpose(-2, -1)) / (d_k ** 0.5)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    attn = F.softmax(scores, dim=-1)
    return torch.matmul(attn, v)`
    },
    {
      id: "py-oop-decorator",
      title: "Exponential Backoff Decorator",
      category: "oop",
      difficulty: "medium",
      code: `import functools
import time
from typing import Callable

def retry(max_attempts: int = 3, delay: float = 0.5):
    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_err = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as err:
                    last_err = err
                    time.sleep(delay * (2 ** (attempt - 1)))
            raise last_err
        return wrapper
    return decorator`
    },
    {
      id: "py-drill-comprehensions",
      title: "Nested Matrix Comprehensions",
      category: "drills",
      difficulty: "easy",
      code: `matrix = [[row * col for col in range(1, 6)] for row in range(1, 6)]
flattened_evens = [x for row in matrix for x in row if x % 2 == 0]
squared_map = {f"k_{i}": val ** 2 for i, val in enumerate(flattened_evens) if val > 4}`
    }
  ],

  // =========================================================================
  // 3. GO (Go 1.22) SNIPPETS
  // =========================================================================
  go: [
    {
      id: "go-dsa-binary-search",
      title: "Binary Search",
      category: "dsa",
      difficulty: "easy",
      code: `func BinarySearch(arr []int, target int) int {
	left, right := 0, len(arr)-1
	for left <= right {
		mid := left + (right-left)/2
		if arr[mid] == target {
			return mid
		} else if arr[mid] < target {
			left = mid + 1
		} else {
			right = mid - 1
		}
	}
	return -1
}`
    },
    {
      id: "go-dsa-lru-cache",
      title: "LRU Cache with Doubly Linked List",
      category: "dsa",
      difficulty: "hard",
      code: `type Node struct {
	key, val   int
	prev, next *Node
}

type LRUCache struct {
	cap        int
	cache      map[int]*Node
	head, tail *Node
	mu         sync.Mutex
}

func (c *LRUCache) Get(key int) int {
	c.mu.Lock()
	defer c.mu.Unlock()
	if node, ok := c.cache[key]; ok {
		c.moveToFront(node)
		return node.val
	}
	return -1
}`
    },
    {
      id: "go-concurrency-worker-pool",
      title: "Generic Goroutine Worker Pool",
      category: "concurrency",
      difficulty: "medium",
      code: `func WorkerPool[T any, R any](jobs <-chan T, results chan<- R, worker func(T) R, n int) {
	var wg sync.WaitGroup
	for i := 0; i < n; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for job := range jobs {
				results <- worker(job)
			}
		}()
	}
	wg.Wait()
	close(results)
}`
    },
    {
      id: "go-concurrency-pubsub",
      title: "Topic Pub/Sub Broker",
      category: "concurrency",
      difficulty: "medium",
      code: `type Broker struct {
	subs map[string][]chan string
	mu   sync.RWMutex
}

func (b *Broker) Publish(topic, msg string) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	for _, ch := range b.subs[topic] {
		select {
		case ch <- msg:
		default:
		}
	}
}`
    },
    {
      id: "go-interfaces-generic-stack",
      title: "Generic Thread-Safe Stack",
      category: "interfaces",
      difficulty: "easy",
      code: `type Stack[T any] struct {
	items []T
	mu    sync.Mutex
}

func (s *Stack[T]) Push(item T) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var zero T
	if len(s.items) == 0 {
		return zero, false
	}
	idx := len(s.items) - 1
	val := s.items[idx]
	s.items = s.items[:idx]
	return val, true
}`
    },
    {
      id: "go-systems-middleware",
      title: "HTTP Logging Middleware",
      category: "systems",
      difficulty: "easy",
      code: `func LoggingMiddleware(logger *log.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			next.ServeHTTP(w, r)
			logger.Printf("[%s] %s (%v)", r.Method, r.URL.Path, time.Since(start))
		})
	}
}`
    },
    {
      id: "go-drills-error-wrapping",
      title: "Error Wrapping & JSON Unmarshal",
      category: "drills",
      difficulty: "easy",
      code: `func LoadConfig(filePath string) (*Config, error) {
	raw, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("read file %s: %w", filePath, err)
	}
	var cfg Config
	if err := json.Unmarshal(raw, &cfg); err != nil {
		return nil, fmt.Errorf("parse config: %w", err)
	}
	if cfg.Port <= 0 {
		return nil, errors.New("config error: invalid port number")
	}
	return &cfg, nil
}`
    }
  ],

  // =========================================================================
  // 4. CUDA (CUDA C++) SNIPPETS
  // =========================================================================
  cuda: [
    {
      id: "cuda-kernel-vector-add",
      title: "Vector Addition Kernel",
      category: "kernels",
      difficulty: "easy",
      code: `__global__ void vectorAdd(const float* A, const float* B, float* C, int n) {
  int i = blockDim.x * blockIdx.x + threadIdx.x;
  if (i < n) {
    C[i] = A[i] + B[i];
  }
}`
    },
    {
      id: "cuda-kernel-matmul-naive",
      title: "2D Matrix Multiply (Naive)",
      category: "kernels",
      difficulty: "medium",
      code: `__global__ void matrixMulNaive(const float* A, const float* B, float* C, int N) {
  int row = blockIdx.y * blockDim.y + threadIdx.y;
  int col = blockIdx.x * blockDim.x + threadIdx.x;
  if (row < N && col < N) {
    float sum = 0.0f;
    for (int k = 0; k < N; ++k) {
      sum += A[row * N + k] * B[k * N + col];
    }
    C[row * N + col] = sum;
  }
}`
    },
    {
      id: "cuda-memory-tiled-matmul",
      title: "Shared Memory Tiled Matrix Multiply",
      category: "memory",
      difficulty: "hard",
      code: `#define TILE_WIDTH 16

__global__ void matrixMulTiled(const float* A, const float* B, float* C, int width) {
  __shared__ float ds_A[TILE_WIDTH][TILE_WIDTH];
  __shared__ float ds_B[TILE_WIDTH][TILE_WIDTH];

  int bx = blockIdx.x, by = blockIdx.y;
  int tx = threadIdx.x, ty = threadIdx.y;
  int row = by * TILE_WIDTH + ty;
  int col = bx * TILE_WIDTH + tx;
  float sum = 0.0f;

  for (int ph = 0; ph < width / TILE_WIDTH; ++ph) {
    ds_A[ty][tx] = A[row * width + ph * TILE_WIDTH + tx];
    ds_B[ty][tx] = B[(ph * TILE_WIDTH + ty) * width + col];
    __syncthreads();

    for (int k = 0; k < TILE_WIDTH; ++k) {
      sum += ds_A[ty][k] * ds_B[k][tx];
    }
    __syncthreads();
  }
  C[row * width + col] = sum;
}`
    },
    {
      id: "cuda-warp-shuffle-reduce",
      title: "Warp Shuffle Tree Reduction",
      category: "warp",
      difficulty: "hard",
      code: `__inline__ __device__ float warpReduceSum(float val) {
  for (int offset = warpSize / 2; offset > 0; offset /= 2) {
    val += __shfl_down_sync(0xffffffff, val, offset);
  }
  return val;
}

__global__ void blockReduceSum(const float* d_in, float* d_out, int n) {
  static __shared__ float shared[32];
  int lane = threadIdx.x % warpSize;
  int wid = threadIdx.x / warpSize;

  float val = (threadIdx.x < n) ? d_in[threadIdx.x] : 0.0f;
  val = warpReduceSum(val);

  if (lane == 0) shared[wid] = val;
  __syncthreads();

  val = (threadIdx.x < blockDim.x / warpSize) ? shared[lane] : 0.0f;
  if (wid == 0) val = warpReduceSum(val);
  if (threadIdx.x == 0) d_out[blockIdx.x] = val;
}`
    },
    {
      id: "cuda-matrix-relu-stride",
      title: "Grid-Stride ReLU Activation",
      category: "matrix",
      difficulty: "easy",
      code: `__global__ void reluGridStride(float* data, int totalElements) {
  int idx = blockIdx.x * blockDim.x + threadIdx.x;
  int stride = blockDim.x * gridDim.x;
  for (int i = idx; i < totalElements; i += stride) {
    data[i] = fmaxf(0.0f, data[i]);
  }
}`
    },
    {
      id: "cuda-drills-atomic-hist",
      title: "Shared Memory Atomic Histogram",
      category: "drills",
      difficulty: "medium",
      code: `__global__ void histogramShared(const unsigned char* data, int* hist, int n) {
  __shared__ int local_hist[256];
  local_hist[threadIdx.x] = 0;
  __syncthreads();

  int tid = blockIdx.x * blockDim.x + threadIdx.x;
  int stride = blockDim.x * gridDim.x;
  for (int i = tid; i < n; i += stride) {
    atomicAdd(&local_hist[data[i]], 1);
  }
  __syncthreads();

  atomicAdd(&hist[threadIdx.x], local_hist[threadIdx.x]);
}`
    }
  ],

  // =========================================================================
  // 5. RUST SNIPPETS
  // =========================================================================
  rust: [
    {
      id: "rust-dsa-binary-search",
      title: "Binary Search",
      category: "dsa",
      difficulty: "easy",
      code: `pub fn binary_search<T: Ord>(arr: &[T], target: &T) -> Option<usize> {
    let mut left = 0;
    let mut right = arr.len();
    while left < right {
        let mid = left + (right - left) / 2;
        match arr[mid].cmp(target) {
            std::cmp::Ordering::Equal => return Some(mid),
            std::cmp::Ordering::Less => left = mid + 1,
            std::cmp::Ordering::Greater => right = mid,
        }
    }
    None
}`
    },
    {
      id: "rust-ownership-smart-ptr",
      title: "Custom Smart Pointer (Deref)",
      category: "ownership",
      difficulty: "medium",
      code: `use std::ops::Deref;

pub struct MyBox<T>(T);

impl<T> MyBox<T> {
    pub fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

impl<T> Deref for MyBox<T> {
    type Target = T;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}`
    },
    {
      id: "rust-concurrency-mpsc",
      title: "MPSC Channel Worker Fan-Out",
      category: "concurrency",
      difficulty: "medium",
      code: `use std::sync::mpsc;
use std::thread;

pub fn parallel_sum(chunks: Vec<Vec<i64>>) -> i64 {
    let (tx, rx) = mpsc::channel();
    for chunk in chunks {
        let tx_clone = tx.clone();
        thread::spawn(move || {
            let sum: i64 = chunk.iter().sum();
            tx_clone.send(sum).unwrap();
        });
    }
    drop(tx);
    rx.iter().sum()
}`
    },
    {
      id: "rust-traits-custom-iter",
      title: "Custom Iterator Trait",
      category: "traits",
      difficulty: "easy",
      code: `pub struct Counter {
    count: u32,
    max: u32,
}

impl Counter {
    pub fn new(max: u32) -> Self {
        Counter { count: 0, max }
    }
}

impl Iterator for Counter {
    type Item = u32;
    fn next(&mut self) -> Option<Self::Item> {
        if self.count < self.max {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}`
    },
    {
      id: "rust-drills-error-handling",
      title: "Result Pattern & Question Mark",
      category: "drills",
      difficulty: "easy",
      code: `use std::fs::File;
use std::io::{self, Read};

pub fn read_username_from_file(path: &str) -> Result<String, io::Error> {
    let mut username = String::new();
    File::open(path)?.read_to_string(&mut username)?;
    Ok(username.trim().to_string())
}`
    }
  ]
};

// Aliases and helpers
const CPP_SNIPPETS = SNIPPETS_DATA.cpp;

function getLanguageConfig(langKey = "cpp") {
  return LANGUAGES_CONFIG[langKey] || LANGUAGES_CONFIG.cpp;
}

function getCategoriesForLanguage(langKey = "cpp") {
  const cfg = getLanguageConfig(langKey);
  return cfg.categories || [];
}

function getSnippetsForLanguage(langKey = "cpp", category = "all", difficulty = "all") {
  let list = SNIPPETS_DATA[langKey] || SNIPPETS_DATA.cpp;
  if (category !== "all") {
    list = list.filter(s => s.category === category);
  }
  if (difficulty !== "all") {
    list = list.filter(s => s.difficulty === difficulty);
  }
  if (list.length === 0) {
    list = SNIPPETS_DATA[langKey] || SNIPPETS_DATA.cpp;
  }
  return list;
}

function getRandomSnippet(category = "all", langKey = "cpp", difficulty = "all") {
  const filtered = getSnippetsForLanguage(langKey, category, difficulty);
  const idx = Math.floor(Math.random() * filtered.length);
  return filtered[idx];
}
