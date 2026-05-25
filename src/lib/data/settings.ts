import type {HexColor} from "$lib/utils/colors";

interface BaseSettingType {
    id: string;
    name: string;
    note?: string;
    nameKey?: string;
    noteKey?: string;
}

interface Panel extends BaseSettingType {
    groups: Group[];
}

interface Group extends BaseSettingType {
    settings: Array<Switch | Text | Number | Dropdown | Color | Palette | Keybinds | Theme>;
    // type: "group";
}

type SettingType = "switch" | "number" | "dropdown" | "text" | "color" | "palette" | "keybinds" | "theme";

interface BaseSettingItem extends BaseSettingType {
    type: SettingType;
    value: unknown;
}

interface Switch extends BaseSettingItem {
    type: "switch";
    value: boolean;
}

interface Text extends BaseSettingItem {
    type: "text";
    value: string;
    placeholder?: string;
}

interface Number extends BaseSettingItem {
    type: "number";
    value: number;
    min?: number;
    max?: number;
    step?: number;
    size?: number;
    range?: boolean;
    placeholder?: string;
}

interface DropdownOption {
    name: string;
    value: string;
}

interface Dropdown extends BaseSettingItem {
    type: "dropdown";
    value: "string";
    options: Array<DropdownOption | string>;
    placeholder?: string;
}

interface Theme extends BaseSettingItem {
    type: "theme";
    value: "string";
    options: Array<DropdownOption | string>;
}

interface Color extends BaseSettingItem {
    value: HexColor;
    type: "color";
}

interface Palette extends BaseSettingItem {
    value: HexColor[];
    type: "palette";
}

export type KeybindString = `${string}=${string}`;
interface Keybinds extends BaseSettingItem {
    value: KeybindString[];
    type: "keybinds";
}

interface ThemeResponse {
    type: string;
    encoding: string;
    size: number;
    name: string;
    path: string;
    content: string;
    sha: string;
    url: string;
    git_url: string;
    html_url: string;
    download_url: string;
    _links: {
        git: string;
        self: string;
        html: string;
    };
}

// TODO: unify config typing across repo
export interface ColorScheme {
    palette: HexColor[];
    background?: HexColor;
    foreground?: HexColor;
    cursorColor?: HexColor;
    selectionBackground?: HexColor;
    selectionForeground?: HexColor;
}

const fetchThemeFiles = async () => {
    const response = await fetch("https://api.github.com/repos/mbadolato/iTerm2-Color-Schemes/contents/ghostty");
    if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
    return await response.json() as ThemeResponse[];
};

export const fetchColorScheme = async (theme: string) => {
    const response = await fetch(`https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master/ghostty/${theme}`);
    if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
    return await response.text();
};

void fetchThemeFiles().then((themeFiles: ThemeResponse[] | null) => {
    if (!themeFiles) return;
    const themeNames = themeFiles.map((file: ThemeResponse) => file.name).sort((a, b) => a.localeCompare(b, undefined, {sensitivity: "base", numeric: true}));
    const themeSetting = settings.find(p => p.id === "colors")?.groups.find(g => g.id === "general")?.settings.find(s => s.type === "theme");
    themeSetting?.options.push(...themeNames);
});

const getOS = () => {
    const platform = navigator.userAgent?.toLowerCase();
    if (platform.includes("linux")) return "linux";
    if (platform.includes("mac")) return "macos";
    return "other";
};

// TODO: find a good way to properly type the settings
// TODO: also allow clearable settings and such, this is a mess
const settings = [
    {
        id: "application",
        name: "Application",
        note: "",
        groups: [
            {
                id: "general",
                name: "",
                // type: "group",
                settings: [
                    {id: "title", name: "Static title for all windows", type: "text", value: ""},
                    {id: "desktopNotifications", name: "Allow desktop notifications", type: "switch", value: true},
                    {id: "configFile", name: "Additional config file", type: "text", value: ""},
                    {id: "configDefaultFiles", name: "Load default config file", type: "switch", value: true},
                    {id: "link", name: "Link handling", note: "Regex for making clickable links, currently disabled.", type: "text", value: "", disabled: true},
                    {id: "linkUrl", name: "Automatically link URLs", note: "Matching occurs while holding the control (Linux) or command (macOS) key.", type: "switch", value: true},
                    {id: "linkPreviews", name: "Show link previews", note: "When set to `osc8`, previews are only shown for hyperlinks created with the OSC 8 sequence.", type: "dropdown", value: "true", options: ["true", "false", "osc8"]},
                    {id: "undoTimeout", name: "Undo timeout", note: "Timeout for undo operations. Format like `1h30m`, `5s`, `500ms`.", type: "text", value: ""}
                ]
            },
            {
                id: "startup",
                name: "Startup",
                // type: "group",
                settings: [
                    {id: "command", name: "Command to run on launch", type: "text", value: ""},
                    {id: "initialCommand", name: "Command to run on first launch", note: "Unlike the previous setting, this will only run once in the lifetime of the app.", type: "text", value: ""},
                    {id: "env", name: "Environment variables", type: "text", value: ""},
                    {id: "input", name: "Initial input", note: "Input for tty launch. Can be raw text, zig string literal, or path:/to/file.", type: "text", value: ""},
                    {id: "maximize", name: "Launch as maximized window", type: "switch", value: false},
                    {id: "fullscreen", name: "Launch in fullscreen mode", type: "switch", value: false},
                    {id: "initialWindow", name: "Show a window on startup", type: "switch", value: true},
                    {id: "workingDirectory", name: "Directory to use after startup", note: "Special values of `home` and `inherit` are also allowed here.", type: "text", value: ""},
                ]
            },
            {
                id: "shutdown",
                name: "Shutdown",
                // type: "group",
                settings: [
                    {id: "waitAfterCommand", name: "Wait for input after command", type: "switch", value: false},
                    {id: "abnormalCommandExitRuntime", name: "Abnormal command exit runtime", type: "number", value: 250, min: 0, size: 5},
                    {id: "confirmCloseSurface", name: "Confirm when closing a surface", type: "dropdown", value: "true", options: ["true", "false", "always"]},
                    {id: "quitAfterLastWindowClosed", name: "Quit after closing last window", type: "switch", value: false},
                    {id: "quitAfterLastWindowClosedDelay", name: "Delay before auto quitting", type: "text", value: ""},
                ]
            },
            {
                id: "shell",
                name: "Shell Integration",
                // type: "group",
                settings: [
                    {id: "shellIntegration", name: "Shell integration style", type: "dropdown", value: "detect", options: ["none", "detect", "bash", "elvish", "fish", "nushell", "zsh"]},
                    {id: "shellIntegrationFeatures", name: "Shell integration features", note: "Available features: cursor, sudo, title, ssh-env, ssh-terminfo, path. Including one force enables it, prefixing it with `no-` force disables it, omitting it falls back to default.", type: "text", value: "cursor,no-sudo,title,no-ssh-env,no-ssh-terminfo,path"},
                    {id: "term", name: "TERM environment variable", type: "text", value: "xterm-ghostty"},
                    {id: "titleReport", name: "CSI 21 title reporting", note: "This allows running apps to read the terminal title.", type: "switch", value: false},
                ]
            },
            {
                id: "quick",
                name: "Quick Terminal",
                settings: [
                    {id: "quickTerminalPosition", name: "Terminal position", type: "dropdown", value: "top", options: ["top", "right", "bottom", "left", "center"]},
                    {id: "quickTerminalScreen", name: "Screen location", type: "dropdown", value: "main", options: ["main", "mouse", "macos-menu-bar"]},
                    {id: "quickTerminalSize", name: "Quick terminal size", note: "Specify the size as a percentage (e.g. `50%`) or in pixels (e.g. `800`). You can specify two values separated by a comma for width and height.", type: "text", value: ""},
                    {id: "quickTerminalAnimationDuration", name: "Animation duration", type: "number", value: 0.2, min: 0, max: 10, step: 0.1, range: true},
                    {id: "quickTerminalAutohide", name: "Autohide", note: "This autohides the quick terminal when focus shifts away.", type: "switch", value: true},
                    {id: "quickTerminalSpaceBehavior", name: "macOS space behavior", type: "dropdown", value: "move", options: ["move", "remain"]},
                    {id: "quickTerminalKeyboardInteractivity", name: "Keyboard interactivity", note: "Controls when the quick terminal receives keyboard input. GTK Wayland only.", type: "dropdown", value: "on-demand", options: ["none", "on-demand", "exclusive"]},
                ]
            },
            {
                id: "advanced",
                name: "Advanced",
                note: "You should only touch these settings if you know what you're doing, otherwise you could cause major issues with Ghostty!",
                // type: "group",
                settings: [
                    {id: "scrollbackLimit", name: "Scrollback buffer size (bytes)", note: "This buffer exists completely in memory but is allocated lazily.", type: "number", value: 10000000, min: 0, size: 10},
                    {id: "customShader", name: "Custom shader", note: "This matches the API of Shadertoy.", type: "text", value: ""},
                    {id: "customShaderAnimation", name: "Allow shaders to animate", type: "dropdown", value: "true", options: ["false", "true", "always"]},
                    {id: "scrollToBottom", name: "Scroll to bottom on", note: "Comma-separated list. Available values: keystroke, output.", type: "text", value: ""},
                    {id: "enquiryResponse", name: "Response to ENQ", type: "text", value: ""},
                    {id: "oscColorReportFormat", name: "OSC color report format", type: "dropdown", value: "16-bit", options: ["none", "8-bit", "16-bit"]},
                    {id: "vtKamAllowed", name: "VT kam mode allowed", note: "If you don't know what this is, don't touch it!", type: "switch", value: false},
                    {id: "imageStorageLimit", name: "Image buffer limit (bytes)", type: "number", value: 320000000, min: 0, max: 4294967295, size: 12},
                ]
            },
            {
                id: "bell",
                name: "Bell",
                settings: [
                    {id: "bellFeatures", name: "Bell features", note: "Comma-separated list of features. Available: system, audio, attention, title, border. Prefix with `no-` to disable.", type: "text", value: ""},
                    {id: "bellAudioPath", name: "Bell audio file", note: "Path to an audio file to play when the bell rings. Requires `audio` in bell features. GTK only.", type: "text", value: ""},
                    {id: "bellAudioVolume", name: "Bell audio volume", note: "Volume for the bell audio, from 0 (silent) to 1 (full). GTK only.", type: "number", range: true, value: 0.5, min: 0, max: 1, step: 0.05},
                ]
            },
        ]
    },
    {
        id: "clipboard",
        name: "Clipboard",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    {id: "clipboardRead", name: "Allow terminal to read clipboard", type: "dropdown", value: "ask", options: ["ask", "allow", "deny"]},
                    {id: "clipboardWrite", name: "Allow terminal to write clipboard", type: "dropdown", value: "allow", options: ["ask", "allow", "deny"]},
                    {id: "copyOnSelect", name: "Copy on select", type: "dropdown", value: getOS() === "linux" ? "true" : "false", options: ["true", "false", "clipboard"]},
                    {id: "clipboardTrimTrailingSpaces", name: "Trim trailing space on copy", type: "switch", value: true},
                    {id: "clipboardPasteProtection", name: "Confirm when pasting unsafely", type: "switch", value: true},
                    {id: "clipboardPasteBracketedSafe", name: "Mark bracketed paste as safe", type: "switch", value: true},
                ]
            }
        ]
    },
    {
        id: "window",
        name: "Window",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    {id: "windowTitleFontFamily", name: "Window title font", type: "text", value: ""},
                    {id: "windowSubtitle", name: "Window subtitle", type: "dropdown", value: "false", options: ["false", "working-directory"]},
                    {id: "windowVsync", name: "Enable vsync", type: "switch", value: true},
                    {id: "windowInheritWorkingDirectory", name: "Inherit working directory", type: "switch", value: true},
                    {id: "tabInheritWorkingDirectory", name: "Tabs inherit working directory", type: "switch", value: true},
                    {id: "splitInheritWorkingDirectory", name: "Splits inherit working directory", type: "switch", value: true},
                    {id: "windowInheritFontSize", name: "Inherit font size", type: "switch", value: true},
                    {id: "windowColorspace", name: "Window colorspace", type: "dropdown", value: "srgb", options: ["srgb", "display-p3"]},
                    {id: "windowSaveState", name: "Save window state", type: "dropdown", value: "default", options: ["default", "never", "always"]},
                    {id: "windowShowTabBar", name: "Show tab bar", type: "dropdown", value: "auto", options: ["always", "auto", "never"]},
                    // maybe move to application?
                    {id: "windowNewTabPosition", name: "New tab position", type: "dropdown", value: "current", options: ["current", "end"]},
                ]
            },
            {
                id: "appearance",
                name: "Appearance",
                settings: [
                    {id: "windowTheme", name: "Window theme", type: "dropdown", value: "auto", options: ["auto", "system", "light", "dark", "ghostty"]},
                    {id: "windowDecoration", name: "Window decorations", type: "dropdown", value: "auto", options: ["auto", "none", "client", "server"]},
                    {id: "windowPaddingX", name: "Horizontal window padding", type: "text", value: "2"},
                    {id: "windowPaddingY", name: "Vertical window padding", type: "text", value: "2"},
                    {id: "windowPaddingBalance", name: "Auto-balance window padding", type: "switch", value: false},
                    {id: "windowPaddingColor", name: "Window padding color", type: "dropdown", value: "background", options: ["background", "extend", "extend-always"]},

                    // maybe move to colors
                    {id: "windowTitlebarBackground", name: "Titlebar background", type: "color", value: ""},
                    {id: "windowTitlebarForeground", name: "Titlebar foreground", type: "color", value: ""},
                    {id: "backgroundOpacity", name: "Background opacity", type: "number", range: true, value: 1, min: 0, max: 1, step: 0.01},
                    {id: "backgroundOpacityCells", name: "Force background opacity on cells.", type: "switch", value: false},
                    {id: "backgroundBlur", name: "Background blur", note: "Set to `true` to enable blur, `false` to disable, a number for a specific radius (macOS), or `macos-glass-regular`/`macos-glass-clear` for macOS glass effects.", type: "text", value: "false"},
                    {id: "backgroundImage", name: "Background image", note: "Path to an image file to use as the terminal background.", type: "text", value: ""},
                    {id: "backgroundImageOpacity", name: "Background image opacity", type: "number", range: true, value: 1, min: 0, max: 1, step: 0.01},
                    {id: "backgroundImagePosition", name: "Background image position", type: "dropdown", value: "center", options: ["center", "top-left", "top-center", "top-right", "center-left", "center-center", "center-right", "bottom-left", "bottom-center", "bottom-right"]},
                    {id: "backgroundImageFit", name: "Background image fit", type: "dropdown", value: "contain", options: ["contain", "cover", "stretch", "none"]},
                    {id: "backgroundImageRepeat", name: "Repeat background image", type: "switch", value: false},
                    {id: "scrollbar", name: "Scrollbar visibility", note: "Currently only supported on macOS.", type: "dropdown", value: "system", options: ["system", "never"]},
                    {id: "unfocusedSplitOpacity", name: "Unfocused split opacity", type: "number", range: true, value: 0.7, min: 0.15, max: 1, step: 0.01},
                    {id: "unfocusedSplitFill", name: "Unfocused split fill color", type: "color", value: ""},
                    {id: "splitDividerColor", name: "Split divider color", type: "color", value: ""},
                    {id: "splitPreserveZoom", name: "Split preserve zoom on navigation", note: "When navigating between splits, keep the zoomed state.", type: "switch", value: false},
                ]
            },
            {
                id: "resize",
                name: "Sizing & Resizing",
                settings: [
                    {id: "windowHeight", name: "Initial window height", note: "This size is not in pixels but in number of terminal grid cells", type: "number", min: 4, step: 1, size: 4, placeholder: "e.g. 24"},
                    {id: "windowWidth", name: "Initial window width", note: "This size is not in pixels but in number of terminal grid cells", type: "number", min: 10, step: 1, size: 4, placeholder: "e.g. 80"},
                    {id: "windowPositionY", name: "Initial window Y", note: "Relative to the top left pixel of the screen", type: "number", value: 0, min: 0, step: 1, size: 4, placeholder: "e.g. 0"},
                    {id: "windowPositionX", name: "Initial window X", note: "Relative to the top left pixel of the screen", type: "number", value: 0, min: 0, step: 1, size: 4, placeholder: "e.g. 0"},
                    {id: "windowStepResize", name: "Resize in grid cell increments", type: "switch", value: false},
                    {id: "resizeOverlay", name: "Show resize overlays", type: "dropdown", value: "after-first", options: ["always", "never", "after-first"]},
                    {id: "resizeOverlayPosition", name: "Resize overlay position", type: "dropdown", value: "center", options: ["center", "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"]},
                    {id: "resizeOverlayDuration", name: "Show resize overlay time", type: "text", value: "750ms"},
                ]
            },
        ]
    },
    {
        id: "colors",
        name: "Colors",
        groups: [
            {
                id: "general",
                name: "",
                settings: [
                    {
                        id: "theme",
                        name: "Color theme",
                        note: "Any colors selected after setting this will overwrite the theme's colors.",
                        type: "theme",
                        value: "",
                        options: [{name: "Custom", value: ""}]
                    },
                    {id: "boldColor", name: "Bold text color", note: "Set to `bright` to use bright palette colors for bold text, or a hex color value. Leave empty to use the default.", type: "text", value: ""},
                    {id: "faintOpacity", name: "Faint text opacity", type: "number", range: true, value: 0.5, min: 0, max: 1, step: 0.01},
                    {id: "minimumContrast", name: "Minimum contrast", type: "number", value: 1, range: true, min: 1, max: 21, step: 0.1},
                    {id: "paletteGenerate", name: "Auto-generate missing palette colors", note: "When enabled, Ghostty will generate missing colors (indices 16-231) based on the first 16.", type: "switch", value: true},
                    {id: "paletteHarmonious", name: "Harmonious palette generation", note: "Inverts generated palette colors. Has no effect if auto-generation is disabled.", type: "switch", value: false},
                ]
            },
            {
                id: "base",
                name: "Base Colors",
                note: "The preview here shows selected text in the second line of the command output.",
                settings: [
                    {id: "background", name: "Background color", type: "color", value: "#282c34"},
                    {id: "foreground", name: "Foreground color", type: "color", value: "#ffffff"},
                    {id: "selectionBackground", name: "Selection background color", type: "color", value: ""},
                    {id: "selectionForeground", name: "Selection foreground color", type: "color", value: ""},
                    {id: "selectionClearOnTyping", name: "Clear selection on typing", type: "switch", value: true},
                    {id: "selectionClearOnCopy", name: "Clear selection on copy", type: "switch", value: false},
                    {id: "selectionWordChars", name: "Word selection characters", note: "Characters that are considered part of a word for double-click selection.", type: "text", value: ""},
                ]
            },
            {
                id: "cursor",
                name: "Cursor",
                note: "The cursor in this preview blinks on and off at 1 second intervals for emphasis, it may not match what you see in Ghostty!",
                settings: [
                    {id: "cursorColor", name: "Cursor color", type: "color", value: ""},
                    {id: "cursorText", name: "Text color under cursor", type: "color", value: ""},
                    {id: "cursorOpacity", name: "Cursor opacity", type: "number", value: 1, range: true, min: 0, max: 1, step: 0.05},
                    {id: "cursorStyle", name: "Cursor style", type: "dropdown", value: "block", options: ["block", "bar", "underline", {value: "block_hollow", name: "hollow block"}]},
                    {id: "cursorStyleBlink", name: "Cursor blink style", note: "The `default` option defers to DEC mode 12 to determine blinking state.", type: "dropdown", value: "", options: ["true", "false", {value: "", name: "default"}]},
                ]
            },
            {
                id: "palette",
                name: "Color Palette",
                note: "The first 16 colors are the most commonly displayed colors in the terminal.\n\nColors 1-8 are typically black, red, green, yellow, blue, magenta, cyan, and white.\nColors 9-16 are typically \"brighter\" variants of these colors.",
                settings: [
                    {id: "palette", name: "", type: "palette", value: ["#1d1f21", "#cc6666", "#b5bd68", "#f0c674", "#81a2be", "#b294bb", "#8abeb7", "#c5c8c6", "#666666", "#d54e53", "#b9ca4a", "#e7c547", "#7aa6da", "#c397d8", "#70c0b1", "#eaeaea", "#000000", "#00005f", "#000087", "#0000af", "#0000d7", "#0000ff", "#005f00", "#005f5f", "#005f87", "#005faf", "#005fd7", "#005fff", "#008700", "#00875f", "#008787", "#0087af", "#0087d7", "#0087ff", "#00af00", "#00af5f", "#00af87", "#00afaf", "#00afd7", "#00afff", "#00d700", "#00d75f", "#00d787", "#00d7af", "#00d7d7", "#00d7ff", "#00ff00", "#00ff5f", "#00ff87", "#00ffaf", "#00ffd7", "#00ffff", "#5f0000", "#5f005f", "#5f0087", "#5f00af", "#5f00d7", "#5f00ff", "#5f5f00", "#5f5f5f", "#5f5f87", "#5f5faf", "#5f5fd7", "#5f5fff", "#5f8700", "#5f875f", "#5f8787", "#5f87af", "#5f87d7", "#5f87ff", "#5faf00", "#5faf5f", "#5faf87", "#5fafaf", "#5fafd7", "#5fafff", "#5fd700", "#5fd75f", "#5fd787", "#5fd7af", "#5fd7d7", "#5fd7ff", "#5fff00", "#5fff5f", "#5fff87", "#5fffaf", "#5fffd7", "#5fffff", "#870000", "#87005f", "#870087", "#8700af", "#8700d7", "#8700ff", "#875f00", "#875f5f", "#875f87", "#875faf", "#875fd7", "#875fff", "#878700", "#87875f", "#878787", "#8787af", "#8787d7", "#8787ff", "#87af00", "#87af5f", "#87af87", "#87afaf", "#87afd7", "#87afff", "#87d700", "#87d75f", "#87d787", "#87d7af", "#87d7d7", "#87d7ff", "#87ff00", "#87ff5f", "#87ff87", "#87ffaf", "#87ffd7", "#87ffff", "#af0000", "#af005f", "#af0087", "#af00af", "#af00d7", "#af00ff", "#af5f00", "#af5f5f", "#af5f87", "#af5faf", "#af5fd7", "#af5fff", "#af8700", "#af875f", "#af8787", "#af87af", "#af87d7", "#af87ff", "#afaf00", "#afaf5f", "#afaf87", "#afafaf", "#afafd7", "#afafff", "#afd700", "#afd75f", "#afd787", "#afd7af", "#afd7d7", "#afd7ff", "#afff00", "#afff5f", "#afff87", "#afffaf", "#afffd7", "#afffff", "#d70000", "#d7005f", "#d70087", "#d700af", "#d700d7", "#d700ff", "#d75f00", "#d75f5f", "#d75f87", "#d75faf", "#d75fd7", "#d75fff", "#d78700", "#d7875f", "#d78787", "#d787af", "#d787d7", "#d787ff", "#d7af00", "#d7af5f", "#d7af87", "#d7afaf", "#d7afd7", "#d7afff", "#d7d700", "#d7d75f", "#d7d787", "#d7d7af", "#d7d7d7", "#d7d7ff", "#d7ff00", "#d7ff5f", "#d7ff87", "#d7ffaf", "#d7ffd7", "#d7ffff", "#ff0000", "#ff005f", "#ff0087", "#ff00af", "#ff00d7", "#ff00ff", "#ff5f00", "#ff5f5f", "#ff5f87", "#ff5faf", "#ff5fd7", "#ff5fff", "#ff8700", "#ff875f", "#ff8787", "#ff87af", "#ff87d7", "#ff87ff", "#ffaf00", "#ffaf5f", "#ffaf87", "#ffafaf", "#ffafd7", "#ffafff", "#ffd700", "#ffd75f", "#ffd787", "#ffd7af", "#ffd7d7", "#ffd7ff", "#ffff00", "#ffff5f", "#ffff87", "#ffffaf", "#ffffd7", "#ffffff", "#080808", "#121212", "#1c1c1c", "#262626", "#303030", "#3a3a3a", "#444444", "#4e4e4e", "#585858", "#626262", "#6c6c6c", "#767676", "#808080", "#8a8a8a", "#949494", "#9e9e9e", "#a8a8a8", "#b2b2b2", "#bcbcbc", "#c6c6c6", "#d0d0d0", "#dadada", "#e4e4e4", "#eeeeee"]},
                ]
            }
        ]
    },
    {
        id: "fonts",
        name: "Fonts",
        groups: [
            {
                id: "general",
                name: "General Font Settings",
                settings: [
                    {id: "fontSize", name: "Base font size", type: "number", value: 13, min: 4, max: 60, step: 0.5, range: true},
                    {id: "fontThicken", name: "Thicken fonts", type: "switch", note: "This currently only affects macOS.", value: false},
                    {id: "fontThickenStrength", name: "Thicken strength", type: "number", value: 255, min: 0, max: 255, step: 1, range: true},
                    {id: "fontShapingBreak", name: "How to break runs (cursor, no-cursor).", type: "text", value: ""},
                    {id: "fontFeature", name: "Font ligature settings", type: "text", value: ""},
                    {id: "fontSyntheticStyle", name: "Synthetic styles", note: "See the docs for more info.", type: "text", value: "bold,italic,bold-italic"},
                    {id: "alphaBlending", name: "Alpha blending colorspace", type: "dropdown", value: "native", options: ["native", "linear", "linear-corrected"]},
                ]
            },
            {
                id: "family",
                name: "Font Families",
                note: "By default Ghostty embeds and uses JetBrainsMono Nerd Font so you don't need to install it on your system or set it in your configuration.",
                settings: [
                    {id: "fontFamily", name: "Main font family", type: "text", value: "", placeholder: "JetBrainsMono NF"},
                    {id: "fontFamilyBold", name: "Font family for bold text", type: "text", value: ""},
                    {id: "fontFamilyItalic", name: "Font family for italic text", type: "text", value: ""},
                    {id: "fontFamilyBoldItalic", name: "Font family for bold italic text", type: "text", value: ""},
                    {id: "fontCodepointMap", name: "Unicode-specifc font mapping", note: "", type: "text", value: ""},
                ]
            },
            {
                id: "styles",
                name: "Font Styles",
                note: "Named font styles for the fields above. For example for `Ioveska Heavy` you would use a style of `Heavy`. Alternately you can set the style to `false` to completely disable the style and revert to default style.",
                settings: [
                    {id: "fontStyle", name: "Main font style", type: "text", value: "default"},
                    {id: "fontStyleBold", name: "Font style for bold text", type: "text", value: "default"},
                    {id: "fontStyleItalic", name: "Font style for italic text", type: "text", value: "default"},
                    {id: "fontStyleBoldItalic", name: "Font style for bold italic text", type: "text", value: "default"},
                ]
            },
            {
                id: "variations",
                name: "Font Variations",
                note: "Variable font specific settings, please only touch this if you know what you're doing!",
                settings: [
                    {id: "fontVariation", name: "Main font variant", type: "text", value: ""},
                    {id: "fontVariationBold", name: "Font variant for bold text", type: "text", value: ""},
                    {id: "fontVariationItalic", name: "Font variant for italic text", type: "text", value: ""},
                    {id: "fontVariationBoldItalic", name: "Font variant for bold italic text", type: "text", value: ""},
                ]
            },
            {
                id: "advanced",
                name: "Advanced Font & Cell Settings",
                note: "The settings below have very little validation in Ghostty and can cause your terminal to become unusable. Be careful messing with any of these.",
                settings: [
                    {id: "adjustCellWidth", name: "Cell width adjustment", type: "text", value: ""},
                    {id: "adjustCellHeight", name: "Cell height adjustment", type: "text", value: ""},
                    {id: "adjustFontBaseline", name: "Font baseline adjustment", type: "text", value: ""},
                    {id: "adjustUnderlinePosition", name: "Underline position adjustment", type: "text", value: ""},
                    {id: "adjustUnderlineThickness", name: "Underline thickness adjustment", type: "text", value: ""},
                    {id: "adjustStrikethroughPosition", name: "Strikethrough position adjustment", type: "text", value: ""},
                    {id: "adjustStrikethroughThickness", name: "Strikethrough thickness adjustment", type: "text", value: ""},
                    {id: "adjustOverlinePosition", name: "Overline position adjustment", type: "text", value: ""},
                    {id: "adjustOverlineThickness", name: "Overline thickness adjustment", type: "text", value: ""},
                    {id: "adjustCursorThickness", name: "Cursor thickness adjustment", type: "text", value: ""},
                    {id: "adjustBoxThickness", name: "Box thickness adjustment", type: "text", value: ""},
                    {id: "adjustCursorHeight", name: "Cursor height adjustment", type: "text", value: ""},
                    {id: "adjustIconHeight", name: "Nerd font icon height adjustment", type: "text", value: ""},
                    {id: "graphemeWidthMethod", name: "Grapheme width calculation method.", type: "dropdown", value: "unicode", options: ["unicode", "legacy"]},
                    {id: "freetypeLoadFlags", name: "FreeType load flags", type: "text", value: "hinting,autohint,light"},
                ]
            },

        ]
    },
    {
        id: "keybinds",
        name: "Keybinds",
        groups: [
            {
                id: "keybinds",
                name: "",
                settings: [
                    {id: "keybind", name: "", type: "keybinds", value: ["super+page_up=scroll_page_up", "super+ctrl+equal=equalize_splits", "super+physical:four=goto_tab:4", "super+shift+arrow_down=jump_to_prompt:1", "super+shift+w=close_window", "super+shift+bracket_left=previous_tab", "super+backspace=text:\\x15", "super+alt+w=close_tab", "super+w=close_surface", "super+alt+i=inspector:toggle", "super+physical:eight=goto_tab:8", "super+alt+arrow_right=goto_split:right", "shift+arrow_up=adjust_selection:up", "super+arrow_down=jump_to_prompt:1", "super+enter=toggle_fullscreen", "super+t=new_tab", "super+c=copy_to_clipboard", "super+shift+bracket_right=next_tab", "super+physical:one=goto_tab:1", "shift+arrow_left=adjust_selection:left", "super+equal=increase_font_size:1", "shift+page_up=adjust_selection:page_up", "super+physical:three=goto_tab:3", "super+arrow_right=text:\\x05", "super+d=new_split:right", "super+ctrl+arrow_down=resize_split:down,10", "shift+end=adjust_selection:end", "super++=increase_font_size:1", "super+q=quit", "super+home=scroll_to_top", "super+ctrl+arrow_left=resize_split:left,10", "alt+arrow_left=esc:b", "super+ctrl+arrow_up=resize_split:up,10", "super+arrow_left=text:\\x01", "super+shift+arrow_up=jump_to_prompt:-1", "shift+arrow_right=adjust_selection:right", "super+comma=open_config", "super+shift+comma=reload_config", "super+minus=decrease_font_size:1", "shift+page_down=adjust_selection:page_down", "ctrl+tab=next_tab", "super+a=select_all", "alt+arrow_right=esc:f", "super+shift+enter=toggle_split_zoom", "super+alt+arrow_down=goto_split:down", "super+ctrl+f=toggle_fullscreen", "super+ctrl+arrow_right=resize_split:right,10", "super+alt+shift+j=write_screen_file:open", "shift+arrow_down=adjust_selection:down", "ctrl+shift+tab=previous_tab", "super+n=new_window", "super+alt+arrow_left=goto_split:left", "super+page_down=scroll_page_down", "super+alt+shift+w=close_all_windows", "super+alt+arrow_up=goto_split:up", "super+shift+v=paste_from_selection", "super+bracket_left=goto_split:previous", "super+physical:nine=last_tab", "super+bracket_right=goto_split:next", "super+end=scroll_to_bottom", "super+shift+j=write_screen_file:paste", "super+shift+d=new_split:down", "super+0=reset_font_size", "super+physical:five=goto_tab:5", "shift+home=adjust_selection:home", "super+physical:seven=goto_tab:7", "super+arrow_up=jump_to_prompt:-1", "super+k=clear_screen", "super+physical:two=goto_tab:2", "super+physical:six=goto_tab:6", "super+v=paste_from_clipboard"]}
                ]
            }
        ]
    },
    {
        id: "mouse",
        name: "Mouse",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    {id: "cursorClickToMove", name: "Enable click to move cursor", type: "switch", value: true},
                    {id: "mouseHideWhileTyping", name: "Hide mouse while typing", type: "switch", value: false},
                    {id: "mouseReporting", name: "Allow mouse reporting", note: "Allows terminal applications to receive mouse events.", type: "switch", value: true},
                    {id: "mouseShiftCapture", name: "Allow shift with mouse click", type: "dropdown", value: "false", options: ["true", "false", "always", "never"]},
                    // Technically the values should be min: 0.01, max: 10000, step: 0.01 but those are insane so instead I'll use sane defaults
                    {id: "mouseScrollMultiplier", name: "Mouse scroll multiplier", type: "number", range: true, value: 3, min: 0.1, max: 10, step: 0.1},
                    {id: "rightClickAction", name: "Right-click action", type: "dropdown", value: "context-menu", options: ["context-menu", "copy-or-paste", "copy", "paste", "ignore"]},
                    {id: "focusFollowsMouse", name: "Focus splits on mouse move", type: "switch", value: false},
                    {id: "clickRepeatInterval", name: "Milliseconds between multi-click", note: "A value of 0 means to use the operating system's default timing.", type: "number", value: 0, min: 0, size: 4},
                ]
            }
        ]
    },
    {
        id: "gtk",
        name: "GTK",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    {id: "class", name: "WM_CLASS class field", note: "This defaults to `com.mitchellh.ghostty`", type: "text", value: ""},
                    {id: "x11InstanceName", name: "WM_CLASS instance name", note: "This defaults to `ghostty`", type: "text", value: ""},
                    {id: "gtkSingleInstance", name: "Single-instance mode", type: "dropdown", value: "detect", options: ["detect", "true", "false"]},
                    {id: "gtkCustomCss", name: "Custom css file", type: "text", value: ""},
                    {id: "gtkOpenglDebug", name: "OpenGL debug", type: "switch", value: false},
                    {id: "appNotifications", name: "App notifications", note: "Comma-separated list of notifications to enable/disable. Available: clipboard-copy, config-reload. Prefix with `no-` to disable. `true`/`false` to enable/disable all.", type: "text", value: ""},
                ]
            },
            {
                id: "tabs",
                name: "Titlebar & Tabs",
                settings: [
                    {id: "gtkToolbarStyle", name: "Toolbar style", type: "dropdown", value: "raised", options: ["raised", "flat", "raised-border"]},
                    {id: "gtkTitlebarStyle", name: "Titlebar style", note: "`tabs` merges the tab bar and titlebar to save vertical space.", type: "dropdown", value: "native", options: ["native", "tabs"]},
                    {id: "gtkTabsLocation", name: "Tab location", type: "dropdown", value: "top", options: ["top", "bottom"]},
                    {id: "gtkWideTabs", name: "Use wide tabs", note: "Setting this to false will make tabs use the least space necessary.", type: "switch", value: true},
                    {id: "gtkTitlebar", name: "Show titlebar", type: "switch", value: true},
                    {id: "gtkTitlebarHideWhenMaximized", name: "Hide titlebar on maximize", type: "switch", value: false},
                    {id: "gtkQuickTerminalLayer", name: "Quick terminal layer", note: "Controls which layer the quick terminal appears on. GTK Wayland only.", type: "dropdown", value: "top", options: ["overlay", "top", "bottom", "background"]},
                    {id: "gtkQuickTerminalNamespace", name: "Quick terminal namespace", note: "Identifier for the quick terminal layer surface. GTK Wayland only.", type: "text", value: "ghostty-quick-terminal"},
                ]
            }
        ]
    },
    {
        id: "linux",
        name: "Linux",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    {id: "asyncBackend", name: "Async backend", note: "If unsure, leave this set to auto.", type: "dropdown", value: "auto", options: ["auto", "epoll", "io_uring"]},
                    {id: "linuxCgroup", name: "Use dedicated cgroups", type: "dropdown", value: "single-instance", options: ["single-instance", "always", "never"]},
                    {id: "linuxCgroupMemoryLimit", name: "Memory limit (bytes)", type: "number", min: 0, max: 4294967295, size: 12},
                    {id: "linuxCgroupProcessesLimit", name: "Max number of processes", type: "number", min: 0, size: 5},
                    {id: "linuxCgroupHardFail", name: "Hard fail on startup", type: "switch", value: false},
                ]
            }
        ]
    },
    {
        id: "macos",
        name: "macOS",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    {id: "macosNonNativeFullscreen", name: "Use non-native fullscreen", note: "Tabs currently do not work with non-native fullscreen windows", type: "dropdown", value: "false", options: ["visible-menu", "true", "false", "padded-notch"]},
                    {id: "macosTitlebarStyle", name: "Titlebar style", type: "dropdown", value: "transparent", options: ["transparent", "native", "tabs", "hidden"]},
                    {id: "macosTitlebarProxyIcon", name: "Titlebar proxy icon", type: "dropdown", value: "visible", options: ["visible", "hidden"]},
                    {id: "macosOptionAsAlt", name: "Use option key as alt key", type: "dropdown", value: "", options: ["", "true", "false", "left", "right"]},
                    {id: "macosWindowShadow", name: "Show the window shadow", type: "switch", value: true},
                    {id: "macosWindowButtons", name: "Window buttons (traffic lights)", type: "dropdown", value: "visible", options: ["visible", "hidden"]},
                    {id: "macosHidden", name: "Hide from dock and switcher", type: "dropdown", value: "never", options: ["never", "always"]},
                    {id: "macosAutoSecureInput", name: "Auto secure input", type: "switch", value: true},
                    {id: "macosSecureInputIndication", name: "Indicate secure input", type: "switch", value: true},
                    {id: "macosDockDropBehavior", name: "Dock drop behavior", note: "What happens when a file is dropped onto Ghostty's dock icon.", type: "dropdown", value: "new-tab", options: ["new-tab", "new-window"]},
                    {id: "macosShortcuts", name: "macOS shortcuts", note: "Controls whether macOS system shortcuts (e.g. Cmd+Space) can be captured.", type: "dropdown", value: "ask", options: ["allow", "deny", "ask"]},

                    // TODO: move these once it is available on non-mac
                    {id: "autoUpdate", name: "Auto update", note: "Leaving this unset will fall back to your Sparkle preferences.", type: "dropdown", value: "", options: ["", "off", "check", "download"]},
                    {id: "autoUpdateChannel", name: "Update channel", note: "By default this will adhere to whichever version you downloaded.", type: "dropdown", value: "", options: ["", "stable", "tip"]},
                ]
            },
            {
                id: "icon",
                name: "App Icon",
                note: "If you choose the \"custom-style\" option, you can use any of the other icon settings to customize your icon with a live preview.",
                settings: [
                    {id: "macosIcon", name: "Icon", note: "Custom style must specify both ghost and screen colors.", type: "dropdown", value: "official", options: ["official", "blueprint", "chalkboard", "microchip", "glass", "holographic", "paper", "retro", "xray", "custom", "custom-style"]},
                    {id: "macosCustomIcon", name: "Icon file", note: "Only used when \"custom\" is selected above.", type: "text", value: ""},
                    {id: "macosIconFrame", name: "Icon frame", type: "dropdown", value: "aluminum", options: ["aluminum", "beige", "plastic", "chrome"]},
                    {id: "macosIconGhostColor", name: "Ghost color", type: "color", value: ""},
                    {id: "macosIconScreenColor", name: "Screen color", type: "color", value: ""},
                ]
            }
        ]
    },
] as Panel[];


export default settings;

// Translation key mappings for panels, groups, and settings
// Keys follow the pattern: settings.{parentId}.{id}
const PANEL_KEYS: Record<string, {nameKey: string}> = {
    application: {nameKey: "nav.application"},
    clipboard: {nameKey: "nav.clipboard"},
    window: {nameKey: "nav.window"},
    colors: {nameKey: "nav.colors"},
    fonts: {nameKey: "nav.fonts"},
    keybinds: {nameKey: "nav.keybinds"},
    mouse: {nameKey: "nav.mouse"},
    gtk: {nameKey: "nav.gtk"},
    linux: {nameKey: "nav.linux"},
    macos: {nameKey: "nav.macos"},
};

const GROUP_KEYS: Record<string, Record<string, {nameKey?: string; noteKey?: string}>> = {
    application: {
        general: {},
        startup: {nameKey: "settings.startup.name"},
        shutdown: {nameKey: "settings.shutdown.name"},
        shell: {nameKey: "settings.shell.name"},
        quick: {nameKey: "settings.quick.name"},
        advanced: {nameKey: "settings.advanced.name", noteKey: "settings.advanced.note"},
        bell: {nameKey: "settings.bell.name"},
    },
    colors: {
        general: {},
        base: {nameKey: "settings.base.name", noteKey: "settings.base.note"},
        cursor: {nameKey: "settings.cursor.name", noteKey: "settings.cursor.note"},
        palette: {nameKey: "settings.palette.name", noteKey: "settings.palette.note"},
    },
    fonts: {
        general: {nameKey: "settings.fontsGeneral.name"},
        family: {nameKey: "settings.family.name", noteKey: "settings.family.note"},
        styles: {nameKey: "settings.styles.name", noteKey: "settings.styles.note"},
        variations: {nameKey: "settings.variations.name", noteKey: "settings.variations.note"},
        advanced: {nameKey: "settings.fontAdvanced.name", noteKey: "settings.fontAdvanced.note"},
    },
    window: {
        main: {},
        appearance: {nameKey: "settings.appearance.name"},
        resize: {nameKey: "settings.resize.name"},
    },
    gtk: {
        main: {},
        tabs: {nameKey: "settings.gtkTabs.name"},
    },
    macos: {
        main: {},
        icon: {nameKey: "settings.icon.name", noteKey: "settings.icon.note"},
    },
};

// Build a flat map of setting translation keys: "panelId.groupId.settingId" -> {nameKey, noteKey}
const SETTING_KEYS: Record<string, {nameKey?: string; noteKey?: string}> = {};
function sk(panel: string, group: string, id: string, nameKey?: string, noteKey?: string) {
    SETTING_KEYS[`${panel}.${group}.${id}`] = {nameKey, noteKey};
}

// Application > General
sk("application", "general", "title", "settings.application.title");
sk("application", "general", "desktopNotifications", "settings.application.desktopNotifications");
sk("application", "general", "configFile", "settings.application.configFile");
sk("application", "general", "configDefaultFiles", "settings.application.configDefaultFiles");
sk("application", "general", "link", "settings.application.link", "settings.application.link.note");
sk("application", "general", "linkUrl", "settings.application.linkUrl", "settings.application.linkUrl.note");
sk("application", "general", "linkPreviews", "settings.application.linkPreviews", "settings.application.linkPreviews.note");
sk("application", "general", "undoTimeout", "settings.application.undoTimeout", "settings.application.undoTimeout.note");
// Application > Startup
sk("application", "startup", "command", "settings.startup.command");
sk("application", "startup", "initialCommand", "settings.startup.initialCommand", "settings.startup.initialCommand.note");
sk("application", "startup", "env", "settings.startup.env");
sk("application", "startup", "input", "settings.startup.input", "settings.startup.input.note");
sk("application", "startup", "maximize", "settings.startup.maximize");
sk("application", "startup", "fullscreen", "settings.startup.fullscreen");
sk("application", "startup", "initialWindow", "settings.startup.initialWindow");
sk("application", "startup", "workingDirectory", "settings.startup.workingDirectory", "settings.startup.workingDirectory.note");
// Application > Shutdown
sk("application", "shutdown", "waitAfterCommand", "settings.shutdown.waitAfterCommand");
sk("application", "shutdown", "abnormalCommandExitRuntime", "settings.shutdown.abnormalCommandExitRuntime");
sk("application", "shutdown", "confirmCloseSurface", "settings.shutdown.confirmCloseSurface");
sk("application", "shutdown", "quitAfterLastWindowClosed", "settings.shutdown.quitAfterLastWindowClosed");
sk("application", "shutdown", "quitAfterLastWindowClosedDelay", "settings.shutdown.quitAfterLastWindowClosedDelay");
// Application > Shell
sk("application", "shell", "shellIntegration", "settings.shell.shellIntegration");
sk("application", "shell", "shellIntegrationFeatures", "settings.shell.shellIntegrationFeatures", "settings.shell.shellIntegrationFeatures.note");
sk("application", "shell", "term", "settings.shell.term");
sk("application", "shell", "titleReport", "settings.shell.titleReport", "settings.shell.titleReport.note");
// Application > Quick Terminal
sk("application", "quick", "quickTerminalPosition", "settings.quick.quickTerminalPosition");
sk("application", "quick", "quickTerminalScreen", "settings.quick.quickTerminalScreen");
sk("application", "quick", "quickTerminalSize", "settings.quick.quickTerminalSize", "settings.quick.quickTerminalSize.note");
sk("application", "quick", "quickTerminalAnimationDuration", "settings.quick.quickTerminalAnimationDuration");
sk("application", "quick", "quickTerminalAutohide", "settings.quick.quickTerminalAutohide", "settings.quick.quickTerminalAutohide.note");
sk("application", "quick", "quickTerminalSpaceBehavior", "settings.quick.quickTerminalSpaceBehavior");
sk("application", "quick", "quickTerminalKeyboardInteractivity", "settings.quick.quickTerminalKeyboardInteractivity", "settings.quick.quickTerminalKeyboardInteractivity.note");
// Application > Advanced
sk("application", "advanced", "scrollbackLimit", "settings.advanced.scrollbackLimit", "settings.advanced.scrollbackLimit.note");
sk("application", "advanced", "customShader", "settings.advanced.customShader", "settings.advanced.customShader.note");
sk("application", "advanced", "customShaderAnimation", "settings.advanced.customShaderAnimation");
sk("application", "advanced", "scrollToBottom", "settings.advanced.scrollToBottom", "settings.advanced.scrollToBottom.note");
sk("application", "advanced", "enquiryResponse", "settings.advanced.enquiryResponse");
sk("application", "advanced", "oscColorReportFormat", "settings.advanced.oscColorReportFormat");
sk("application", "advanced", "vtKamAllowed", "settings.advanced.vtKamAllowed", "settings.advanced.vtKamAllowed.note");
sk("application", "advanced", "imageStorageLimit", "settings.advanced.imageStorageLimit");
// Application > Bell
sk("application", "bell", "bellFeatures", "settings.bell.bellFeatures", "settings.bell.bellFeatures.note");
sk("application", "bell", "bellAudioPath", "settings.bell.bellAudioPath", "settings.bell.bellAudioPath.note");
sk("application", "bell", "bellAudioVolume", "settings.bell.bellAudioVolume", "settings.bell.bellAudioVolume.note");
// Clipboard
sk("clipboard", "main", "clipboardRead", "settings.clipboard.clipboardRead");
sk("clipboard", "main", "clipboardWrite", "settings.clipboard.clipboardWrite");
sk("clipboard", "main", "copyOnSelect", "settings.clipboard.copyOnSelect");
sk("clipboard", "main", "clipboardTrimTrailingSpaces", "settings.clipboard.clipboardTrimTrailingSpaces");
sk("clipboard", "main", "clipboardPasteProtection", "settings.clipboard.clipboardPasteProtection");
sk("clipboard", "main", "clipboardPasteBracketedSafe", "settings.clipboard.clipboardPasteBracketedSafe");
// Window
sk("window", "main", "windowTitleFontFamily", "settings.window.windowTitleFontFamily");
sk("window", "main", "windowSubtitle", "settings.window.windowSubtitle");
sk("window", "main", "windowVsync", "settings.window.windowVsync");
sk("window", "main", "windowInheritWorkingDirectory", "settings.window.windowInheritWorkingDirectory");
sk("window", "main", "tabInheritWorkingDirectory", "settings.window.tabInheritWorkingDirectory");
sk("window", "main", "splitInheritWorkingDirectory", "settings.window.splitInheritWorkingDirectory");
sk("window", "main", "windowInheritFontSize", "settings.window.windowInheritFontSize");
sk("window", "main", "windowColorspace", "settings.window.windowColorspace");
sk("window", "main", "windowSaveState", "settings.window.windowSaveState");
sk("window", "main", "windowShowTabBar", "settings.window.windowShowTabBar");
sk("window", "main", "windowNewTabPosition", "settings.window.windowNewTabPosition");
// Window > Appearance
sk("window", "appearance", "windowTheme", "settings.appearance.windowTheme");
sk("window", "appearance", "windowDecoration", "settings.appearance.windowDecoration");
sk("window", "appearance", "windowPaddingX", "settings.appearance.windowPaddingX");
sk("window", "appearance", "windowPaddingY", "settings.appearance.windowPaddingY");
sk("window", "appearance", "windowPaddingBalance", "settings.appearance.windowPaddingBalance");
sk("window", "appearance", "windowPaddingColor", "settings.appearance.windowPaddingColor");
sk("window", "appearance", "windowTitlebarBackground", "settings.appearance.windowTitlebarBackground");
sk("window", "appearance", "windowTitlebarForeground", "settings.appearance.windowTitlebarForeground");
sk("window", "appearance", "backgroundOpacity", "settings.appearance.backgroundOpacity");
sk("window", "appearance", "backgroundOpacityCells", "settings.appearance.backgroundOpacityCells");
sk("window", "appearance", "backgroundBlur", "settings.appearance.backgroundBlur", "settings.appearance.backgroundBlur.note");
sk("window", "appearance", "backgroundImage", "settings.appearance.backgroundImage", "settings.appearance.backgroundImage.note");
sk("window", "appearance", "backgroundImageOpacity", "settings.appearance.backgroundImageOpacity");
sk("window", "appearance", "backgroundImagePosition", "settings.appearance.backgroundImagePosition");
sk("window", "appearance", "backgroundImageFit", "settings.appearance.backgroundImageFit");
sk("window", "appearance", "backgroundImageRepeat", "settings.appearance.backgroundImageRepeat");
sk("window", "appearance", "scrollbar", "settings.appearance.scrollbar", "settings.appearance.scrollbar.note");
sk("window", "appearance", "unfocusedSplitOpacity", "settings.appearance.unfocusedSplitOpacity");
sk("window", "appearance", "unfocusedSplitFill", "settings.appearance.unfocusedSplitFill");
sk("window", "appearance", "splitDividerColor", "settings.appearance.splitDividerColor");
sk("window", "appearance", "splitPreserveZoom", "settings.appearance.splitPreserveZoom", "settings.appearance.splitPreserveZoom.note");
// Window > Resize
sk("window", "resize", "windowHeight", "settings.resize.windowHeight", "settings.resize.windowHeight.note");
sk("window", "resize", "windowWidth", "settings.resize.windowWidth", "settings.resize.windowWidth.note");
sk("window", "resize", "windowPositionY", "settings.resize.windowPositionY", "settings.resize.windowPositionY.note");
sk("window", "resize", "windowPositionX", "settings.resize.windowPositionX", "settings.resize.windowPositionX.note");
sk("window", "resize", "windowStepResize", "settings.resize.windowStepResize");
sk("window", "resize", "resizeOverlay", "settings.resize.resizeOverlay");
sk("window", "resize", "resizeOverlayPosition", "settings.resize.resizeOverlayPosition");
sk("window", "resize", "resizeOverlayDuration", "settings.resize.resizeOverlayDuration");
// Colors > General
sk("colors", "general", "theme", "settings.colors.theme", "settings.colors.theme.note");
sk("colors", "general", "boldColor", "settings.colors.boldColor", "settings.colors.boldColor.note");
sk("colors", "general", "faintOpacity", "settings.colors.faintOpacity");
sk("colors", "general", "minimumContrast", "settings.colors.minimumContrast");
sk("colors", "general", "paletteGenerate", "settings.colors.paletteGenerate", "settings.colors.paletteGenerate.note");
sk("colors", "general", "paletteHarmonious", "settings.colors.paletteHarmonious", "settings.colors.paletteHarmonious.note");
// Colors > Base
sk("colors", "base", "background", "settings.base.background");
sk("colors", "base", "foreground", "settings.base.foreground");
sk("colors", "base", "selectionBackground", "settings.base.selectionBackground");
sk("colors", "base", "selectionForeground", "settings.base.selectionForeground");
sk("colors", "base", "selectionClearOnTyping", "settings.base.selectionClearOnTyping");
sk("colors", "base", "selectionClearOnCopy", "settings.base.selectionClearOnCopy");
sk("colors", "base", "selectionWordChars", "settings.base.selectionWordChars", "settings.base.selectionWordChars.note");
// Colors > Cursor
sk("colors", "cursor", "cursorColor", "settings.cursor.cursorColor");
sk("colors", "cursor", "cursorText", "settings.cursor.cursorText");
sk("colors", "cursor", "cursorOpacity", "settings.cursor.cursorOpacity");
sk("colors", "cursor", "cursorStyle", "settings.cursor.cursorStyle");
sk("colors", "cursor", "cursorStyleBlink", "settings.cursor.cursorStyleBlink", "settings.cursor.cursorStyleBlink.note");
// Fonts > General
sk("fonts", "general", "fontSize", "settings.fonts.fontSize");
sk("fonts", "general", "fontThicken", "settings.fonts.fontThicken", "settings.fonts.fontThicken.note");
sk("fonts", "general", "fontThickenStrength", "settings.fonts.fontThickenStrength");
sk("fonts", "general", "fontShapingBreak", "settings.fonts.fontShapingBreak");
sk("fonts", "general", "fontFeature", "settings.fonts.fontFeature");
sk("fonts", "general", "fontSyntheticStyle", "settings.fonts.fontSyntheticStyle", "settings.fonts.fontSyntheticStyle.note");
sk("fonts", "general", "alphaBlending", "settings.fonts.alphaBlending");
// Fonts > Family
sk("fonts", "family", "fontFamily", "settings.family.fontFamily");
sk("fonts", "family", "fontFamilyBold", "settings.family.fontFamilyBold");
sk("fonts", "family", "fontFamilyItalic", "settings.family.fontFamilyItalic");
sk("fonts", "family", "fontFamilyBoldItalic", "settings.family.fontFamilyBoldItalic");
sk("fonts", "family", "fontCodepointMap", "settings.family.fontCodepointMap");
// Fonts > Styles
sk("fonts", "styles", "fontStyle", "settings.styles.fontStyle");
sk("fonts", "styles", "fontStyleBold", "settings.styles.fontStyleBold");
sk("fonts", "styles", "fontStyleItalic", "settings.styles.fontStyleItalic");
sk("fonts", "styles", "fontStyleBoldItalic", "settings.styles.fontStyleBoldItalic");
// Fonts > Variations
sk("fonts", "variations", "fontVariation", "settings.variations.fontVariation");
sk("fonts", "variations", "fontVariationBold", "settings.variations.fontVariationBold");
sk("fonts", "variations", "fontVariationItalic", "settings.variations.fontVariationItalic");
sk("fonts", "variations", "fontVariationBoldItalic", "settings.variations.fontVariationBoldItalic");
// Fonts > Advanced
sk("fonts", "advanced", "adjustCellWidth", "settings.fontAdvanced.adjustCellWidth");
sk("fonts", "advanced", "adjustCellHeight", "settings.fontAdvanced.adjustCellHeight");
sk("fonts", "advanced", "adjustFontBaseline", "settings.fontAdvanced.adjustFontBaseline");
sk("fonts", "advanced", "adjustUnderlinePosition", "settings.fontAdvanced.adjustUnderlinePosition");
sk("fonts", "advanced", "adjustUnderlineThickness", "settings.fontAdvanced.adjustUnderlineThickness");
sk("fonts", "advanced", "adjustStrikethroughPosition", "settings.fontAdvanced.adjustStrikethroughPosition");
sk("fonts", "advanced", "adjustStrikethroughThickness", "settings.fontAdvanced.adjustStrikethroughThickness");
sk("fonts", "advanced", "adjustOverlinePosition", "settings.fontAdvanced.adjustOverlinePosition");
sk("fonts", "advanced", "adjustOverlineThickness", "settings.fontAdvanced.adjustOverlineThickness");
sk("fonts", "advanced", "adjustCursorThickness", "settings.fontAdvanced.adjustCursorThickness");
sk("fonts", "advanced", "adjustBoxThickness", "settings.fontAdvanced.adjustBoxThickness");
sk("fonts", "advanced", "adjustCursorHeight", "settings.fontAdvanced.adjustCursorHeight");
sk("fonts", "advanced", "adjustIconHeight", "settings.fontAdvanced.adjustIconHeight");
sk("fonts", "advanced", "graphemeWidthMethod", "settings.fontAdvanced.graphemeWidthMethod");
sk("fonts", "advanced", "freetypeLoadFlags", "settings.fontAdvanced.freetypeLoadFlags");
// Mouse
sk("mouse", "main", "cursorClickToMove", "settings.mouse.cursorClickToMove");
sk("mouse", "main", "mouseHideWhileTyping", "settings.mouse.mouseHideWhileTyping");
sk("mouse", "main", "mouseReporting", "settings.mouse.mouseReporting", "settings.mouse.mouseReporting.note");
sk("mouse", "main", "mouseShiftCapture", "settings.mouse.mouseShiftCapture");
sk("mouse", "main", "mouseScrollMultiplier", "settings.mouse.mouseScrollMultiplier");
sk("mouse", "main", "rightClickAction", "settings.mouse.rightClickAction");
sk("mouse", "main", "focusFollowsMouse", "settings.mouse.focusFollowsMouse");
sk("mouse", "main", "clickRepeatInterval", "settings.mouse.clickRepeatInterval", "settings.mouse.clickRepeatInterval.note");
// GTK
sk("gtk", "main", "class", "settings.gtk.class", "settings.gtk.class.note");
sk("gtk", "main", "x11InstanceName", "settings.gtk.x11InstanceName", "settings.gtk.x11InstanceName.note");
sk("gtk", "main", "gtkSingleInstance", "settings.gtk.gtkSingleInstance");
sk("gtk", "main", "gtkCustomCss", "settings.gtk.gtkCustomCss");
sk("gtk", "main", "gtkOpenglDebug", "settings.gtk.gtkOpenglDebug");
sk("gtk", "main", "appNotifications", "settings.gtk.appNotifications", "settings.gtk.appNotifications.note");
// GTK > Tabs
sk("gtk", "tabs", "gtkToolbarStyle", "settings.gtkTabs.gtkToolbarStyle");
sk("gtk", "tabs", "gtkTitlebarStyle", "settings.gtkTabs.gtkTitlebarStyle", "settings.gtkTabs.gtkTitlebarStyle.note");
sk("gtk", "tabs", "gtkTabsLocation", "settings.gtkTabs.gtkTabsLocation");
sk("gtk", "tabs", "gtkWideTabs", "settings.gtkTabs.gtkWideTabs", "settings.gtkTabs.gtkWideTabs.note");
sk("gtk", "tabs", "gtkTitlebar", "settings.gtkTabs.gtkTitlebar");
sk("gtk", "tabs", "gtkTitlebarHideWhenMaximized", "settings.gtkTabs.gtkTitlebarHideWhenMaximized");
sk("gtk", "tabs", "gtkQuickTerminalLayer", "settings.gtkTabs.gtkQuickTerminalLayer", "settings.gtkTabs.gtkQuickTerminalLayer.note");
sk("gtk", "tabs", "gtkQuickTerminalNamespace", "settings.gtkTabs.gtkQuickTerminalNamespace", "settings.gtkTabs.gtkQuickTerminalNamespace.note");
// Linux
sk("linux", "main", "asyncBackend", "settings.linux.asyncBackend", "settings.linux.asyncBackend.note");
sk("linux", "main", "linuxCgroup", "settings.linux.linuxCgroup");
sk("linux", "main", "linuxCgroupMemoryLimit", "settings.linux.linuxCgroupMemoryLimit");
sk("linux", "main", "linuxCgroupProcessesLimit", "settings.linux.linuxCgroupProcessesLimit");
sk("linux", "main", "linuxCgroupHardFail", "settings.linux.linuxCgroupHardFail");
// macOS
sk("macos", "main", "macosNonNativeFullscreen", "settings.macos.macosNonNativeFullscreen", "settings.macos.macosNonNativeFullscreen.note");
sk("macos", "main", "macosTitlebarStyle", "settings.macos.macosTitlebarStyle");
sk("macos", "main", "macosTitlebarProxyIcon", "settings.macos.macosTitlebarProxyIcon");
sk("macos", "main", "macosOptionAsAlt", "settings.macos.macosOptionAsAlt");
sk("macos", "main", "macosWindowShadow", "settings.macos.macosWindowShadow");
sk("macos", "main", "macosWindowButtons", "settings.macos.macosWindowButtons");
sk("macos", "main", "macosHidden", "settings.macos.macosHidden");
sk("macos", "main", "macosAutoSecureInput", "settings.macos.macosAutoSecureInput");
sk("macos", "main", "macosSecureInputIndication", "settings.macos.macosSecureInputIndication");
sk("macos", "main", "macosDockDropBehavior", "settings.macos.macosDockDropBehavior", "settings.macos.macosDockDropBehavior.note");
sk("macos", "main", "macosShortcuts", "settings.macos.macosShortcuts", "settings.macos.macosShortcuts.note");
sk("macos", "main", "autoUpdate", "settings.macos.autoUpdate", "settings.macos.autoUpdate.note");
sk("macos", "main", "autoUpdateChannel", "settings.macos.autoUpdateChannel", "settings.macos.autoUpdateChannel.note");
// macOS > Icon
sk("macos", "icon", "macosIcon", "settings.icon.macosIcon", "settings.icon.macosIcon.note");
sk("macos", "icon", "macosCustomIcon", "settings.icon.macosCustomIcon", "settings.icon.macosCustomIcon.note");
sk("macos", "icon", "macosIconFrame", "settings.icon.macosIconFrame");
sk("macos", "icon", "macosIconGhostColor", "settings.icon.macosIconGhostColor");
sk("macos", "icon", "macosIconScreenColor", "settings.icon.macosIconScreenColor");

export function getPanelNameKey(panelId: string): string | undefined {
    return PANEL_KEYS[panelId]?.nameKey;
}

export function getGroupNameKeys(panelId: string, groupId: string): {nameKey?: string; noteKey?: string} | undefined {
    return GROUP_KEYS[panelId]?.[groupId];
}

export function getSettingNameKeys(panelId: string, groupId: string, settingId: string): {nameKey?: string; noteKey?: string} | undefined {
    return SETTING_KEYS[`${panelId}.${groupId}.${settingId}`];
}
