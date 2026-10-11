-- Campos do formulario do simulador da landing page, editaveis no painel.
-- Ate aqui as perguntas estavam escritas no componente e nos dicionarios:
-- acrescentar uma pergunta era mexer em codigo.

-- CreateEnum
CREATE TYPE "LpFieldType" AS ENUM ('TEXT', 'EMAIL', 'TEL', 'NUMBER', 'TEXTAREA', 'SELECT', 'CHOICE');

-- CreateTable
CREATE TABLE "LpSimulatorField" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "LpFieldType" NOT NULL DEFAULT 'TEXT',
    "step" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isHalfWidth" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LpSimulatorField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LpSimulatorFieldTranslation" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT NOT NULL,
    "hint" TEXT,
    "options" TEXT,

    CONSTRAINT "LpSimulatorFieldTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LpSimulatorField_key_key" ON "LpSimulatorField"("key");

-- CreateIndex
CREATE INDEX "LpSimulatorField_step_order_idx" ON "LpSimulatorField"("step", "order");

-- CreateIndex
CREATE UNIQUE INDEX "LpSimulatorFieldTranslation_fieldId_locale_key" ON "LpSimulatorFieldTranslation"("fieldId", "locale");

-- AddForeignKey
ALTER TABLE "LpSimulatorFieldTranslation" ADD CONSTRAINT "LpSimulatorFieldTranslation_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "LpSimulatorField"("id") ON DELETE CASCADE ON UPDATE CASCADE;
