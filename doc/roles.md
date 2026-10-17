# Project Roles and Development Guidelines

1. **No Redundant Comments:** Avoid unnecessary comments or explanatory annotations when the code is already clear, self-explanatory, or obvious from its implementation.

2. **No Unapproved Documentation:** Do not create documentation that has not been explicitly approved or is not actively used by the project.

3. **No OOP in Raz or Compiler Development:** Object-oriented programming (OOP), classes, and class-dependent methods are not used in the development of the Raz compiler or the Raz language itself.

4. **Native Implementation and Minimal Overhead:** Whenever possible, implement internal methods and standard library functionality natively, using approaches recognized and supported by the C++ standard. Avoid unnecessary abstractions and external dependencies that introduce additional runtime overhead.

5. **Compiler and Standard Library Responsibilities:** The compiler is responsible for transforming and compiling source code. The final standard libraries complement the project and are an integral part of the final deliverable. Raz source files used as libraries are also built during compilation by the latest compiler version. Native C++ libraries and C/C++ header files must remain untouched.

6. **Deprecated Files and Legacy Paths:** Files with the `.depressed` extension and legacy paths were intended for older versions. They are obsolete, no longer used, and have been replaced by their newer equivalents.