import { useState } from "react";
import { Empty, Icon, useApp } from "@/components/ui";
import { normalize, paths, people } from "../../portal-data";

export function GlobalSearch() {
  const { state, go, close, role } = useApp();
  const [q, setQ] = useState("");
  const n = normalize(q);

  const results = [
    ...state.courses
      .filter((c: any) => c.status === "published")
      .map((c: any) => ({
        name: c.title,
        sub: c.category,
        route: `course/${c.id}`,
        icon: c.icon,
      })),
    ...[...paths, ...(state.customPaths || [])].map((p: any) => ({
      name: p.title,
      sub: "Lộ trình học",
      route: "paths",
      icon: "Compass",
    })),
    ...(role === "manager"
      ? people.map((p: any) => ({
          name: p.name,
          sub: `${p.job} · ${p.team}`,
          route: "team",
          icon: "Users",
        }))
      : []),
  ].filter((x) => normalize(`${x.name} ${x.sub}`).includes(n));

  return (
    <>
      <div className="search-input large">
        <Icon name="Search" />
        <input
          autoFocus
          placeholder="Tìm khóa học, năng lực, chủ đề…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <p className="muted tiny">
        {q ? `${results.length} kết quả` : "Khám phá nhanh"}
      </p>
      <div className="search-results">
        {results.length ? (
          results.map((r) => (
            <button
              key={r.route + r.name}
              onClick={() => {
                go(r.route);
                close();
              }}
            >
              <span className="icon-tile lavender">
                <Icon name={r.icon} />
              </span>
              <div>
                <strong>{r.name}</strong>
                <small>{r.sub}</small>
              </div>
              <Icon name="ArrowUpRight" size={18} />
            </button>
          ))
        ) : (
          <Empty
            title="Chưa tìm thấy kết quả"
            description="Thử từ khóa khác như AI, văn hoá hoặc nghiên cứu."
          />
        )}
      </div>
    </>
  );
}
