import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSearchParamDescription } from "@/lib/utils";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SearchParam } from "./Characters";

interface AdvancedSearchModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onComplete: (searchParams: SearchParam[]) => void;
}

export function AdvancedSearchModal({
  open,
  setOpen,
  onComplete,
}: AdvancedSearchModalProps) {
  const [searchParams, setSearchParams] = useState<SearchParam[]>([]);

  const searchParamDescription = useMemo(() => {
    return searchParams
      .map((param) =>
        getSearchParamDescription(
          param.type,
          param.operation,
          param.key,
          param.value,
        ),
      )
      .join("\n그리고\n");
  }, [searchParams]);

  function onSearch() {
    onComplete(searchParams);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        setSearchParams([]);
      }}
    >
      <DialogContent className="max-w-xl!">
        <DialogHeader>
          <DialogTitle>고급 검색</DialogTitle>
        </DialogHeader>

        <AddSearchParam setSearchParams={setSearchParams} />

        <div className="flex items-start gap-4 rounded-md border p-4">
          <p className="grow text-sm whitespace-pre-wrap text-gray-600">
            검색 조건: {searchParamDescription}
          </p>
          <Button
            variant="outline"
            className="shrink-0"
            onClick={() => {
              setSearchParams([]);
            }}
          >
            검색 조건 초기화
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={onSearch}>검색</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddSearchParam({
  setSearchParams,
}: {
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParam[]>>;
}) {
  const [type, setType] = useState<SearchParam["type"] | undefined>();
  const [operation, setOperation] = useState<
    SearchParam["operation"] | undefined
  >();
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");

  const onlyNumberOperations = [
    { label: "보다 큰 (숫자인 경우에만)", value: ">" },
    { label: "보다 작은 (숫자인 경우에만)", value: "<" },
    { label: "보다 크거나 같은 (숫자인 경우에만)", value: ">=" },
    { label: "보다 작거나 같은 (숫자인 경우에만)", value: "<=" },
  ];

  const searchParamDescription = useMemo(() => {
    if (type === "text" || type === "relation") {
      return getSearchParamDescription(type, operation, undefined, input1);
    } else if (type === "property") {
      return getSearchParamDescription(type, operation, input1, input2);
    }
  }, [type, operation, input1, input2]);

  function onAdd() {
    if (!type || !operation || !input1) return;
    if (type === "property" && !input2) {
      return;
    }

    if (
      Number.isNaN(Number(input2)) &&
      ["<", ">", "<=", ">="].includes(operation)
    ) {
      alert("숫자 연산자는 숫자 값에만 사용할 수 있습니다.");
      return;
    }

    const newParam: SearchParam = {
      type,
      operation,
      key: type === "text" ? undefined : input1,
      value: type === "text" ? input1 : input2,
    };

    setSearchParams((prev) => [...prev, newParam]);
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border p-4">
      <p className="font-medium">검색 조건 추가</p>
      <div className="flex flex-col gap-2">
        <Label>유형</Label>
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value as SearchParam["type"]);
            setOperation(
              value === "text" || value === "relation" ? "=" : undefined,
            );
            setInput1("");
            setInput2("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="유형 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">이름</SelectItem>
            <SelectItem value="property">속성</SelectItem>
            <SelectItem value="relation">관계</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>연산자</Label>
        <Select
          disabled={!type}
          value={operation}
          onValueChange={(value) => {
            setOperation(value as SearchParam["operation"]);
            setInput1("");
            setInput2("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="연산자 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="=">완전히 일치</SelectItem>
            {/* <SelectItem value="%">포함</SelectItem> */}
            {type === "property" &&
              onlyNumberOperations.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>값</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            disabled={!operation}
            type="text"
            value={input1}
            placeholder={
              type === "property"
                ? "속성 이름"
                : type === "relation"
                  ? "관계 이름"
                  : "이름"
            }
            onChange={(e) => setInput1(e.target.value)}
          />
          {type === "property" && (
            <Input
              disabled={!operation}
              type="text"
              value={input2}
              placeholder="속성 값"
              onChange={(e) => setInput2(e.target.value)}
            />
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600">{searchParamDescription}</p>

      <div className="flex justify-end">
        <Button disabled={!type || !operation || !input1} onClick={onAdd}>
          추가
        </Button>
      </div>
    </div>
  );
}
