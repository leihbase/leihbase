export function useIsSticky(element: Ref<HTMLElement>) {
  const isSticky = ref(false);
  onMounted(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        isSticky.value = !!e && e.intersectionRatio < 1;
      },
      { threshold: [1] }
    );
    observer.observe(element.value);
  });
  return {
    isSticky,
  };
}
