import { buildQueries, within } from "@testing-library/dom";

export const queryAllSpinnersByLabel = (
  container: HTMLElement,
  label: string,
): HTMLElement[] => {
  const labels = within(container).queryAllByText(label);
  const spinners: HTMLElement[] = [];
  labels.forEach((text) => {
    const spinner: HTMLElement | null = text?.closest('[role="alert"]') ?? null;
    const icon = spinner?.querySelector(".p-icon--spinner");
    if (spinner && icon) {
      spinners.push(spinner);
    }
  });
  return spinners;
};

const [
  querySpinnerByLabel,
  getAllSpinnersByLabel,
  getSpinnerByLabel,
  findAllSpinnersByLabel,
  findSpinnerByLabel,
] = buildQueries(
  queryAllSpinnersByLabel,
  (_element, label) => `More than one Spinner with label "${label}" was found.`,
  (_element, label) => `A Spinner with label "${label}" was not found.`,
);

export {
  findAllSpinnersByLabel,
  findSpinnerByLabel,
  getAllSpinnersByLabel,
  getSpinnerByLabel,
  querySpinnerByLabel,
};
