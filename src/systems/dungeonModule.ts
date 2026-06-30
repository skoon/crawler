import JSZip from 'jszip'
import type { LevelData, ModuleManifest, DungeonModule } from '../types'

// Bump when the on-disk module layout changes in a backward-incompatible way.
export const MODULE_SCHEMA_VERSION = 1

export interface ModuleMeta {
  name: string
  version: string
  author?: string
  description?: string
  entryLevelId: string
}

// Only URLs we can actually fetch bytes from get bundled. Plain references
// (e.g. a bare filename a level expects to resolve elsewhere) are left untouched.
function isBundleableTexture(value?: string): value is string {
  return !!value && (value.startsWith('blob:') || value.startsWith('data:') || value.startsWith('http'))
}

function basename(url: string): string {
  const clean = url.split(/[?#]/)[0]
  const parts = clean.split('/')
  return parts[parts.length - 1] || 'texture'
}

async function fetchBytes(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return new Uint8Array(await res.arrayBuffer())
  } catch {
    return null
  }
}

/**
 * Bundle one or more levels (and any custom textures they reference) into a
 * self-contained .zip module. Returns the zip as a Blob ready to download.
 */
export async function exportModule(levels: LevelData[], meta: ModuleMeta): Promise<Blob> {
  const zip = new JSZip()
  const levelsDir = zip.folder('levels')!
  const texDir = zip.folder('textures')!

  const urlToPath = new Map<string, string>() // original URL -> "textures/<file>"
  const usedNames = new Set<string>()
  const texturePaths: string[] = []

  // Bundle a texture URL once; return the relative path levels should reference.
  async function ensureTexture(url?: string): Promise<string | undefined> {
    if (!isBundleableTexture(url)) return url
    const existing = urlToPath.get(url)
    if (existing) return existing

    const bytes = await fetchBytes(url)
    if (!bytes) return url // couldn't fetch — keep the original reference

    let name = basename(url)
    if (!name.includes('.')) name += '.png'
    let unique = name
    let i = 1
    while (usedNames.has(unique)) {
      const dot = name.lastIndexOf('.')
      unique = `${name.slice(0, dot)}_${i}${name.slice(dot)}`
      i++
    }
    usedNames.add(unique)
    texDir.file(unique, bytes)

    const rel = `textures/${unique}`
    urlToPath.set(url, rel)
    texturePaths.push(rel)
    return rel
  }

  const levelPaths: string[] = []
  for (const lvl of levels) {
    const copy: LevelData = { ...lvl }
    copy.floorTexture = await ensureTexture(lvl.floorTexture)
    copy.wallTexture = await ensureTexture(lvl.wallTexture)
    levelsDir.file(`${lvl.id}.json`, JSON.stringify(copy, null, 2))
    levelPaths.push(`levels/${lvl.id}.json`)
  }

  const manifest: ModuleManifest = {
    schemaVersion: MODULE_SCHEMA_VERSION,
    name: meta.name,
    version: meta.version,
    author: meta.author,
    description: meta.description,
    entryLevelId: meta.entryLevelId,
    levels: levelPaths,
    textures: texturePaths.length ? texturePaths : undefined,
  }
  zip.file('module.json', JSON.stringify(manifest, null, 2))

  return zip.generateAsync({ type: 'blob' })
}

/**
 * Read a .zip module, returning its manifest and fully-resolved levels.
 * Bundled textures are materialized as object URLs and patched back into the
 * levels that reference them, so the result is ready to register and play.
 */
export async function importModule(file: Blob): Promise<DungeonModule> {
  const zip = await JSZip.loadAsync(file)

  const manifestFile = zip.file('module.json')
  if (!manifestFile) throw new Error('Not a dungeon module: module.json is missing.')
  const manifest = JSON.parse(await manifestFile.async('string')) as ModuleManifest

  if (typeof manifest.schemaVersion !== 'number' || !Array.isArray(manifest.levels)) {
    throw new Error('module.json is malformed.')
  }
  if (manifest.schemaVersion > MODULE_SCHEMA_VERSION) {
    throw new Error(
      `Module schema v${manifest.schemaVersion} is newer than supported (v${MODULE_SCHEMA_VERSION}). Update the game.`,
    )
  }

  // Materialize bundled textures as object URLs keyed by their in-zip path.
  const textureUrls = new Map<string, string>()
  for (const path of manifest.textures ?? []) {
    const f = zip.file(path)
    if (!f) continue
    textureUrls.set(path, URL.createObjectURL(await f.async('blob')))
  }

  const levels: LevelData[] = []
  for (const path of manifest.levels) {
    const f = zip.file(path)
    if (!f) throw new Error(`Module references a missing level file: ${path}`)
    const lvl = JSON.parse(await f.async('string')) as LevelData
    if (lvl.floorTexture && textureUrls.has(lvl.floorTexture)) {
      lvl.floorTexture = textureUrls.get(lvl.floorTexture)
    }
    if (lvl.wallTexture && textureUrls.has(lvl.wallTexture)) {
      lvl.wallTexture = textureUrls.get(lvl.wallTexture)
    }
    levels.push(lvl)
  }

  return { manifest, levels }
}

/** Trigger a browser download of a generated module blob. */
export function downloadModule(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a) // required for Firefox
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
