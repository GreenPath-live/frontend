<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'feature';
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
  min-height: 56px;
  min-width: 128px;
  padding: 0 28px;
  border-radius: 28px;
  border: 1.5px solid var(--btn-border);
  background: var(--btn-bg);
  color: var(--btn-fg);
  box-shadow: var(--btn-shadow);
  font-family: var(--font-body);
  font-size: var(--brand-fs-control);
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
  min-height: 64px;
  min-width: 148px;
  padding: 0 34px;
  font-size: 1.1875rem;
}

.btn--icon {
  min-width: 56px;
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

.btn--feature {
  --btn-bg: var(--brand-lime);
  --btn-fg: #142016;
  --btn-border: transparent;
  --btn-hover-bg: var(--brand-lime-hover);
  min-height: 76px;
  min-width: min(100%, 360px);
  justify-content: space-between;
  gap: 22px;
  padding: 10px 14px 10px 28px;
  border-radius: 30px;
  font-size: 1.1875rem;
}

.btn--feature .btn__inner {
  width: 100%;
  justify-content: space-between;
  gap: 24px;
}

.btn--feature .btn__inner::after {
  content: "->";
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  color: #142016;
  font-size: 1.65rem;
  line-height: 1;
}

.btn.is-disabled,
.btn:disabled {
  opacity: 0.48;
  cursor: not-allowed;
  pointer-events: none;
}

@media (max-width: 640px) {
  .btn {
    min-height: 58px;
    width: 100%;
    white-space: normal;
    text-align: center;
    line-height: 1.25;
  }

  .btn--feature {
    min-height: 72px;
    padding-left: 22px;
  }
}
</style>
