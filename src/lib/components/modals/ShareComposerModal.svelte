<script lang="ts">
    import {onMount} from "svelte";
    import ShareIcon from "$lib/components/icons/ShareIcon.svelte";
    import DialogModal from "$lib/components/modals/DialogModal.svelte";
    import Button from "$lib/components/Button.svelte";
    import {error, success} from "$lib/stores/toasts.svelte";
    import {t} from "$lib/i18n";

    const LABEL_RESET_TIMEOUT_MS = 3000;

    interface Props {
        isTooLong: boolean;
        shareUrl: string | null;
        onclose?: () => void;
        ondownload?: () => void;
        oncopyconfigtext?: () => Promise<boolean> | boolean;
    }

    const {
        isTooLong,
        shareUrl,
        onclose,
        ondownload,
        oncopyconfigtext
    }: Props = $props();

    let copyLinkText = $state(t("modal.share.copyLink"));
    let notice = $state<string | null>(null);
    let canUseNativeShare = $state(false);
    const displayNotice = $derived(
        notice ?? (isTooLong ? null : t("modal.share.trustNotice"))
    );

    onMount(() => {
        canUseNativeShare = !!navigator.share;
    });

    async function copyShareLink() {
        if (!shareUrl || copyLinkText === t("modal.share.copied")) return;

        try {
            await window.navigator.clipboard.writeText(shareUrl);
            copyLinkText = t("modal.share.copied");
            notice = t("modal.share.copiedNotice");
            success(t("toast.shareLinkCopied"));
            setTimeout(() => (copyLinkText = t("modal.share.copyLink")), LABEL_RESET_TIMEOUT_MS);
        }
        catch {
            copyLinkText = t("modal.share.copyFailed");
            notice = t("modal.share.copyFailedNotice");
            error(t("toast.failedToCopyShareLink"));
            setTimeout(() => (copyLinkText = t("modal.share.copyLink")), LABEL_RESET_TIMEOUT_MS);
        }
    }

    async function nativeShareLink() {
        if (!shareUrl || !navigator.share) return;

        try {
            await navigator.share({
                title: t("modal.share.shareTitle"),
                text: t("modal.share.shareText"),
                url: shareUrl
            });
        }
        catch {
            // User cancellation should not show an error.
        }
    }

    async function copyConfigForFallback() {
        if (!oncopyconfigtext) return;

        const ok = await oncopyconfigtext();
        notice = ok
            ? t("modal.share.configCopied")
            : t("modal.share.clipboardFailed");
    }
</script>

<DialogModal title={t("modal.share.title")} {onclose}>
    {#snippet icon()}
        <ShareIcon />
    {/snippet}

    {#if isTooLong}
        <p class="share-modal-desc">{t("modal.share.tooLong")}</p>
        {#if displayNotice}
            <p class="status-text" role="status">{displayNotice}</p>
        {/if}
    {:else}
        <p class="share-modal-desc">{t("modal.share.reviewLink")}</p>
        <input
            type="text"
            class="share-link-input"
            value={shareUrl ?? ""}
            readonly
            onclick={(event) => event.currentTarget.select()}
        />
        {#if displayNotice}
            <p class="status-text" role="status">{displayNotice}</p>
        {/if}
    {/if}

    {#snippet footer()}
        {#if isTooLong}
            <Button primary onclick={copyConfigForFallback}>{t("modal.share.copyConfigText")}</Button>
            <Button onclick={ondownload}>{t("modal.share.downloadFile")}</Button>
            <Button onclick={onclose}>{t("modal.close")}</Button>
        {:else}
            <Button onclick={onclose}>{t("modal.close")}</Button>
            {#if canUseNativeShare}
                <Button onclick={nativeShareLink}>{t("modal.share.shareLink")}</Button>
            {/if}
            <Button primary onclick={copyShareLink}>{copyLinkText}</Button>
        {/if}
    {/snippet}
</DialogModal>

<style>
.share-modal-desc {
    color: var(--font-color-muted);
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.5;
}

.status-text {
    color: var(--font-color-muted);
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 8px 0 0;
}

.share-link-input {
    width: 100%;
    resize: vertical;
    font-family: var(--config-font-family);
    border: 1px solid var(--border-level-3);
    border-radius: var(--radius-level-4);
    background: var(--bg-input);
    color: var(--font-color);
    padding: 8px;
}

.share-link-input:focus-visible {
    outline: 1px solid var(--color-input-accent);
}
</style>
