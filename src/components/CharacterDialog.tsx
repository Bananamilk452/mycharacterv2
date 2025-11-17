import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Upload, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ui/message";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import errorMessages from "@/utils/errorMessages";
import { Collection } from "@/lib/db";

const formSchema = z.object({
  avatar: z.instanceof(Blob).optional(),
  name: z.string().min(1, errorMessages.MIN_1_CHAR),
  propertyKeys: z.array(
    z
      .string({ error: errorMessages.MIN_1_CHAR })
      .min(1, errorMessages.MIN_1_CHAR),
  ),
  propertyValues: z.array(
    z
      .string({ error: errorMessages.MIN_1_CHAR })
      .min(1, errorMessages.MIN_1_CHAR),
  ),
  tags: z.array(z.string()),
  note: z.string(),
});

interface Props {
  children?: React.ReactNode;
  collection: Collection;
}

interface FormProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function CharacterDialog({ children, collection }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      propertyKeys: [],
      propertyValues: [],
      tags: [],
      note: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    collection.character
      .add({
        ...values,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .then(() => {
        setIsOpen(false);
        form.reset();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>캐릭터 생성</DialogTitle>
          <DialogDescription>캐릭터를 생성합니다.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <main
              id="top"
              className="grid grid-cols-[minmax(0,3fr)_minmax(0,7fr)] gap-6"
            >
              <section id="left" className="flex shrink-0 flex-col">
                {/* 아바타 이미지 */}
                <AvatarBox form={form} />
              </section>

              <section id="right" className="flex flex-col gap-4">
                {/* 캐릭터 이름 */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>캐릭터 이름</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="캐릭터 이름"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 태그 */}
                <TagBox form={form} />

                {/* 캐릭터 속성 */}
                <PropertyBox form={form} />
              </section>
            </main>

            <hr className="mt-6 mb-4" />

            <main id="bottom">
              <NoteBox form={form} />
            </main>
          </form>
        </Form>

        {isLoading && (
          <Message variant="loading">콜렉션을 생성 중입니다...</Message>
        )}

        <DialogFooter>
          <Button disabled={isLoading} onClick={form.handleSubmit(onSubmit)}>
            생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AvatarBox({ form }: FormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (files && files.length > 0) {
      form.setValue("avatar", files[0]);
    }
  }

  const avatar = form.watch("avatar");

  useEffect(() => {
    if (avatar) {
      const url = URL.createObjectURL(avatar);

      setBlobUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [avatar]);

  function handleRemoveAvatar() {
    form.setValue("avatar", undefined);
    setBlobUrl(undefined);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-square w-full overflow-hidden rounded-lg border">
        <img
          src={blobUrl}
          alt="이미지가 없습니다."
          className="flex size-full items-center justify-center object-cover text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg, image/png, image/gif, image/webp, image/avif"
          hidden
          onChange={handleFileChange}
        />
        <Button
          type="button"
          className="size-9"
          onClick={() => fileRef.current?.click()}
        >
          <Upload />
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="size-9"
          onClick={handleRemoveAvatar}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}

function TagBox({ form }: FormProps) {
  const [tags, setTags] = useState<string[]>([]);

  function handleKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    // 엔터나 스페이스
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const value = event.currentTarget.value.trim();

      if (value) {
        if (tags.includes(value)) {
          return;
        }

        setTags((prevTags) => [...prevTags, value]);
        form.setValue("tags", [...tags, value]);
        event.currentTarget.value = "";
      }
    }
  }

  function handleRemove(index: number) {
    setTags((prevTags) => prevTags.filter((_, i) => i !== index));
    form.setValue(
      "tags",
      tags.filter((_, i) => i !== index),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Label>태그</Label>
      <div className="flex max-h-[106px] min-h-9 flex-wrap items-center gap-2 overflow-y-auto rounded-md border px-3 py-2 shadow-sm ring-black has-[:focus-visible]:ring-1">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="bg-primary/10 flex min-w-0 items-center gap-1 rounded-full px-2 py-0.5 text-sm break-all"
          >
            {tag}
            <button type="button" onClick={() => handleRemove(i)}>
              <X className="size-3 text-gray-700" />
            </button>
          </span>
        ))}
        <input
          className="min-w-0 flex-grow basis-32 text-sm outline-none"
          onKeyUp={handleKeyUp}
        />
      </div>
    </div>
  );
}

function PropertyBox({ form }: FormProps) {
  const propertyContainerRef = useRef<HTMLDivElement>(null);
  const [propertyCount, setPropertyCount] = useState(0);

  function handleAddProperty() {
    setPropertyCount((count) => count + 1);
  }

  // 속성 추가 시 스크롤을 아래로 내림
  useEffect(() => {
    if (propertyContainerRef.current) {
      propertyContainerRef.current.scrollTop =
        propertyContainerRef.current.scrollHeight;
    }
  }, [propertyCount]);

  function handleRemoveProperty(index: number) {
    setPropertyCount((count) => count - 1);
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
          <Plus />
          속성 추가
        </Button>
      </div>
      <div
        ref={propertyContainerRef}
        tabIndex={-1}
        className="mt-3.5 flex h-36 flex-grow flex-col gap-3 overflow-auto rounded-md border p-3"
      >
        {new Array(propertyCount).fill(null).map((_, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <FormField
              control={form.control}
              name={`propertyKeys.${index}`}
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} type="text" placeholder="속성 이름" />
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
                    <Input {...field} type="text" placeholder="속성 값" />
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
              <X className="size-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteBox({ form }: FormProps) {
  return (
    <div className="flex flex-col gap-2">
      <FormItem>
        <FormLabel>노트</FormLabel>
        <FormControl>
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <Textarea
                {...field}
                className="h-32 resize-none"
                placeholder="캐릭터에 대한 노트를 입력하세요."
              />
            )}
          />
        </FormControl>
      </FormItem>
    </div>
  );
}
