import { Character } from "./db";

export function applyCharacterDescriptionTemplate(
  characterDescription: string,
  character: Character,
) {
  const templates = characterDescription.match(/\{\{(.+?)\}\}/g);
  let description = characterDescription;

  templates?.forEach((template) => {
    const fieldName = template.replace("{{", "").replace("}}", "").trim();
    const index = character.propertyKeys.indexOf(fieldName);
    const value = index !== -1 ? character.propertyValues[index] : "-";

    description = description.replace(template, value);
  });

  return description;
}

export function htmlToPlainText(html: string) {
  if (!html) {
    return "";
  }

  const document = new DOMParser().parseFromString(html, "text/html");

  return document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
}
