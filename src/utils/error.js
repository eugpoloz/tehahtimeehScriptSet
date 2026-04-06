export const handleError = (module, error) => {
  console.error(`[bss] ${module} >>> ERROR! ${error?.message ?? error}`);
};
