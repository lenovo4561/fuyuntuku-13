const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

// 需要压缩的背景图文件
const bgPath = path.join(__dirname, '../src/assets/img/shangdianbg.png')

async function compressBg() {
  if (!fs.existsSync(bgPath)) {
    console.log(`文件不存在: ${bgPath}`)
    return
  }

  try {
    const backupPath = bgPath.replace('.png', '_backup.png')

    // 获取原始文件大小
    const originalStats = fs.statSync(bgPath)
    console.log(`\n处理: ${bgPath}`)
    console.log(`原始文件大小: ${(originalStats.size / 1024).toFixed(2)} KB`)

    // 备份原始文件（如果备份不存在）
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(bgPath, backupPath)
      console.log('已备份原始文件')
    }

    // 读取原始备份文件
    const image = sharp(backupPath)
    const metadata = await image.metadata()

    console.log(`原图片尺寸: ${metadata.width}x${metadata.height}`)

    // 压缩背景图：缩小尺寸并降低质量
    // 将宽度缩小到原来的一半
    const targetWidth = Math.floor(metadata.width / 2)

    await sharp(backupPath)
      .resize(targetWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({
        compressionLevel: 9,
        quality: 60,
        palette: true,
        colors: 64 // 减少颜色数量以降低文件大小
      })
      .toFile(bgPath + '.tmp')

    // 删除原文件
    if (fs.existsSync(bgPath)) {
      fs.unlinkSync(bgPath)
    }

    // 重命名
    const outputPath = bgPath
    fs.renameSync(bgPath + '.tmp', outputPath)

    // 获取压缩后文件大小
    const compressedStats = fs.statSync(outputPath)
    console.log(
      `压缩后文件大小: ${(compressedStats.size / 1024).toFixed(2)} KB`
    )
    console.log(
      `压缩率: ${(
        (1 - compressedStats.size / originalStats.size) *
        100
      ).toFixed(2)}%`
    )
  } catch (error) {
    console.error(`压缩背景图失败:`, error.message)
  }

  console.log('\n背景图压缩完成!')
}

compressBg()
