# Nexus Programming Language (v4.5.0)

Nexus is a procedural, dynamically typed programming language built on a high-performance C++ execution engine. Version 4.5.0 features a completely **native, zero-dependency C++ network engine** utilizing **POSIX sockets and OpenSSL on Linux/macOS** and **WinINet on Windows** for synchronous HTTPS/TLS operations, completely eliminating all external `curl` shell dependencies. 

It also hosts a **native X11 / Win32 graphics suite** for premium styled windows, button hovering animations, entry field text capturing, vector drawing canvases, and popup alerts with **zero delay**. 

## What's New in Version 4.5.0
* **Embedded JavaScript compilation & Execution Engine (`<script>`)**: Natively extracts and compiles inline JavaScript functions. Executes common commands (`alert()`, `console.log()`, and DOM value updates `document.getElementById().value = "..."`) directly on local layout entries with zero third-party script dependencies.
* **Wayland Display Server Verification**: Probes system environment indicators (`WAYLAND_DISPLAY`) on startup, printing high-performance boot diagnostics that guarantee zero-delay graphics output via XWayland compositing.
* **Premium Drawing Toolkit**: Direct support for software box-blurs (glassmorphism cards), linear gradients (vertical/horizontal interpolations), rounded corners, and coordinate triangle shapes on the canvas.
* **Advanced HTML5 Forms & Semantics**: Supports tabular rendering grids (`<table>`), quote containers (`<blockquote>`), preformatted codes (`<pre>`), progress trackers (`<progress>`), input textareas (`<textarea>`), dropdown selectors (`<select>`), highlights (`<mark>`), and typographical underlines (`<u>`) or strikethroughs (`<del>`).
* **Tactile Swaps & Masking**: Dynamic pointer-hand hover cursors (`IDC_HAND`/`XC_hand2`) on interactive canvas nodes, and secure masking (`*`) for `<input type="password">` elements.

---

## The Titan Advantage

| Language | Execution Speed | Syntax Simplicity | Lines of Code | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| NEXUS 4.5. | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Very Low | Rapid Dev / Logic |
| **Python 3** | ⭐ | ⭐⭐⭐⭐ | Low | Data / AI / Scripting |
| **C++** | ⭐⭐⭐⭐ | ⭐ | Very High | Engines / Systems |
| **Rust** | ⭐⭐⭐⭐ | ⭐⭐⭐ | High | Safety / Systems |
| **C** | ⭐⭐⭐⭐ | ⭐ | High | Embedded / Kernel |

## 1. Quick Installation (Mac & Linux)

### Prerequisites — X11 (required for GUI features)

Homebrew does not ship X11 libraries, so you must install them from your system package manager **before** running `brew install nexus4`.

**Linux** — install the X11 development headers:
```bash
# Debian / Ubuntu
sudo apt install libx11-dev

# Fedora / RHEL
sudo dnf install libX11-devel

# Arch / Manjaro
sudo pacman -S libx11
```

**macOS** — install [XQuartz](https://www.xquartz.org), then log out and back in so the `DISPLAY` variable is set.

### Install via Homebrew

```bash
brew tap Nexus-Titan/tab https://github.com/Nexus-Titan/homebrew-tap.git
brew update
brew install nexus4
```

Execute a script:
```bash
nexus4 script.nx
```

---

## 2. Compilation & Run Guide

To compile the native C++ engine using the cross-platform CMake build system:
```bash
# Generate build configuration:
cmake -B build

# Compile target:
cmake --build build
```

To execute standard scripts:
```bash
./nexus Samples/browser.nx
```

---

## 3. Project Directory Map

- **`src/interpreter_core.cpp`**: Zero-dependency standard C++11 execution engine with unified native X11 window drawer, in-memory JavaScript compilation, and secure network sockets.
- **`src/html.cpp`**: Sophisticated layout compiler translating HTML5/CSS shorthand rules directly into visual draw commands.
- **`README.md`**: Master developer manual and install guide.
- **`SYNTAX.md`**: Up-to-date complete language syntax reference sheet.
- **`libs/`**: Standard pre-installed extension libraries:
  - **Nexus Libraries**:
    - `ssl.nx`: Secure wrapper exposing `ssl.get`, `ssl.post`, and `ssl.download` utilizing the core C++ socket engine.
    - `logger.nx`: Upgraded logger mapping structured colored console details into `app.log`.
    - `fs.nx`: High-level recursive file backup, listing, and cleaning.
    - `json_db.nx`: Upgraded lightweight storage engine using native C++ JSON helpers.
    - `http_client.nx`: High-level REST API requests wrapper.
    - `nx_suite.nx`: Canvas rendering rectangle draws.
  - **Python Helpers**:
    - `system_monitor.py`: CPU loads, RAM stats, disk allocations.
    - `net_utils.py`: Networks port scanners and checks.
    - `ai_helper.py`: Sentiment analyst.
    - `py_suite.py`: Math modeling processor.
- **`Samples/`**: Demonstration scripts:
  - `browser.nx`: Interactive modern hypermedia web browser using native C++ HTML rendering and socket GET queries.
  - `calculator.nx`: Trigonometric console application.
  - `todo.nx`: Upgraded native graphical planner dashboard.
  - `guessing_game.nx`: Random number guessing game with native C++ dialogs.
  - `file_manager.nx`: I/O scanner.
  - `text_analyzer.nx`: Standard string utilities check.
- **`test_js_wayland.nx`**: Embedded JavaScript runtime validation test.
- **`test_advanced_drawing.nx`**: Canvas gradient, software blur, rounded corner, and triangle diagnostic test.
- **`test_5000_features.nx`**: Heavy layout diagnostic checking cells tables, progresses, code blocks, and input textareas.
- **`nexus-vscode/`**: VS Code support extension package:
  - `syntaxes/nexus.tmLanguage.json`: Grammar highlighting tokens.
  - `themes/nexus-titan-theme.json`: Custom deep dark theme workspace.

---

## 4. Visual Studio Code IDE Integration

Install syntax highlighting and branding support directly:
1. Open Visual Studio Code.
2. Navigate to Extensions view (`Ctrl+Shift+X`).
3. Click the `...` menu in the top-right corner.
4. Select **"Install from VSIX..."**.
5. Choose `nexus-vscode/nexus-titan-support-2.0.0.vsix` inside the repository.
6. Open any `.nx` script file to enjoy highlighting colorization.
7. To activate branding colors, press `Ctrl+K` then `Ctrl+T` and choose **"Nexus Titan Dark"**.

---

## 5. Standard Test Diagnostics

Execute all test validation files to verify system health:
```bash
# Execute standard complete diagnostics suite
./nexus test.nx
```

---

## 6. Official Changelog

### Version [4.5.0]
- **Embedded JavaScript Engine**: Zero-dependency line-by-line evaluator for standard JS function scripts. Support for console logs, alert overlays, and in-memory DOM assignments mapping to layout entries.
- **Wayland Environment Verification**: Automatic environment variable checking at startup with stylized boot logs.
- **Premium Drawing Library Upgrades**: Introduced canvas drawing routines for horizontal/vertical linear gradients, software-based glassmorphic blurs, rounded corner geometries, and triangle coordinate shapes.
- **Advanced HTML5/CSS Layout Engine**: Fully compliant style systems with margin/padding shorthand offsets, grid borders, tables, blockquotes, pre/code wrappers, progress indicators, dropdowns, and text underlines/strikethroughs.
- **Tactile Hovering Feedback & Masking**: Integrated cursor pointers swapping to hand cues when hovering over active layout elements, and character masking for password fields.
- **Operable JSON Database**: Added custom native `json.get` and `json.set` interpreters, making `json_db.nx` a fully operational storage suite.
- **Pure Native Dialogs**: Completely eliminated python popups, Zenity, and AppleScript wrappers. Upgraded warning, error, ask, and input alert dialogue boxes to native X11 (Linux) and Win32 (Windows) APIs.
- **Documentation Consolidation**: Consolidated all architectural structure, changelogs, VS Code extensions, libraries, and diagnostics documentation into root `README.md` and `SYNTAX.md`.

