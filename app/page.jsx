"use client";

import { useState, useEffect } from "react";

const T = {
  bg: "#0D0F14",
  surface: "#161A22",
  surfaceHigh: "#1E2430",
  border: "#2A3040",
  amber: "#F5A623",
  amberDim: "#C47E0F",
  green: "#3DDC84",
  red: "#FF5A5A",
  blue: "#5B9CF6",
  text: "#E8EAF0",
  muted: "#8B92A0",
  white: "#FFFFFF",
};

const today = () =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// ── localStorage persistence (replaces window.storage from Claude sandbox) ──
const storage = {
  get: (key) => {
    try {
      const val = localStorage.getItem(key);
      return val ? { value: val } : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return { value };
    } catch {
      return null;
    }
  },
};

// ── Claude API ────────────────────────────────────────────────────
async function callClaude(prompt, systemPrompt = "") {
  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemPrompt }),
  });
  const data = await response.json();
  return data.text || "";
}

// ── Shared components ─────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ text, color = T.amber }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.18em",
        color,
        textTransform: "uppercase",
        marginBottom: 14,
      }}
    >
      {text}
    </div>
  );
}

function Tag({ label, color = T.amber }) {
  return (
    <span
      style={{
        background: `${color}22`,
        color,
        fontSize: 11,
        fontWeight: 600,
        borderRadius: 4,
        padding: "2px 8px",
        marginRight: 6,
      }}
    >
      {label}
    </span>
  );
}

// ── Quote ─────────────────────────────────────────────────────────
function QuoteSection({ quote, loading }) {
  return (
    <div
      style={{
        borderLeft: `4px solid ${T.amber}`,
        paddingLeft: 20,
        marginBottom: 32,
      }}
    >
      {loading ? (
        <div style={{ color: T.muted, fontSize: 14 }}>
          Generating your morning call…
        </div>
      ) : (
        <>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: T.white,
              lineHeight: 1.4,
              fontStyle: "italic",
            }}
          >
            "{quote?.text}"
          </div>
          {quote?.author && (
            <div
              style={{ color: T.amber, fontSize: 13, marginTop: 8, fontWeight: 600 }}
            >
              — {quote.author}
            </div>
          )}
          {quote?.context && (
            <div style={{ color: T.muted, fontSize: 12, marginTop: 6 }}>
              {quote.context}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Training ──────────────────────────────────────────────────────
function TrainingSection({ training, loading, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");

  const handleSave = () => {
    storage.set("training_note", input);
    setEditing(false);
    onUpdate(input);
  };

  return (
    <Card>
      <SectionLabel text="Today's Training" color={T.green} />
      {loading ? (
        <div style={{ color: T.muted, fontSize: 14 }}>Loading training plan…</div>
      ) : (
        <>
          {training ? (
            <div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                {training.tags?.map((t) => (
                  <Tag key={t} label={t} color={T.green} />
                ))}
              </div>
              {training.sessions?.map((s, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 12,
                    paddingLeft: 12,
                    borderLeft: `2px solid ${T.border}`,
                  }}
                >
                  <div style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>
                    {s.title}
                  </div>
                  <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
                    {s.detail}
                  </div>
                  {s.metrics && (
                    <div style={{ color: T.amber, fontSize: 12, marginTop: 4 }}>
                      {s.metrics}
                    </div>
                  )}
                </div>
              ))}
              {training.tss && (
                <div style={{ color: T.muted, fontSize: 12, marginTop: 8 }}>
                  Estimated TSS:{" "}
                  <span style={{ color: T.green }}>{training.tss}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: T.muted, fontSize: 13 }}>
              No training data. Paste your TrainingPeaks session below.
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: T.surfaceHigh,
                  border: `1px solid ${T.border}`,
                  color: T.amber,
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                + Paste today's session
              </button>
            ) : (
              <div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste TrainingPeaks session details here…"
                  style={{
                    width: "100%",
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    borderRadius: 6,
                    padding: 10,
                    fontSize: 13,
                    minHeight: 80,
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={handleSave}
                    style={{
                      background: T.amber,
                      border: "none",
                      color: T.bg,
                      borderRadius: 6,
                      padding: "6px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    style={{
                      background: T.surfaceHigh,
                      border: `1px solid ${T.border}`,
                      color: T.muted,
                      borderRadius: 6,
                      padding: "6px 14px",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

// ── Stretch ───────────────────────────────────────────────────────
function StretchSection({ stretch, loading }) {
  const [active, setActive] = useState(null);
  return (
    <Card>
      <SectionLabel text="Morning Stretch Routine · 15 min" color={T.blue} />
      <div style={{ color: T.muted, fontSize: 12, marginBottom: 14 }}>
        Personalised to today's training load
      </div>
      {loading ? (
        <div style={{ color: T.muted, fontSize: 14 }}>Building your routine…</div>
      ) : (
        <div>
          {stretch?.exercises?.map((ex, i) => (
            <div
              key={i}
              onClick={() => setActive(active === i ? null : i)}
              style={{
                cursor: "pointer",
                padding: "10px 0",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>
                  {ex.name}
                </div>
                <div style={{ color: T.blue, fontSize: 12 }}>{ex.duration}</div>
              </div>
              {active === i && (
                <div
                  style={{
                    color: T.muted,
                    fontSize: 12,
                    marginTop: 8,
                    lineHeight: 1.6,
                  }}
                >
                  {ex.instruction}
                </div>
              )}
            </div>
          ))}
          <div style={{ color: T.amber, fontSize: 11, marginTop: 12 }}>
            Tap any exercise for cue
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Breath ────────────────────────────────────────────────────────
function BreathSection({ breath, loading }) {
  const [phase, setPhase] = useState(null);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timer;
    if (running && breath) {
      const phases = breath.pattern;
      const current = phases[count % phases.length];
      setPhase(current);
      timer = setTimeout(() => setCount((c) => c + 1), current.seconds * 1000);
    }
    return () => clearTimeout(timer);
  }, [running, count, breath]);

  return (
    <Card>
      <SectionLabel text="Breathing Exercise · 5 min" color={T.blue} />
      {loading ? (
        <div style={{ color: T.muted, fontSize: 14 }}>Preparing…</div>
      ) : (
        <div>
          <div
            style={{
              color: T.text,
              fontSize: 14,
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            {breath?.name}
          </div>
          <div style={{ color: T.muted, fontSize: 12, marginBottom: 16 }}>
            {breath?.purpose}
          </div>
          {running && phase && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: T.blue }}>
                {phase.label}
              </div>
              <div style={{ color: T.muted, fontSize: 13, marginTop: 8 }}>
                {phase.seconds}s
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setRunning(!running);
              setCount(0);
              setPhase(null);
            }}
            style={{
              background: running ? T.surfaceHigh : T.blue,
              border: `1px solid ${T.border}`,
              color: running ? T.muted : T.white,
              borderRadius: 6,
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {running ? "Stop" : "Start Session"}
          </button>
        </div>
      )}
    </Card>
  );
}

// ── News ──────────────────────────────────────────────────────────
function NewsSection({ news, loading }) {
  return (
    <Card>
      <SectionLabel text="Today's Top News" />
      {loading ? (
        <div style={{ color: T.muted, fontSize: 14 }}>Fetching headlines…</div>
      ) : (
        <div>
          <div
            style={{
              color: T.muted,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            UK
          </div>
          {news?.uk?.map((n, i) => (
            <div
              key={i}
              style={{
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>
                {n.headline}
              </div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>
                {n.summary}
              </div>
            </div>
          ))}
          <div
            style={{
              color: T.muted,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              margin: "16px 0 10px",
              textTransform: "uppercase",
            }}
          >
            Markets & Finance
          </div>
          {news?.markets?.map((n, i) => (
            <div
              key={i}
              style={{
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>
                {n.headline}
              </div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>
                {n.summary}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Portfolio ─────────────────────────────────────────────────────
function PortfolioSection({ portfolio, setPortfolio }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(portfolio?.raw || "");

  const handleSave = () => {
    const updated = { raw: input, updated: new Date().toISOString() };
    storage.set("portfolio", JSON.stringify(updated));
    setPortfolio(updated);
    setEditing(false);
  };

  const lastUpdated = portfolio?.updated
    ? new Date(portfolio.updated).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <Card>
      <SectionLabel text="Portfolio Snapshot" color={T.amber} />
      {portfolio?.summary ? (
        <div>
          {lastUpdated && (
            <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>
              Last updated {lastUpdated}
            </div>
          )}
          <div style={{ color: T.text, fontSize: 13, lineHeight: 1.7 }}>
            {portfolio.summary}
          </div>
          {portfolio?.positions?.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: `1px solid ${T.border}`,
                fontSize: 13,
              }}
            >
              <div style={{ color: T.text, fontWeight: 600 }}>{p.ticker}</div>
              <div style={{ color: p.change >= 0 ? T.green : T.red }}>
                {p.change >= 0 ? "+" : ""}
                {p.change}%
              </div>
              <div style={{ color: T.muted }}>{p.note}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: T.muted, fontSize: 13 }}>
          No portfolio data yet. Add your positions below for monthly tracking.
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              background: T.surfaceHigh,
              border: `1px solid ${T.border}`,
              color: T.amber,
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {portfolio?.raw ? "Update Monthly Positions" : "+ Add Positions"}
          </button>
        ) : (
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. AAPL: 20 shares @ £180, VWRL: 50 shares @ £95"
              style={{
                width: "100%",
                background: T.bg,
                border: `1px solid ${T.border}`,
                color: T.text,
                borderRadius: 6,
                padding: 10,
                fontSize: 13,
                minHeight: 100,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={handleSave}
                style={{
                  background: T.amber,
                  border: "none",
                  color: T.bg,
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  background: T.surfaceHigh,
                  border: `1px solid ${T.border}`,
                  color: T.muted,
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Nutrition ─────────────────────────────────────────────────────
function NutritionSection({ nutrition, loading, onLog }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");

  const handleSave = () => {
    const prev = JSON.parse(storage.get("nutrition_log")?.value || "[]");
    const entry = { date: new Date().toLocaleDateString("en-GB"), log: input };
    storage.set("nutrition_log", JSON.stringify([entry, ...prev].slice(0, 14)));
    setEditing(false);
    onLog(input);
  };

  return (
    <Card>
      <SectionLabel text="Nutrition · Yesterday's Review" color={T.green} />
      {loading ? (
        <div style={{ color: T.muted, fontSize: 14 }}>Analysing…</div>
      ) : nutrition?.analysis ? (
        <div>
          <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
            {[
              {
                label: "Calories",
                val: nutrition.calories,
                goal: nutrition.calGoal,
                unit: "kcal",
              },
              {
                label: "Protein",
                val: nutrition.protein,
                goal: nutrition.protGoal,
                unit: "g",
              },
            ].map((m) => (
              <div key={m.label} style={{ flex: 1 }}>
                <div style={{ color: T.muted, fontSize: 11, marginBottom: 4 }}>
                  {m.label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: m.val >= m.goal ? T.green : T.amber,
                  }}
                >
                  {m.val}
                  <span style={{ fontSize: 12, color: T.muted }}>{m.unit}</span>
                </div>
                <div style={{ color: T.muted, fontSize: 11 }}>
                  Goal: {m.goal}
                  {m.unit}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              color: T.text,
              fontSize: 13,
              lineHeight: 1.7,
              marginBottom: 12,
            }}
          >
            {nutrition.analysis}
          </div>
          <div
            style={{
              color: T.muted,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            Today's Suggestions
          </div>
          {nutrition.suggestions?.map((s, i) => (
            <div
              key={i}
              style={{
                color: T.text,
                fontSize: 13,
                padding: "6px 0",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <span style={{ color: T.amber, marginRight: 8 }}>→</span>
              {s}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: T.muted, fontSize: 13 }}>
          Log yesterday's meals to get analysis and suggestions.
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              background: T.surfaceHigh,
              border: `1px solid ${T.border}`,
              color: T.green,
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            + Log yesterday's food
          </button>
        ) : (
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Breakfast: oats 80g, banana, 2 eggs. Lunch: chicken 150g, rice 100g…"
              style={{
                width: "100%",
                background: T.bg,
                border: `1px solid ${T.border}`,
                color: T.text,
                borderRadius: 6,
                padding: 10,
                fontSize: 13,
                minHeight: 100,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={handleSave}
                style={{
                  background: T.green,
                  border: "none",
                  color: T.bg,
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Save & Analyse
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  background: T.surfaceHigh,
                  border: `1px solid ${T.border}`,
                  color: T.muted,
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Business ──────────────────────────────────────────────────────
function BusinessSection({ business, loading }) {
  return (
    <Card>
      <SectionLabel text="Business · Next 3 Actions" color={T.amber} />
      {loading ? (
        <div style={{ color: T.muted, fontSize: 14 }}>
          Generating priorities…
        </div>
      ) : (
        <div>
          {business?.actions?.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 14,
                padding: "12px 0",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: T.amber,
                  opacity: 0.3,
                  minWidth: 32,
                  lineHeight: 1,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 14 }}>
                  {a.title}
                </div>
                <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>
                  {a.detail}
                </div>
                {a.impact && (
                  <div style={{ color: T.amber, fontSize: 11, marginTop: 6 }}>
                    Impact: {a.impact}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Feedback ──────────────────────────────────────────────────────
function FeedbackSection() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  const save = () => {
    const prev = JSON.parse(storage.get("feedback_log")?.value || "[]");
    const entry = { date: new Date().toLocaleDateString("en-GB"), note: text };
    storage.set(
      "feedback_log",
      JSON.stringify([entry, ...prev].slice(0, 30))
    );
    setSaved(true);
    setOpen(false);
    setText("");
  };

  return (
    <Card style={{ border: `1px solid ${T.amber}44` }}>
      <SectionLabel text="End of Day Feedback" color={T.amber} />
      <div style={{ color: T.muted, fontSize: 12, marginBottom: 16 }}>
        How did today go? Training completed? How do you feel? Anything to carry
        forward?
      </div>
      {saved ? (
        <div style={{ color: T.green, fontSize: 13 }}>
          ✓ Logged. See you tomorrow.
        </div>
      ) : !open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: T.amber,
            border: "none",
            color: T.bg,
            borderRadius: 6,
            padding: "8px 20px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Add Daily Reflection
        </button>
      ) : (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Today I completed… I felt… Tomorrow I want to…"
            style={{
              width: "100%",
              background: T.bg,
              border: `1px solid ${T.amber}`,
              color: T.text,
              borderRadius: 6,
              padding: 10,
              fontSize: 13,
              minHeight: 100,
              resize: "vertical",
              boxSizing: "border-box",
            }}
            autoFocus
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={save}
              style={{
                background: T.amber,
                border: "none",
                color: T.bg,
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Save Reflection
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: T.surfaceHigh,
                border: `1px solid ${T.border}`,
                color: T.muted,
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function DailyBrief() {
  const [quote, setQuote] = useState(null);
  const [training, setTraining] = useState(null);
  const [stretch, setStretch] = useState(null);
  const [breath, setBreath] = useState(null);
  const [news, setNews] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState({});
  const [trainingNote, setTrainingNote] = useState("");
  const [nutritionLog, setNutritionLog] = useState("");

  const setLoad = (k, v) => setLoading((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    // Load persisted data
    try {
      const pf = storage.get("portfolio");
      if (pf?.value) setPortfolio(JSON.parse(pf.value));
      const tn = storage.get("training_note");
      if (tn?.value) setTrainingNote(tn.value);
      const nl = storage.get("nutrition_log");
      if (nl?.value) {
        const logs = JSON.parse(nl.value);
        if (logs[0]) setNutritionLog(logs[0].log);
      }
    } catch {}
    generateAll();
  }, []);

  const generateAll = async () => {
    // Quote
    setLoad("quote", true);
    try {
      const raw = await callClaude(
        `Generate a powerful, specific motivational quote for an elite athlete targeting Olympic competition. Former national-level gymnast turned marathon runner, now targeting long-course triathlon and ultimately the Olympics. Make it feel earned, not generic. Return JSON: {"text":"...","author":"...","context":"..."}`
      );
      setQuote(JSON.parse(raw));
    } catch {
      setQuote({
        text: "The Olympics are not given. They are taken, one session at a time.",
        author: "The Daily Brief",
      });
    }
    setLoad("quote", false);

    // Training
    setLoad("training", true);
    try {
      const note = storage.get("training_note")?.value || "";
      const raw = await callClaude(
        `You are a TrainingPeaks coach. The athlete is in a 5K speed block targeting 15:30-15:45 by mid-July 2026. Current threshold: ~4:06/km. Double threshold days Tue/Thu (AM flat reps, PM uphill). Today is ${new Date().toLocaleDateString("en-GB", { weekday: "long" })}. ${note ? `Session details: ${note}` : "Generate a typical session for this day of the week."} Return JSON: {"tags":["..."],"sessions":[{"title":"...","detail":"...","metrics":"..."}],"tss":number}`
      );
      setTraining(JSON.parse(raw));
    } catch {
      setTraining({
        tags: ["Threshold"],
        sessions: [
          {
            title: "Check session details",
            detail: "Paste your TrainingPeaks session below for analysis.",
            metrics: "",
          },
        ],
        tss: null,
      });
    }
    setLoad("training", false);

    // Stretch
    setLoad("stretch", true);
    try {
      const raw = await callClaude(
        `Design a 15-minute morning stretching routine for an elite triathlete doing threshold running today. Focus on hip flexors, hamstrings, calves, thoracic spine. 7-9 exercises. Return JSON: {"exercises":[{"name":"...","duration":"...","instruction":"..."}]}`
      );
      setStretch(JSON.parse(raw));
    } catch {
      setStretch({
        exercises: [
          { name: "Hip Flexor Lunge", duration: "90s each", instruction: "Low lunge, drive hips forward, torso upright." },
          { name: "Standing Hamstring Fold", duration: "60s each", instruction: "Hinge from hips, soft knees, reach for the floor." },
          { name: "Calf Stretch", duration: "60s each", instruction: "Heel off step edge, lower slowly." },
          { name: "Thoracic Rotation", duration: "90s each", instruction: "Hands behind head, rotate through mid-back." },
          { name: "Pigeon Pose", duration: "2min each", instruction: "Front shin parallel, fold torso forward." },
          { name: "World's Greatest Stretch", duration: "5 reps each", instruction: "Lunge, elbow to floor, extend arm to ceiling." },
        ],
      });
    }
    setLoad("stretch", false);

    // Breath
    setLoad("breath", true);
    try {
      const raw = await callClaude(
        `Design a 5-minute breathing exercise for an elite athlete first thing in the morning to activate the nervous system and build focus. Return JSON: {"name":"...","purpose":"...","pattern":[{"label":"Inhale","seconds":4},{"label":"Hold","seconds":4},{"label":"Exhale","seconds":6},{"label":"Hold","seconds":2}]}`
      );
      setBreath(JSON.parse(raw));
    } catch {
      setBreath({
        name: "Box + Elongated Exhale",
        purpose: "Activates parasympathetic baseline, then primes CNS for output.",
        pattern: [
          { label: "Inhale", seconds: 4 },
          { label: "Hold", seconds: 4 },
          { label: "Exhale", seconds: 6 },
          { label: "Hold", seconds: 2 },
        ],
      });
    }
    setLoad("breath", false);

    // News
    setLoad("news", true);
    try {
      const raw = await callClaude(
        `Today is ${new Date().toLocaleDateString("en-GB")}. Generate 3 UK news headlines and 7 finance/markets headlines covering major indices, commodities, crypto, and macro moves. Be specific with figures. Return JSON: {"uk":[{"headline":"...","summary":"..."}],"markets":[{"headline":"...","summary":"..."}]}`
      );
      setNews(JSON.parse(raw));
    } catch {
      setNews({
        uk: [{ headline: "News unavailable", summary: "Check BBC or Sky News." }],
        markets: [{ headline: "Markets data unavailable", summary: "Check Bloomberg or FT." }],
      });
    }
    setLoad("news", false);

    // Portfolio
    try {
      const pf = storage.get("portfolio");
      if (pf?.value) {
        const saved = JSON.parse(pf.value);
        setLoad("portfolio", true);
        const raw = await callClaude(
          `The user holds: ${saved.raw}. Summarise portfolio performance based on current market conditions (${new Date().toLocaleDateString("en-GB")}). Return JSON: {"summary":"...","positions":[{"ticker":"...","change":0.0,"note":"..."}]}`
        );
        setPortfolio({ ...saved, ...JSON.parse(raw) });
        setLoad("portfolio", false);
      }
    } catch {}

    // Nutrition
    setLoad("nutrition", true);
    try {
      const nl = storage.get("nutrition_log");
      const logs = nl?.value ? JSON.parse(nl.value) : [];
      if (logs[0]) {
        const raw = await callClaude(
          `Analyse yesterday's food log for an elite endurance athlete targeting ~3000 kcal/day and 160g+ protein. Food: "${logs[0].log}". Return JSON: {"calories":0,"protein":0,"calGoal":3000,"protGoal":160,"analysis":"...","suggestions":["...","...","..."]}`
        );
        setNutrition(JSON.parse(raw));
      }
    } catch {}
    setLoad("nutrition", false);

    // Business
    setLoad("business", true);
    try {
      const raw = await callClaude(
        `You are a startup advisor for a UK endurance sports supplement e-commerce brand targeting triathletes. Lead product: electrolyte powder. Model: dropshipping. Generate the 3 most impactful next actions. Return JSON: {"actions":[{"title":"...","detail":"...","impact":"..."}]}`
      );
      setBusiness(JSON.parse(raw));
    } catch {
      setBusiness({
        actions: [
          {
            title: "Define your electrolyte formula USP",
            detail: "Research competitor gaps — sodium ratio, clean label, taste.",
            impact: "Foundation of all marketing and product claims.",
          },
        ],
      });
    }
    setLoad("business", false);
  };

  return (
    <div
      style={{
        background: T.bg,
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: T.text,
        padding: "0 0 60px",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          padding: "20px 24px 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: T.amber,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Daily Brief
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.white }}>
                {today()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: T.muted }}>Target</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.amber }}>
                Olympic Qualification
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        style={{ maxWidth: 640, margin: "0 auto", padding: "28px 16px 0" }}
      >
        <QuoteSection quote={quote} loading={loading.quote} />
        <TrainingSection
          training={training}
          loading={loading.training}
          onUpdate={setTrainingNote}
        />
        <StretchSection stretch={stretch} loading={loading.stretch} />
        <BreathSection breath={breath} loading={loading.breath} />
        <NutritionSection
          nutrition={nutrition}
          loading={loading.nutrition}
          onLog={setNutritionLog}
        />
        <NewsSection news={news} loading={loading.news} />
        <PortfolioSection portfolio={portfolio} setPortfolio={setPortfolio} />
        <BusinessSection business={business} loading={loading.business} />
        <FeedbackSection />

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button
            onClick={generateAll}
            style={{
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: T.muted,
              borderRadius: 6,
              padding: "8px 20px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            ↻ Regenerate Brief
          </button>
        </div>
      </div>
    </div>
  );
}
