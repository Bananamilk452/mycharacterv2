import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useState } from "react";
import { Editor as TinyMCEEditor } from "tinymce";

import { Label } from "../ui/label";
import { EditorFormProps } from "./CharacterModal";

export function NoteBox({ form }: EditorFormProps) {
  const [editorRef, setEditorRef] = useState<TinyMCEEditor | null>(null);
  const note = form.watch("note");

  useEffect(() => {
    if (editorRef) {
      editorRef.setContent(note || "");
    }
  }, [editorRef, note]);

  return (
    <div className="flex flex-col">
      <div className="flex h-8 items-center justify-between">
        <Label className="shrink-0">노트</Label>
      </div>
      <div className="mt-3.5 h-48">
        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          licenseKey="gpl"
          init={{
            height: 256,
            menubar: "file edit insert format table",
            plugins: [
              "autosave",
              "autolink",
              "lists",
              "link",
              "image",
              "preview",
              "anchor",
              "searchreplace",
              "visualblocks",
              "fullscreen",
              "table",
              "code",
            ],
            toolbar:
              "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
            content_style:
              "body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px }",
            branding: false,
            resize: false,
            elementpath: false,
            statusbar: false,
            language: "ko_KR",
            mobile: {
              toolbar_mode: "floating",
              menubar: "file edit insert format table",
            },
          }}
          onInit={(_, editor) => {
            setEditorRef(editor);

            // Fix for TinyMCE menu being outside of dialog
            const menu = document.querySelector(
              ".tox.tox-silver-sink.tox-tinymce-aux",
            );
            if (menu) {
              document.querySelector('[role="dialog"]')?.appendChild(menu);
            }
          }}
          onChange={(e) => {
            const content = e.target.getContent();
            form.setValue("note", content);
          }}
        />
      </div>
    </div>
  );
}
