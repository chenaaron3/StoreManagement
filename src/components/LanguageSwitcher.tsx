import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);

    const path = location.pathname;
    const pathWithoutLang = path.replace(/^\/(en|ja)/, "") || "/";
    const newPath = `/${lng}${pathWithoutLang}`;
    navigate(newPath, { replace: true });
  };

  const isJapanese = i18n.language === "ja";
  const switchToLanguage = isJapanese ? "en" : "ja";
  const switchToFlag = isJapanese ? "🇺🇸" : "🇯🇵";
  const ariaLabel =
    switchToLanguage === "en"
      ? t("language.switchToEnglish")
      : t("language.switchToJapanese");

  return (
    <button
      type="button"
      onClick={() => changeLanguage(switchToLanguage)}
      className={
        className ??
        "rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors ml-auto"
      }
      aria-label={ariaLabel}
    >
      <span className="text-base leading-none">{switchToFlag}</span>
    </button>
  );
}
