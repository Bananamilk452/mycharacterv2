import { XIcon } from "lucide-react";

import { Label } from "../ui/label";
import { EditorFormProps } from "./CharacterModal";

export function TagBox({ form }: EditorFormProps) {
  const tags = form.watch("tags");

  function handleKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    // 엔터나 스페이스
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const value = event.currentTarget.value.trim();

      if (value) {
        if (tags.includes(value)) {
          return;
        }

        form.setValue("tags", [...tags, value]);
        event.currentTarget.value = "";
      }
    }
  }

  function handleRemove(index: number) {
    form.setValue(
      "tags",
      tags.filter((_, i) => i !== index),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Label>태그</Label>
      <div className="border-input flex max-h-[106px] min-h-9 flex-wrap items-center gap-2 overflow-y-auto rounded-md border px-3 py-2 shadow-xs ring-black has-focus-visible:ring-1">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="bg-primary/10 flex min-w-0 items-center gap-1 rounded-full px-2 py-0.5 text-sm break-all"
          >
            {tag}
            <button type="button" onClick={() => handleRemove(i)}>
              <XIcon className="size-3 text-gray-700" />
            </button>
          </span>
        ))}
        <input
          className="min-w-0 grow basis-32 text-sm outline-none"
          onKeyUp={handleKeyUp}
        />
      </div>
    </div>
  );
}
