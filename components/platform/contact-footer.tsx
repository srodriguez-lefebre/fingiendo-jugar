"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

const CONTACT_EMAIL = "savarole@gmail.com";

export function ContactFooter() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    let didCopy = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
        didCopy = true;
      }
    } catch {}

    if (!didCopy) {
      const textarea = document.createElement("textarea");
      textarea.value = CONTACT_EMAIL;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      didCopy = document.execCommand("copy");
      textarea.remove();
    }

    if (didCopy) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <footer className="contact-footer">
      <span>
        Si tenes una idea de algun juego divertido, de previa o que matchee con
        esta web, no dudes en escribirme a{" "}
      </span>
      <span className="contact-footer__email">
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <button
          type="button"
          onClick={copyEmail}
          aria-label="Copiar correo"
          title={copied ? "Copiado" : "Copiar correo"}
        >
          {copied ? (
            <Check size={14} strokeWidth={2.4} />
          ) : (
            <Copy size={14} strokeWidth={2.2} />
          )}
        </button>
      </span>
    </footer>
  );
}
