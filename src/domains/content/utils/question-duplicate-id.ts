export const duplicateQuestionIdPattern = /^(q-\d+)-copy(?:-(\d+))?$/;

export function createMockQuestionDuplicateId(id: string): string {
  const matchedDuplicate = id.match(duplicateQuestionIdPattern);

  if (matchedDuplicate) {
    const baseId = matchedDuplicate[1];
    const copyIndex = Number(matchedDuplicate[2] ?? "1") + 1;

    return `${baseId}-copy-${copyIndex}`;
  }

  return `${id}-copy`;
}
