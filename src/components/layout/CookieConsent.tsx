"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export const PRIVACY_MODAL_EVENT = "apice360:open-privacy";
export const COOKIE_CONSENT_KEY = "apice360-cookie-consent";
export const COOKIE_CONSENT_EVENT = "apice360:cookie-consent";

const PRIVACY_SECTIONS: { title: string; body: string }[] = [
  {
    title: "Dados que recolhemos.",
    body: "Nome, e-mail, telefone/WhatsApp e informações sobre o seu projeto, fornecidos voluntariamente por si através do formulário de contacto, do simulador ou de conversas iniciadas pelo WhatsApp.",
  },
  {
    title: "Finalidade.",
    body: "Usamos estes dados exclusivamente para responder ao seu pedido, elaborar estudos de viabilidade e orçamentos, e apresentar os serviços da Ápice 360.",
  },
  {
    title: "Partilha.",
    body: "Não vendemos nem partilhamos os seus dados com terceiros para fins de marketing. Os dados só são partilhados quando exigido por lei ou necessário para prestar o serviço solicitado.",
  },
  {
    title: "Cookies e armazenamento local.",
    body: "Este site utiliza armazenamento local essencial para lembrar a sua escolha neste aviso de cookies.",
  },
  {
    title: "Dados de Analítica.",
    body: "Este site também recolhe dados analíticos sobre a utilização (como páginas visitadas, tempo de permanência e origem do acesso), através de ferramentas de analítica, com o objetivo de compreender e melhorar a experiência dos visitantes.",
  },
  {
    title: "Os seus direitos.",
    body: "A qualquer momento pode solicitar acesso, correção, portabilidade ou eliminação dos seus dados pessoais, contactando-nos pelo WhatsApp ou pelo e-mail indicado neste site.",
  },
];

export function CookieConsent() {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    function checkStoredConsent() {
      if (!window.localStorage.getItem(COOKIE_CONSENT_KEY)) {
        setBannerVisible(true);
      }
    }
    checkStoredConsent();
    const openModal = () => setModalOpen(true);
    window.addEventListener(PRIVACY_MODAL_EVENT, openModal);
    return () => window.removeEventListener(PRIVACY_MODAL_EVENT, openModal);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  function setConsent(value: "accepted" | "rejected") {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
    setBannerVisible(false);
  }

  return (
    <>
      {bannerVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-outline bg-surface-container p-6 shadow-2xl sm:flex-row sm:p-8">
            <p className="flex-1 text-sm leading-relaxed text-on-surface-variant">
              🍪 Usamos cookies e armazenamento local essenciais para o funcionamento do site, bem como ferramentas
              de analítica para compreender a utilização do site. Ao continuar a navegar, está a concordar com a
              nossa{" "}
              <button
                type="button"
                className="font-bold text-primary underline hover:text-primary-deep"
                onClick={() => setModalOpen(true)}
              >
                Política de Privacidade
              </button>
              .
            </p>
            <div className="flex w-full shrink-0 gap-3 sm:w-auto">
              <button
                type="button"
                onClick={() => setConsent("rejected")}
                className="flex-1 rounded-full border border-outline px-5 py-3 text-sm font-bold uppercase tracking-wide text-on-surface transition-colors hover:bg-surface-container-high sm:flex-none"
              >
                Recusar
              </button>
              <button
                type="button"
                onClick={() => setConsent("accepted")}
                className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary transition-all hover:scale-105 sm:flex-none"
              >
                Aceitar todos
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setModalOpen(false)} />
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface p-8 shadow-2xl sm:p-10">
            <button
              aria-label="Fechar"
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-high"
            >
              <Icon name="close" />
            </button>
            <h3 className="mb-2 text-headline-md font-bold">Política de Privacidade e Cookies</h3>
            <p className="mb-8 font-mono text-xs uppercase tracking-widest text-primary/70">
              Conforme o RGPD (Regulamento UE 2016/679)
            </p>
            <div className="space-y-5 text-sm leading-relaxed text-on-surface-variant">
              {PRIVACY_SECTIONS.map((section) => (
                <p key={section.title}>
                  <strong className="text-on-surface">{section.title}</strong> {section.body}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
