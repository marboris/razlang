#pragma once
// Synchronous shell command execution for Raz build/test tools.
// This API intentionally captures stdout and stderr together and waits for
// process completion. It is not intended for untrusted shell command strings.
#include <cstdint>
#include <cstdio>
#include <string>
#ifdef _WIN32
  #include <cstdlib>
#else
  #include <sys/wait.h>
#endif

inline int& std_process_last_status_storage() {
    static int status = 0;
    return status;
}

inline std::string std_process_exec(std::string command) {
    // Capturing stderr too makes failures actionable in a Raz test runner.
    command += " 2>&1";
#ifdef _WIN32
    FILE* pipe = _popen(command.c_str(), "r");
#else
    FILE* pipe = popen(command.c_str(), "r");
#endif
    if (pipe == nullptr) {
        std_process_last_status_storage() = 127;
        return "raz-process: unable to start shell command\n";
    }

    std::string output;
    char buffer[4096];
    while (std::fgets(buffer, sizeof(buffer), pipe) != nullptr) output.append(buffer);
#ifdef _WIN32
    std_process_last_status_storage() = _pclose(pipe);
#else
    const int status = pclose(pipe);
    if (status == -1) std_process_last_status_storage() = 127;
    else if (WIFEXITED(status)) std_process_last_status_storage() = WEXITSTATUS(status);
    else if (WIFSIGNALED(status)) std_process_last_status_storage() = 128 + WTERMSIG(status);
    else std_process_last_status_storage() = 127;
#endif
    return output;
}

inline std::int64_t std_process_exit_code() {
    return static_cast<std::int64_t>(std_process_last_status_storage());
}
