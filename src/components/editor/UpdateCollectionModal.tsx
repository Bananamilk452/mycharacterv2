import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Message } from "@/components/ui/message";
import { useCollection } from "@/hooks/useCollection";
import { updateCollectionUpdatedAt } from "@/lib/utils";
import errorMessages from "@/utils/errorMessages";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ImageUpload } from "./ImageUpload";

const formSchema = z.object({
  name: z.string().min(1, errorMessages.MIN_1_CHAR),
  description: z.string().optional(),
  characterDescription: z.string().optional(),
  icon: z.instanceof(Blob).optional(),
});

type FormSchema = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  collectionUuid: string;
}

export function UpdateCollectionModal({
  open,
  setOpen,
  collectionUuid,
}: Props) {
  const { collection, collectionInfo } = useCollection(collectionUuid);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      characterDescription: "",
      icon: undefined,
    },
  });

  // 콜렉션 정보가 있을 때 폼 초기화
  useEffect(() => {
    if (collectionInfo) {
      form.reset({
        ...collectionInfo,
      });
    }
  }, [collectionInfo, form]);

  // 모달 닫힐 때 폼 초기화
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  function onSubmit(values: FormSchema) {
    if (!collection || !collectionInfo) {
      return;
    }

    setIsLoading(true);

    collection.collectionInfo
      .update(1, {
        ...values,
      })
      .then(() => {
        updateCollectionUpdatedAt(collectionUuid);
        toast.success("콜렉션이 수정되었습니다.");
        setOpen(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error("콜렉션 수정에 실패했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>콜렉션 수정</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col gap-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-2">
              <Label>아이콘</Label>
              <div className="w-36">
                <ImageUpload
                  blob={form.watch("icon")}
                  setBlob={(blob) => form.setValue("icon", blob)}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>콜렉션 이름</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="콜렉션 이름" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>콜렉션 설명</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="h-24 resize-none"
                      placeholder="콜렉션 설명"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="characterDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>캐릭터 설명 템플릿</FormLabel>
                  <FormDescription>
                    원하는 속성을 &#123;&#123; 속성명 &#125;&#125; 형식으로
                    입력하세요. 예: 종족: &#123;&#123; 종족 &#125;&#125;, 나이:
                    &#123;&#123; 나이 &#125;&#125;
                  </FormDescription>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="캐릭터 설명 템플릿"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {isLoading && (
          <Message variant="loading">콜렉션 수정 중입니다...</Message>
        )}

        <DialogFooter>
          <Button disabled={isLoading} onClick={form.handleSubmit(onSubmit)}>
            수정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
