## Build from Source

Raz translates `.raz` source files into C++17. A C++17 compiler is then used to build the generated C++ code into a native executable.

The instructions below cover Linux x86_64 and Windows x86_64. Raz is under active development, and build requirements may change.

### Linux x86_64

#### Prerequisites

On Ubuntu or Debian, install Git and GNU C++:

```sh
sudo apt update
sudo apt install -y git g++
```

#### Get the Source

```sh
git clone https://github.com/marboris/razlang.git
cd razlang
```

#### Build the Raz Compiler

Generate C++ from the compiler's Raz source, then compile it:

```sh
./compiler/razc/bin/razc compiler/razc/compiler.raz \
  --emit-cpp compiler/razc/build/compiler.cpp

. ./options

g++ -std=c++17 $CXXFLAGS -I library/raz \
  compiler/razc/build/compiler.cpp \
  -o compiler/razc/build/razc-candidate
```

Verify the resulting compiler:

```sh
./compiler/razc/build/razc-candidate --version
```

The build creates `razc-candidate`; it does not replace the checked-in bootstrap compiler.

#### Compile and Run a Raz Program

The repository includes a Hello World example:

```sh
./compiler/razc/build/razc-candidate \
  compiler/razc/examples/hello.raz \
  --emit-cpp compiler/razc/build/hello.cpp

g++ -std=c++17 -I library/raz \
  compiler/razc/build/hello.cpp \
  -o compiler/razc/build/hello

./compiler/razc/build/hello
```

Expected output:

```text
Hello World!
```

Raz generates C++ code; the C++ compiler is responsible for producing the final native executable.

### Windows x86_64

The bootstrap compiler currently included in the repository is a Linux executable. To build a native Windows version from this source tree, use **WSL2 with Ubuntu and the MinGW-w64 cross-compiler** to bootstrap the Windows executable.

#### Prerequisites

1. Install WSL2 with Ubuntu.
2. Install Git for Windows.
3. Create a Windows-side checkout so the resulting `.exe` files are accessible to Windows applications.

For example, from PowerShell:

```powershell
git clone https://github.com/marboris/razlang.git C:\src\razlang
```

#### Build `razc.exe`

Open Ubuntu under WSL2 and install the required tools:

```sh
sudo apt update
sudo apt install -y build-essential g++-mingw-w64-x86-64
```

Then build the Windows compiler from the project directory:

```sh
cd /mnt/c/src/razlang

./compiler/razc/bin/razc compiler/razc/compiler.raz \
  --emit-cpp compiler/razc/build/compiler.cpp

x86_64-w64-mingw32-g++ -std=c++17 -O2 -static -s \
  -I library/raz \
  compiler/razc/build/compiler.cpp \
  -o compiler/razc/build/razc-candidate.exe
```

#### Verify and Use the Windows Compiler

In PowerShell:

```powershell
cd C:\src\razlang

.\compiler\razc\build\razc-candidate.exe --version
```

To translate a Raz program into C++:

```powershell
.\compiler\razc\build\razc-candidate.exe `
  compiler\razc\examples\hello.raz `
  --emit-cpp compiler\razc\build\hello.cpp
```

Compile the generated C++ into a Windows executable using a Windows-compatible C++17 compiler, such as MinGW-w64:

```powershell
g++ -std=c++17 -I library/raz `
  compiler\razc\build\hello.cpp `
  -o compiler\razc\build\hello.exe
```

Run the program:

```powershell
.\compiler\razc\build\hello.exe
```

**Note:** The Windows bootstrap commands above use WSL2 to generate and cross-compile the compiler. A Windows-native C++ compiler is still needed for the final PowerShell-based application build shown above. The Windows workflow should be tested on a Windows machine before it is considered verified.