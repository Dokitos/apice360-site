/**
 * Lê a localização do mapa a partir do que o editor colar no painel.
 *
 * Ninguém tem coordenadas à mão — tem o link que o Google Maps dá ao
 * carregar em "Partilhar". Por isso isto aceita esse link tal como vem,
 * curto ou longo, e também "38.63329, -9.14416" para quem já as souber.
 */

export type MapLocation = { latitude: number; longitude: number };

/** Portugal continental, com folga para as ilhas — apanha coordenadas trocadas. */
function isPlausible({ latitude, longitude }: MapLocation): boolean {
  return latitude >= 29 && latitude <= 43 && longitude >= -32 && longitude <= 1;
}

/**
 * Extrai coordenadas de um URL já resolvido do Google Maps.
 *
 * Preferimos "!3d<lat>!4d<lng>", que é o ponto do sítio em si; o "@lat,lng"
 * é apenas o centro da vista e pode estar dezenas de metros ao lado.
 */
export function parseGoogleMapsUrl(url: string): MapLocation | null {
  const place = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (place) return { latitude: Number(place[1]), longitude: Number(place[2]) };

  const viewport = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (viewport) return { latitude: Number(viewport[1]), longitude: Number(viewport[2]) };

  const query = url.match(/[?&](?:q|query|ll|center)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (query) return { latitude: Number(query[1]), longitude: Number(query[2]) };

  return null;
}

/** "38.63329, -9.14416" — o par escrito à mão. */
function parseCoordinatePair(value: string): MapLocation | null {
  const m = value.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!m) return null;
  return { latitude: Number(m[1]), longitude: Number(m[2]) };
}

export type ResolveResult =
  | { ok: true; location: MapLocation }
  | { ok: false; error: string };

/**
 * Resolve o que foi colado. Um link curto (maps.app.goo.gl) não traz as
 * coordenadas no endereço, por isso é preciso segui-lo até ao destino — daí
 * esta função fazer rede e ser assíncrona.
 */
export async function resolveMapLocation(input: string): Promise<ResolveResult> {
  const value = input.trim();
  if (!value) return { ok: false, error: "Indica uma localização." };

  const pair = parseCoordinatePair(value);
  if (pair) {
    return isPlausible(pair)
      ? { ok: true, location: pair }
      : { ok: false, error: "Essas coordenadas não ficam em Portugal. Verifica se trocaste a latitude com a longitude." };
  }

  if (!/^https?:\/\//i.test(value)) {
    return { ok: false, error: "Cola o link do Google Maps (Partilhar → Copiar link) ou as coordenadas no formato 38.63329, -9.14416." };
  }

  let direct = parseGoogleMapsUrl(value);

  if (!direct) {
    // Link curto: só o destino traz as coordenadas.
    try {
      const response = await fetch(value, {
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; apice360-site)" },
      });
      direct = parseGoogleMapsUrl(response.url);
    } catch {
      return { ok: false, error: "Não foi possível abrir esse link. Tenta colar o link longo do Google Maps, ou as coordenadas." };
    }
  }

  if (!direct) {
    return { ok: false, error: "Não encontrei coordenadas nesse link. Abre o local no Google Maps, carrega em Partilhar e copia o link." };
  }
  if (!isPlausible(direct)) {
    return { ok: false, error: "O link aponta para fora de Portugal. Confirma que é o local certo." };
  }

  return { ok: true, location: direct };
}
