<script lang="ts">
    import Page from "$lib/views/Page.svelte";
    import logo from "$lib/images/icon.webp";
    import Admonition from "$lib/components/Admonition.svelte";
    import Group from "$lib/components/settings/Group.svelte";
    import {resolve} from "$app/paths";
    import Checkbox from "$lib/components/settings/Checkbox.svelte";
    import {t} from "$lib/i18n";
</script>

<Page title={t("page.home.title")}>
    <section>
        <div class="user">
            <div class="user-avatar">
                <img src={logo} alt="Ghostty Config Logo" />
            </div>
            <div class="user-label">
                <div class="user-name">{t("page.home.title")}</div>
                <div class="user-subtext">{@html t("page.home.byAuthor").replace("<a>", '<a href="https://zerebos.com" target="_blank" rel="noopener noreferrer">')}</div>
            </div>
        </div>
        <Admonition>
            {@html t("page.home.bugNotice")
                .replace("<em>will</em>", '<em>will</em>')
                .replace("<a>", '<a href="https://github.com/zerebos/ghostty-config/issues" target="_blank" rel="noopener noreferrer">')}
        </Admonition>
        <Group title={t("page.home.recentChanges")}>
            <ul>
                <li><Checkbox checked />New keybind builder with sequence support</li>
                <li><Checkbox checked />Updated settings to match Ghostty 1.2 (and 1.3-nightly)</li>
                <li><Checkbox checked /><span>Designed a brand new logo by hand using <a href="https://www.photopea.com/" target="_blank" rel="noopener noreferrer">Photopea</a></span></li>
                <li><Checkbox checked /><span>Added new custom app icon preview on the <a href={resolve("/settings/macos")}>macOS page</a></span></li>
                <li><Checkbox checked />New script for easier updates to future Ghostty versions</li>
                <li><Checkbox checked />Fixed old settings that had outdated options</li>
                <li><Checkbox checked /><span>Fix extra line breaks exporting to clipboard by <a href="https://github.com/reussio" target="_blank" rel="noopener noreferrer">@reussio</a></span></li>
                <li><Checkbox checked /><span>Better theme sorting by <a href="https://github.com/adamalston" target="_blank" rel="noopener noreferrer">@adamalston</a></span></li>
            </ul>
        </Group>
        <Group title={t("page.home.roadmap")}>
            <ul>
                <li><Checkbox />Command palette builder</li>
                <li><Checkbox />Help documentation</li>
                <li><Checkbox />Unit testing import/export</li>
                <li><Checkbox />Unify color scheme</li>
                <li><Checkbox />Refactor & cleanup code</li>
                <li><Checkbox />Custom setting types to more closely match Ghostty's config</li>
                <li><Checkbox />Add a way to reset individual settings</li>
                <li><Checkbox />Change color picker from modal to popout</li>
                <li><Checkbox />A ghostty-web terminal preview and playground</li>
            </ul>
        </Group>
    </section>
</Page>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 0.6;
    }

    .user {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin: 20px 0;
    }

    .user-avatar img {
        height: 100%;
        width: 100%;
    }

    .user-avatar {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(#03028f, #09043a);
        height: 100px;
        width: 100px;
        border-radius: 50%;
        /* border: 2px solid black; */
        /* box-shadow: 0 0 0 2px white; */
    }

    .user-label {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
    }

    .user-name {
        position: relative;
        display: flex;
        justify-content: center;
        font-size: 1.3rem;
        color: var(--font-color);
        font-weight: 600;
    }

    .user-subtext {
        display: flex;
        justify-content: center;
        font-size: 1.1rem;
        gap: 3px;
    }

    ul {
        /* list-style: "↪ "; */
        /* list-style: "🠶 "; */
        list-style: none;
        padding-left: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: space-evenly;
    }

    ul li {
        margin-bottom: 5px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
</style>
