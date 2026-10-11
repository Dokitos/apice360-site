/**
 * Põe na base de dados o formulário do simulador tal como ele sempre existiu,
 * para o painel passar a mandar nele. Corre com:
 *
 *   npx tsx scripts/seed-lp-simulator-fields.ts           # base local (.env)
 *   npx tsx scripts/seed-lp-simulator-fields.ts --prod    # produção (.env.production.local)
 *
 * É seguro correr outra vez: um campo que já exista não é tocado, para não
 * apagar alterações feitas no painel.
 *
 * Os rótulos saem dos dicionários (src/lib/dictionary.ts), que é onde as
 * perguntas estavam escritas nos quatro idiomas. As traduções ficam marcadas
 * como automáticas, para que mudar a pergunta em Português volte a traduzir
 * as outras — se ficassem marcadas como escritas à mão, o Português mudava e
 * o Inglês ficava com a pergunta antiga.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { defaultSimulatorFields } from "../src/lib/lp-simulator";
import type { SiteLocale } from "../src/lib/locale";

const isProd = process.argv.includes("--prod");
if (isProd) loadEnv({ path: ".env.production.local", override: true });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const LOCALES: SiteLocale[] = ["PT", "EN", "ES", "FR"];

async function main() {
  const porIdioma = new Map(LOCALES.map((locale) => [locale, defaultSimulatorFields(locale)]));
  const base = porIdioma.get("PT")!;

  // A ordem é a posição dentro do passo, pela sequência em que os campos
  // apareciam no formulário.
  const contadorPorPasso = new Map<number, number>();

  for (const campo of base) {
    const order = contadorPorPasso.get(campo.step) ?? 0;
    contadorPorPasso.set(campo.step, order + 1);

    const traducoes = LOCALES.map((locale) => {
      const traduzido = porIdioma.get(locale)!.find((c) => c.key === campo.key) ?? campo;
      return {
        locale,
        isAutoTranslated: locale !== "PT",
        label: traduzido.label,
        hint: traduzido.hint,
        options: traduzido.options.length > 0 ? traduzido.options.join("\n") : null,
      };
    });

    const existente = await prisma.lpSimulatorField.findUnique({
      where: { key: campo.key },
      select: { id: true },
    });
    if (existente) {
      console.log(`= ${campo.key} (já existia, não tocado)`);
      continue;
    }

    await prisma.lpSimulatorField.create({
      data: {
        key: campo.key,
        type: campo.type,
        step: campo.step,
        order,
        isRequired: campo.isRequired,
        isActive: true,
        isHalfWidth: campo.isHalfWidth,
        isSystem: campo.isSystem,
        translations: { create: traducoes },
      },
    });
    console.log(`+ ${campo.key} (passo ${campo.step}, ordem ${order})`);
  }

  const total = await prisma.lpSimulatorField.count();
  console.log(`\n${isProd ? "PRODUCAO" : "LOCAL"}: ${total} campos no simulador.`);
}

main().finally(() => prisma.$disconnect());
