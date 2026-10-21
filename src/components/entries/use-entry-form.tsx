"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type ComponentProps } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type UseEntryFormProps = {
  userId: string;
  defaultStartStock: number;
};

export function UseEntryForm({ userId, defaultStartStock }: UseEntryFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [usedStock, setUsedStock] = useState(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 시작 재고에서 사용량 차감 (음수 방지)
  const endStock = Math.max(defaultStartStock - usedStock, 0);

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase.from("entries").insert({
        user_id: userId,
        entry_date: entryDate,
        title: `사용 기록 ${entryDate}`,
        location: null,
        start_stock: defaultStartStock,
        added_stock: 0,
        used_stock: usedStock,
        end_stock: endStock,
        notes: notes.trim() || null,
      });

      if (error) throw error;

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "기록 저장 중 문제가 생겼습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="entry-mobile-form" onSubmit={handleSubmit}>
      {/* 재고 요약 카드 */}
      <section className="entry-mobile-summary-card">
        <div>
          <span>현재 재고</span>
          <strong>{defaultStartStock}</strong>
        </div>
        <div className="entry-summary-divider" />
        <div>
          <span>사용 후 잔량</span>
          <strong className={endStock === 0 ? "use-stock-zero" : ""}>{endStock}</strong>
        </div>
      </section>

      {/* 날짜 + 사용량 */}
      <section className="entry-section-card">
        <div className="entry-section-heading">
          <h2>사용 정보</h2>
          <p>날짜와 사용한 셔틀콕 수량을 입력하세요.</p>
        </div>

        <div className="entry-grid two-up">
          <label className="field">
            날짜
            <input
              onChange={(e) => setEntryDate(e.target.value)}
              required
              type="date"
              value={entryDate}
            />
          </label>
          <label className="field compact-field">
            <span>사용 수량</span>
            <input
              min={0}
              max={defaultStartStock}
              onChange={(e) => setUsedStock(Number(e.target.value) || 0)}
              required
              type="number"
              value={usedStock}
            />
          </label>
        </div>

        <label className="field">
          메모 (선택)
          <textarea
            maxLength={300}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="현장 상황, 셔틀 상태 등을 남겨두세요."
            rows={3}
            value={notes}
          />
        </label>
      </section>

      {message ? <p className="auth-message">{message}</p> : null}

      <div className="entry-submit-dock">
        <div>
          <span>저장 후 즉시 히스토리 반영</span>
          <strong>{isSubmitting ? "처리 중..." : `잔량 ${endStock}개`}</strong>
        </div>
        <button className="primary-action entry-submit-button" disabled={isSubmitting || usedStock === 0} type="submit">
          {isSubmitting ? "저장 중..." : "사용 기록"}
        </button>
      </div>
    </form>
  );
}
