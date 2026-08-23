"use client";

import { ComponentProps, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { compressImage } from "@/utils/compress-image";

type NewEntryFormProps = {
  userId: string;
  defaultStartStock: number;
};

const MAX_FILES = 3;

function fileExtensionFromType(type: string) {
  if (type.includes("png")) {
    return "png";
  }

  if (type.includes("webp")) {
    return "webp";
  }

  return "jpg";
}

export function NewEntryForm({ userId, defaultStartStock }: NewEntryFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startStock, setStartStock] = useState(defaultStartStock);
  const [addedStock, setAddedStock] = useState(0);
  const [usedStock, setUsedStock] = useState(0);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const endStock = Math.max(startStock + addedStock - usedStock, 0);

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    let entryId: string | null = null;
    const uploadedPaths: string[] = [];

    try {
      const { data: entry, error: entryError } = await supabase
        .from("entries")
        .insert({
          user_id: userId,
          entry_date: entryDate,
          title: title.trim(),
          location: location.trim() || null,
          start_stock: startStock,
          added_stock: addedStock,
          used_stock: usedStock,
          end_stock: endStock,
          notes: notes.trim() || null,
        })
        .select("id")
        .single();

      if (entryError) {
        throw entryError;
      }

      entryId = entry.id;

      for (const file of files) {
        const compressedFile = await compressImage(file);
        const extension = fileExtensionFromType(compressedFile.type);
        const storagePath = `${userId}/${entryDate.slice(0, 7)}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("entry-photos")
          .upload(storagePath, compressedFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: compressedFile.type || "image/jpeg",
          });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(storagePath);

        const { error: photoError } = await supabase.from("entry_photos").insert({
          entry_id: entryId,
          user_id: userId,
          storage_path: storagePath,
        });

        if (photoError) {
          throw photoError;
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("entry-photos").remove(uploadedPaths);
      }

      if (entryId) {
        await supabase.from("entries").delete().eq("id", entryId);
      }

      setMessage(error instanceof Error ? error.message : "기록 저장 중 문제가 생겼습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="entry-form-panel" onSubmit={handleSubmit}>
      <div className="entry-grid two-up">
        <label className="field">
          날짜
          <input onChange={(event) => setEntryDate(event.target.value)} required type="date" value={entryDate} />
        </label>
        <label className="field">
          제목
          <input
            maxLength={60}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 수요일 저녁 훈련"
            required
            value={title}
          />
        </label>
      </div>

      <label className="field">
        장소 / 메모
        <input
          maxLength={80}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="예: 시청 체육관 A코트"
          value={location}
        />
      </label>

      <div className="entry-grid stock-grid">
        <label className="field">
          시작 수량
          <input
            min={0}
            onChange={(event) => setStartStock(Number(event.target.value) || 0)}
            required
            type="number"
            value={startStock}
          />
        </label>
        <label className="field">
          입고 수량
          <input
            min={0}
            onChange={(event) => setAddedStock(Number(event.target.value) || 0)}
            required
            type="number"
            value={addedStock}
          />
        </label>
        <label className="field">
          사용 수량
          <input
            min={0}
            onChange={(event) => setUsedStock(Number(event.target.value) || 0)}
            required
            type="number"
            value={usedStock}
          />
        </label>
        <label className="field">
          종료 수량
          <input readOnly type="number" value={endStock} />
        </label>
      </div>

      <label className="field">
        상세 메모
        <textarea
          maxLength={300}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="컨디션, 사용한 셔틀콕 상태, 구매 사유 등을 남겨두세요."
          rows={5}
          value={notes}
        />
      </label>

      <label className="field">
        사진 업로드
        <input
          accept="image/*"
          multiple
          onChange={(event) => {
            const selectedFiles = Array.from(event.target.files ?? []).slice(0, MAX_FILES);
            setFiles(selectedFiles);
          }}
          type="file"
        />
      </label>

      <p className="auth-help">사진은 최대 {MAX_FILES}장까지 가능하며, 업로드 전에 자동으로 축소/압축됩니다.</p>

      {files.length > 0 ? (
        <div className="file-pill-list">
          {files.map((file) => (
            <span className="file-pill" key={`${file.name}-${file.lastModified}`}>
              {file.name}
            </span>
          ))}
        </div>
      ) : null}

      <button className="primary-action" disabled={isSubmitting} type="submit">
        {isSubmitting ? "저장 중..." : "기록 저장"}
      </button>

      {message ? <p className="auth-message">{message}</p> : null}
    </form>
  );
}
