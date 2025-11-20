import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
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
import { Message } from "@/components/ui/message";
import { useCollection } from "@/hooks/useCollection";
import { Character } from "@/lib/db";
import { updateCollectionUpdatedAt } from "@/lib/utils";
import errorMessages from "@/utils/errorMessages";

import { ImageUpload } from "./ImageUpload";
import { NoteBox } from "./NoteBox";
import { PropertyBox } from "./PropertyBox";
import { RelationBox } from "./RelationBox";
import { TagBox } from "./TagBox";

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
  character?: Character;
}

export interface EditorFormProps {
  form: UseFormReturn<FormSchema>;
}

export function CharacterModal({
  open,
  setOpen,
  collectionUuid,
  character,
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

  // 캐릭터 정보가 있을 때 폼 초기화
  useEffect(() => {
    if (character) {
      form.reset({
        ...character,
      });
    }
  }, [character, form]);

  // 모달 닫힐 때 폼 초기화
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  function onSubmit(values: FormSchema) {
    if (!collection) {
      return;
    }

    setIsLoading(true);

    // 캐릭터 추가
    if (!character) {
      collection.characters
        .add({
          ...values,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .then(() => {
          updateCollectionUpdatedAt(collectionUuid);
          setOpen(false);
          form.reset();
        })
        .catch((error) => {
          console.error(error);
          toast.error("캐릭터 생성에 실패했습니다.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // 캐릭터 수정
    else {
      collection.characters
        .update(character.id, { ...values, updatedAt: new Date() })
        .then(() => {
          updateCollectionUpdatedAt(collectionUuid);
          setOpen(false);
          form.reset();
        })
        .catch((error) => {
          console.error(error);
          toast.error("캐릭터 수정에 실패했습니다.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex h-fit max-h-[calc(100dvh-48px)]! max-w-5xl! flex-col gap-0">
        <DialogHeader className="pb-2">
          <DialogTitle>캐릭터 생성</DialogTitle>
          <DialogDescription>
            제발 스크롤 내려주세요 스크롤 내리면 더 많은 옵션이 있어요
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="min-h-0 overflow-y-auto"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col">
              <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,7fr)] gap-6">
                <section id="left" className="flex shrink-0 flex-col">
                  {/* 아바타 이미지 */}
                  <ImageUpload
                    blob={form.watch("avatar")}
                    setBlob={(blob) => form.setValue("avatar", blob)}
                  />
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
              </div>

              <hr className="mt-6 mb-4" />

              <div className="grid grid-cols-2 gap-4">
                <NoteBox form={form} />
                <RelationBox form={form} collectionUuid={collectionUuid} />
              </div>
            </div>
          </form>
        </Form>

        {isLoading && (
          <Message variant="loading">
            캐릭터를 {character ? "수정" : "생성"} 중입니다...
          </Message>
        )}

        <DialogFooter className="pt-2">
          <Button disabled={isLoading} onClick={form.handleSubmit(onSubmit)}>
            {character ? "수정" : "생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
