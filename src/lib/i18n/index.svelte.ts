import en from "./locales/en";
import zh from "./locales/zh";

const locales = {en, zh} as const;
export type Locale = keyof typeof locales;
export type {TranslationKey} from "./locales/en";

let locale = $state<Locale>(detectLocale());

function detectLocale(): Locale {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem("ghostty-locale") as Locale | null;
    if (saved && saved in locales) return saved;
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("zh")) return "zh";
    return "en";
}

export function setLocale(l: Locale) {
    locale = l;
    if (typeof window !== "undefined") {
        localStorage.setItem("ghostty-locale", l);
        document.documentElement.lang = l;
    }
}

export function getLocale(): Locale {
    return locale;
}

export function t(key: string): string {
    const dict = locales[locale] ?? en;
    return (dict as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
}

export function tWith(key: string, params: Record<string, string | number>): string {
    let result = t(key);
    for (const [k, v] of Object.entries(params)) {
        result = result.replace(`{${k}}`, String(v));
    }
    return result;
}

export function getLocaleList(): Array<{value: Locale; label: string}> {
    return [
        {value: "en", label: "English"},
        {value: "zh", label: "中文"}
    ];
}
