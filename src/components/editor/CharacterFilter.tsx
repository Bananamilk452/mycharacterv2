import { SearchIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { AdvancedSearchModal } from "./AdvancedSearchModal";
import { SearchParam } from "./Characters";

interface CharacterFilterProps {
  searchParams: SearchParam[];
  setSearchParams: (searchParams: SearchParam[]) => void;
  characterSize: number;
  setCharacterSize: (size: number) => void;
}

export function CharacterFilter({
  searchParams,
  setSearchParams,
  characterSize,
  setCharacterSize,
}: CharacterFilterProps) {
  const [isAdvancedSearchModalOpen, setIsAdvancedSearchModalOpen] =
    useState(false);

  return (
    <div className="flex h-fit w-full items-center justify-end gap-4 border-b px-4 py-2">
      <div className="flex w-48 items-center gap-2">
        <Label className="shrink-0">캐릭터 크기</Label>
        <Slider
          value={[characterSize]}
          onValueChange={(v) => setCharacterSize(v[0])}
          min={0}
          max={3}
          step={1}
        />
      </div>
      {searchParams.length > 0 && (
        <p className="text-sm text-gray-600">
          {searchParams.length}개의 검색 조건 적용됨
        </p>
      )}
      <Button onClick={() => setIsAdvancedSearchModalOpen(true)}>
        <div className="flex items-center gap-2">
          <SearchIcon className="size-4" />
          고급 검색
        </div>
      </Button>
      <AdvancedSearchModal
        open={isAdvancedSearchModalOpen}
        setOpen={setIsAdvancedSearchModalOpen}
        onComplete={setSearchParams}
      />
    </div>
  );
}
