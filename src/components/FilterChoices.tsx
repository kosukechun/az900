import { Check } from "lucide-react";
interface Choice {
  id: string;
  label: string;
  count: number;
}
/** Checkbox choices keep multiple selections usable on touch screens and keyboards. */
export function FilterChoices({
  label,
  allLabel,
  choices,
  selected,
  onChange,
}: {
  label: string;
  allLabel: string;
  choices: Choice[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  return (
    <fieldset className="filter-choices">
      <legend>
        {label}
        <span className="muted">複数選択可</span>
      </legend>
      <div className="filter-options">
        <button
          type="button"
          className={`filter-all ${!selected.length ? "selected" : ""}`}
          aria-pressed={!selected.length}
          onClick={() => onChange([])}
        >
          {!selected.length && <Check size={15} />} {allLabel}
        </button>
        {choices.map((c) => (
          <label
            className={`filter-choice ${selected.includes(c.id) ? "selected" : ""}`}
            key={c.id}
          >
            <input
              type="checkbox"
              checked={selected.includes(c.id)}
              onChange={() =>
                onChange(
                  selected.includes(c.id)
                    ? selected.filter((id) => id !== c.id)
                    : [...selected, c.id],
                )
              }
            />
            <span>{c.label}</span>
            <small>{c.count}問</small>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
