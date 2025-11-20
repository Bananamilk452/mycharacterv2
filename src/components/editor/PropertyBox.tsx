import { PlusIcon, XIcon } from "lucide-react";
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
      propertyContainerRef.current.scrollTop =
        propertyContainerRef.current.scrollHeight;
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

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <Label className="shrink-0">속성</Label>
        <Button type="button" size="sm" onClick={handleAddProperty}>
          <PlusIcon />
          속성 추가
        </Button>
      </div>
      <div
        ref={propertyContainerRef}
        tabIndex={-1}
        className="border-input mt-3.5 flex h-48 grow flex-col gap-3 overflow-auto rounded-md border p-3 shadow-xs"
      >
        {propertyKeys.map((_, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <FormField
              control={form.control}
              name={`propertyKeys.${index}`}
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea {...field} placeholder="속성 이름" />
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
                    <Textarea {...field} placeholder="속성 값" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="button"
              onClick={() => handleRemoveProperty(index)}
              className="h-9"
            >
              <XIcon className="size-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
