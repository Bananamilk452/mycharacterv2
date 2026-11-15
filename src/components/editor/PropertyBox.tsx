import { ArrowDownIcon, ArrowUpIcon, PlusIcon, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "../ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { EditorFormProps } from "./CharacterModal";

export function PropertyBox({ form }: EditorFormProps) {
  const propertyContainerRef = useRef<HTMLDivElement>(null);
  const propertyKeys = form.watch("propertyKeys");
  const propertyValues = form.watch("propertyValues");

  // 속성 추가 시 스크롤을 아래로 내림
  useEffect(() => {
    if (propertyContainerRef.current) {
      propertyContainerRef.current.scrollTop = propertyContainerRef.current.scrollHeight;
    }
  }, [propertyKeys, propertyValues]);

  function handleAddProperty() {
    form.setValue("propertyKeys", [...form.getValues("propertyKeys"), ""]);
    form.setValue("propertyValues", [...form.getValues("propertyValues"), ""]);
  }

  function handleRemoveProperty(index: number) {
    form.setValue(
      "propertyKeys",
      form.getValues("propertyKeys").filter((_, i) => i !== index),
    );
    form.setValue(
      "propertyValues",
      form.getValues("propertyValues").filter((_, i) => i !== index),
    );
  }

  function moveProperty(index: number, direction: -1 | 1) {
    const propertyKeys = form.getValues("propertyKeys");
    const propertyValues = form.getValues("propertyValues");
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= propertyKeys.length) {
      return;
    }

    const nextPropertyKeys = [...propertyKeys];
    const nextPropertyValues = [...propertyValues];

    [nextPropertyKeys[index], nextPropertyKeys[targetIndex]] = [
      nextPropertyKeys[targetIndex],
      nextPropertyKeys[index],
    ];
    [nextPropertyValues[index], nextPropertyValues[targetIndex]] = [
      nextPropertyValues[targetIndex],
      nextPropertyValues[index],
    ];

    form.setValue("propertyKeys", nextPropertyKeys);
    form.setValue("propertyValues", nextPropertyValues);
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <Label className="shrink-0">속성</Label>
        <Button
          type="button"
          size="sm"
          onClick={handleAddProperty}
          data-testid="propertybox-add-button"
        >
          <PlusIcon />
          속성 추가
        </Button>
      </div>
      <div
        ref={propertyContainerRef}
        tabIndex={-1}
        className="mt-3.5 flex h-48 grow flex-col gap-3 overflow-auto rounded-md border border-input p-3 shadow-xs"
      >
        {propertyKeys.map((_, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
            <FormField
              control={form.control}
              name={`propertyKeys.${index}`}
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="속성 이름"
                      data-testid={`propertybox-key-${index}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`propertyValues.${index}`}
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="속성 값"
                      data-testid={`propertybox-value-${index}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                className="flex size-5 items-center justify-center rounded hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-30"
                disabled={index === 0}
                onClick={() => moveProperty(index, -1)}
                aria-label={`${index + 1}번째 속성 위로 이동`}
                data-testid={`propertybox-move-up-${index}`}
              >
                <ArrowUpIcon className="size-4" />
              </button>
              <button
                type="button"
                className="flex size-5 items-center justify-center rounded hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-30"
                disabled={index === propertyKeys.length - 1}
                onClick={() => moveProperty(index, 1)}
                aria-label={`${index + 1}번째 속성 아래로 이동`}
                data-testid={`propertybox-move-down-${index}`}
              >
                <ArrowDownIcon className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleRemoveProperty(index)}
              className="h-9"
              data-testid={`propertybox-remove-button-${index}`}
            >
              <XIcon className="size-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
