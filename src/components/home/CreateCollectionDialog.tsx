import { zodResolver } from "@hookform/resolvers/zod";
import { usePath } from "crossroad";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { createCollection } from "@/lib/db";
import errorMessages from "@/utils/errorMessages";

import { Message } from "../ui/message";

const formSchema = z.object({
  collectionName: z.string().min(1, errorMessages.MIN_1_CHAR),
});

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CreateCollectionDialog({ open, setOpen }: Props) {
  const [, setPath] = usePath();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionName: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    createCollection(values.collectionName)
      .then((db) => {
        db.collectionInfo.get(1).then((col) => {
          setPath(`/editor/${col!.uuid}`);
          setOpen(false);
          form.reset();
        });
      })
      .catch((err) => {
        console.error(err);
        form.setError("collectionName", {
          message: errorMessages.COLLECTION_NAME_EXISTS,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>콜렉션 생성</DialogTitle>
          <DialogDescription>콜렉션을 생성합니다.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="collectionName"
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
