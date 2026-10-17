<p align="center">
  <a href="https://github.com/marboris/razlang">
    <img src="https://github.com/user-attachments/assets/a006e5c6-1947-4a13-8b4d-3435838c54ba" alt="Raz Logo" height=320>
  </a>
</p>

<h1 align="center">Raz Compiler</h1>

<p align="center">A language built to build itself.</p>

## How Raz Differs

- **High-Level Design:** Readable syntax and abstractions designed to simplify development and code maintenance.
- **Memory Management:** Aims to automate memory management and provide safer pointer abstractions.
- **No OOP Required:** Uses an approach that does not rely on object-oriented programming, encouraging structured and modular code.
- **Native Compilation:** Compiles to C++, combining Raz's language design with the native compilation ecosystem.

Raz is under active development, and its capabilities continue to evolve.

## Development & Build

Clone the repository and build the Raz compiler using the included bootstrap compiler. Raz emits C++17, which you then compile into a native executable with GNU C++.

```sh
git clone https://github.com/marboris/razlang.git
cd razlang

# Build a candidate compiler from the Raz compiler source
./compiler/razc/bin/razc compiler/razc/compiler.raz \
  --emit-cpp compiler/razc/build/compiler.cpp
. ./options
$CXX -std=c++17 $CXXFLAGS -I library/raz \
  compiler/razc/build/compiler.cpp -o compiler/razc/build/razc-candidate

# Translate a Raz program to C++, then compile it with GNU C++
./compiler/razc/build/razc-candidate compiler/razc/examples/hello.raz \
  --emit-cpp compiler/razc/build/hello.cpp
g++ -std=c++17 -I library/raz \
  compiler/razc/build/hello.cpp -o compiler/razc/build/hello
./compiler/razc/build/hello
```

See [`BUILD.md`](doc/BUILD.md) for platform-specific instructions for Linux x86_64 and Windows.

## Documentation

Documentation and usage examples will be maintained alongside the project as development progresses.

- [Source code](https://github.com/marboris/razlang)
- [Issues and bug reports](https://github.com/marboris/razlang/issues)

## Contributing

Contributions are welcome! Help us improve Raz by reporting bugs, suggesting features, or contributing code.

Fork the repository, make your changes, and submit a pull request for review.

For ordinary bugs and feature requests, open a GitHub issue. For potential security vulnerabilities, follow the private reporting instructions in `SECURITY.md`.

## License

Raz is distributed under the license specified in the repository. See [`LICENSE`](LICENSE) for the applicable terms.
