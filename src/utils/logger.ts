// ─── Tipos ────────────────────────────────────────────────────────────────────

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export type LogExtras = {
  correlationId?: string;
  /** Override do sessionId para contextos server-side (rotas de API lendo do header). */
  sessionId?: string;
  data?: Record<string, unknown>;
  error?: unknown;
  duration?: number;
};

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  context: string;
  action: string;
  message: string;
  sessionId?: string;
  correlationId?: string;
  data?: unknown;
  error?: { name?: string; message: string; stack?: string };
  duration?: number;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const LEVEL_ORDER: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Chaves comparadas sem case; qualquer chave cujo lowercase contém um destes
// padrões terá o valor substituído por '[REDACTED]'.
const SENSITIVE_PATTERNS = [
  'password',
  'senha',
  'token',
  'secret',
  'apikey',
  'api_key',
  'authorization',
  'sessiontoken',
  'accesstoken',
  'refreshtoken',
  'cpf',
  'rg',
  'passporte',
];

const SESSION_STORAGE_KEY = '_fluxo_sid';

// ─── Gestão de Sessão ─────────────────────────────────────────────────────────

let _sessionId: string | undefined;

/**
 * Resolve o sessionId activo.
 * No cliente: gera/recupera automaticamente via sessionStorage.
 * No servidor: retorna undefined (sem sessão persistente por request).
 */
function resolveSessionId(): string | undefined {
  if (_sessionId) return _sessionId;

  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        _sessionId = stored;
        return _sessionId;
      }
      // Auto-gera na primeira utilização no cliente
      _sessionId = generateCorrelationId();
      sessionStorage.setItem(SESSION_STORAGE_KEY, _sessionId);
      return _sessionId;
    } catch {
      // sessionStorage pode estar bloqueado (modo privado, extensões, etc.)
    }
  }

  return undefined;
}

/**
 * Define o sessionId activo.
 * Chamar após login bem-sucedido para marcar o início de uma sessão autenticada.
 */
export function setSessionId(id: string): void {
  _sessionId = id;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    } catch {
      // ignorar silenciosamente
    }
  }
}

/**
 * Gera e aplica um novo sessionId.
 * Chamar no logout para iniciar uma nova sessão anónima limpa.
 */
export function resetSessionId(): void {
  setSessionId(generateCorrelationId());
}

// ─── Sanitização ──────────────────────────────────────────────────────────────

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_PATTERNS.some((p) => lower.includes(p));
}

function maskEmail(value: string): string {
  return value.replace(/^[^@]+(@.+)$/, '***$1');
}

export function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 5 || value === null || value === undefined) return value;
  if (typeof value === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value))
    return maskEmail(value);
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      isSensitiveKey(k) ? [k, '[REDACTED]'] : [k, sanitize(v, depth + 1)],
    ),
  );
}

// ─── Serialização de Erros ────────────────────────────────────────────────────

function serializarErro(err: unknown): LogEntry['error'] {
  if (err instanceof Error)
    return { name: err.name, message: err.message, stack: err.stack };
  return { message: String(err) };
}

// ─── Nível mínimo activo ──────────────────────────────────────────────────────

function resolveNivelMinimo(): LogLevel {
  const env =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase()
      : undefined;
  if (env && env in LEVEL_ORDER) return env as LogLevel;
  return typeof process !== 'undefined' && process.env.NODE_ENV === 'production'
    ? 'INFO'
    : 'DEBUG';
}

// ─── Emissor ──────────────────────────────────────────────────────────────────

function emitir(entry: LogEntry): void {
  const isProd =
    typeof process !== 'undefined' && process.env.NODE_ENV === 'production';

  if (isProd) {
    // JSON estruturado para agregadores (Datadog, Loki, CloudWatch…)
    const fn =
      entry.level === 'ERROR'
        ? console.error
        : entry.level === 'WARN'
          ? console.warn
          : console.log;
    fn(JSON.stringify(entry));
    return;
  }

  // Formato legível para desenvolvimento
  const sid = entry.sessionId ? ` sid:${entry.sessionId.slice(0, 8)}…` : '';
  const cid = entry.correlationId ? ` cid:${entry.correlationId.slice(0, 8)}…` : '';
  const dur = entry.duration !== undefined ? ` (${entry.duration}ms)` : '';
  const prefix = `[${entry.level}] [${entry.context}] [${entry.action}]${sid}${cid}${dur}`;
  const args: unknown[] = [`${prefix} ${entry.message}`];
  if (entry.data !== undefined) args.push('\n  ↳ dados:', entry.data);
  if (entry.error !== undefined) args.push('\n  ↳ erro:', entry.error);

  switch (entry.level) {
    case 'DEBUG':
      console.debug(...args);
      break;
    case 'INFO':
      console.info(...args);
      break;
    case 'WARN':
      console.warn(...args);
      break;
    case 'ERROR':
      console.error(...args);
      break;
  }
}

// ─── API Pública ──────────────────────────────────────────────────────────────

/** Gera um ID de correlação único para rastrear um fluxo de ponta a ponta. */
export function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Cria um logger com escopo para um módulo ou contexto específico.
 *
 * @example
 * const logger = createLogger('ComprasService');
 * logger.info('AdicionarItem', 'Enviando payload para o Firestore', { correlationId });
 */
export function createLogger(context: string) {
  const nivelMinimo = resolveNivelMinimo();

  function deveLogar(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[nivelMinimo];
  }

  function log(level: LogLevel, action: string, message: string, extras?: LogExtras): void {
    if (!deveLogar(level)) return;

    // Resolve o sessionId: prioridade para override explícito (ex: rotas API),
    // depois o módulo-singleton do cliente.
    const sessionId =
      extras?.sessionId !== undefined ? extras.sessionId : resolveSessionId();

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      action,
      message,
      ...(sessionId !== undefined ? { sessionId } : {}),
      ...(extras?.correlationId !== undefined ? { correlationId: extras.correlationId } : {}),
      ...(extras?.data !== undefined
        ? { data: sanitize(extras.data) as Record<string, unknown> }
        : {}),
      ...(extras?.error !== undefined ? { error: serializarErro(extras.error) } : {}),
      ...(extras?.duration !== undefined ? { duration: extras.duration } : {}),
    };

    emitir(entry);
  }

  /**
   * Inicia uma operação cronometrada.
   * Regista DEBUG no início, INFO no sucesso e ERROR na falha — todos com duração.
   *
   * @example
   * const timer = logger.startTimer('CarregarItens', 'Buscando compras no Firestore', correlationId);
   * try {
   *   const items = await service.getItems();
   *   timer.concluido('Itens carregados', { total: items.length });
   * } catch (err) {
   *   timer.falhou('Falha ao carregar itens', err);
   * }
   */
  function startTimer(action: string, message: string, correlationId?: string) {
    const inicio =
      typeof performance !== 'undefined' ? performance.now() : Date.now();

    log('DEBUG', action, `Iniciando: ${message}`, { correlationId });

    return {
      concluido(mensagemSucesso: string, data?: Record<string, unknown>) {
        const decorrido =
          typeof performance !== 'undefined'
            ? performance.now() - inicio
            : Date.now() - inicio;
        log('INFO', action, `Concluído: ${mensagemSucesso}`, {
          correlationId,
          data,
          duration: Math.round(decorrido),
        });
      },

      falhou(mensagemFalha: string, error: unknown) {
        const decorrido =
          typeof performance !== 'undefined'
            ? performance.now() - inicio
            : Date.now() - inicio;
        log('ERROR', action, `Falhou: ${mensagemFalha}`, {
          correlationId,
          error,
          duration: Math.round(decorrido),
        });
      },
    };
  }

  return {
    debug: (action: string, message: string, extras?: LogExtras) =>
      log('DEBUG', action, message, extras),
    info: (action: string, message: string, extras?: LogExtras) =>
      log('INFO', action, message, extras),
    warn: (action: string, message: string, extras?: LogExtras) =>
      log('WARN', action, message, extras),
    error: (action: string, message: string, extras?: LogExtras) =>
      log('ERROR', action, message, extras),
    startTimer,
  };
}
