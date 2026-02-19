// src/modules/deploy/RepoImportPanel.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { Github, Gitlab, Search, Lock, Globe2 } from "lucide-react";
import globalConfig from "../../lib/globalConfig";
import { GET_USER_REPO_LIST_MUTATION } from "../../lib/graphql/mutations/Deploy/RepoList";

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function getGqlErrors(json: any): Array<{ message?: string }> {
  return json?.body?.singleResult?.errors ?? json?.errors ?? [];
}
function getGqlData(json: any): any {
  return json?.body?.singleResult?.data ?? json?.data ?? null;
}
function safeJsonParse<T>(value: unknown): T | null {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

type Provider = "github" | "gitlab" | "unknown";

type Repo = {
  id: string;
  name: string;
  fullName: string;
  provider: Provider;
  defaultBranch?: string;
  isPrivate?: boolean;
};

type RawRepo =
  | string
  | {
      name?: string;
      full_name?: string;
      fullName?: string;
      repo?: string;
      owner?: string;
      namespace?: string;
      provider?: string;
      vcs?: string;
      default_branch?: string;
      defaultBranch?: string;
      private?: boolean;
      isPrivate?: boolean;
    };

function normalizeProvider(p?: string): Provider {
  const v = (p || "").toLowerCase();
  if (v.includes("github")) return "github";
  if (v.includes("gitlab")) return "gitlab";
  return "unknown";
}

function normalizeRepo(raw: RawRepo): Repo | null {
  if (typeof raw === "string") {
    const fullName = raw;
    const name = fullName.split("/").pop() || fullName;
    return {
      id: `unknown:${fullName}`,
      name,
      fullName,
      provider: "unknown",
    };
  }

  const provider = normalizeProvider(raw.provider || raw.vcs);
  const fullName =
    raw.full_name ||
    raw.fullName ||
    (raw.owner && raw.repo ? `${raw.owner}/${raw.repo}` : undefined) ||
    (raw.namespace && raw.name ? `${raw.namespace}/${raw.name}` : undefined) ||
    raw.name ||
    "";

  const name = raw.name || fullName.split("/").pop() || fullName;

  if (!fullName || !name) return null;

  return {
    id: `${provider}:${fullName}`,
    name,
    fullName,
    provider,
    defaultBranch: raw.default_branch || raw.defaultBranch,
    isPrivate: raw.private ?? raw.isPrivate,
  };
}

function ProviderIcon({ provider }: { provider: Provider }) {
  if (provider === "github") return <Github className="w-5 h-5 text-gray-700" />;
  if (provider === "gitlab") return <Gitlab className="w-5 h-5 text-gray-700" />;
  return <Globe2 className="w-5 h-5 text-gray-500" />;
}

function TreeConnector({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="22"
      viewBox="0 0 18 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="
          M 2 0
          L 2 11
          Q 2 16 9 16
          L 16 16
        "
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="butt"
        strokeLinejoin="round"
        opacity="1"
      />
    </svg>
  );
}


export function RepoImportPanel(props: {
  open: boolean;
  onClose?: () => void;
}) {
  const { open, onClose } = props;

  const typo = globalConfig.typography;

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const [repos, setRepos] = useState<Repo[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setErr("");

      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("Missing access token. Please login again.");
        }

        const res = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ query: GET_USER_REPO_LIST_MUTATION }),
        });

        const json = await res.json();
        const errors = getGqlErrors(json);
        if (errors?.length) throw new Error(errors[0]?.message || "Request failed");

        const data = getGqlData(json);
        const raw = data?.getUserRepoList;
        const parsed =
          typeof raw === "string" ? safeJsonParse<unknown>(raw) ?? raw : raw;

        if (cancelled) return;

        let rawList: RawRepo[] = [];

        if (Array.isArray(parsed)) rawList = parsed as RawRepo[];
        else if (typeof parsed === "string") {
          const p2 = safeJsonParse<RawRepo[]>(parsed);
          rawList = Array.isArray(p2) ? p2 : [];
        } else if (parsed && typeof parsed === "object") {
          const maybeRepos = (parsed as any).repos;
          rawList = Array.isArray(maybeRepos) ? (maybeRepos as RawRepo[]) : [];
        }

        const normalized = rawList
          .map(normalizeRepo)
          .filter(Boolean) as Repo[];

        normalized.sort((a, b) => a.fullName.localeCompare(b.fullName));
        setRepos(normalized);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load repositories";
        setErr(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.fullName.toLowerCase().includes(q)
    );
  }, [repos, query]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedRepos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filtered.slice(start, end);
  }, [filtered, currentPage]);

  if (!open) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={cx(typo.headings.h2.sizes[0], typo.headings.h2.weight, typo.headings.h2.color)}>
            Import a Git repository
          </div>
          <p className={cx("mt-1", typo.paragraph.small.size, typo.paragraph.small.color)}>
            Search your repositories.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories..."
            className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className={cx(typo.paragraph.xs.size, typo.paragraph.xs.color)}>
              {loading ? "Loading repositories..." : `${filtered.length} repositories`}
            </div>
            {!!err && (
              <div className="text-xs text-red-600 font-medium truncate max-w-[60%]">
                {err}
              </div>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-sm text-gray-600">No repositories found.</div>
            ) : (
              <div className="p-2 space-y-1">
                {paginatedRepos.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors px-3 py-3"
                  >
                    <div className="w-9 h-9 mt-0.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <ProviderIcon provider={r.provider} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Repo Name */}
                      <div className="text-sm font-semibold text-gray-900 truncate pl-1">
                        {r.name}
                      </div>

                      {/* Branch Info Row - Flex container */}
<div className="flex items-center mt-0.5 pl-0.5">
  {r.defaultBranch ? (
    <>
      {/* SVG Connector */}
      <TreeConnector className="flex-shrink-0 w-[18px] h-[22px] text-gray-400" />
      
      {/* Branch Pill - Perfectly aligned with line end */}
      <span className="ml-1 inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-600 font-medium shadow-sm">
        {r.defaultBranch}
      </span>
    </>
  ) : (
    <div className="h-5" />
  )}

  {r.isPrivate && (
    <span className="ml-3 inline-flex items-center gap-1 text-gray-400">
      <Lock className="w-3 h-3" />
    </span>
  )}
</div>

                    </div>

                    <button
                      type="button"
                      onClick={() => console.log("Import repo:", r)}
                      className="self-center h-9 rounded-xl bg-gray-900 text-white px-4 text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm ml-2"
                    >
                      Import
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && filtered.length > 0 && totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cx(
                    "h-8 px-3 rounded-lg text-sm font-medium border transition-colors",
                    currentPage === 1
                      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  )}
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
                      if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                        acc.push("ellipsis");
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "ellipsis" ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCurrentPage(item)}
                          className={cx(
                            "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                            currentPage === item
                              ? "bg-blue-500 text-white"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cx(
                    "h-8 px-3 rounded-lg text-sm font-medium border transition-colors",
                    currentPage === totalPages
                      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}