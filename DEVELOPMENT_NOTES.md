# Developer Notes & Environment Constraints

## Windows Environment Quirks
*   **Grep / Search Tools**: 
    *   The `grep_search` tool uses `ripgrep` underneath.
    *   **CRITICAL**: When searching for patterns that start with a hyphen (e.g., `--variable-name`), you MUST force it to be treated as a pattern, not a flag.
    *   *Solution*: Use the `-e` flag if running raw commands, or ensure the tool call handles escaping context. If the tool fails with "unexpected argument", it means the string was interpreted as a flag.

## General
*   **Path Separators**: Always use specific absolute paths provided by the system.
*   **Shell**: The environment uses PowerShell. Avoid typical Bash-isms (like `export var=val`) in `run_command` without adapting to PowerShell syntax (`$env:var="val"`).
