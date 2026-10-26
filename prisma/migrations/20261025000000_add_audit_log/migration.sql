CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "action" TEXT NOT NULL, "entity" TEXT NOT NULL, "entityId" TEXT,
  "actorId" TEXT, "actorName" TEXT, "actorEmail" TEXT,
  "source" TEXT NOT NULL DEFAULT 'SYSTEM', "ipAddress" TEXT, "correlationId" TEXT,
  "changedFields" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "before" JSONB, "after" JSONB, "metadata" JSONB,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_createdAt_id_idx" ON "AuditLog"("createdAt", "id");
CREATE INDEX "AuditLog_entity_createdAt_idx" ON "AuditLog"("entity", "createdAt");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- Redact recursively, also inside JSON configuration fields. Bound large values.
CREATE FUNCTION apice_audit_sanitize(value JSONB, depth INTEGER DEFAULT 0) RETURNS JSONB
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE result JSONB; entry RECORD;
BEGIN
  IF value IS NULL THEN RETURN NULL; END IF;
  IF depth > 8 THEN RETURN '"[Conteúdo abreviado]"'::jsonb; END IF;
  IF jsonb_typeof(value) = 'object' THEN
    result := '{}'::jsonb;
    FOR entry IN SELECT key, val FROM jsonb_each(value) AS x(key, val) LOOP
      result := result || jsonb_build_object(entry.key,
        CASE WHEN entry.key ~* '(password|secret|token|api.?key|authorization|cookie|credential|private.?key|signature|bodyHtml|bodyText|bccAddresses|snippet|errorMessage)'
        THEN '"[Oculto]"'::jsonb ELSE apice_audit_sanitize(entry.val, depth + 1) END);
    END LOOP;
    RETURN result;
  ELSIF jsonb_typeof(value) = 'array' THEN
    SELECT COALESCE(jsonb_agg(apice_audit_sanitize(v, depth + 1)), '[]'::jsonb) INTO result
      FROM (SELECT v FROM jsonb_array_elements(value) AS x(v) LIMIT 100) bounded;
    RETURN result;
  ELSIF jsonb_typeof(value) = 'string' AND length(value #>> '{}') > 2000 THEN
    RETURN to_jsonb(left(value #>> '{}', 2000) || '… [abreviado]');
  END IF;
  RETURN value;
END;
$$;

CREATE FUNCTION apice_audit_change() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE prior JSONB; following JSONB; ctx JSONB; changed TEXT[];
BEGIN
  IF TG_OP <> 'INSERT' THEN prior := to_jsonb(OLD); END IF;
  IF TG_OP <> 'DELETE' THEN following := to_jsonb(NEW); END IF;
  SELECT array_agg(key ORDER BY key) INTO changed FROM (
    SELECT key FROM jsonb_object_keys(COALESCE(prior, '{}') || COALESCE(following, '{}')) AS keys(key)
    WHERE key <> 'updatedAt' AND (prior -> key) IS DISTINCT FROM (following -> key)
  ) differences;
  IF TG_OP = 'UPDATE' AND changed IS NULL THEN RETURN NEW; END IF;
  ctx := COALESCE(NULLIF(current_setting('apice.audit_context', true), ''), '{}')::jsonb;
  INSERT INTO "AuditLog" ("action", "entity", "entityId", "actorId", "actorName", "actorEmail", "source", "ipAddress", "correlationId", "changedFields", "before", "after")
  VALUES (CASE TG_OP WHEN 'INSERT' THEN 'CREATE' WHEN 'UPDATE' THEN 'UPDATE' ELSE 'DELETE' END,
    TG_TABLE_NAME, COALESCE(following ->> 'id', prior ->> 'id'), ctx ->> 'actorId', ctx ->> 'actorName', ctx ->> 'actorEmail',
    COALESCE(ctx ->> 'source', 'SYSTEM'), ctx ->> 'ipAddress', ctx ->> 'correlationId', COALESCE(changed, ARRAY[]::text[]),
    apice_audit_sanitize(prior), apice_audit_sanitize(following));
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Reuse this installer after migrations that add application tables.
CREATE FUNCTION apice_install_audit_triggers() RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE item RECORD;
BEGIN
  FOR item IN SELECT tablename FROM pg_tables WHERE schemaname = current_schema()
    AND tablename NOT IN ('AuditLog', '_prisma_migrations') LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid = format('%I.%I', current_schema(), item.tablename)::regclass AND tgname = 'apice_audit_row') THEN
      EXECUTE format('CREATE TRIGGER apice_audit_row AFTER INSERT OR UPDATE OR DELETE ON %I.%I FOR EACH ROW EXECUTE FUNCTION apice_audit_change()', current_schema(), item.tablename);
    END IF;
  END LOOP;
END;
$$;
SELECT apice_install_audit_triggers();

CREATE FUNCTION apice_audit_append_only() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'O histórico de auditoria não pode ser alterado ou apagado.'; END;
$$;
CREATE TRIGGER apice_audit_immutable BEFORE UPDATE OR DELETE OR TRUNCATE ON "AuditLog"
FOR EACH STATEMENT EXECUTE FUNCTION apice_audit_append_only();
