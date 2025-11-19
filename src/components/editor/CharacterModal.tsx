import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Upload, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Label } from "@/components/ui/label";
import { Message } from "@/components/ui/message";
import { Textarea } from "@/components/ui/textarea";
import { useCollection } from "@/hooks/useCollection";
import { Character } from "@/lib/db";
import errorMessages from "@/utils/errorMessages";

import { AddRelationModal } from "./AddRelationModal";
import { CharacterCard } from "./CharacterCard";
import { ImageCropModal } from "./ImageCropModal";

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
  relationKeys: z.array(
    z
      .string({ error: errorMessages.MIN_1_CHAR })
      .min(1, errorMessages.MIN_1_CHAR),
  ),
  relationValues: z.array(
    z
      .string({ error: errorMessages.MIN_1_CHAR })
      .min(1, errorMessages.MIN_1_CHAR),
  ),
});

type FormSchema = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  collectionUuid: string;
  characterUuid?: string;
}

interface FormProps {
  form: UseFormReturn<FormSchema>;
}

export function CharacterModal({
  open,
  setOpen,
  collectionUuid,
  characterUuid,
}: Props) {
  const { collection } = useCollection(collectionUuid);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      propertyKeys: [],
      propertyValues: [],
      tags: [],
      note: "",
      relationKeys: [],
      relationValues: [],
    },
  });

  function onSubmit(values: FormSchema) {
    if (!collection) {
      return;
    }

    setIsLoading(true);

    collection.characters
      .add({
        ...values,
        uuid: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .then(() => {
        setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl!">
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

            <main id="bottom" className="grid grid-cols-2 gap-4">
              <NoteBox form={form} />
              <RelationBox form={form} collectionUuid={collectionUuid} />
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
  const avatar = form.watch("avatar");

  const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false);
  const [file, setFile] = useState<Blob | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrl = useMemo(() => {
    if (avatar) {
      return URL.createObjectURL(avatar);
    }
    return undefined;
  }, [avatar]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (files && files.length > 0) {
      setFile(files[0]);
      setIsImageCropModalOpen(true);
      fileRef.current!.value = "";
    }
  }

  function handleRemoveAvatar() {
    form.setValue("avatar", undefined);
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

      <ImageCropModal
        open={isImageCropModalOpen}
        setOpen={setIsImageCropModalOpen}
        image={file}
        onComplete={(blob) => form.setValue("avatar", blob)}
      />
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
      <div className="border-input flex max-h-[106px] min-h-9 flex-wrap items-center gap-2 overflow-y-auto rounded-md border px-3 py-2 shadow-xs ring-black has-focus-visible:ring-1">
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
          className="min-w-0 grow basis-32 text-sm outline-none"
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
        className="border-input mt-3.5 flex h-36 grow flex-col gap-3 overflow-auto rounded-md border p-3 shadow-xs"
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
    <FormItem className="block">
      <FormLabel className="h-8">노트</FormLabel>
      <FormControl>
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <Textarea
              {...field}
              className="mt-3.5 h-48 resize-none"
              placeholder="캐릭터에 대한 노트를 입력하세요."
            />
          )}
        />
      </FormControl>
    </FormItem>
  );
}

function RelationBox({
  form,
  collectionUuid,
}: FormProps & { collectionUuid: string }) {
  const { relationKeys, relationValues } = useWatch<FormSchema>();
  const { collection } = useCollection(collectionUuid);
  const [isAddRelationModalOpen, setIsAddRelationModalOpen] = useState(false);
  const [relationCharacters, setRelationCharacters] = useState<
    { character: Character; relationName: string }[]
  >([]);

  useEffect(() => {
    if (!collection || !relationKeys || !relationValues) {
      return;
    }

    collection.characters
      .where("uuid")
      .anyOf(relationKeys)
      .toArray()
      .then((chars) => {
        setRelationCharacters(
          relationKeys.map((key, i) => {
            return {
              character: chars.find((c) => c.uuid === key)!,
              relationName: relationValues[i],
            };
          }),
        );
      });
  }, [collection, relationKeys, relationValues]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <Label className="shrink-0">관계</Label>
        <Button
          type="button"
          size="sm"
          onClick={() => setIsAddRelationModalOpen(true)}
        >
          <Plus />
          관계 추가
        </Button>
      </div>
      <div className="border-input mt-3.5 flex h-48 flex-wrap gap-4 overflow-scroll rounded-md border p-4 shadow-xs">
        {relationCharacters.map((r) => (
          <CharacterCard
            key={crypto.randomUUID()}
            size="sm"
            character={r.character}
            description={r.relationName}
          />
        ))}
      </div>

      <AddRelationModal
        open={isAddRelationModalOpen}
        setOpen={setIsAddRelationModalOpen}
        uuid={collectionUuid}
        onComplete={(r) => {
          const length = form.getValues("relationKeys").length;
          form.setValue(`relationKeys.${length}`, r.characterUuid);
          form.setValue(`relationValues.${length}`, r.relationName);
        }}
      />
    </div>
  );
}
