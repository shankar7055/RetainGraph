# RetainGraph — systemd deployment bundle

Four units, one shared env file. Designed for a single Ubuntu VM (the realistic
hackathon deploy target), with Postgres and Redis running locally alongside it.

| Unit | Type | Role |
|---|---|---|
| `retaingraph-api.service` | long-running | Express API — HTTP only, never runs cognify inline |
| `retaingraph-ingest-worker.service` | long-running | Consumes the BullMQ ingest queue: `add()` → `cognify()` → poll status |
| `retaingraph-churn.service` | oneshot | Single churn-scan pass, writes `InsightEvent` rows |
| `retaingraph-churn.timer` | timer | Fires `retaingraph-churn.service` every 15 min (tune for demo) |

## Why a oneshot + timer instead of node-cron for the churn worker

A long-lived process with an internal `setInterval`/cron loop dies quietly if it
throws — you won't notice until a judge asks why no churn flags fired. A
`Type=oneshot` service triggered by a `.timer` gets you, for free: automatic
restart/backoff on failure, a clean `systemctl status` and `journalctl -u
retaingraph-churn` per run, and the ability to trigger an ad-hoc run on demand
with `systemctl start retaingraph-churn.service` right before you walk on stage.

## Install

```bash
# 1. Create the service user and directories
sudo useradd --system --home /opt/retaingraph --shell /usr/sbin/nologin retaingraph
sudo mkdir -p /opt/retaingraph/api /opt/retaingraph/shared /opt/retaingraph/api/logs
sudo chown -R retaingraph:retaingraph /opt/retaingraph

# 2. Deploy your built app (dist/ + node_modules + prisma/ + package.json) to /opt/retaingraph/api
#    (rsync, git pull + npm ci --omit=dev + npm run build, or a CI artifact — your call)

# 3. Env file
sudo cp retaingraph.env.example /opt/retaingraph/shared/retaingraph.env
sudo nano /opt/retaingraph/shared/retaingraph.env   # fill in real secrets
sudo chmod 640 /opt/retaingraph/shared/retaingraph.env
sudo chown retaingraph:retaingraph /opt/retaingraph/shared/retaingraph.env

# 4. Install units
sudo cp retaingraph-api.service retaingraph-ingest-worker.service \
        retaingraph-churn.service retaingraph-churn.timer \
        /etc/systemd/system/
sudo systemctl daemon-reload

# 5. Enable + start
sudo systemctl enable --now retaingraph-api.service
sudo systemctl enable --now retaingraph-ingest-worker.service
sudo systemctl enable --now retaingraph-churn.timer
```

## Operate

```bash
# Status / logs
systemctl status retaingraph-api
journalctl -u retaingraph-api -f
journalctl -u retaingraph-ingest-worker -f
journalctl -u retaingraph-churn --since "1 hour ago"

# Force an immediate churn scan (e.g. right before a demo)
sudo systemctl start retaingraph-churn.service

# Restart after a deploy
sudo systemctl restart retaingraph-api retaingraph-ingest-worker
```

## Notes

- `retaingraph-api.service` runs `prisma migrate deploy` as `ExecStartPre` so the
  API never boots against a stale schema — make sure the `retaingraph` user has
  write access to run migrations, or move this into your CI/deploy step instead
  if you'd rather keep migrations out of unit startup.
- All three long-running/oneshot units are hardened with `ProtectSystem=strict`,
  `PrivateTmp`, `NoNewPrivileges`, etc. If you hit a permissions error writing
  logs, check `ReadWritePaths` matches where your app actually logs to.
- If you run Cognee itself as a local REST server rather than Cognee Cloud, add
  a `cognee-server.service` unit the same way and put it in `After=`/`Requires=`
  for both `retaingraph-api` and `retaingraph-ingest-worker`.
