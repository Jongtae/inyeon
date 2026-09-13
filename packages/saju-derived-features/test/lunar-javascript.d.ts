declare module 'lunar-javascript' {
  interface LunarUtilityTables {
    readonly GAN: readonly string[];
    readonly ZHI: readonly string[];
    readonly WU_XING_GAN: Readonly<Record<string, string>>;
    readonly WU_XING_ZHI: Readonly<Record<string, string>>;
  }

  const lunar: {
    readonly LunarUtil: LunarUtilityTables;
  };

  export default lunar;
}
