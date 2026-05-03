<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'md' | 'lg';
    href?: string;
    type?: 'button' | 'submit';
    iconOnly?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
  }
);
</script>

<template>
  <component
    :is="href && !disabled ? 'a' : 'button'"
    :href="href && !disabled ? href : undefined"
    :type="href && !disabled ? undefined : type"
    :disabled="href ? undefined : disabled"
    :aria-disabled="href && disabled ? 'true' : undefined"
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'btn--icon': iconOnly, 'is-disabled': disabled }]"
  >
    <span class="btn__inner">
      <slot />
    </span>
  </component>
</template>

<style scoped>
.btn {
  --btn-bg: var(--brand-lime);
  --btn-fg: #142016;
  --btn-border: transparent;
  --btn-hover-bg: var(--brand-lime-hover);
  --btn-hover-border: transparent;
  --btn-shadow: none;
  --btn-scale: 1;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  min-width: 112px;
  padding: 0 26px;
  border-radius: 28px;
  border: 1.5px solid var(--btn-border);
  background: var(--btn-bg);
  color: var(--btn-fg);
  box-shadow: var(--btn-shadow);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0;
  white-space: nowrap;
  transform: scale(var(--btn-scale));
  transition:
    background-color var(--d-fast) ease,
    border-color var(--d-fast) ease,
    transform var(--d-fast) var(--ease-out-expo);
}

.btn__inner {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn:hover {
  --btn-bg: var(--btn-hover-bg);
  --btn-border: var(--btn-hover-border);
}

.btn:active {
  --btn-scale: 0.98;
}

.btn--lg {
  min-height: 60px;
  min-width: 132px;
  padding: 0 32px;
  font-size: 1.05rem;
}

.btn--icon {
  min-width: 52px;
  padding: 0;
  aspect-ratio: 1;
}

.btn--primary {
  --btn-bg: var(--brand-lime);
  --btn-fg: #142016;
  --btn-hover-bg: var(--brand-lime-hover);
}

.btn--secondary {
  --btn-bg: rgba(255, 255, 255, 0.72);
  --btn-fg: var(--brand-ink-soft);
  --btn-border: var(--brand-line);
  --btn-hover-bg: rgba(255, 255, 255, 0.9);
  --btn-hover-border: rgba(35, 45, 39, 0.2);
}

.btn--ghost {
  --btn-bg: transparent;
  --btn-fg: var(--brand-ink-soft);
  --btn-border: transparent;
  --btn-hover-bg: rgba(155, 224, 111, 0.18);
  min-width: auto;
  padding-inline: 12px;
}

.btn.is-disabled,
.btn:disabled {
  opacity: 0.48;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
