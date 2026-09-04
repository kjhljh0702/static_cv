<script>
  import { Canvas } from '@threlte/core';
  import { onMount } from 'svelte';
  import Scene from './Scene.svelte';
  let { controller, onReady, onError } = $props();
  let active = $state(true);
  onMount(() => {
    const handler = () => { active = controller.active; };
    controller.onChange = handler;
    handler();
    return () => { controller.onChange = null; };
  });
</script>
<svelte:boundary onerror={() => onError?.()}>
<Canvas dpr={Math.min(globalThis.devicePixelRatio || 1, 1.7)} renderMode="on-demand">
  <Scene {controller} {active} {onReady} />
</Canvas>
</svelte:boundary>
