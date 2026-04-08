import { useMemo, useState } from "react";

const employees = [
  { id: 1, name: "Alessandra", group: "Finance", contract: "Full time", hours: 40, role: "employee" },
  { id: 2, name: "Vanessa", group: "Finance", contract: "Part time", hours: 20, role: "employee" },
  { id: 3, name: "Simona", group: "Building", contract: "Full time", hours: 40, role: "employee", onCall: true },
  { id: 4, name: "Stefania", group: "Community", contract: "Full time", hours: 40, role: "employee", onCall: true },
  { id: 5, name: "Eddy", group: "Pulizie", contract: "Full time", hours: 40, role: "employee" },
  { id: 6, name: "Mohamed", group: "Pulizie", contract: "Full time", hours: 40, role: "employee" },
  { id: 7, name: "Rachelle", group: "Pulizie", contract: "Part time", hours: 20, role: "employee" },
  { id: 8, name: "Vederick", group: "Pulizie", contract: "Part time", hours: 20, role: "employee" },
  { id: 11, name: "Utente Admin", role: "admin" },
  { id: 12, name: "Utente HR", role: "hr" },
];

const initialRequests = [
  { id: 101, employeeId: 1, employeeName: "Alessandra", group: "Finance", type: "Ferie", status: "In attesa", dateFrom: "2026-04-15", dateTo: "2026-04-18", startTime: "", endTime: "", reason: "Vacanza" },
  { id: 102, employeeId: 3, employeeName: "Simona", group: "Building", type: "ROL", status: "Approvata", dateFrom: "2026-04-08", dateTo: "2026-04-08", startTime: "09:00", endTime: "13:00", reason: "Visita medica" },
  { id: 103, employeeId: 5, employeeName: "Eddy", group: "Pulizie", type: "Straordinario", status: "In attesa", dateFrom: "2026-04-03", dateTo: "2026-04-03", startTime: "18:30", endTime: "21:00", reason: "Intervento extra" },
  { id: 104, employeeId: 2, employeeName: "Vanessa", group: "Finance", type: "Ferie", status: "Approvata", dateFrom: "2026-04-10", dateTo: "2026-04-12", startTime: "", endTime: "", reason: "Weekend lungo" },
  { id: 105, employeeId: 4, employeeName: "Stefania", group: "Community", type: "Permesso", status: "In attesa", dateFrom: "2026-04-22", dateTo: "2026-04-22", startTime: "14:00", endTime: "18:00", reason: "Impegno personale" },
];

const initialOnCall = [
  { id: 201, employeeId: 3, employeeName: "Simona", month: "2026-04", dates: ["2026-04-06", "2026-04-13"], note: "" },
  { id: 202, employeeId: 4, employeeName: "Stefania", month: "2026-04", dates: ["2026-04-09", "2026-04-16"], note: "" },
];

const payrollMonths = [
  { value: "2026-03", label: "Marzo 2026" },
  { value: "2026-04", label: "Aprile 2026" },
  { value: "2026-05", label: "Maggio 2026" },
];

const calendarViews = ["Mese", "Settimana", "Giorno"];

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function startOfWeek(d: Date) {
  const x = new Date(d);
  const g = x.getDay();
  x.setDate(x.getDate() + (g === 0 ? -6 : 1 - g));
  x.setHours(0, 0, 0, 0);
  return x;
}
function monthGrid(d: Date) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
function onDate(r: any, d: Date) {
  const x = fmt(d);
  return r.type === "Ferie" ? x >= r.dateFrom && x <= r.dateTo : x === r.dateFrom;
}
function formatPeriod(r: any) {
  if (r.type === "Ferie") return `${r.dateFrom} → ${r.dateTo}`;
  return `${r.dateFrom} · ${r.startTime}-${r.endTime}`;
}

function colorFor(type: string) {
  if (type === "Ferie") return "#ef4444";
  if (type === "Straordinario") return "#f59e0b";
  return "#3b82f6";
}

function CalendarCell({
  day,
  items,
  user,
  isAdmin,
  isHR,
  activeMonth,
}: {
  day: Date;
  items: any[];
  user: any;
  isAdmin: boolean;
  isHR: boolean;
  activeMonth: number;
}) {
  const visible = items.filter((i) => isAdmin || isHR || i.employeeId === user?.id || i.type !== "Straordinario");

  return (
    <div
      style={{
        minHeight: 120,
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 8,
        background: day.getMonth() === activeMonth ? "#fff" : "#f8fafc",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <strong>{day.getDate()}</strong>
        {visible.length > 0 ? <span>{visible.length}</span> : null}
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {visible.slice(0, 3).map((i) => (
          <div
            key={`${i.id}-${fmt(day)}`}
            style={{
              background: colorFor(i.type),
              color: "white",
              borderRadius: 8,
              padding: "6px 8px",
              fontSize: 12,
            }}
          >
            {isAdmin || isHR
              ? `${i.employeeName} · ${i.type}`
              : i.employeeId === user?.id
              ? `La tua richiesta · ${i.type}`
              : `Assente: ${i.employeeName}`}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [userId, setUserId] = useState("11");
  const [requests, setRequests] = useState(initialRequests);
  const [onCall, setOnCall] = useState(initialOnCall);
  const [viewDate, setViewDate] = useState(new Date(2026, 3, 1));
  const [viewMode, setViewMode] = useState("Mese");
  const [tab, setTab] = useState("calendar");
  const [type, setType] = useState("Ferie");
  const [form, setForm] = useState({ dateFrom: "", dateTo: "", startTime: "", endTime: "", reason: "" });
  const [onCallForm, setOnCallForm] = useState({ month: "2026-04", dates: "", note: "" });

  const user = employees.find((e) => String(e.id) === userId);
  const isAdmin = user?.role === "admin";
  const isHR = user?.role === "hr";
  const isEmployee = user?.role === "employee";
  const canDeclareOnCall = Boolean(user?.onCall);

  const days = useMemo(() => {
    if (viewMode === "Giorno") return [viewDate];
    if (viewMode === "Settimana") return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(viewDate), i));
    return monthGrid(viewDate);
  }, [viewDate, viewMode]);

  const mapByDay = useMemo(() => {
    const out: Record<string, any[]> = {};
    days.forEach((d) => {
      out[fmt(d)] = requests.filter((r) => r.status !== "Rifiutata" && onDate(r, d));
    });
    return out;
  }, [days, requests]);

  const visibleRequests = useMemo(
    () => (isEmployee ? requests.filter((r) => r.employeeId === user?.id) : requests),
    [requests, isEmployee, user]
  );

  const visibleOnCall = useMemo(
    () => ((isAdmin || isHR) ? onCall : onCall.filter((r) => r.employeeId === user?.id)),
    [onCall, isAdmin, isHR, user]
  );

  const submitRequest = () => {
    if (!isEmployee || !form.dateFrom || !form.reason) return;
    if (type === "Ferie" && !form.dateTo) return;
    if (type !== "Ferie" && (!form.startTime || !form.endTime)) return;

    const newRequest = {
      id: Date.now(),
      employeeId: user!.id,
      employeeName: user!.name,
     group: user?.group ?? "",
      type,
      status: "In attesa",
      dateFrom: form.dateFrom,
      dateTo: type === "Ferie" ? form.dateTo : form.dateFrom,
      startTime: type === "Ferie" ? "" : form.startTime,
      endTime: type === "Ferie" ? "" : form.endTime,
      reason: form.reason,
    };

    setRequests([newRequest, ...requests]);
    setForm({ dateFrom: "", dateTo: "", startTime: "", endTime: "", reason: "" });
    setTab("requests");
  };

  const submitOnCall = () => {
    if (!canDeclareOnCall || !onCallForm.dates.trim()) return;
    const newOnCall = {
      id: Date.now(),
      employeeId: user!.id,
      employeeName: user!.name,
      month: onCallForm.month,
      dates: onCallForm.dates.split(",").map((x) => x.trim()).filter(Boolean),
      note: onCallForm.note,
    };
    setOnCall([newOnCall, ...onCall]);
    setOnCallForm({ ...onCallForm, dates: "", note: "" });
  };

  const updateStatus = (id: number, status: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const title =
    viewMode === "Mese"
      ? viewDate.toLocaleDateString("it-IT", { month: "long", year: "numeric" })
      : viewMode === "Settimana"
      ? `${startOfWeek(viewDate).toLocaleDateString("it-IT", { day: "numeric", month: "short" })} - ${addDays(
          startOfWeek(viewDate),
          6
        ).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}`
      : viewDate.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: 24, color: "#0f172a", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 24 }}>
        <div
          style={{
            background: "rgb(153,255,51)",
            borderRadius: 24,
            padding: 24,
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            alignItems: "end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "inline-block" }}>
            <div style={{ fontSize: 48, fontWeight: 800 }}>TOOLBOX</div>
            <div style={{ marginTop: 8, height: 2, width: "100%", background: "black", borderRadius: 999 }} />
            <div style={{ marginTop: 12, fontSize: 30, fontWeight: 600 }}>GESTIONE DIPENDENTI</div>
          </div>

          <div style={{ minWidth: 260 }}>
            <label>Accedi come</label>
            <br />
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={{ marginTop: 8, width: "100%", padding: 10, borderRadius: 10 }}
            >
              {employees.map((e) => (
                <option key={e.id} value={String(e.id)}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 16 }}>
            <strong>{user?.name}</strong>
            <div style={{ marginTop: 6, color: "#64748b" }}>
              {isEmployee ? `${user?.group} · ${user?.contract} · ${user?.hours}h` : isAdmin ? "Admin" : "HR"}
            </div>
          </div>
          <div style={{ background: "white", borderRadius: 16, padding: 16 }}>
            <div style={{ color: "#64748b" }}>In attesa</div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{requests.filter((r) => r.status === "In attesa").length}</div>
          </div>
          <div style={{ background: "white", borderRadius: 16, padding: 16 }}>
            <div style={{ color: "#64748b" }}>Approvate</div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{requests.filter((r) => r.status === "Approvata").length}</div>
          </div>
          <div style={{ background: "white", borderRadius: 16, padding: 16 }}>
            <div style={{ color: "#64748b" }}>Ruolo</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{user?.role}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setTab("calendar")}>Calendario</button>
          <button onClick={() => setTab("requests")}>Richieste</button>
          {isEmployee && <button onClick={() => setTab("new")}>Nuova richiesta</button>}
          {(isAdmin || isHR || canDeclareOnCall) && <button onClick={() => setTab("oncall")}>Reperibilita</button>}
          <button onClick={() => setTab("team")}>Team</button>
        </div>

        {tab === "calendar" && (
          <div style={{ background: "white", borderRadius: 24, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <h2>Calendario assenze</h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => setViewDate(viewMode === "Giorno" ? addDays(viewDate, -1) : viewMode === "Settimana" ? addDays(viewDate, -7) : addMonths(viewDate, -1))}>◀</button>
                <div style={{ minWidth: 220, textAlign: "center" }}>{title}</div>
                <button onClick={() => setViewDate(viewMode === "Giorno" ? addDays(viewDate, 1) : viewMode === "Settimana" ? addDays(viewDate, 7) : addMonths(viewDate, 1))}>▶</button>
                <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                  {calendarViews.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <span style={{ background: "#ef4444", color: "white", padding: "6px 10px", borderRadius: 999 }}>Ferie</span>
              <span style={{ background: "#3b82f6", color: "white", padding: "6px 10px", borderRadius: 999 }}>Permessi</span>
              <span style={{ background: "#f59e0b", color: "white", padding: "6px 10px", borderRadius: 999 }}>Straordinari</span>
            </div>

            {viewMode !== "Giorno" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginTop: 18, marginBottom: 8 }}>
                {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
                  <div key={d} style={{ color: "#64748b" }}>{d}</div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: viewMode === "Giorno" ? "1fr" : "repeat(7, 1fr)", gap: 8 }}>
              {days.map((d) => (
                <CalendarCell
                  key={fmt(d)}
                  day={d}
                  items={mapByDay[fmt(d)] || []}
                  user={user}
                  isAdmin={!!isAdmin}
                  isHR={!!isHR}
                  activeMonth={viewDate.getMonth()}
                />
              ))}
            </div>
          </div>
        )}

        {tab === "requests" && (
          <div style={{ display: "grid", gap: 12 }}>
            {visibleRequests.map((r) => (
              <div key={r.id} style={{ background: "white", borderRadius: 16, padding: 16, display: "flex", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{isEmployee ? "La tua richiesta" : r.employeeName}</div>
                  <div style={{ marginTop: 6 }}>{r.group} · {r.type} · {r.status}</div>
                  <div style={{ marginTop: 6, color: "#64748b" }}>{formatPeriod(r)} · {r.reason}</div>
                </div>
                {isAdmin && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => updateStatus(r.id, "Approvata")}>Approva</button>
                    <button onClick={() => updateStatus(r.id, "Rifiutata")}>Rifiuta</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "new" && isEmployee && (
          <div style={{ background: "white", borderRadius: 24, padding: 24, display: "grid", gap: 16 }}>
            <h2>Nuova richiesta</h2>

            <div>
              <label>Tipo</label>
              <br />
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ marginTop: 8, padding: 10, borderRadius: 10 }}>
                <option value="Ferie">Ferie</option>
                <option value="ROL">ROL</option>
                <option value="Ex festivita">Ex festivita</option>
                <option value="Permesso">Permesso</option>
                <option value="Straordinario">Straordinario</option>
              </select>
            </div>

            <div>
              <label>{type === "Ferie" ? "Dal giorno" : "Giorno"}</label>
              <br />
              <input type="date" value={form.dateFrom} onChange={(e) => setForm({ ...form, dateFrom: e.target.value })} />
            </div>

            {type === "Ferie" ? (
              <div>
                <label>Al giorno</label>
                <br />
                <input type="date" value={form.dateTo} onChange={(e) => setForm({ ...form, dateTo: e.target.value })} />
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <div>
                  <label>Dalle</label>
                  <br />
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div>
                  <label>Alle</label>
                  <br />
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
            )}

            <div>
              <label>Motivo</label>
              <br />
              <textarea
                rows={5}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                style={{ width: "100%", marginTop: 8 }}
              />
            </div>

            <button onClick={submitRequest}>Invia richiesta</button>
          </div>
        )}

        {tab === "oncall" && (
          <div style={{ display: "grid", gap: 12 }}>
            {canDeclareOnCall && (
              <div style={{ background: "white", borderRadius: 24, padding: 24 }}>
                <h2>Reperibilita</h2>
                <div style={{ marginTop: 16 }}>
                  <label>Mese</label>
                  <br />
                  <select value={onCallForm.month} onChange={(e) => setOnCallForm({ ...onCallForm, month: e.target.value })}>
                    {payrollMonths.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label>Giorni</label>
                  <br />
                  <input
                    value={onCallForm.dates}
                    onChange={(e) => setOnCallForm({ ...onCallForm, dates: e.target.value })}
                    placeholder="2026-04-06, 2026-04-13"
                  />
                </div>
                <div style={{ marginTop: 16 }}>
                  <label>Nota</label>
                  <br />
                  <textarea
                    rows={4}
                    value={onCallForm.note}
                    onChange={(e) => setOnCallForm({ ...onCallForm, note: e.target.value })}
                  />
                </div>
                <button style={{ marginTop: 16 }} onClick={submitOnCall}>Invia reperibilita</button>
              </div>
            )}

            {visibleOnCall.map((r) => (
              <div key={r.id} style={{ background: "white", borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 700 }}>{r.employeeName}</div>
                <div style={{ color: "#64748b", marginTop: 6 }}>{r.month}</div>
                <div style={{ marginTop: 6 }}>{r.dates.join(", ")}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "team" && (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {employees.map((e) => (
              <div key={e.id} style={{ background: "white", borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 700 }}>{e.name}</div>
                <div style={{ color: "#64748b", marginTop: 6 }}>
                  {e.role === "employee" ? `${e.group} · ${e.contract} · ${e.hours}h${e.onCall ? " · reperibilita" : ""}` : e.role}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}