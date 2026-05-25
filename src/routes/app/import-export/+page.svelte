<script lang="ts">
    import Group from "$lib/components/settings/Group.svelte";
    import Item from "$lib/components/settings/Item.svelte";
    import Separator from "$lib/components/settings/Separator.svelte";
    import {diff, load, keyToConfig} from "$lib/stores/config.svelte";
    import {alert as showAlert} from "$lib/stores/modals.svelte";
    import parse from "$lib/utils/parse";
    import {
        buildShareUrl,
        decodeConfig,
        encodeConfig,
        getSharePayloadFromHash,
        MAX_SHARE_URL_LENGTH,
        removeSharePayloadFromHash
    } from "$lib/utils/share";
    import Page from "$lib/views/Page.svelte";
    import Button from "$lib/components/Button.svelte";
    import ShareComposerModal from "$lib/components/modals/ShareComposerModal.svelte";
    import SharedConfigModal from "$lib/components/modals/SharedConfigModal.svelte";
    import {onMount} from "svelte";
    import {error, success} from "$lib/stores/toasts.svelte";
    import {t} from "$lib/i18n";

    const LABEL_RESET_TIMEOUT_MS = 3000;

    let pasteConfigText = $state(t("page.importExport.clipboard"));
    let copyConfigText = $state(t("page.importExport.clipboard"));

    let sharedConfigPreview = $state<string | null>(null);
    let sharedConfigParsed = $state<Record<string, string | string[]> | null>(null);
    let sharedConfigParseError = $state(false);
    let showSharedConfigModal = $state(false);

    let showShareComposer = $state(false);
    let shareUrl = $state<string | null>(null);
    let isShareTooLong = $state(false);

    const currentConfigDiff = $derived(diff());
    const hasExportableConfig = $derived(Object.keys(currentConfigDiff).length > 0);

    onMount(() => {
        maybeShowSharedConfigFromHash();
        const handler = () => maybeShowSharedConfigFromHash();
        window.addEventListener("hashchange", handler);
        return () => window.removeEventListener("hashchange", handler);
    });

    function maybeShowSharedConfigFromHash() {
        const shareParam = getSharePayloadFromHash(window.location.hash);
        if (!shareParam) return;

        try {
            const decodedConfig = decodeConfig(shareParam);
            sharedConfigPreview = decodedConfig;

            // Try to parse for pretty display
            try {
                sharedConfigParsed = parse(decodedConfig) as Record<string, string | string[]>;
                sharedConfigParseError = false;
            }
            catch {
                // Parsing failed, will fall back to raw text display
                sharedConfigParsed = null;
                sharedConfigParseError = true;
            }

            showSharedConfigModal = true;
        }
        catch {
            error(t("toast.failedToReadSharedConfig"));
            clearShareHashFromAddressBar();
        }
    }

    function clearShareHashFromAddressBar() {
        const cleanedHash = removeSharePayloadFromHash(window.location.hash);
        const nextUrl = `${window.location.pathname}${window.location.search}${cleanedHash}`;
        window.history.replaceState(null, "", nextUrl);
    }

    async function loadConfig(candidate: string): Promise<boolean> {
        let parsed;
        try {
            // TODO: remove this assertions when the return type of parse is fixed
            parsed = parse(candidate) as Parameters<typeof load>[0];
        }
        catch (parseError) {
            // eslint-disable-next-line no-console
            console.error(parseError);
            await showAlert({
                title: t("modal.parseError.title"),
                message: t("modal.parseError.message"),
                buttonText: t("modal.dismiss")
            });
            return false;
        }

        try {
            load(parsed);
        }
        catch (loadError) {
            // eslint-disable-next-line no-console
            console.error(loadError);
            await showAlert({
                title: t("modal.loadError.title"),
                message: t("modal.loadError.message"),
                buttonText: t("modal.dismiss")
            });
            return false;
        }

        return true;
    }

    async function pasteConfig() {
        if (pasteConfigText === t("page.importExport.pasted")) return;

        try {
            const text = await window.navigator.clipboard.readText();
            pasteConfigText = t("page.importExport.pasted");
            setTimeout(() => (pasteConfigText = t("page.importExport.clipboard")), LABEL_RESET_TIMEOUT_MS);
            const loaded = await loadConfig(text);
            if (loaded) success(t("toast.configLoadedFromClipboard"));
        }
        catch {
            error(t("error.clipboardRead"));
        }
    }

    let filePicker: HTMLInputElement;
    function openFilePicker() {
        filePicker.click();
    }

    function selectFile() {
        const file = filePicker.files![0];
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            const loadedText = event.target?.result?.toString();
            if (!loadedText) return;
            void loadConfig(loadedText).then((didLoad) => {
                if (didLoad) success(t("toast.configLoadedFromFile"));
            });
        });
        reader.readAsText(file);
    }

    // Move to module
    function stringifyConfig(includeHeader = true) {
        const config = currentConfigDiff;
        const lines = includeHeader ? [t("config.generatedBy") + "\n"] : [];
        for (const key in config) {
            if (!Array.isArray(config[key])) {
                lines.push(`${key} = ${config[key]}`);
            }
            else {
                for (let i = 0; i < config[key].length; i++) {
                    lines.push(`${key} = ${config[key][i]}`);
                }
            }
        }

        return lines.join("\n");
    }

    async function copyConfig() {
        if (!hasExportableConfig) {
            return;
        }
        if (copyConfigText === t("page.importExport.copied")) return;

        try {
            await window.navigator.clipboard.writeText(stringifyConfig());
            copyConfigText = t("page.importExport.copied");
            success(t("toast.configCopiedToClipboard"));
            setTimeout(() => (copyConfigText = t("page.importExport.clipboard")), LABEL_RESET_TIMEOUT_MS);
        }
        catch {
            error(t("error.clipboardWrite"));
        }
    }

    function openShareComposer() {
        if (!hasExportableConfig) {
            return;
        }

        const config = stringifyConfig(false);
        const encoded = encodeConfig(config);
        const nextShareUrl = buildShareUrl(window.location.origin, window.location.pathname, encoded);

        isShareTooLong = nextShareUrl.length > MAX_SHARE_URL_LENGTH;
        shareUrl = isShareTooLong ? null : nextShareUrl;
        showShareComposer = true;
    }

    function closeShareComposer() {
        showShareComposer = false;
        shareUrl = null;
        isShareTooLong = false;
    }

    async function copyConfigForFallback() {
        try {
            await window.navigator.clipboard.writeText(stringifyConfig(false));
            return true;
        }
        catch {
            return false;
        }
    }

    async function importSharedConfig() {
        if (sharedConfigPreview) {
            const loaded = await loadConfig(sharedConfigPreview);
            if (loaded) success(t("toast.sharedConfigImported"));
        }
        closeSharedConfigModal();
    }

    function closeSharedConfigModal() {
        showSharedConfigModal = false;
        sharedConfigPreview = null;
        sharedConfigParsed = null;
        sharedConfigParseError = false;
        clearShareHashFromAddressBar();
    }

    function downloadConfig() {
        if (!hasExportableConfig) {
            return;
        }

        const file = new File([stringifyConfig()], "config", {type: "text/plain"});
        const link = document.createElement("a");
        const url = URL.createObjectURL(file);
        link.href = url;
        link.download = file.name;
        link.style.display = "none";
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        success(t("toast.configFileDownloaded"));
    }

    function handleWindowKeydown(e: KeyboardEvent) {
        if (e.key !== "Escape") return;
        if (showShareComposer) closeShareComposer();
        else if (showSharedConfigModal) closeSharedConfigModal();
    }
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<Page title={t("page.importExport.title")}>
    <Group flex={1}>
        <div class="preview">
            {#if hasExportableConfig}
                <div class="row p2">{t("config.generatedBy")}</div>
            {:else}
                <div class="row p2">{t("config.noChanges")}</div>
            {/if}
            <div class="row">&nbsp;</div>

            {#if hasExportableConfig}
                {#each Object.entries(currentConfigDiff) as [key, value], i (i)}
                    {#if Array.isArray(value)}
                        {#each value as val, v (v)}
                        <div class="row"><span class="p4">{key}</span> = <span class="p5">{val}</span></div>
                        {/each}
                    {:else}
                        <div class="row"><span class="p4">{key}</span> = <span class="p5">{value}</span></div>
                    {/if}
                {/each}
            {/if}
        </div>
        <Separator />
        <Item name={t("page.importExport.import")}>
            <div class="button-group">
                <Button onclick={pasteConfig} title={t("page.importExport.paste")}>{pasteConfigText}</Button>
                <input id="config-input" type="file" onchange={selectFile} bind:this={filePicker} />
                <Button onclick={openFilePicker} title="Upload">{t("page.importExport.file")}</Button>
            </div>
        </Item>
        <Separator />
        <Item name={t("page.importExport.export")}>
            <div class="button-group">
                <Button
                    onclick={copyConfig}
                    title={hasExportableConfig ? t("page.importExport.copy") : t("page.importExport.noChangesYet")}
                    disabled={!hasExportableConfig}
                >{copyConfigText}</Button>
                <Button
                    onclick={downloadConfig}
                    title={hasExportableConfig ? t("page.importExport.download") : t("page.importExport.noChangesYet")}
                    disabled={!hasExportableConfig}
                >{t("page.importExport.file")}</Button>
                <Button
                    primary
                    onclick={openShareComposer}
                    title={hasExportableConfig ? t("page.importExport.shareYourConfig") : t("page.importExport.noChangesYet")}
                    disabled={!hasExportableConfig}
                >{t("page.importExport.share")}</Button>
            </div>
        </Item>
    </Group>
</Page>

{#if showShareComposer}
<ShareComposerModal
    isTooLong={isShareTooLong}
    {shareUrl}
    onclose={closeShareComposer}
    ondownload={downloadConfig}
    oncopyconfigtext={copyConfigForFallback}
/>
{/if}

{#if showSharedConfigModal}
<SharedConfigModal
    parsedConfig={sharedConfigParsed}
    previewText={sharedConfigPreview}
    parseError={sharedConfigParseError}
    keyFormatter={keyToConfig}
    onclose={closeSharedConfigModal}
    onimport={importSharedConfig}
/>
{/if}

<style>
.preview {
    background: var(--config-bg);
    font-family: var(--config-font-family);
    font-size: var(--config-font-size);
    color: var(--config-fg);
    min-height: 200px;
    overflow-y: auto;
    padding: 8px;
    border-radius: var(--radius-level-3);
    border: 1px solid rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 1px rgba(255, 255, 255, 0.5) inset;
    flex: 1;
    user-select: text;
}

.preview .row {
    display: block;
    white-space: pre;
}

/* .bold {font-weight: 700;} */

/* .fg {color: var(--config-fg);} */

/* .p0 {color: var(--config-palette-0);} */
/* .p1 {color: var(--config-palette-1);} */
.p2 {color: var(--config-palette-2);}
/* .p3 {color: var(--config-palette-3);} */
.p4 {color: var(--config-palette-4);}
.p5 {color: var(--config-palette-5);}
/* .p6 {color: var(--config-palette-6);}
.p7 {color: var(--config-palette-7);}
.p8 {color: var(--config-palette-8);}
.p9 {color: var(--config-palette-9);}
.p10 {color: var(--config-palette-10);}
.p11 {color: var(--config-palette-11);}
.p12 {color: var(--config-palette-12);} */
/* .p13 {color: var(--config-palette-13);}
.p14 {color: var(--config-palette-14);}
.p15 {color: var(--config-palette-15);} */


#config-input {
    display: none;
}

.button-group {
    display: flex;
    gap: 12px;
}

</style>
