export const loadSiteConfig = async (siteName = 'argos') => {
  try {
    // 动态导入对应站点的配置
    const config = await import(`@/configs/sites/${siteName}.js`)
    return config.default
  } catch (err) {
    console.warn(`[loadSiteConfig] 加载站点配置失败: ${siteName}，尝试加载默认配置...`, err)

    // fallback 到默认配置 argos
    const fallback = await import('@/configs/sites/argos.js')
    return fallback.default
  }
}
