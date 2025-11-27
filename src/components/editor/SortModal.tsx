import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SortParam } from "./Characters";

interface SortModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onComplete: (sortParams: SortParam) => void;
}

const formSchema = z.union([
  z.object({
    type: z.enum(["name", "createdAt", "updatedAt"]),
    order: z.enum(["asc", "desc"]),
    value: z.string().optional(),
  }),
  z.object({
    type: z.enum(["property"]),
    order: z.enum(["asc", "desc"]),
    value: z.string().min(1, { error: "속성 이름을 입력해주세요." }),
  }),
]);

type FormSchema = z.infer<typeof formSchema>;

export function SortModal({ open, setOpen, onComplete }: SortModalProps) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "createdAt",
      order: "asc",
      value: "",
    },
  });

  const { type } = useWatch<FormSchema>({ control: form.control });
  const isPropertyType = type === "property";

  function onSubmit(values: FormSchema) {
    onComplete({
      type: values.type,
      order: values.order,
      value: values.value || "",
    });
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        form.reset({
          type: "name",
          order: "asc",
          value: "",
        });
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>정렬</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>정렬 기준</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="정렬 기준 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">이름</SelectItem>
                          <SelectItem value="createdAt">생성일</SelectItem>
                          <SelectItem value="updatedAt">수정일</SelectItem>
                          <SelectItem value="property">속성</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>정렬 순서</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="정렬 순서 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">오름차순</SelectItem>
                          <SelectItem value="desc">내림차순</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {isPropertyType && (
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>속성 이름</FormLabel>
                    <FormControl>
                      <Input placeholder="속성 이름 입력" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button onClick={form.handleSubmit(onSubmit)}>정렬</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
