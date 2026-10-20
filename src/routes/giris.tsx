// @ts-nocheck
// src/routes/giris.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft, ArrowRight, Check, CodeXml, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
  status;
}
async function communityApi(action, body) {
  const response = await fetch(`/api/community/${action}`, {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : void 0,
    body: body ? JSON.stringify(body) : void 0,
    cache: "no-store"
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(data?.error ?? "İşlem tamamlanamadı. Lütfen tekrar dene.", response.status);
  return data;
}

function PasswordField({ id, label, value, onChange, autoComplete = "new-password", minLength = 12 }) {
  const [visible, setVisible] = useState(false);
  return jsxs("div", { className: "form-field", children: [
    jsx("label", { htmlFor: id, children: label }),
    jsxs("div", { className: "password-input", children: [
      jsx("input", { id, name: id, type: visible ? "text" : "password", value, onChange: (event) => onChange(event.target.value), autoComplete, required: true, minLength, maxLength: 128 }),
      jsx("button", { type: "button", "aria-label": visible ? `${label} gizle` : `${label} göster`, "aria-pressed": visible, onClick: () => setVisible(!visible), children: visible ? jsx(EyeOff, { size: 19 }) : jsx(Eye, { size: 19 }) })
    ] })
  ] });
}

function LoginPage() {
  const [step, setStep] = useState("login");
  const [founder, setFounder] = useState(false);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [callbackBusy, setCallbackBusy] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptKvkk, setAcceptKvkk] = useState(false);
  const callbackStarted = useRef(false);
  useEffect(() => {
    if (callbackStarted.current) return;
    callbackStarted.current = true;
    // E-postadaki bağlantı: /giris?reset=TOKEN
    const token = new URLSearchParams(window.location.search).get("reset");
    if (token) {
      setResetToken(token);
      setStep("recovery");
    }
    setCallbackBusy(false);
  }, []);
  function changeStep(next) {
    setStep(next);
    setError("");
    setNotice("");
    setPassword("");
    setConfirmation("");
    if (next !== "password") setCode("");
    if (next !== "code" && next !== "password") {
      setAcceptTerms(false);
      setAcceptKvkk(false);
    }
  }
  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (["password", "invite", "recovery"].includes(step) && password !== confirmation) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (["code", "password"].includes(step) && !(acceptTerms && acceptKvkk)) {
      setError("Devam etmek için Üyelik Sözleşmesi’ni ve KVKK Aydınlatma Metni’ni onaylaman gerekiyor.");
      return;
    }
    setBusy(true);
    try {
      if (step === "login") {
        await communityApi("login", {
          username,
          password,
          founder
        });
        window.location.assign("/panel");
      } else if (step === "code") {
        const result = await communityApi("check-code", {
          code
        });
        setUsername(result.username);
        setStep("password");
      } else if (step === "password") {
        const result = await communityApi("activate", {
          code,
          password
        });
        setUsername(result.username);
        setFounder(false);
        changeStep("login");
        setNotice("Hesabın aktive edildi. Kullanıcı adın ve yeni şifrenle giriş yapabilirsin.");
      } else if (step === "recovery") {
        await communityApi("reset-password", {
          token: resetToken,
          password
        });
        setResetToken("");
        window.history.replaceState(null, "", "/giris");
        changeStep("login");
        setNotice("Şifren güncellendi. Yeni şifrenle giriş yapabilirsin.");
      } else {
        await communityApi("recover", {
          username,
          founder
        });
        setNotice("Aktif bir hesap varsa kayıtlı e-posta adresine şifre sıfırlama bağlantısı gönderildi.");
      }
    } catch (caught) {
      setError(caught instanceof Error && !["invite", "recovery"].includes(step) ? caught.message : "İşlem tamamlanamadı. Bağlantı süresi dolmuş olabilir; tekrar dene.");
    } finally {
      setBusy(false);
      if (step !== "code" && step !== "forgot") {
        setPassword("");
        setConfirmation("");
      }
    }
  }
  const titles = {
    login: "Tekrar merhaba.",
    code: "İlk adım, senin kodun.",
    password: "Sana özel bir başlangıç.",
    invite: "Hoş geldin, kurucu.",
    recovery: "Yeni bir şifre.",
    forgot: "Kaldığın yerden devam et."
  };
  const descriptions = {
    login: "Kullanıcı adın ve şifrenle çalışma alanına giriş yap.",
    code: "Yöneticinin sana verdiği tek kullanımlık aktivasyon kodunu gir.",
    password: `${username} hesabın için en az 12 karakterlik güçlü bir şifre oluştur.`,
    invite: "Yönetici davetini kabul etmek için en az 12 karakterlik bir şifre oluştur.",
    recovery: "Hesabın için en az 12 karakterlik yeni bir şifre belirle.",
    forgot: "Kullanıcı adını gir. Şifre sıfırlama bağlantısını kayıtlı e-posta adresine gönderelim."
  };
  return jsxs("div", { className: "account-page", children: [
    jsxs("header", { className: "account-header container", children: [
      jsxs("a", { className: "brand", href: "/", children: [
        jsx("span", { className: "brand-icon", children: jsx(CodeXml, { size: 22 }) }),
        jsxs("span", { children: [
          "semih",
          jsx("span", { className: "brand-light", children: "algan" }),
          "."
        ] })
      ] }),
      jsxs("a", { className: "back-link", href: "/", children: [
        jsx(ArrowLeft, { size: 16 }),
        "Ana sayfa"
      ] })
    ] }),
    jsxs("main", { className: "auth-layout container", children: [
      jsxs("aside", { className: "auth-editorial", children: [
        jsx("span", { className: "section-eyebrow", children: "SEMİH ALGAN / ÇALIŞMA ALANI" }),
        jsxs("h1", { children: [
          "İyi fikirlerin",
          jsx("br", {}),
          jsx("span", { children: "buluşma noktası." })
        ] }),
        jsxs("p", { children: [
          "Geliştiriciler, roller ve yeni başlangıçlar.",
          jsx("br", {}),
          "Her şeyin bir araya geldiği kişisel alan."
        ] }),
        jsxs("div", { className: "auth-art", "aria-hidden": "true", children: [
          jsxs("div", { className: "auth-art-frame", children: [
            jsx(CodeXml, { size: 84, strokeWidth: 1 }),
            jsx("span", { children: "SA / WORKSPACE" })
          ] }),
          jsxs("div", { className: "auth-art-label", children: [
            jsx("span", { className: "status-dot" }),
            " FİKİRDEN KODA"
          ] })
        ] }),
        jsxs("div", { className: "auth-security", children: [
          jsx(ShieldCheck, { size: 22 }),
          jsxs("span", { children: [
            "Şifreler yalnızca güvenli hesap hizmetinde tutulur.",
            jsx("br", {}),
            jsx("strong", { children: "Yönetici dahil kimse şifreni göremez." })
          ] })
        ] })
      ] }),
      jsxs("section", { className: "auth-card", "aria-labelledby": "auth-title", children: [
        jsxs("div", { className: "auth-card-top", children: [
          jsx("span", { className: "auth-symbol", children: step === "code" ? jsx(KeyRound, { size: 23 }) : jsx(LockKeyhole, { size: 23 }) }),
          jsx("span", { className: "small-label", children: step === "login" ? "HESABINA GİRİŞ YAP" : step === "forgot" ? "ŞİFRE YENİLEME" : "HESABINI HAZIRLA" })
        ] }),
        jsx("h2", { id: "auth-title", children: titles[step] }),
        jsx("p", { className: "form-description", children: descriptions[step] }),
        ["code", "password"].includes(step) && jsxs("div", { className: "activation-steps", children: [
          jsxs("span", { className: step === "code" ? "current" : "complete", children: [
            step === "password" ? jsx(Check, { size: 13 }) : "01",
            " Kodunu doğrula"
          ] }),
          jsx("span", { className: step === "password" ? "current" : "", children: "02 Şifreni oluştur" })
        ] }),
        jsx("form", { onSubmit: submit, className: "account-form", children: jsxs("fieldset", { disabled: busy || callbackBusy, children: [
          (step === "login" || step === "forgot") && jsxs("div", { className: "form-field", children: [
            jsx("label", { htmlFor: "username", children: founder ? "Yönetici e-posta adresi" : "Kullanıcı adı" }),
            jsx("input", { id: "username", name: "username", type: founder ? "email" : "text", value: username, onChange: (event) => setUsername(event.target.value), autoComplete: "username", autoCapitalize: "none", spellCheck: false, required: true, maxLength: 254, placeholder: founder ? "Yönetici e-posta adresi" : "Kullanıcı adını yaz" })
          ] }),
          step === "code" && jsxs("div", { className: "form-field", children: [
            jsx("label", { htmlFor: "activation-code", children: "Aktivasyon kodu" }),
            jsx("input", { className: "code-field", id: "activation-code", name: "activation-code", value: code, onChange: (event) => setCode(event.target.value), autoComplete: "off", autoCapitalize: "none", spellCheck: false, required: true, minLength: 16, maxLength: 32, placeholder: "XXXX-XXXX-XXXX-XXXX" })
          ] }),
          step !== "code" && step !== "forgot" && jsx(PasswordField, { id: "password", label: step === "login" ? "Şifre" : "Yeni şifre", value: password, onChange: setPassword, autoComplete: step === "login" ? "current-password" : "new-password", minLength: step === "login" ? 1 : 12 }),
          ["password", "invite", "recovery"].includes(step) && jsxs(Fragment, { children: [
            jsx(PasswordField, { id: "confirm-password", label: "Şifre tekrar", value: confirmation, onChange: setConfirmation }),
            jsx("p", { className: "field-hint", children: "En az 12 karakter kullan. Kelimeleri, rakamları ve işaretleri birleştir." })
          ] }),
          step === "login" && jsx("button", { type: "button", className: "text-action forgot-link", onClick: () => changeStep("forgot"), children: "Şifremi unuttum" }),
          ["code", "password"].includes(step) && jsxs("div", { className: "consent-box", style: { display: "grid", gap: 12, margin: "6px 0 4px" }, children: [
            jsxs("label", { htmlFor: "accept-terms", style: { display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.5, fontSize: ".92rem", cursor: "pointer" }, children: [
              jsx("input", { id: "accept-terms", name: "accept-terms", type: "checkbox", checked: acceptTerms, onChange: (event) => setAcceptTerms(event.target.checked), required: true, style: { width: 20, height: 20, marginTop: 2, flexShrink: 0 } }),
              jsxs("span", { children: [
                jsx("a", { href: "/uyelik-sozlesmesi", target: "_blank", rel: "noopener noreferrer", children: "Üyelik Sözleşmesi" }),
                " ve ",
                jsx("a", { href: "/kullanim-kosullari", target: "_blank", rel: "noopener noreferrer", children: "Kullanım Koşulları" }),
                "’nı okudum, kabul ediyorum."
              ] })
            ] }),
            jsxs("label", { htmlFor: "accept-kvkk", style: { display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.5, fontSize: ".92rem", cursor: "pointer" }, children: [
              jsx("input", { id: "accept-kvkk", name: "accept-kvkk", type: "checkbox", checked: acceptKvkk, onChange: (event) => setAcceptKvkk(event.target.checked), required: true, style: { width: 20, height: 20, marginTop: 2, flexShrink: 0 } }),
              jsxs("span", { children: [
                jsx("a", { href: "/kvkk", target: "_blank", rel: "noopener noreferrer", children: "KVKK Aydınlatma Metni" }),
                "’ni ve ",
                jsx("a", { href: "/gizlilik", target: "_blank", rel: "noopener noreferrer", children: "Gizlilik ve Çerez Politikası" }),
                "’nı okudum, anladım."
              ] })
            ] })
          ] }),
          jsxs("div", { className: "form-feedback", "aria-live": "polite", "aria-atomic": "true", children: [
            error && jsx("p", { className: "message message-error", role: "alert", children: error }),
            notice && jsx("p", { className: "message message-success", role: "status", children: notice })
          ] }),
          jsxs("button", { className: "button button-primary form-submit", type: "submit", children: [
            callbackBusy ? "Güvenli bağlantı kontrol ediliyor…" : busy ? "İşlem yapılıyor…" : step === "login" ? "Giriş yap" : step === "code" ? "Kodu doğrula" : step === "forgot" ? "Sıfırlama bağlantısı gönder" : step === "recovery" ? "Şifreyi güncelle" : "Şifremi oluştur",
            jsx(ArrowRight, { size: 18 })
          ] })
        ] }) }),
        jsx("div", { className: "auth-card-bottom", children: step === "login" ? jsxs(Fragment, { children: [
          jsx("span", { children: "Hesabın yok mu?" }),
          jsxs("button", { className: "text-action", type: "button", disabled: busy || callbackBusy, onClick: () => changeStep("code"), children: [
            "Kayıt ol ",
            jsx(ArrowUpRightIcon, {})
          ] })
        ] }) : jsxs("button", { className: "text-action", type: "button", disabled: busy || callbackBusy, onClick: () => changeStep("login"), children: [
          jsx(ArrowLeft, { size: 15 }),
          "Girişe dön"
        ] }) }),
        (step === "login" || step === "forgot") && jsx("button", { className: "founder-toggle", type: "button", disabled: busy || callbackBusy, onClick: () => {
          setFounder(!founder);
          setUsername("");
          setError("");
          setNotice("");
        }, children: founder ? "Kullanıcı adıyla giriş yap" : "Kurucu / admin girişi" }),
        founder && (step === "login" || step === "forgot") && jsx("p", { className: "setup-note", children: "Yönetici hesabı veritabanında tanımlıdır. Pano rolleri yönetim yetkisi vermez." })
      ] })
    ] }),
    jsxs("footer", { className: "account-footer container", children: [
      "Kişisel bir alan. Ortak bir merak.",
      jsxs("span", { style: { display: "flex", flexWrap: "wrap", gap: "6px 14px" }, children: [
        jsx("a", { href: "/kvkk", children: "KVKK" }),
        jsx("a", { href: "/gizlilik", children: "Gizlilik ve Çerezler" }),
        jsx("a", { href: "/kullanim-kosullari", children: "Kullanım Koşulları" }),
        jsx("a", { href: "/uyelik-sozlesmesi", children: "Üyelik Sözleşmesi" }),
        jsxs("span", { children: ["Semih Algan © ", (new Date()).getFullYear()] })
      ] })
    ] })
  ] });
}
function ArrowUpRightIcon() {
  return jsx(ArrowRight, { size: 14, className: "diagonal-arrow" });
}

export const Route = createFileRoute("/giris")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Panele giriş — Semih Algan" }, { name: "robots", content: "noindex" }]
  })
});
