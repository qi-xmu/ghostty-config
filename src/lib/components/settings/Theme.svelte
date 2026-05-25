<script lang="ts">
    import {setColorScheme} from "$lib/stores/config.svelte";
    import {success, error} from "$lib/stores/toasts.svelte";
    import Dropdown from "./Dropdown.svelte";
    import {t} from "$lib/i18n";

    type Props = {
        value: string;
        options: Array<string | {name: string, value: string}>
    };

    // eslint-disable-next-line prefer-const
    let {value = $bindable(), options}: Props = $props();

    async function change() {
        try {
            const result = await setColorScheme(value);

            if (result) success(t("toast.colorSchemeApplied"));
            else error(t("toast.colorSchemeFailed"));
        }
        catch {
            error(t("toast.colorSchemeFailed"));
        }
    }
</script>

<Dropdown bind:value {options} {change} />