<script lang="ts">
    import Page from "$lib/views/Page.svelte";

    import {page} from "$app/stores";
    import Switch from "$lib/components/settings/Switch.svelte";
    import Item from "$lib/components/settings/Item.svelte";
    import Group from "$lib/components/settings/Group.svelte";
    import Separator from "$lib/components/settings/Separator.svelte";

    import settings, {getPanelNameKey, getGroupNameKeys, getSettingNameKeys} from "$lib/data/settings";
    import config from "$lib/stores/config.svelte";
    import Text from "$lib/components/settings/Text.svelte";
    import Number from "$lib/components/settings/Number.svelte";
    import Dropdown from "$lib/components/settings/Dropdown.svelte";
    import Color from "$lib/components/settings/Color.svelte";
    import Palette from "$lib/components/settings/Palette.svelte";
    import BaseColorPreview from "$lib/views/BaseColorPreview.svelte";
    import CursorPreview from "$lib/views/CursorPreview.svelte";
    import PalettePreview from "$lib/views/PalettePreview.svelte";
    import Admonition from "$lib/components/Admonition.svelte";
    import Theme from "$lib/components/settings/Theme.svelte";
    import AppIconPreview from "$lib/views/AppIconPreview.svelte";
    import type {HexColor} from "$lib/utils/colors";
    import {resolve} from "$app/paths";
    import {t} from "$lib/i18n";


    const category = $derived(settings.find(c => c.id === $page.params.category));
    const title = $derived(
        category ? (getPanelNameKey(category.id) ? t(getPanelNameKey(category.id)!) : category.name) : $page.params.category
    );

    function getGroupName(panelId: string, groupId: string, fallback: string): string {
        const keys = getGroupNameKeys(panelId, groupId);
        return keys?.nameKey ? t(keys.nameKey) : fallback;
    }

    function getGroupNote(panelId: string, groupId: string, fallback: string | undefined): string | undefined {
        const keys = getGroupNameKeys(panelId, groupId);
        return keys?.noteKey ? t(keys.noteKey) : fallback;
    }

    function getSettingName(panelId: string, groupId: string, settingId: string, fallback: string): string {
        const keys = getSettingNameKeys(panelId, groupId, settingId);
        return keys?.nameKey ? t(keys.nameKey) : fallback;
    }

    function getSettingNote(panelId: string, groupId: string, settingId: string, fallback: string | undefined): string | undefined {
        const keys = getSettingNameKeys(panelId, groupId, settingId);
        return keys?.noteKey ? t(keys.noteKey) : fallback;
    }
</script>


<Page {title}>
    {#if category}
        {#if category.id === "fonts"}
            <Admonition size="1.5rem">{@html t("page.settings.fontPlaygroundMoved").replace("<a>", `<a href="${resolve("/app/font-playground")}">`)}</Admonition>
        {:else if category.id === "colors"}
            <Admonition size="1.5rem">{t("page.settings.resetColorTip")}</Admonition>
        {/if}
        {#each category.groups as group (group.id)}
            <Group title={getGroupName(category.id, group.id, group.name)} note={getGroupNote(category.id, group.id, group.note)}>
                {#if category.id === "colors" && group.id === "base"}
                    <BaseColorPreview />
                    <Separator />
                {:else if category.id === "colors" && group.id === "cursor"}
                    <CursorPreview />
                    <Separator />
                {:else if category.id === "colors" && group.id === "palette"}
                    <PalettePreview />
                    <Separator />
                {:else if category.id === "macos" && group.id === "icon"}
                    <AppIconPreview />
                    <Separator />
                {/if}
                {#each group.settings as setting, i (setting.id)}
                    {#if i !== 0}<Separator />{/if}
                    <Item name={getSettingName(category.id, group.id, setting.id, setting.name)} note={getSettingNote(category.id, group.id, setting.id, setting.note)}>
                        {#if setting.type === "switch"}
                            <Switch bind:checked={config[setting.id as keyof typeof config] as boolean} />
                        {:else if setting.type === "text"}
                            <Text bind:value={config[setting.id as keyof typeof config] as string} placeholder={setting.placeholder} />
                        {:else if setting.type === "number"}
                            <Number bind:value={config[setting.id as keyof typeof config] as number} range={setting.range} min={setting.min} max={setting.max} step={setting.step} size={setting.size} placeholder={setting.placeholder} />
                        {:else if setting.type === "dropdown"}
                            <Dropdown bind:value={config[setting.id as keyof typeof config] as string} options={setting.options} placeholder={setting.placeholder} />
                        {:else if setting.type === "theme"}
                            <Theme bind:value={config[setting.id as keyof typeof config] as string} options={setting.options} />
                        {:else if setting.type === "color"}
                            <Color defaultValue={setting.value} bind:value={config[setting.id as keyof typeof config] as HexColor} />
                        {:else if setting.type === "palette"}
                            <Palette defaultValue={setting.value} bind:value={config[setting.id as keyof typeof config] as HexColor[]} />
                        {/if}
                    </Item>
                {/each}
            </Group>
        {/each}
    {:else}
        <h1>{t("page.settings.notFound.title")}</h1>
        <p>{t("page.settings.notFound.message")}</p>
    {/if}
</Page>