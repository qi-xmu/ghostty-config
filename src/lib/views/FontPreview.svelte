<script lang="ts">
    import Group from "$lib/components/settings/Group.svelte";
    import Item from "$lib/components/settings/Item.svelte";
    import Separator from "$lib/components/settings/Separator.svelte";
    import Switch from "$lib/components/settings/Switch.svelte";
    import Text from "$lib/components/settings/Text.svelte";
    import Number from "$lib/components/settings/Number.svelte";
    import {t} from "$lib/i18n";

    let fontFamily = $state("JetBrainsMono Nerd Font");
    let fontSize = $state(13);
    let bold = $state(false);
    let italic = $state(false);

    /* eslint-disable svelte/prefer-style-directive */
    // TODO: fix above with preview component
</script>


<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
<Group title="" note={t("page.fontPlayground.note")}>
    <div class="preview" style="font-family: {fontFamily}; font-size: {fontSize + "px"}; font-style: {italic ? "italic" : "normal"}; font-weight: {bold ? 700 : 400};">
    <div class="row prompt">
        <span style="color: var(--config-palette-2);">john</span>
        <span style="color: var(--config-palette-6);">@</span>
        <span style="color: var(--config-palette-4);">doe-pc</span>
        <span style="color: var(--config-palette-1); font-weight: 700;">$</span>
        ls -la
    </div>
    <div class="row">-rwxr-xr-x 1 root <span style="color: var(--config-palette-3); font-weight: 700;">Documents</span></div>
    <div class="row">-rwxr-xr-x 1 root <span style="color: var(--config-palette-0); background: var(--config-palette-2); font-weight: 700;">Downloads</span></div>
    <div class="row">-rwxr-xr-x 1 root <span style="color: var(--config-palette-0); background: var(--config-palette-8); font-weight: 700;">Pictures</span></div>
    <div class="row">-rwxr-xr-x 1 root <span style="color: var(--config-palette-12); font-weight: 700;">Music</span></div>
    <div class="row">-rwxr-xr-x 1 root <span style="color: var(--config-palette-2);">実行可能ファイル</span></div>
    <div class="row">-rwxr-xr-x 1 root <span style="color: var(--config-palette-6);">sym</span> -> <span style="color: var(--config-palette-1);">link</span></div>
    <div class="row">&nbsp;</div>
    <div class="row">Icons:     <span style="background-color: var(--config-palette-1); color: var(--config-bg);"> Powerline</span><span style="color: var(--config-palette-1);"></span></div>
    </div>
    <Separator />
    <Item name={t("page.fontPlayground.fontFamily")} note={t("page.fontPlayground.fontFamily.note")}><Text bind:value={fontFamily} /></Item>
    <Separator />
    <Item name={t("page.fontPlayground.fontSize")}><Number bind:value={fontSize} range={true} min={4} max={60} step={0.5} /></Item>
    <Separator />
    <Item name={t("page.fontPlayground.bold")}><Switch bind:checked={bold} /></Item>
    <Separator />
    <Item name={t("page.fontPlayground.italic")}><Switch bind:checked={italic} /></Item>
    <!-- Add ligature options -->
</Group>

<style>
.preview {
    background: var(--config-bg);
    color: var(--config-fg);
    height: 180px;
    overflow-y: auto;
    padding: 8px;
    border-radius: var(--radius-level-3);
    border: 1px solid rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 1px rgba(255, 255, 255, 0.5) inset;
}

.preview .row,
.prompt {
    display: flex;
    white-space: pre;
    /* width: 100%; */
    /* overflow: hidden; */
}
</style>