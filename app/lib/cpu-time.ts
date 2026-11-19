/* Milliseconds of CPU this process has used: the clock for performance
   budgets in tests. Wall time also counts waiting for a busy machine (the
   suite runs files in parallel, and a build or server may be running), which
   once failed budgets the code itself met; CPU time counts only the work.
   Each test file runs in its own process, so other files do not add to it. */
export function cpuMs(): number {
  const { user, system } = process.cpuUsage();
  return (user + system) / 1000;
}
