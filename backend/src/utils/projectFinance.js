const numericParts = (value = "") =>
  String(value)
    .replace(/,/g, "")
    .match(/\d+/g)
    ?.map((part) => Number(part))
    .filter((part) => Number.isFinite(part) && part > 0) || [];

export const getProjectBudgetAmount = (project, requestedAmount) => {
  const numericRequested = Number(requestedAmount);

  if (Number.isFinite(numericRequested) && numericRequested > 0) {
    return Math.round(numericRequested);
  }

  if (Number.isFinite(project?.paymentAmount) && project.paymentAmount > 0) {
    return Math.round(project.paymentAmount);
  }

  const parts = numericParts(project?.budgetRange);

  if (parts.length >= 2) {
    return Math.round((parts[0] + parts[1]) / 2);
  }

  return parts[0] || 0;
};
