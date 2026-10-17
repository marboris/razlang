# Raz Compiler Development Rules for AI Agents

## 1. Understand the Project Before Making Changes

**Rule 1.1 — Read the project documentation first.**

Before modifying code, study the relevant documentation under `doc/`, including the applicable development roadmap, current implementation status, architecture notes, language manual, and role definitions.

Pay particular attention to documents such as:

- `doc/G2-021/NOW`
- `doc/G2-021/NEXT`
- `doc/roles.md`
- The relevant language manual pages under `doc/web/manual/`

Verify the exact paths and current contents in the repository rather than assuming these filenames or their contents are unchanged.

**Rule 1.2 — Understand the existing architecture.**

Trace the relevant execution path through the actual source code. Depending on the problem, this may include:

- Lexer
- Parser
- Semantic Analysis and validation
- RIR
- C++ code generation
- Build and bootstrap process
- Test runner and manifest

Do not infer implementation behavior solely from documentation, function names, or previous agents' explanations.

**Rule 1.3 — Preserve established project conventions.**

Treat the current architecture, test structure, coding style, and documented design decisions as constraints. Do not introduce a parallel workflow when the repository already provides a suitable one.

## 2. Diagnose Before Implementing

**Rule 2.1 — Begin every substantial change with a focused investigation.**

Before editing, identify:

1. The observed problem.
2. The exact source location responsible.
3. The reason the current implementation behaves incorrectly.
4. The intended language or compiler behavior.
5. The tests that should demonstrate the defect.
6. The observable outcome that will prove the fix works.

**Rule 2.2 — Distinguish confirmed defects from hypotheses.**

Prefer reproducible examples over speculation. When possible, run a minimal Raz program through the existing compiler and observe the result.

Clearly distinguish among:

- A defect reproduced by execution.
- A defect established through source-code analysis.
- A possible defect that still requires verification.
- An unresolved language-design question.

Do not describe an untested hypothesis as a confirmed bug.

**Rule 2.3 — Identify the correct layer for the fix.**

Fix a problem at the earliest appropriate compiler stage.

Examples:

- Invalid characters or unterminated literals belong in the Lexer.
- Missing required delimiters belong in the Parser.
- Invalid argument counts and incompatible types belong in Semantic Analysis.
- Incorrect initialization or execution order belongs in RIR or the relevant backend logic.

Do not use a later stage to compensate for a defect that an earlier stage should detect.

**Rule 2.4 — Define the acceptance criteria before coding.**

State what must happen for valid programs, what must happen for invalid programs, and which existing behaviors must remain unchanged.

A change is not complete merely because the reported example works.

## 3. Make Small, Direct, and Purposeful Changes

**Rule 3.1 — Fix the identified problem, not the surrounding project.**

Prefer the smallest implementation change that correctly solves the diagnosed defect. Avoid unrelated refactoring, renaming, formatting changes, dependency changes, or architectural redesign.

Expand the scope only when the investigation demonstrates that additional changes are necessary.

**Rule 3.2 — Do not introduce unnecessary infrastructure.**

Reuse existing project facilities wherever possible. Do not add a separate shell script, external test framework, alternate manifest, or parallel test runner when the current system can support the required test.

In particular, new Raz tests must follow the established Raz testing conventions.

**Rule 3.3 — Preserve the active compiler binary.**

Do not replace or overwrite the repository's active compiler binary as part of ordinary source development unless explicitly required and documented.

Use the established candidate-build and bootstrap workflow to validate source changes independently.

**Rule 3.4 — Do not make speculative language-design decisions.**

When behavior is not defined clearly, inspect the manual, tests, and implementation history. If the intended behavior remains unresolved, isolate the ambiguity and avoid silently inventing a language rule.

## 4. Treat Tests as Part of the Implementation

**Rule 4.1 — Use the existing Raz testing architecture.**

Add tests through the established files and conventions, including:

- `tests/run-tests.raz`
- `tests/manifest.json`
- `tests/cases/` for valid programs
- `tests/negative/` for invalid programs

Verify the current manifest schema and test-runner behavior before adding or changing fields.

Do not create a separate test script for a regression that belongs in the existing runner.

**Rule 4.2 — Every bug fix must include regression coverage.**

A fix should introduce a test that would fail before the change and pass afterward.

For a parser or semantic-validation fix, include appropriate negative tests. Also run relevant positive tests to ensure legitimate programs remain accepted.

For a runtime regression, integrate execution into the existing Raz test workflow if that workflow can support it. Use a specific expected exit code or other explicit observable result rather than treating any nonzero exit as proof of success.

**Rule 4.3 — Test the language rule, not merely the downstream compiler error.**

If Raz can determine that a program is invalid, Raz should reject it before producing output that fails later in GNU C++.

For example, known built-in functions should have their argument counts, argument types, and other applicable constraints validated by Raz itself.

Do not count a GNU C++ compilation error as a successful Semantic Analysis test unless the test explicitly targets the backend.

**Rule 4.4 — Preserve useful generated artifacts.**

Follow the repository's established workflow for generated C++ output. Keep artifacts that the project expects developers to inspect manually, and do not add unnecessary cleanup steps that remove useful diagnostic evidence.

**Rule 4.5 — Test both positive and negative behavior.**

For every change, consider:

- The minimal invalid case.
- Nearby invalid variations.
- The corresponding valid case.
- Existing regression tests affected by the same code path.

For runtime or initialization fixes, add a test that actually executes the generated program; successful C++ generation alone does not prove correct runtime behavior.

## 5. Validate Reproducibly

**Rule 5.1 — Use the documented build and bootstrap process.**

Build a candidate compiler using the repository's documented procedure. If the project supports bootstrapping, validate the next-stage compiler as well when practical and relevant.

Do not assume that a pre-existing executable corresponds to the source currently being tested.

**Rule 5.2 — Pass the intended compiler explicitly.**

When a test runner supports a compiler override such as `RAZC`, set it for the actual test command, not just for the build command that created the runner.

For example:

`RAZC=./compiler/razc/build/razc-candidate ./tests/run-tests.out`

Inspect the runner's implementation to understand whether environment variables are read at build time, runtime, or both.

**Rule 5.3 — Separate compilation tests from runtime tests.**

A compile-only test establishes that compilation succeeded or failed as expected. It does not establish that the generated program executes correctly.

For runtime-sensitive changes, compile and execute the generated program and verify a predetermined result, such as an expected exit code.

**Rule 5.4 — Re-run the relevant test suite after the final source change.**

Do not rely on results from an earlier version of the files. The reported results must correspond to the final source tree being delivered.

If timeouts, missing dependencies, stale binaries, or environmental failures prevent complete validation, report the limitation explicitly. Never present an incomplete run as a successful full validation.

**Rule 5.5 — Report exact evidence.**

Provide actual test counts and results where available. Distinguish among:

- Tests executed and passed.
- Tests executed and failed.
- Tests not executed.
- Tests whose results could not be verified.

Never infer success solely from the presence of a generated file or from an earlier agent's report.

## 6. Keep Documentation Focused

**Rule 6.1 — Do not edit documentation without a reason.**

Update documentation only when the implementation changes documented behavior, an existing instruction becomes incorrect, or the task explicitly requires a documentation change.

Do not rewrite `README.fa.md` or other general documentation merely to describe every code modification.

**Rule 6.2 — Consult the relevant existing documentation before editing.**

Follow the style, language, scope, and structure of the relevant document. Prefer a minimal correction over adding new sections that restate implementation details already explained elsewhere.

**Rule 6.3 — Keep language documentation consistent with the implementation.**

If a language rule changes, update the appropriate manual page. Do not document an unresolved design decision as though it were already part of the language specification.

## 7. Follow a Consistent Development Cycle

For each focused task, follow this sequence:

1. **Inspect:** Read the relevant documentation, source, manifest, and existing tests.
2. **Diagnose:** Reproduce or establish the defect and identify its root cause.
3. **Specify:** State the intended behavior and acceptance criteria.
4. **Test design:** Determine the regression tests before modifying the implementation.
5. **Implement:** Make the smallest correct source change and add tests within the existing framework.
6. **Validate:** Build the candidate, run relevant positive and negative tests, execute runtime tests when necessary, and bootstrap when appropriate.
7. **Review:** Inspect the final diff for unrelated edits, accidental binary changes, missing tests, and unnecessary documentation.
8. **Report:** Summarize the defect, root cause, fix, test evidence, and any limitations.
9. **Commit message:** Provide a short, accurate English commit message based on the actual changes.

For substantial tasks, report the investigation findings and proposed change scope before editing. If the user asks for a review before modification, do not modify files until that review has been completed and presented.

## 8. Definition of Done

A task is complete only when all applicable conditions are satisfied:

- The root cause is understood.
- The intended behavior is consistent with the project's documented design.
- The implementation addresses the actual defect.
- Regression tests are integrated into the existing testing architecture.
- Relevant valid programs continue to behave correctly.
- Invalid programs are rejected at the appropriate compiler stage.
- Applicable compilation, runtime, and bootstrap checks have been run.
- Unrelated files and active binaries have not been modified unnecessarily.
- Documentation changes are limited to what the task requires.
- The final report accurately describes the evidence and any remaining limitations.
- A concise English commit message is provided.

## 9. Core Engineering Principle

**Understand first. Prove the defect. Define the expected behavior. Make the smallest correct change. Add a regression test in the existing framework. Validate the final build. Report only what the evidence supports.**

The goal is not to maximize the number of changed files or to make the compiler accept more programs indiscriminately. The goal is to make Raz more correct, predictable, testable, and consistent with its intended language semantics while preserving its existing architecture.