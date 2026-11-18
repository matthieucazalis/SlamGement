import { AppIcon } from "@/components/icons";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("common.offlineTitle") };
}

const STYLE = `
.off-wrap{
  --off-bg:#ffffff;--off-fg:#0f172a;--off-muted:#64748b;
  --off-border:#e2e8f0;--off-primary:#0f172a;--off-primary-fg:#ffffff;
  min-height:100vh;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:16px;padding:24px;text-align:center;
  background:var(--off-bg);color:var(--off-fg);
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
}
@media (prefers-color-scheme:dark){
  html:not(.light) .off-wrap{
    --off-bg:#0f172a;--off-fg:#f8fafc;--off-muted:#94a3b8;
    --off-border:#334155;--off-primary:#f8fafc;--off-primary-fg:#0f172a;
  }
}
html.dark .off-wrap{
  --off-bg:#0f172a;--off-fg:#f8fafc;--off-muted:#94a3b8;
  --off-border:#334155;--off-primary:#f8fafc;--off-primary-fg:#0f172a;
}
.off-card{
  max-width:360px;width:100%;display:flex;flex-direction:column;
  align-items:center;gap:12px;padding:32px 24px;
  border:1px solid var(--off-border);border-radius:16px;
}
.off-icon{display:inline-flex;color:var(--off-muted)}
.off-title{margin:0;font-size:22px;font-weight:700}
.off-text{margin:0;font-size:14px;line-height:1.5;color:var(--off-muted)}
.off-btn{
  margin-top:8px;display:inline-block;padding:9px 18px;border-radius:10px;
  background:var(--off-primary);color:var(--off-primary-fg);
  font-size:14px;font-weight:600;text-decoration:none;
}
.off-btn:focus-visible{outline:2px solid var(--off-primary);outline-offset:2px}
`;

export default async function OfflinePage() {
  const t = await getT();
  return (
    <main id="main-content" className="off-wrap">
      <style>{STYLE}</style>
      <div className="off-card">
        <span className="off-icon" aria-hidden="true">
          <AppIcon name="offline" size={44} />
        </span>
        <h1 className="off-title">{t("common.offlineTitle")}</h1>
        <p className="off-text">{t("common.offlineText")}</p>
        {/* Lien classique voulu : on veut une vraie navigation, pas une
            transition côté client, qui échouerait sans réseau. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/projects" className="off-btn">
          {t("common.retry")}
        </a>
      </div>
    </main>
  );
}
